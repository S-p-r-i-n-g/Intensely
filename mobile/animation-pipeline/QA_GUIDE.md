# QA Review Guide

How to use the interactive QA tool for animation review.

## Quick Start

```bash
# Generate QA report
python src/06_qa_report.py

# Open in browser
open output/qa_review.html
```

## Interface Overview

### Header Stats
- **Total Exercises**: 219
- **Rendered**: Number of WebP files created
- **Missing**: Exercises without animations
- **Needs Rework**: Marked for regeneration

### Filters
- **Search**: Filter by exercise name
- **Movement Pattern**: push, pull, squat, lunge, etc.
- **Camera Angle**: 0°, 45°, 90°, 135°
- **Status**: All, Rendered, Missing, Needs Rework

### Grid View
Each card shows:
- Animation preview (looping)
- Exercise name
- Movement pattern badge
- Camera angle badge
- "Enriched" badge (if AI-enhanced)
- File size in KB
- "Needs Rework" checkbox

## What to Look For

### Visual Quality Checks

**Character stays centered:**
```
❌ BAD: Character drifts off-screen during movement
✅ GOOD: Character stays in center, movement visible
```

**Feet stay grounded:**
```
❌ BAD: Feet float during standing phases
✅ GOOD: Consistent baseline, feet touch ground
```

**Smooth motion:**
```
❌ BAD: Jerky transitions, teleporting
✅ GOOD: Smooth interpolation at 15fps
```

**Proper framing:**
```
❌ BAD: Character clipped at edges
✅ GOOD: Full body visible with padding
```

**Correct camera angle:**
```
Push-ups → Side view (90°)
Squats → 3/4 front (45°)
Pull-ups → 3/4 back (135°)
```

### Technical Checks

**File size:**
- ✅ 15-60 KB: Normal
- ⚠️ 60-100 KB: Large but acceptable
- ❌ > 100 KB: Too large, check frame count

**Animation length:**
- ✅ 1-3 seconds: Good for one rep
- ⚠️ 3-5 seconds: Long but ok
- ❌ > 5 seconds: Too long, trim frames

**Transparency:**
- ✅ Clean transparent background
- ❌ White/black background visible

## Common Issues

### Issue: Character clipped at edges
**Cause:** Bounding box too tight
**Fix:** Increase padding in projection step
**Mark for rework:** ✓

### Issue: Floating feet
**Cause:** Y baseline not applied correctly
**Fix:** Verify baseline calculation
**Mark for rework:** ✓

### Issue: Wrong camera angle
**Cause:** Incorrect manifest mapping
**Fix:** Update manifest, reproject
**Mark for rework:** ✓

### Issue: Jerky motion
**Cause:** Poor source motion data
**Fix:** Regenerate with better prompt
**Mark for rework:** ✓

### Issue: Character too small
**Cause:** Padding too large or scale incorrect
**Fix:** Adjust projection normalization
**Mark for rework:** ✗ (batch fix, not individual)

### Issue: Animation missing
**Cause:** Motion generation failed
**Fix:** Check RunPod logs, regenerate
**Mark for rework:** ✓

## Using the Rework List

### 1. Mark Exercises
Click checkboxes for animations that need fixes:
- Visual quality issues
- Wrong camera angle
- Motion artifacts
- Missing animations

### 2. Filter to Review Marked
- Set Status filter to "Needs Rework"
- Double-check all marked items
- Uncheck any false positives

### 3. Export List
Click "📥 Export Rework List" button
- Downloads JSON file
- Includes all marked exercises
- Timestamped filename

### 4. Analyze Export
```bash
cat rework-list-2024-02-14.json | jq '.count'
# Shows number of exercises to rework

cat rework-list-2024-02-14.json | jq '.exercises[].movement_pattern' | sort | uniq -c
# Groups by movement pattern
```

### 5. Prioritize Rework
Common patterns with issues:
```
15 plyometric exercises  → Often need better prompts
8 pull exercises         → Camera angle issues
5 rotation exercises     → Clipping problems
```

## Keyboard Shortcuts

- **Ctrl + E**: Export rework list
- **Ctrl + R**: Reset all filters
- **Spacebar**: Scroll down

## Browser Tips

### View Multiple Angles
Open in multiple windows to compare:
- All push exercises (90° angle)
- All squat exercises (45° angle)
- All pull exercises (135° angle)

### Sort by File Size
Use Status filter + visual scan
- Large files may have too many frames
- Small files may be corrupted

### Compare Enriched vs Original
- Filter to show only enriched
- Check if quality improved
- Mark non-enriched that need better prompts

## Workflow Examples

### Example 1: Review All Push Exercises
```
1. Set Movement Pattern filter: "push"
2. Shows 45 exercises
3. Review each animation
4. Mark 7 for rework (wrong angle, clipping)
5. Export list
```

### Example 2: Find Missing Animations
```
1. Set Status filter: "Missing"
2. Shows 15 exercises
3. All automatically marked for generation
4. Export list for batch processing
```

### Example 3: Check Large Files
```
1. Visual scan for file sizes > 60 KB
2. Review those animations
3. If too long, mark for rework
4. Trim frames during regeneration
```

## After Rework

### Regenerate on RunPod
```bash
# Upload rework list
scp rework-list-*.json user@runpod:/workspace/

# Create targeted batch script
python create_rework_batch.py rework-list-*.json

# Process only flagged exercises
./process_rework.sh

# Download updated files
```

### Update QA Report
```bash
# Regenerate with new animations
python src/06_qa_report.py

# Rework checkboxes persist in browser
# Verify fixes, uncheck resolved items
```

## Tips

**Save frequently:**
- Rework list saves automatically to localStorage
- But export JSON as backup

**Use filters effectively:**
- Narrow down by movement pattern first
- Then review systematically
- Don't try to review all 219 at once

**Watch for patterns:**
- If all "push" exercises have issues → systemic problem
- If random exercises have issues → individual problems

**Document issues:**
- Take notes on common patterns
- Share with team for process improvement

**Quality over speed:**
- Better to mark 20 accurately than 100 randomly
- Regeneration costs time and money

## Export Format Details

```json
{
  "exported_at": "2024-02-14T12:00:00.000Z",
  "count": 15,
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

**Fields:**
- `slug`: Unique identifier, matches filename
- `name`: Human-readable name
- `movement_pattern`: For grouping similar issues
- `camera_angle`: Current angle used
- `has_animation`: Whether WebP exists
- `prompt_file`: Path to regenerate from

## Success Criteria

Before marking pipeline complete:
- [ ] All 219 animations rendered
- [ ] No more than 5% marked for rework
- [ ] All critical exercises reviewed
- [ ] No clipping or major artifacts
- [ ] File sizes reasonable (< 100 KB)
- [ ] Camera angles correct per pattern

---

**Happy reviewing!** 🎬✨
