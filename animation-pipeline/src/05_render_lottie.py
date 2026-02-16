#!/usr/bin/env python3
"""
Render Lottie Animations (Alternative to WebP)

Creates vector-based Lottie animations with aggressive keyframe optimization.

IMPORTANT: Lottie can suffer performance issues if all 22 joints are updated
every frame. This script aggressively simplifies keyframes by only adding them
when motion direction changes significantly.

Usage:
    python src/05_render_lottie.py

    # Process only first 10 files (testing)
    python src/05_render_lottie.py --limit 10

    # Adjust optimization threshold
    python src/05_render_lottie.py --threshold 15.0  # degrees (default: 10.0)

Output:
    output/lottie/*.json - Optimized Lottie animations
"""

import argparse
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
from tqdm import tqdm


def load_config() -> Dict:
    """Load pipeline configuration."""
    with open("config.json", "r") as f:
        return json.load(f)


def load_manifest() -> Dict:
    """Load exercise manifest."""
    with open("manifest.json", "r") as f:
        return json.load(f)


def calculate_angle(v1: np.ndarray, v2: np.ndarray) -> float:
    """
    Calculate angle in degrees between two vectors.

    Args:
        v1: Vector 1 (2D)
        v2: Vector 2 (2D)

    Returns:
        Angle in degrees (0-180)
    """
    # Normalize vectors
    v1_norm = v1 / (np.linalg.norm(v1) + 1e-8)
    v2_norm = v2 / (np.linalg.norm(v2) + 1e-8)

    # Calculate angle
    cos_angle = np.clip(np.dot(v1_norm, v2_norm), -1.0, 1.0)
    angle = np.arccos(cos_angle)

    return np.degrees(angle)


def detect_keyframes(
    joint_positions: np.ndarray,
    threshold_degrees: float = 10.0,
    min_displacement: float = 5.0,
) -> List[int]:
    """
    Detect significant keyframes for a single joint.

    Only adds keyframes when:
    1. Direction changes by more than threshold_degrees
    2. Joint moves more than min_displacement pixels

    Args:
        joint_positions: (T, 2) - XY positions across time
        threshold_degrees: Angle change threshold in degrees
        min_displacement: Minimum pixel movement to consider

    Returns:
        List of keyframe indices (always includes 0 and T-1)
    """
    T = len(joint_positions)
    keyframes = [0]  # Always include first frame

    if T < 3:
        keyframes.append(T - 1)
        return keyframes

    # Calculate velocities (direction vectors)
    velocities = np.diff(joint_positions, axis=0)  # (T-1, 2)

    # Track last keyframe
    last_keyframe_idx = 0

    for i in range(1, T - 1):
        # Check displacement since last keyframe
        displacement = np.linalg.norm(
            joint_positions[i] - joint_positions[last_keyframe_idx]
        )

        if displacement < min_displacement:
            continue  # Joint hasn't moved enough

        # Check direction change
        if i > 0 and i < len(velocities):
            v_prev = velocities[i - 1]
            v_curr = velocities[i]

            # Skip if either velocity is zero
            if np.linalg.norm(v_prev) < 1e-8 or np.linalg.norm(v_curr) < 1e-8:
                continue

            angle = calculate_angle(v_prev, v_curr)

            if angle > threshold_degrees:
                keyframes.append(i)
                last_keyframe_idx = i

    # Always include last frame
    keyframes.append(T - 1)

    return keyframes


def optimize_keyframes_for_animation(
    projected_data: np.ndarray,
    threshold_degrees: float = 10.0,
    min_displacement: float = 5.0,
) -> Dict[int, List[int]]:
    """
    Detect keyframes for all joints with aggressive optimization.

    Args:
        projected_data: (T, 22, 2) - All joint positions
        threshold_degrees: Direction change threshold
        min_displacement: Minimum movement threshold

    Returns:
        Dictionary mapping joint_idx -> list of keyframe indices
    """
    T, num_joints, _ = projected_data.shape

    keyframe_map = {}

    for joint_idx in range(num_joints):
        joint_positions = projected_data[:, joint_idx, :]  # (T, 2)
        keyframes = detect_keyframes(
            joint_positions,
            threshold_degrees=threshold_degrees,
            min_displacement=min_displacement,
        )
        keyframe_map[joint_idx] = keyframes

    return keyframe_map


def hex_to_rgb_normalized(hex_color: str) -> List[float]:
    """
    Convert hex color to normalized RGB [0, 1].

    Args:
        hex_color: "#RRGGBB"

    Returns:
        [r, g, b] normalized to 0-1
    """
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16) / 255.0
    g = int(hex_color[2:4], 16) / 255.0
    b = int(hex_color[4:6], 16) / 255.0
    return [r, g, b]


def create_lottie_animation(
    projected_data: np.ndarray,
    keyframe_map: Dict[int, List[int]],
    config: Dict,
    fps: int = 15,
) -> Dict:
    """
    Create Lottie JSON with optimized keyframes.

    Args:
        projected_data: (T, 22, 2) - Joint positions
        keyframe_map: Keyframes per joint
        config: Pipeline configuration
        fps: Target frame rate

    Returns:
        Lottie JSON dictionary
    """
    T, num_joints, _ = projected_data.shape
    canvas_size = config.get("canvas", {}).get("width", 400)
    bone_color = hex_to_rgb_normalized(config["rendering"]["bone_color"])
    joint_color = hex_to_rgb_normalized(config["rendering"]["joint_color"])
    bone_width = config["rendering"]["bone_width"]
    joint_radius = config["rendering"]["joint_radius"]
    head_radius = config["rendering"]["head_radius"]

    # Skeleton structure
    skeleton = config.get("smpl_h_skeleton", {}).get("bones", {})

    # Lottie frame rate and duration
    duration_frames = T
    duration_seconds = T / fps

    # Initialize Lottie structure
    lottie = {
        "v": "5.7.4",  # Lottie version
        "fr": fps,  # Frame rate
        "ip": 0,  # In point (start frame)
        "op": duration_frames,  # Out point (end frame)
        "w": canvas_size,  # Width
        "h": canvas_size,  # Height
        "nm": "Exercise Animation",  # Name
        "ddd": 0,  # 2D animation
        "assets": [],  # No external assets
        "layers": [],  # Will populate below
    }

    # Layer for bones (lines)
    bone_layer = {
        "ddd": 0,
        "ind": 1,  # Layer index
        "ty": 4,  # Shape layer
        "nm": "Bones",
        "sr": 1,  # Time stretch
        "ks": {  # Transform (static, no animation)
            "o": {"a": 0, "k": 100},  # Opacity 100%
            "r": {"a": 0, "k": 0},  # Rotation 0
            "p": {"a": 0, "k": [0, 0, 0]},  # Position [x, y, z]
            "a": {"a": 0, "k": [0, 0, 0]},  # Anchor
            "s": {"a": 0, "k": [100, 100, 100]},  # Scale 100%
        },
        "ao": 0,
        "shapes": [],  # Will populate with bone shapes
        "ip": 0,
        "op": duration_frames,
        "st": 0,
        "bm": 0,
    }

    # Create a shape for each bone
    bone_idx = 0
    for bone_group_name, bone_pairs in skeleton.items():
        for joint_a, joint_b in bone_pairs:
            # Get keyframes for both joints
            keyframes_a = keyframe_map[joint_a]
            keyframes_b = keyframe_map[joint_b]

            # Union of keyframes (bone updates when either joint moves)
            keyframes_union = sorted(set(keyframes_a + keyframes_b))

            # Create path shape for bone
            bone_shape = {
                "ty": "sh",  # Shape type: path
                "ks": {
                    "a": 1,  # Animated
                    "k": [],  # Keyframes
                },
            }

            # Add keyframes for bone path
            for kf_idx in keyframes_union:
                pos_a = projected_data[kf_idx, joint_a]
                pos_b = projected_data[kf_idx, joint_b]

                bone_shape["ks"]["k"].append({
                    "i": {"x": [0.833], "y": [0.833]},  # Ease in
                    "o": {"x": [0.167], "y": [0.167]},  # Ease out
                    "t": kf_idx,  # Time (frame number)
                    "s": [{
                        "i": [[0, 0], [0, 0]],  # In tangent
                        "o": [[0, 0], [0, 0]],  # Out tangent
                        "v": [
                            [pos_a[0], pos_a[1]],  # Start point
                            [pos_b[0], pos_b[1]],  # End point
                        ],
                        "c": False,  # Not closed
                    }],
                })

            # Stroke style
            stroke = {
                "ty": "st",  # Stroke
                "c": {"a": 0, "k": bone_color + [1]},  # Color RGBA
                "o": {"a": 0, "k": 100},  # Opacity
                "w": {"a": 0, "k": bone_width},  # Width
                "lc": 2,  # Line cap: round
                "lj": 2,  # Line join: round
            }

            # Group shape + stroke
            bone_group = {
                "ty": "gr",  # Group
                "it": [bone_shape, stroke, {"ty": "tr", "nm": "Transform"}],
                "nm": f"Bone_{bone_idx}",
                "np": 2,
                "cix": 2,
                "bm": 0,
            }

            bone_layer["shapes"].append(bone_group)
            bone_idx += 1

    lottie["layers"].append(bone_layer)

    # Layer for joints (circles)
    joint_layer = {
        "ddd": 0,
        "ind": 2,  # Layer index
        "ty": 4,  # Shape layer
        "nm": "Joints",
        "sr": 1,
        "ks": {
            "o": {"a": 0, "k": 100},
            "r": {"a": 0, "k": 0},
            "p": {"a": 0, "k": [0, 0, 0]},
            "a": {"a": 0, "k": [0, 0, 0]},
            "s": {"a": 0, "k": [100, 100, 100]},
        },
        "ao": 0,
        "shapes": [],
        "ip": 0,
        "op": duration_frames,
        "st": 0,
        "bm": 0,
    }

    # Create a circle for each joint
    for joint_idx in range(num_joints):
        keyframes = keyframe_map[joint_idx]
        radius = head_radius if joint_idx == 15 else joint_radius

        # Create ellipse shape (Lottie doesn't have simple circles in position)
        # Instead, use a group with animated position

        # Static circle shape
        ellipse = {
            "ty": "el",  # Ellipse
            "p": {"a": 0, "k": [0, 0]},  # Center at origin (will move group)
            "s": {"a": 0, "k": [radius * 2, radius * 2]},  # Size (diameter)
        }

        # Fill
        fill = {
            "ty": "fl",  # Fill
            "c": {"a": 0, "k": joint_color + [1]},  # Color RGBA
            "o": {"a": 0, "k": 100},  # Opacity
        }

        # Animated transform (position)
        transform = {
            "ty": "tr",
            "p": {
                "a": 1,  # Animated
                "k": [],  # Keyframes
            },
            "a": {"a": 0, "k": [0, 0]},  # Anchor
            "s": {"a": 0, "k": [100, 100]},  # Scale
            "r": {"a": 0, "k": 0},  # Rotation
            "o": {"a": 0, "k": 100},  # Opacity
        }

        # Add keyframes for joint position
        for kf_idx in keyframes:
            pos = projected_data[kf_idx, joint_idx]
            transform["p"]["k"].append({
                "i": {"x": [0.833], "y": [0.833]},
                "o": {"x": [0.167], "y": [0.167]},
                "t": kf_idx,
                "s": [pos[0], pos[1]],  # Position [x, y]
            })

        # Group
        joint_group = {
            "ty": "gr",
            "it": [ellipse, fill, transform],
            "nm": f"Joint_{joint_idx}",
            "np": 2,
            "cix": 2,
            "bm": 0,
        }

        joint_layer["shapes"].append(joint_group)

    lottie["layers"].append(joint_layer)

    return lottie


def render_lottie_animation(
    slug: str,
    projected_dir: str = "projected",
    output_dir: str = "output/lottie",
    config: Dict = None,
    threshold_degrees: float = 10.0,
    min_displacement: float = 5.0,
) -> Tuple[str, Dict]:
    """
    Render a single Lottie animation with keyframe optimization.

    Args:
        slug: Exercise slug
        projected_dir: Directory with projected .npy files
        output_dir: Output directory for Lottie JSON
        config: Pipeline configuration
        threshold_degrees: Direction change threshold
        min_displacement: Minimum movement threshold

    Returns:
        Tuple of (output_path, stats)
    """
    if config is None:
        config = load_config()

    # Load projected data
    projected_path = os.path.join(projected_dir, f"{slug}.npy")

    if not os.path.exists(projected_path):
        raise FileNotFoundError(f"Projected data not found: {projected_path}")

    projected_data = np.load(projected_path)  # (T, 22, 2)
    T, num_joints, _ = projected_data.shape

    # Detect keyframes with aggressive optimization
    keyframe_map = optimize_keyframes_for_animation(
        projected_data,
        threshold_degrees=threshold_degrees,
        min_displacement=min_displacement,
    )

    # Calculate optimization stats
    total_possible_keyframes = T * num_joints
    total_optimized_keyframes = sum(len(kfs) for kfs in keyframe_map.values())
    reduction_percent = (
        (1 - total_optimized_keyframes / total_possible_keyframes) * 100
    )

    # Create Lottie animation
    fps = config["rendering"].get("target_fps", config["rendering"].get("fps", 15))
    lottie_json = create_lottie_animation(
        projected_data,
        keyframe_map,
        config,
        fps=fps,
    )

    # Save to file
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{slug}.json")

    with open(output_path, "w") as f:
        json.dump(lottie_json, f, separators=(",", ":"))  # Compact JSON

    # Get file size
    file_size_kb = os.path.getsize(output_path) / 1024

    stats = {
        "frames": T,
        "total_possible_keyframes": total_possible_keyframes,
        "optimized_keyframes": total_optimized_keyframes,
        "reduction_percent": reduction_percent,
        "file_size_kb": file_size_kb,
    }

    return output_path, stats


def main():
    parser = argparse.ArgumentParser(
        description="Render Lottie animations with aggressive keyframe optimization"
    )
    parser.add_argument(
        "--projected-dir",
        type=str,
        default="projected",
        help="Directory containing projected .npy files",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="output/lottie",
        help="Output directory for Lottie JSON files",
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limit number of files to process (for testing)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=10.0,
        help="Direction change threshold in degrees (default: 10.0)",
    )
    parser.add_argument(
        "--min-displacement",
        type=float,
        default=5.0,
        help="Minimum displacement in pixels (default: 5.0)",
    )

    args = parser.parse_args()

    # Load config and manifest
    config = load_config()
    manifest = load_manifest()

    # Get all projected files
    projected_path = Path(args.projected_dir)
    if not projected_path.exists():
        print(f"❌ Error: Projected directory not found: {args.projected_dir}")
        return

    projected_files = sorted(projected_path.glob("*.npy"))

    if args.limit:
        projected_files = projected_files[: args.limit]

    print(f"🎬 Rendering {len(projected_files)} Lottie animations...")
    print(f"⚙️  Optimization: threshold={args.threshold}°, min_displacement={args.min_displacement}px")
    print(f"📁 Output: {args.output_dir}")
    print()

    # Track stats
    total_stats = {
        "count": 0,
        "total_frames": 0,
        "total_possible_keyframes": 0,
        "total_optimized_keyframes": 0,
        "total_size_kb": 0.0,
    }

    # Process each file
    for projected_file in tqdm(projected_files, desc="Rendering"):
        slug = projected_file.stem

        try:
            output_path, stats = render_lottie_animation(
                slug=slug,
                projected_dir=args.projected_dir,
                output_dir=args.output_dir,
                config=config,
                threshold_degrees=args.threshold,
                min_displacement=args.min_displacement,
            )

            # Update totals
            total_stats["count"] += 1
            total_stats["total_frames"] += stats["frames"]
            total_stats["total_possible_keyframes"] += stats["total_possible_keyframes"]
            total_stats["total_optimized_keyframes"] += stats["optimized_keyframes"]
            total_stats["total_size_kb"] += stats["file_size_kb"]

        except Exception as e:
            print(f"\n❌ Error rendering {slug}: {e}")
            continue

    # Print summary
    print("\n" + "=" * 60)
    print("✅ Rendering complete!")
    print("=" * 60)
    print(f"📊 Processed: {total_stats['count']} animations")
    print(f"🎞️  Total frames: {total_stats['total_frames']}")
    print(f"⚡ Keyframe optimization:")
    print(f"   Before: {total_stats['total_possible_keyframes']:,} keyframes")
    print(f"   After:  {total_stats['total_optimized_keyframes']:,} keyframes")

    if total_stats["total_possible_keyframes"] > 0:
        reduction = (
            1 - total_stats["total_optimized_keyframes"] / total_stats["total_possible_keyframes"]
        ) * 100
        print(f"   Reduction: {reduction:.1f}%")

    print(f"💾 Total size: {total_stats['total_size_kb']:.1f} KB")

    if total_stats["count"] > 0:
        avg_size = total_stats["total_size_kb"] / total_stats["count"]
        print(f"📦 Average size: {avg_size:.1f} KB per animation")

    print(f"\n📁 Output directory: {args.output_dir}")
    print("=" * 60)


if __name__ == "__main__":
    main()
