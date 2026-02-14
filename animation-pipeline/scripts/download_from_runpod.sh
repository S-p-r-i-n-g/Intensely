#!/bin/bash
################################################################################
# Download Results from RunPod
#
# Helper script to download processed motion data from RunPod instance.
#
# Usage:
#   ./download_from_runpod.sh <runpod-host>
#   ./download_from_runpod.sh user@runpod-instance.com
#
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ $# -eq 0 ]; then
    echo "Usage: $0 <runpod-host>"
    echo "Example: $0 user@runpod-instance.com"
    exit 1
fi

RUNPOD_HOST=$1
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${YELLOW}Downloading from RunPod: ${RUNPOD_HOST}${NC}\n"

# Create local directory if needed
mkdir -p "$PROJECT_ROOT/motion_data"

# Download motion data
echo "Downloading motion data (.npy files)..."
rsync -avz --progress "${RUNPOD_HOST}:/workspace/motion_data/" "$PROJECT_ROOT/motion_data/"

# Count downloaded files
NPY_COUNT=$(find "$PROJECT_ROOT/motion_data" -name "*.npy" -type f | wc -l)

echo ""
echo -e "${GREEN}✓ Download complete!${NC}"
echo ""
echo "Downloaded ${NPY_COUNT} motion files to motion_data/"
echo ""
echo "Next steps:"
echo "  1. Verify files: ls -lh motion_data/ | head"
echo "  2. Run rendering: python src/03_render_animations.py"
