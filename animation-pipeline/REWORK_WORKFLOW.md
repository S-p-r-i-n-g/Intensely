# Rework Workflow Guide

Complete workflow for identifying and fixing poor quality animations.

## Overview

```
Initial Render (219 exercises)
        ↓
QA Review (06_qa_report.py)
        ↓
Export Rework List
        ↓
Interactive Triage (regen_helper.py)
        ↓
    ┌───┴────┐
    ↓        ↓
Rewritten  Video
Prompts    Recording
    ↓        ↓
Text-to-   Video-to-
Motion     Motion
    ↓        ↓
    └───┬────┘
        ↓
Updated Animations
        ↓
QA Review (verify fixes)
```

## Phase 1: Initial QA Review

### Generate QA Report

```bash
python src/06_qa_report.py
open output/qa_review.html
```

### Review Animations

Look for these issues:

**Visual Quality:**
- ❌ Character drifts off-center
- ❌ Feet float during movement
- ❌ Jerky or unnatural motion
- ❌ Character clipped at edges
- ❌ Wrong camera angle

**Technical:**
- ❌ File size too large (>100 KB)
- ❌ Animation too long (>5 seconds)
- ❌ Missing transparency

### Mark for Rework

Click checkbox on each animation that needs fixes.

**When to mark for rework:**
- Clear visual artifacts
- Incorrect motion
- Wrong camera angle
- Missing animation
- Poor quality (despite good prompt)

**When NOT to mark:**
- Minor imperfections (acceptable quality)
- Just slightly different than expected
- Good enough for launch (can improve later)

### Export Rework List

Click **"📥 Export Rework List"** button.

Downloads: `rework-list-YYYY-MM-DD.json`

**Example output:**
```json
{
  "exported_at": "2024-02-14T12:00:00.000Z",
  "count": 23,
  "exercises": [
    {
      "slug": "burpee-pull-up",
      "name": "Burpee Pull Up",
      "movement_pattern": "plyometric",
      "camera_angle": 45,
      "has_animation": true,
      "prompt_file": "prompts/burpee-pull-up.txt"
    }
  ]
}
```

## Phase 2: Interactive Triage

### Run Regen Helper

```bash
# Basic (manual prompt editing only)
python src/regen_helper.py rework-list-2024-02-14.json

# With Claude API (automatic rewriting)
export ANTHROPIC_API_KEY='your-key'
python src/regen_helper.py rework-list-2024-02-14.json --use-api
```

### Decision Guide

For each exercise, choose:

#### Option 1: Keep Current Prompt

**Choose this when:**
- ✅ Prompt is already good
- ✅ Motion was just a bad generation (random variation)
- ✅ Issue is technical (not prompt-related)
- ✅ Regenerating with same prompt likely to fix it

**Example issues:**
- "Animation looks 90% correct, just slightly off timing"
- "Character is slightly off-center but motion is perfect"
- "File size is large but motion is good"

**Next step:** Regenerate with same prompt on RunPod

#### Option 2: Rewrite Prompt

**Choose this when:**
- ✅ Motion is fundamentally wrong
- ✅ Prompt lacks detail
- ✅ Movement sequence unclear
- ✅ Biomechanics incorrect
- ✅ Standard exercises (not too complex)

**Example issues:**
- "Pull-up motion shows push-up instead"
- "Squat doesn't go deep enough"
- "Jumping motion has no air time"
- "Arms move incorrectly during exercise"

**Manual vs Automatic:**

**Manual (you type):**
- More control
- Faster for simple fixes
- Good if you know exactly what's wrong

**Automatic (Claude API):**
- More detailed and technical
- Uses biomechanical terminology
- Good for complex movements
- You can still review and edit

**Next step:** Regenerate with new prompt on RunPod

#### Option 3: Flag for Video

**Choose this when:**
- ✅ Exercise is too complex for text-to-motion
- ✅ Multiple failed prompt attempts
- ✅ Unusual or obscure movement
- ✅ Floor-based with complex transitions
- ✅ Multiple movement phases

**Example exercises:**
- Turkish get-up (complex floor movement)
- Kipping pull-up (dynamic swing motion)
- Burpee variations (multiple phases)
- Bear crawl (unusual gait pattern)
- Crab walk (backward/inverted)

**Next step:** Record iPhone video and process with GVHMR

### Interactive Session Example

```
==================================================================
Regeneration Helper - Interactive Rework Triage
==================================================================
Rework list: rework-list-2024-02-14.json
Exercises to review: 23
Claude API: Enabled

==================================================================
Exercise 1/23
==================================================================
Name: Burpee Pull Up
Slug: burpee-pull-up
Movement Pattern: plyometric
Camera Angle: 45°
Status: ✓ Rendered

Current Prompt:
  A person performing burpee pull up. Drop down, push-up, jump up, pull-up.
  (12 words)

What would you like to do?
  1 - Keep current prompt (skip regeneration)
  2 - Rewrite prompt (improve for text-to-motion)
  3 - Flag for video recording (use video-to-motion)
  q - Quit and save progress

Enter choice (1/2/3/q): 2

How would you like to rewrite the prompt?
  1 - Manually (you type the new prompt)
  2 - Automatically (Claude API rewrites it)

Enter choice (1/2): 2

🤖 Rewriting prompt with Claude API...

New Prompt:
  A person performing burpee pull up. Starting upright, rapidly flex hips
  and knees to place hands on ground, extend legs back to plank position,
  perform push-up with chest to ground, explosively jump feet forward,
  then vertically jump while reaching overhead to grasp bar, pulling body
  up until chin clears bar.
  (47 words)

Accept this prompt? (y/n): y
✓ Saved to: prompts_regen/burpee-pull-up.txt

[Continue with next exercise...]

==================================================================
Summary
==================================================================
Total exercises in rework list: 23
Processed: 23
Kept current prompt: 5
Rewritten prompts: 15
Flagged for video: 3

📝 Rewritten prompts saved to: prompts_regen/
📹 Video recording checklist: to_record.txt

Next steps:
  1. Upload prompts_regen/ to RunPod
  2. Regenerate with HY-Motion for rewritten prompts
  3. Download and reprocess
  1. Review to_record.txt checklist
  2. Record videos following guidelines
  3. Process with GVHMR
```

## Phase 3A: Regenerate with Rewritten Prompts

### Upload New Prompts to RunPod

```bash
# Upload rewritten prompts
scp prompts_regen/* user@runpod:/workspace/prompts_regen/

# Or use rsync
rsync -avz prompts_regen/ user@runpod:/workspace/prompts_regen/
```

### Regenerate on RunPod

```bash
# SSH to RunPod
ssh user@runpod

# Navigate to workspace
cd /workspace/HY-Motion
source .venv/bin/activate

# Create list of slugs to regenerate
ls /workspace/prompts_regen/ | sed 's/.txt$//' > /workspace/regen_list.txt

# Process only flagged exercises
python batch_process_hymotion.py \
  --input /workspace/prompts_regen \
  --output /workspace/motion_data_regen \
  --file-list /workspace/regen_list.txt

# Takes ~30-60 seconds per exercise
```

### Download and Integrate

```bash
# From local machine
scp user@runpod:/workspace/motion_data_regen/* motion_data/

# Reproject and render
python src/03_project_to_2d.py
python src/04_render_webp.py
python src/05_render_lottie.py
```

## Phase 3B: Record and Process Videos

### Review Recording Checklist

```bash
cat to_record.txt
```

**Example:**
```
[ ] Burpee Pull Up (burpee-pull-up) - plyometric @ 45°
[ ] Turkish Get Up (turkish-get-up) - full_body @ 45°
[ ] Pistol Squat (pistol-squat) - squat @ 45°
```

### Record Videos

Follow **VIDEO_FALLBACK_GUIDE.md** for detailed instructions.

**Key points:**
- Use iPhone in landscape orientation
- Wear fitted, solid-color clothing
- Solid, uncluttered background
- Match camera angle from checklist
- Perform one clean rep
- Hold start/end positions

**Naming:**
```
videos/burpee-pull-up.mp4
videos/turkish-get-up.mp4
videos/pistol-squat.mp4
```

### Upload and Process on RunPod

```bash
# Upload videos
scp videos/*.mp4 user@runpod:/workspace/videos/

# SSH to RunPod
ssh user@runpod
cd /workspace

# Process videos with GVHMR
python src/08_video_to_motion.py \
  --input videos/ \
  --output motion_data

# Download results
exit
scp user@runpod:/workspace/motion_data/*.npy motion_data/

# Reproject and render
python src/03_project_to_2d.py
python src/04_render_webp.py
python src/05_render_lottie.py
```

## Phase 4: Verify Fixes

### Generate New QA Report

```bash
python src/06_qa_report.py
open output/qa_review.html
```

### Review Updated Animations

Filter QA report to show only updated exercises:

1. Open browser console (F12)
2. Run: `localStorage.setItem('reworkList', JSON.stringify(['burpee-pull-up', 'turkish-get-up', ...]))`
3. Set filter: Status → "Needs Rework"
4. Review each updated animation

### Check Quality Improvements

Compare before/after:
- ✅ Motion now correct?
- ✅ Character stays centered?
- ✅ Camera angle correct?
- ✅ File size reasonable?
- ✅ Overall quality acceptable?

### Handle Remaining Issues

If animation still has issues:

1. **Export new rework list** (only remaining bad animations)
2. **Run regen_helper again** with different approach:
   - If tried rewritten prompt → Try video
   - If tried video → Try different video recording
   - If tried both → Mark as acceptable or skip

## Iteration Strategy

### First Iteration (Bulk)
- Focus on clearly broken animations
- Use automatic prompt rewriting (fast)
- Accept "good enough" quality
- Goal: Fix 80% of issues quickly

### Second Iteration (Targeted)
- Focus on critical/popular exercises
- Use manual prompt writing (more control)
- Higher quality bar
- Goal: Polish important exercises

### Third Iteration (Edge Cases)
- Focus on remaining difficult exercises
- Use video recording (highest quality)
- Consider if exercise is needed
- Goal: Handle special cases

## Stopping Criteria

Stop iterating when:
- ✅ <5% of exercises need rework
- ✅ All critical exercises (top 50) are high quality
- ✅ Remaining issues are minor/acceptable
- ✅ Time/cost budget exhausted

Remember: Perfect is the enemy of good. Launch with 95% great animations rather than waiting for 100% perfect.

## Cost & Time Estimates

**Typical rework scenario:** 23 exercises flagged (10% of 219)

### Option A: All Rewritten Prompts
- Triage time: 15 minutes (with Claude API)
- GPU time: 23 × 45s = 17 minutes
- GPU cost: 17min × $0.03/min = $0.51
- Total: ~30 minutes, $0.51

### Option B: All Videos
- Triage time: 10 minutes
- Recording time: 23 × 3min = 69 minutes
- GPU time: 23 × 60s = 23 minutes
- GPU cost: 23min × $0.03/min = $0.69
- Total: ~100 minutes, $0.69

### Option C: Mixed (Realistic)
- 15 rewritten prompts + 5 kept + 3 videos
- Triage time: 15 minutes
- Recording time: 3 × 3min = 9 minutes
- GPU time: (15+5) × 45s + 3 × 60s = 18 minutes
- GPU cost: $0.54
- Total: ~45 minutes, $0.54

## Tips & Best Practices

### During Triage

1. **Start with automatic rewrites** - Faster, often good enough
2. **Be decisive** - Don't overthink, you can iterate
3. **Use checkpoints** - Can take breaks (Ctrl+C safe)
4. **Review summaries** - Check you're on track

### During Prompt Rewriting

1. **Add specific body parts** - "flexing elbows", "extending hips"
2. **Include angles** - "90 degrees", "full extension"
3. **Describe sequence** - "starting... then... finally..."
4. **Mention range of motion** - "until chest touches ground"

### During Video Recording

1. **Batch similar exercises** - Same setup, faster recording
2. **Record extras** - 2-3 takes per exercise
3. **Check preview** - Verify framing before starting
4. **Follow checklist** - Mark off as you complete

### After Rework

1. **Update CSV immediately** - Don't forget this step!
2. **Upload to CDN** - Deploy improvements quickly
3. **Document learnings** - What prompts/approaches work best
4. **Share insights** - Help team understand patterns

## Common Patterns

### Good Prompt Patterns

**Bad (vague):**
```
A person performing push-up. Go down and up.
```

**Good (specific):**
```
A person performing push-up. Starting in plank position with hands
shoulder-width apart, flex elbows to 90° lowering chest to ground,
then extend elbows to return to starting position, maintaining
straight spine throughout.
```

### Exercises That Often Need Video

- Turkish get-up
- Burpee variations
- Bear crawl
- Crab walk
- Kipping pull-up
- Complex yoga poses
- Partner exercises
- Unusual equipment exercises

### Exercises That Usually Work With Prompts

- Basic push-ups
- Squats
- Lunges
- Planks
- Standard pull-ups
- Bicep curls
- Shoulder press
- Common cardio moves

## Troubleshooting

### Problem: Regen helper won't start

**Solution:**
```bash
# Check Python version (need 3.8+)
python --version

# Install dependencies
pip install anthropic

# Check rework list format
cat rework-list-*.json | head -20
```

### Problem: Can't resume from checkpoint

**Solution:**
```bash
# Check checkpoint exists
ls -la .regen_helper_checkpoint.json

# If corrupted, remove and restart
rm .regen_helper_checkpoint.json
python src/regen_helper.py rework-list-*.json
```

### Problem: Claude API not working

**Solution:**
```bash
# Verify API key
echo $ANTHROPIC_API_KEY

# Test API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'

# If fails, regenerate API key at console.anthropic.com
```

### Problem: Videos not processing on RunPod

**Solution:**
```bash
# Check GVHMR setup
ssh user@runpod
cd /workspace
./runpod_setup.sh --gvhmr

# Verify models downloaded
ls models/yolov8x.pt
ls models/vitpose-h.pth

# Test single video
python src/08_video_to_motion.py \
  --input videos/test.mp4 \
  --preview
```

---

**Remember:** Iteration is normal. Most projects require 2-3 rework cycles to reach acceptable quality. Be systematic, track progress, and celebrate improvements!
