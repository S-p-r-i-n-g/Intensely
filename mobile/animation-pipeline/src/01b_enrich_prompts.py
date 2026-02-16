#!/usr/bin/env python3
"""
Enrich weak prompts using Claude API.
Flags prompts <15 words or missing body parts, then generates
40-50 word biomechanical descriptions. Implements checkpointing
and rate-limiting for API reliability.
"""

import json
import os
import re
import time
from pathlib import Path
from typing import Dict, List, Set

import anthropic


# Rate limiting configuration
API_DELAY_SECONDS = 1.0  # Delay between API calls
CHECKPOINT_INTERVAL = 5  # Save checkpoint every N enrichments

# Body part keywords to check for
BODY_PARTS = {
    "arms", "legs", "core", "chest", "back", "shoulders", "hips", "knees",
    "elbows", "wrists", "ankles", "spine", "pelvis", "torso", "thighs",
    "calves", "forearms", "triceps", "biceps", "quadriceps", "hamstrings",
    "glutes", "abs", "abdominals", "obliques", "lats", "traps"
}


def load_prompts():
    """Load prompts.json."""
    prompts_path = Path(__file__).parent.parent / "prompts.json"
    if not prompts_path.exists():
        raise FileNotFoundError(
            f"{prompts_path} not found. Run 01_generate_prompts.py first."
        )

    with open(prompts_path) as f:
        return json.load(f)


def save_prompts(prompts: Dict, path: Path):
    """Save prompts to file."""
    with open(path, "w") as f:
        json.dump(prompts, f, indent=2)


def load_checkpoint():
    """Load checkpoint if exists."""
    checkpoint_path = Path(__file__).parent.parent / ".prompt_enrichment_checkpoint.json"
    if checkpoint_path.exists():
        with open(checkpoint_path) as f:
            return json.load(f)
    return {"enriched": {}, "processed_slugs": []}


def save_checkpoint(checkpoint: Dict):
    """Save checkpoint."""
    checkpoint_path = Path(__file__).parent.parent / ".prompt_enrichment_checkpoint.json"
    with open(checkpoint_path, "w") as f:
        json.dump(checkpoint, f, indent=2)


def is_weak_prompt(prompt: str) -> tuple[bool, List[str]]:
    """
    Check if prompt needs enrichment.

    Returns:
        (is_weak, reasons) - tuple of bool and list of weakness reasons
    """
    reasons = []

    # Check word count
    word_count = len(prompt.split())
    if word_count < 15:
        reasons.append(f"too short ({word_count} words)")

    # Check for body part mentions
    prompt_lower = prompt.lower()
    has_body_part = any(part in prompt_lower for part in BODY_PARTS)
    if not has_body_part:
        reasons.append("missing body part references")

    return len(reasons) > 0, reasons


def enrich_prompt_with_claude(
    exercise_name: str,
    original_prompt: str,
    movement_pattern: str,
    api_key: str
) -> str:
    """
    Use Claude to generate a detailed biomechanical description.

    Returns:
        Enriched 40-50 word prompt starting with "A person"
    """
    client = anthropic.Anthropic(api_key=api_key)

    system_prompt = """You are an expert in exercise biomechanics and motion description.
Generate clear, detailed motion descriptions for AI motion generation systems.
Focus on body positioning, joint movements, and muscle engagement."""

    user_prompt = f"""Generate a 40-50 word biomechanical description for this exercise:

Exercise: {exercise_name}
Movement Pattern: {movement_pattern}
Current description: {original_prompt}

Requirements:
- Start with "A person"
- 40-50 words exactly
- Include specific body parts and joints
- Describe the movement sequence clearly
- Use biomechanical terminology
- Be concise and precise

Return ONLY the improved description, no explanation."""

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=200,
            temperature=0.7,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )

        enriched = message.content[0].text.strip()

        # Ensure it starts with "A person"
        if not enriched.startswith("A person"):
            enriched = "A person " + enriched.lstrip("A person ").lstrip()

        # Ensure proper ending
        if not enriched.endswith("."):
            enriched += "."

        return enriched

    except Exception as e:
        print(f"    ✗ API error: {e}")
        raise


def main():
    """Main enrichment pipeline."""
    print("=" * 60)
    print("Exercise Animation Pipeline - Prompt Enrichment")
    print("=" * 60)

    # Check for API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("\n❌ Error: ANTHROPIC_API_KEY environment variable not set!")
        print("   Set it with: export ANTHROPIC_API_KEY='your-api-key'")
        return

    print("✓ Found ANTHROPIC_API_KEY")

    # Load prompts
    prompts = load_prompts()
    total_count = len(prompts)
    print(f"✓ Loaded {total_count} prompts from prompts.json")

    # Load checkpoint if exists
    checkpoint = load_checkpoint()
    already_processed = set(checkpoint.get("processed_slugs", []))

    if already_processed:
        print(f"✓ Loaded checkpoint: {len(already_processed)} already processed")

    # Find weak prompts
    weak_prompts = {}
    for slug, data in prompts.items():
        if slug in already_processed:
            continue

        prompt = data.get("prompt", "")
        is_weak, reasons = is_weak_prompt(prompt)

        if is_weak:
            weak_prompts[slug] = {
                "data": data,
                "reasons": reasons
            }

    print(f"\n{'=' * 60}")
    print(f"Found {len(weak_prompts)} weak prompts needing enrichment")
    print(f"Already processed: {len(already_processed)}")
    print(f"Remaining to process: {len(weak_prompts)}")
    print(f"{'=' * 60}\n")

    if not weak_prompts:
        print("✓ All prompts are strong! No enrichment needed.")
        # Clean up checkpoint if exists
        checkpoint_path = Path(__file__).parent.parent / ".prompt_enrichment_checkpoint.json"
        if checkpoint_path.exists():
            checkpoint_path.unlink()
            print("✓ Removed checkpoint file")
        return

    # Process weak prompts
    enriched_count = 0
    error_count = 0
    skipped_count = 0

    for idx, (slug, weak_data) in enumerate(weak_prompts.items(), 1):
        data = weak_data["data"]
        reasons = weak_data["reasons"]

        print(f"[{idx}/{len(weak_prompts)}] {slug}")
        print(f"  Reasons: {', '.join(reasons)}")
        print(f"  Original ({data.get('word_count', 0)} words): {data['prompt'][:80]}...")

        try:
            # Call Claude API
            enriched_prompt = enrich_prompt_with_claude(
                exercise_name=slug.replace("-", " ").title(),
                original_prompt=data["prompt"],
                movement_pattern=data.get("movement_pattern", "unknown"),
                api_key=api_key
            )

            word_count = len(enriched_prompt.split())
            print(f"  ✓ Enriched ({word_count} words): {enriched_prompt[:80]}...")

            # Update prompt data
            prompts[slug]["prompt"] = enriched_prompt
            prompts[slug]["word_count"] = word_count
            prompts[slug]["enriched"] = True
            prompts[slug]["original_prompt"] = data["prompt"]

            enriched_count += 1

            # Update checkpoint
            checkpoint["enriched"][slug] = prompts[slug]
            checkpoint["processed_slugs"].append(slug)

            # Save checkpoint periodically
            if enriched_count % CHECKPOINT_INTERVAL == 0:
                save_checkpoint(checkpoint)
                print(f"  💾 Checkpoint saved ({enriched_count} enriched)")

            # Rate limiting
            if idx < len(weak_prompts):  # Don't sleep after last item
                time.sleep(API_DELAY_SECONDS)

        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user!")
            save_checkpoint(checkpoint)
            print("💾 Progress saved to checkpoint")
            print(f"   Processed: {enriched_count}/{len(weak_prompts)}")
            print("   Run script again to resume from checkpoint")
            return

        except Exception as e:
            print(f"  ✗ Error: {e}")
            error_count += 1

            # Save checkpoint on error too
            save_checkpoint(checkpoint)
            print("  💾 Checkpoint saved after error")

            # Continue with next prompt
            continue

    # Merge checkpoint data back into prompts
    for slug, enriched_data in checkpoint["enriched"].items():
        prompts[slug] = enriched_data

    # Save final prompts.json
    prompts_path = Path(__file__).parent.parent / "prompts.json"
    save_prompts(prompts, prompts_path)
    print(f"\n✓ Saved enriched prompts to {prompts_path.name}")

    # Clean up checkpoint
    checkpoint_path = Path(__file__).parent.parent / ".prompt_enrichment_checkpoint.json"
    if checkpoint_path.exists():
        checkpoint_path.unlink()
        print("✓ Removed checkpoint file")

    # Print summary
    print("\n" + "=" * 60)
    print("ENRICHMENT SUMMARY")
    print("=" * 60)
    print(f"Total prompts: {total_count}")
    print(f"Weak prompts found: {len(weak_prompts) + len(already_processed)}")
    print(f"Successfully enriched: {enriched_count}")
    print(f"Previously processed: {len(already_processed)}")
    print(f"Errors: {error_count}")
    print(f"\nAPI calls made: {enriched_count}")
    print(f"Total time: ~{enriched_count * API_DELAY_SECONDS:.0f}s (with rate limiting)")
    print("=" * 60)
    print("✓ Enrichment complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
