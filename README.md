# Dangerous Person Detection System for Public Areas Using YOLO11


https://github.com/user-attachments/assets/27d708e8-474b-47d5-adcd-76ab6c914f65


An AI-based public-area safety monitoring system developed using **YOLO11**, **FastAPI**, **React**, and **ByteTrack**.

The system detects people in images, uploaded videos, and camera frames and classifies each detected person into one of two operational categories:

- `normal_person`
- `potentially_dangerous_person`

The potentially dangerous category is based on **observable visual weapon-associated cues**. It does not infer a person's intentions, criminality, or future behavior.

---

## 1. Project Overview

Public-area monitoring can require continuous observation of large amounts of visual data. This project investigates an automated computer-vision approach for assisting human operators by identifying people associated with visible weapon-related visual cues.

The system combines a YOLO11 object-detection model with a web-based interface and FastAPI backend.

The application supports:

- Image detection
- Video detection
- Bounding-box visualization
- Detection confidence scores
- Person classification
- Browser-camera monitoring
- ByteTrack-based video tracking
- Temporal prediction smoothing
- Detection history
- CPU-based local inference
- Adjustable confidence threshold

The system is intended as a **decision-support and monitoring tool** rather than an autonomous security decision system.

---

## 2. System Architecture

The application follows the pipeline:

```text
                 INPUT
                   |
        +----------+-----------+
        |          |           |
      Image      Video       Camera
        |          |           |
        +----------+-----------+
                   |
                   v
             React Frontend
                   |
                   | HTTP API
                   v
             FastAPI Backend
                   |
                   v
        YOLO11n Detection Model
                   |
          +--------+--------+
          |                 |
    normal_person    potentially_dangerous_person
          |                 |
          +--------+--------+
                   |
                   v
          Bounding Boxes +
        Confidence Scores
                   |
                   v
             User Interface
