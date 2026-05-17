"""Browser Agent service entry point."""

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from browser_agent import BrowserAgentManager

load_dotenv()
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="CheggieTrade Browser Agent", docs_url=None, redoc_url=None)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

manager = BrowserAgentManager()


class ActionRequest(BaseModel):
    action: str
    params: dict = {}
    approved: bool = False


@app.post("/api/browser/session")
async def create_session(headless: bool = True):
    session = await manager.create_session(headless=headless)
    return {"ok": True, "session_id": session.session_id, "created_at": session.created_at}


@app.get("/api/browser/session")
async def list_sessions():
    return {"ok": True, "sessions": manager.list_sessions()}


@app.delete("/api/browser/session/{session_id}")
async def close_session(session_id: str):
    await manager.close_session(session_id)
    return {"ok": True}


@app.post("/api/browser/action/{session_id}")
async def execute_action(session_id: str, req: ActionRequest):
    session = manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    result = await session.execute_action(req.action, req.params, req.approved)
    return {"ok": True, **result}


@app.post("/api/browser/approve/{session_id}")
async def approve_action(session_id: str):
    session = manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    result = await session.approve_pending()
    return {"ok": True, **result}


@app.get("/api/browser/steps/{session_id}")
async def get_steps(session_id: str):
    session = manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"ok": True, "steps": session.get_steps()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("BROWSER_PORT", 8002)))
