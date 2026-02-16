# Video Fallback Guide

When text-to-motion (HY-Motion) fails or produces poor quality animations, use the video fallback path with GVHMR.

## When to Use Video Fallback

### Use video if:
- ✅ Complex floor movements (burpees, turkish get-ups, bear crawls)
- ✅ Unusual or obscure exercises not in typical datasets
- ✅ Multiple movement phases (e.g., "kipping pull-up" with swing)
- ✅ HY-Motion output has artifacts or incorrect movements
- ✅ Prompt engineering doesn't improve results after 2-3 attempts

### Continue with text if:
- ❌ Standard exercises (push-ups, squats, lunges)
- ❌ Simple single-joint movements
- ❌ HY-Motion produces acceptable quality
- ❌ Exercise is well-described in training data

## Quick Start

```bash
# 1. Record video on iPhone (see guidelines below)
# 2. Upload to RunPod
scp videos/burpee.mp4 user@runpod:/workspace/videos/

# 3. SSH and process
ssh user@runpod
cd /workspace
python src/08_video_to_motion.py \
    --input videos/burpee.mp4 \
    --slug burpee \
    --output motion_data

# 4. Download result
exit
scp user@runpod:/workspace/motion_data/burpee.npy motion_data/

# 5. Continue pipeline normally
python src/03_project_to_2d.py
python src/04_render_webp.py
```

## Recording Guidelines

### Equipment
- **Device**: iPhone 12 or newer (better stabilization)
- **Resolution**: 1080p minimum, 4K preferred
- **Frame rate**: 30fps minimum, 60fps preferred
- **Orientation**: Landscape (horizontal)

### Setup

**Lighting:**
- Bright, even lighting
- No harsh shadows
- Natural light + diffused indoor light works best
- Avoid backlighting

**Background:**
- Solid color (white, gray, or light blue)
- Uncluttered, minimal objects
- Good contrast with your clothing
- No other people visible

**Camera placement:**
- Mount on tripod or stable surface
- Keep camera perfectly still (no handheld!)
- Position based on exercise camera angle:
  - **0° (front)**: Directly in front
  - **45° (3/4 front)**: 45° to your front-left or front-right
  - **90° (side)**: Directly to your side
  - **135° (3/4 back)**: 45° to your back-left or back-right

**Distance:**
- Full body visible throughout entire movement
- Leave ~20% padding on all sides
- Not too far (reduces tracking accuracy)
- Not too close (risk of clipping limbs)

### Performer

**Clothing:**
- Fitted clothing (not baggy or loose)
- Solid colors (avoid patterns, logos, text)
- Good contrast with background
- Short sleeves/shorts show joint articulation better

**Movement:**
- Perform **one complete rep** (not multiple)
- Controlled pace (not too fast, not too slow)
- Hold start position for 1 second
- Hold end position for 1 second
- Move smoothly through full range of motion
- Maintain proper form throughout

### Camera Angles by Exercise Type

Reference from `config.json`:

```json
{
  "push": 90,          // Side view (push-ups, planks)
  "pull": 135,         // 3/4 back (pull-ups, rows)
  "squat": 45,         // 3/4 front (squats, lunges)
  "hip_hinge": 45,     // 3/4 front (deadlifts, swings)
  "lunge": 90,         // Side view (lunges, step-ups)
  "rotation": 0,       // Front view (twists, chops)
  "anti-rotation": 0,  // Front view (pallof press)
  "locomotion": 90,    // Side view (walks, crawls)
  "plyometric": 45,    // 3/4 front (jumps, hops)
  "full_body": 45      // 3/4 front (burpees, complexes)
}
```

**How to find the angle:**
```bash
# Check manifest for specific exercise
cat manifest.json | jq '.exercises["burpee"].camera_angle'
# Output: 45

# Record at 45° angle (3/4 front view)
```

## Processing on RunPod

### Single Video

```bash
python src/08_video_to_motion.py \
    --input videos/burpee.mp4 \
    --output motion_data \
    --slug burpee
```

**Output:**
```
📹 Preprocessing video: videos/burpee.mp4
  📊 Video info: 120 frames, 30.0 FPS, 1920x1080
  🎯 Detecting and tracking person...
  🔍 Processing frames: 100%|████████████| 120/120
  ✅ Preprocessed 120 frames
🎬 Running GVHMR inference on 120 frames...
  ✅ Extracted motion: (120, 22, 3)
  📏 Motion range: X=[-0.45, 0.42] m
                   Y=[0.01, 1.68] m
                   Z=[-0.31, 0.28] m
💾 Saved motion data: motion_data/burpee.npy
   Shape: (120, 22, 3)
   Size: 21.1 KB
✨ Done!
```

### Batch Processing

```bash
# Process all videos in directory
python src/08_video_to_motion.py \
    --input videos/ \
    --output motion_data
```

Automatically names output files by video filename (slug).

### Preview Mode

```bash
# Test without saving (check quality first)
python src/08_video_to_motion.py \
    --input videos/burpee.mp4 \
    --preview
```

## Output Format

GVHMR outputs **identical format** to HY-Motion:

```python
motion_data = np.load('motion_data/burpee.npy')
print(motion_data.shape)  # (T, 22, 3)

# T = number of frames (30-120 typical)
# 22 = SMPL-H body joints
# 3 = XYZ coordinates in meters
```

**Joint order matches HY-Motion exactly:**
- 0: Pelvis (root)
- 1-2: Left/Right Hip
- 3,6,9,12: Spine1-4
- 4-5: Left/Right Knee
- 7-8: Left/Right Ankle
- 10-11: Left/Right Foot
- 13-14: Left/Right Collar
- 15: Head
- 16-17: Left/Right Shoulder
- 18-19: Left/Right Elbow
- 20-21: Left/Right Wrist

Files can be mixed freely - pipeline can't tell which source they came from.

## Troubleshooting

### Person Not Detected

**Symptom:** `No person detected in video`

**Solutions:**
- Improve lighting contrast
- Wear contrasting clothing
- Reduce background clutter
- Move camera closer (but keep full body visible)
- Check if performer is too small in frame

### Tracking Failures

**Symptom:** Jumpy or incorrect motion

**Solutions:**
- Ensure full body visible throughout
- Avoid fast, jerky movements
- Check for occlusions (body parts hidden)
- Re-record with better lighting
- Use higher video quality

### Poor Motion Quality

**Symptom:** Motion data looks wrong in QA review

**Solutions:**
- Record at higher FPS (60fps)
- Slow down movement pace
- Ensure proper form (GVHMR learns from good data)
- Check camera angle matches manifest
- Verify camera is perfectly stable

### File Size Issues

**Symptom:** Output `.npy` file is too large (>200KB)

**Solutions:**
- Video is too long - trim to one rep
- Reduce video FPS (30fps is enough)
- GVHMR is capturing too many frames - adjust subsampling

**Symptom:** Output `.npy` file is too small (<20KB)

**Solutions:**
- Video is too short - needs at least 30 frames
- Check if motion was actually captured
- Verify file isn't corrupted

## Quality Checklist

Before accepting video-generated motion:

- [ ] Full body visible throughout entire video
- [ ] Good lighting with minimal shadows
- [ ] Solid, contrasting background
- [ ] Camera angle matches manifest target
- [ ] Performer in fitted clothing
- [ ] One complete rep with holds at start/end
- [ ] No other people or objects in frame
- [ ] Camera perfectly still (no shake)
- [ ] Motion data file 20-200 KB
- [ ] QA review shows smooth, centered animation

## Performance Notes

**Processing time per video:**
- Preprocessing (YOLOv8 + ViTPose): ~10-20 seconds
- GVHMR inference: ~20-40 seconds
- Total: ~30-60 seconds on A100

**GPU requirements:**
- CUDA-enabled GPU (A100, RTX 4090, etc.)
- 8GB+ VRAM for GVHMR
- YOLOv8 and ViTPose models (~2GB total)

**Storage:**
- Raw video: ~50-200 MB (4K, 60fps)
- Preprocessed cache: ~20-50 MB
- Output `.npy`: ~20-200 KB

## Integration with Pipeline

Video-generated motion integrates seamlessly:

1. **Same output format**: (T, 22, 3) SMPL-H joints
2. **Same directory**: `motion_data/` with slug naming
3. **Same projection**: Script 03 works identically
4. **Same rendering**: Script 04 works identically
5. **Same QA**: Appears in QA review like text-generated

You can mix sources freely - some from text, some from video.

## Cost Considerations

**Video vs Text Processing:**
- Text (HY-Motion): ~30-60 seconds per prompt, $0.001-0.01 per exercise
- Video (GVHMR): ~30-60 seconds per video, $0.01-0.02 per exercise (GPU time)

**When to use each:**
- Use text for bulk (low cost, fast at scale)
- Use video for problem cases (higher quality, more control)

**Typical workflow:**
```
1. Generate all 219 with text (HY-Motion)
2. Review QA report
3. Identify 10-20 poor quality animations
4. Re-record those 10-20 as videos
5. Process videos with GVHMR
6. Regenerate QA report
7. Verify improvements
```

**Total cost for 219 exercises:**
- All text: $2-4
- Mixed (200 text + 19 video): $3-5
- All video: $15-30 (not recommended)

## Advanced: Preprocessing Options

The script supports custom preprocessing:

```bash
# Use custom YOLO model
python src/08_video_to_motion.py \
    --input videos/burpee.mp4 \
    --yolo models/yolov8x.pt \
    --output motion_data

# Use custom ViTPose checkpoint
python src/08_video_to_motion.py \
    --input videos/burpee.mp4 \
    --vitpose models/vitpose-h.pth \
    --output motion_data

# Use custom GVHMR checkpoint
python src/08_video_to_motion.py \
    --input videos/burpee.mp4 \
    --model checkpoints/gvhmr_epoch_10.pth \
    --output motion_data
```

## Tips & Best Practices

**Recording:**
- Record multiple takes - choose best one
- Use a tripod or stable surface (never handheld)
- Natural light > artificial light
- Morning/afternoon light is best (softer)
- Record 2-3 extra frames before/after movement

**Processing:**
- Preview first before batch processing
- Process one video to verify setup
- Check QA report after each video
- Keep raw videos as backup

**Quality:**
- Better input = better output
- Spend time on good recording setup
- Don't rush the recording process
- When in doubt, re-record

**Efficiency:**
- Record all videos in one session (consistent setup)
- Upload batch to RunPod (saves time)
- Process overnight (minimize GPU cost)
- Download in bulk with verification script

---

**Remember:** Video fallback is a tool for problem cases, not the primary path. Text-to-motion is faster and cheaper for standard exercises. Use video strategically for the 5-10% of exercises where text fails.
