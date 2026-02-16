# Exercise Animation Pipeline

## What this project does
Generates stick-figure exercise demonstration animations for 219 bodyweight 
exercises using a hybrid AI pipeline. 
1. Primary: HY-Motion 1.0 (AI text-to-motion)
2. Fallback: GVHMR (Video-to-motion) for complex/obscure exercises.
3. Both output identical SMPL-H motion data, which is projected to 2D and rendered as Animated WebP.

## Key files
- `data/exercise_library_master.csv` — Source of truth. 219 exercises, 34 columns.
- `config.json` — Pipeline settings (canvas size, colors, fps, camera angles).
- `src/` — Numbered scripts run in sequence.

## Tech stack & Target
- Python 3.11+ with NumPy, Pillow, pandas, torch.
- HY-Motion 1.0 and GVHMR run on cloud GPUs (RunPod A100/4090).
- Output format: Animated WebP (primary, small file size with transparency).
- Target app: **Intensely**, an Expo / React Native mobile app. We do NOT use Next.js. We will use `expo-image` for high-performance WebP rendering in the app.

## Data model & SMPL-H skeleton
- 22 joints.
- 0:pelvis 1:left_hip 2:right_hip 3:spine1 4:left_knee 5:right_knee 
  6:spine2 7:left_ankle 8:right_ankle 9:spine3 10:left_foot 11:right_foot 
  12:neck 13:left_collar 14:right_collar 15:head 16:left_shoulder 
  17:right_shoulder 18:left_elbow 19:right_elbow 20:left_wrist 21:right_wrist
- Spine: (0,3)(3,6)(6,9)(9,12)(12,15)
- Left arm: (9,13)(13,16)(16,18)(18,20)
- Right arm: (9,14)(14,17)(17,19)(19,21)
- Left leg: (0,1)(1,4)(4,7)(7,10)
- Right leg: (0,2)(2,5)(5,8)(8,11)

## Video Fallback Path (GVHMR)
- If text-to-motion fails for complex floor movements, we record a video.
- Put iPhone videos in `videos/<slug>.mp4`.
- Recording guidelines: Shoot in landscape, wear fitted clothing, use a solid background, perform one clean rep, and match the target camera angle from the pipeline.
- GVHMR extracts SMPL-H joint data matching HY-Motion exactly, dropping `.npy` files into `motion_data/` so the rendering pipeline remains identical.

## Visual style & Projection
- Canvas: 400×400px, transparent background.
- Bones: dark gray (#374151), 4px width. Joints: blue accent (#3B82F6), 6px radius. Head: 14px radius.
- FPS: 15 (subsample from 30fps source).
- Projection MUST calculate a global bounding box across ALL frames of the exercise to keep the character centered. It must establish a fixed Y-baseline so feet do not float during jumping or floor movements.

## Camera angle mapping (by movementPattern)
- push/anti-extension → side (90°)
- squat/hip-hinge → 3/4 front (45°)
- lunge → side (90°)
- pull → 3/4 back (135°)
- rotation/anti-rotation → front (0°)
- locomotion → side (90°)
- Everything else → 3/4 front (45°)