"""
Cynthia Studio OS — FastAPI Gateway
Exposes all Studio OS capabilities over a REST API with Bearer token auth.
"""

from __future__ import annotations

import os
import uuid
import time
import asyncio
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from hermes_gateway import BriefRequest, HermesOrchestrator

# ── Auth ──────────────────────────────────────────────────────────────────────

CYNTHIA_API_KEY = os.environ.get("CYNTHIA_API_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
DASHBOARD_URL = os.environ.get("DASHBOARD_URL", "http://web:3001")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-7")


def require_auth(authorization: str = Header(...)) -> None:
    if not CYNTHIA_API_KEY:
        return  # No key configured — open in dev
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token != CYNTHIA_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Cynthia Studio OS API",
    version="2.0.0",
    description="REST gateway for the Cynthia Design Studio agent network. "
                "Built on HERMES execution layer + Claude claude-opus-4-7.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

hermes = HermesOrchestrator()


# ── Models ────────────────────────────────────────────────────────────────────

class CommandRequest(BaseModel):
    message: str
    agent: str | None = None
    stream: bool = False


class TaskCreate(BaseModel):
    type: str
    title: str
    description: str | None = None
    repo: str | None = None
    agent: str | None = None


class RepoConnect(BaseModel):
    url: str
    token: str | None = None
    branch: str = "main"


class SpawnRequest(BaseModel):
    agentName: str | None = None
    agentClass: str = "custom"
    role: str
    scope: str
    teamLead: str
    teamEmail: str
    teamChannel: str | None = None
    githubOrg: str | None = None
    domain: str | None = None
    vpsHost: str | None = None
    mission: str
    skills: list[str] = []
    model: str = "claude-opus-4-7"


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _proxy_get(path: str) -> Any:
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(f"{DASHBOARD_URL}{path}")
        r.raise_for_status()
        return r.json()


async def _proxy_post(path: str, body: Any) -> Any:
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(f"{DASHBOARD_URL}{path}", json=body)
        r.raise_for_status()
        return r.json()


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check — also proxies stats from the Next.js layer."""
    try:
        data = await _proxy_get("/api/health")
    except Exception:
        data = {}
    return {
        "status": "ok",
        "service": "cynthia-fastapi",
        "version": "2.0.0",
        "dashboard_reachable": bool(data),
        "built_on": "HERMES execution layer + Claude claude-opus-4-7",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "upstream": data,
    }


@app.get("/v1/agents", dependencies=[Depends(require_auth)])
async def list_agents():
    """Return all 12 Studio OS agents with their roles and capabilities."""
    agents = [
        {"id": "ralphy",    "name": "RALPHY",    "class": "Builder",      "role": "Primary builder. Produces 3 parallel variations per task."},
        {"id": "lena",      "name": "LENA",      "class": "Reviewer",     "role": "UDEC scorer and quality gatekeeper. Blocks releases below 8.5."},
        {"id": "marco",     "name": "MARCO",     "class": "Synthesizer",  "role": "Combines the 3 best variations into the final deliverable."},
        {"id": "vera",      "name": "VERA",      "class": "Strategist",   "role": "Brand strategy, positioning, and audience research."},
        {"id": "otto",      "name": "OTTO",      "class": "Technician",   "role": "Performance optimization, Core Web Vitals, Rust tooling."},
        {"id": "lyra",      "name": "LYRA",      "class": "Motion",       "role": "Animation, interaction design, GSAP/Framer Motion."},
        {"id": "blender",   "name": "BLENDER",   "class": "3D",           "role": "3D world generation via Lyra pipeline and Gaussian Splatting."},
        {"id": "atlas",     "name": "ATLAS",     "class": "Navigator",    "role": "Codebase mapping, dependency analysis, cross-repo routing."},
        {"id": "nova",      "name": "NOVA",      "class": "Copy",         "role": "UX copy, microcopy, headlines, and brand voice."},
        {"id": "hex",       "name": "HEX",       "class": "Color",        "role": "Color systems, palette generation, contrast auditing."},
        {"id": "aria",      "name": "ARIA",      "class": "Accessibility","role": "WCAG compliance, screen reader testing, ACC scoring."},
        {"id": "dispatch",  "name": "DISPATCH",  "class": "Coordinator",  "role": "Task intake, agent routing, and delivery orchestration."},
    ]
    return {"agents": agents, "total": len(agents)}


@app.post("/v1/command", dependencies=[Depends(require_auth)])
async def command(req: CommandRequest):
    """Send a command to the Studio OS agent network. Returns streamed or full response."""
    if req.stream:
        async def generate():
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream(
                    "POST",
                    f"{DASHBOARD_URL}/api/command",
                    json={"message": req.message, "agent": req.agent},
                ) as r:
                    async for chunk in r.aiter_text():
                        yield chunk
        return StreamingResponse(generate(), media_type="text/event-stream")

    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(
            f"{DASHBOARD_URL}/api/command",
            json={"message": req.message, "agent": req.agent},
        )
        return r.json()


@app.get("/v1/tasks", dependencies=[Depends(require_auth)])
async def list_tasks(status: str | None = None):
    """List all tasks in the queue, optionally filtered by status."""
    data = await _proxy_get("/api/tasks")
    tasks = data.get("tasks", data) if isinstance(data, dict) else data
    if status:
        tasks = [t for t in tasks if t.get("status") == status]
    return {"tasks": tasks, "total": len(tasks)}


@app.post("/v1/tasks", dependencies=[Depends(require_auth)])
async def create_task(req: TaskCreate):
    """Create a new task and route it to the appropriate agent."""
    return await _proxy_post("/api/tasks", req.model_dump(exclude_none=True))


@app.get("/v1/tasks/{task_id}", dependencies=[Depends(require_auth)])
async def get_task(task_id: str):
    """Get a specific task by ID."""
    data = await _proxy_get(f"/api/tasks?id={task_id}")
    return data


@app.get("/v1/repos", dependencies=[Depends(require_auth)])
async def list_repos():
    """List all connected GitHub repositories."""
    return await _proxy_get("/api/repos")


@app.post("/v1/repos", dependencies=[Depends(require_auth)])
async def connect_repo(req: RepoConnect):
    """Connect a GitHub repository for scanning and design law enforcement."""
    return await _proxy_post("/api/repos", req.model_dump(exclude_none=True))


@app.post("/v1/repos/scan", dependencies=[Depends(require_auth)])
async def scan_repo(body: dict):
    """Scan a connected repo for design anti-patterns."""
    repo_id = body.get("id")
    if not repo_id:
        raise HTTPException(status_code=400, detail="id required")
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.put(f"{DASHBOARD_URL}/api/repos?id={repo_id}")
        r.raise_for_status()
        return r.json()


@app.post("/v1/spawn", dependencies=[Depends(require_auth)])
async def spawn_agent(req: SpawnRequest):
    """
    Spawn a new Cynthia-lineage agent with a pre-configured soul file.
    Returns the soul.md, docker-compose.yml, deploy.sh, and SETUP.md as files.
    """
    return await _proxy_post("/api/spawn", req.model_dump(exclude_none=True))


@app.get("/v1/standards", dependencies=[Depends(require_auth)])
async def get_standards():
    """Return the full design standards: UDEC axes, design laws, skills, anti-patterns."""
    return {
        "udec_floor": 8.5,
        "blocker_axes": ["MOT", "ACC"],
        "blocker_minimum": 7.0,
        "design_laws_count": 14,
        "skills_count": 12,
        "anti_patterns_count": 11,
        "udec_axes": [
            {"id": "VH",  "name": "Visual Hierarchy",    "weight": 0.12},
            {"id": "TYP", "name": "Typography",          "weight": 0.10},
            {"id": "SPA", "name": "Spatial Rhythm",      "weight": 0.09},
            {"id": "COL", "name": "Color & Contrast",    "weight": 0.09},
            {"id": "MOT", "name": "Motion & Interaction","weight": 0.09, "blocker": True},
            {"id": "ACC", "name": "Accessibility",       "weight": 0.10, "blocker": True},
            {"id": "NAR", "name": "Narrative & Copy",    "weight": 0.07},
            {"id": "PER", "name": "Performance",         "weight": 0.08},
            {"id": "RES", "name": "Responsiveness",      "weight": 0.07},
            {"id": "BRD", "name": "Brand Alignment",     "weight": 0.06},
            {"id": "INF", "name": "Information Arch",    "weight": 0.05},
            {"id": "INV", "name": "Innovation",          "weight": 0.04},
            {"id": "SUS", "name": "Sustainability",      "weight": 0.02},
            {"id": "CRF", "name": "Craft & Detail",      "weight": 0.02},
        ],
    }


@app.post("/v1/brief", dependencies=[Depends(require_auth)])
async def submit_brief(brief: BriefRequest):
    """Submit a brief and receive a HERMES routing decision."""
    decision = await hermes.route_brief(brief)
    status = "submitted" if decision.approval else "rejected"
    return {"status": status, "decision": decision.model_dump()}
