from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import config

app = FastAPI(title="API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/moderate/text")
def moderate_text(request: TextRequest):
    with httpx.Client(timeout=30) as client:
        # 1. Call Text Moderation Service
        text_response = client.post(
            f"{config.TEXT_SERVICE_URL}/predict",
            json={"text": request.text}
        ).json()

        # 2. Call Moderation Decision Service
        decision = client.post(
            f"{config.DECISION_SERVICE_URL}/decide/text",
            json={"toxic": text_response["toxic"], "confidence": text_response["confidence"]}
        ).json()

        # 3. Call Logging Service
        client.post(
            f"{config.LOGGING_SERVICE_URL}/logs",
            json={
                "content_type": "text",
                "content": request.text,
                "details": text_response,
                "verdict": decision["verdict"],
                "reasons": decision["reasons"],
                "confidence": decision["confidence"]
            }
        )

    return {
        "input": request.text,
        "toxic": text_response["toxic"],
        "confidence": text_response["confidence"],
        "verdict": decision["verdict"],
        "reasons": decision["reasons"]
    }

@app.post("/moderate/image")
def moderate_image(file: UploadFile = File(...)):
    file_bytes = file.file.read()

    with httpx.Client(timeout=60) as client:
        # 1. Call Image Moderation Service
        files = {"file": (file.filename, file_bytes, file.content_type)}
        image_response = client.post(
            f"{config.IMAGE_SERVICE_URL}/predict",
            files=files
        ).json()

        # 2. Call Moderation Decision Service
        decision = client.post(
            f"{config.DECISION_SERVICE_URL}/decide/image",
            json={
                "objects": image_response["objects"],
                "weapons": image_response["weapons"],
                "nsfw": image_response["nsfw"]
            }
        ).json()

        # 3. Call Logging Service
        client.post(
            f"{config.LOGGING_SERVICE_URL}/logs",
            json={
                "content_type": "image",
                "content": file.filename,
                "details": image_response,
                "verdict": decision["verdict"],
                "reasons": decision["reasons"],
                "confidence": decision["confidence"]
            }
        )

    return {
        "filename": file.filename,
        "objects": image_response["objects"],
        "weapons": image_response["weapons"],
        "nsfw": image_response["nsfw"],
        "verdict": decision["verdict"],
        "reasons": decision["reasons"]
    }

@app.get("/logs")
def get_logs():
    with httpx.Client(timeout=30) as client:
        response = client.get(f"{config.LOGGING_SERVICE_URL}/logs")
    return response.json()

@app.get("/statistics")
def get_statistics():
    with httpx.Client(timeout=30) as client:
        response = client.get(f"{config.LOGGING_SERVICE_URL}/statistics")
    return response.json()