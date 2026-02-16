#!/usr/bin/env python3
"""
Video-to-Motion Processing (GVHMR Wrapper)

Processes iPhone videos through GVHMR pipeline to extract SMPL-H motion data.
Outputs .npy files matching HY-Motion's 22-joint format.

Usage:
    # Process single video
    python src/08_video_to_motion.py --input videos/push-up.mp4 --output motion_data --slug push-up

    # Process batch directory
    python src/08_video_to_motion.py --input videos/ --output motion_data

    # Preview without saving
    python src/08_video_to_motion.py --input videos/push-up.mp4 --preview

Requirements:
    - Must run on GPU instance with GVHMR installed
    - YOLOv8 and ViTPose models downloaded
    - CUDA-enabled GPU
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
import torch
from tqdm import tqdm

# GVHMR imports (adjust paths based on actual GVHMR installation)
try:
    from gvhmr.models import GVHMR
    from gvhmr.utils.video_preprocessing import track_and_crop_video
    from gvhmr.utils.renderer import Renderer
    GVHMR_AVAILABLE = True
except ImportError:
    print("⚠️  GVHMR not found. This script must run on GPU instance with GVHMR installed.")
    GVHMR_AVAILABLE = False

# YOLOv8 and ViTPose imports
try:
    from ultralytics import YOLO
    from vitpose import ViTPose
    PREPROCESSING_AVAILABLE = True
except ImportError:
    print("⚠️  YOLOv8 or ViTPose not found. Install with: pip install ultralytics vitpose-pytorch")
    PREPROCESSING_AVAILABLE = False


# SMPL-H joint mapping
# SMPL-H has 52 joints total: 22 body + 30 hand joints (15 per hand)
# We extract only the 22 body joints to match HY-Motion format
SMPL_H_BODY_JOINTS = [
    0,   # Pelvis
    1,   # Left Hip
    2,   # Right Hip
    3,   # Spine1
    4,   # Left Knee
    5,   # Right Knee
    6,   # Spine2
    7,   # Left Ankle
    8,   # Right Ankle
    9,   # Spine3
    10,  # Left Foot
    11,  # Right Foot
    12,  # Neck
    13,  # Left Collar
    14,  # Right Collar
    15,  # Head
    16,  # Left Shoulder
    17,  # Right Shoulder
    18,  # Left Elbow
    19,  # Right Elbow
    20,  # Left Wrist
    21,  # Right Wrist
]

assert len(SMPL_H_BODY_JOINTS) == 22, "Must extract exactly 22 body joints"


class VideoToMotionProcessor:
    """Processes videos through GVHMR to extract motion data."""

    def __init__(
        self,
        device: str = "cuda",
        model_path: Optional[str] = None,
        yolo_path: str = "models/yolov8x.pt",
        vitpose_path: str = "models/vitpose-h.pth",
    ):
        """
        Initialize GVHMR processor.

        Args:
            device: "cuda" or "cpu"
            model_path: Path to GVHMR checkpoint (uses default if None)
            yolo_path: Path to YOLOv8 weights
            vitpose_path: Path to ViTPose weights
        """
        self.device = device

        # Check dependencies
        if not GVHMR_AVAILABLE:
            raise ImportError("GVHMR not available. Run on GPU instance with GVHMR installed.")
        if not PREPROCESSING_AVAILABLE:
            raise ImportError("YOLOv8 or ViTPose not available. Install preprocessing tools.")

        print(f"🔧 Initializing GVHMR on {device}...")

        # Load GVHMR model
        self.model = GVHMR.from_pretrained(model_path).to(device)
        self.model.eval()

        # Load preprocessing models
        print("🔧 Loading YOLOv8 for person detection...")
        self.yolo = YOLO(yolo_path)

        print("🔧 Loading ViTPose for keypoint estimation...")
        self.vitpose = ViTPose(vitpose_path, device=device)

        print("✅ Models loaded successfully")

    def preprocess_video(
        self,
        video_path: str,
        output_dir: Optional[str] = None,
    ) -> Dict:
        """
        Preprocess video with YOLOv8 tracking and ViTPose keypoints.

        Args:
            video_path: Path to input video
            output_dir: Optional directory to save preprocessed data

        Returns:
            Dictionary with:
                - frames: List of cropped video frames (T, H, W, 3)
                - bboxes: Bounding boxes per frame (T, 4)
                - keypoints_2d: 2D keypoints per frame (T, 17, 3)
                - fps: Video frame rate
                - original_size: (width, height)
        """
        print(f"📹 Preprocessing video: {video_path}")

        # Load video
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        print(f"  📊 Video info: {total_frames} frames, {fps:.1f} FPS, {width}x{height}")

        # Track person through video with YOLOv8
        print("  🎯 Detecting and tracking person...")
        results = self.yolo.track(video_path, persist=True, verbose=False)

        frames = []
        bboxes = []
        keypoints_2d = []

        # Process each frame
        for frame_idx, result in enumerate(tqdm(results, desc="  🔍 Processing frames")):
            frame = result.orig_img

            # Get person bounding box (class 0 = person)
            person_boxes = result.boxes[result.boxes.cls == 0]

            if len(person_boxes) == 0:
                print(f"  ⚠️  No person detected in frame {frame_idx}")
                continue

            # Use highest confidence detection
            best_idx = person_boxes.conf.argmax()
            bbox = person_boxes.xyxy[best_idx].cpu().numpy()  # [x1, y1, x2, y2]

            # Crop and pad frame around person
            x1, y1, x2, y2 = bbox.astype(int)
            padding = 20  # pixels
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(width, x2 + padding)
            y2 = min(height, y2 + padding)

            cropped = frame[y1:y2, x1:x2]

            # Estimate 2D keypoints with ViTPose
            keypoints = self.vitpose(cropped)  # (17, 3) - [x, y, confidence]

            # Adjust keypoints to original frame coordinates
            keypoints[:, 0] += x1
            keypoints[:, 1] += y1

            frames.append(cropped)
            bboxes.append([x1, y1, x2, y2])
            keypoints_2d.append(keypoints)

        cap.release()

        if len(frames) == 0:
            raise ValueError(f"No person detected in video: {video_path}")

        print(f"  ✅ Preprocessed {len(frames)} frames")

        preprocessed = {
            "frames": frames,
            "bboxes": np.array(bboxes),
            "keypoints_2d": np.array(keypoints_2d),
            "fps": fps,
            "original_size": (width, height),
        }

        # Optionally save preprocessed data
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            base_name = Path(video_path).stem
            np.savez(
                os.path.join(output_dir, f"{base_name}_preprocessed.npz"),
                **preprocessed
            )
            print(f"  💾 Saved preprocessed data to {output_dir}")

        return preprocessed

    def run_gvhmr(
        self,
        preprocessed_data: Dict,
    ) -> np.ndarray:
        """
        Run GVHMR inference to extract SMPL-H parameters.

        Args:
            preprocessed_data: Output from preprocess_video()

        Returns:
            SMPL-H joint positions (T, 22, 3) in meters
        """
        frames = preprocessed_data["frames"]
        keypoints_2d = preprocessed_data["keypoints_2d"]

        print(f"🎬 Running GVHMR inference on {len(frames)} frames...")

        # Prepare batch
        batch = {
            "frames": torch.from_numpy(np.array(frames)).to(self.device),
            "keypoints_2d": torch.from_numpy(keypoints_2d).to(self.device),
        }

        # Run inference
        with torch.no_grad():
            output = self.model(batch)

        # Extract SMPL-H joints
        # GVHMR outputs full 52-joint SMPL-H, we extract the 22 body joints
        smpl_joints = output["smpl_joints"].cpu().numpy()  # (T, 52, 3)
        body_joints = smpl_joints[:, SMPL_H_BODY_JOINTS, :]  # (T, 22, 3)

        print(f"  ✅ Extracted motion: {body_joints.shape}")
        print(f"  📏 Motion range: X=[{body_joints[:,:,0].min():.2f}, {body_joints[:,:,0].max():.2f}] m")
        print(f"               Y=[{body_joints[:,:,1].min():.2f}, {body_joints[:,:,1].max():.2f}] m")
        print(f"               Z=[{body_joints[:,:,2].min():.2f}, {body_joints[:,:,2].max():.2f}] m")

        return body_joints

    def process_video(
        self,
        video_path: str,
        output_path: Optional[str] = None,
        slug: Optional[str] = None,
        preview: bool = False,
    ) -> np.ndarray:
        """
        Complete pipeline: preprocess + GVHMR inference.

        Args:
            video_path: Path to input video
            output_path: Path to save .npy file (or directory if slug provided)
            slug: Exercise slug for naming (e.g., "push-up")
            preview: If True, don't save, just return

        Returns:
            Motion data (T, 22, 3)
        """
        # Preprocess video
        preprocessed = self.preprocess_video(video_path)

        # Run GVHMR
        motion_data = self.run_gvhmr(preprocessed)

        # Save output
        if not preview:
            if slug and output_path:
                # Save to directory with slug naming
                os.makedirs(output_path, exist_ok=True)
                save_path = os.path.join(output_path, f"{slug}.npy")
            elif output_path:
                save_path = output_path
            else:
                # Default: save next to video
                save_path = str(Path(video_path).with_suffix(".npy"))

            np.save(save_path, motion_data)
            print(f"💾 Saved motion data: {save_path}")
            print(f"   Shape: {motion_data.shape}")
            print(f"   Size: {os.path.getsize(save_path) / 1024:.1f} KB")
        else:
            print("👁️  Preview mode - not saving")

        return motion_data

    def process_batch(
        self,
        input_dir: str,
        output_dir: str,
        video_extensions: List[str] = [".mp4", ".mov", ".avi"],
    ) -> Dict[str, np.ndarray]:
        """
        Process all videos in a directory.

        Args:
            input_dir: Directory containing video files
            output_dir: Directory to save .npy files
            video_extensions: List of valid video file extensions

        Returns:
            Dictionary mapping slug -> motion_data
        """
        input_path = Path(input_dir)
        os.makedirs(output_dir, exist_ok=True)

        # Find all video files
        video_files = []
        for ext in video_extensions:
            video_files.extend(input_path.glob(f"*{ext}"))

        if len(video_files) == 0:
            raise ValueError(f"No video files found in {input_dir}")

        print(f"📹 Found {len(video_files)} videos to process")

        results = {}

        for video_path in video_files:
            slug = video_path.stem
            print(f"\n{'='*60}")
            print(f"Processing: {slug}")
            print(f"{'='*60}")

            try:
                motion_data = self.process_video(
                    str(video_path),
                    output_path=output_dir,
                    slug=slug,
                    preview=False,
                )
                results[slug] = motion_data
                print(f"✅ Success: {slug}")

            except Exception as e:
                print(f"❌ Failed: {slug}")
                print(f"   Error: {str(e)}")
                continue

        print(f"\n{'='*60}")
        print(f"✅ Batch complete: {len(results)}/{len(video_files)} videos processed")
        print(f"{'='*60}")

        return results


def main():
    parser = argparse.ArgumentParser(
        description="Process videos through GVHMR to extract motion data"
    )
    parser.add_argument(
        "--input",
        type=str,
        required=True,
        help="Input video file or directory",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="motion_data",
        help="Output directory for .npy files (default: motion_data)",
    )
    parser.add_argument(
        "--slug",
        type=str,
        help="Exercise slug for naming (only for single file mode)",
    )
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Preview mode - don't save output",
    )
    parser.add_argument(
        "--device",
        type=str,
        default="cuda",
        help="Device to use (cuda or cpu)",
    )
    parser.add_argument(
        "--model",
        type=str,
        help="Path to GVHMR checkpoint (optional)",
    )
    parser.add_argument(
        "--yolo",
        type=str,
        default="models/yolov8x.pt",
        help="Path to YOLOv8 weights",
    )
    parser.add_argument(
        "--vitpose",
        type=str,
        default="models/vitpose-h.pth",
        help="Path to ViTPose weights",
    )

    args = parser.parse_args()

    # Check if input is file or directory
    input_path = Path(args.input)
    is_directory = input_path.is_dir()

    if not input_path.exists():
        print(f"❌ Error: Input not found: {args.input}")
        sys.exit(1)

    # Initialize processor
    try:
        processor = VideoToMotionProcessor(
            device=args.device,
            model_path=args.model,
            yolo_path=args.yolo,
            vitpose_path=args.vitpose,
        )
    except Exception as e:
        print(f"❌ Failed to initialize processor: {e}")
        sys.exit(1)

    # Process
    try:
        if is_directory:
            # Batch mode
            processor.process_batch(
                input_dir=str(input_path),
                output_dir=args.output,
            )
        else:
            # Single file mode
            if not args.slug and not args.preview:
                # Auto-generate slug from filename
                args.slug = input_path.stem
                print(f"ℹ️  Auto-generated slug: {args.slug}")

            processor.process_video(
                video_path=str(input_path),
                output_path=args.output,
                slug=args.slug,
                preview=args.preview,
            )

    except Exception as e:
        print(f"❌ Processing failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print("\n✨ Done!")


if __name__ == "__main__":
    main()
