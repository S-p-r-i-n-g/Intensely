#!/bin/bash
################################################################################
# Upload Data to RunPod
#
# Helper script to upload prompts/videos to RunPod instance.
#
# Usage:
#   ./upload_to_runpod.sh <runpod-host>
#   ./upload_to_runpod.sh user@runpod-instance.com
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

echo -e "${YELLOW}Uploading to RunPod: ${RUNPOD_HOST}${NC}\n"

# Upload prompts
if [ -d "$PROJECT_ROOT/prompts" ]; then
    echo "Uploading prompts..."
    rsync -avz --progress "$PROJECT_ROOT/prompts/" "${RUNPOD_HOST}:/workspace/prompts/"
    echo -e "${GREEN}✓ Prompts uploaded${NC}\n"
else
    echo -e "${YELLOW}⚠ No prompts/ directory found. Run 02_prepare_batch.py first.${NC}\n"
fi

# Upload videos if they exist
if [ -d "$PROJECT_ROOT/videos" ] && [ "$(ls -A $PROJECT_ROOT/videos/*.{mp4,mov} 2>/dev/null)" ]; then
    echo "Uploading videos..."
    rsync -avz --progress "$PROJECT_ROOT/videos/" "${RUNPOD_HOST}:/workspace/videos/"
    echo -e "${GREEN}✓ Videos uploaded${NC}\n"
else
    echo -e "${YELLOW}⚠ No videos found. Skipping video upload.${NC}\n"
fi

# Upload manifest
if [ -f "$PROJECT_ROOT/manifest.json" ]; then
    echo "Uploading manifest..."
    rsync -avz "$PROJECT_ROOT/manifest.json" "${RUNPOD_HOST}:/workspace/"
    echo -e "${GREEN}✓ Manifest uploaded${NC}\n"
fi

echo -e "${GREEN}Upload complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. SSH to RunPod: ssh ${RUNPOD_HOST}"
echo "  2. Run batch processing (see scripts/README.md)"
echo "  3. Download results: ./scripts/download_from_runpod.sh ${RUNPOD_HOST}"
