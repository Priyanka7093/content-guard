from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from transformers import pipeline
import shutil
import os

app = FastAPI(title="Image Moderation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load all 3 image models once, when the service starts
image_model = YOLO("yolov8n.pt")
weapons_model = YOLO("weapons_model.pt")
nsfw_classifier = pipeline("image-classification", model="Falconsai/nsfw_image_detection")
model_loaded = True

WEAPONS_CONFIDENCE_THRESHOLD = 0.4

os.makedirs("temp_uploads", exist_ok=True)

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model_loaded}

@app.post("/predict")
def predict(file: UploadFile = File(...)):
    temp_path = f"temp_uploads/{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1. General object detection
    results = image_model(temp_path)
    objects = []
    for result in results:
        for box in result.boxes:
            class_name = image_model.names[int(box.cls[0])]
            confidence = float(box.conf[0])
            objects.append({"class": class_name, "confidence": round(confidence, 2)})

    # 2. Custom weapons detection
    weapons_results = weapons_model(temp_path)
    weapons = []
    for result in weapons_results:
        for box in result.boxes:
            class_name = weapons_model.names[int(box.cls[0])]
            confidence = float(box.conf[0])
            if confidence >= WEAPONS_CONFIDENCE_THRESHOLD:
                weapons.append({"class": class_name, "confidence": round(confidence, 2)})

    # 3. NSFW classification
    nsfw_result = nsfw_classifier(temp_path)
    top_label = max(nsfw_result, key=lambda x: x["score"])
    is_nsfw = top_label["label"] == "nsfw" and top_label["score"] > 0.5

    return {
        "objects": objects,
        "weapons": weapons,
        "nsfw": {
            "detected": is_nsfw,
            "confidence": round(top_label["score"], 4)
        }
    }