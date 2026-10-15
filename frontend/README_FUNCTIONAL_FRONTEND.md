# Dangerous-Person Detection — Functional Frontend

This frontend is wired to the FastAPI backend at `http://127.0.0.1:8000` by default.

## Run
1. Start the backend from the project root:
   `python -m uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000`
2. In this frontend folder run:
   `npm install`
   `npm run dev`
3. Open the Vite URL (normally `http://localhost:5173`).

## Optional backend URL
Copy `.env.example` to `.env` and change `VITE_API_BASE_URL` if your backend uses another host/port.

## Functional pages
- Detection: real image/video upload, confidence threshold, API inference, image bounding boxes, processed-video playback/download link, real result counts.
- Live Monitoring: browser webcam frames are sent to `/predict-image`; returned detections are rendered as live bounding boxes. This is sequential CPU-backed near-real-time inference, not a simulated feed.
- History: stores actual frontend detection summaries in browser localStorage. No fabricated events are seeded.
- Home: uses measured V2 frozen-validation metrics rather than fake operational counts.

Model terminology: `potentially_dangerous_person` is an observable visual classification and should not be interpreted as proof of intent.
