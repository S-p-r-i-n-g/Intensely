#!/usr/bin/env python3
"""
Regeneration Helper - Interactive Rework Triage

Processes rework list from QA tool and helps decide how to fix each exercise.

Usage:
    python src/regen_helper.py rework-list-2024-02-14.json

    # Use Claude API for prompt rewriting
    python src/regen_helper.py rework-list-2024-02-14.json --use-api

    # Resume from checkpoint
    python src/regen_helper.py rework-list-2024-02-14.json --resume

For each flagged exercise, offers 3 choices:
1. Keep current prompt (skip regeneration)
2. Rewrite prompt (manually or via Claude API) -> saves to prompts_regen/
3. Flag for video recording -> appends to to_record.txt

Progress is checkpointed so you can resume if interrupted.
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Try to import rich library for better UI
try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("⚠️  Anthropic library not available. Install with: pip install anthropic")

# Color codes for terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def load_rework_list(json_path: str) -> Dict:
    """Load rework list from JSON."""
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Rework list not found: {json_path}")

    with open(json_path, 'r') as f:
        return json.load(f)


def load_checkpoint(checkpoint_path: str = ".regen_helper_checkpoint.json") -> Dict:
    """Load checkpoint if it exists."""
    if os.path.exists(checkpoint_path):
        with open(checkpoint_path, 'r') as f:
            return json.load(f)
    return {
        "processed_slugs": [],
        "decisions": {},
        "last_index": -1,
    }


def save_checkpoint(
    checkpoint: Dict,
    checkpoint_path: str = ".regen_helper_checkpoint.json"
) -> None:
    """Save checkpoint."""
    with open(checkpoint_path, 'w') as f:
        json.dump(checkpoint, f, indent=2)


def load_current_prompt(slug: str, prompts_dir: str = "prompts") -> Optional[str]:
    """Load current prompt for exercise."""
    prompt_path = os.path.join(prompts_dir, f"{slug}.txt")

    if not os.path.exists(prompt_path):
        return None

    with open(prompt_path, 'r') as f:
        return f.read().strip()


def rewrite_prompt_with_claude(
    exercise_name: str,
    current_prompt: str,
    movement_pattern: str,
    api_key: str,
) -> str:
    """
    Rewrite prompt using Claude API for better motion generation.

    Args:
        exercise_name: Name of exercise
        current_prompt: Current prompt text
        movement_pattern: Movement pattern category
        api_key: Anthropic API key

    Returns:
        Rewritten prompt
    """
    if not ANTHROPIC_AVAILABLE:
        raise ImportError("Anthropic library required. Install with: pip install anthropic")

    client = Anthropic(api_key=api_key)

    prompt = f"""You are improving a motion prompt for AI-based exercise animation generation (HY-Motion 1.0).

Exercise: {exercise_name}
Movement Pattern: {movement_pattern}
Current Prompt: {current_prompt}

The current prompt produced poor quality motion. Rewrite it to be more specific and biomechanically accurate.

Requirements:
- 40-50 words (not including "A person performing")
- Start with "A person performing {exercise_name.lower()}"
- Include specific body parts and joint angles
- Describe the movement sequence clearly
- Mention starting position, movement path, and end position
- Use anatomical terms (e.g., "flexing elbow to 90°", "extending hips")
- Be specific about range of motion and timing

Focus on clarity and biomechanical detail to help the AI generate better motion.

Return ONLY the rewritten prompt, no explanation."""

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()


def display_exercise_info(exercise: Dict, index: int, total: int) -> None:
    """Display exercise information."""
    print(f"\n{Colors.HEADER}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}Exercise {index + 1}/{total}{Colors.END}")
    print(f"{Colors.HEADER}{'='*70}{Colors.END}")
    print(f"{Colors.CYAN}Name:{Colors.END} {exercise['name']}")
    print(f"{Colors.CYAN}Slug:{Colors.END} {exercise['slug']}")
    print(f"{Colors.CYAN}Movement Pattern:{Colors.END} {exercise['movement_pattern']}")
    print(f"{Colors.CYAN}Camera Angle:{Colors.END} {exercise['camera_angle']}°")

    has_animation = exercise.get('has_animation', False)
    status = f"{Colors.GREEN}✓ Rendered{Colors.END}" if has_animation else f"{Colors.RED}✗ Missing{Colors.END}"
    print(f"{Colors.CYAN}Status:{Colors.END} {status}")


def display_current_prompt(prompt: str) -> None:
    """Display current prompt."""
    print(f"\n{Colors.YELLOW}Current Prompt:{Colors.END}")
    print(f"  {prompt}")
    print(f"  {Colors.YELLOW}({len(prompt.split())} words){Colors.END}")


def get_user_choice() -> int:
    """Get user's choice via terminal prompt."""
    print(f"\n{Colors.BOLD}What would you like to do?{Colors.END}")
    print(f"  {Colors.GREEN}1{Colors.END} - Keep current prompt (skip regeneration)")
    print(f"  {Colors.BLUE}2{Colors.END} - Rewrite prompt (improve for text-to-motion)")
    print(f"  {Colors.YELLOW}3{Colors.END} - Flag for video recording (use video-to-motion)")
    print(f"  {Colors.RED}q{Colors.END} - Quit and save progress")

    while True:
        choice = input(f"\n{Colors.BOLD}Enter choice (1/2/3/q):{Colors.END} ").strip().lower()

        if choice in ['1', '2', '3', 'q']:
            return choice

        print(f"{Colors.RED}Invalid choice. Please enter 1, 2, 3, or q.{Colors.END}")


def get_rewrite_method(use_api: bool, api_key: Optional[str]) -> str:
    """Ask how to rewrite the prompt."""
    if not use_api or not api_key or not ANTHROPIC_AVAILABLE:
        return "manual"

    print(f"\n{Colors.BOLD}How would you like to rewrite the prompt?{Colors.END}")
    print(f"  {Colors.GREEN}1{Colors.END} - Manually (you type the new prompt)")
    print(f"  {Colors.BLUE}2{Colors.END} - Automatically (Claude API rewrites it)")

    while True:
        choice = input(f"\n{Colors.BOLD}Enter choice (1/2):{Colors.END} ").strip()

        if choice == '1':
            return "manual"
        elif choice == '2':
            return "auto"

        print(f"{Colors.RED}Invalid choice. Please enter 1 or 2.{Colors.END}")


def get_manual_prompt(exercise_name: str, current_prompt: str) -> str:
    """Get manually rewritten prompt from user."""
    print(f"\n{Colors.BOLD}Enter new prompt:{Colors.END}")
    print(f"{Colors.YELLOW}(Start with 'A person performing {exercise_name.lower()}'){Colors.END}")
    print(f"{Colors.YELLOW}(Press Ctrl+D or Ctrl+Z when done, or type END on a new line){Colors.END}\n")

    lines = []
    try:
        while True:
            line = input()
            if line.strip().upper() == 'END':
                break
            lines.append(line)
    except EOFError:
        pass

    new_prompt = ' '.join(lines).strip()

    if not new_prompt:
        print(f"{Colors.RED}Empty prompt. Using current prompt.{Colors.END}")
        return current_prompt

    return new_prompt


def save_rewritten_prompt(slug: str, prompt: str, output_dir: str = "prompts_regen") -> str:
    """Save rewritten prompt to file."""
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{slug}.txt")

    with open(output_path, 'w') as f:
        f.write(prompt)

    return output_path


def append_to_record_list(
    exercise_name: str,
    slug: str,
    movement_pattern: str,
    camera_angle: int,
    output_path: str = "to_record.txt"
) -> None:
    """Append exercise to video recording checklist."""
    # Check if already in list
    if os.path.exists(output_path):
        with open(output_path, 'r') as f:
            content = f.read()
            if slug in content:
                print(f"{Colors.YELLOW}  Already in recording list{Colors.END}")
                return

    with open(output_path, 'a') as f:
        f.write(f"[ ] {exercise_name} ({slug}) - {movement_pattern} @ {camera_angle}°\n")


def process_exercise(
    exercise: Dict,
    index: int,
    total: int,
    use_api: bool,
    api_key: Optional[str],
    checkpoint: Dict,
) -> str:
    """
    Process a single exercise.

    Returns:
        Decision: "keep", "rewrite", or "video"
    """
    slug = exercise['slug']
    exercise_name = exercise['name']
    movement_pattern = exercise['movement_pattern']
    camera_angle = exercise['camera_angle']

    # Display exercise info
    display_exercise_info(exercise, index, total)

    # Load current prompt
    current_prompt = load_current_prompt(slug)
    if current_prompt:
        display_current_prompt(current_prompt)
    else:
        print(f"\n{Colors.RED}⚠️  No current prompt found{Colors.END}")

    # Get user choice
    choice = get_user_choice()

    if choice == 'q':
        return 'quit'
    elif choice == '1':
        # Keep current prompt
        print(f"{Colors.GREEN}✓ Keeping current prompt{Colors.END}")
        return 'keep'

    elif choice == '2':
        # Rewrite prompt
        method = get_rewrite_method(use_api, api_key)

        if method == "auto":
            print(f"\n{Colors.BLUE}🤖 Rewriting prompt with Claude API...{Colors.END}")
            try:
                new_prompt = rewrite_prompt_with_claude(
                    exercise_name,
                    current_prompt,
                    movement_pattern,
                    api_key,
                )
                print(f"\n{Colors.GREEN}New Prompt:{Colors.END}")
                print(f"  {new_prompt}")
                print(f"  {Colors.YELLOW}({len(new_prompt.split())} words){Colors.END}")

                # Confirm
                confirm = input(f"\n{Colors.BOLD}Accept this prompt? (y/n):{Colors.END} ").strip().lower()
                if confirm != 'y':
                    print(f"{Colors.YELLOW}Switching to manual entry...{Colors.END}")
                    new_prompt = get_manual_prompt(exercise_name, current_prompt)

            except Exception as e:
                print(f"{Colors.RED}Error rewriting prompt: {e}{Colors.END}")
                print(f"{Colors.YELLOW}Switching to manual entry...{Colors.END}")
                new_prompt = get_manual_prompt(exercise_name, current_prompt)
        else:
            new_prompt = get_manual_prompt(exercise_name, current_prompt)

        # Save rewritten prompt
        output_path = save_rewritten_prompt(slug, new_prompt)
        print(f"{Colors.GREEN}✓ Saved to: {output_path}{Colors.END}")

        checkpoint['decisions'][slug] = {
            'action': 'rewrite',
            'new_prompt': new_prompt,
            'output_path': output_path,
        }

        return 'rewrite'

    elif choice == '3':
        # Flag for video recording
        append_to_record_list(exercise_name, slug, movement_pattern, camera_angle)
        print(f"{Colors.GREEN}✓ Added to recording list: to_record.txt{Colors.END}")

        checkpoint['decisions'][slug] = {
            'action': 'video',
        }

        return 'video'


def print_summary(checkpoint: Dict, total: int) -> None:
    """Print summary of decisions."""
    decisions = checkpoint['decisions']

    keep_count = sum(1 for d in decisions.values() if d.get('action') == 'keep')
    rewrite_count = sum(1 for d in decisions.values() if d.get('action') == 'rewrite')
    video_count = sum(1 for d in decisions.values() if d.get('action') == 'video')
    processed = len(decisions)

    print(f"\n{Colors.HEADER}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}Summary{Colors.END}")
    print(f"{Colors.HEADER}{'='*70}{Colors.END}")
    print(f"Total exercises in rework list: {total}")
    print(f"Processed: {processed}")
    print(f"{Colors.GREEN}Kept current prompt: {keep_count}{Colors.END}")
    print(f"{Colors.BLUE}Rewritten prompts: {rewrite_count}{Colors.END}")
    print(f"{Colors.YELLOW}Flagged for video: {video_count}{Colors.END}")

    if rewrite_count > 0:
        print(f"\n{Colors.BLUE}📝 Rewritten prompts saved to: prompts_regen/{Colors.END}")

    if video_count > 0:
        print(f"{Colors.YELLOW}📹 Video recording checklist: to_record.txt{Colors.END}")

    print(f"\n{Colors.BOLD}Next steps:{Colors.END}")

    if rewrite_count > 0:
        print(f"  1. Upload prompts_regen/ to RunPod")
        print(f"  2. Regenerate with HY-Motion for rewritten prompts")
        print(f"  3. Download and reprocess")

    if video_count > 0:
        print(f"  1. Review to_record.txt checklist")
        print(f"  2. Record videos following guidelines (see VIDEO_FALLBACK_GUIDE.md)")
        print(f"  3. Process with GVHMR (src/08_video_to_motion.py)")


def main():
    parser = argparse.ArgumentParser(
        description="Interactive helper for triaging rework list"
    )
    parser.add_argument(
        "rework_list",
        type=str,
        help="Path to rework list JSON (from QA tool)",
    )
    parser.add_argument(
        "--use-api",
        action="store_true",
        help="Enable Claude API for automatic prompt rewriting",
    )
    parser.add_argument(
        "--api-key",
        type=str,
        help="Anthropic API key (or set ANTHROPIC_API_KEY env var)",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume from checkpoint",
    )
    parser.add_argument(
        "--checkpoint",
        type=str,
        default=".regen_helper_checkpoint.json",
        help="Path to checkpoint file",
    )

    args = parser.parse_args()

    # Load API key from env if not provided
    api_key = args.api_key or os.getenv("ANTHROPIC_API_KEY")

    if args.use_api and not api_key:
        print(f"{Colors.RED}Error: API key required for Claude API rewriting{Colors.END}")
        print("Set ANTHROPIC_API_KEY environment variable or use --api-key")
        sys.exit(1)

    # Load rework list
    try:
        rework_data = load_rework_list(args.rework_list)
    except FileNotFoundError as e:
        print(f"{Colors.RED}Error: {e}{Colors.END}")
        sys.exit(1)

    exercises = rework_data.get('exercises', [])

    if len(exercises) == 0:
        print(f"{Colors.YELLOW}No exercises in rework list{Colors.END}")
        sys.exit(0)

    print(f"{Colors.HEADER}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}Regeneration Helper - Interactive Rework Triage{Colors.END}")
    print(f"{Colors.HEADER}{'='*70}{Colors.END}")
    print(f"Rework list: {args.rework_list}")
    print(f"Exercises to review: {len(exercises)}")
    print(f"Claude API: {'Enabled' if args.use_api else 'Disabled'}")

    # Load checkpoint
    checkpoint = load_checkpoint(args.checkpoint) if args.resume else {
        "processed_slugs": [],
        "decisions": {},
        "last_index": -1,
    }

    if args.resume and checkpoint['processed_slugs']:
        print(f"{Colors.GREEN}Resuming from checkpoint ({len(checkpoint['processed_slugs'])} already processed){Colors.END}")

    # Process each exercise
    try:
        for i, exercise in enumerate(exercises):
            slug = exercise['slug']

            # Skip if already processed
            if slug in checkpoint['processed_slugs']:
                continue

            # Process exercise
            decision = process_exercise(
                exercise,
                i,
                len(exercises),
                args.use_api,
                api_key,
                checkpoint,
            )

            if decision == 'quit':
                print(f"\n{Colors.YELLOW}Quitting and saving progress...{Colors.END}")
                break

            # Update checkpoint
            checkpoint['processed_slugs'].append(slug)
            checkpoint['last_index'] = i
            save_checkpoint(checkpoint, args.checkpoint)

    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Interrupted. Saving progress...{Colors.END}")
        save_checkpoint(checkpoint, args.checkpoint)

    # Print summary
    print_summary(checkpoint, len(exercises))

    # Clean up checkpoint if all processed
    if len(checkpoint['processed_slugs']) == len(exercises):
        if os.path.exists(args.checkpoint):
            os.remove(args.checkpoint)
            print(f"\n{Colors.GREEN}✓ All exercises processed. Checkpoint removed.{Colors.END}")
    else:
        print(f"\n{Colors.YELLOW}💾 Progress saved. Run with --resume to continue.{Colors.END}")


if __name__ == "__main__":
    main()
