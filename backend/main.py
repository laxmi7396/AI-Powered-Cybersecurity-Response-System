"""
main.py  — FastAPI backend for the Cybersecurity Port Threat Analyzer
"""

from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import model_service


# ── Lifespan: train model on startup ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🔄  Initialising LSTM threat-detection model …")
    model_service.initialize_model()
    print("✅  Model ready.")
    yield


app = FastAPI(
    title="Cybersecurity Port Threat Analyzer API",
    description="LSTM-based network threat detection: enter a destination port and get SAFE / THREAT verdict.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow frontend (any origin for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ──────────────────────────────────────────────────────────────────
class PortRequest(BaseModel):
    destination_port: int = Field(
        ..., ge=0, le=65535, example=53,
        description="Destination TCP/UDP port number (0–65535)"
    )


class PredictionResponse(BaseModel):
    port: int
    threat_type: str
    status: str           # "SAFE" | "THREAT" | "UNKNOWN"
    is_safe: Optional[bool]
    action: str
    confidence: float     # percentage 0–100
    message: str


# ── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model_service.model is not None}


@app.post("/predict", response_model=PredictionResponse)
async def predict(req: PortRequest):
    try:
        result = model_service.predict_port(req.destination_port)
        return PredictionResponse(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


@app.get("/")
async def root():
    return {
        "message": "Cybersecurity Port Threat Analyzer API",
        "docs": "/docs",
        "predict": "POST /predict  { destination_port: <int> }",
    }
