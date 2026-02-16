# Example Script Outputs

## download_results.sh - Complete Success

```
============================================================
Pre-flight Checks
============================================================

✓ Found manifest.json
Testing connection to user@runpod-instance.com...
✓ SSH connection successful
✓ Remote motion_data directory found

============================================================
Downloading Motion Data
============================================================

Remote file count: 219
Downloading files...

receiving file list ... 219 files
push-up.npy           45.2 KB [============================] 100%
squat.npy            52.1 KB [============================] 100%
burpee.npy           68.3 KB [============================] 100%
...

sent 8,842 bytes  received 9,876,543 bytes  395,678.00 bytes/sec
total size is 9,845,621  speedup is 1.00

✓ Download complete

============================================================
Verification
============================================================

Downloaded: 219 files
Expected:   219 files
Progress:   100%

✓ All files present! (219/219)

============================================================
File Size Analysis
============================================================

File count:  219
Total size:  9.4 MB
Avg size:    44.2 KB
Min size:    12.3 KB
Max size:    98.7 KB

============================================================
Summary
============================================================

Download Details:
  Remote host:    user@runpod-instance.com
  Local dir:      /path/to/motion_data
  Files obtained: 219 / 219

Status: COMPLETE ✓

All motion data files are present!

Next steps:
  1. Verify file integrity: ls -lh motion_data/ | head -20
  2. Run rendering: python src/03_render_animations.py

═══════════════════════════════════════════════════════════
```

## download_results.sh - Partial Success

```
============================================================
Pre-flight Checks
============================================================

✓ Found manifest.json
✓ SSH connection successful
✓ Remote motion_data directory found

============================================================
Downloading Motion Data
============================================================

Remote file count: 187
Downloading files...
[... transfer ...]
✓ Download complete

============================================================
Verification
============================================================

Downloaded: 187 files
Expected:   219 files
Progress:   85%

⚠ Missing files (187/219)

============================================================
Missing Files Analysis
============================================================

Missing 32 files:

  burpee-pull-up.npy
  mountain-climber-twist.npy
  pistol-squat.npy
  handstand-push-up.npy
  dragon-flag.npy
  planche-progression.npy
  front-lever-hold.npy
  muscle-up.npy
  l-sit-hold.npy
  human-flag.npy
  one-arm-push-up.npy
  archer-pull-up.npy
  shrimp-squat.npy
  nordic-curl.npy
  sissy-squat.npy
  typewriter-pull-up.npy
  pike-push-up.npy
  pseudo-planche-push-up.npy
  tuck-planche-hold.npy
  v-sit-hold.npy
  ... and 12 more

ℹ Full list saved to: missing_exercises.txt
ℹ Created reprocessing script: reprocess_missing.sh

============================================================
File Size Analysis
============================================================

File count:  187
Total size:  8.1 MB
Avg size:    44.5 KB
Min size:    8.2 KB
Max size:    92.1 KB

⚠ Warning: 3 files are suspiciously small (< 10 KB)
  These files may be corrupted or incomplete

============================================================
Summary
============================================================

Status: INCOMPLETE (15% missing) ⚠

Next steps:
  1. Review missing_exercises.txt for full list
  2. Upload reprocess_missing.sh to RunPod
  3. Run reprocessing on RunPod
  4. Download again with this script

Quick commands:
  scp reprocess_missing.sh user@runpod:/workspace/
  ssh user@runpod 'bash /workspace/reprocess_missing.sh'
  ./scripts/download_results.sh user@runpod

═══════════════════════════════════════════════════════════
```
