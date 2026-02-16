# Projected 2D Motion Data

This directory contains 2D screen coordinates projected from 3D SMPL-H motion data.

## What's in these files?

Each `.npy` file contains:
- **Shape**: `(T, J, 2)` where:
  - `T` = Number of frames (typically 30-90 frames)
  - `J` = Number of joints (22 for SMPL-H)
  - `2` = X, Y screen coordinates
- **Data type**: `float32`
- **Coordinate system**: Screen coordinates (0, 0) = top-left, values in pixels
- **Range**: 0 to 400 (for 400x400 canvas)

## Projection Details

### Camera Angles
Based on movement pattern from manifest:
- **Front (0°)**: Rotation/anti-rotation exercises
- **3/4 Front (45°)**: Squats, hip-hinges, most exercises
- **Side (90°)**: Push-ups, lunges, locomotion
- **3/4 Back (135°)**: Pull exercises

### Global Bounding Box (CRITICAL)
- Calculated across **ALL frames** of each exercise
- Ensures character stays centered throughout movement
- Prevents drift or clipping during dynamic movements

### Normalization
- Fits 400x400px canvas with 15% padding
- Maintains aspect ratio
- Uniform scaling (no distortion)

### Y-Axis Handling
- **Y baseline established** from lowest point (feet) across all frames
- **Y-axis flipped** for screen coordinates (down = positive)
- Feet stay grounded, no floating

## Example Usage

```python
import numpy as np

# Load projected motion
motion_2d = np.load('projected/push-up.npy')

print(f"Shape: {motion_2d.shape}")  # (60, 22, 2)
print(f"Frames: {motion_2d.shape[0]}")
print(f"Joints: {motion_2d.shape[1]}")

# Get first frame
frame_1 = motion_2d[0]  # (22, 2)

# Get pelvis position (joint 0) across all frames
pelvis_trajectory = motion_2d[:, 0, :]  # (T, 2)

# Check coordinate range
print(f"X range: {motion_2d[:, :, 0].min():.1f} to {motion_2d[:, :, 0].max():.1f}")
print(f"Y range: {motion_2d[:, :, 1].min():.1f} to {motion_2d[:, :, 1].max():.1f}")
```

## Verification

Check if projection is correct:

```python
import numpy as np

motion = np.load('projected/squat.npy')

# Should be within canvas bounds (0-400)
assert motion.min() >= 0, "Coordinates below 0!"
assert motion.max() <= 400, "Coordinates above 400!"

# Should have reasonable center of mass
center_of_mass = motion.mean(axis=1)  # (T, 2) - avg across joints
canvas_center = 200

# Character should be roughly centered
assert abs(center_of_mass[:, 0].mean() - canvas_center) < 50, "Not horizontally centered"
assert abs(center_of_mass[:, 1].mean() - canvas_center) < 50, "Not vertically centered"

print("✓ Projection looks good!")
```

## Next Step

These files are used by `04_render_animations.py` to draw stick figures and create animated WebP files.
