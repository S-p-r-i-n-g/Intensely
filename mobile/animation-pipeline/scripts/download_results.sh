#!/bin/bash
################################################################################
# Download and Verify Motion Data Results
#
# Downloads motion data from RunPod, verifies against expected 219 exercises,
# lists missing files, and provides detailed summary statistics.
#
# Usage:
#   ./download_results.sh <runpod-host>
#   ./download_results.sh user@runpod-instance.com
#
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Expected total (from 219 exercises)
EXPECTED_TOTAL=219

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOTION_DATA_DIR="$PROJECT_ROOT/motion_data"
MANIFEST_PATH="$PROJECT_ROOT/manifest.json"

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

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

################################################################################
# Validate Arguments
################################################################################

if [ $# -eq 0 ]; then
    echo "Usage: $0 <runpod-host>"
    echo ""
    echo "Example:"
    echo "  $0 user@runpod-instance.com"
    echo ""
    echo "This script will:"
    echo "  • Download motion data from RunPod"
    echo "  • Verify file count (expect 219 files)"
    echo "  • List missing exercises"
    echo "  • Print detailed summary"
    exit 1
fi

RUNPOD_HOST=$1

################################################################################
# Pre-flight Checks
################################################################################

print_header "Pre-flight Checks"

# Check if manifest exists
if [ ! -f "$MANIFEST_PATH" ]; then
    print_error "manifest.json not found!"
    echo "  Expected: $MANIFEST_PATH"
    echo "  Run 02_prepare_batch.py first to generate manifest."
    exit 1
fi
print_success "Found manifest.json"

# Check SSH connectivity
echo "Testing connection to $RUNPOD_HOST..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes "$RUNPOD_HOST" exit 2>/dev/null; then
    print_success "SSH connection successful"
else
    print_error "Cannot connect to $RUNPOD_HOST"
    echo "  Check your SSH configuration and RunPod instance status"
    exit 1
fi

# Check if remote directory exists
if ssh "$RUNPOD_HOST" "[ -d /workspace/motion_data ]"; then
    print_success "Remote motion_data directory found"
else
    print_warning "Remote motion_data directory not found"
    echo "  Creating directory on remote..."
    ssh "$RUNPOD_HOST" "mkdir -p /workspace/motion_data"
fi

################################################################################
# Download Files
################################################################################

print_header "Downloading Motion Data"

# Create local directory if needed
mkdir -p "$MOTION_DATA_DIR"

# Get file count on remote
REMOTE_COUNT=$(ssh "$RUNPOD_HOST" "find /workspace/motion_data -name '*.npy' -type f 2>/dev/null | wc -l" | tr -d ' ')
echo "Remote file count: ${REMOTE_COUNT}"

if [ "$REMOTE_COUNT" -eq 0 ]; then
    print_warning "No .npy files found on remote!"
    echo ""
    echo "Possible reasons:"
    echo "  • Motion generation hasn't been run yet"
    echo "  • Files are in a different location"
    echo "  • Processing is still in progress"
    echo ""
    read -p "Continue with download anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Download with rsync
echo "Downloading files..."
echo ""

if rsync -avz --progress "${RUNPOD_HOST}:/workspace/motion_data/" "$MOTION_DATA_DIR/"; then
    print_success "Download complete"
else
    print_error "Download failed"
    exit 1
fi

################################################################################
# Verification
################################################################################

print_header "Verification"

# Count local files
LOCAL_COUNT=$(find "$MOTION_DATA_DIR" -name "*.npy" -type f | wc -l | tr -d ' ')
echo "Downloaded: ${LOCAL_COUNT} files"
echo "Expected:   ${EXPECTED_TOTAL} files"

# Calculate percentage
if [ "$LOCAL_COUNT" -gt 0 ]; then
    PERCENTAGE=$((LOCAL_COUNT * 100 / EXPECTED_TOTAL))
    echo "Progress:   ${PERCENTAGE}%"
fi
echo ""

# Status based on count
if [ "$LOCAL_COUNT" -eq "$EXPECTED_TOTAL" ]; then
    print_success "All files present! (${LOCAL_COUNT}/${EXPECTED_TOTAL})"
    ALL_PRESENT=true
elif [ "$LOCAL_COUNT" -gt "$EXPECTED_TOTAL" ]; then
    print_warning "More files than expected (${LOCAL_COUNT}/${EXPECTED_TOTAL})"
    ALL_PRESENT=false
elif [ "$LOCAL_COUNT" -eq 0 ]; then
    print_error "No files downloaded!"
    ALL_PRESENT=false
else
    print_warning "Missing files (${LOCAL_COUNT}/${EXPECTED_TOTAL})"
    ALL_PRESENT=false
fi

################################################################################
# Find Missing Files
################################################################################

if [ "$ALL_PRESENT" = false ]; then
    print_header "Missing Files Analysis"

    # Extract expected slugs from manifest
    EXPECTED_SLUGS=$(python3 -c "
import json
import sys

try:
    with open('$MANIFEST_PATH') as f:
        manifest = json.load(f)
    slugs = sorted(manifest['exercises'].keys())
    for slug in slugs:
        print(slug)
except Exception as e:
    print(f'Error reading manifest: {e}', file=sys.stderr)
    sys.exit(1)
" 2>/dev/null)

    if [ $? -ne 0 ]; then
        print_error "Failed to read manifest.json"
        exit 1
    fi

    # Find missing files
    MISSING_SLUGS=()
    PRESENT_SLUGS=()

    while IFS= read -r slug; do
        if [ -f "$MOTION_DATA_DIR/${slug}.npy" ]; then
            PRESENT_SLUGS+=("$slug")
        else
            MISSING_SLUGS+=("$slug")
        fi
    done <<< "$EXPECTED_SLUGS"

    MISSING_COUNT=${#MISSING_SLUGS[@]}

    if [ $MISSING_COUNT -gt 0 ]; then
        echo "Missing ${MISSING_COUNT} files:"
        echo ""

        # Show first 20 missing files
        SHOW_COUNT=$((MISSING_COUNT < 20 ? MISSING_COUNT : 20))

        for i in $(seq 0 $((SHOW_COUNT - 1))); do
            echo "  ${MISSING_SLUGS[$i]}.npy"
        done

        if [ $MISSING_COUNT -gt 20 ]; then
            echo "  ... and $((MISSING_COUNT - 20)) more"
        fi

        # Save full list to file
        MISSING_LIST_FILE="$PROJECT_ROOT/missing_exercises.txt"
        printf "%s\n" "${MISSING_SLUGS[@]}" > "$MISSING_LIST_FILE"
        echo ""
        print_info "Full list saved to: missing_exercises.txt"

        # Create reprocess script
        REPROCESS_SCRIPT="$PROJECT_ROOT/reprocess_missing.sh"
        cat > "$REPROCESS_SCRIPT" << 'EOFSCRIPT'
#!/bin/bash
# Auto-generated script to reprocess missing exercises
# Upload this to RunPod and run it there

MISSING_SLUGS=(
EOFSCRIPT

        for slug in "${MISSING_SLUGS[@]}"; do
            echo "    \"$slug\"" >> "$REPROCESS_SCRIPT"
        done

        cat >> "$REPROCESS_SCRIPT" << 'EOFSCRIPT'
)

echo "Reprocessing ${#MISSING_SLUGS[@]} missing exercises..."

for slug in "${MISSING_SLUGS[@]}"; do
    echo "Processing: $slug"

    if [ -f "/workspace/prompts/${slug}.txt" ]; then
        # Add your processing command here
        # Example for HY-Motion:
        # cd /workspace/HY-Motion
        # source .venv/bin/activate
        # python local_infer.py --prompt "$(cat /workspace/prompts/${slug}.txt)" --output /workspace/motion_data/${slug}.npy

        echo "  ✓ Queued for processing"
    else
        echo "  ✗ Prompt file not found"
    fi
done

echo "Complete! Remember to download results again."
EOFSCRIPT

        chmod +x "$REPROCESS_SCRIPT"
        print_info "Created reprocessing script: reprocess_missing.sh"
        echo "  Upload to RunPod: scp reprocess_missing.sh ${RUNPOD_HOST}:/workspace/"
    fi
fi

################################################################################
# File Size Analysis
################################################################################

print_header "File Size Analysis"

if [ "$LOCAL_COUNT" -gt 0 ]; then
    # Get file sizes
    SIZES=$(find "$MOTION_DATA_DIR" -name "*.npy" -type f -exec stat -f%z {} \; 2>/dev/null || \
            find "$MOTION_DATA_DIR" -name "*.npy" -type f -exec stat -c%s {} \; 2>/dev/null)

    # Calculate statistics using Python
    python3 << EOF
import sys

sizes = [int(s) for s in """$SIZES""".strip().split('\n') if s]

if sizes:
    min_size = min(sizes)
    max_size = max(sizes)
    avg_size = sum(sizes) / len(sizes)
    total_size = sum(sizes)

    print(f"File count:  {len(sizes)}")
    print(f"Total size:  {total_size / (1024*1024):.1f} MB")
    print(f"Avg size:    {avg_size / 1024:.1f} KB")
    print(f"Min size:    {min_size / 1024:.1f} KB")
    print(f"Max size:    {max_size / 1024:.1f} KB")

    # Check for suspiciously small files (< 10 KB)
    small_files = [s for s in sizes if s < 10240]
    if small_files:
        print(f"\n⚠ Warning: {len(small_files)} files are suspiciously small (< 10 KB)")
        print("  These files may be corrupted or incomplete")
else:
    print("No files to analyze")
EOF
else
    echo "No files to analyze"
fi

################################################################################
# Summary
################################################################################

print_header "Summary"

echo "Download Details:"
echo "  Remote host:    $RUNPOD_HOST"
echo "  Local dir:      $MOTION_DATA_DIR"
echo "  Files obtained: $LOCAL_COUNT / $EXPECTED_TOTAL"
echo ""

if [ "$ALL_PRESENT" = true ]; then
    echo -e "${GREEN}Status: COMPLETE ✓${NC}"
    echo ""
    echo "All motion data files are present!"
    echo ""
    echo "Next steps:"
    echo "  1. Verify file integrity: ls -lh motion_data/ | head -20"
    echo "  2. Run rendering: python src/03_render_animations.py"
    echo ""
elif [ "$LOCAL_COUNT" -eq 0 ]; then
    echo -e "${RED}Status: NO FILES DOWNLOADED ✗${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if processing completed on RunPod"
    echo "  2. Verify remote path: ssh $RUNPOD_HOST ls -la /workspace/motion_data/"
    echo "  3. Check RunPod logs for errors"
    echo ""
else
    MISSING_PERCENT=$((100 - PERCENTAGE))
    echo -e "${YELLOW}Status: INCOMPLETE (${MISSING_PERCENT}% missing) ⚠${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review missing_exercises.txt for full list"
    echo "  2. Upload reprocess_missing.sh to RunPod"
    echo "  3. Run reprocessing on RunPod"
    echo "  4. Download again with this script"
    echo ""
    echo "Quick commands:"
    echo "  scp reprocess_missing.sh ${RUNPOD_HOST}:/workspace/"
    echo "  ssh ${RUNPOD_HOST} 'bash /workspace/reprocess_missing.sh'"
    echo "  ./scripts/download_results.sh ${RUNPOD_HOST}"
    echo ""
fi

echo "═══════════════════════════════════════════════════════════"

################################################################################
# End of Script
################################################################################
