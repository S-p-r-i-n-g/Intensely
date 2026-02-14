#!/usr/bin/env python3
"""
Project 3D SMPL-H motion data to 2D screen coordinates.

CRITICAL FEATURES:
- Global bounding box across ALL frames (character stays centered)
- Consistent Y baseline (feet don't float)
- Proper camera angle projection
- Canvas fitting with padding

Usage:
    python 03_project_to_2d.py
    python 03_project_to_2d.py --preview  # Show visualization
"""

import argparse
import json
import numpy as np
from pathlib import Path
from collections import Counter


def load_config():
    """Load pipeline configuration."""
    config_path = Path(__file__).parent.parent / "config.json"
    with open(config_path) as f:
        return json.load(f)


def load_manifest():
    """Load manifest with camera angles."""
    manifest_path = Path(__file__).parent.parent / "manifest.json"
    if not manifest_path.exists():
        raise FileNotFoundError(
            f"{manifest_path} not found. Run 02_prepare_batch.py first."
        )

    with open(manifest_path) as f:
        return json.load(f)


def get_rotation_matrix(angle_degrees):
    """
    Get rotation matrix for camera angle (rotation around Y-axis).

    Args:
        angle_degrees: Camera angle in degrees
                      0° = front, 90° = side, 135° = 3/4 back, etc.

    Returns:
        3x3 rotation matrix
    """
    angle_rad = np.radians(angle_degrees)
    cos_a = np.cos(angle_rad)
    sin_a = np.sin(angle_rad)

    # Rotation around Y-axis (vertical)
    R = np.array([
        [cos_a,  0, sin_a],
        [0,      1, 0],
        [-sin_a, 0, cos_a]
    ])

    return R


def orthographic_projection(points_3d, camera_angle):
    """
    Apply orthographic projection with camera rotation.

    Args:
        points_3d: (N, 3) array of 3D points (X, Y, Z)
        camera_angle: Camera angle in degrees

    Returns:
        (N, 2) array of 2D points (X, Y) in world coordinates
    """
    # Apply camera rotation
    R = get_rotation_matrix(camera_angle)
    points_rotated = points_3d @ R.T  # (N, 3)

    # Orthographic projection: drop Z coordinate
    points_2d = points_rotated[:, :2]  # (N, 2) - take X, Y

    return points_2d


def calculate_global_bounding_box(frames_3d, camera_angle):
    """
    Calculate bounding box across ALL frames (CRITICAL for stability).

    Args:
        frames_3d: (T, J, 3) - T frames, J joints, XYZ coordinates
        camera_angle: Camera angle in degrees

    Returns:
        Dictionary with min/max for X and Y, and Y baseline
    """
    all_points = []

    # Project all frames
    for frame in frames_3d:
        points_2d = orthographic_projection(frame, camera_angle)
        all_points.append(points_2d)

    # Stack all points across all frames
    all_points = np.concatenate(all_points, axis=0)  # (T*J, 2)

    # Calculate global bounds
    min_x, min_y = all_points.min(axis=0)
    max_x, max_y = all_points.max(axis=0)

    # Y baseline: lowest point (feet) across all frames
    y_baseline = min_y

    bbox = {
        'min_x': min_x,
        'max_x': max_x,
        'min_y': min_y,
        'max_y': max_y,
        'width': max_x - min_x,
        'height': max_y - min_y,
        'y_baseline': y_baseline
    }

    return bbox


def normalize_to_canvas(points_2d, bbox, canvas_size, padding_percent=0.15):
    """
    Normalize 2D points to fit canvas with padding and Y-axis flip.

    Args:
        points_2d: (N, 2) array of 2D points
        bbox: Bounding box dictionary
        canvas_size: Canvas width/height in pixels
        padding_percent: Padding as fraction of canvas (default 15%)

    Returns:
        (N, 2) array of screen coordinates (0, 0) = top-left
    """
    # Calculate usable canvas area after padding
    padding = int(canvas_size * padding_percent)
    usable_size = canvas_size - 2 * padding

    # Calculate scale to fit in usable area
    # Use max of width/height to maintain aspect ratio
    content_width = bbox['width']
    content_height = bbox['height']

    if content_width == 0 or content_height == 0:
        print("  ⚠ Warning: Zero-size bounding box, using default scale")
        scale = 1.0
    else:
        scale = usable_size / max(content_width, content_height)

    # Center of content in world coordinates
    center_x = (bbox['min_x'] + bbox['max_x']) / 2
    center_y = (bbox['min_y'] + bbox['max_y']) / 2

    # Translate to origin, scale, then translate to canvas center
    normalized = points_2d.copy()

    # 1. Translate to origin (center content)
    normalized[:, 0] -= center_x
    normalized[:, 1] -= center_y

    # 2. Scale to fit canvas
    normalized *= scale

    # 3. Flip Y axis (screen Y goes down, 3D Y goes up)
    normalized[:, 1] = -normalized[:, 1]

    # 4. Translate to canvas center
    canvas_center = canvas_size / 2
    normalized[:, 0] += canvas_center
    normalized[:, 1] += canvas_center

    return normalized


def project_motion_sequence(motion_3d, camera_angle, canvas_size):
    """
    Project entire motion sequence with global normalization.

    Args:
        motion_3d: (T, J, 3) - T frames, J joints, XYZ
        camera_angle: Camera angle in degrees
        canvas_size: Canvas size in pixels

    Returns:
        (T, J, 2) - Projected and normalized 2D coordinates
    """
    num_frames = motion_3d.shape[0]
    num_joints = motion_3d.shape[1]

    # CRITICAL: Calculate global bounding box across ALL frames
    bbox = calculate_global_bounding_box(motion_3d, camera_angle)

    # Project and normalize each frame using global bbox
    projected_frames = []

    for frame_3d in motion_3d:
        # Project to 2D
        points_2d = orthographic_projection(frame_3d, camera_angle)

        # Normalize using GLOBAL bounding box
        points_screen = normalize_to_canvas(points_2d, bbox, canvas_size)

        projected_frames.append(points_screen)

    projected_motion = np.stack(projected_frames, axis=0)  # (T, J, 2)

    return projected_motion, bbox


def visualize_projection(slug, motion_2d, bbox, canvas_size, sample_frames=5):
    """
    Print ASCII visualization of projection (optional preview).

    Args:
        slug: Exercise slug
        motion_2d: (T, J, 2) projected coordinates
        bbox: Bounding box info
        canvas_size: Canvas size
        sample_frames: Number of frames to show
    """
    num_frames = motion_2d.shape[0]
    frame_indices = np.linspace(0, num_frames - 1, sample_frames, dtype=int)

    print(f"\n  Preview of {slug} (showing {sample_frames} frames):")
    print(f"  Global bbox: {bbox['width']:.2f}x{bbox['height']:.2f} units")
    print(f"  Y baseline: {bbox['y_baseline']:.2f}")
    print()

    for frame_idx in frame_indices:
        frame_2d = motion_2d[frame_idx]

        # Create simple ASCII visualization
        grid_size = 40
        grid = [[' ' for _ in range(grid_size)] for _ in range(grid_size)]

        # Map points to grid
        for point in frame_2d:
            x = int(point[0] / canvas_size * grid_size)
            y = int(point[1] / canvas_size * grid_size)

            # Clamp to grid bounds
            x = max(0, min(grid_size - 1, x))
            y = max(0, min(grid_size - 1, y))

            grid[y][x] = '●'

        # Print grid
        print(f"  Frame {frame_idx + 1}/{num_frames}:")
        print("  +" + "-" * grid_size + "+")
        for row in grid:
            print("  |" + "".join(row) + "|")
        print("  +" + "-" * grid_size + "+")
        print()


def main():
    """Main projection pipeline."""
    parser = argparse.ArgumentParser(description='Project 3D motion to 2D')
    parser.add_argument('--preview', action='store_true', help='Show ASCII visualization preview')
    parser.add_argument('--limit', type=int, help='Limit number of files to process (for testing)')
    args = parser.parse_args()

    print("=" * 60)
    print("Exercise Animation Pipeline - 3D to 2D Projection")
    print("=" * 60)

    # Load configuration
    config = load_config()
    canvas_size = config['canvas']['width']
    print(f"✓ Loaded config (canvas: {canvas_size}x{canvas_size}px)")

    # Load manifest for camera angles
    manifest = load_manifest()
    exercises = manifest['exercises']
    print(f"✓ Loaded manifest ({len(exercises)} exercises)")

    # Setup directories
    motion_data_dir = Path(__file__).parent.parent / "motion_data"
    output_dir = Path(__file__).parent.parent / "projected"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Find motion data files
    motion_files = sorted(motion_data_dir.glob("*.npy"))

    if not motion_files:
        print(f"\n❌ No .npy files found in {motion_data_dir}")
        print("   Run motion generation on RunPod first.")
        return

    print(f"✓ Found {len(motion_files)} motion files")

    if args.limit:
        motion_files = motion_files[:args.limit]
        print(f"  (Limited to {args.limit} files for testing)")

    # Process each motion file
    print("\n" + "=" * 60)
    print("Processing Motion Data")
    print("=" * 60 + "\n")

    processed_count = 0
    skipped_count = 0
    error_count = 0
    camera_angles_used = []

    for idx, motion_file in enumerate(motion_files, 1):
        slug = motion_file.stem
        output_file = output_dir / f"{slug}.npy"

        # Skip if already processed
        if output_file.exists():
            print(f"[{idx}/{len(motion_files)}] {slug} - SKIP (already exists)")
            skipped_count += 1
            continue

        print(f"[{idx}/{len(motion_files)}] {slug}")

        try:
            # Load motion data
            motion_3d = np.load(motion_file)  # Expected: (T, J, 3)

            # Validate shape
            if motion_3d.ndim != 3 or motion_3d.shape[2] != 3:
                raise ValueError(f"Invalid shape {motion_3d.shape}, expected (T, J, 3)")

            num_frames, num_joints = motion_3d.shape[0], motion_3d.shape[1]
            print(f"  Motion: {num_frames} frames, {num_joints} joints")

            # Get camera angle from manifest
            if slug not in exercises:
                print(f"  ⚠ Warning: {slug} not in manifest, using default angle")
                camera_angle = config['camera_angles']['default']
            else:
                camera_angle = exercises[slug]['camera_angle']

            camera_angles_used.append(camera_angle)
            angle_name = {0: 'front', 45: '3/4 front', 90: 'side', 135: '3/4 back'}.get(
                camera_angle, f'{camera_angle}°'
            )
            print(f"  Camera: {angle_name} ({camera_angle}°)")

            # Project to 2D with global bounding box
            motion_2d, bbox = project_motion_sequence(motion_3d, camera_angle, canvas_size)

            print(f"  Projected: {bbox['width']:.1f}x{bbox['height']:.1f} units")
            print(f"  Normalized to {canvas_size}x{canvas_size}px with 15% padding")

            # Save projected data
            np.save(output_file, motion_2d)
            print(f"  ✓ Saved {output_file.name}")

            # Optional preview
            if args.preview:
                visualize_projection(slug, motion_2d, bbox, canvas_size)

            processed_count += 1

        except Exception as e:
            print(f"  ✗ Error: {e}")
            error_count += 1
            import traceback
            traceback.print_exc()
            continue

    # Summary statistics
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    print(f"\nTotal files: {len(motion_files)}")
    print(f"Processed: {processed_count}")
    print(f"Skipped (already exist): {skipped_count}")
    print(f"Errors: {error_count}")

    if camera_angles_used:
        angle_counts = Counter(camera_angles_used)
        print(f"\nCamera angles used:")
        angle_names = {0: 'front', 45: '3/4 front', 90: 'side', 135: '3/4 back'}
        for angle, count in sorted(angle_counts.items()):
            angle_name = angle_names.get(angle, f'{angle}°')
            percentage = (count / len(camera_angles_used)) * 100
            print(f"  {angle_name:12s} ({angle:3d}°): {count:3d} ({percentage:5.1f}%)")

    print(f"\n📁 Output directory: {output_dir}")
    print(f"✓ Ready for rendering!")
    print("=" * 60)


if __name__ == "__main__":
    main()
