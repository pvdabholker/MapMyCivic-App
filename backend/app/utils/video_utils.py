import cv2


def extract_frames(video_path):
    """
    🎥 Extract frames from video
    - Takes 1 frame per second
    - Resizes for YOLO (640x640)
    - Limits total frames (performance safe)
    """

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise Exception("Failed to open video file")

    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 1

    frames = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # ✅ Take 1 frame per second
        if frame_count % fps == 0:
            try:
                frame = cv2.resize(frame, (640, 640))  # resize for YOLO
                frames.append(frame)
            except Exception:
                continue  # skip bad frame

        frame_count += 1

    cap.release()

    # ❌ No frames extracted → error
    if len(frames) == 0:
        raise Exception("No frames extracted from video")

    # ✅ Limit frames (important for performance)
    frames = frames[:10]

    return frames