#!/usr/bin/env python3
"""
Prepare batch files for motion generation.
Reads prompts.json and creates individual text files for each exercise
in prompts/ directory, plus a manifest.json for tracking.
"""

import json
from pathlib import Path
from collections import Counter


def load_prompts():
    """Load prompts.json."""
    prompts_path = Path(__file__).parent.parent / "prompts.json"
    if not prompts_path.exists():
        raise FileNotFoundError(
            f"{prompts_path} not found. Run 01_generate_prompts.py first."
        )

    with open(prompts_path) as f:
        return json.load(f)


def create_prompt_files(prompts: dict, output_dir: Path):
    """
    Create individual text files for each exercise prompt.

    Args:
        prompts: Dictionary of slug -> prompt data
        output_dir: Directory to write files (will be created if needed)

    Returns:
        Number of files created
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    created_count = 0

    for slug, data in prompts.items():
        prompt_text = data.get("prompt", "")
        if not prompt_text:
            print(f"  ⚠ Warning: {slug} has no prompt text, skipping")
            continue

        # Create text file
        file_path = output_dir / f"{slug}.txt"
        with open(file_path, "w") as f:
            f.write(prompt_text)

        created_count += 1

    return created_count


def build_manifest(prompts: dict, manifest_path: Path):
    """
    Build manifest.json with metadata for each exercise.

    Manifest structure:
    {
      "total_count": 219,
      "created_at": "2024-02-14T12:00:00",
      "exercises": {
        "slug": {
          "prompt": "...",
          "prompt_file": "prompts/slug.txt",
          "word_count": 45,
          "camera_angle": 90,
          "movement_pattern": "push",
          "enriched": true
        }
      }
    }
    """
    from datetime import datetime

    manifest = {
        "total_count": len(prompts),
        "created_at": datetime.now().isoformat(),
        "exercises": {}
    }

    for slug, data in prompts.items():
        manifest["exercises"][slug] = {
            "prompt": data.get("prompt", ""),
            "prompt_file": f"prompts/{slug}.txt",
            "word_count": data.get("word_count", 0),
            "camera_angle": data.get("camera_angle", 45),
            "movement_pattern": data.get("movement_pattern", "unknown"),
            "enriched": data.get("enriched", False),
        }

        # Include original prompt if enriched
        if data.get("enriched") and "original_prompt" in data:
            manifest["exercises"][slug]["original_prompt"] = data["original_prompt"]

    # Save manifest
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    return manifest


def main():
    """Main batch preparation pipeline."""
    print("=" * 60)
    print("Exercise Animation Pipeline - Batch Preparation")
    print("=" * 60)

    # Load prompts
    prompts = load_prompts()
    print(f"✓ Loaded {len(prompts)} prompts from prompts.json")

    # Create prompts directory
    prompts_dir = Path(__file__).parent.parent / "prompts"
    print(f"\nCreating prompt files in {prompts_dir.name}/")

    # Create individual prompt files
    created_count = create_prompt_files(prompts, prompts_dir)
    print(f"✓ Created {created_count} prompt text files")

    # Build manifest
    manifest_path = Path(__file__).parent.parent / "manifest.json"
    manifest = build_manifest(prompts, manifest_path)
    print(f"✓ Created manifest.json")

    # Print summary statistics
    print("\n" + "=" * 60)
    print("BATCH SUMMARY")
    print("=" * 60)

    print(f"\nTotal exercises: {manifest['total_count']}")

    # Count enriched vs original
    enriched_count = sum(
        1 for ex in manifest["exercises"].values()
        if ex.get("enriched", False)
    )
    print(f"Enriched prompts: {enriched_count}")
    print(f"Original prompts: {manifest['total_count'] - enriched_count}")

    # Word count stats
    word_counts = [ex["word_count"] for ex in manifest["exercises"].values()]
    if word_counts:
        print(f"\nWord counts:")
        print(f"  Min: {min(word_counts)} words")
        print(f"  Max: {max(word_counts)} words")
        print(f"  Avg: {sum(word_counts) / len(word_counts):.1f} words")

    # Movement pattern distribution
    patterns = [ex["movement_pattern"] for ex in manifest["exercises"].values()]
    pattern_counts = Counter(patterns)
    print(f"\nMovement patterns:")
    for pattern, count in pattern_counts.most_common(5):
        percentage = (count / len(patterns)) * 100
        print(f"  {pattern:20s}: {count:3d} ({percentage:5.1f}%)")

    # Camera angle distribution
    angles = [ex["camera_angle"] for ex in manifest["exercises"].values()]
    angle_counts = Counter(angles)
    angle_names = {0: "front", 45: "3/4 front", 90: "side", 135: "3/4 back"}
    print(f"\nCamera angles:")
    for angle, count in sorted(angle_counts.items()):
        percentage = (count / len(angles)) * 100
        angle_name = angle_names.get(angle, f"{angle}°")
        print(f"  {angle_name:12s} ({angle:3d}°): {count:3d} ({percentage:5.1f}%)")

    print("\n" + "=" * 60)
    print("BATCH FILES READY")
    print("=" * 60)
    print(f"\n📁 Prompt files: {prompts_dir}/")
    print(f"📄 Manifest: {manifest_path.name}")
    print(f"\nReady for motion generation!")
    print("  - Upload prompts/ to cloud GPU")
    print("  - Run HY-Motion 1.0 batch processing")
    print("  - Download .npy files to motion_data/")
    print("=" * 60)


if __name__ == "__main__":
    main()
