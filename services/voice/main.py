"""
Voice service — mic input → text → Hermes.
Uses Anthropic's API for transcription fallback.
"""

import os
import logging
import httpx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import anthropic

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

HERMES_URL = os.getenv("HERMES_URL", "http://localhost:8001")

app = FastAPI(title="CheggieTrade Voice", docs_url=None, redoc_url=None)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

client = anthropic.Anthropic()

TRANSCRIBE_SYSTEM = """Transcribe the following audio description into clean text.
If this is a trading command, extract the ticker and intent clearly.
Return ONLY the transcribed/interpreted text, nothing else."""


class TextRequest(BaseModel):
    text: str


@app.post("/voice/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """Accept audio file, transcribe to text, forward to Hermes."""
    # Placeholder: in production, use Whisper or browser WebSpeech API output
    # The primary flow is: browser sends WebSpeech API text → /voice/text
    content = await audio.read()
    logger.info("Received audio: %d bytes, type: %s", len(content), audio.content_type)
    raise HTTPException(
        status_code=501,
        detail="Server-side audio transcription not configured. Use browser WebSpeech API and POST to /voice/text."
    )


@app.post("/voice/text")
async def voice_text(req: TextRequest):
    """Receive transcribed text from browser, forward to Hermes."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Empty input")

    try:
        async with httpx.AsyncClient(timeout=120.0) as http:
            r = await http.post(f"{HERMES_URL}/run", json={"input": req.text})
            r.raise_for_status()
            return {"ok": True, "input": req.text, "result": r.json()}
    except Exception as e:
        logger.error("Hermes forwarding failed: %s", e)
        raise HTTPException(status_code=502, detail="Analysis service unavailable")


@app.get("/voice/status")
async def status():
    return {
        "ok": True,
        "transcription": "browser-webspeech",
        "fallback": "text-input",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("VOICE_PORT", 8003)))
