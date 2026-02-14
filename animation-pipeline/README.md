# Exercise Animation Pipeline

AI-powered stick-figure animation generator for 219 bodyweight exercises.

## Project Structure

```
animation-pipeline/
├── src/                    # Numbered pipeline scripts (run in sequence)
├── data/                   # exercise_library_master.csv (source of truth)
├── motion_data/            # SMPL-H .npy files from HY-Motion/GVHMR
├── videos/                 # iPhone video fallbacks for GVHMR
├── output/
│   └── webp/              # Final animated WebP output
├── config.json            # Pipeline settings
├── requirements.txt       # Python dependencies
└── CLAUDE.md             # Full project documentation

```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Add exercise data:**
   - Place `exercise_library_master.csv` in `data/` directory

3. **Run pipeline scripts in sequence:**
   ```bash
   python src/01_generate_prompts.py
   python src/02_process_motion.py
   python src/03_render_animations.py
   ```

## Output Format

- **Animated WebP** (primary): Small file size with transparency
- Target: Intensely mobile app (Expo/React Native with expo-image)
- Canvas: 400×400px, 15fps
- Visual style: Dark gray bones (#374151), blue joints (#3B82F6)

## Pipeline Overview

1. **Text-to-Motion** (HY-Motion 1.0): Primary AI generation
2. **Video-to-Motion** (GVHMR): Fallback for complex movements
3. **2D Projection**: SMPL-H to 2D skeleton with global bounding box
4. **Rendering**: Animated WebP with transparent background

## Camera Angles (by movement pattern)

- Push/Anti-extension → Side (90°)
- Squat/Hip-hinge → 3/4 Front (45°)
- Lunge → Side (90°)
- Pull → 3/4 Back (135°)
- Rotation/Anti-rotation → Front (0°)
- Locomotion → Side (90°)
- Default → 3/4 Front (45°)

## SMPL-H Skeleton (22 joints)

See `config.json` for complete joint and bone definitions.

---

For detailed instructions, see [CLAUDE.md](./CLAUDE.md)
