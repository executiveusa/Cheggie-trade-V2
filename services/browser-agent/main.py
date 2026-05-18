from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel, Field


app = FastAPI(title="CheggieTrade Browser Agent")
SESSIONS: Dict[str, Dict[str, Any]] = {}
VALID_ACTIONS = {"open", "click", "type", "scroll", "wait", "screenshot", "close"}


class ActionPayload(BaseModel):
    session_id: str
    action: str = Field(min_length=1)
    target: str | None = None
    value: str | None = None
    approved: bool = False


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@app.post("/api/browser/session")
def create_session() -> Dict[str, Any]:
    session_id = str(uuid4())
    SESSIONS[session_id] = {
        "state": "active",
        "created_at": now_iso(),
        "updated_at": now_iso(),
        "steps": [],
        "screenshots": [],
    }
    return {"status": "ok", "session_id": session_id, "state": "active", "created_at": SESSIONS[session_id]["created_at"]}


@app.post("/api/browser/action")
def browser_action(payload: ActionPayload) -> Dict[str, Any]:
    session = SESSIONS.get(payload.session_id)
    if not session:
        return {"status": "error", "message": "session_not_found"}

    if session["state"] != "active":
        return {"status": "error", "message": "object_state_invalid", "state": session["state"]}

    action = payload.action.strip().lower()
    if action not in VALID_ACTIONS:
        return {"status": "error", "message": "unsupported_action", "action": payload.action}

    if not payload.approved:
        return {"status": "pending_approval", "action": action, "session_id": payload.session_id}

    step = {
        "timestamp": now_iso(),
        "action": action,
        "target": payload.target,
        "value": payload.value,
    }
    session["steps"].append(step)

    screenshot = f"/tmp/{payload.session_id}-{len(session['steps'])}.png"
    session["screenshots"].append(screenshot)

    if action == "close":
        session["state"] = "closed"

    session["updated_at"] = now_iso()

    return {
        "status": "ok",
        "session_id": payload.session_id,
        "state": session["state"],
        "step": step,
        "screenshot": screenshot,
    }
