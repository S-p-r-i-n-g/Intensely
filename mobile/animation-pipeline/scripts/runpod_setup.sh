#!/bin/bash
################################################################################
# RunPod GPU Setup Script
#
# Bootstraps a fresh RunPod A100/4090 instance for exercise animation generation.
#
# Usage:
#   ./runpod_setup.sh              # Install HY-Motion only
#   ./runpod_setup.sh --gvhmr      # Install HY-Motion + GVHMR
#
# Requirements:
#   - RunPod instance with CUDA-enabled GPU
#   - Ubuntu 20.04/22.04
#   - Python 3.10+
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
            echo "  --gvhmr    Also install GVHMR for video-to-motion"
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
echo "CUDA: $(nvcc --version | grep release | awk '{print $5}' | cut -d',' -f1)"
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader | head -1

################################################################################
# Install System Dependencies
################################################################################

print_header "Installing System Dependencies"

if check_command git && check_command wget && check_command unzip; then
    print_success "System dependencies already installed"
else
    echo "Installing git, wget, unzip..."
    apt-get update -qq
    apt-get install -y -qq git wget unzip ffmpeg libsm6 libxext6
    print_success "System dependencies installed"
fi

################################################################################
# HY-Motion 1.0 Setup
################################################################################

print_header "HY-Motion 1.0 Setup (Text-to-Motion)"

HY_MOTION_DIR="$WORKSPACE/HY-Motion"

# Clone repo if not exists
if [ -d "$HY_MOTION_DIR" ]; then
    print_success "HY-Motion repo already cloned"
    cd "$HY_MOTION_DIR"
    git pull -q origin main || print_warning "Could not update repo (working offline?)"
else
    echo "Cloning HY-Motion repository..."
    cd "$WORKSPACE"
    git clone https://github.com/humanmotion/HY-Motion.git
    cd "$HY_MOTION_DIR"
    print_success "HY-Motion repo cloned"
fi

# Install Python dependencies
if [ -f "$HY_MOTION_DIR/.venv/bin/activate" ]; then
    print_success "HY-Motion venv already exists"
else
    echo "Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate

    echo "Installing HY-Motion dependencies..."
    pip install -q --upgrade pip
    pip install -q torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    pip install -q -r requirements.txt

    print_success "HY-Motion dependencies installed"
fi

# Download model weights
WEIGHTS_DIR="$HY_MOTION_DIR/weights"
WEIGHTS_FILE="$WEIGHTS_DIR/hy_motion_v1.0.ckpt"

if [ -f "$WEIGHTS_FILE" ]; then
    print_success "HY-Motion weights already downloaded"
else
    echo "Downloading HY-Motion model weights..."
    mkdir -p "$WEIGHTS_DIR"

    # Replace with actual download URL when available
    # wget -q -O "$WEIGHTS_FILE" "https://example.com/hy_motion_v1.0.ckpt"

    print_warning "Manual download required:"
    echo "  Download weights from: https://huggingface.co/humanmotion/hy-motion-v1"
    echo "  Save to: $WEIGHTS_FILE"
fi

################################################################################
# GVHMR Setup (Optional)
################################################################################

if [ "$INSTALL_GVHMR" = true ]; then
    print_header "GVHMR Setup (Video-to-Motion)"

    GVHMR_DIR="$WORKSPACE/GVHMR"

    # Clone repo if not exists
    if [ -d "$GVHMR_DIR" ]; then
        print_success "GVHMR repo already cloned"
        cd "$GVHMR_DIR"
        git pull -q origin main || print_warning "Could not update repo (working offline?)"
    else
        echo "Cloning GVHMR repository..."
        cd "$WORKSPACE"
        git clone https://github.com/zju3dv/GVHMR.git
        cd "$GVHMR_DIR"
        print_success "GVHMR repo cloned"
    fi

    # Install Python dependencies
    if [ -f "$GVHMR_DIR/.venv/bin/activate" ]; then
        print_success "GVHMR venv already exists"
    else
        echo "Creating virtual environment..."
        python3 -m venv .venv
        source .venv/bin/activate

        echo "Installing GVHMR dependencies..."
        pip install -q --upgrade pip
        pip install -q torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
        pip install -q ultralytics  # YOLOv8
        pip install -q mmpose mmcv  # ViTPose
        pip install -q -r requirements.txt

        print_success "GVHMR dependencies installed"
    fi

    # Download GVHMR weights
    GVHMR_WEIGHTS_DIR="$GVHMR_DIR/weights"
    GVHMR_WEIGHTS_FILE="$GVHMR_WEIGHTS_DIR/gvhmr_model.pth"

    if [ -f "$GVHMR_WEIGHTS_FILE" ]; then
        print_success "GVHMR weights already downloaded"
    else
        echo "Downloading GVHMR model weights..."
        mkdir -p "$GVHMR_WEIGHTS_DIR"

        # Download GVHMR weights
        # wget -q -O "$GVHMR_WEIGHTS_FILE" "https://example.com/gvhmr_model.pth"

        print_warning "Manual download required:"
        echo "  Download weights from: https://github.com/zju3dv/GVHMR/releases"
        echo "  Save to: $GVHMR_WEIGHTS_FILE"
    fi

    # Download YOLOv8 weights
    YOLO_WEIGHTS="$GVHMR_WEIGHTS_DIR/yolov8x.pt"
    if [ ! -f "$YOLO_WEIGHTS" ]; then
        echo "Downloading YOLOv8 weights..."
        wget -q -O "$YOLO_WEIGHTS" "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8x.pt"
        print_success "YOLOv8 weights downloaded"
    else
        print_success "YOLOv8 weights already downloaded"
    fi

    # Download ViTPose weights
    VITPOSE_WEIGHTS="$GVHMR_WEIGHTS_DIR/vitpose_base.pth"
    if [ ! -f "$VITPOSE_WEIGHTS" ]; then
        echo "Downloading ViTPose weights..."
        wget -q -O "$VITPOSE_WEIGHTS" "https://download.openmmlab.com/mmpose/v1/body_2d_keypoint/topdown_heatmap/coco/td-hm_ViTPose-base_8xb64-210e_coco-256x192-216eae50_20230314.pth"
        print_success "ViTPose weights downloaded"
    else
        print_success "ViTPose weights already downloaded"
    fi
fi

################################################################################
# Create Helper Scripts
################################################################################

print_header "Creating Helper Scripts"

# Create batch processing script for HY-Motion
cat > "$WORKSPACE/batch_process_hymotion.py" << 'EOF'
#!/usr/bin/env python3
"""
Batch process text prompts with HY-Motion.
Reads .txt files from input directory and outputs .npy motion files.
"""
import sys
import argparse
from pathlib import Path

sys.path.append('/workspace/HY-Motion')
from inference import generate_motion

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, help='Input directory with .txt files')
    parser.add_argument('--output', required=True, help='Output directory for .npy files')
    parser.add_argument('--weights', default='/workspace/HY-Motion/weights/hy_motion_v1.0.ckpt')
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    txt_files = sorted(input_dir.glob('*.txt'))
    print(f"Found {len(txt_files)} prompt files")

    for idx, txt_file in enumerate(txt_files, 1):
        slug = txt_file.stem
        output_file = output_dir / f"{slug}.npy"

        if output_file.exists():
            print(f"[{idx}/{len(txt_files)}] {slug} - SKIP (already exists)")
            continue

        print(f"[{idx}/{len(txt_files)}] {slug} - Processing...")

        with open(txt_file) as f:
            prompt = f.read().strip()

        try:
            motion_data = generate_motion(prompt, args.weights)
            motion_data.save(output_file)
            print(f"  ✓ Saved {output_file.name}")
        except Exception as e:
            print(f"  ✗ Error: {e}")

    print(f"\nComplete! Processed {len(txt_files)} prompts")

if __name__ == '__main__':
    main()
EOF

chmod +x "$WORKSPACE/batch_process_hymotion.py"
print_success "Created batch_process_hymotion.py"

if [ "$INSTALL_GVHMR" = true ]; then
    # Create video processing script for GVHMR
    cat > "$WORKSPACE/batch_process_gvhmr.py" << 'EOF'
#!/usr/bin/env python3
"""
Batch process videos with GVHMR.
Reads .mp4/.mov files from input directory and outputs .npy motion files.
"""
import sys
import argparse
from pathlib import Path

sys.path.append('/workspace/GVHMR')
from inference import process_video

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, help='Input directory with video files')
    parser.add_argument('--output', required=True, help='Output directory for .npy files')
    parser.add_argument('--weights', default='/workspace/GVHMR/weights/gvhmr_model.pth')
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    video_files = sorted(list(input_dir.glob('*.mp4')) + list(input_dir.glob('*.mov')))
    print(f"Found {len(video_files)} video files")

    for idx, video_file in enumerate(video_files, 1):
        slug = video_file.stem
        output_file = output_dir / f"{slug}.npy"

        if output_file.exists():
            print(f"[{idx}/{len(video_files)}] {slug} - SKIP (already exists)")
            continue

        print(f"[{idx}/{len(video_files)}] {slug} - Processing...")

        try:
            motion_data = process_video(str(video_file), args.weights)
            motion_data.save(output_file)
            print(f"  ✓ Saved {output_file.name}")
        except Exception as e:
            print(f"  ✗ Error: {e}")

    print(f"\nComplete! Processed {len(video_files)} videos")

if __name__ == '__main__':
    main()
EOF

    chmod +x "$WORKSPACE/batch_process_gvhmr.py"
    print_success "Created batch_process_gvhmr.py"
fi

################################################################################
# Print Usage Instructions
################################################################################

print_header "Setup Complete! 🚀"

cat << EOF
${GREEN}Environment is ready for motion generation!${NC}

${BLUE}═══════════════════════════════════════════════════════════${NC}
${BLUE}HY-Motion 1.0 (Text-to-Motion)${NC}
${BLUE}═══════════════════════════════════════════════════════════${NC}

${YELLOW}1. Activate environment:${NC}
   cd $HY_MOTION_DIR
   source .venv/bin/activate

${YELLOW}2. Run single inference:${NC}
   python local_infer.py \\
     --prompt "A person performing push-up..." \\
     --output motion.npy \\
     --weights weights/hy_motion_v1.0.ckpt

${YELLOW}3. Run batch processing:${NC}
   python $WORKSPACE/batch_process_hymotion.py \\
     --input /workspace/prompts \\
     --output /workspace/motion_data

${YELLOW}4. Upload prompts:${NC}
   # From your local machine:
   rsync -avz prompts/ user@runpod:/workspace/prompts/

${YELLOW}5. Download results:${NC}
   # From your local machine:
   rsync -avz user@runpod:/workspace/motion_data/ motion_data/

EOF

if [ "$INSTALL_GVHMR" = true ]; then
    cat << EOF
${BLUE}═══════════════════════════════════════════════════════════${NC}
${BLUE}GVHMR (Video-to-Motion)${NC}
${BLUE}═══════════════════════════════════════════════════════════${NC}

${YELLOW}1. Activate environment:${NC}
   cd $GVHMR_DIR
   source .venv/bin/activate

${YELLOW}2. Run single video:${NC}
   python inference.py \\
     --video /workspace/videos/push-up.mp4 \\
     --output /workspace/motion_data/push-up.npy \\
     --weights weights/gvhmr_model.pth

${YELLOW}3. Run batch processing:${NC}
   python $WORKSPACE/batch_process_gvhmr.py \\
     --input /workspace/videos \\
     --output /workspace/motion_data

${YELLOW}4. Upload videos:${NC}
   # From your local machine:
   rsync -avz videos/ user@runpod:/workspace/videos/

EOF
fi

cat << EOF
${BLUE}═══════════════════════════════════════════════════════════${NC}
${BLUE}Tips${NC}
${BLUE}═══════════════════════════════════════════════════════════${NC}

• Monitor GPU usage: ${YELLOW}watch -n 1 nvidia-smi${NC}
• Check disk space: ${YELLOW}df -h /workspace${NC}
• Resume setup anytime: ${YELLOW}./runpod_setup.sh$([ "$INSTALL_GVHMR" = true ] && echo " --gvhmr")${NC}
• All outputs are in: ${YELLOW}$WORKSPACE/motion_data/${NC}

${GREEN}Happy generating! 🎬${NC}
EOF

################################################################################
# End of Script
################################################################################
