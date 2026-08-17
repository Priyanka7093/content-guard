from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="Text Moderation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the toxicity model once, when the service starts
classifier = pipeline("text-classification", model="unitary/toxic-bert")
model_loaded = True

class TextRequest(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model_loaded}

@app.post("/predict")
def predict(request: TextRequest):
    result = classifier(request.text)[0]
    label = result["label"]
    score = result["score"]

    is_toxic = label == "toxic" and score > 0.5

    return {
        "toxic": is_toxic,
        "confidence": round(score, 4),
        "reason": "Toxic content detected" if is_toxic else "Content appears safe"
    }