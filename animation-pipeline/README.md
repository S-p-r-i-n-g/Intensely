# Exercise Animation Pipeline

AI-powered pipeline that generates stick-figure exercise animations for 219 bodyweight exercises. It ingests a CSV of exercises, uses cloud-GPU AI models to produce 3D motion data, projects that data to 2D, and renders lightweight **Animated WebP** (and optionally **Lottie JSON**) files for use in the Intensely mobile app.

---

## How It Works

```
exercise_library_master.csv
         │
         ▼
 [01] Generate Prompts          ← Reads CSV, produces ≤55-word motion descriptions
         │
         ▼
[01b] Enrich Prompts (optional) ← Claude API rewrites weak prompts with biomechanical detail
         │
         ▼
 [02] Prepare Batch             ← Splits prompts into per-exercise .txt files + manifest.json
         │
         ▼
  ┌──────┴──────────────────────────────────┐
  │         Cloud GPU (RunPod A100)         │
  │                                         │
  │  [HY-Motion 1.0]  ←── primary path      │
  │  Text → 3D SMPL-H motion (.npy)         │
  │                                         │
  │  [GVHMR]  ←── fallback path             │
  │  iPhone video → 3D SMPL-H motion (.npy) │
  └──────┬──────────────────────────────────┘
         │  motion_data/*.npy  (T × 22 × 3)
         ▼
 [03] Project to 2D             ← Camera rotation, global bounding box, Y-baseline
         │  projected/*.npy  (T × 22 × 2)
         ▼
 [04] Render WebP               ← Draws stick figures → animated WebP (transparent bg)
 [05] Render Lottie  (alt)      ← Vector JSON with aggressive keyframe optimization
         │
         ▼
 [06] QA Report                 ← Interactive HTML grid for visual review + rework export
         │
         ▼
 [regen_helper] (optional)      ← Interactive triage: rewrite prompts or flag for video
         │
         ▼
 [07] Update CSV                ← Writes CDN URLs into exercise_library_master.csv
         │
         ▼
 [09] Generate Manifest         ← Creates output/manifest.json with metadata + statistics
```

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| AI text-to-motion | **HY-Motion 1.0** (Tencent-Hunyuan) | Primary path; runs on RunPod A100/4090 |
| AI video-to-motion | **GVHMR** + YOLOv8 + ViTPose | Fallback for complex movements |
| 3D body model | **SMPL-H** | 22 joints, standard in motion research |
| Python runtime | **Python 3.11+** | NumPy, Pillow, pandas, PyTorch, OpenCV |
| Prompt enrichment | **Claude API** (Anthropic) | Optional; rewrites weak prompts |
| Cloud GPU | **RunPod** | A100 or 4090; ~$0.34/hr spot |
| Output (primary) | **Animated WebP** | 20–50 KB/file, transparent bg, hardware-decoded |
| Output (alt) | **Lottie JSON** | 15–30 KB/file, vector, runtime color control |
| Target app | **Intensely** (Expo / React Native) | Uses `expo-image` for WebP |

---

## Prerequisites

- Python 3.11+
- An Anthropic API key (only needed for optional prompt enrichment in step 01b)
- A RunPod account with access to an A100 or 4090 instance (for HY-Motion/GVHMR)
- `rsync` and `ssh` for transferring files to/from RunPod

---

## Setup

```bash
# Clone / navigate into the pipeline directory
cd animation-pipeline

# Install local Python dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
# Edit .env:  ANTHROPIC_API_KEY=sk-ant-...
```

---

## Directory Structure

```
animation-pipeline/
├── src/                        # Numbered pipeline scripts (run in sequence)
│   ├── 01_generate_prompts.py
│   ├── 01b_enrich_prompts.py
│   ├── 02_prepare_batch.py
│   ├── 03_project_to_2d.py
│   ├── 04_render_webp.py
│   ├── 05_render_lottie.py
│   ├── 06_qa_report.py
│   ├── 07_update_csv.py
│   ├── 08_video_to_motion.py   # GVHMR fallback (runs on RunPod)
│   ├── 09_generate_manifest.py
│   └── regen_helper.py         # Interactive QA rework triage
│
├── data/
│   └── exercise_library_master.csv   # Source of truth — 219 exercises, 34 columns
│
├── prompts/                    # Per-exercise motion prompt text files (step 02 output)
├── videos/                     # iPhone video fallbacks for GVHMR
├── motion_data/                # SMPL-H .npy files from HY-Motion or GVHMR
├── projected/                  # 2D-projected .npy files (step 03 output)
│
├── output/
│   ├── webp/                   # Final animated WebP files
│   ├── lottie/                 # Final Lottie JSON files
│   ├── manifest.json           # Output manifest with metadata
│   └── qa_review.html          # Interactive QA review page
│
├── scripts/
│   ├── runpod_setup.sh         # Bootstrap a RunPod GPU instance
│   ├── upload_to_runpod.sh     # Upload prompts/videos to RunPod
│   ├── download_results.sh     # Download + verify .npy results
│   └── download_from_runpod.sh # Simple rsync download helper
│
├── config.json                 # Pipeline settings (canvas, colors, FPS, camera angles)
├── requirements.txt
├── .env.example
├── prompts.json                # Aggregated prompts (step 01/01b output)
└── manifest.json               # Batch manifest (step 02 output)
```

---

## Full Pipeline Walkthrough

### Step 1 — Generate Prompts

Reads `data/exercise_library_master.csv` and creates a short motion description (≤55 words) for every exercise, using the exercise name, movement pattern, and muscle group metadata.

```bash
python src/01_generate_prompts.py
```

**Output:** `prompts.json`

---

### Step 1b — Enrich Prompts *(optional but recommended)*

Flags prompts that are too short (<15 words) or missing body-part references, then calls the Claude API to rewrite them with biomechanical detail optimized for HY-Motion 1.0.

```bash
export ANTHROPIC_API_KEY='sk-ant-...'
python src/01b_enrich_prompts.py
```

- Saves a checkpoint every 5 enrichments — safe to interrupt with Ctrl+C and resume
- Run again to continue from where it left off
- ~200 prompts processed in 3–4 minutes at ~$0.20 total API cost

**Output:** `prompts.json` (updated in-place)

---

### Step 2 — Prepare Batch

Splits `prompts.json` into individual `prompts/<slug>.txt` files and generates `manifest.json` with camera angles and metadata for each exercise.

```bash
python src/02_prepare_batch.py
```

**Output:** `prompts/` directory + `manifest.json`

---

### Cloud GPU Step — Run HY-Motion 1.0 on RunPod

This is the compute-intensive step. HY-Motion 1.0 converts each text prompt into a 3D SMPL-H motion sequence.

#### 1. Provision a RunPod instance

Use an A100 or 4090. Connect via SSH.

#### 2. Bootstrap the instance

```bash
# From your local machine
scp scripts/runpod_setup.sh user@runpod:/workspace/

# SSH in and run setup
ssh user@runpod
cd /workspace
./runpod_setup.sh          # HY-Motion only
# or
./runpod_setup.sh --gvhmr  # HY-Motion + GVHMR (video fallback)
```

The setup script is idempotent — it skips already-completed steps and is safe to re-run.

#### 3. Upload prompt files

```bash
# From your local machine
rsync -avz --progress prompts/ user@runpod:/workspace/prompts/
```

#### 4. Run batch processing

```bash
# On RunPod
cd /workspace/HY-Motion
source .venv/bin/activate
python /workspace/batch_process_hymotion.py \
  --input /workspace/prompts \
  --output /workspace/motion_data
```

**Estimated time:** ~30–60 seconds per exercise on A100; ~2–4 hours for 219 exercises.

#### 5. Download results

```bash
# From your local machine
./scripts/download_results.sh user@runpod-instance.com
```

The download script verifies file count against the manifest, identifies missing slugs, and generates a `reprocess_missing.sh` helper for any gaps.

**Output:** `motion_data/<slug>.npy` — shape `(T, 22, 3)` — T frames, 22 SMPL-H joints, XYZ coordinates.

---

### Cloud GPU Step (Fallback) — GVHMR Video-to-Motion

For exercises where text-to-motion produces poor results (complex floor movements, multi-step sequences), record an iPhone video and use GVHMR to extract equivalent motion data.

**Video recording guidelines:**
- Landscape orientation, fitted clothing, solid background
- One clean, complete rep of the exercise
- Full body visible throughout; match the target camera angle from `config.json`

```bash
# Put iPhone videos in videos/<slug>.mp4, then upload
rsync -avz --progress videos/ user@runpod:/workspace/videos/

# On RunPod — process single video
python src/08_video_to_motion.py \
  --input videos/burpee.mp4 \
  --output motion_data \
  --slug burpee

# Or process a whole directory
python src/08_video_to_motion.py \
  --input videos/ \
  --output motion_data
```

GVHMR runs YOLOv8 tracking → ViTPose keypoints → GVHMR 3D reconstruction. Output is `motion_data/<slug>.npy` in the exact same `(T, 22, 3)` format as HY-Motion — the downstream steps are identical.

---

### Step 3 — Project to 2D

Converts 3D motion data to 2D screen coordinates for the target canvas.

```bash
python src/03_project_to_2d.py

# Options
python src/03_project_to_2d.py --preview   # ASCII visualization
python src/03_project_to_2d.py --limit 10  # Process first 10 (for testing)
```

Key behaviors:
- Applies camera angle rotation from `manifest.json` (see Camera Angles section)
- Computes a **global bounding box** across all frames so the character stays centered through the entire movement
- Establishes a **fixed Y baseline** so feet don't float during jumps or floor transitions
- Normalizes to the 400×400 canvas with 15% padding

**Output:** `projected/<slug>.npy` — shape `(T, 22, 2)` — XY screen coordinates per joint per frame.

---

### Step 4 — Render WebP Animations *(primary)*

Draws stick figures frame-by-frame and encodes as animated WebP.

```bash
python src/04_render_webp.py

# Options
python src/04_render_webp.py --preview 5   # Show ASCII preview of first 5 frames
python src/04_render_webp.py --limit 10    # Process first 10 only
```

Visual style (configured in `config.json`):
- Canvas: 400×400px, transparent RGBA background
- Bones: dark gray `#374151`, 4px width
- Joints: blue `#3B82F6`, 6px radius
- Head: 14px radius
- FPS: 15 (subsampled from 30fps source)
- Lossless compression, infinite loop

**Output:** `output/webp/<slug>.webp` — typically 20–50 KB per file; ~8–12 MB total.

---

### Step 5 — Render Lottie Animations *(alternative)*

Creates vector-based Lottie JSON with aggressive keyframe optimization.

```bash
python src/05_render_lottie.py

# Adjust optimization aggressiveness
python src/05_render_lottie.py --threshold 10.0 --min-displacement 5.0  # default
python src/05_render_lottie.py --threshold 15.0 --min-displacement 8.0  # more aggressive
python src/05_render_lottie.py --threshold 5.0  --min-displacement 3.0  # smoother
```

Keyframe optimization: only adds a keyframe when a joint changes direction by more than the threshold angle, reducing 60 frames × 22 joints = 1,320 possible keyframes down to ~80–200 actual keyframes (~90% reduction).

**Output:** `output/lottie/<slug>.json` — typically 15–30 KB per file; ~6–8 MB total.

#### WebP vs Lottie — when to use which

| | WebP | Lottie |
|---|---|---|
| File size | 20–50 KB | 15–30 KB |
| Graphics type | Raster | Vector (infinite scaling) |
| Compatibility | Maximum | Requires `lottie-react-native` |
| Render performance | Best (hardware decoded) | Good |
| Runtime color control | No | Yes |
| Recommendation | **Default** | If you need smaller files or vector scaling |

---

### Step 6 — QA Review

Generates an interactive HTML report for visual inspection.

```bash
python src/06_qa_report.py
open output/qa_review.html
```

Features:
- Visual grid of all animations
- Filter by movement pattern, camera angle, or status
- Search by name
- Checkbox to mark animations for rework
- Export flagged animations as a JSON rework list

---

### Rework Triage *(after QA)*

Interactive helper for deciding how to fix flagged animations.

```bash
python src/regen_helper.py rework-list-YYYY-MM-DD.json
# Or with Claude API for automatic prompt rewriting
python src/regen_helper.py rework-list-YYYY-MM-DD.json --use-api
```

For each flagged exercise, prompts you to:
1. **Keep** the current prompt (skip; maybe just a bad generation run)
2. **Rewrite** the prompt (manual entry or automatic via Claude API)
3. **Flag for video** (adds to `to_record.txt` checklist for GVHMR)

Outputs: rewritten prompts in `prompts_regen/`, a video recording checklist in `to_record.txt`.

---

### Step 7 — Update CSV with CDN URLs

Writes animation URLs back into `exercise_library_master.csv`.

```bash
# Dry run first
python src/07_update_csv.py \
  --cdn-base https://cdn.intensely.app \
  --update-both \
  --dry-run

# Apply
python src/07_update_csv.py \
  --cdn-base https://cdn.intensely.app \
  --update-both
```

Automatically creates a `.backup` of the CSV before modifying. URL format: `{cdn_base}/animations/{slug}.webp` and `{cdn_base}/animations/{slug}.json`.

---

### Step 9 — Generate Output Manifest

Creates a comprehensive JSON manifest with metadata for all rendered animations.

```bash
python src/09_generate_manifest.py \
  --cdn-base https://cdn.intensely.app \
  --include-lottie \
  --pretty
```

**Output:** `output/manifest.json` — includes CDN URLs, frame counts, file sizes, movement pattern distribution, camera angle distribution, and aggregate statistics.

---

## Camera Angles

Camera angle is determined automatically from each exercise's `movementPattern` field in the CSV.

| Movement Pattern | Camera Angle | View |
|---|---|---|
| push, anti-extension | 90° | Side |
| squat, hip-hinge | 45° | 3/4 Front |
| lunge | 90° | Side |
| pull | 135° | 3/4 Back |
| rotation, anti-rotation | 0° | Front |
| locomotion | 90° | Side |
| *(default)* | 45° | 3/4 Front |

---

## SMPL-H Skeleton Reference

22 joints. This is the data format output by both HY-Motion 1.0 and GVHMR.

```
Index  Joint           Connections
  0    pelvis          → 1, 2, 3
  1    left_hip        → 4
  2    right_hip       → 5
  3    spine1          → 6
  4    left_knee       → 7
  5    right_knee      → 8
  6    spine2          → 9
  7    left_ankle      → 10
  8    right_ankle     → 11
  9    spine3          → 12, 13, 14
 10    left_foot
 11    right_foot
 12    neck            → 15
 13    left_collar     → 16
 14    right_collar    → 17
 15    head
 16    left_shoulder   → 18
 17    right_shoulder  → 19
 18    left_elbow      → 20
 19    right_elbow     → 21
 20    left_wrist
 21    right_wrist

Bone groups (as [parent, child] pairs):
  Spine:      (0,3)(3,6)(6,9)(9,12)(12,15)
  Left arm:   (9,13)(13,16)(16,18)(18,20)
  Right arm:  (9,14)(14,17)(17,19)(19,21)
  Left leg:   (0,1)(1,4)(4,7)(7,10)
  Right leg:  (0,2)(2,5)(5,8)(8,11)
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full deployment guide, including:
- CDN hosting options (AWS S3/CloudFront, Cloudflare R2, Vercel Blob)
- Cache header configuration
- Backend CSV seeding
- Rollback procedure
- Cost estimates (~$0/month on Cloudflare R2 vs ~$400/month on CloudFront at 1M views)

**Quick CDN upload:**
```bash
# AWS S3
aws s3 sync output/webp/ s3://your-bucket/animations/ \
  --acl public-read \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "image/webp"

# Cloudflare R2 (via rclone)
rclone sync output/webp/ cloudflare:intensely-cdn/animations/
```

---

## Complete Pipeline — Quick Reference

```bash
# Local machine

python src/01_generate_prompts.py
python src/01b_enrich_prompts.py          # optional
python src/02_prepare_batch.py

# --- RunPod (cloud GPU) ---
scp scripts/runpod_setup.sh user@runpod:/workspace/
ssh user@runpod "cd /workspace && ./runpod_setup.sh"
rsync -avz prompts/ user@runpod:/workspace/prompts/
ssh user@runpod "cd /workspace/HY-Motion && source .venv/bin/activate && \
  python /workspace/batch_process_hymotion.py --input /workspace/prompts --output /workspace/motion_data"
./scripts/download_results.sh user@runpod
# --- end RunPod ---

python src/03_project_to_2d.py
python src/04_render_webp.py
python src/05_render_lottie.py            # optional

python src/06_qa_report.py && open output/qa_review.html
# Review, export rework list if needed
python src/regen_helper.py rework-list-*.json --use-api    # optional

python src/07_update_csv.py --cdn-base https://cdn.intensely.app --update-both
python src/09_generate_manifest.py --cdn-base https://cdn.intensely.app --include-lottie --pretty

# Upload to CDN, seed backend database
```

**Estimated total time:** 4–6 hours (mostly GPU processing). **Estimated cost:** ~$1.50 RunPod + ~$0.20 Claude API per full 219-exercise run.
