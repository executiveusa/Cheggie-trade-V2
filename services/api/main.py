"""
CheggieTrade API service.

Endpoints:
  POST /api/analyze      — full trading analysis via Hermes skill plan
  POST /api/assistant    — conversational assistant routed through Hermes
  GET  /api/skills       — full skill registry from Hermes (with static fallback)
  POST /api/skills/run   — execute a named skill
  GET  /api/status       — service health
"""

import logging
import os
from datetime import date, datetime
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from data_layer import get_stock_snapshot, get_news

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────── #
HERMES_URL  = os.getenv("HERMES_URL",  "http://localhost:8001")
_API_KEY    = os.getenv("ANTHROPIC_API_KEY")
_DEMO_MODE  = not bool(_API_KEY)

DEEP_MODEL  = os.getenv("DEEP_THINK_MODEL",  "claude-opus-4-7")
QUICK_MODEL = os.getenv("QUICK_THINK_MODEL", "claude-haiku-4-5-20251001")

# Lazy client — None in demo mode
def _get_client():
    if _DEMO_MODE:
        return None
    import anthropic
    return anthropic.Anthropic(api_key=_API_KEY)

# ── FastAPI ────────────────────────────────────────────────────────── #
app = FastAPI(title="CheggieTrade API", docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("WEB_ORIGIN", "http://localhost:3000")],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── System prompt (never expose internals) ─────────────────────────── #
ASSISTANT_SYSTEM = """You are a trading analyst assistant for CheggieTrade.
Communicate clearly and confidently. Use plain language.
Never mention: AI, models, agents, LLMs, Claude, GPT, machine learning, Anthropic, or any internal systems.
Never share: tool names, skill IDs, model names, API details, or system architecture.
Focus on: market insight, trading rationale, risk context, and actionable direction.
If asked about technology, say: "CheggieTrade uses proprietary analysis."
Be direct. No hedging. No filler sentences.
End every response with the disclaimer on a new line: "Para solo fins de investigação. Não é conselho financeiro." adjusted to the user's language."""

# ── Static skills fallback (used when Hermes is unreachable) ─────── #
_STATIC_SKILLS = [
    {"id": "analyze-asset",   "name": "Asset Analysis",    "description": "Full multi-analyst trading analysis.", "status": "implemented",          "risk_level": "low",    "requires_approval": False},
    {"id": "earnings-analysis","name": "Earnings Analysis", "description": "Earnings report interpretation.",       "status": "implemented",          "risk_level": "low",    "requires_approval": False},
    {"id": "sector-overview",  "name": "Sector Overview",   "description": "Sector rotation and relative strength.","status": "implemented",          "risk_level": "low",    "requires_approval": False},
    {"id": "idea-generation",  "name": "Idea Generation",   "description": "Screener-based trade setup detection.", "status": "implemented",          "risk_level": "low",    "requires_approval": False},
    {"id": "explain-risk",     "name": "Risk Explanation",  "description": "Plain-language risk explanation.",       "status": "implemented",          "risk_level": "low",    "requires_approval": False},
    {"id": "generate-report",  "name": "Report Generation", "description": "Structured research report.",           "status": "implemented",          "risk_level": "low",    "requires_approval": False},
    {"id": "browser-research", "name": "Browser Research",  "description": "Automated research via web.",           "status": "implemented",          "risk_level": "medium", "requires_approval": False},
    {"id": "summarize-news",   "name": "News Summary",      "description": "Recent news summary for a ticker.",     "status": "implemented",          "risk_level": "low",    "requires_approval": False},
    {"id": "comparable-company-analysis","name": "Comparable Company Analysis","description": "Peer comparison multiples.", "status": "available_as_reference","risk_level": "low",  "requires_approval": False},
    {"id": "discounted-cash-flow","name": "DCF Model",      "description": "DCF intrinsic value with scenarios.",   "status": "available_as_reference","risk_level": "medium", "requires_approval": False},
    {"id": "portfolio-rebalance","name": "Portfolio Rebalance","description": "Target-weight rebalancing.",         "status": "not_implemented",      "risk_level": "high",   "requires_approval": True},
    {"id": "tax-loss-harvesting","name": "Tax-Loss Harvesting","description": "TLH candidate identification.",      "status": "not_implemented",      "risk_level": "high",   "requires_approval": True},
]


# ── Request / Response models ──────────────────────────────────────── #

class AnalyzeRequest(BaseModel):
    ticker: str
    date: Optional[str] = None
    analysts: list[str] = ["market", "news", "fundamentals"]
    locale: str = "sr-RS"


class AssistantMessage(BaseModel):
    role: str
    content: str


class AssistantRequest(BaseModel):
    messages: list[AssistantMessage]
    context: dict = {}
    locale: str = "sr-RS"


class SkillRunRequest(BaseModel):
    skill_id: str
    params: dict = {}
    locale: str = "sr-RS"


class AnalyzeResponse(BaseModel):
    ok: bool
    ticker: str
    snapshot: dict
    news: list
    decision: Optional[str] = None
    analyst_reports: dict = {}
    risk_assessment: Optional[str] = None
    disclaimer: Optional[str] = None
    error: Optional[str] = None
    mode: str = "live"
    timestamp: str


# ── Routes ────────────────────────────────────────────────────────── #

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    ticker = req.ticker.upper().strip()
    trade_date = req.date or str(date.today())

    snapshot = get_stock_snapshot(ticker)
    news = get_news(ticker, days=7, limit=8)

    hermes_result = await _call_hermes_execute(
        {
            "intent": "analyze_asset",
            "params": {
                "ticker": ticker,
                "date": trade_date,
                "analysts": req.analysts,
                "locale": req.locale,
            },
        },
        locale=req.locale,
    )

    if hermes_result and hermes_result.get("ok"):
        r = hermes_result["result"]
        return AnalyzeResponse(
            ok=True,
            ticker=ticker,
            snapshot=snapshot,
            news=news,
            decision=r.get("decision"),
            analyst_reports=r.get("analyst_reports", {}),
            risk_assessment=r.get("risk_assessment"),
            disclaimer=r.get("disclaimer"),
            mode=hermes_result.get("audit", {}).get("mode", "live"),
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

    # Fallback: market data without deep analysis
    return AnalyzeResponse(
        ok=True,
        ticker=ticker,
        snapshot=snapshot,
        news=news,
        decision=None,
        error="Deep analysis unavailable — showing market data only",
        mode="degraded",
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


@app.post("/api/assistant")
async def assistant(req: AssistantRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    locale = req.locale

    # Inject market context if ticker is in context
    context = req.context
    if context.get("ticker"):
        snapshot = get_stock_snapshot(context["ticker"])
        context_note = (
            f"Context: {snapshot['ticker']} at ${snapshot.get('price', 'N/A')}, "
            f"{snapshot.get('change_pct', 'N/A')}% today. "
            f"Sector: {snapshot.get('sector', 'N/A')}."
        )
        if messages and messages[0]["role"] == "user":
            messages[0]["content"] = context_note + "\n\n" + messages[0]["content"]

    # Always try Hermes first — it handles its own demo/live mode
    last_user_msg = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    hermes_result = await _call_hermes_run(last_user_msg, locale=locale)

    if hermes_result and hermes_result.get("ok"):
        result = hermes_result.get("result", {})
        answer = (
            result.get("explanation")
            or result.get("summary")
            or result.get("report")
            or result.get("decision")
            or result.get("result")
        )
        if answer:
            disclaimer = result.get("disclaimer", "")
            mode = hermes_result.get("audit", {}).get("mode", "live")
            return {
                "ok": True,
                "response": f"{answer}\n\n{disclaimer}".strip(),
                "mode": mode,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }

    # Hermes unavailable — fall back to demo or direct Anthropic
    if _DEMO_MODE:
        return {
            "ok": True,
            "response": "Demo mode — connect an API key for live analysis.",
            "mode": "demo",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    client = _get_client()
    if client is None:
        return {
            "ok": True,
            "response": "Demo mode — connect an API key for live analysis.",
            "mode": "demo",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    try:
        response = client.messages.create(
            model=DEEP_MODEL,
            max_tokens=1024,
            system=ASSISTANT_SYSTEM,
            messages=messages,
        )
        return {
            "ok": True,
            "response": response.content[0].text,
            "mode": "live",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
    except Exception as exc:
        logger.error("Assistant fallback error: %s", exc)
        raise HTTPException(status_code=500, detail="Assistant temporarily unavailable")


@app.get("/api/skills")
async def skills():
    """Return full skill registry from Hermes, with static fallback."""
    hermes_skills = await _call_hermes_skills()
    if hermes_skills is not None:
        return {"ok": True, "skills": hermes_skills, "source": "hermes"}
    return {"ok": True, "skills": _STATIC_SKILLS, "source": "fallback"}


@app.post("/api/skills/run")
async def skills_run(req: SkillRunRequest):
    """Proxy a skill run to Hermes."""
    result = await _call_hermes_skill_run(req.skill_id, req.params, req.locale)
    if result is None:
        raise HTTPException(status_code=503, detail="Hermes unavailable")
    return result


@app.get("/api/status")
async def status():
    hermes_ok = await _ping_hermes()
    return {
        "ok": True,
        "mode": "demo" if _DEMO_MODE else "live",
        "services": {
            "api": "operational",
            "hermes": "operational" if hermes_ok else "degraded",
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ── Internal helpers ───────────────────────────────────────────────── #

async def _call_hermes_execute(payload: dict, locale: str = "sr-RS") -> Optional[dict]:
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.post(
                f"{HERMES_URL}/execute",
                json={"intent": payload, "locale": locale},
            )
            r.raise_for_status()
            return r.json()
    except Exception as exc:
        logger.warning("Hermes /execute failed: %s", exc)
        return None


async def _call_hermes_run(text: str, locale: str = "sr-RS") -> Optional[dict]:
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                f"{HERMES_URL}/run",
                json={"input": text, "locale": locale},
            )
            r.raise_for_status()
            return r.json()
    except Exception as exc:
        logger.warning("Hermes /run failed: %s", exc)
        return None


async def _call_hermes_skills() -> Optional[list]:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{HERMES_URL}/skills")
            r.raise_for_status()
            data = r.json()
            return data.get("skills")
    except Exception as exc:
        logger.warning("Hermes /skills failed: %s", exc)
        return None


async def _call_hermes_skill_run(skill_id: str, params: dict, locale: str) -> Optional[dict]:
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                f"{HERMES_URL}/skills/run",
                json={"skill_id": skill_id, "params": params, "locale": locale},
            )
            r.raise_for_status()
            return r.json()
    except Exception as exc:
        logger.warning("Hermes /skills/run failed: %s", exc)
        return None


async def _ping_hermes() -> bool:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{HERMES_URL}/status")
            return r.status_code == 200
    except Exception:
        return False


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("API_PORT", 8000)))
