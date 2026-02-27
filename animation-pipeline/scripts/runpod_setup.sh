#!/bin/bash
################################################################################
# RunPod GPU Setup Script
#
# Bootstraps a fresh RunPod A100 instance for exercise animation generation.
#
# Usage:
#   ./runpod_setup.sh              # Install HY-Motion only
#   ./runpod_setup.sh --gvhmr      # Install HY-Motion + GVHMR
#
# Requirements:
#   - RunPod instance with CUDA-enabled GPU (A100 40GB+ recommended)
#   - Ubuntu 20.04/22.04
#   - Python 3.10+
#
# GPU VRAM requirements:
#   - HY-Motion-1.0 (standard): 26GB minimum → use A100
#   - HY-Motion-1.0-Lite:       24GB minimum → A100 recommended, 4090 marginal
#
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKSPACE="/workspace"
INSTALL_GVHMR=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --gvhmr)
            INSTALL_GVHMR=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--gvhmr]"
            echo "  --gvhmr    Also install GVHMR for video-to-motion fallback"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_warning "$1 is not installed"
        return 1
    fi
}

################################################################################
# System Setup
################################################################################

print_header "System Information"
echo "Hostname: $(hostname)"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Python: $(python3 --version)"
echo "CUDA: $(nvcc --version | grep release | awk '{print $5}' | cut -d',' -f1 2>/dev/null || echo 'unknown')"
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader | head -1

################################################################################
# Install System Dependencies
################################################################################

print_header "Installing System Dependencies"

if check_command git && check_command wget && check_command unzip; then
    print_success "System dependencies already installed"
else
    echo "Installing git, wget, unzip, ffmpeg..."
    apt-get update -qq
    apt-get install -y -qq git wget unzip ffmpeg libsm6 libxext6
    print_success "System dependencies installed"
fi

# Install huggingface-cli for model downloads
pip install -q --upgrade huggingface_hub
print_success "huggingface_hub installed"

################################################################################
# HY-Motion 1.0 Setup (Tencent-Hunyuan)
################################################################################

print_header "HY-Motion 1.0 Setup (Text-to-Motion)"

HY_MOTION_DIR="$WORKSPACE/HY-Motion-1.0"

# Clone repo
if [ -d "$HY_MOTION_DIR" ]; then
    print_success "HY-Motion repo already cloned"
    cd "$HY_MOTION_DIR"
    git pull -q origin master || print_warning "Could not update repo (offline?)"
else
    echo "Cloning HY-Motion-1.0 from Tencent-Hunyuan..."
    cd "$WORKSPACE"
    git clone https://github.com/Tencent-Hunyuan/HY-Motion-1.0.git
    print_success "HY-Motion-1.0 repo cloned"
fi

cd "$HY_MOTION_DIR"

# Install Python dependencies
if python3 -c "import hymotion" 2>/dev/null; then
    print_success "HY-Motion Python package already installed"
else
    echo "Installing HY-Motion dependencies..."
    pip install -q --upgrade pip
    pip install -q torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    pip install -q -r requirements.txt
    pip install -q smplx  # For SMPL-H forward kinematics in conversion step
    print_success "HY-Motion dependencies installed"
fi

################################################################################
# Download HY-Motion Model Weights
################################################################################

print_header "Downloading HY-Motion Model Weights"

CKPTS_DIR="$HY_MOTION_DIR/ckpts/tencent"
mkdir -p "$CKPTS_DIR"

# HY-Motion-1.0-Lite (24GB VRAM, ~2x faster than standard)
# Use standard (HY-Motion-1.0) if you have an A100 80GB and want best quality
LITE_MODEL_DIR="$CKPTS_DIR/HY-Motion-1.0-Lite"
CLIP_DIR="$HY_MOTION_DIR/ckpts/clip-vit-large-patch14"
QWEN_DIR="$HY_MOTION_DIR/ckpts/Qwen3-8B"

if [ -d "$LITE_MODEL_DIR" ] && [ "$(ls -A $LITE_MODEL_DIR 2>/dev/null)" ]; then
    print_success "HY-Motion-1.0-Lite weights already downloaded"
else
    echo "Downloading HY-Motion-1.0-Lite weights (this takes ~5-10 minutes)..."
    huggingface-cli download tencent/HY-Motion-1.0 \
        --include "HY-Motion-1.0-Lite/*" \
        --local-dir "$CKPTS_DIR"
    print_success "HY-Motion-1.0-Lite weights downloaded"
fi

if [ -d "$CLIP_DIR" ] && [ "$(ls -A $CLIP_DIR 2>/dev/null)" ]; then
    print_success "CLIP text encoder already downloaded"
else
    echo "Downloading CLIP text encoder..."
    huggingface-cli download openai/clip-vit-large-patch14 \
        --local-dir "$CLIP_DIR"
    print_success "CLIP text encoder downloaded"
fi

# Qwen3-8B is large (~16GB) but needed for prompt rewriting/duration estimation.
# We disable both features (--disable_rewrite --disable_duration_est) to skip it.
# Uncomment below only if you want automatic duration estimation.
# if [ -d "$QWEN_DIR" ] && [ "$(ls -A $QWEN_DIR 2>/dev/null)" ]; then
#     print_success "Qwen3-8B text encoder already downloaded"
# else
#     echo "Downloading Qwen3-8B text encoder (~16GB, takes 15-20 min)..."
#     huggingface-cli download Qwen/Qwen3-8B --local-dir "$QWEN_DIR"
#     print_success "Qwen3-8B downloaded"
# fi
print_warning "Qwen3-8B skipped (using --disable_rewrite --disable_duration_est to save VRAM)"

################################################################################
# GVHMR Setup (Optional - video fallback path)
################################################################################

if [ "$INSTALL_GVHMR" = true ]; then
    print_header "GVHMR Setup (Video-to-Motion Fallback)"

    GVHMR_DIR="$WORKSPACE/GVHMR"

    if [ -d "$GVHMR_DIR" ]; then
        print_success "GVHMR repo already cloned"
        cd "$GVHMR_DIR"
        git pull -q origin main || print_warning "Could not update repo"
    else
        echo "Cloning GVHMR..."
        cd "$WORKSPACE"
        git clone https://github.com/zju3dv/GVHMR.git
        print_success "GVHMR repo cloned"
    fi

    cd "$GVHMR_DIR"

    if python3 -c "import gvhmr" 2>/dev/null; then
        print_success "GVHMR already installed"
    else
        echo "Installing GVHMR dependencies..."
        pip install -q ultralytics  # YOLOv8
        pip install -q mmpose mmcv  # ViTPose
        pip install -q -r requirements.txt
        print_success "GVHMR dependencies installed"
    fi

    # YOLOv8 weights
    YOLO_WEIGHTS="$GVHMR_DIR/weights/yolov8x.pt"
    mkdir -p "$GVHMR_DIR/weights"
    if [ ! -f "$YOLO_WEIGHTS" ]; then
        echo "Downloading YOLOv8 weights..."
        wget -q -O "$YOLO_WEIGHTS" \
            "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8x.pt"
        print_success "YOLOv8 weights downloaded"
    else
        print_success "YOLOv8 weights already present"
    fi

    # ViTPose weights
    VITPOSE_WEIGHTS="$GVHMR_DIR/weights/vitpose_base.pth"
    if [ ! -f "$VITPOSE_WEIGHTS" ]; then
        echo "Downloading ViTPose weights..."
        wget -q -O "$VITPOSE_WEIGHTS" \
            "https://download.openmmlab.com/mmpose/v1/body_2d_keypoint/topdown_heatmap/coco/td-hm_ViTPose-base_8xb64-210e_coco-256x192-216eae50_20230314.pth"
        print_success "ViTPose weights downloaded"
    else
        print_success "ViTPose weights already present"
    fi
fi

################################################################################
# Create Helper Scripts
################################################################################

print_header "Creating Helper Scripts"

# ─── batch_process_hymotion.py ────────────────────────────────────────────────
# Wraps local_infer.py for batch processing all 219 exercise prompts.
# Outputs NPZ files to /workspace/hymotion_output/, then converts to .npy.

cat > "$WORKSPACE/batch_process_hymotion.py" << 'PYEOF'
#!/usr/bin/env python3
"""
Batch process exercise text prompts with HY-Motion 1.0.

Step 1: Run local_infer.py on all .txt prompts → NPZ files in hymotion_output/
Step 2: Run convert_hymotion_to_npy.py → .npy files in motion_data/

Usage:
    python batch_process_hymotion.py \
        --prompts /workspace/prompts \
        --output  /workspace/motion_data \
        --model   /workspace/HY-Motion-1.0/ckpts/tencent/HY-Motion-1.0-Lite
"""
import argparse
import subprocess
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Batch HY-Motion processing")
    parser.add_argument("--prompts", default="/workspace/prompts",
                        help="Directory containing .txt prompt files")
    parser.add_argument("--output", default="/workspace/motion_data",
                        help="Final output directory for .npy files")
    parser.add_argument("--model",
                        default="/workspace/HY-Motion-1.0/ckpts/tencent/HY-Motion-1.0-Lite",
                        help="HY-Motion model directory (contains config.yml + latest.ckpt)")
    parser.add_argument("--raw-dir", default="/workspace/hymotion_output",
                        help="Intermediate directory for HY-Motion NPZ output")
    parser.add_argument("--device-ids", default="0",
                        help="Comma-separated GPU IDs (default: 0)")
    args = parser.parse_args()

    prompts_dir = Path(args.prompts)
    output_dir  = Path(args.output)
    raw_dir     = Path(args.raw_dir)
    hy_motion   = Path("/workspace/HY-Motion-1.0")

    output_dir.mkdir(parents=True, exist_ok=True)
    raw_dir.mkdir(parents=True, exist_ok=True)

    # Count prompts
    prompts = sorted(prompts_dir.glob("*.txt"))
    if not prompts:
        print(f"❌ No .txt files found in {prompts_dir}")
        sys.exit(1)

    # Skip already-converted exercises
    already_done = {f.stem for f in output_dir.glob("*.npy")}
    remaining = [p for p in prompts if p.stem not in already_done]
    print(f"Prompts total:     {len(prompts)}")
    print(f"Already converted: {len(already_done)}")
    print(f"To process:        {len(remaining)}")

    if not remaining:
        print("✅ All exercises already converted!")
        return

    # ── Step 1: HY-Motion inference ──────────────────────────────────────────
    print(f"\n{'='*60}")
    print("STEP 1: HY-Motion inference (text → NPZ)")
    print(f"{'='*60}\n")

    # Process in chunks of 50 to avoid memory accumulation
    CHUNK_SIZE = 50
    for chunk_start in range(0, len(remaining), CHUNK_SIZE):
        chunk = remaining[chunk_start:chunk_start + CHUNK_SIZE]

        # Write chunk prompts to a temp directory
        import tempfile, shutil
        tmp_dir = Path(tempfile.mkdtemp())
        for p in chunk:
            shutil.copy(p, tmp_dir / p.name)

        end_idx = min(chunk_start + CHUNK_SIZE, len(remaining))
        print(f"Processing chunk {chunk_start+1}–{end_idx} of {len(remaining)}...")

        cmd = [
            sys.executable,
            str(hy_motion / "local_infer.py"),
            "--model_path",      args.model,
            "--input_text_dir",  str(tmp_dir),
            "--output_dir",      str(raw_dir),
            "--device_ids",      args.device_ids,
            "--num_seeds",       "1",         # 1 seed: saves VRAM, 1 output per exercise
            "--disable_rewrite",              # skip Qwen rewriting (saves 16GB VRAM)
            "--disable_duration_est",         # skip duration estimation
        ]

        result = subprocess.run(cmd, cwd=str(hy_motion))
        shutil.rmtree(tmp_dir)

        if result.returncode != 0:
            print(f"⚠  Chunk had errors (returncode={result.returncode}), continuing...")

    print("\n✅ HY-Motion inference complete")

    # ── Step 2: Convert NPZ → .npy ───────────────────────────────────────────
    print(f"\n{'='*60}")
    print("STEP 2: Convert NPZ → pipeline .npy format")
    print(f"{'='*60}\n")

    convert_script = Path("/workspace/convert_hymotion_to_npy.py")
    if not convert_script.exists():
        print(f"❌ Conversion script not found: {convert_script}")
        print("   Re-run runpod_setup.sh to regenerate it.")
        sys.exit(1)

    cmd = [
        sys.executable,
        str(convert_script),
        "--input",  str(raw_dir),
        "--output", str(output_dir),
        "--hy-motion-dir", str(hy_motion),
    ]
    result = subprocess.run(cmd)
    if result.returncode != 0:
        print("❌ Conversion failed")
        sys.exit(1)

    # ── Summary ───────────────────────────────────────────────────────────────
    final_count = len(list(output_dir.glob("*.npy")))
    print(f"\n{'='*60}")
    print(f"✅ Done: {final_count}/{len(prompts)} exercises in {output_dir}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
PYEOF

chmod +x "$WORKSPACE/batch_process_hymotion.py"
print_success "Created batch_process_hymotion.py"

# ─── convert_hymotion_to_npy.py ──────────────────────────────────────────────
# Converts HY-Motion NPZ output to pipeline (T, 22, 3) .npy format.
# Runs SMPL-H forward kinematics to get joint world positions.

cat > "$WORKSPACE/convert_hymotion_to_npy.py" << 'PYEOF'
#!/usr/bin/env python3
"""
Convert HY-Motion NPZ output to pipeline .npy format.

HY-Motion outputs NPZ files per exercise containing SMPL-H parameters:
  - 'poses':  (T, 52, 3) — axis-angle rotations for 52 SMPL-H joints
  - 'trans':  (T, 3)     — root translation in meters

Pipeline expects: (T, 22, 3) — 3D joint world positions in meters

Conversion steps:
  1. Load NPZ from HY-Motion output directory
  2. Run SMPL-H forward kinematics (smplx) to get joint world positions
  3. Extract first 22 body joints (indices 0-21, pelvis through wrists)
  4. Subsample from HY-Motion 20fps → pipeline 15fps
  5. Save as float32 .npy

Usage:
    python convert_hymotion_to_npy.py \
        --input  /workspace/hymotion_output \
        --output /workspace/motion_data \
        --hy-motion-dir /workspace/HY-Motion-1.0
"""

import argparse
import sys
import numpy as np
from pathlib import Path


# SMPL-H 52 joints: first 22 are body joints (indices 0-21)
# See claude.md for full joint name mapping
BODY_JOINT_COUNT = 22

# HY-Motion runs at 20fps; pipeline renders at 15fps
SRC_FPS = 20
TGT_FPS = 15


def subsample(motion: np.ndarray, src_fps: int, tgt_fps: int) -> np.ndarray:
    """Resample motion from src_fps to tgt_fps by nearest-frame selection."""
    num_frames = len(motion)
    target_indices = np.round(
        np.arange(0, num_frames, src_fps / tgt_fps)
    ).astype(int)
    target_indices = target_indices[target_indices < num_frames]
    return motion[target_indices]


def load_smplx_model(hy_motion_dir: Path):
    """Load SMPL-H model for forward kinematics using smplx library."""
    try:
        import smplx
        import torch
    except ImportError:
        print("❌ smplx not installed. Run: pip install smplx")
        sys.exit(1)

    # Look for SMPL-H model file in HY-Motion checkpoints
    smplh_candidates = [
        hy_motion_dir / "ckpts" / "smplh" / "SMPLH_NEUTRAL.pkl",
        hy_motion_dir / "ckpts" / "smplh" / "SMPLH_male.pkl",
        hy_motion_dir / "data" / "smplh" / "SMPLH_NEUTRAL.pkl",
        Path("/workspace/smplh/SMPLH_NEUTRAL.pkl"),
    ]

    model_path = None
    for candidate in smplh_candidates:
        if candidate.exists():
            model_path = candidate
            break

    if model_path is None:
        print("⚠  SMPL-H model file not found at standard locations.")
        print("   Tried:")
        for c in smplh_candidates:
            print(f"     {c}")
        print("\n   Using simplified FK (axis-angle → positions via kinematic chain).")
        print("   Quality will be slightly lower. To fix: download SMPL-H model from")
        print("   https://smpl-x.is.tue.mpg.de and place at:")
        print(f"   {smplh_candidates[0]}")
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
    print(f"✓ SMPL-H model loaded from {model_path}")
    return model


def poses_to_joints_smplx(poses: np.ndarray, trans: np.ndarray, model) -> np.ndarray:
    """
    Run SMPL-H forward kinematics using smplx model.

    Args:
        poses: (T, 52, 3) or (T, 156) axis-angle rotations
        trans: (T, 3) root translations
        model: smplx SMPL-H model

    Returns:
        (T, 22, 3) joint world positions
    """
    import torch

    if poses.ndim == 2 and poses.shape[1] == 156:
        poses = poses.reshape(-1, 52, 3)

    T = len(poses)
    all_joints = []

    for t in range(T):
        global_orient = torch.from_numpy(poses[t, 0:1]).float()   # (1, 3)
        body_pose      = torch.from_numpy(poses[t, 1:22]).float().reshape(1, -1)  # (1, 63)
        transl         = torch.from_numpy(trans[t:t+1]).float()   # (1, 3)

        with torch.no_grad():
            output = model(
                global_orient=global_orient,
                body_pose=body_pose,
                transl=transl,
                return_verts=False,
            )
        joints = output.joints[0].numpy()   # (52+, 3)
        all_joints.append(joints[:BODY_JOINT_COUNT])

    return np.stack(all_joints, axis=0).astype(np.float32)  # (T, 22, 3)


def poses_to_joints_simple(poses: np.ndarray, trans: np.ndarray) -> np.ndarray:
    """
    Simplified FK using SMPL-H kinematic chain + approximate bone lengths.
    Used as fallback when SMPL-H model file is unavailable.

    This is less accurate than full FK but produces usable stick-figure
    animations since the renderer only needs approximate joint positions.
    """
    from scipy.spatial.transform import Rotation

    if poses.ndim == 2 and poses.shape[1] == 156:
        poses = poses.reshape(-1, 52, 3)

    # Approximate SMPL-H body-joint rest offsets (meters, T-pose)
    # [joint_idx] = (parent_idx, rest_offset_from_parent)
    # Based on mean SMPL-H body shape (beta=0)
    PARENTS = [-1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 12, 13, 14, 16, 17, 18, 19]
    REST_OFFSETS = np.array([
        [ 0.000,  0.000,  0.000],  # 0  pelvis        (root)
        [-0.087,  0.000,  0.000],  # 1  left_hip
        [ 0.087,  0.000,  0.000],  # 2  right_hip
        [ 0.000,  0.098,  0.000],  # 3  spine1
        [-0.087, -0.383,  0.000],  # 4  left_knee
        [ 0.087, -0.383,  0.000],  # 5  right_knee
        [ 0.000,  0.098,  0.000],  # 6  spine2
        [-0.063, -0.413,  0.000],  # 7  left_ankle
        [ 0.063, -0.413,  0.000],  # 8  right_ankle
        [ 0.000,  0.098,  0.000],  # 9  spine3
        [-0.062, -0.054,  0.000],  # 10 left_foot
        [ 0.062, -0.054,  0.000],  # 11 right_foot
        [ 0.000,  0.227,  0.000],  # 12 neck
        [-0.059,  0.214,  0.000],  # 13 left_collar
        [ 0.059,  0.214,  0.000],  # 14 right_collar
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
        global_rot  = np.zeros((BODY_JOINT_COUNT, 3, 3), dtype=np.float32)
        positions   = np.zeros((BODY_JOINT_COUNT, 3), dtype=np.float32)

        for j in range(BODY_JOINT_COUNT):
            local_rot = Rotation.from_rotvec(poses[t, j]).as_matrix()
            parent = PARENTS[j]

            if parent == -1:
                global_rot[j]  = local_rot
                positions[j]   = REST_OFFSETS[j] + trans[t]
            else:
                global_rot[j]  = global_rot[parent] @ local_rot
                positions[j]   = positions[parent] + global_rot[parent] @ REST_OFFSETS[j]

        all_joints[t] = positions

    return all_joints  # (T, 22, 3)


def find_npz_for_slug(slug: str, raw_dir: Path):
    """
    HY-Motion creates one subdirectory per exercise slug.
    Find the NPZ file inside it. May also be directly named {slug}.npz.
    """
    # Option A: subdirectory per exercise
    subdir = raw_dir / slug
    if subdir.is_dir():
        npz_files = list(subdir.glob("*.npz"))
        if npz_files:
            # prefer seed_0 if multiple seeds were generated
            for f in npz_files:
                if "seed_0" in f.name or "0000" in f.name:
                    return f
            return npz_files[0]

    # Option B: flat file
    flat = raw_dir / f"{slug}.npz"
    if flat.exists():
        return flat

    return None


def convert_one(slug: str, raw_dir: Path, output_dir: Path, smplh_model) -> bool:
    npz_path = find_npz_for_slug(slug, raw_dir)
    if npz_path is None:
        return False

    try:
        data = np.load(str(npz_path), allow_pickle=True)

        # Extract poses and translations
        if "poses" in data:
            poses = data["poses"]
        elif "smpl_poses" in data:
            poses = data["smpl_poses"]
        else:
            keys = list(data.keys())
            print(f"    ⚠ Unknown NPZ keys for {slug}: {keys}")
            return False

        if "trans" in data:
            trans = data["trans"]
        elif "transl" in data:
            trans = data["transl"]
        elif "smpl_trans" in data:
            trans = data["smpl_trans"]
        else:
            trans = np.zeros((len(poses), 3), dtype=np.float32)

        poses = np.array(poses, dtype=np.float32)
        trans = np.array(trans, dtype=np.float32)

        if poses.ndim == 2 and poses.shape[1] == 156:
            poses = poses.reshape(-1, 52, 3)

        # Run forward kinematics
        if smplh_model is not None:
            joints = poses_to_joints_smplx(poses, trans, smplh_model)
        else:
            joints = poses_to_joints_simple(poses, trans)

        # Subsample 20fps → 15fps
        joints = subsample(joints, SRC_FPS, TGT_FPS)

        # Save
        out_path = output_dir / f"{slug}.npy"
        np.save(str(out_path), joints)
        return True

    except Exception as e:
        print(f"    ❌ Error converting {slug}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input",  required=True,
                        help="HY-Motion output directory (contains per-slug subdirs with NPZ files)")
    parser.add_argument("--output", required=True,
                        help="Output directory for .npy files")
    parser.add_argument("--hy-motion-dir", default="/workspace/HY-Motion-1.0",
                        help="HY-Motion repo root (to locate SMPL-H model files)")
    args = parser.parse_args()

    raw_dir    = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load SMPL-H model (or None for simplified FK fallback)
    smplh_model = load_smplx_model(Path(args.hy_motion_dir))

    # Discover slugs: each subdirectory in raw_dir is one exercise
    slug_dirs = [d for d in raw_dir.iterdir() if d.is_dir()]
    flat_npz  = [f for f in raw_dir.glob("*.npz")]

    if slug_dirs:
        slugs = sorted(d.name for d in slug_dirs)
    elif flat_npz:
        slugs = sorted(f.stem for f in flat_npz)
    else:
        print(f"❌ No exercise output found in {raw_dir}")
        sys.exit(1)

    print(f"Found {len(slugs)} exercises to convert\n")

    success = 0
    skipped = 0
    failed  = []

    for slug in slugs:
        out_path = output_dir / f"{slug}.npy"
        if out_path.exists():
            skipped += 1
            continue

        ok = convert_one(slug, raw_dir, output_dir, smplh_model)
        if ok:
            shape = np.load(str(out_path)).shape
            print(f"  ✓ {slug}: {shape}")
            success += 1
        else:
            print(f"  ✗ {slug}: no NPZ found or conversion failed")
            failed.append(slug)

    print(f"\n{'='*50}")
    print(f"Converted: {success}  |  Skipped: {skipped}  |  Failed: {len(failed)}")
    if failed:
        print(f"\nFailed slugs:")
        for s in failed:
            print(f"  - {s}")
        # Write failed list for reprocessing
        Path("/workspace/conversion_failed.txt").write_text("\n".join(failed))
        print("\nFailed list saved to /workspace/conversion_failed.txt")


if __name__ == "__main__":
    main()
PYEOF

chmod +x "$WORKSPACE/convert_hymotion_to_npy.py"
print_success "Created convert_hymotion_to_npy.py"

################################################################################
# Print Usage Instructions
################################################################################

print_header "Setup Complete! 🚀"

cat << EOF
${GREEN}Environment ready for motion generation!${NC}

${BLUE}═══════════════════════════════════════════════════════════${NC}
${BLUE}Quick Start (all 219 exercises)${NC}
${BLUE}═══════════════════════════════════════════════════════════${NC}

${YELLOW}1. Upload prompts from local machine:${NC}
   ./scripts/upload_to_runpod.sh user@<runpod-ip> -p <port>

${YELLOW}2. Run batch processing on this pod:${NC}
   python /workspace/batch_process_hymotion.py \\
     --prompts /workspace/prompts \\
     --output  /workspace/motion_data \\
     --model   /workspace/HY-Motion-1.0/ckpts/tencent/HY-Motion-1.0-Lite

${YELLOW}3. Monitor GPU:${NC}
   watch -n 2 nvidia-smi

${YELLOW}4. Download .npy results from local machine:${NC}
   ./scripts/download_results.sh user@<runpod-ip> -p <port>

${BLUE}═══════════════════════════════════════════════════════════${NC}
${BLUE}Manual Steps (if batch script has issues)${NC}
${BLUE}═══════════════════════════════════════════════════════════${NC}

${YELLOW}Step 1 — HY-Motion inference:${NC}
   cd /workspace/HY-Motion-1.0
   python local_infer.py \\
     --model_path  ckpts/tencent/HY-Motion-1.0-Lite \\
     --input_text_dir  /workspace/prompts \\
     --output_dir  /workspace/hymotion_output \\
     --num_seeds 1 \\
     --disable_rewrite \\
     --disable_duration_est

${YELLOW}Step 2 — Convert NPZ → .npy:${NC}
   python /workspace/convert_hymotion_to_npy.py \\
     --input  /workspace/hymotion_output \\
     --output /workspace/motion_data

${BLUE}═══════════════════════════════════════════════════════════${NC}
${BLUE}Model Paths${NC}
${BLUE}═══════════════════════════════════════════════════════════${NC}

  HY-Motion repo:      $HY_MOTION_DIR
  Model weights:       $CKPTS_DIR/HY-Motion-1.0-Lite/
  CLIP encoder:        $CLIP_DIR/
  Motion output (raw): /workspace/hymotion_output/
  Motion output (.npy): /workspace/motion_data/

${YELLOW}Tips:${NC}
  • GPU usage:   watch -n 2 nvidia-smi
  • Disk space:  df -h /workspace
  • Log output:  python batch_process_hymotion.py ... 2>&1 | tee run.log
  • Resume:      script skips already-converted exercises automatically

${GREEN}Happy generating! 🎬${NC}
EOF

################################################################################
# End of Script
################################################################################
