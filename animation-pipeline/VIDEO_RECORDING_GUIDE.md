# Video Recording Guide for GVHMR Processing

## Test Exercises (5 total)

Record these 5 exercises to test the animation pipeline:

1. **Bench Dips** (`bench-dips.mp4`) - Side view (90°)
2. **Bodyweight Squat** (`bodyweight-squat.mp4`) - 3/4 Front view (45°)
3. **Ab Bicycles** (`ab-bicycles.mp4`) - Front view (0°)
4. **Ab Walk-Outs** (`ab-walk-outs.mp4`) - Side view (90°)
5. **Body Weight Curtsy Lunges** (`body-weight-curtsy-lunges.mp4`) - Side view (90°)

## Recording Setup

### Equipment
- iPhone (any recent model)
- Tripod or stable surface
- Good lighting (natural light or bright indoor)
- Solid, uncluttered background

### Camera Settings
- **Orientation:** Landscape (horizontal)
- **Resolution:** 1080p or higher
- **Frame Rate:** 30 fps (default)
- **Format:** .mp4 or .mov (will convert if needed)

## Recording Guidelines

### General Rules
✅ **Wear fitted clothing** - Helps GVHMR detect body movements
✅ **Solid background** - Plain wall, no clutter
✅ **Full body in frame** - Head to feet visible at all times
✅ **One clean rep** - 3-5 seconds per exercise
✅ **Smooth movement** - No jerky motions
✅ **Stable camera** - No camera movement

❌ **Avoid:**
- Baggy/loose clothing
- Busy backgrounds
- Cropping body parts out of frame
- Multiple reps (just one clean rep)
- Shaky camera

### Camera Angles

**Front (0°):**
- Camera directly in front of you
- Face camera, perform movement
- Example: Ab Bicycles

**3/4 Front (45°):**
- Camera at 45° angle to your right
- Slightly angled view showing front and side
- Example: Bodyweight Squat

**Side (90°):**
- Camera perpendicular to your body
- Profile view, left or right side
- Examples: Bench Dips, Ab Walk-Outs, Curtsy Lunges

**3/4 Back (135°):**
- Camera at 135° angle behind you
- Slightly angled view showing back and side
- (Not needed for these 5 exercises)

### Distance from Camera
- Stand **6-8 feet** from camera
- Ensure full body (head to feet) stays in frame throughout
- Leave some space above head and below feet

### Lighting
- Face the light source
- Avoid backlighting (window behind you)
- Even lighting across body
- No harsh shadows

## Step-by-Step Recording

### For Each Exercise:

1. **Set up camera**
   - Position at correct angle
   - Ensure full body in frame
   - Check lighting

2. **Test frame**
   - Do a practice rep
   - Make sure nothing gets cut off
   - Adjust camera if needed

3. **Record**
   - Press record
   - Wait 1 second (standing still)
   - Perform ONE clean, slow rep
   - Return to start position
   - Wait 1 second
   - Stop recording

4. **Review**
   - Watch playback
   - Check: full body visible? Smooth movement? Good lighting?
   - Re-record if needed

5. **Save**
   - Keep filename simple: `exercise-name.mp4`
   - Transfer to computer later

## Exercise-Specific Tips

### 1. Bench Dips (Side view)
- Use a bench or sturdy chair
- Keep camera at side, 6-8 feet away
- One full dip: down and up
- Keep elbows visible

### 2. Bodyweight Squat (3/4 Front)
- Stand at 45° angle to camera
- One full squat: down and up
- Keep head up, chest proud
- Full depth squat

### 3. Ab Bicycles (Front view)
- Lie on ground facing camera
- Camera should be at your feet pointing at you
- One rep = both sides (right elbow to left knee, left elbow to right knee)
- Keep movements controlled

### 4. Ab Walk-Outs (Side view)
- Start standing, camera at side
- One full rep: walk out to plank, walk back, stand
- Keep entire body in frame when in plank

### 5. Body Weight Curtsy Lunges (Side view)
- Face perpendicular to camera
- One rep = step back to curtsy, return
- Show full range of motion
- Keep movements slow

## After Recording

### File Naming
Rename videos to match exact slugs:
```
bench-dips.mp4
bodyweight-squat.mp4
ab-bicycles.mp4
ab-walk-outs.mp4
body-weight-curtsy-lunges.mp4
```

### File Organization
Create `videos/` directory in animation-pipeline:
```
animation-pipeline/
└── videos/
    ├── bench-dips.mp4
    ├── bodyweight-squat.mp4
    ├── ab-bicycles.mp4
    ├── ab-walk-outs.mp4
    └── body-weight-curtsy-lunges.mp4
```

### Transfer to Computer
- AirDrop to Mac
- Or use Photos → Export
- Place in `animation-pipeline/videos/` directory

## Quality Checklist

Before processing, verify each video:
- [ ] Full body visible entire time
- [ ] Correct camera angle
- [ ] Good lighting, no harsh shadows
- [ ] Smooth, clean movement
- [ ] 3-5 seconds duration
- [ ] Fitted clothing visible
- [ ] Solid background
- [ ] Correct filename (matches slug)

## Next Steps

Once you have all 5 videos:
1. Transfer to `animation-pipeline/videos/` directory
2. Set up GPU instance for GVHMR processing
3. Run `python3 src/08_video_to_motion.py`
4. Render animations
5. Upload to Vercel Blob

---

**Estimated Time:** 30-45 minutes to record all 5 videos (including setup)

**Ready to record?** Follow the guidelines above and you'll have great source material for GVHMR processing!
