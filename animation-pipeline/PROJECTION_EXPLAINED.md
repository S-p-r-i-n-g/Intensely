# 3D to 2D Projection - Technical Explanation

## Overview

The projection pipeline transforms 3D SMPL-H motion data (world coordinates) to 2D screen coordinates (pixels) suitable for rendering stick-figure animations.

## Pipeline Steps

```
3D Motion Data (world space)
    ↓
Camera Rotation (view space)
    ↓
Orthographic Projection (2D world)
    ↓
Global Bounding Box Calculation ← CRITICAL
    ↓
Normalization & Scaling (canvas space)
    ↓
Y-Axis Flip (screen space)
    ↓
2D Screen Coordinates (pixels)
```

## 1. Camera Rotation

**Purpose:** Orient the 3D model to match desired viewing angle

**Method:** Rotation matrix around Y-axis (vertical)

```python
angle = 90°  # Side view for push-ups

# Rotation matrix (Y-axis)
R = [cos(θ)   0   sin(θ)]
    [0        1   0     ]
    [-sin(θ)  0   cos(θ)]

# For 90° side view:
R = [0   0   1]
    [0   1   0]
    [-1  0   0]

# Apply rotation
points_rotated = points_3d @ R.T
```

**Camera angles used:**
- **0° (Front)**: Looking at face, see anterior/posterior
- **45° (3/4 Front)**: Oblique view, see depth
- **90° (Side)**: Profile view, see sagittal plane
- **135° (3/4 Back)**: Rear oblique view

## 2. Orthographic Projection

**Purpose:** Convert 3D to 2D by dropping depth (Z) coordinate

```python
# After rotation, drop Z
points_2d = points_rotated[:, :2]  # Keep only X, Y
```

**Why orthographic?**
- No perspective distortion
- Parallel lines stay parallel
- Consistent scale across depth
- Perfect for exercise demonstrations

## 3. Global Bounding Box (CRITICAL!)

**Purpose:** Keep character centered throughout entire movement

**Problem to solve:**
```
❌ Per-frame normalization (BAD):
Frame 1: ●     [character left]
Frame 2:   ●   [character center]
Frame 3:     ● [character right]
→ Character drifts across screen!

✅ Global normalization (GOOD):
Frame 1:   ●   [character center]
Frame 2:   ●   [character center]
Frame 3:   ●   [character center]
→ Character stays centered!
```

**Algorithm:**
```python
# Collect ALL points from ALL frames
all_points = []
for frame in motion_3d:
    points_2d = project(frame, camera_angle)
    all_points.append(points_2d)

# Stack into single array
all_points = concat(all_points)  # (T*J, 2)

# Calculate global bounds
min_x = all_points[:, 0].min()
max_x = all_points[:, 0].max()
min_y = all_points[:, 1].min()
max_y = all_points[:, 1].max()

# These bounds are used for ALL frames
bbox = {
    'min_x': min_x,
    'max_x': max_x,
    'min_y': min_y,
    'max_y': max_y,
    'width': max_x - min_x,
    'height': max_y - min_y
}
```

## 4. Normalization & Scaling

**Purpose:** Fit content to canvas with padding

**Parameters:**
- Canvas size: 400×400 pixels
- Padding: 15% (60 pixels on each side)
- Usable area: 280×280 pixels

**Algorithm:**
```python
# Calculate scale
padding = 60
usable_size = 400 - 2 * padding  # 280px

# Use larger dimension to maintain aspect ratio
scale = usable_size / max(bbox.width, bbox.height)

# Center of content
center_x = (bbox.min_x + bbox.max_x) / 2
center_y = (bbox.min_y + bbox.max_y) / 2

# Normalize each point
for point in points_2d:
    # 1. Translate to origin
    point.x -= center_x
    point.y -= center_y

    # 2. Scale
    point.x *= scale
    point.y *= scale

    # 3. Translate to canvas center
    point.x += 200  # canvas_center
    point.y += 200
```

**Example:**
```
Original bounds: (-1.5, 1.5) in X and Y → 3.0 units wide/tall
Canvas: 400px with 60px padding → 280px usable
Scale: 280 / 3.0 = 93.3 pixels per unit
```

## 5. Y-Axis Baseline & Flip

**Purpose:** Keep feet grounded and convert to screen coordinates

**Two operations:**

### A. Y Baseline (Grounding)
```python
# Find lowest Y point across ALL frames
y_baseline = all_points[:, 1].min()

# This ensures feet touch the "ground"
# During jumps, feet lift up but never go below baseline
```

### B. Y-Axis Flip
```python
# 3D space: Y+ is up
# Screen space: Y+ is down

# Flip Y coordinate
point.y = -point.y  # Invert

# Then translate to canvas
point.y += 200  # canvas_center
```

**Effect:**
```
3D coordinates:        Screen coordinates:
    +Y ↑                  0,0 ┌─────┐
       │                      │     │
   ────┼──── +X          +Y ↓ │     │ +X →
       │                      └─────┘
    -Y ↓
```

## Complete Example

**Input:** Squat motion, 60 frames, 22 joints

```
Step 1: Load 3D data
  Shape: (60, 22, 3)
  X range: -0.5 to 0.5
  Y range: 0.0 to 1.8
  Z range: -0.3 to 0.3

Step 2: Apply camera rotation (45° 3/4 front)
  Rotate around Y-axis
  New X range: -0.4 to 0.6
  New Y range: 0.0 to 1.8

Step 3: Drop Z (orthographic projection)
  Shape: (60, 22, 2)
  X range: -0.4 to 0.6
  Y range: 0.0 to 1.8

Step 4: Calculate global bounding box
  min_x: -0.4, max_x: 0.6 → width: 1.0
  min_y: 0.0, max_y: 1.8 → height: 1.8
  y_baseline: 0.0

Step 5: Normalize to canvas
  Usable size: 280px
  Scale: 280 / 1.8 = 155.6 px/unit
  Center at (200, 200)

Step 6: Apply to all frames
  Frame 1 pelvis: (200, 80)   ← Standing
  Frame 30 pelvis: (200, 200) ← Bottom of squat
  Frame 60 pelvis: (200, 80)  ← Back to standing

  Character stays centered at X=200!
  Only Y changes during squat motion
```

## Output Validation

**Good projection should have:**
```python
✓ All coordinates in range [0, 400]
✓ Character roughly centered (150-250 in both axes)
✓ Movement visible but character doesn't drift
✓ Feet close to same Y level when grounded
✓ Symmetric exercises are visually symmetric
```

## Common Issues & Solutions

**Problem: Character drifts off-screen**
- ❌ Using per-frame bounding box
- ✅ Use global bounding box across ALL frames

**Problem: Feet float during jumps**
- ❌ No consistent baseline
- ✅ Calculate Y baseline from lowest point

**Problem: Character appears squashed**
- ❌ Different scales for X and Y
- ✅ Use uniform scale (max dimension)

**Problem: Wrong orientation**
- ❌ Camera angle not applied
- ✅ Check manifest for correct angle

## Mathematical Notation

For reference:
```
P₃D ∈ ℝ^(T×J×3)    3D motion data
R ∈ ℝ^(3×3)        Rotation matrix
P₂D ∈ ℝ^(T×J×2)    2D projected points
B = {xₘᵢₙ, xₘₐₓ, yₘᵢₙ, yₘₐₓ}  Bounding box
s ∈ ℝ              Scale factor
c ∈ ℝ²             Canvas center

P₂D[t,j] = normalize(project(P₃D[t,j] · Rᵀ), B, s, c)
```

---

This projection pipeline ensures stable, centered stick-figure animations that accurately represent the 3D motion in 2D space.
