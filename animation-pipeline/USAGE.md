# Pipeline Usage Guide

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up API key:**
   ```bash
   export ANTHROPIC_API_KEY='your-api-key-here'
   ```

   Or create a `.env` file (copy from `.env.example`)

3. **Add exercise data:**
   - Place `exercise_library_master.csv` in `data/` directory

## Pipeline Scripts

### 01: Generate Prompts

Reads CSV and creates initial motion prompts (<55 words).

```bash
python src/01_generate_prompts.py
```

**Output:** `prompts.json`

**Stats shown:**
- Total exercises
- Word count distribution
- Movement patterns
- Camera angles

---

### 01b: Enrich Prompts (Optional)

Improves weak prompts using Claude API with checkpointing.

```bash
python src/01b_enrich_prompts.py
```

**What it does:**
- Flags prompts <15 words or missing body parts
- Calls Claude API to generate 40-50 word biomechanical descriptions
- Rate-limits API calls (1 second between requests)
- Saves checkpoint every 5 enrichments
- Can resume if interrupted

**Features:**
- ✅ **Rate limiting** - 1s delay between API calls
- ✅ **Checkpointing** - Saves progress to `.prompt_enrichment_checkpoint.json`
- ✅ **Resume capability** - Run again to continue from checkpoint
- ✅ **Error handling** - Continues on failures, saves checkpoint
- ✅ **Interrupt handling** - Ctrl+C saves progress safely

**Output:** Updates `prompts.json` in-place

**Resume after interruption:**
```bash
# Just run again - it will load the checkpoint automatically
python src/01b_enrich_prompts.py
```

---

## Checkpoint System

The enrichment script creates `.prompt_enrichment_checkpoint.json` to track:
- Enriched prompts
- Processed slugs
- Progress state

**The checkpoint is automatically:**
- Created on first run
- Updated every 5 enrichments
- Saved on errors
- Saved on Ctrl+C interrupt
- Loaded on script restart
- Deleted when enrichment completes

**Manual checkpoint management:**
```bash
# View checkpoint
cat .prompt_enrichment_checkpoint.json

# Clear checkpoint (start fresh)
rm .prompt_enrichment_checkpoint.json
```

## Tips

**For large datasets:**
- The enrichment script processes ~60 prompts/minute with rate limiting
- 200 prompts takes ~3-4 minutes
- Checkpoints save every 5 prompts (every ~5 seconds)

**If API fails:**
- The script will catch errors and continue
- Progress is checkpointed regularly
- Re-run to resume from last checkpoint

**Cost estimation:**
- Each enrichment: ~150 input tokens + ~75 output tokens
- Cost per prompt: ~$0.001 (Claude 3.5 Sonnet pricing)
- 200 prompts: ~$0.20

---

### 02: Prepare Batch

Creates individual prompt files and manifest for batch processing.

```bash
python src/02_prepare_batch.py
```

**What it does:**
- Reads `prompts.json`
- Creates `prompts/slug.txt` for each exercise
- Generates `manifest.json` with metadata

**Output structure:**
```
prompts/
├── push-up.txt           # "A person performing push-up..."
├── squat.txt             # "A person performing squat..."
└── ...                   # One file per exercise

manifest.json             # Complete metadata + file paths
```

**Manifest format:**
```json
{
  "total_count": 219,
  "created_at": "2024-02-14T12:00:00",
  "exercises": {
    "push-up": {
      "prompt": "A person performing push-up...",
      "prompt_file": "prompts/push-up.txt",
      "word_count": 45,
      "camera_angle": 90,
      "movement_pattern": "push",
      "enriched": true
    }
  }
}
```

**Next steps after batch prep:**
1. Upload `prompts/` directory to cloud GPU (RunPod)
2. Run HY-Motion 1.0 batch processing
3. Download `.npy` motion files to `motion_data/`

---

### 08: Video to Motion (Optional GVHMR Fallback)

Processes iPhone videos through GVHMR to extract motion data for exercises where text-to-motion fails.

**⚠️ This script must run on the GPU instance (RunPod)**

```bash
# On RunPod: Process single video
python src/08_video_to_motion.py \
  --input videos/burpee.mp4 \
  --output motion_data \
  --slug burpee

# On RunPod: Process batch directory
python src/08_video_to_motion.py \
  --input videos/ \
  --output motion_data

# Preview without saving (testing)
python src/08_video_to_motion.py \
  --input videos/burpee.mp4 \
  --preview
```

**What it does:**
1. **YOLOv8 tracking** - Detects and tracks person through video
2. **Frame cropping** - Crops around person with padding
3. **ViTPose keypoints** - Estimates 2D joint positions
4. **GVHMR inference** - Reconstructs 3D SMPL-H motion
5. **Joint extraction** - Extracts 22 body joints (matches HY-Motion format)
6. **Outputs** - Saves `.npy` files to `motion_data/` with slug naming

**Video recording guidelines:**
- Shoot in landscape orientation
- Wear fitted clothing (better tracking)
- Use solid background (reduces noise)
- Perform one clean rep of the exercise
- Match the target camera angle from pipeline config
- Ensure full body visible throughout movement

**Output format:**
```
motion_data/
├── burpee.npy           # (T, 22, 3) - identical to HY-Motion format
├── pistol-squat.npy
└── ...
```

**Integration with pipeline:**
- GVHMR outputs match HY-Motion's 22-joint format exactly
- Files drop into `motion_data/` with same naming convention
- Rendering pipeline (steps 03-04) works identically for both sources
- Use for complex floor movements or when prompts fail

**Performance:**
- Processing time: ~30-60 seconds per video on A100
- Requires CUDA GPU with YOLOv8 and ViTPose models
- Preprocessed data cached for faster re-runs

**Typical workflow:**
```bash
# 1. Record iPhone videos for difficult exercises
# 2. Upload to RunPod
scp videos/*.mp4 user@runpod:/workspace/videos/

# 3. SSH to RunPod and process
ssh user@runpod
cd /workspace
python src/08_video_to_motion.py --input videos/ --output motion_data

# 4. Download results
exit
scp user@runpod:/workspace/motion_data/*.npy motion_data/

# 5. Continue with normal pipeline (steps 03-04)
python src/03_project_to_2d.py
python src/04_render_webp.py
```

---

### 03: Project to 2D

Converts 3D motion data to 2D screen coordinates with proper normalization.

```bash
python src/03_project_to_2d.py

# With preview (shows ASCII visualization)
python src/03_project_to_2d.py --preview

# Process only first 10 files (testing)
python src/03_project_to_2d.py --limit 10
```

**What it does:**
- Reads `.npy` files from `motion_data/`
- Applies camera angle rotation (from manifest)
- **Calculates global bounding box** across ALL frames (critical!)
- Normalizes to 400x400 canvas with 15% padding
- Establishes consistent Y baseline (feet stay grounded)
- Flips Y axis for screen coordinates
- Saves to `projected/` directory

**Key features:**
- ✅ **Global bounding box** - Character stays centered throughout movement
- ✅ **Consistent baseline** - Feet don't float during jumps
- ✅ **Aspect ratio preserved** - No distortion
- ✅ **Camera angles** - Front, side, 3/4 views from manifest

**Output:**
```
projected/
├── push-up.npy           # (T, 22, 2) - T frames, 22 joints, XY coords
├── squat.npy
└── ...
```

**Preview mode:**
Shows ASCII art visualization of projected motion:
```
Frame 1/60:
+----------------------------------------+
|                                        |
|              ●                         |
|             ●●●                        |
|            ● ● ●                       |
|           ●     ●                      |
|          ●       ●                     |
|                                        |
+----------------------------------------+
```

---

### 04: Render WebP Animations

Draws stick figures and creates animated WebP files.

```bash
python src/04_render_webp.py

# With preview (shows first 5 frames as ASCII art)
python src/04_render_webp.py --preview 5

# Process only first 10 files (testing)
python src/04_render_webp.py --limit 10
```

**What it does:**
- Reads projected 2D data from `projected/`
- Subsamples from 30fps → 15fps
- Draws stick figures:
  - Bones: Dark gray (#374151), 4px width
  - Joints: Blue (#3B82F6), 6px radius
  - Head: 14px radius
- Creates animated WebP with:
  - 400×400px canvas
  - Transparent background (RGBA)
  - Lossless compression
  - Infinite loop

**Output:**
```
output/webp/
├── push-up.webp          # 20-30 KB typical
├── squat.webp            # 25-40 KB typical
└── ...                   # 219 total
```

**File size comparison:**
- WebP: 20-50 KB per animation
- GIF equivalent: 100-200 KB (75-85% larger!)
- Total 219 animations: ~8-12 MB

**Preview mode:**
```
Frame 1/45:
+----------------------------------------+
|                                        |
|                @                       |    ← Head (14px)
|               @@@                      |    ← Shoulders
|              @ @ @                     |    ← Arms
|             @     @                    |    ← Hips
|            @       @                   |    ← Legs
+----------------------------------------+
```

---

### 05: Render Lottie Animations (Alternative to WebP)

Creates vector-based Lottie JSON with aggressive keyframe optimization.

```bash
python src/05_render_lottie.py

# Process only first 10 files (testing)
python src/05_render_lottie.py --limit 10

# Adjust optimization (more aggressive)
python src/05_render_lottie.py --threshold 15.0 --min-displacement 8.0
```

**What it does:**
- Reads projected 2D data from `projected/`
- **Detects keyframes** using direction change analysis
- **Aggressively optimizes** to reduce file size (80-95% keyframe reduction)
- Creates Lottie JSON with:
  - 400×400px canvas
  - Vector-based shapes (infinite scaling)
  - Transparent background
  - Infinite loop
  - Same visual style as WebP

**Output:**
```
output/lottie/
├── push-up.json          # 15-30 KB typical
├── squat.json            # 20-35 KB typical
└── ...                   # 219 total
```

**Keyframe optimization:**
- Only adds keyframes when joint direction changes >10° (configurable)
- Ignores movements <5 pixels (configurable)
- Typical: 60 frames × 22 joints = 1,320 possible keyframes
- Optimized: ~80-200 actual keyframes (85-95% reduction)

**File size comparison:**
- Lottie: 15-30 KB per animation (smallest)
- WebP: 20-50 KB per animation
- GIF: 100-200 KB per animation (largest)
- Total 219 Lottie animations: ~6-8 MB

**When to use Lottie vs WebP:**

**Use Lottie if:**
- ✅ Need smaller file sizes (20-40% smaller than WebP)
- ✅ Want vector graphics (perfect scaling)
- ✅ Need dynamic color customization at runtime
- ✅ Using `lottie-react-native` in mobile app
- ✅ Targeting modern devices

**Use WebP if:**
- ✅ Want maximum compatibility
- ✅ Prefer simpler integration (just an image)
- ✅ Need best render performance (hardware-accelerated)
- ✅ Don't need runtime customization
- ✅ Targeting older devices

**Optimization parameters:**
```bash
# More aggressive (smaller files, fewer keyframes)
--threshold 15.0 --min-displacement 8.0

# Less aggressive (larger files, smoother motion)
--threshold 5.0 --min-displacement 3.0

# Default (balanced)
--threshold 10.0 --min-displacement 5.0
```

**Example output:**
```
🎬 Rendering 219 Lottie animations...
⚙️  Optimization: threshold=10.0°, min_displacement=5.0px
📁 Output: output/lottie

Rendering: 100%|████████████████████| 219/219

============================================================
✅ Rendering complete!
============================================================
📊 Processed: 219 animations
🎞️  Total frames: 13,140
⚡ Keyframe optimization:
   Before: 289,080 keyframes
   After:  28,450 keyframes
   Reduction: 90.2%
💾 Total size: 5,847.3 KB
📦 Average size: 26.7 KB per animation

📁 Output directory: output/lottie
============================================================
```

---

## Complete Pipeline Summary

```bash
# 1. Generate prompts from CSV
python src/01_generate_prompts.py

# 2. Enrich weak prompts (optional)
python src/01b_enrich_prompts.py

# 3. Prepare batch files
python src/02_prepare_batch.py

# [Upload to RunPod, run HY-Motion/GVHMR, download results]

# 4. Project 3D → 2D
python src/03_project_to_2d.py

# 5a. Render WebP animations (recommended for compatibility)
python src/04_render_webp.py

# 5b. Render Lottie animations (alternative, smaller files)
python src/05_render_lottie.py

# 6. QA review (optional but recommended)
python src/06_qa_report.py

# 7. Update CSV with CDN URLs
python src/07_update_csv.py --cdn-base https://cdn.intensely.app --update-both

# 8. Generate output manifest
python src/09_generate_manifest.py --cdn-base https://cdn.intensely.app --include-lottie --pretty
```

**Total time:** ~4-6 hours for 219 exercises (mostly GPU time)
**Output:**
- WebP: 8-12 MB of animated WebP files (best compatibility)
- Lottie: 6-8 MB of JSON files (smaller, vector-based)

---

### 06: QA Review (Optional but Recommended)

Generate interactive HTML report for visual quality inspection.

```bash
python src/06_qa_report.py
```

**Opens:** `output/qa_review.html` in browser

**Features:**
- ✅ Visual grid of all 219 animations
- ✅ Filter by movement pattern, camera angle, status
- ✅ Search by exercise name
- ✅ Mark animations for rework (checkbox)
- ✅ Export rework list as JSON
- ✅ Persistent state (localStorage)
- ✅ Keyboard shortcuts (Ctrl+E, Ctrl+R)

**Filters:**
- Movement Pattern: push, pull, squat, etc.
- Camera Angle: 0°, 45°, 90°, 135°
- Status: All, Rendered, Missing, Needs Rework

**Export format:**
```json
{
  "exported_at": "2024-02-14T12:00:00Z",
  "count": 15,
  "exercises": [
    {
      "slug": "burpee-pull-up",
      "name": "Burpee Pull Up",
      "movement_pattern": "full_body",
      "camera_angle": 45,
      "has_animation": true,
      "prompt_file": "prompts/burpee-pull-up.txt"
    }
  ]
}
```

**Use exported list to:**
1. Regenerate specific animations on RunPod
2. Track quality issues
3. Prioritize rework by movement pattern

---

### Regen Helper: Interactive Rework Triage

Processes rework list from QA tool and helps decide how to fix each exercise.

```bash
# Basic usage (manual prompt editing)
python src/regen_helper.py rework-list-2024-02-14.json

# Enable Claude API for automatic prompt rewriting
python src/regen_helper.py rework-list-2024-02-14.json --use-api

# Resume from checkpoint if interrupted
python src/regen_helper.py rework-list-2024-02-14.json --resume
```

**What it does:**

For each flagged exercise, presents an interactive menu:

1. **Keep current prompt** - Skip regeneration (maybe just a bad run)
2. **Rewrite prompt** - Improve prompt for better text-to-motion
   - Manual entry: You type the new prompt
   - Automatic: Claude API rewrites it
   - Saves to `prompts_regen/` directory
3. **Flag for video** - Add to `to_record.txt` checklist for video-to-motion

**Interactive workflow:**
```
==================================================================
Exercise 15/32
==================================================================
Name: Burpee Pull Up
Slug: burpee-pull-up
Movement Pattern: plyometric
Camera Angle: 45°
Status: ✓ Rendered

Current Prompt:
  A person performing burpee pull up. Start standing, drop to push-up,
  jump feet back, perform push-up, jump feet forward, jump up to pull-up bar.
  (23 words)

What would you like to do?
  1 - Keep current prompt (skip regeneration)
  2 - Rewrite prompt (improve for text-to-motion)
  3 - Flag for video recording (use video-to-motion)
  q - Quit and save progress

Enter choice (1/2/3/q): _
```

**Features:**
- ✅ **Interactive triage** - Decide action for each exercise
- ✅ **Manual editing** - Type new prompts directly
- ✅ **Claude API rewriting** - Automatic prompt improvement
- ✅ **Video flagging** - Creates recording checklist
- ✅ **Checkpointing** - Resume if interrupted (Ctrl+C safe)
- ✅ **Progress tracking** - Shows processed count
- ✅ **Summary report** - Statistics at end

**Output files:**
- `prompts_regen/{slug}.txt` - Rewritten prompts for text-to-motion
- `to_record.txt` - Checklist for video recording
- `.regen_helper_checkpoint.json` - Progress checkpoint (auto-deleted when complete)

**Example to_record.txt:**
```
[ ] Burpee Pull Up (burpee-pull-up) - plyometric @ 45°
[ ] Turkish Get Up (turkish-get-up) - full_body @ 45°
[ ] Pistol Squat (pistol-squat) - squat @ 45°
```

**Claude API prompt rewriting:**

When using `--use-api`, Claude analyzes the current prompt and rewrites it with:
- More specific biomechanical details
- Anatomical terminology
- Joint angles and range of motion
- Clear movement sequence
- Optimized for HY-Motion 1.0

**Example rewrite:**
```
Before (23 words):
  A person performing burpee pull up. Start standing, drop to push-up,
  jump feet back, perform push-up, jump feet forward, jump up to pull-up bar.

After (47 words):
  A person performing burpee pull up. Starting upright, rapidly flex hips
  and knees to place hands on ground, extend legs back to plank position,
  perform push-up with chest to ground, explosively jump feet forward,
  then vertically jump while reaching overhead to grasp bar, pulling body
  up until chin clears bar.
```

**Typical workflow:**
1. Export rework list from QA tool
2. Run regen helper (takes 5-15 minutes for 20-30 exercises)
3. Review outputs:
   - Rewritten prompts → Upload to RunPod, regenerate with HY-Motion
   - Video list → Record videos, process with GVHMR
4. Regenerate QA report to verify improvements

---

## Quality Assurance Workflow

```bash
# 1. Generate QA report
python src/06_qa_report.py

# 2. Open in browser
open output/qa_review.html

# 3. Review animations, check boxes for rework

# 4. Export rework list
# Click "Export Rework List" button
# Saves: rework-list-YYYY-MM-DD.json

# 5. Run interactive rework helper
python src/regen_helper.py rework-list-YYYY-MM-DD.json --use-api

# 6. For rewritten prompts: upload and regenerate
scp prompts_regen/* user@runpod:/workspace/prompts_regen/
# Then regenerate on RunPod with new prompts

# 7. For video recordings: follow checklist
cat to_record.txt
# Record videos, upload, and process with GVHMR

# 8. Download updated animations
./scripts/download_results.sh user@runpod

# 9. Generate new QA report
python src/06_qa_report.py
```

---

### 07: Update CSV with Animation URLs

Updates the exercise_library_master.csv with CDN paths for rendered animations.

```bash
# Update with WebP URLs
python src/07_update_csv.py --cdn-base https://cdn.intensely.app

# Preview changes without saving (dry run)
python src/07_update_csv.py --cdn-base https://cdn.intensely.app --dry-run

# Update with Lottie URLs
python src/07_update_csv.py --cdn-base https://cdn.intensely.app --format lottie

# Update both WebP and Lottie URLs
python src/07_update_csv.py --cdn-base https://cdn.intensely.app --update-both

# Export list of exercises without animations
python src/07_update_csv.py --cdn-base https://cdn.intensely.app --export-missing
```

**What it does:**
- Scans `output/webp/` (or `output/lottie/`) for rendered files
- Constructs CDN URLs for each successfully rendered animation
- Updates `animationUrl` column (or `animationUrlLottie` for Lottie)
- Creates backup of CSV before modifying
- Shows statistics about coverage and missing animations
- Optionally exports list of exercises without animations

**Output:**
```
🎬 Updating Exercise CSV with Animation URLs
============================================================
📄 CSV: data/exercise_library_master.csv
🌐 CDN Base: https://cdn.intensely.app
📦 Format: WEBP

🔍 Scanning for rendered files in output/webp...
   Found 219 rendered animations
💾 Created backup: data/exercise_library_master.csv.backup
✅ Updated CSV: data/exercise_library_master.csv

============================================================
📊 Update Statistics
============================================================
Format: WEBP
Total exercises in CSV: 219
Rendered animations found: 219
URLs updated: 219
URLs already set (unchanged): 0
Not rendered (URL cleared): 0

📈 Coverage: 100.0%

✏️  Sample updated exercises:
   - push-up
   - squat
   - lunge
   - burpee
   - plank
   ... and 214 more
============================================================

🔍 Verifying animationUrl...
   ✅ All 219 URLs valid

📋 Sample URLs:
   https://cdn.intensely.app/animations/push-up.webp
   https://cdn.intensely.app/animations/squat.webp
   https://cdn.intensely.app/animations/lunge.webp

============================================================
✅ Update Complete!
============================================================
💾 CSV updated: data/exercise_library_master.csv
💾 Backup created: data/exercise_library_master.csv.backup

💡 Next steps:
   1. Review the updated CSV
   2. Upload animations to CDN
   3. Deploy updated CSV to production
   4. Test animation loading in mobile app
```

**URL Format:**
- WebP: `{cdn_base}/animations/{slug}.webp`
- Lottie: `{cdn_base}/animations/{slug}.json`

**Example URLs:**
```
https://cdn.intensely.app/animations/push-up.webp
https://cdn.intensely.app/animations/bodyweight-squat.webp
https://cdn.intensely.app/animations/burpee.json
```

**Features:**
- ✅ **Backup creation** - Original CSV backed up before modification
- ✅ **Dry run mode** - Preview changes without saving
- ✅ **Verification** - Validates URL format and extensions
- ✅ **Statistics** - Shows coverage, updates, and missing animations
- ✅ **Missing list export** - Creates text file with exercises needing animations
- ✅ **Dual format support** - Update WebP, Lottie, or both

**CSV Columns:**
- `animationUrl` - WebP animation URL
- `animationUrlLottie` - Lottie JSON URL (optional)

**Typical Workflow:**
```bash
# 1. Render animations
python src/04_render_webp.py
python src/05_render_lottie.py

# 2. Review quality
python src/06_qa_report.py
open output/qa_review.html

# 3. Update CSV (dry run first)
python src/07_update_csv.py \
  --cdn-base https://cdn.intensely.app \
  --update-both \
  --dry-run

# 4. Apply changes
python src/07_update_csv.py \
  --cdn-base https://cdn.intensely.app \
  --update-both

# 5. Upload animations to CDN
aws s3 sync output/webp/ s3://cdn-bucket/animations/ --acl public-read
aws s3 sync output/lottie/ s3://cdn-bucket/animations/ --acl public-read

# 6. Deploy updated CSV to backend
cp data/exercise_library_master.csv ../backend/prisma/seed/
```

---

### 09: Generate Output Manifest

Creates comprehensive manifest with metadata about all rendered animations.

```bash
# Generate manifest with WebP only
python src/09_generate_manifest.py --cdn-base https://cdn.intensely.app

# Include Lottie animations
python src/09_generate_manifest.py \
  --cdn-base https://cdn.intensely.app \
  --include-lottie \
  --pretty

# Custom output path
python src/09_generate_manifest.py \
  --output custom/path/manifest.json \
  --cdn-base https://cdn.intensely.app
```

**What it does:**
- Scans `output/webp/` and `output/lottie/` for rendered files
- Reads WebP files to get frame counts
- Gets file sizes and metadata
- Calculates aggregate statistics
- Constructs CDN URLs for each animation
- Generates comprehensive JSON manifest

**Output:** `output/manifest.json`

**Manifest Structure:**
```json
{
  "version": "1.0.0",
  "generated_at": "2024-02-14T12:00:00.000Z",
  "total_exercises": 219,
  "cdn_base_url": "https://cdn.intensely.app",
  "exercises": {
    "push-up": {
      "slug": "push-up",
      "name": "Push Up",
      "movement_pattern": "push",
      "camera_angle": 90,
      "webp": {
        "path": "output/webp/push-up.webp",
        "url": "https://cdn.intensely.app/animations/push-up.webp",
        "file_size_bytes": 32768,
        "file_size_kb": 32.0,
        "frame_count": 45,
        "format": "webp"
      },
      "lottie": {
        "path": "output/lottie/push-up.json",
        "url": "https://cdn.intensely.app/animations/push-up.json",
        "file_size_bytes": 18432,
        "file_size_kb": 18.0,
        "format": "lottie"
      }
    }
  },
  "statistics": {
    "total_exercises": 219,
    "webp_count": 219,
    "lottie_count": 219,
    "total_webp_size_mb": 9.5,
    "total_lottie_size_mb": 6.8,
    "total_frames": 9855,
    "avg_frames_per_animation": 45.0,
    "movement_patterns": {
      "push": 45,
      "pull": 38,
      "squat": 42
    },
    "camera_angles": {
      "0": 12,
      "45": 115,
      "90": 74,
      "135": 18
    },
    "webp_stats": {
      "min_size_kb": 15.2,
      "max_size_kb": 68.4,
      "avg_size_kb": 43.4
    },
    "lottie_stats": {
      "min_size_kb": 12.1,
      "max_size_kb": 45.2,
      "avg_size_kb": 31.1
    }
  }
}
```

**Features:**
- ✅ **Version tracking** - Semver for manifest format
- ✅ **Timestamp** - When manifest was generated
- ✅ **Frame counts** - Number of frames per WebP animation
- ✅ **File sizes** - Both bytes and KB for each file
- ✅ **CDN URLs** - Full URLs for each animation
- ✅ **Statistics** - Aggregate data for all animations
- ✅ **Movement patterns** - Distribution by pattern
- ✅ **Camera angles** - Distribution by angle
- ✅ **Size stats** - Min/max/avg for each format

**Example Output:**
```
🎬 Generating Animation Manifest
============================================================
Output: output/manifest.json
WebP directory: output/webp
Lottie directory: output/lottie
CDN base URL: https://cdn.intensely.app

📖 Loading source manifest...
   Found 219 exercises in source

🔍 Scanning animation files...
   Found 219 animations

🏗️  Building manifest...
📊 Processing 219 animations...

📊 Calculating statistics...

============================================================
📊 Manifest Statistics
============================================================
Total exercises: 219
WebP animations: 219
Lottie animations: 219

Total WebP size: 9.5 MB
Total Lottie size: 6.8 MB

Total frames: 9855
Average frames per animation: 45.0

WebP file sizes:
  Min: 15.2 KB
  Max: 68.4 KB
  Avg: 43.4 KB

Lottie file sizes:
  Min: 12.1 KB
  Max: 45.2 KB
  Avg: 31.1 KB

Movement patterns:
  full_body: 45
  squat: 42
  push: 45
  pull: 38
  lunge: 27
  plyometric: 22

Camera angles:
  0°: 12
  45°: 115
  90°: 74
  135°: 18
============================================================

💾 Saving manifest to output/manifest.json...
   ✅ Saved (45.2 KB)

============================================================
✅ Manifest Generation Complete!
============================================================
📄 Manifest: output/manifest.json
📊 Exercises: 219
📦 Total size: 16.30 MB

💡 Next steps:
   1. Upload manifest.json to CDN
   2. Use in mobile app for animation metadata
   3. Implement version checking for updates
```

**Use in Mobile App:**

The manifest provides metadata for the mobile app:
- Check which animations are available
- Get frame counts for progress indicators
- Determine optimal format (Lottie vs WebP)
- Check for manifest updates
- Show file sizes to users

**TypeScript Integration:**
```typescript
import { loadManifest, getExerciseAnimation } from '@/types/AnimationManifest';

// Load manifest from CDN
const manifest = await loadManifest('https://cdn.intensely.app');

// Get exercise metadata
const pushUpMeta = getExerciseAnimation(manifest, 'push-up');
console.log(`Frame count: ${pushUpMeta.webp.frame_count}`);
console.log(`File size: ${pushUpMeta.webp.file_size_kb} KB`);
console.log(`CDN URL: ${pushUpMeta.webp.url}`);

// Use in React component
import { useAnimationManifest } from '@/hooks/useAnimationManifest';

function ExerciseScreen({ exercise }) {
  const { getExercise, hasAnimation } = useAnimationManifest();
  const meta = getExercise(exercise.slug);

  if (hasAnimation(exercise.slug)) {
    return (
      <ExerciseAnimation
        slug={exercise.slug}
        frameCount={meta?.webp?.frame_count}
      />
    );
  }
}
```

**Deployment:**
```bash
# 1. Generate manifest
python src/09_generate_manifest.py \
  --cdn-base https://cdn.intensely.app \
  --include-lottie \
  --pretty

# 2. Upload to CDN (with animations)
aws s3 cp output/manifest.json s3://cdn-bucket/animations/manifest.json \
  --acl public-read \
  --cache-control "public, max-age=3600"

# 3. Use in mobile app
# App will automatically load and cache manifest
```

---
