from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import database

app = FastAPI(title="Logging Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database.init_db()

class LogEntry(BaseModel):
    content_type: str
    content: str
    details: dict
    verdict: str
    reasons: list = []
    confidence: Optional[float] = 0.0

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/logs")
def create_log(entry: LogEntry):
    log_id = database.insert_log(
        entry.content_type, entry.content, entry.details,
        entry.verdict, entry.reasons, entry.confidence
    )
    return {"id": log_id, "message": "Log saved"}

@app.get("/logs")
def get_logs():
    rows = database.get_all_logs()
    logs = []
    for row in rows:
        logs.append({
            "id": row[0],
            "content_type": row[1],
            "content": row[2],
            "details": row[3],
            "verdict": row[4],
            "reasons": row[5],
            "confidence": row[6],
            "timestamp": row[7]
        })
    return {"total": len(logs), "logs": logs}

@app.get("/logs/{log_id}")
def get_log(log_id: int):
    row = database.get_log_by_id(log_id)
    if not row:
        return {"error": "Log not found"}
    return {
        "id": row[0],
        "content_type": row[1],
        "content": row[2],
        "details": row[3],
        "verdict": row[4],
        "reasons": row[5],
        "confidence": row[6],
        "timestamp": row[7]
    }

@app.get("/statistics")
def statistics():
    return database.get_statistics()