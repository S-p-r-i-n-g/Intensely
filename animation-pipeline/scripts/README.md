# Scripts Directory

Helper scripts for cloud GPU setup and batch processing.

## RunPod Setup Script

**`runpod_setup.sh`** - Bootstrap a fresh RunPod GPU instance

### Features

✅ **Idempotent** - Safe to run multiple times
✅ **Well-commented** - Clear explanations throughout
✅ **Error handling** - Exits on errors, shows warnings
✅ **Colored output** - Easy to read progress
✅ **Modular** - Install only what you need

### Usage

```bash
# Basic setup (HY-Motion only)
./runpod_setup.sh

# Full setup (HY-Motion + GVHMR)
./runpod_setup.sh --gvhmr

# Help
./runpod_setup.sh --help
```

### What It Does

**System Setup:**
- Checks system information (OS, CUDA, GPU)
- Installs system dependencies (git, wget, ffmpeg)
- Creates workspace directory structure

**HY-Motion 1.0 (Text-to-Motion):**
- Clones HY-Motion repository
- Creates Python virtual environment
- Installs PyTorch + dependencies
- Downloads model weights
- Creates batch processing script

**GVHMR (Video-to-Motion) - Optional:**
- Clones GVHMR repository
- Creates separate Python virtual environment
- Installs YOLOv8 + ViTPose + dependencies
- Downloads all required weights:
  - GVHMR model weights
  - YOLOv8 weights
  - ViTPose weights
- Creates video batch processing script

### Generated Files

The script creates helper scripts in `/workspace/`:

**`batch_process_hymotion.py`**
```bash
python batch_process_hymotion.py \
  --input /workspace/prompts \
  --output /workspace/motion_data
```

**`batch_process_gvhmr.py`** (if --gvhmr used)
```bash
python batch_process_gvhmr.py \
  --input /workspace/videos \
  --output /workspace/motion_data
```

## Typical Workflow

### 1. Initial Setup

```bash
# SSH into RunPod
ssh user@runpod-instance.com

# Upload setup script
scp scripts/runpod_setup.sh user@runpod:/workspace/

# Run setup
cd /workspace
./runpod_setup.sh --gvhmr
```

### 2. Upload Data

```bash
# From local machine
rsync -avz --progress prompts/ user@runpod:/workspace/prompts/
rsync -avz --progress videos/ user@runpod:/workspace/videos/
```

### 3. Run Processing

```bash
# On RunPod - HY-Motion (text-to-motion)
cd /workspace/HY-Motion
source .venv/bin/activate
python /workspace/batch_process_hymotion.py \
  --input /workspace/prompts \
  --output /workspace/motion_data

# On RunPod - GVHMR (video-to-motion)
cd /workspace/GVHMR
source .venv/bin/activate
python /workspace/batch_process_gvhmr.py \
  --input /workspace/videos \
  --output /workspace/motion_data
```

### 4. Download Results

```bash
# From local machine
rsync -avz --progress user@runpod:/workspace/motion_data/ motion_data/
```

## Idempotency

The script checks for existing installations and skips steps that are already complete:

- ✓ Repo already cloned → `git pull` to update
- ✓ Venv already exists → Skip creation
- ✓ Weights already downloaded → Skip download
- ✓ Dependencies installed → Skip installation

You can safely run the script multiple times to:
- Resume interrupted setup
- Update repositories
- Verify installation

## Troubleshooting

**Out of disk space:**
```bash
df -h /workspace
# Clean up unnecessary files
rm -rf /workspace/temp/
```

**GPU not detected:**
```bash
nvidia-smi
# Should show your GPU
```

**Python version wrong:**
```bash
python3 --version
# Should be 3.10+
```

**Weights download failed:**
- Check the URLs in the script
- Download manually and place in correct location
- Script shows exact paths needed

## Cost Optimization

**RunPod Pricing Tips:**
- Use Spot instances for batch processing ($0.34/hr vs $1.10/hr)
- Stop instance when not in use
- Download results promptly
- Clean up temporary files

**Estimated Processing Times:**
- HY-Motion: ~30-60s per exercise
- GVHMR: ~2-5 minutes per video
- 200 exercises: ~2-4 hours total

## Security Notes

⚠️ **Never commit:**
- RunPod SSH keys
- API credentials
- Downloaded model weights

✅ **Safe to commit:**
- Setup scripts
- Configuration files
- Documentation

---

## download_results.sh (New - Comprehensive) ⭐

**Recommended for production downloads**

```bash
./download_results.sh user@runpod-instance.com
```

### Features

**Pre-flight checks:**
- ✅ Verifies manifest.json exists locally
- ✅ Tests SSH connectivity
- ✅ Checks remote directory exists
- ✅ Shows remote file count

**Download:**
- Uses rsync with progress bars
- Shows transfer speeds
- Handles large batches efficiently

**Verification:**
- Counts files against expected 219
- Calculates completion percentage
- Identifies missing exercises by slug
- Compares against manifest.json

**File analysis:**
- Reports total size in MB
- Shows average/min/max file sizes
- Detects suspiciously small files (< 10 KB)
- Warns about potential corruption

**Auto-generated helpers:**
- Creates `missing_exercises.txt` with full list
- Generates `reprocess_missing.sh` for batch reprocessing
- Provides copy-paste commands for next steps

### Example Output

See `scripts/EXAMPLE_OUTPUT.md` for complete examples including:
- Complete success (219/219 files)
- Partial success with missing files
- Error scenarios
- Generated helper files

### Generated Files

**missing_exercises.txt:**
```
burpee-pull-up
mountain-climber-twist
pistol-squat
...
```

**reprocess_missing.sh:**
- Bash script with missing slugs array
- Ready to upload to RunPod
- Template for adding processing commands
- Loops through missing exercises

### Workflow Example

```bash
# 1. Download and verify
./scripts/download_results.sh user@runpod-instance.com

# Output shows: "Missing 32 files"
# Creates: missing_exercises.txt, reprocess_missing.sh

# 2. Reprocess missing on RunPod
scp reprocess_missing.sh user@runpod:/workspace/
ssh user@runpod
# Edit reprocess_missing.sh to add actual processing commands
bash /workspace/reprocess_missing.sh

# 3. Download again
./scripts/download_results.sh user@runpod-instance.com
# Output shows: "All files present! (219/219)"
```

### Status Indicators

**Complete (100%):**
```
Status: COMPLETE ✓
All motion data files are present!
```

**Incomplete (<100%):**
```
Status: INCOMPLETE (15% missing) ⚠
Next steps: [instructions for reprocessing]
```

**No files:**
```
Status: NO FILES DOWNLOADED ✗
Troubleshooting: [debugging steps]
```

