from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from ultralytics import YOLO

from pathlib import Path
from collections import defaultdict, deque

import shutil
import subprocess
import uuid
import cv2


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="Dangerous Person Detection API",
    description=(
        "YOLO11n-based API for detecting normal_person and "
        "potentially_dangerous_person."
    ),
    version="2.1.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "best_hard_negative_v2.pt"
)

UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# MODEL
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

print("=" * 65)
print("DANGEROUS PERSON DETECTION API")
print("=" * 65)
print(f"Model : {MODEL_PATH}")
print("Device: CPU")
print("=" * 65)

model = YOLO(str(MODEL_PATH))

CLASS_NAMES = {
    0: "normal_person",
    1: "potentially_dangerous_person",
}


# ============================================================
# SETTINGS
# ============================================================

DEFAULT_CONFIDENCE = 0.25
DEFAULT_IOU = 0.50
IMAGE_SIZE = 640
DEVICE = "cpu"

SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
}

SUPPORTED_VIDEO_EXTENSIONS = {
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
}


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def validate_confidence(confidence: float) -> float:
    """
    Ensure confidence threshold is valid.
    """

    if confidence < 0.0 or confidence > 1.0:
        raise HTTPException(
            status_code=400,
            detail="Confidence must be between 0.0 and 1.0.",
        )

    return confidence


def safe_output_path(filename: str) -> Path:
    """
    Safely resolve an output filename.
    Prevents path traversal.
    """

    clean_name = Path(filename).name

    path = (
        OUTPUT_DIR
        / clean_name
    ).resolve()

    output_root = OUTPUT_DIR.resolve()

    if path.parent != output_root:
        raise HTTPException(
            status_code=400,
            detail="Invalid output filename.",
        )

    return path


def find_ffmpeg():
    """
    Find FFmpeg executable installed on the computer.
    """

    ffmpeg_path = shutil.which("ffmpeg")

    if ffmpeg_path:
        return ffmpeg_path

    # Common Windows installation locations
    possible_paths = [
        Path("C:/ffmpeg/bin/ffmpeg.exe"),
        Path("C:/Program Files/ffmpeg/bin/ffmpeg.exe"),
        Path("C:/Program Files (x86)/ffmpeg/bin/ffmpeg.exe"),
    ]

    for path in possible_paths:
        if path.exists():
            return str(path)

    return None


def convert_video_to_browser_mp4(
    source_path: Path,
    destination_path: Path,
):
    """
    Convert OpenCV-generated MP4 into browser-compatible H.264 MP4.

    Output:
        Codec       : H.264
        Pixel format: yuv420p
        Container   : MP4
        Fast start  : enabled
    """

    ffmpeg_path = find_ffmpeg()

    if not ffmpeg_path:
        raise RuntimeError(
            "FFmpeg was not found. Install FFmpeg and make sure "
            "the ffmpeg command is available in PATH."
        )

    command = [
        ffmpeg_path,

        # Overwrite destination
        "-y",

        # Input video
        "-i",
        str(source_path),

        # H.264 video codec
        "-c:v",
        "libx264",

        # Good balance between speed and file size
        "-preset",
        "veryfast",

        # Quality
        "-crf",
        "23",

        # Maximum browser compatibility
        "-pix_fmt",
        "yuv420p",

        # Move MP4 metadata to beginning
        # so browser playback can start immediately
        "-movflags",
        "+faststart",

        # No audio because the OpenCV processed
        # file currently contains video only
        "-an",

        str(destination_path),
    ]

    process = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    if process.returncode != 0:
        print("=" * 65)
        print("FFMPEG CONVERSION ERROR")
        print("=" * 65)
        print(process.stderr)
        print("=" * 65)

        raise RuntimeError(
            "FFmpeg failed to convert processed video to H.264."
        )

    if not destination_path.exists():
        raise RuntimeError(
            "H.264 output video was not created."
        )

    if destination_path.stat().st_size == 0:
        destination_path.unlink(
            missing_ok=True
        )

        raise RuntimeError(
            "H.264 output video is empty."
        )


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "status": "running",
        "project": "Dangerous Person Detection System",
        "model": "YOLO11n Hard-Negative V2",
        "model_file": MODEL_PATH.name,
        "device": "CPU",
        "classes": CLASS_NAMES,

        "video_output": {
            "container": "MP4",
            "codec": "H.264",
            "browser_compatible": True,
        },

        "endpoints": {
            "image_detection": "/predict-image",
            "video_detection": "/predict-video",
            "video_preview": "/preview/{filename}",
            "download": "/download/{filename}",
            "health": "/health",
        },
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    ffmpeg_path = find_ffmpeg()

    return {
        "status": "healthy",
        "model_loaded": True,
        "model_file": MODEL_PATH.name,
        "device": DEVICE,
        "ffmpeg_available": ffmpeg_path is not None,
        "ffmpeg_path": ffmpeg_path,
    }


# ============================================================
# IMAGE DETECTION
# ============================================================

@app.post("/predict-image")
async def predict_image(
    file: UploadFile = File(...),
    confidence: float = Form(DEFAULT_CONFIDENCE),
):

    confidence = validate_confidence(
        confidence
    )

    filename = (
        file.filename
        or "uploaded_image"
    )

    ext = Path(filename).suffix.lower()

    if ext not in SUPPORTED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image format. "
                "Supported formats: "
                "JPG, JPEG, PNG, BMP, WEBP."
            ),
        )

    temp_path = (
        UPLOAD_DIR
        / f"image_{uuid.uuid4().hex}{ext}"
    )

    try:

        # ----------------------------------------------------
        # Save uploaded image
        # ----------------------------------------------------

        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        # ----------------------------------------------------
        # Validate image
        # ----------------------------------------------------

        image = cv2.imread(
            str(temp_path)
        )

        if image is None:
            raise HTTPException(
                status_code=400,
                detail="Could not read uploaded image.",
            )

        image_height, image_width = (
            image.shape[:2]
        )

        # ----------------------------------------------------
        # YOLO inference
        # ----------------------------------------------------

        results = model.predict(
            source=str(temp_path),
            imgsz=IMAGE_SIZE,
            conf=confidence,
            iou=DEFAULT_IOU,
            agnostic_nms=True,
            device=DEVICE,
            verbose=False,
        )

        result = results[0]

        detections = []

        normal_count = 0
        dangerous_count = 0

        if result.boxes is not None:

            for box in result.boxes:

                cls_id = int(
                    box.cls.item()
                )

                conf_value = float(
                    box.conf.item()
                )

                xyxy = (
                    box.xyxy[0]
                    .cpu()
                    .tolist()
                )

                class_name = (
                    model.names.get(
                        cls_id,
                        CLASS_NAMES.get(
                            cls_id,
                            f"class_{cls_id}",
                        ),
                    )
                )

                if cls_id == 0:
                    normal_count += 1

                elif cls_id == 1:
                    dangerous_count += 1

                detections.append(
                    {
                        "class_id": cls_id,

                        "class_name":
                            class_name,

                        "display_name": (
                            "Normal Person"
                            if cls_id == 0
                            else
                            "Potentially Dangerous Person"
                        ),

                        "confidence":
                            round(
                                conf_value,
                                4,
                            ),

                        "confidence_percent":
                            round(
                                conf_value * 100,
                                2,
                            ),

                        "bbox": {
                            "x1": round(
                                xyxy[0],
                                2,
                            ),
                            "y1": round(
                                xyxy[1],
                                2,
                            ),
                            "x2": round(
                                xyxy[2],
                                2,
                            ),
                            "y2": round(
                                xyxy[3],
                                2,
                            ),
                        },
                    }
                )

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return {
            "status": "completed",
            "type": "image",
            "filename": filename,

            "image": {
                "width": image_width,
                "height": image_height,
            },

            "settings": {
                "confidence":
                    confidence,
                "iou":
                    DEFAULT_IOU,
                "imgsz":
                    IMAGE_SIZE,
            },

            "summary": {
                "total_detections":
                    len(detections),

                "normal_persons":
                    normal_count,

                "potentially_dangerous_persons":
                    dangerous_count,

                "alert":
                    dangerous_count > 0,
            },

            # Backward compatibility
            "detections_count":
                len(detections),

            "detections":
                detections,
        }

    finally:

        temp_path.unlink(
            missing_ok=True
        )


# ============================================================
# VIDEO DETECTION + BYTETRACK
# ============================================================

@app.post("/predict-video")
async def predict_video(
    file: UploadFile = File(...),
    confidence: float = Form(DEFAULT_CONFIDENCE),
):

    confidence = validate_confidence(
        confidence
    )

    filename = (
        file.filename
        or "uploaded_video"
    )

    ext = Path(filename).suffix.lower()

    if ext not in SUPPORTED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported video format. "
                "Supported formats: "
                "MP4, AVI, MOV, MKV."
            ),
        )

    # --------------------------------------------------------
    # Paths
    # --------------------------------------------------------

    unique_id = uuid.uuid4().hex

    input_path = (
        UPLOAD_DIR
        / f"video_{unique_id}{ext}"
    )

    # OpenCV creates this temporary file first.
    raw_output_filename = (
        f"raw_tracked_{unique_id}.mp4"
    )

    raw_output_path = (
        OUTPUT_DIR
        / raw_output_filename
    )

    # Browser-compatible final H.264 file.
    output_filename = (
        f"tracked_{unique_id}.mp4"
    )

    output_path = (
        OUTPUT_DIR
        / output_filename
    )

    writer = None

    try:

        # ----------------------------------------------------
        # Save uploaded video
        # ----------------------------------------------------

        with input_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        # ----------------------------------------------------
        # Read metadata
        # ----------------------------------------------------

        cap = cv2.VideoCapture(
            str(input_path)
        )

        if not cap.isOpened():
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not open uploaded video."
                ),
            )

        fps = float(
            cap.get(
                cv2.CAP_PROP_FPS
            )
        )

        if fps <= 0:
            fps = 25.0

        width = int(
            cap.get(
                cv2.CAP_PROP_FRAME_WIDTH
            )
        )

        height = int(
            cap.get(
                cv2.CAP_PROP_FRAME_HEIGHT
            )
        )

        total_video_frames = int(
            cap.get(
                cv2.CAP_PROP_FRAME_COUNT
            )
        )

        cap.release()

        if width <= 0 or height <= 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid video dimensions."
                ),
            )

        # ----------------------------------------------------
        # OpenCV temporary video writer
        # ----------------------------------------------------

        fourcc = (
            cv2.VideoWriter_fourcc(
                *"mp4v"
            )
        )

        writer = cv2.VideoWriter(
            str(raw_output_path),
            fourcc,
            fps,
            (width, height),
        )

        if not writer.isOpened():
            raise HTTPException(
                status_code=500,
                detail=(
                    "Could not create temporary "
                    "processed video."
                ),
            )

        # ----------------------------------------------------
        # Tracking state
        # ----------------------------------------------------

        full_history = defaultdict(
            list
        )

        rolling_history = defaultdict(
            lambda: deque(
                maxlen=8
            )
        )

        total_frame_detections = 0
        frames_processed = 0

        # ----------------------------------------------------
        # YOLO + ByteTrack
        # ----------------------------------------------------

        results = model.track(
            source=str(input_path),
            imgsz=IMAGE_SIZE,
            conf=confidence,
            iou=DEFAULT_IOU,
            agnostic_nms=True,
            device=DEVICE,
            tracker="bytetrack.yaml",
            persist=True,
            stream=True,
            verbose=False,
        )

        for frame_no, result in enumerate(
            results,
            start=1,
        ):

            frame = (
                result.orig_img.copy()
            )

            frames_processed += 1

            if (
                result.boxes is not None
                and
                result.boxes.id is not None
            ):

                boxes = (
                    result.boxes.xyxy
                    .cpu()
                    .numpy()
                )

                track_ids = (
                    result.boxes.id
                    .cpu()
                    .numpy()
                    .astype(int)
                )

                classes = (
                    result.boxes.cls
                    .cpu()
                    .numpy()
                    .astype(int)
                )

                confidences = (
                    result.boxes.conf
                    .cpu()
                    .numpy()
                )

                for (
                    box,
                    track_id,
                    cls_id,
                    conf_value,
                ) in zip(
                    boxes,
                    track_ids,
                    classes,
                    confidences,
                ):

                    total_frame_detections += 1

                    # ----------------------------------------
                    # Prediction history
                    # ----------------------------------------

                    full_history[
                        track_id
                    ].append(
                        int(cls_id)
                    )

                    rolling_history[
                        track_id
                    ].append(
                        int(cls_id)
                    )

                    # ----------------------------------------
                    # Temporal smoothing
                    # ----------------------------------------

                    history = (
                        rolling_history[
                            track_id
                        ]
                    )

                    dangerous_votes = sum(
                        c == 1
                        for c in history
                    )

                    normal_votes = sum(
                        c == 0
                        for c in history
                    )

                    if (
                        dangerous_votes
                        > normal_votes
                    ):
                        final_cls = 1
                    else:
                        final_cls = 0

                    # ----------------------------------------
                    # Coordinates
                    # ----------------------------------------

                    x1, y1, x2, y2 = map(
                        int,
                        box,
                    )

                    # Keep bounding boxes inside frame.
                    x1 = max(
                        0,
                        min(x1, width - 1)
                    )

                    y1 = max(
                        0,
                        min(y1, height - 1)
                    )

                    x2 = max(
                        0,
                        min(x2, width - 1)
                    )

                    y2 = max(
                        0,
                        min(y2, height - 1)
                    )

                    # ----------------------------------------
                    # Display
                    # ----------------------------------------

                    if final_cls == 1:

                        display_name = (
                            "Potentially Dangerous"
                        )

                        # OpenCV uses BGR
                        color = (
                            0,
                            0,
                            255,
                        )

                    else:

                        display_name = (
                            "Normal"
                        )

                        color = (
                            0,
                            255,
                            0,
                        )

                    label = (
                        f"ID {track_id} | "
                        f"{display_name} | "
                        f"{conf_value:.2f}"
                    )

                    # ----------------------------------------
                    # Bounding box
                    # ----------------------------------------

                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        color,
                        3,
                    )

                    # ----------------------------------------
                    # Label background
                    # ----------------------------------------

                    (
                        text_width,
                        text_height,
                    ), baseline = (
                        cv2.getTextSize(
                            label,
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.65,
                            2,
                        )
                    )

                    label_y = max(
                        text_height + 12,
                        y1,
                    )

                    cv2.rectangle(
                        frame,
                        (
                            x1,
                            label_y
                            - text_height
                            - 12,
                        ),
                        (
                            min(
                                width - 1,
                                x1
                                + text_width
                                + 10,
                            ),
                            label_y,
                        ),
                        color,
                        -1,
                    )

                    # White label text gives better readability.
                    cv2.putText(
                        frame,
                        label,
                        (
                            x1 + 5,
                            label_y - 6,
                        ),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.65,
                        (
                            255,
                            255,
                            255,
                        ),
                        2,
                        cv2.LINE_AA,
                    )

            writer.write(
                frame
            )

        # ----------------------------------------------------
        # Close OpenCV writer BEFORE FFmpeg
        # ----------------------------------------------------

        writer.release()
        writer = None

        # ----------------------------------------------------
        # Convert MP4V -> H.264
        # ----------------------------------------------------

        print(
            "Converting processed video "
            "to browser-compatible H.264..."
        )

        convert_video_to_browser_mp4(
            source_path=raw_output_path,
            destination_path=output_path,
        )

        print(
            f"H.264 video created: {output_path}"
        )

        # Temporary MP4V video no longer required.
        raw_output_path.unlink(
            missing_ok=True
        )

        # ----------------------------------------------------
        # Track-level summary
        # ----------------------------------------------------

        track_results = []

        normal_tracks = 0
        dangerous_tracks = 0

        for (
            track_id,
            history,
        ) in full_history.items():

            normal_count = sum(
                cls_id == 0
                for cls_id in history
            )

            dangerous_count = sum(
                cls_id == 1
                for cls_id in history
            )

            total = len(
                history
            )

            dangerous_rate = (
                dangerous_count / total
                if total > 0
                else 0.0
            )

            if (
                dangerous_count
                > normal_count
            ):

                final_class_id = 1

                final_class_name = (
                    "potentially_dangerous_person"
                )

                display_name = (
                    "Potentially Dangerous Person"
                )

                dangerous_tracks += 1

            else:

                final_class_id = 0

                final_class_name = (
                    "normal_person"
                )

                display_name = (
                    "Normal Person"
                )

                normal_tracks += 1

            track_results.append(
                {
                    "track_id":
                        int(track_id),

                    "frames_detected":
                        total,

                    "normal_predictions":
                        normal_count,

                    "dangerous_predictions":
                        dangerous_count,

                    "dangerous_rate":
                        round(
                            dangerous_rate,
                            4,
                        ),

                    "final_class_id":
                        final_class_id,

                    "final_class_name":
                        final_class_name,

                    "display_name":
                        display_name,
                }
            )

        # Longest tracks first.
        track_results = sorted(
            track_results,
            key=lambda x:
                x["frames_detected"],
            reverse=True,
        )

        # ----------------------------------------------------
        # Final response
        # ----------------------------------------------------

        return {
            "status": "completed",
            "type": "video",

            "original_filename":
                filename,

            "settings": {
                "confidence":
                    confidence,
                "iou":
                    DEFAULT_IOU,
                "imgsz":
                    IMAGE_SIZE,
            },

            "video": {
                "fps":
                    round(
                        fps,
                        2,
                    ),

                "width":
                    width,

                "height":
                    height,

                "frames_processed":
                    frames_processed,

                "total_video_frames":
                    total_video_frames,

                "codec":
                    "H.264",

                "browser_compatible":
                    True,
            },

            "summary": {
                "total_frame_detections":
                    total_frame_detections,

                "unique_track_ids":
                    len(full_history),

                "normal_tracks":
                    normal_tracks,

                "potentially_dangerous_tracks":
                    dangerous_tracks,

                "alert":
                    dangerous_tracks > 0,
            },

            # ----------------------------------------------
            # Compatibility with existing frontend
            # ----------------------------------------------

            "frames_processed":
                frames_processed,

            "total_video_frames":
                total_video_frames,

            "total_frame_detections":
                total_frame_detections,

            "unique_tracked_persons":
                len(full_history),

            "normal_tracks":
                normal_tracks,

            "potentially_dangerous_tracks":
                dangerous_tracks,

            "tracks":
                track_results,

            "output_file":
                output_filename,

            # Recommended for <video src="">
            "preview_url":
                f"/preview/{output_filename}",

            # Keep existing frontend support.
            "download_url":
                f"/download/{output_filename}",
        }

    except HTTPException:
        raise

    except Exception as exc:

        print("=" * 65)
        print("VIDEO PROCESSING ERROR")
        print("=" * 65)
        print(str(exc))
        print("=" * 65)

        # Remove incomplete files.
        raw_output_path.unlink(
            missing_ok=True
        )

        output_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    finally:

        if writer is not None:
            writer.release()

        input_path.unlink(
            missing_ok=True
        )


# ============================================================
# INLINE VIDEO PREVIEW
# ============================================================

@app.get("/preview/{filename}")
def preview_processed_video(
    filename: str,
):

    output_path = safe_output_path(
        filename
    )

    if not output_path.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                "Processed video not found."
            ),
        )

    if not output_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="File not found.",
        )

    # Do not pass filename= here.
    # This allows the browser to treat it as
    # inline playable media instead of attachment.
    return FileResponse(
        path=str(output_path),
        media_type="video/mp4",
        headers={
            "Content-Disposition":
                f'inline; filename="{output_path.name}"',

            "Cache-Control":
                "no-cache",
        },
    )


# ============================================================
# DOWNLOAD PROCESSED VIDEO
# ============================================================

@app.get("/download/{filename}")
def download_processed_video(
    filename: str,
):

    output_path = safe_output_path(
        filename
    )

    if not output_path.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                "Processed video not found."
            ),
        )

    if not output_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="File not found.",
        )

    return FileResponse(
        path=str(output_path),
        media_type="video/mp4",
        filename=output_path.name,
    )