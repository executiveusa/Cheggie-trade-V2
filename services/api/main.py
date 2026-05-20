"""CheggieTrade API service."""

import os
from datetime import date, datetime
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.api.data_layer import get_news, get_stock_snapshot
from services.hermes.financial_skills_adapter import FinancialSkillsAdapter
from services.hermes.hermes_orchestrator import HermesOrchestrator
from services.hermes.skills_manifest import get_skill, get_skill_registry

HERMES_MODEL_ID = os.getenv("HERMES_MODEL_ID", "hermes-local")
RESEARCH_MODEL_ID = os.getenv("RESEARCH_MODEL_ID", "research-local")

app = FastAPI(title="CheggieTrade API", docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("WEB_ORIGIN", "http://localhost:3000")],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

orchestrator = HermesOrchestrator(config={"hermes_model_id": HERMES_MODEL_ID, "research_model_id": RESEARCH_MODEL_ID})
skills_adapter = FinancialSkillsAdapter()


class AnalyzeRequest(BaseModel):
    ticker: str
    date: Optional[str] = None
    analysts: list[str] = ["market", "news", "fundamentals"]


class AssistantMessage(BaseModel):
    role: str
    content: str


class AssistantRequest(BaseModel):
    messages: list[AssistantMessage]
    context: dict = {}
    locale: str = "sr-RS"


class SkillRunRequest(BaseModel):
    command: str
    payload: dict = {}
    approved: bool = False


@app.get("/api/skills")
async def skills():
    return {"ok": True, "skills": get_skill_registry()}


@app.post("/api/skills/run")
async def run_skill(req: SkillRunRequest):
    mapped = skills_adapter.run_command(req.command, req.payload)
    skill_id = mapped.get("skill_id")
    manifest = get_skill(skill_id) if skill_id else None
    if manifest and manifest.requires_approval and not req.approved:
        return {"ok": False, "blocked": True, "reason": "approval_required", "skill_id": skill_id}
    return mapped


@app.post("/api/assistant")
async def assistant(req: AssistantRequest):
    user_text = next((m.content for m in req.messages if m.role == "user"), "")
    result = orchestrator.run(user_text, locale=req.locale)
    return {"ok": True, "mode": "live" if os.getenv("ANTHROPIC_API_KEY") else "demo", "response": result}


@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    ticker = req.ticker.upper().strip()
    trade_date = req.date or str(date.today())
    snapshot = get_stock_snapshot(ticker)
    news = get_news(ticker, days=7, limit=8)
    hermes = orchestrator.execute({"intent": "analyze_asset", "params": {"query": f"Analyze {ticker}", "ticker": ticker, "date": trade_date}}, locale="sr-RS")
    return {"ok": True, "ticker": ticker, "snapshot": snapshot, "news": news, "hermes": hermes, "timestamp": datetime.utcnow().isoformat() + "Z"}


@app.get("/api/status")
async def status():
    return {"ok": True, "mode": "live" if os.getenv("ANTHROPIC_API_KEY") else "demo", "services": {"api": "operational", "hermes": "operational"}, "timestamp": datetime.utcnow().isoformat() + "Z"}
