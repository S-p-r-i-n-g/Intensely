# RunPod GPU Setup for GVHMR Processing

Complete guide to process exercise videos using GVHMR on RunPod GPU instances.

## Step 1: Create RunPod Account

1. Go to: https://www.runpod.io
2. Sign up for an account
3. Add credits: **$10 minimum** (will last ~10-20 hours on RTX 4090)

## Step 2: Deploy GPU Instance

### Launch Template

1. Go to: https://www.runpod.io/console/gpu-cloud
2. Click **Deploy** → **GPU Instance**
3. Choose GPU:
   - **Recommended:** RTX 4090 (~$0.50/hour)
   - **Budget:** RTX 3090 (~$0.35/hour)
   - **Premium:** A100 (~$1.50/hour)

4. Select Template:
   - Use **PyTorch** or **RunPod Pytorch** template
   - Or use **Custom** with PyTorch pre-installed

5. Configure:
   - **Container Disk:** 50 GB
   - **Volume Disk:** 20 GB (optional)
   - **Expose HTTP/HTTPS:** Yes
   - **Expose TCP Ports:** 22 (SSH)

6. Click **Deploy**

### Wait for Instance

- Status will change from "Starting" → "Running"
- Takes 1-2 minutes
- You'll see IP address and SSH connection info

## Step 3: Connect via SSH

RunPod provides SSH credentials in the pod details:

```bash
# Copy SSH command from RunPod dashboard
ssh root@<pod-ip> -p <port> -i ~/.ssh/id_ed25519
```

Or use the web terminal in RunPod dashboard.

## Step 4: Install GVHMR and Dependencies

Once connected to the GPU instance:

```bash
# Update system
apt-get update && apt-get install -y git wget

# Install GVHMR
cd /workspace
git clone https://github.com/zju3dv/GVHMR.git
cd GVHMR

# Install Python dependencies
pip install -r requirements.txt

# Download pre-trained models
mkdir -p checkpoints
cd checkpoints

# Download GVHMR model weights
wget https://github.com/zju3dv/GVHMR/releases/download/v1.0/gvhmr_siga24_release.pth

# Download SMPL-H model (requires registration at smpl-x.is.tue.mpg.de)
# You'll need to download manually and upload via SCP
```

## Step 5: Install Additional Dependencies

```bash
# YOLOv8 (person detection)
pip install ultralytics

# ViTPose (keypoint detection)
pip install git+https://github.com/ViTAE-Transformer/ViTPose.git

# Download YOLOv8 model
cd /workspace/GVHMR
mkdir -p models
cd models
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8x.pt

# Download ViTPose model
wget https://1drv.ms/u/s!AimBgYV7JjTlgShLMI-kkmvNfF_h?e=dEhGHe -O vitpose-h-multi-coco.pth
```

## Step 6: Upload Your Videos

From your local machine:

```bash
# Upload videos directory
scp -P <runpod-port> -r /Users/dspring/Projects/CursorClaudeCode/animation-pipeline/videos root@<runpod-ip>:/workspace/

# Upload processing script
scp -P <runpod-port> /Users/dspring/Projects/CursorClaudeCode/animation-pipeline/src/08_video_to_motion.py root@<runpod-ip>:/workspace/
```

## Step 7: Process Videos

On the GPU instance:

```bash
cd /workspace

# Process all videos in batch
python 08_video_to_motion.py --input videos/ --output motion_data

# Or process one at a time
python 08_video_to_motion.py --input videos/bench-dips.mp4 --output motion_data --slug bench-dips
```

### Expected Output

```
Processing: bench-dips.mp4
  ✓ YOLOv8 detection: Found person
  ✓ ViTPose keypoints: 17 keypoints detected
  ✓ GVHMR inference: SMPL-H motion extracted
  ✓ Output: motion_data/bench-dips.npy (22 joints, 90 frames)

Processing: bodyweight-squat.mp4
  ✓ YOLOv8 detection: Found person
  ✓ ViTPose keypoints: 17 keypoints detected
  ✓ GVHMR inference: SMPL-H motion extracted
  ✓ Output: motion_data/bodyweight-squat.npy (22 joints, 120 frames)

...

Summary: 5/5 videos processed successfully
```

## Step 8: Download Motion Data

From your local machine:

```bash
# Download all motion data
scp -P <runpod-port> -r root@<runpod-ip>:/workspace/motion_data /Users/dspring/Projects/CursorClaudeCode/animation-pipeline/
```

## Step 9: Stop the Instance

**IMPORTANT:** Don't forget to stop your pod when done!

1. Go to RunPod dashboard
2. Click **Stop** on your pod
3. Verify it shows "Stopped" (you're not being charged)

You can restart the same pod later if needed.

## Costs

**Estimated costs for 5 videos:**
- Setup time: 15-20 minutes
- Processing time: 2-5 minutes per video = 10-25 minutes total
- **Total runtime:** ~30-45 minutes
- **Cost:** $0.25-0.40 on RTX 4090

## Troubleshooting

### CUDA Out of Memory

Reduce batch size or use smaller GPU:
```bash
python 08_video_to_motion.py --input videos/bench-dips.mp4 --batch-size 1
```

### SMPL-H Model Not Found

You need to register at https://smpl-x.is.tue.mpg.de/ to download SMPL-H models.
1. Register and agree to license
2. Download SMPL-H model
3. Upload to RunPod: `scp -P <port> SMPLH_*.pkl root@<ip>:/workspace/GVHMR/checkpoints/`

### Video Format Issues

Convert to standard format:
```bash
ffmpeg -i input.mov -c:v libx264 -preset fast -crf 22 output.mp4
```

### Connection Issues

Use RunPod web terminal instead of SSH:
- Click **Connect** → **Start Web Terminal** in pod details

## Alternative: Vast.ai

Similar process, typically cheaper but less user-friendly:
1. Go to https://vast.ai
2. Search for GPU with PyTorch template
3. Follow similar setup steps

## Alternative: Google Colab

Free option with limitations:
- Limited GPU hours per day
- May disconnect after 90 minutes
- Slower file uploads
- Not recommended for production

---

**Next Steps:** After downloading motion data, continue with local rendering pipeline.
