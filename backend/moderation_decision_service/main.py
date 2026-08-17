from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import decision_engine

app = FastAPI(title="Moderation Decision Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextDecisionRequest(BaseModel):
    toxic: bool
    confidence: float

class ImageDecisionRequest(BaseModel):
    objects: List[Dict] = []
    weapons: List[Dict] = []
    nsfw: Dict = {}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/decide/text")
def decide_text(request: TextDecisionRequest):
    return decision_engine.decide_text(request.toxic, request.confidence)

@app.post("/decide/image")
def decide_image(request: ImageDecisionRequest):
    return decision_engine.decide_image(request.objects, request.weapons, request.nsfw)