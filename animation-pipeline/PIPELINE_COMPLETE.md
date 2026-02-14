# Complete Animation Pipeline

End-to-end guide for generating 219 exercise animations.

## Overview

### Primary Path: Text-to-Motion (HY-Motion)

```
CSV Data (219 exercises)
    ↓
01: Generate Prompts (text descriptions)
    ↓
01b: Enrich Prompts [optional] (AI-powered improvement)
    ↓
02: Prepare Batch (individual .txt files + manifest)
    ↓
[Upload to RunPod GPU]
    ↓
HY-Motion 1.0 (text → 3D motion)
    ↓
[Download .npy files]
    ↓
03: Project to 2D (3D → 2D screen coordinates)
    ↓
04: Render WebP (draw stick figures → animated files)
    ↓
Animated WebP (ready for mobile app)
```

### Alternative Path: Video-to-Motion (GVHMR Fallback)

Use when text-to-motion fails for complex exercises:

```
Record iPhone Video
    ↓
[Upload to RunPod GPU]
    ↓
08: Video to Motion (YOLOv8 + ViTPose + GVHMR)
    ↓
[Download .npy files to motion_data/]
    ↓
03: Project to 2D (same as primary path)
    ↓
04: Render WebP (same as primary path)
    ↓
Animated WebP (ready for mobile app)
```

**When to use video fallback:**
- Complex floor movements (burpees, get-ups)
- Obscure or unusual exercises
- When HY-Motion output is poor quality
- When prompt engineering doesn't improve results

## Step-by-Step Instructions

### Phase 1: Local Preparation (5-10 minutes)

```bash
cd animation-pipeline

# 1. Generate prompts from exercise CSV
python src/01_generate_prompts.py
# Output: prompts.json (219 prompts, <55 words each)

# 2. [Optional] Enrich weak prompts with Claude API
export ANTHROPIC_API_KEY='your-key'
python src/01b_enrich_prompts.py
# Output: Updated prompts.json (improved descriptions)

# 3. Prepare batch files for GPU processing
python src/02_prepare_batch.py
# Output: prompts/*.txt (219 files) + manifest.json
```

### Phase 2: Cloud GPU Processing (2-4 hours)

```bash
# 4. Setup RunPod instance
scp scripts/runpod_setup.sh user@runpod:/workspace/
ssh user@runpod
cd /workspace
./runpod_setup.sh --gvhmr  # Full setup

# 5. Upload data from local machine
./scripts/upload_to_runpod.sh user@runpod-instance.com

# 6. Process on RunPod (text-to-motion)
cd /workspace/HY-Motion
source .venv/bin/activate
python /workspace/batch_process_hymotion.py \
    --input /workspace/prompts \
    --output /workspace/motion_data
# Processes 219 prompts → .npy motion files
# Time: ~2-4 hours on A100

# 7. [Optional] Process videos (video-to-motion fallback)
# Use for exercises where text-to-motion failed or quality is poor
cd /workspace
python src/08_video_to_motion.py \
    --input /workspace/videos \
    --output /workspace/motion_data
# Processes videos → .npy motion files (same format as HY-Motion)
# Time: ~30-60 seconds per video on A100

# 8. Download results from local machine
./scripts/download_results.sh user@runpod-instance.com
# Verifies all 219 files, lists missing exercises
```

### Phase 3: Local Rendering (10-20 minutes)

```bash
# 9. Project 3D motion to 2D screen coordinates
python src/03_project_to_2d.py
# Input: motion_data/*.npy (219 files, 3D coordinates)
# Output: projected/*.npy (219 files, 2D coordinates)
# Time: ~5 minutes

# 10a. Render animated WebP stick figures (recommended)
python src/04_render_webp.py
# Input: projected/*.npy
# Output: output/webp/*.webp (219 animations, 8-12 MB)
# Time: ~10 minutes
# Best for: Maximum compatibility, hardware-accelerated rendering

# 10b. Render Lottie JSON animations (alternative)
python src/05_render_lottie.py
# Input: projected/*.npy
# Output: output/lottie/*.json (219 animations, 6-8 MB)
# Time: ~5 minutes
# Best for: Smaller files, vector graphics, dynamic styling
# Note: 80-95% keyframe reduction for optimal performance

# 11. Update CSV with animation URLs
python src/07_update_csv.py \
  --cdn-base https://cdn.intensely.app \
  --update-both
# Updates animationUrl and animationUrlLottie columns
# Creates backup of CSV automatically
# Shows coverage statistics
```

### Phase 4: Deploy to Mobile App

**Option A: WebP (recommended for most apps)**
```bash
# 12. Upload animations to CDN
aws s3 sync output/webp/ s3://your-cdn-bucket/animations/ --acl public-read
# Or use your CDN provider's upload method

# 13. Copy to mobile app assets (if bundling locally)
cp output/webp/*.webp ../mobile/assets/animations/

# 14. Use in mobile app
# Reference via CDN URL from CSV:
import { Image } from 'expo-image';
<Image source={{ uri: exercise.animationUrl }} />

# Or reference locally:
<Image source={require('./assets/animations/push-up.webp')} />
```

**Option B: Lottie (for smaller files and vector graphics)**
```bash
# 12. Upload animations to CDN
aws s3 sync output/lottie/ s3://your-cdn-bucket/animations/ --acl public-read

# 13. Install Lottie dependencies
npm install lottie-react-native lottie-ios@3.4.0
cd ios && pod install && cd ..

# 14. Copy to mobile app assets (if bundling locally)
cp output/lottie/*.json ../mobile/assets/animations/

# 15. Use in app:
import LottieView from 'lottie-react-native';

<LottieView
  source={require('./assets/animations/push-up.json')}
  autoPlay
  loop
  style={{ width: 200, height: 200 }}
/>
```

**Comparison:**
- WebP: Simpler setup, better performance, larger files
- Lottie: Smaller files (25% reduction), vector scaling, dynamic colors

## Video Fallback Workflow

When text-to-motion (HY-Motion) produces poor results for specific exercises, use the video fallback path:

### Step 1: Record Videos Locally

```bash
# Create videos directory
mkdir -p videos

# Record on iPhone:
# - Landscape orientation
# - Fitted clothing (better tracking)
# - Solid background
# - Full body visible
# - One clean rep
# - Match target camera angle from manifest
```

**Camera angle reference:**
```bash
# Check target angle for exercise
cat manifest.json | jq '.exercises["burpee"].camera_angle'
# Output: 45

# Record video at 45° (3/4 front view)
```

### Step 2: Upload to RunPod

```bash
# From local machine
scp videos/*.mp4 user@runpod:/workspace/videos/

# Or use rsync for large batches
rsync -avz --progress videos/ user@runpod:/workspace/videos/
```

### Step 3: Process on GPU

```bash
# SSH to RunPod
ssh user@runpod

# Navigate to workspace
cd /workspace

# Process single video
python src/08_video_to_motion.py \
    --input videos/burpee.mp4 \
    --output motion_data \
    --slug burpee

# Or process entire batch
python src/08_video_to_motion.py \
    --input videos/ \
    --output motion_data

# Check output
ls -lh motion_data/burpee.npy
# Should be ~50-200 KB depending on video length
```

### Step 4: Download and Integrate

```bash
# Download from local machine
scp user@runpod:/workspace/motion_data/burpee.npy motion_data/

# Or download all updated files
./scripts/download_results.sh user@runpod

# Continue with normal pipeline
python src/03_project_to_2d.py
python src/04_render_webp.py

# Check QA report for results
python src/06_qa_report.py
open output/qa_review.html
```

### Video Recording Tips

**Lighting:**
- Even, bright lighting
- Avoid harsh shadows
- Natural light works best

**Framing:**
- Full body visible at all times
- Leave ~20% padding around person
- Keep camera stationary

**Movement:**
- Perform one complete rep
- Controlled pace (not too fast)
- Hold start/end positions briefly

**Clothing:**
- Fitted clothing (not baggy)
- Contrasting colors
- Solid colors (avoid patterns)

**Background:**
- Solid, uncluttered
- Contrasting with clothing
- No other people visible

### Troubleshooting Video Processing

**Person not detected:**
- Improve lighting
- Reduce background clutter
- Wear contrasting clothing
- Re-record with better framing

**Tracking failures:**
- Check for occlusions
- Ensure full body visible
- Avoid motion blur (slower movement)
- Use higher video quality

**Poor motion quality:**
- Record at higher FPS (60fps if possible)
- Ensure smooth, controlled movement
- Check camera stability
- Verify proper camera angle

## File Flow

```
data/exercise_library_master.csv (219 rows)
    ↓
prompts.json (219 prompts)
    ↓
prompts/*.txt (219 text files)
    ↓
motion_data/*.npy (219 files, 3D SMPL-H, ~10 MB)
    ↓
projected/*.npy (219 files, 2D screen coords, ~5 MB)
    ↓
    ├─→ output/webp/*.webp (219 animations, ~8-12 MB)
    └─→ output/lottie/*.json (219 animations, ~6-8 MB, alternative)
```

## Time Estimates

| Phase | Task | Time |
|-------|------|------|
| Prep | Generate prompts | 1 min |
| Prep | Enrich prompts (optional) | 5-10 min |
| Prep | Prepare batch | 1 min |
| Cloud | RunPod setup | 5 min |
| Cloud | Upload data | 2 min |
| Cloud | HY-Motion processing | 2-4 hours |
| Cloud | Download results | 5 min |
| Render | Project to 2D | 5 min |
| Render | Render WebP | 10 min |
| **Total** | | **3-5 hours** |

*95% of time is GPU processing, which can run unattended*

## Cost Estimates

**RunPod GPU:**
- A100 (80GB): $1.89/hr spot, $2.49/hr on-demand
- RTX 4090: $0.44/hr spot, $0.64/hr on-demand
- Recommended: A100 spot instance
- Total cost for 219 exercises: **$4-8**

**Anthropic API (optional enrichment):**
- Claude 3.5 Sonnet: ~$0.001 per prompt
- ~50 weak prompts need enrichment
- Total cost: **~$0.05**

**Total pipeline cost: $4-8**

## Quality Checkpoints

After each phase, verify:

### After prompt generation:
```bash
# Check word counts
cat prompts.json | grep word_count | head -5

# Verify all exercises present
cat prompts.json | grep -o '"[^"]*":' | wc -l
# Should be 219
```

### After GPU processing:
```bash
# Verify file count
ls motion_data/*.npy | wc -l
# Should be 219

# Check file sizes
du -sh motion_data/
# Should be ~8-12 MB

# Run verification script
./scripts/download_results.sh user@runpod
# Shows missing files if any
```

### After projection:
```bash
# Verify file count
ls projected/*.npy | wc -l
# Should be 219

# Test first file
python -c "
import numpy as np
m = np.load('projected/push-up.npy')
print(f'Shape: {m.shape}')  # (T, 22, 2)
print(f'Range: {m.min():.1f} to {m.max():.1f}')  # 0 to 400
assert 0 <= m.min() <= m.max() <= 400
"
```

### After rendering:
```bash
# Verify file count
ls output/webp/*.webp | wc -l
# Should be 219

# Check total size
du -sh output/webp/
# Should be ~8-12 MB

# Test first animation
python -c "
from PIL import Image
img = Image.open('output/webp/push-up.webp')
print(f'Format: {img.format}')  # WEBP
print(f'Size: {img.size}')      # (400, 400)
print(f'Frames: {img.n_frames}') # ~30-60
print(f'Mode: {img.mode}')       # RGBA
"
```

## Troubleshooting

**Missing exercises after GPU processing:**
1. Check `missing_exercises.txt` from download script
2. Upload `reprocess_missing.sh` to RunPod
3. Run reprocessing
4. Download again

**Projection fails:**
- Verify motion_data files are valid: `python -c "import numpy as np; np.load('motion_data/push-up.npy')"`
- Check manifest.json exists
- Ensure projected/ directory created

**Rendering fails:**
- Install Pillow: `pip install Pillow`
- Verify projected files exist and valid
- Check output/webp/ directory permissions

**WebP not supported in app:**
- Ensure using `expo-image` (not React Native Image)
- Update to latest Expo SDK
- Test on physical device (not just simulator)

## Success Criteria

Pipeline is complete when:
- ✅ 219 WebP animations in output/webp/
- ✅ All files < 100 KB
- ✅ Total size ~8-12 MB
- ✅ Animations loop smoothly
- ✅ Characters stay centered
- ✅ Transparent backgrounds
- ✅ 15 FPS playback

## Next Steps

1. **Test in app:** Load one animation to verify rendering
2. **Batch copy:** Copy all 219 files to mobile assets
3. **Update database:** Link animations to exercises
4. **Optimize loading:** Implement lazy loading for better UX
5. **Analytics:** Track which animations are most viewed

---

**Congratulations!** You now have 219 high-quality exercise animations ready for production. 🎉
