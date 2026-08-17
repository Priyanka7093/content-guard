from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from transformers import pipeline
from ultralytics import YOLO
import shutil
import sqlite3
import os
import time
from datetime import datetime

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load AI models once, when the server starts
text_classifier = pipeline("text-classification", model="unitary/toxic-bert")
image_model = YOLO("yolov8n.pt")
weapons_model = YOLO("weapons_model.pt")
nsfw_classifier = pipeline("image-classification", model="Falconsai/nsfw_image_detection")

UNSAFE_CATEGORIES = {"knife", "scissors", "baseball bat"}
WEAPONS_CONFIDENCE_THRESHOLD = 0.4

# Folder where uploaded images are permanently saved
os.makedirs("uploaded_images", exist_ok=True)

class TextRequest(BaseModel):
    text: str

# ---------- Database setup ----------
def init_db():
    conn = sqlite3.connect("moderation.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_type TEXT,
            content TEXT,
            details TEXT,
            verdict TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

def log_result(input_type, content, details, verdict):
    conn = sqlite3.connect("moderation.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO logs (input_type, content, details, verdict, timestamp) VALUES (?, ?, ?, ?, ?)",
        (input_type, content, str(details), verdict, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

init_db()
# -------------------------------------

@app.get("/")
def home():
    return {"message": "Hello! My content moderation API is alive!"}

@app.post("/moderate/text")
def moderate_text(request: TextRequest):
    result = text_classifier(request.text)[0]
    label = result["label"]
    score = result["score"]

    verdict = "BLOCKED" if (label == "toxic" and score > 0.5) else "ALLOWED"

    log_result("text", request.text, {"label": label, "confidence": round(score, 4)}, verdict)

    return {
        "input": request.text,
        "label": label,
        "confidence": round(score, 4),
        "verdict": verdict
    }

@app.post("/moderate/image")
def moderate_image(file: UploadFile = File(...)):
    # Save the uploaded image permanently, with a timestamp so filenames never clash
    saved_filename = f"{int(time.time())}_{file.filename}"
    temp_path = f"uploaded_images/{saved_filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1. General object detection (YOLO base)
    results = image_model(temp_path)
    detected_items = []
    unsafe_object_found = False

    for result in results:
        for box in result.boxes:
            class_name = image_model.names[int(box.cls[0])]
            confidence = float(box.conf[0])
            detected_items.append({"item": class_name, "confidence": round(confidence, 2)})
            if class_name in UNSAFE_CATEGORIES:
                unsafe_object_found = True

    # 2. Custom weapons detection
    weapons_results = weapons_model(temp_path)
    detected_weapons = []
    weapon_found = False

    for result in weapons_results:
        for box in result.boxes:
            class_name = weapons_model.names[int(box.cls[0])]
            confidence = float(box.conf[0])
            if confidence >= WEAPONS_CONFIDENCE_THRESHOLD:
                detected_weapons.append({"item": class_name, "confidence": round(confidence, 2)})
                weapon_found = True

    # 3. NSFW classification
    nsfw_result = nsfw_classifier(temp_path)
    top_label = max(nsfw_result, key=lambda x: x["score"])
    is_nsfw = top_label["label"] == "nsfw" and top_label["score"] > 0.5

    # Final verdict
    unsafe_found = unsafe_object_found or weapon_found or is_nsfw
    verdict = "BLOCKED" if unsafe_found else "ALLOWED"

    details = {
        "detected_items": detected_items,
        "detected_weapons": detected_weapons,
        "nsfw_check": {"label": top_label["label"], "confidence": round(top_label["score"], 4)}
    }
    # Log the saved file path (not just the original filename) so the exact image can be found later
    log_result("image", temp_path, details, verdict)

    return {
        "filename": file.filename,
        "saved_path": temp_path,
        "detected_items": detected_items,
        "detected_weapons": detected_weapons,
        "nsfw_check": {
            "label": top_label["label"],
            "confidence": round(top_label["score"], 4)
        },
        "verdict": verdict
    }

@app.get("/logs")
def get_logs():
    conn = sqlite3.connect("moderation.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, input_type, content, details, verdict, timestamp FROM logs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    logs = []
    for row in rows:
        logs.append({
            "id": row[0],
            "input_type": row[1],
            "content": row[2],
            "details": row[3],
            "verdict": row[4],
            "timestamp": row[5]
        })
    return {"total": len(logs), "logs": logs}