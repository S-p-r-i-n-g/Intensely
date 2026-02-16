#!/usr/bin/env python3
"""
Generate motion prompts for HY-Motion 1.0 text-to-motion model.
Reads exercise_library_master.csv and outputs prompts.json.
"""

import json
import pandas as pd
from pathlib import Path
from collections import Counter


def load_config():
    """Load pipeline configuration."""
    config_path = Path(__file__).parent.parent / "config.json"
    with open(config_path) as f:
        return json.load(f)


def get_camera_angle(movement_pattern, config):
    """Map movement pattern to camera angle."""
    if not movement_pattern or pd.isna(movement_pattern):
        return config["camera_angles"]["default"]

    pattern = str(movement_pattern).lower().strip()

    # Check direct matches first
    if pattern in config["camera_angles"]:
        return config["camera_angles"][pattern]

    # Check for compound patterns (e.g., "push/vertical-press")
    for key in config["camera_angles"]:
        if key in pattern:
            return config["camera_angles"][key]

    return config["camera_angles"]["default"]


def generate_prompt(row):
    """
    Generate a <55 word motion prompt starting with 'A person'.

    Uses exercise name, description, primary muscles, and instructions
    to create a descriptive prompt suitable for text-to-motion AI.
    """
    name = str(row.get("name", "")).strip() if pd.notna(row.get("name")) else ""
    description = str(row.get("description", "")).strip() if pd.notna(row.get("description")) else ""
    instructions = row.get("instructions", "") if pd.notna(row.get("instructions")) else ""
    primary_muscles = row.get("primaryMuscles", "") if pd.notna(row.get("primaryMuscles")) else ""

    # Parse instructions if it's a JSON array string
    if isinstance(instructions, str) and instructions.startswith("["):
        try:
            instructions_list = json.loads(instructions)
            # Take first 1-2 steps for brevity
            instructions = ". ".join(instructions_list[:2]) if instructions_list else ""
        except:
            instructions = ""

    # Build prompt starting with "A person"
    prompt_parts = [f"A person performing {name.lower()}"]

    # Add key movement description
    if description:
        # Take first sentence or up to 100 chars
        desc_snippet = description.split(".")[0][:100]
        prompt_parts.append(desc_snippet)

    # Add instruction detail if available and space permits
    if instructions:
        inst_snippet = instructions.split(".")[0][:80]
        prompt_parts.append(inst_snippet)

    # Combine and limit to <55 words
    full_prompt = ". ".join(prompt_parts).strip()
    words = full_prompt.split()

    if len(words) > 54:
        # Truncate to 54 words and ensure proper ending
        full_prompt = " ".join(words[:54])
        if not full_prompt.endswith("."):
            full_prompt += "."
    else:
        # Ensure ends with period
        if not full_prompt.endswith("."):
            full_prompt += "."

    return full_prompt


def main():
    """Main pipeline entry point."""
    print("=" * 60)
    print("Exercise Animation Pipeline - Prompt Generator")
    print("=" * 60)

    # Load configuration
    config = load_config()
    print("✓ Loaded config.json")

    # Load exercise data
    data_path = Path(__file__).parent.parent / "data" / "exercise_library_master.csv"

    if not data_path.exists():
        print(f"\n❌ Error: {data_path} not found!")
        print("   Please add exercise_library_master.csv to the data/ directory.")
        return

    df = pd.read_csv(data_path)
    print(f"✓ Loaded {len(df)} exercises from CSV")

    # Generate prompts
    prompts = {}
    movement_patterns = []
    camera_angles = []
    word_counts = []

    for idx, row in df.iterrows():
        slug = row.get("slug", "").strip()
        if not slug:
            print(f"  ⚠ Warning: Row {idx} missing slug, skipping")
            continue

        # Generate prompt
        prompt = generate_prompt(row)
        word_count = len(prompt.split())

        # Get movement pattern and camera angle
        movement_pattern = row.get("movementPattern", "unknown")
        camera_angle = get_camera_angle(movement_pattern, config)

        # Store
        prompts[slug] = {
            "prompt": prompt,
            "camera_angle": camera_angle,
            "movement_pattern": movement_pattern,
            "word_count": word_count
        }

        # Track stats
        movement_patterns.append(movement_pattern)
        camera_angles.append(camera_angle)
        word_counts.append(word_count)

    # Save prompts
    output_path = Path(__file__).parent.parent / "prompts.json"
    with open(output_path, "w") as f:
        json.dump(prompts, f, indent=2)

    print(f"✓ Generated {len(prompts)} prompts → {output_path.name}")

    # Print summary statistics
    print("\n" + "=" * 60)
    print("SUMMARY STATISTICS")
    print("=" * 60)

    print(f"\nTotal exercises: {len(prompts)}")

    print(f"\nPrompt word counts:")
    print(f"  Min: {min(word_counts)} words")
    print(f"  Max: {max(word_counts)} words")
    print(f"  Avg: {sum(word_counts) / len(word_counts):.1f} words")
    print(f"  All under 55 words: {'✓' if all(w < 55 for w in word_counts) else '✗'}")

    print(f"\nMovement patterns:")
    pattern_counts = Counter(movement_patterns)
    for pattern, count in pattern_counts.most_common():
        percentage = (count / len(movement_patterns)) * 100
        print(f"  {pattern:20s}: {count:3d} ({percentage:5.1f}%)")

    print(f"\nCamera angle distribution:")
    angle_counts = Counter(camera_angles)
    angle_names = {0: "front", 45: "3/4 front", 90: "side", 135: "3/4 back"}
    for angle, count in sorted(angle_counts.items()):
        percentage = (count / len(camera_angles)) * 100
        angle_name = angle_names.get(angle, f"{angle}°")
        print(f"  {angle_name:12s} ({angle:3d}°): {count:3d} ({percentage:5.1f}%)")

    print("\n" + "=" * 60)
    print("✓ Prompt generation complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
