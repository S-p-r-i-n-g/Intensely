#!/usr/bin/env python3
"""
Generate Output Manifest

Creates output/manifest.json with metadata about all rendered animations.

Includes:
- Version and timestamp
- Total exercise count
- Per-exercise metadata:
  - WebP/Lottie paths
  - Camera angle
  - Frame count
  - File sizes
  - Movement pattern

Usage:
    python src/09_generate_manifest.py

    # Include Lottie files
    python src/09_generate_manifest.py --include-lottie

    # Custom output path
    python src/09_generate_manifest.py --output custom-manifest.json

    # Custom CDN base URL
    python src/09_generate_manifest.py --cdn-base https://cdn.intensely.app

Output:
    output/manifest.json - Complete animation metadata
"""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from PIL import Image

# Version of the manifest format
MANIFEST_VERSION = "1.0.0"


def load_source_manifest(manifest_path: str = "manifest.json") -> Dict:
    """Load the source manifest (from step 02)."""
    if not os.path.exists(manifest_path):
        print(f"⚠️  Warning: Source manifest not found: {manifest_path}")
        return {"exercises": {}}

    with open(manifest_path, "r") as f:
        return json.load(f)


def get_webp_frame_count(webp_path: str) -> Optional[int]:
    """
    Get frame count from animated WebP file.

    Args:
        webp_path: Path to WebP file

    Returns:
        Number of frames, or None if unable to read
    """
    try:
        with Image.open(webp_path) as img:
            if not getattr(img, "is_animated", False):
                return 1  # Static image

            frame_count = 0
            try:
                while True:
                    img.seek(frame_count)
                    frame_count += 1
            except EOFError:
                pass

            return frame_count
    except Exception as e:
        print(f"  ⚠️  Failed to read {webp_path}: {e}")
        return None


def get_file_size(file_path: str) -> Optional[int]:
    """Get file size in bytes."""
    try:
        return os.path.getsize(file_path)
    except Exception:
        return None


def scan_animations(
    webp_dir: str = "output/webp",
    lottie_dir: str = "output/lottie",
    include_lottie: bool = False,
) -> Dict[str, Dict]:
    """
    Scan animation directories for files.

    Args:
        webp_dir: Directory containing WebP files
        lottie_dir: Directory containing Lottie JSON files
        include_lottie: Whether to include Lottie files

    Returns:
        Dictionary mapping slug -> file info
    """
    animations = {}

    # Scan WebP files
    webp_path = Path(webp_dir)
    if webp_path.exists():
        for file_path in webp_path.glob("*.webp"):
            slug = file_path.stem
            animations[slug] = {
                "webp": {
                    "path": str(file_path),
                    "exists": True,
                }
            }

    # Scan Lottie files if requested
    if include_lottie:
        lottie_path = Path(lottie_dir)
        if lottie_path.exists():
            for file_path in lottie_path.glob("*.json"):
                slug = file_path.stem
                if slug not in animations:
                    animations[slug] = {}

                animations[slug]["lottie"] = {
                    "path": str(file_path),
                    "exists": True,
                }

    return animations


def build_manifest(
    animations: Dict[str, Dict],
    source_manifest: Dict,
    cdn_base_url: Optional[str] = None,
) -> Dict:
    """
    Build the output manifest.

    Args:
        animations: Scanned animation files
        source_manifest: Source manifest from step 02
        cdn_base_url: CDN base URL (optional)

    Returns:
        Complete manifest dictionary
    """
    source_exercises = source_manifest.get("exercises", {})

    manifest = {
        "version": MANIFEST_VERSION,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_exercises": len(animations),
        "exercises": {},
    }

    # Add CDN base URL if provided
    if cdn_base_url:
        manifest["cdn_base_url"] = cdn_base_url

    print(f"📊 Processing {len(animations)} animations...")

    for slug, anim_data in animations.items():
        exercise_info = source_exercises.get(slug, {})

        exercise_manifest = {
            "slug": slug,
            "name": exercise_info.get("name", slug.replace("-", " ").title()),
            "movement_pattern": exercise_info.get("movement_pattern", "unknown"),
            "camera_angle": exercise_info.get("camera_angle", 0),
        }

        # WebP metadata
        if "webp" in anim_data and anim_data["webp"]["exists"]:
            webp_path = anim_data["webp"]["path"]
            file_size = get_file_size(webp_path)
            frame_count = get_webp_frame_count(webp_path)

            webp_info = {
                "path": webp_path,
                "file_size_bytes": file_size,
                "file_size_kb": round(file_size / 1024, 1) if file_size else None,
                "frame_count": frame_count,
                "format": "webp",
            }

            # Add CDN URL if base provided
            if cdn_base_url:
                webp_info["url"] = f"{cdn_base_url}/animations/{slug}.webp"

            exercise_manifest["webp"] = webp_info

        # Lottie metadata
        if "lottie" in anim_data and anim_data["lottie"]["exists"]:
            lottie_path = anim_data["lottie"]["path"]
            file_size = get_file_size(lottie_path)

            lottie_info = {
                "path": lottie_path,
                "file_size_bytes": file_size,
                "file_size_kb": round(file_size / 1024, 1) if file_size else None,
                "format": "lottie",
            }

            # Add CDN URL if base provided
            if cdn_base_url:
                lottie_info["url"] = f"{cdn_base_url}/animations/{slug}.json"

            exercise_manifest["lottie"] = lottie_info

        manifest["exercises"][slug] = exercise_manifest

    return manifest


def calculate_statistics(manifest: Dict) -> Dict:
    """Calculate summary statistics."""
    exercises = manifest["exercises"]

    stats = {
        "total_exercises": len(exercises),
        "webp_count": sum(1 for ex in exercises.values() if "webp" in ex),
        "lottie_count": sum(1 for ex in exercises.values() if "lottie" in ex),
        "total_webp_size_mb": 0.0,
        "total_lottie_size_mb": 0.0,
        "total_frames": 0,
        "avg_frames_per_animation": 0.0,
        "movement_patterns": {},
        "camera_angles": {},
    }

    # Calculate sizes and counts
    webp_sizes = []
    lottie_sizes = []
    frame_counts = []

    for exercise in exercises.values():
        # Movement pattern distribution
        pattern = exercise.get("movement_pattern", "unknown")
        stats["movement_patterns"][pattern] = stats["movement_patterns"].get(pattern, 0) + 1

        # Camera angle distribution
        angle = exercise.get("camera_angle", 0)
        stats["camera_angles"][angle] = stats["camera_angles"].get(angle, 0) + 1

        # WebP stats
        if "webp" in exercise:
            webp = exercise["webp"]
            if webp.get("file_size_bytes"):
                webp_sizes.append(webp["file_size_bytes"])
                stats["total_webp_size_mb"] += webp["file_size_bytes"]
            if webp.get("frame_count"):
                frame_counts.append(webp["frame_count"])
                stats["total_frames"] += webp["frame_count"]

        # Lottie stats
        if "lottie" in exercise:
            lottie = exercise["lottie"]
            if lottie.get("file_size_bytes"):
                lottie_sizes.append(lottie["file_size_bytes"])
                stats["total_lottie_size_mb"] += lottie["file_size_bytes"]

    # Convert to MB
    stats["total_webp_size_mb"] = round(stats["total_webp_size_mb"] / (1024 * 1024), 2)
    stats["total_lottie_size_mb"] = round(stats["total_lottie_size_mb"] / (1024 * 1024), 2)

    # Calculate averages
    if frame_counts:
        stats["avg_frames_per_animation"] = round(sum(frame_counts) / len(frame_counts), 1)

    if webp_sizes:
        stats["webp_stats"] = {
            "min_size_kb": round(min(webp_sizes) / 1024, 1),
            "max_size_kb": round(max(webp_sizes) / 1024, 1),
            "avg_size_kb": round(sum(webp_sizes) / len(webp_sizes) / 1024, 1),
        }

    if lottie_sizes:
        stats["lottie_stats"] = {
            "min_size_kb": round(min(lottie_sizes) / 1024, 1),
            "max_size_kb": round(max(lottie_sizes) / 1024, 1),
            "avg_size_kb": round(sum(lottie_sizes) / len(lottie_sizes) / 1024, 1),
        }

    return stats


def print_statistics(stats: Dict) -> None:
    """Print summary statistics."""
    print("\n" + "=" * 60)
    print("📊 Manifest Statistics")
    print("=" * 60)
    print(f"Total exercises: {stats['total_exercises']}")
    print(f"WebP animations: {stats['webp_count']}")
    print(f"Lottie animations: {stats['lottie_count']}")
    print(f"\nTotal WebP size: {stats['total_webp_size_mb']} MB")
    print(f"Total Lottie size: {stats['total_lottie_size_mb']} MB")
    print(f"\nTotal frames: {stats['total_frames']}")
    print(f"Average frames per animation: {stats['avg_frames_per_animation']}")

    if "webp_stats" in stats:
        ws = stats["webp_stats"]
        print(f"\nWebP file sizes:")
        print(f"  Min: {ws['min_size_kb']} KB")
        print(f"  Max: {ws['max_size_kb']} KB")
        print(f"  Avg: {ws['avg_size_kb']} KB")

    if "lottie_stats" in stats:
        ls = stats["lottie_stats"]
        print(f"\nLottie file sizes:")
        print(f"  Min: {ls['min_size_kb']} KB")
        print(f"  Max: {ls['max_size_kb']} KB")
        print(f"  Avg: {ls['avg_size_kb']} KB")

    print(f"\nMovement patterns:")
    for pattern, count in sorted(stats["movement_patterns"].items(), key=lambda x: -x[1]):
        print(f"  {pattern}: {count}")

    print(f"\nCamera angles:")
    for angle, count in sorted(stats["camera_angles"].items()):
        print(f"  {angle}°: {count}")

    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Generate output manifest with animation metadata"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="output/manifest.json",
        help="Output manifest path",
    )
    parser.add_argument(
        "--webp-dir",
        type=str,
        default="output/webp",
        help="WebP directory",
    )
    parser.add_argument(
        "--lottie-dir",
        type=str,
        default="output/lottie",
        help="Lottie directory",
    )
    parser.add_argument(
        "--source-manifest",
        type=str,
        default="manifest.json",
        help="Source manifest from step 02",
    )
    parser.add_argument(
        "--include-lottie",
        action="store_true",
        help="Include Lottie animations in manifest",
    )
    parser.add_argument(
        "--cdn-base",
        type=str,
        help="CDN base URL (e.g., https://cdn.intensely.app)",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON output",
    )

    args = parser.parse_args()

    print("🎬 Generating Animation Manifest")
    print("=" * 60)
    print(f"Output: {args.output}")
    print(f"WebP directory: {args.webp_dir}")
    if args.include_lottie:
        print(f"Lottie directory: {args.lottie_dir}")
    if args.cdn_base:
        print(f"CDN base URL: {args.cdn_base}")
    print()

    # Load source manifest
    print("📖 Loading source manifest...")
    source_manifest = load_source_manifest(args.source_manifest)
    print(f"   Found {len(source_manifest.get('exercises', {}))} exercises in source")

    # Scan animation files
    print("\n🔍 Scanning animation files...")
    animations = scan_animations(
        webp_dir=args.webp_dir,
        lottie_dir=args.lottie_dir,
        include_lottie=args.include_lottie,
    )
    print(f"   Found {len(animations)} animations")

    # Build manifest
    print("\n🏗️  Building manifest...")
    manifest = build_manifest(
        animations=animations,
        source_manifest=source_manifest,
        cdn_base_url=args.cdn_base,
    )

    # Calculate statistics
    print("\n📊 Calculating statistics...")
    stats = calculate_statistics(manifest)
    manifest["statistics"] = stats

    # Print statistics
    print_statistics(stats)

    # Save manifest
    print(f"\n💾 Saving manifest to {args.output}...")
    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)

    with open(args.output, "w") as f:
        if args.pretty:
            json.dump(manifest, f, indent=2)
        else:
            json.dump(manifest, f, separators=(",", ":"))

    file_size = os.path.getsize(args.output)
    print(f"   ✅ Saved ({file_size / 1024:.1f} KB)")

    # Summary
    print("\n" + "=" * 60)
    print("✅ Manifest Generation Complete!")
    print("=" * 60)
    print(f"📄 Manifest: {args.output}")
    print(f"📊 Exercises: {manifest['total_exercises']}")
    print(f"📦 Total size: {stats['total_webp_size_mb'] + stats['total_lottie_size_mb']:.2f} MB")
    print("\n💡 Next steps:")
    print("   1. Upload manifest.json to CDN")
    print("   2. Use in mobile app for animation metadata")
    print("   3. Implement version checking for updates")


if __name__ == "__main__":
    main()
