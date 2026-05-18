"""Hermes service entry point."""

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)

from hermes_orchestrator import HermesOrchestrator

app = FastAPI(title="Hermes Orchestrator", docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = HermesOrchestrator()


class RunRequest(BaseModel):
    input: str
    config: dict = {}


class ExecuteRequest(BaseModel):
    intent: dict
    config: dict = {}


@app.post("/run")
async def run(req: RunRequest):
    result = orchestrator.run(req.input)
    if not result["ok"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@app.post("/execute")
async def execute(req: ExecuteRequest):
    result = orchestrator.execute(req.intent)
    if not result["ok"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@app.post("/parse")
async def parse(req: RunRequest):
    return orchestrator.parse_intent(req.input)


@app.get("/status")
async def status():
    return orchestrator._handle_status()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("HERMES_PORT", 8001)))
