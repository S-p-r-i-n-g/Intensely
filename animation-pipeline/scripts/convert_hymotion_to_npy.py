#!/usr/bin/env python3
"""
Convert HY-Motion NPZ output to pipeline .npy format.

Run this EITHER on RunPod (preferred) after HY-Motion inference, or
locally after downloading the raw hymotion_output/ directory.

HY-Motion outputs one subdirectory per exercise containing a NPZ file:
  hymotion_output/
    push-up/
      seed_0_..._motion.npz      ← contains SMPL-H parameters
    bodyweight-squat/
      seed_0_..._motion.npz

NPZ structure:
  - 'poses':  (T, 52, 3) — axis-angle rotations for 52 SMPL-H joints
  - 'trans':  (T, 3)     — root translation in meters

Pipeline expects: motion_data/{slug}.npy with shape (T, 22, 3)
  — 3D world positions of the 22 body joints in meters

Usage (on RunPod):
    python /workspace/convert_hymotion_to_npy.py \\
        --input  /workspace/hymotion_output \\
        --output /workspace/motion_data \\
        --hy-motion-dir /workspace/HY-Motion-1.0

Usage (local, after downloading hymotion_output/):
    python scripts/convert_hymotion_to_npy.py \\
        --input  hymotion_output \\
        --output motion_data

Requirements:
    pip install smplx scipy numpy
    (smplx and scipy already available on RunPod after runpod_setup.sh)
"""

import argparse
import sys
import numpy as np
from pathlib import Path


BODY_JOINT_COUNT = 22  # pelvis → right_wrist (SMPL-H joints 0-21)
SRC_FPS = 20           # HY-Motion internal frame rate
TGT_FPS = 15           # Pipeline render frame rate


def subsample(motion: np.ndarray, src_fps: int, tgt_fps: int) -> np.ndarray:
    """Resample by nearest-frame selection (no interpolation needed for animation)."""
    num_frames = len(motion)
    indices = np.round(np.arange(0, num_frames, src_fps / tgt_fps)).astype(int)
    indices = indices[indices < num_frames]
    return motion[indices]


def load_smplh_model(hy_motion_dir: Path):
    """
    Load SMPL-H model for full forward kinematics.
    Returns None if model file unavailable (falls back to simplified FK).
    """
    try:
        import smplx
        import torch
    except ImportError:
        print("⚠  smplx not installed (pip install smplx). Using simplified FK.")
        return None

    candidates = [
        hy_motion_dir / "ckpts" / "smplh" / "SMPLH_NEUTRAL.pkl",
        hy_motion_dir / "data"  / "smplh" / "SMPLH_NEUTRAL.pkl",
        Path("/workspace/smplh/SMPLH_NEUTRAL.pkl"),
        Path.home() / "smplh" / "SMPLH_NEUTRAL.pkl",
    ]

    model_path = next((c for c in candidates if c.exists()), None)

    if model_path is None:
        print("⚠  SMPL-H model not found. Using simplified FK (slightly less accurate).")
        print("   To use full FK: download SMPL-H from https://smpl-x.is.tue.mpg.de")
        print(f"   Place at: {candidates[0]}")
        return None

    model = smplx.create(
        str(model_path.parent),
        model_type="smplh",
        gender="neutral",
        use_pca=False,
        flat_hand_mean=True,
        batch_size=1,
    )
    model.eval()
    print(f"✓ SMPL-H model loaded: {model_path}")
    return model


def poses_to_joints_smplx(poses: np.ndarray, trans: np.ndarray, model) -> np.ndarray:
    """Full FK using smplx. Returns (T, 22, 3) joint world positions."""
    import torch

    if poses.ndim == 2:
        poses = poses.reshape(-1, 52, 3)

    T = len(poses)
    all_joints = []
    for t in range(T):
        with torch.no_grad():
            out = model(
                global_orient=torch.from_numpy(poses[t, 0:1]).float(),
                body_pose=torch.from_numpy(poses[t, 1:22].reshape(1, -1)).float(),
                transl=torch.from_numpy(trans[t:t+1]).float(),
                return_verts=False,
            )
        all_joints.append(out.joints[0].numpy()[:BODY_JOINT_COUNT])

    return np.stack(all_joints).astype(np.float32)


def poses_to_joints_simple(poses: np.ndarray, trans: np.ndarray) -> np.ndarray:
    """
    Simplified FK using the SMPL-H kinematic chain + mean body shape bone lengths.
    Fallback when the SMPL-H model file is unavailable.
    Accurate enough for stick-figure rendering.
    """
    from scipy.spatial.transform import Rotation

    if poses.ndim == 2:
        poses = poses.reshape(-1, 52, 3)

    # Parent joint index for each of the 22 body joints
    PARENTS = [-1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 12, 13, 14, 16, 17, 18, 19]

    # Rest-pose (T-pose) offsets from parent joint, in meters (mean SMPL-H shape)
    REST_OFFSETS = np.array([
        [ 0.000,  0.000,  0.000],  # 0  pelvis
        [-0.087, -0.000,  0.000],  # 1  left_hip
        [ 0.087, -0.000,  0.000],  # 2  right_hip
        [ 0.000,  0.098,  0.000],  # 3  spine1
        [ 0.000, -0.383,  0.000],  # 4  left_knee
        [ 0.000, -0.383,  0.000],  # 5  right_knee
        [ 0.000,  0.098,  0.000],  # 6  spine2
        [ 0.000, -0.413,  0.000],  # 7  left_ankle
        [ 0.000, -0.413,  0.000],  # 8  right_ankle
        [ 0.000,  0.098,  0.000],  # 9  spine3
        [ 0.000, -0.054,  0.062],  # 10 left_foot
        [ 0.000, -0.054, -0.062],  # 11 right_foot
        [ 0.000,  0.227,  0.000],  # 12 neck
        [-0.059,  0.183,  0.000],  # 13 left_collar
        [ 0.059,  0.183,  0.000],  # 14 right_collar
        [ 0.000,  0.100,  0.000],  # 15 head
        [-0.175,  0.000,  0.000],  # 16 left_shoulder
        [ 0.175,  0.000,  0.000],  # 17 right_shoulder
        [-0.278,  0.000,  0.000],  # 18 left_elbow
        [ 0.278,  0.000,  0.000],  # 19 right_elbow
        [-0.253,  0.000,  0.000],  # 20 left_wrist
        [ 0.253,  0.000,  0.000],  # 21 right_wrist
    ], dtype=np.float32)

    T = len(poses)
    all_joints = np.zeros((T, BODY_JOINT_COUNT, 3), dtype=np.float32)

    for t in range(T):
        global_rots = np.zeros((BODY_JOINT_COUNT, 3, 3), dtype=np.float32)
        positions   = np.zeros((BODY_JOINT_COUNT, 3), dtype=np.float32)

        for j in range(BODY_JOINT_COUNT):
            local_rot = Rotation.from_rotvec(poses[t, j]).as_matrix()
            p = PARENTS[j]
            if p == -1:
                global_rots[j] = local_rot
                positions[j]   = REST_OFFSETS[j] + trans[t]
            else:
                global_rots[j] = global_rots[p] @ local_rot
                positions[j]   = positions[p] + global_rots[p] @ REST_OFFSETS[j]

        all_joints[t] = positions

    return all_joints


def find_npz(slug: str, raw_dir: Path):
    """Find the NPZ file for a given exercise slug in HY-Motion output."""
    # Subdirectory structure: raw_dir/{slug}/seed_0_*_motion.npz
    subdir = raw_dir / slug
    if subdir.is_dir():
        npz_files = list(subdir.glob("*.npz"))
        if npz_files:
            # Prefer seed_0 variant
            for f in npz_files:
                if "seed_0" in f.name or "_0_" in f.name:
                    return f
            return npz_files[0]

    # Flat structure: raw_dir/{slug}.npz
    flat = raw_dir / f"{slug}.npz"
    if flat.exists():
        return flat

    return None


def convert_one(slug: str, raw_dir: Path, output_dir: Path, model) -> bool:
    npz_path = find_npz(slug, raw_dir)
    if npz_path is None:
        return False

    try:
        data = np.load(str(npz_path), allow_pickle=True)

        # Locate pose array (key names vary across HY-Motion versions)
        poses = None
        for key in ("poses", "smpl_poses", "body_pose", "pose"):
            if key in data:
                poses = np.array(data[key], dtype=np.float32)
                break
        if poses is None:
            print(f"    ⚠ Unknown NPZ keys: {list(data.keys())}")
            return False

        # Locate translation array
        trans = np.zeros((len(poses), 3), dtype=np.float32)
        for key in ("trans", "transl", "smpl_trans", "root_trans"):
            if key in data:
                trans = np.array(data[key], dtype=np.float32)
                break

        # Ensure (T, 52, 3) shape
        if poses.ndim == 2:
            if poses.shape[1] == 156:
                poses = poses.reshape(-1, 52, 3)
            elif poses.shape[1] == 66:
                # Body-only (22 joints × 3), pad to 52
                pad = np.zeros((len(poses), 30, 3), dtype=np.float32)
                poses = np.concatenate([poses.reshape(-1, 22, 3), pad], axis=1)

        # Forward kinematics
        if model is not None:
            joints = poses_to_joints_smplx(poses, trans, model)
        else:
            joints = poses_to_joints_simple(poses, trans)

        # Subsample 20fps → 15fps
        joints = subsample(joints, SRC_FPS, TGT_FPS)

        np.save(str(output_dir / f"{slug}.npy"), joints)
        return True

    except Exception as e:
        import traceback
        print(f"    ❌ {slug}: {e}")
        traceback.print_exc()
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Convert HY-Motion NPZ output to pipeline .npy format"
    )
    parser.add_argument("--input",  required=True,
                        help="HY-Motion output directory (hymotion_output/)")
    parser.add_argument("--output", required=True,
                        help="Output directory for .npy files (motion_data/)")
    parser.add_argument("--hy-motion-dir", default="/workspace/HY-Motion-1.0",
                        help="HY-Motion repo root (for locating SMPL-H model)")
    args = parser.parse_args()

    raw_dir    = Path(args.input)
    output_dir = Path(args.output)
    hy_dir     = Path(args.hy_motion_dir)

    if not raw_dir.exists():
        print(f"❌ Input directory not found: {raw_dir}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    # Load SMPL-H model for FK (None → simplified fallback)
    model = load_smplh_model(hy_dir)

    # Discover exercises from directory structure
    slug_dirs  = sorted(d.name for d in raw_dir.iterdir() if d.is_dir())
    flat_npzs  = sorted(f.stem for f in raw_dir.glob("*.npz"))
    slugs = slug_dirs if slug_dirs else flat_npzs

    if not slugs:
        print(f"❌ No exercise output found in {raw_dir}")
        sys.exit(1)

    already_done = {f.stem for f in output_dir.glob("*.npy")}
    to_convert   = [s for s in slugs if s not in already_done]

    print(f"Total exercises:   {len(slugs)}")
    print(f"Already converted: {len(already_done)}")
    print(f"To convert:        {len(to_convert)}\n")

    success, failed = 0, []

    for slug in to_convert:
        ok = convert_one(slug, raw_dir, output_dir, model)
        if ok:
            shape = np.load(str(output_dir / f"{slug}.npy")).shape
            print(f"  ✓ {slug}: {shape}")
            success += 1
        else:
            print(f"  ✗ {slug}: skipped")
            failed.append(slug)

    print(f"\n{'='*50}")
    print(f"Converted: {success}  |  Already done: {len(already_done)}  |  Failed: {len(failed)}")
    total_npy = len(list(output_dir.glob("*.npy")))
    print(f"Total .npy files:  {total_npy} / 219")

    if failed:
        failed_path = Path(args.output).parent / "conversion_failed.txt"
        failed_path.write_text("\n".join(failed) + "\n")
        print(f"\nFailed slugs saved to: {failed_path}")
        print("These exercises may need video fallback (GVHMR).")


if __name__ == "__main__":
    main()
