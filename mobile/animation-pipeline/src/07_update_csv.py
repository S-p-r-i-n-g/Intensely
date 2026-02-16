#!/usr/bin/env python3
"""
Update Exercise CSV with Animation URLs

Updates the exercise_library_master.csv with CDN paths for successfully
rendered animations.

Usage:
    # Update with WebP URLs (default)
    python src/07_update_csv.py --cdn-base https://cdn.intensely.app

    # Update with Lottie URLs
    python src/07_update_csv.py --cdn-base https://cdn.intensely.app --format lottie

    # Dry run (preview changes without saving)
    python src/07_update_csv.py --cdn-base https://cdn.intensely.app --dry-run

    # Update both WebP and Lottie columns
    python src/07_update_csv.py --cdn-base https://cdn.intensely.app --update-both

Output:
    - Updates animationUrl column (or animationUrlLottie if --format lottie)
    - Creates backup: data/exercise_library_master.csv.backup
    - Shows statistics about updates
"""

import argparse
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd


def find_rendered_files(
    output_dir: str,
    file_extension: str = ".webp"
) -> Dict[str, str]:
    """
    Find all successfully rendered animation files.

    Args:
        output_dir: Directory containing rendered files
        file_extension: File extension to look for (.webp or .json)

    Returns:
        Dictionary mapping slug -> file_path
    """
    output_path = Path(output_dir)

    if not output_path.exists():
        print(f"⚠️  Warning: Output directory not found: {output_dir}")
        return {}

    rendered_files = {}

    for file_path in output_path.glob(f"*{file_extension}"):
        slug = file_path.stem
        rendered_files[slug] = str(file_path)

    return rendered_files


def construct_cdn_url(
    slug: str,
    cdn_base_url: str,
    format: str = "webp"
) -> str:
    """
    Construct CDN URL for animation.

    Args:
        slug: Exercise slug
        cdn_base_url: Base CDN URL (e.g., "https://cdn.intensely.app")
        format: "webp" or "lottie"

    Returns:
        Full CDN URL
    """
    # Remove trailing slash from base URL
    cdn_base_url = cdn_base_url.rstrip("/")

    # Construct URL based on format
    extension = "json" if format == "lottie" else "webp"
    cdn_url = f"{cdn_base_url}/animations/{slug}.{extension}"

    return cdn_url


def update_csv_with_urls(
    csv_path: str,
    rendered_files: Dict[str, str],
    cdn_base_url: str,
    format: str = "webp",
    dry_run: bool = False,
) -> Tuple[pd.DataFrame, Dict]:
    """
    Update CSV with animation URLs.

    Args:
        csv_path: Path to exercise CSV
        rendered_files: Dictionary of slug -> file_path
        cdn_base_url: Base CDN URL
        format: "webp" or "lottie"
        dry_run: If True, don't save changes

    Returns:
        Tuple of (updated_df, stats)
    """
    # Load CSV
    df = pd.read_csv(csv_path)

    # Determine column name
    if format == "lottie":
        url_column = "animationUrlLottie"
    else:
        url_column = "animationUrl"

    # Ensure column exists
    if url_column not in df.columns:
        df[url_column] = None
        print(f"📝 Created new column: {url_column}")

    # Track statistics
    stats = {
        "total_exercises": len(df),
        "rendered_count": len(rendered_files),
        "updated_count": 0,
        "already_set_count": 0,
        "not_rendered_count": 0,
        "updated_slugs": [],
        "not_rendered_slugs": [],
    }

    # Update each row
    for idx, row in df.iterrows():
        slug = row.get("slug")

        if pd.isna(slug):
            # No slug, skip
            continue

        if slug in rendered_files:
            # Animation exists, construct URL
            cdn_url = construct_cdn_url(slug, cdn_base_url, format)

            # Check if already set
            current_url = row.get(url_column)
            if pd.notna(current_url) and current_url == cdn_url:
                stats["already_set_count"] += 1
            else:
                # Update URL
                df.at[idx, url_column] = cdn_url
                stats["updated_count"] += 1
                stats["updated_slugs"].append(slug)
        else:
            # Animation doesn't exist
            stats["not_rendered_count"] += 1
            stats["not_rendered_slugs"].append(slug)

            # Clear URL if it was previously set
            if pd.notna(row.get(url_column)):
                df.at[idx, url_column] = None

    # Save if not dry run
    if not dry_run:
        # Create backup
        backup_path = f"{csv_path}.backup"
        shutil.copy2(csv_path, backup_path)
        print(f"💾 Created backup: {backup_path}")

        # Save updated CSV
        df.to_csv(csv_path, index=False)
        print(f"✅ Updated CSV: {csv_path}")
    else:
        print("🔍 DRY RUN - No changes saved")

    return df, stats


def print_stats(stats: Dict, format: str = "webp"):
    """Print update statistics."""
    print("\n" + "=" * 60)
    print("📊 Update Statistics")
    print("=" * 60)
    print(f"Format: {format.upper()}")
    print(f"Total exercises in CSV: {stats['total_exercises']}")
    print(f"Rendered animations found: {stats['rendered_count']}")
    print(f"URLs updated: {stats['updated_count']}")
    print(f"URLs already set (unchanged): {stats['already_set_count']}")
    print(f"Not rendered (URL cleared): {stats['not_rendered_count']}")

    # Show coverage percentage
    if stats['total_exercises'] > 0:
        coverage = (stats['rendered_count'] / stats['total_exercises']) * 100
        print(f"\n📈 Coverage: {coverage:.1f}%")

    # Show sample updated exercises
    if stats['updated_count'] > 0:
        print(f"\n✏️  Sample updated exercises:")
        for slug in stats['updated_slugs'][:5]:
            print(f"   - {slug}")
        if len(stats['updated_slugs']) > 5:
            print(f"   ... and {len(stats['updated_slugs']) - 5} more")

    # Show missing animations
    if stats['not_rendered_count'] > 0:
        print(f"\n⚠️  Exercises without animations:")
        for slug in stats['not_rendered_slugs'][:10]:
            print(f"   - {slug}")
        if len(stats['not_rendered_slugs']) > 10:
            print(f"   ... and {len(stats['not_rendered_slugs']) - 10} more")

    print("=" * 60)


def verify_urls(df: pd.DataFrame, url_column: str) -> None:
    """
    Verify that URLs are properly formatted.

    Args:
        df: DataFrame with URLs
        url_column: Column name to verify
    """
    print(f"\n🔍 Verifying {url_column}...")

    # Get all non-null URLs
    urls = df[url_column].dropna()

    if len(urls) == 0:
        print("   ⚠️  No URLs found")
        return

    # Check for common issues
    issues = []

    for url in urls:
        # Check if URL is a string
        if not isinstance(url, str):
            issues.append(f"Non-string URL: {url}")
            continue

        # Check if URL starts with http/https
        if not url.startswith(("http://", "https://")):
            issues.append(f"Missing protocol: {url}")

        # Check if URL has correct extension
        if url_column == "animationUrlLottie" and not url.endswith(".json"):
            issues.append(f"Wrong extension (expected .json): {url}")
        elif url_column == "animationUrl" and not url.endswith(".webp"):
            issues.append(f"Wrong extension (expected .webp): {url}")

    if issues:
        print(f"   ⚠️  Found {len(issues)} issues:")
        for issue in issues[:5]:
            print(f"      - {issue}")
        if len(issues) > 5:
            print(f"      ... and {len(issues) - 5} more")
    else:
        print(f"   ✅ All {len(urls)} URLs valid")

    # Show sample URLs
    print(f"\n📋 Sample URLs:")
    for url in urls.head(3):
        print(f"   {url}")


def export_missing_list(
    stats: Dict,
    output_path: str = "missing_animations.txt"
) -> None:
    """
    Export list of exercises without animations.

    Args:
        stats: Statistics dictionary
        output_path: Output file path
    """
    if stats['not_rendered_count'] == 0:
        return

    with open(output_path, "w") as f:
        f.write(f"# Exercises Without Animations\n")
        f.write(f"# Generated: {datetime.now().isoformat()}\n")
        f.write(f"# Total: {stats['not_rendered_count']}\n\n")

        for slug in stats['not_rendered_slugs']:
            f.write(f"{slug}\n")

    print(f"\n📄 Exported missing exercises to: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Update exercise CSV with animation CDN URLs"
    )
    parser.add_argument(
        "--csv",
        type=str,
        default="data/exercise_library_master.csv",
        help="Path to exercise CSV file",
    )
    parser.add_argument(
        "--cdn-base",
        type=str,
        required=True,
        help="Base CDN URL (e.g., https://cdn.intensely.app)",
    )
    parser.add_argument(
        "--format",
        type=str,
        choices=["webp", "lottie"],
        default="webp",
        help="Animation format (webp or lottie)",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        help="Output directory (auto-detected based on format if not provided)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without saving",
    )
    parser.add_argument(
        "--update-both",
        action="store_true",
        help="Update both WebP and Lottie URLs (ignores --format)",
    )
    parser.add_argument(
        "--export-missing",
        action="store_true",
        help="Export list of exercises without animations",
    )

    args = parser.parse_args()

    # Check if CSV exists
    if not os.path.exists(args.csv):
        print(f"❌ Error: CSV file not found: {args.csv}")
        return

    print("🎬 Updating Exercise CSV with Animation URLs")
    print("=" * 60)
    print(f"📄 CSV: {args.csv}")
    print(f"🌐 CDN Base: {args.cdn_base}")

    if args.update_both:
        print(f"📦 Updating: Both WebP and Lottie")
    else:
        print(f"📦 Format: {args.format.upper()}")

    if args.dry_run:
        print("🔍 Mode: DRY RUN (no changes will be saved)")
    print()

    # Update WebP and/or Lottie
    formats_to_update = []
    if args.update_both:
        formats_to_update = ["webp", "lottie"]
    else:
        formats_to_update = [args.format]

    all_stats = {}

    for format in formats_to_update:
        # Determine output directory
        if args.output_dir:
            output_dir = args.output_dir
        else:
            output_dir = f"output/{format}"

        extension = ".json" if format == "lottie" else ".webp"

        print(f"\n{'=' * 60}")
        print(f"Processing {format.upper()} animations")
        print(f"{'=' * 60}")

        # Find rendered files
        print(f"🔍 Scanning for rendered files in {output_dir}...")
        rendered_files = find_rendered_files(output_dir, extension)
        print(f"   Found {len(rendered_files)} rendered animations")

        # Update CSV
        df, stats = update_csv_with_urls(
            csv_path=args.csv,
            rendered_files=rendered_files,
            cdn_base_url=args.cdn_base,
            format=format,
            dry_run=args.dry_run,
        )

        # Store stats
        all_stats[format] = stats

        # Print statistics
        print_stats(stats, format)

        # Verify URLs
        url_column = "animationUrlLottie" if format == "lottie" else "animationUrl"
        verify_urls(df, url_column)

        # Export missing list if requested
        if args.export_missing and stats['not_rendered_count'] > 0:
            export_missing_list(
                stats,
                output_path=f"missing_animations_{format}.txt"
            )

    # Final summary
    print("\n" + "=" * 60)
    print("✅ Update Complete!")
    print("=" * 60)

    if args.dry_run:
        print("🔍 This was a dry run. No changes were saved.")
        print("   Remove --dry-run to apply changes.")
    else:
        print(f"💾 CSV updated: {args.csv}")
        print(f"💾 Backup created: {args.csv}.backup")

        if args.update_both:
            print("\n📊 Total Updates:")
            for format in formats_to_update:
                stats = all_stats[format]
                print(f"   {format.upper()}: {stats['updated_count']} URLs updated")

    print("\n💡 Next steps:")
    print("   1. Review the updated CSV")
    print("   2. Upload animations to CDN")
    print("   3. Deploy updated CSV to production")
    print("   4. Test animation loading in mobile app")


if __name__ == "__main__":
    main()
