#!/usr/bin/env python3
"""
Render 2D motion data as animated WebP stick figures.

Draws bones and joints according to CLAUDE.md specifications:
- Canvas: 400×400px, transparent background
- Bones: dark gray (#374151), 4px width
- Joints: blue accent (#3B82F6), 6px radius
- Head: 14px radius
- FPS: 15 (subsampled from 30fps source)

Usage:
    python 04_render_webp.py
    python 04_render_webp.py --preview 5  # Show first 5 frames
"""

import argparse
import json
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw


def load_config():
    """Load pipeline configuration."""
    config_path = Path(__file__).parent.parent / "config.json"
    with open(config_path) as f:
        return json.load(f)


def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def subsample_frames(motion_2d, source_fps, target_fps):
    """
    Subsample frames to target FPS.

    Args:
        motion_2d: (T, J, 2) array of motion data
        source_fps: Original FPS (typically 30)
        target_fps: Target FPS (typically 15)

    Returns:
        Subsampled array
    """
    if source_fps == target_fps:
        return motion_2d

    # Calculate stride
    stride = source_fps // target_fps

    # Subsample
    subsampled = motion_2d[::stride]

    return subsampled


def draw_stick_figure(draw, joints_2d, config):
    """
    Draw stick figure on PIL ImageDraw object.

    Args:
        draw: PIL ImageDraw object
        joints_2d: (22, 2) array of joint positions
        config: Configuration dictionary
    """
    # Get drawing parameters
    bone_color = hex_to_rgb(config['rendering']['bone_color'])
    bone_width = config['rendering']['bone_width']
    joint_color = hex_to_rgb(config['rendering']['joint_color'])
    joint_radius = config['rendering']['joint_radius']
    head_radius = config['rendering']['head_radius']

    # Get skeleton structure
    skeleton = config['smpl_h_skeleton']['bones']

    # Draw bones (behind joints)
    for bone_group in skeleton.values():
        for joint_a, joint_b in bone_group:
            if joint_a >= len(joints_2d) or joint_b >= len(joints_2d):
                continue

            pos_a = tuple(joints_2d[joint_a])
            pos_b = tuple(joints_2d[joint_b])

            # Draw line (bone)
            draw.line([pos_a, pos_b], fill=bone_color, width=bone_width)

    # Draw joints (on top of bones)
    for joint_idx, pos in enumerate(joints_2d):
        x, y = pos

        # Head gets larger radius
        if joint_idx == 15:  # Head joint
            radius = head_radius
        else:
            radius = joint_radius

        # Draw circle
        bbox = [
            x - radius,
            y - radius,
            x + radius,
            y + radius
        ]
        draw.ellipse(bbox, fill=joint_color)


def render_frame(joints_2d, canvas_size, config):
    """
    Render a single frame as PIL Image.

    Args:
        joints_2d: (22, 2) array of joint positions
        canvas_size: Canvas size in pixels
        config: Configuration dictionary

    Returns:
        PIL Image with RGBA
    """
    # Create image with transparency
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw stick figure
    draw_stick_figure(draw, joints_2d, config)

    return img


def save_as_webp(frames, output_path, fps, loop=0):
    """
    Save frames as animated WebP.

    Args:
        frames: List of PIL Images
        output_path: Output file path
        fps: Frames per second
        loop: Loop count (0 = infinite)
    """
    if not frames:
        raise ValueError("No frames to save")

    # Calculate duration per frame in milliseconds
    duration_ms = int(1000 / fps)

    # Save as animated WebP
    frames[0].save(
        output_path,
        format='WEBP',
        save_all=True,
        append_images=frames[1:],
        duration=duration_ms,
        loop=loop,
        lossless=True,  # Preserve quality for stick figures
        quality=100,    # Maximum quality
        method=6        # Best compression (slower but smaller)
    )


def preview_frames(frames, num_frames=5):
    """
    Display ASCII preview of frames (optional).

    Args:
        frames: List of PIL Images
        num_frames: Number of frames to preview
    """
    import numpy as np

    print(f"\nPreviewing first {num_frames} frames:\n")

    num_to_show = min(num_frames, len(frames))
    frame_indices = np.linspace(0, len(frames) - 1, num_to_show, dtype=int)

    for idx in frame_indices:
        frame = frames[idx]

        # Convert to grayscale for ASCII
        frame_gray = frame.convert('L')
        pixels = np.array(frame_gray)

        # Downsample for ASCII display
        step = 10
        ascii_chars = ' .:-=+*#%@'

        print(f"Frame {idx + 1}/{len(frames)}:")
        print("+" + "-" * (pixels.shape[1] // step) + "+")

        for y in range(0, pixels.shape[0], step):
            row = "|"
            for x in range(0, pixels.shape[1], step):
                pixel_val = pixels[y:y+step, x:x+step].mean()
                char_idx = int(pixel_val / 255 * (len(ascii_chars) - 1))
                row += ascii_chars[char_idx]
            row += "|"
            print(row)

        print("+" + "-" * (pixels.shape[1] // step) + "+")
        print()


def main():
    """Main rendering pipeline."""
    parser = argparse.ArgumentParser(description='Render motion as animated WebP')
    parser.add_argument('--preview', type=int, metavar='N',
                        help='Preview first N frames (ASCII visualization)')
    parser.add_argument('--limit', type=int,
                        help='Limit number of files to process (for testing)')
    args = parser.parse_args()

    print("=" * 60)
    print("Exercise Animation Pipeline - WebP Rendering")
    print("=" * 60)

    # Load configuration
    config = load_config()
    canvas_size = config['canvas']['width']
    target_fps = config['rendering']['fps']
    source_fps = config['rendering']['source_fps']

    print(f"✓ Loaded config")
    print(f"  Canvas: {canvas_size}×{canvas_size}px")
    print(f"  Target FPS: {target_fps}")
    print(f"  Bone: {config['rendering']['bone_color']} ({config['rendering']['bone_width']}px)")
    print(f"  Joint: {config['rendering']['joint_color']} ({config['rendering']['joint_radius']}px)")

    # Setup directories
    projected_dir = Path(__file__).parent.parent / "projected"
    output_dir = Path(__file__).parent.parent / "output" / "webp"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Find projected files
    projected_files = sorted(projected_dir.glob("*.npy"))

    if not projected_files:
        print(f"\n❌ No .npy files found in {projected_dir}")
        print("   Run 03_project_to_2d.py first.")
        return

    print(f"✓ Found {len(projected_files)} projected files")

    if args.limit:
        projected_files = projected_files[:args.limit]
        print(f"  (Limited to {args.limit} files for testing)")

    # Process each file
    print("\n" + "=" * 60)
    print("Rendering Animations")
    print("=" * 60 + "\n")

    processed_count = 0
    skipped_count = 0
    error_count = 0
    total_frames_rendered = 0

    for idx, projected_file in enumerate(projected_files, 1):
        slug = projected_file.stem
        output_file = output_dir / f"{slug}.webp"

        # Skip if already exists
        if output_file.exists():
            print(f"[{idx}/{len(projected_files)}] {slug} - SKIP (already exists)")
            skipped_count += 1
            continue

        print(f"[{idx}/{len(projected_files)}] {slug}")

        try:
            # Load projected motion
            motion_2d = np.load(projected_file)  # (T, J, 2)

            if motion_2d.ndim != 3 or motion_2d.shape[2] != 2:
                raise ValueError(f"Invalid shape {motion_2d.shape}, expected (T, J, 2)")

            num_frames_orig = motion_2d.shape[0]
            num_joints = motion_2d.shape[1]

            print(f"  Original: {num_frames_orig} frames, {num_joints} joints @ {source_fps}fps")

            # Subsample to target FPS
            motion_subsampled = subsample_frames(motion_2d, source_fps, target_fps)
            num_frames_final = motion_subsampled.shape[0]

            print(f"  Subsampled: {num_frames_final} frames @ {target_fps}fps")

            # Render frames
            frames = []
            for frame_joints in motion_subsampled:
                frame_img = render_frame(frame_joints, canvas_size, config)
                frames.append(frame_img)

            print(f"  Rendered: {len(frames)} frames")

            # Save as animated WebP
            save_as_webp(frames, output_file, target_fps, loop=0)

            # Get file size
            file_size_kb = output_file.stat().st_size / 1024

            print(f"  ✓ Saved {output_file.name} ({file_size_kb:.1f} KB)")

            # Preview if requested
            if args.preview and idx == 1:  # Only preview first exercise
                preview_frames(frames, args.preview)

            processed_count += 1
            total_frames_rendered += len(frames)

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

    print(f"\nTotal files: {len(projected_files)}")
    print(f"Processed: {processed_count}")
    print(f"Skipped (already exist): {skipped_count}")
    print(f"Errors: {error_count}")

    if processed_count > 0:
        print(f"\nTotal frames rendered: {total_frames_rendered}")
        print(f"Average frames per exercise: {total_frames_rendered / processed_count:.1f}")

        # Calculate total output size
        total_size = sum(f.stat().st_size for f in output_dir.glob("*.webp"))
        total_size_mb = total_size / (1024 * 1024)
        avg_size_kb = (total_size / 1024) / len(list(output_dir.glob("*.webp")))

        print(f"\nOutput size:")
        print(f"  Total: {total_size_mb:.1f} MB")
        print(f"  Average per file: {avg_size_kb:.1f} KB")

    print(f"\n📁 Output directory: {output_dir}")
    print(f"✓ Ready for mobile app integration!")
    print("=" * 60)


if __name__ == "__main__":
    main()
