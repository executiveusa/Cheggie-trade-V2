"""Hermes service entry point."""

import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)

from hermes_orchestrator import HermesOrchestrator
from skills_manifest import FORBIDDEN_ACTIONS, APPROVAL_POLICY, registry_as_dict
from financial_skills_adapter import run_skill, resolve_command

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
    locale: str = "sr-RS"
    config: dict = {}


class ExecuteRequest(BaseModel):
    intent: dict
    locale: str = "sr-RS"
    config: dict = {}


class SkillRunRequest(BaseModel):
    skill_id: str
    params: dict = {}
    locale: str = "sr-RS"


@app.post("/run")
async def run(req: RunRequest):
    result = orchestrator.run(req.input, locale=req.locale)
    if not result["ok"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
    return result


@app.post("/execute")
async def execute(req: ExecuteRequest):
    result = orchestrator.execute(req.intent, locale=req.locale)
    if not result["ok"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
    return result


@app.post("/parse")
async def parse(req: RunRequest):
    return orchestrator.parse_intent(req.input)


@app.get("/skills")
async def skills():
    """Return the full public skill registry."""
    return {
        "ok": True,
        "skills": registry_as_dict(include_internals=False),
        "forbidden_actions": FORBIDDEN_ACTIONS,
        "approval_policy": APPROVAL_POLICY,
    }


@app.post("/skills/run")
async def skills_run(req: SkillRunRequest):
    """
    Execute a skill by ID. Handles not_implemented and requires_approval
    gracefully — never crashes.
    """
    result = run_skill(req.skill_id, {**req.params, "locale": req.locale}, orchestrator.anthropic)
    return result


@app.get("/status")
async def status():
    return orchestrator._handle_status()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("HERMES_PORT", 8001)))
