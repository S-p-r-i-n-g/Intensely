#!/usr/bin/env python3
"""
Generate Synthetic Motion Data for Pipeline Testing

Creates simple animated motion data for 5 test exercises.
Output format matches SMPL-H 22-joint structure from GVHMR.

Usage:
    python scripts/generate_synthetic_motion.py
"""

import numpy as np
from pathlib import Path

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "motion_data"
OUTPUT_DIR.mkdir(exist_ok=True)

# SMPL-H 22 body joints (matching config.json)
JOINTS = {
    0: "pelvis",
    1: "left_hip", 2: "right_hip",
    3: "spine1",
    4: "left_knee", 5: "right_knee",
    6: "spine2",
    7: "left_ankle", 8: "right_ankle",
    9: "spine3",
    10: "left_foot", 11: "right_foot",
    12: "neck",
    13: "left_collar", 14: "right_collar",
    15: "head",
    16: "left_shoulder", 17: "right_shoulder",
    18: "left_elbow", 19: "right_elbow",
    20: "left_wrist", 21: "right_wrist"
}


def create_base_pose():
    """Create T-pose as base (standing position)."""
    pose = np.zeros((22, 3), dtype=np.float32)

    # Spine (vertical, centered at origin)
    pose[0] = [0.0, 0.0, 0.0]      # pelvis
    pose[3] = [0.0, 0.2, 0.0]      # spine1
    pose[6] = [0.0, 0.4, 0.0]      # spine2
    pose[9] = [0.0, 0.6, 0.0]      # spine3
    pose[12] = [0.0, 0.75, 0.0]    # neck
    pose[15] = [0.0, 0.85, 0.0]    # head

    # Left leg
    pose[1] = [-0.1, 0.0, 0.0]     # left_hip
    pose[4] = [-0.1, -0.4, 0.0]    # left_knee
    pose[7] = [-0.1, -0.8, 0.0]    # left_ankle
    pose[10] = [-0.1, -0.85, 0.1]  # left_foot

    # Right leg
    pose[2] = [0.1, 0.0, 0.0]      # right_hip
    pose[5] = [0.1, -0.4, 0.0]     # right_knee
    pose[8] = [0.1, -0.8, 0.0]     # right_ankle
    pose[11] = [0.1, -0.85, 0.1]   # right_foot

    # Left arm
    pose[13] = [-0.15, 0.6, 0.0]   # left_collar
    pose[16] = [-0.35, 0.6, 0.0]   # left_shoulder
    pose[18] = [-0.55, 0.6, 0.0]   # left_elbow
    pose[20] = [-0.75, 0.6, 0.0]   # left_wrist

    # Right arm
    pose[14] = [0.15, 0.6, 0.0]    # right_collar
    pose[17] = [0.35, 0.6, 0.0]    # right_shoulder
    pose[19] = [0.55, 0.6, 0.0]    # right_elbow
    pose[21] = [0.75, 0.6, 0.0]    # right_wrist

    return pose


def generate_bench_dips(frames=90):
    """Generate dip movement (up and down)."""
    motion = np.zeros((frames, 22, 3), dtype=np.float32)
    base_pose = create_base_pose()

    for i in range(frames):
        t = i / frames
        # Sinusoidal up/down motion
        phase = np.sin(t * 2 * np.pi * 2)  # 2 full cycles

        pose = base_pose.copy()

        # Lower body position during dip
        y_offset = -0.2 * (phase * 0.5 + 0.5)  # 0 to -0.2
        pose[:, 1] += y_offset

        # Bend elbows during down phase
        elbow_bend = 0.15 * (phase * 0.5 + 0.5)
        pose[18, 1] -= elbow_bend  # left elbow
        pose[19, 1] -= elbow_bend  # right elbow
        pose[20, 1] -= elbow_bend * 1.5  # left wrist
        pose[21, 1] -= elbow_bend * 1.5  # right wrist

        motion[i] = pose

    return motion


def generate_bodyweight_squat(frames=90):
    """Generate squat movement (down and up)."""
    motion = np.zeros((frames, 22, 3), dtype=np.float32)
    base_pose = create_base_pose()

    for i in range(frames):
        t = i / frames
        phase = np.sin(t * 2 * np.pi * 2)  # 2 squats

        pose = base_pose.copy()

        # Squat depth
        squat_depth = 0.4 * (phase * 0.5 + 0.5)  # 0 to 0.4

        # Lower entire upper body
        for joint in [0, 3, 6, 9, 12, 15, 13, 14, 16, 17, 18, 19, 20, 21]:
            pose[joint, 1] -= squat_depth

        # Bend knees
        pose[4, 1] -= squat_depth * 0.7  # left knee
        pose[5, 1] -= squat_depth * 0.7  # right knee

        # Lean torso forward slightly
        forward_lean = squat_depth * 0.3
        for joint in [3, 6, 9, 12, 15]:
            pose[joint, 2] += forward_lean

        motion[i] = pose

    return motion


def generate_ab_bicycles(frames=120):
    """Generate bicycle crunch movement (alternating)."""
    motion = np.zeros((frames, 22, 3), dtype=np.float32)
    base_pose = create_base_pose()

    # Lying down position
    base_pose[:, 1] += 0.85  # Shift to ground level
    base_pose[:, 2] -= 0.85  # Rotate to lying position

    for i in range(frames):
        t = i / frames
        phase = np.sin(t * 2 * np.pi * 3)  # 3 cycles

        pose = base_pose.copy()

        # Alternating leg movement
        if phase > 0:
            # Right knee up, left leg extended
            pose[5, 1] += 0.3  # right knee up
            pose[4, 1] -= 0.1  # left knee extended
        else:
            # Left knee up, right leg extended
            pose[4, 1] += 0.3  # left knee up
            pose[5, 1] -= 0.1  # right knee extended

        # Torso rotation
        rotation = phase * 0.1
        for joint in [3, 6, 9, 12, 15]:
            pose[joint, 0] += rotation

        motion[i] = pose

    return motion


def generate_ab_walk_outs(frames=120):
    """Generate walk-out to plank movement."""
    motion = np.zeros((frames, 22, 3), dtype=np.float32)
    base_pose = create_base_pose()

    for i in range(frames):
        t = i / frames

        pose = base_pose.copy()

        if t < 0.4:
            # Walk out phase
            progress = t / 0.4
            # Lean forward
            lean = progress * 0.8
            for joint in [3, 6, 9, 12, 15]:
                pose[joint, 2] += lean
                pose[joint, 1] -= lean * 0.5

            # Extend arms forward
            pose[18, 2] += progress * 0.5  # left elbow
            pose[19, 2] += progress * 0.5  # right elbow
            pose[20, 2] += progress * 0.8  # left wrist
            pose[21, 2] += progress * 0.8  # right wrist

        elif t < 0.6:
            # Hold plank
            for joint in [3, 6, 9, 12, 15]:
                pose[joint, 2] += 0.8
                pose[joint, 1] -= 0.4
            pose[18, 2] += 0.5
            pose[19, 2] += 0.5
            pose[20, 2] += 0.8
            pose[21, 2] += 0.8

        else:
            # Walk back
            progress = 1 - ((t - 0.6) / 0.4)
            lean = progress * 0.8
            for joint in [3, 6, 9, 12, 15]:
                pose[joint, 2] += lean
                pose[joint, 1] -= lean * 0.5
            pose[18, 2] += progress * 0.5
            pose[19, 2] += progress * 0.5
            pose[20, 2] += progress * 0.8
            pose[21, 2] += progress * 0.8

        motion[i] = pose

    return motion


def generate_curtsy_lunges(frames=90):
    """Generate curtsy lunge movement."""
    motion = np.zeros((frames, 22, 3), dtype=np.float32)
    base_pose = create_base_pose()

    for i in range(frames):
        t = i / frames
        phase = np.sin(t * 2 * np.pi * 2)  # 2 lunges

        pose = base_pose.copy()

        # Lunge depth
        lunge_depth = 0.3 * (phase * 0.5 + 0.5)

        # Right leg steps back and across
        pose[2, 2] -= lunge_depth * 0.5  # right hip back
        pose[2, 0] -= lunge_depth * 0.3  # right hip across
        pose[5, 1] -= lunge_depth  # right knee down
        pose[5, 2] -= lunge_depth * 0.5

        # Left knee bends
        pose[4, 1] -= lunge_depth * 0.3

        # Lower torso
        for joint in [0, 3, 6, 9, 12, 15]:
            pose[joint, 1] -= lunge_depth * 0.5

        motion[i] = pose

    return motion


def main():
    """Generate synthetic motion data for all test exercises."""
    exercises = {
        "bench-dips": generate_bench_dips,
        "bodyweight-squat": generate_bodyweight_squat,
        "ab-bicycles": generate_ab_bicycles,
        "ab-walk-outs": generate_ab_walk_outs,
        "body-weight-curtsy-lunges": generate_curtsy_lunges,
    }

    print("=" * 60)
    print("Generating Synthetic Motion Data")
    print("=" * 60)
    print()

    for slug, generator_func in exercises.items():
        motion_data = generator_func()
        output_path = OUTPUT_DIR / f"{slug}.npy"

        np.save(output_path, motion_data)

        frames, joints, coords = motion_data.shape
        file_size = output_path.stat().st_size / 1024

        print(f"✓ {slug}")
        print(f"  Shape: ({frames} frames, {joints} joints, {coords} coords)")
        print(f"  File: {output_path.name} ({file_size:.1f} KB)")
        print()

    print("=" * 60)
    print(f"✓ Generated {len(exercises)} synthetic motion files")
    print(f"✓ Output: {OUTPUT_DIR}")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. python src/03_project_to_2d.py")
    print("2. python src/04_render_webp.py")
    print("3. python src/05_render_lottie.py")
    print("4. python src/09_generate_manifest.py")
    print("5. node scripts/upload_to_vercel_blob.js")


if __name__ == "__main__":
    main()
