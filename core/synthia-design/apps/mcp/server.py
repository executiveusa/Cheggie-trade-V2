"""
Cynthia Studio OS — MCP Server
Exposes Studio OS capabilities as Model Context Protocol tools over SSE.
"""

from __future__ import annotations

import json
import os
import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any, AsyncGenerator

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

DASHBOARD_URL = os.environ.get("DASHBOARD_URL", "http://web:3001")
CYNTHIA_API_KEY = os.environ.get("CYNTHIA_API_KEY", "")

app = FastAPI(title="Cynthia MCP Server", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── MCP Tool registry ─────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "cynthia_command",
        "description": "Send a design or engineering command to the Cynthia agent network. "
                       "Routes to the appropriate specialist agent automatically.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "message": {"type": "string", "description": "The command or question for the agent network"},
                "agent": {"type": "string", "description": "Optional: target a specific agent by ID (ralphy, lena, marco, etc.)"},
            },
            "required": ["message"],
        },
    },
    {
        "name": "cynthia_spawn_agent",
        "description": "Spawn a new Cynthia-lineage agent configured for a specific team. "
                       "Returns soul.md, docker-compose.yml, deploy.sh, and SETUP.md.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "agentName":   {"type": "string"},
                "role":        {"type": "string", "description": "One-line role description"},
                "scope":       {"type": "string"},
                "teamLead":    {"type": "string"},
                "teamEmail":   {"type": "string"},
                "mission":     {"type": "string"},
                "skills":      {"type": "array", "items": {"type": "string"}},
                "domain":      {"type": "string"},
            },
            "required": ["role", "teamEmail", "mission"],
        },
    },
    {
        "name": "cynthia_scan_repo",
        "description": "Scan a GitHub repository for design anti-patterns: banned fonts, "
                       "scroll listeners, missing prefers-reduced-motion, etc.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "url":    {"type": "string", "description": "GitHub repo URL"},
                "token":  {"type": "string", "description": "GitHub personal access token (optional)"},
                "branch": {"type": "string", "default": "main"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "cynthia_list_tasks",
        "description": "List all tasks in the Studio OS task queue.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["pending", "running", "complete", "failed"]},
            },
        },
    },
    {
        "name": "cynthia_create_task",
        "description": "Create a new task and route it to the appropriate agent.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "type":        {"type": "string", "enum": ["design", "audit", "code", "copy", "3d", "motion"]},
                "title":       {"type": "string"},
                "description": {"type": "string"},
                "repo":        {"type": "string"},
            },
            "required": ["type", "title"],
        },
    },
    {
        "name": "cynthia_list_agents",
        "description": "List all 12 Studio OS agents with their roles and current status.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "cynthia_get_standards",
        "description": "Return the full design standards: UDEC scoring axes, design laws, skills, and anti-patterns.",
        "inputSchema": {"type": "object", "properties": {}},
    },
]


# ── Tool dispatch ─────────────────────────────────────────────────────────────

async def _proxy_get(path: str) -> Any:
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(f"{DASHBOARD_URL}{path}")
        r.raise_for_status()
        return r.json()


async def _proxy_post(path: str, body: Any) -> Any:
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(f"{DASHBOARD_URL}{path}", json=body)
        r.raise_for_status()
        return r.json()


async def dispatch_tool(name: str, args: dict) -> Any:
    if name == "cynthia_command":
        return await _proxy_post("/api/command", args)

    elif name == "cynthia_spawn_agent":
        return await _proxy_post("/api/spawn", args)

    elif name == "cynthia_scan_repo":
        # Connect repo first, then scan
        repo = await _proxy_post("/api/repos", args)
        repo_id = repo.get("id", "")
        async with httpx.AsyncClient(timeout=60) as c:
            r = await c.put(f"{DASHBOARD_URL}/api/repos?id={repo_id}")
            r.raise_for_status()
            return r.json()

    elif name == "cynthia_list_tasks":
        data = await _proxy_get("/api/tasks")
        tasks = data.get("tasks", data) if isinstance(data, dict) else data
        status = args.get("status")
        if status:
            tasks = [t for t in tasks if t.get("status") == status]
        return {"tasks": tasks}

    elif name == "cynthia_create_task":
        return await _proxy_post("/api/tasks", args)

    elif name == "cynthia_list_agents":
        return {
            "agents": [
                {"id": "ralphy",   "name": "RALPHY",   "role": "Primary builder — 3 parallel variations"},
                {"id": "lena",     "name": "LENA",     "role": "UDEC scorer and quality gate"},
                {"id": "marco",    "name": "MARCO",    "role": "Synthesizer — combines best variations"},
                {"id": "vera",     "name": "VERA",     "role": "Brand strategy and positioning"},
                {"id": "otto",     "name": "OTTO",     "role": "Performance and Core Web Vitals"},
                {"id": "lyra",     "name": "LYRA",     "role": "Motion and animation design"},
                {"id": "blender",  "name": "BLENDER",  "role": "3D world generation via Lyra pipeline"},
                {"id": "atlas",    "name": "ATLAS",    "role": "Codebase mapping and routing"},
                {"id": "nova",     "name": "NOVA",     "role": "UX copy and brand voice"},
                {"id": "hex",      "name": "HEX",      "role": "Color systems and contrast auditing"},
                {"id": "aria",     "name": "ARIA",     "role": "WCAG compliance and accessibility"},
                {"id": "dispatch", "name": "DISPATCH", "role": "Task intake and orchestration"},
            ]
        }

    elif name == "cynthia_get_standards":
        return {
            "udec_floor": 8.5,
            "blocker_axes": ["MOT", "ACC"],
            "design_laws": [
                "Clarity over cleverness",
                "Hierarchy before beauty",
                "Motion must earn its place",
                "Accessible by default — not by audit",
                "Brand is a system — not a logo",
                "Typography is architecture",
                "Color communicates before content",
                "Negative space is active design",
                "Performance is a design decision",
                "Every pixel has a job",
                "Responsive is not optional",
                "Copy is a design element",
                "Test with real users — not assumptions",
                "Ship complete work — no stubs",
            ],
        }

    return {"error": f"Unknown tool: {name}"}


# ── SSE transport ─────────────────────────────────────────────────────────────

def mcp_event(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


async def sse_session(request: Request) -> AsyncGenerator[str, None]:
    session_id = str(uuid.uuid4())

    # Initial capabilities announcement
    yield mcp_event({
        "jsonrpc": "2.0",
        "method": "initialize",
        "params": {
            "sessionId": session_id,
            "protocolVersion": "2024-11-05",
            "serverInfo": {
                "name": "cynthia-studio-os",
                "version": "2.0.0",
            },
            "capabilities": {"tools": {}},
        },
    })

    # Tools list
    yield mcp_event({
        "jsonrpc": "2.0",
        "id": "tools-list",
        "result": {"tools": TOOLS},
    })

    # Keep-alive loop
    while not await request.is_disconnected():
        await asyncio.sleep(15)
        yield ": ping\n\n"


@app.get("/mcp/sse")
async def mcp_sse(request: Request):
    return StreamingResponse(
        sse_session(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/mcp/message")
async def mcp_message(request: Request):
    """Handle incoming MCP JSON-RPC messages."""
    body = await request.json()
    method = body.get("method", "")
    req_id = body.get("id")
    params = body.get("params", {})

    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": TOOLS}}

    elif method == "tools/call":
        tool_name = params.get("name", "")
        arguments = params.get("arguments", {})
        try:
            result = await dispatch_tool(tool_name, arguments)
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
                },
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32603, "message": str(e)},
            }

    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": "Method not found"}}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "cynthia-mcp", "version": "2.0.0"}
