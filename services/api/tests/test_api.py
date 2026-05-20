"""
Tests for services/api/main.py.
All external calls (Hermes, Anthropic, yfinance) are mocked.
"""

import os
import sys
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Mock heavy/unavailable dependencies before any import touches them
sys.modules.setdefault("yfinance", MagicMock())
sys.modules.setdefault("requests", MagicMock())

# Load the module once (in demo mode — no API key in test env)
os.environ.pop("ANTHROPIC_API_KEY", None)
import main as api_main  # noqa: E402

from fastapi.testclient import TestClient

_CLIENT = TestClient(api_main.app)

MOCK_SNAPSHOT = {
    "ticker": "NVDA",
    "price": 850.0,
    "change_pct": 1.5,
    "name": "NVIDIA Corp",
    "sector": "Technology",
}
MOCK_NEWS = [{"title": "NVDA surges", "url": "https://example.com", "source": "Reuters"}]


def _mock_hermes_response(intent: str, result: dict) -> dict:
    return {
        "ok": True,
        "intent": intent,
        "result": result,
        "audit": {"mode": "live", "run_id": "test-uuid"},
    }


# ── /api/skills ────────────────────────────────────────────────────── #

class TestSkillsEndpoint(unittest.TestCase):

    @patch.object(api_main, "_call_hermes_skills", new_callable=AsyncMock)
    def test_skills_returns_registry_from_hermes(self, mock_hermes_skills):
        mock_hermes_skills.return_value = [
            {"id": "analyze-asset", "name": "Asset Analysis", "status": "implemented"}
        ]
        resp = _CLIENT.get("/api/skills")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ok"])
        self.assertIsInstance(data["skills"], list)
        self.assertGreater(len(data["skills"]), 0)

    @patch.object(api_main, "_call_hermes_skills", new_callable=AsyncMock)
    def test_skills_falls_back_to_static_when_hermes_down(self, mock_hermes_skills):
        mock_hermes_skills.return_value = None
        resp = _CLIENT.get("/api/skills")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ok"])
        self.assertEqual(data["source"], "fallback")
        self.assertIsInstance(data["skills"], list)
        self.assertGreater(len(data["skills"]), 0)

    @patch.object(api_main, "_call_hermes_skills", new_callable=AsyncMock)
    def test_skills_response_does_not_expose_internals(self, mock_hermes_skills):
        mock_hermes_skills.return_value = None
        resp = _CLIENT.get("/api/skills")
        data = resp.json()
        for skill in data["skills"]:
            self.assertNotIn("source", skill)
            self.assertNotIn("command", skill)
            self.assertNotIn("used_by", skill)

    @patch.object(api_main, "_call_hermes_skills", new_callable=AsyncMock)
    def test_skills_does_not_expose_forbidden_tool_names(self, mock_hermes_skills):
        mock_hermes_skills.return_value = None
        resp = _CLIENT.get("/api/skills")
        body = resp.text.lower()
        for forbidden in ("claude", "anthropic", "gpt", "openai", "/comps", "/dcf", "lbo"):
            self.assertNotIn(forbidden, body, f"Response exposes forbidden term: {forbidden}")


# ── /api/skills/run ────────────────────────────────────────────────── #

class TestSkillsRunEndpoint(unittest.TestCase):

    @patch.object(api_main, "_call_hermes_skill_run", new_callable=AsyncMock)
    def test_run_implemented_skill_returns_ok(self, mock_run):
        mock_run.return_value = {
            "ok": True,
            "skill_id": "earnings-analysis",
            "status": "implemented",
            "result": "Strong beat on EPS.",
        }
        resp = _CLIENT.post("/api/skills/run", json={"skill_id": "earnings-analysis", "params": {"ticker": "NVDA"}})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ok"])

    @patch.object(api_main, "_call_hermes_skill_run", new_callable=AsyncMock)
    def test_run_not_implemented_skill_returns_structured_error(self, mock_run):
        mock_run.return_value = {
            "ok": False,
            "skill_id": "portfolio-rebalance",
            "status": "not_implemented",
            "result": None,
            "note": "This capability is planned but not yet active.",
        }
        resp = _CLIENT.post("/api/skills/run", json={"skill_id": "portfolio-rebalance", "params": {}})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data["ok"])
        self.assertEqual(data["status"], "not_implemented")
        self.assertIsNone(data["result"])

    @patch.object(api_main, "_call_hermes_skill_run", new_callable=AsyncMock)
    def test_run_requires_approval_skill_returns_structured_error(self, mock_run):
        mock_run.return_value = {
            "ok": False,
            "skill_id": "tax-loss-harvesting",
            "status": "requires_approval",
            "result": None,
        }
        resp = _CLIENT.post("/api/skills/run", json={"skill_id": "tax-loss-harvesting", "params": {}})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data["ok"])
        self.assertEqual(data["status"], "requires_approval")

    @patch.object(api_main, "_call_hermes_skill_run", new_callable=AsyncMock)
    def test_hermes_unavailable_returns_503(self, mock_run):
        mock_run.return_value = None
        resp = _CLIENT.post("/api/skills/run", json={"skill_id": "earnings-analysis", "params": {}})
        self.assertEqual(resp.status_code, 503)


# ── /api/assistant ─────────────────────────────────────────────────── #

class TestAssistantEndpoint(unittest.TestCase):

    @patch.object(api_main, "_call_hermes_run", new_callable=AsyncMock)
    def test_demo_mode_returns_demo_not_crash(self, mock_hermes):
        mock_hermes.return_value = None
        # api_main is loaded in demo mode (no API key in test env)
        resp = _CLIENT.post("/api/assistant", json={
            "messages": [{"role": "user", "content": "Analiziraj NVDA za swing trade"}]
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ok"])
        self.assertEqual(data["mode"], "demo")

    @patch.object(api_main, "_call_hermes_run", new_callable=AsyncMock)
    def test_assistant_routes_to_hermes(self, mock_hermes):
        mock_hermes.return_value = _mock_hermes_response("analyze_asset", {
            "decision": "BUY",
            "disclaimer": "For research purposes only.",
        })
        resp = _CLIENT.post("/api/assistant", json={
            "messages": [{"role": "user", "content": "Analiziraj NVDA za swing trade"}]
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ok"])
        self.assertIn("BUY", data["response"])

    @patch.object(api_main, "_call_hermes_run", new_callable=AsyncMock)
    def test_assistant_routes_generate_report_intent(self, mock_hermes):
        mock_hermes.return_value = _mock_hermes_response("generate_report", {
            "report": "Weekly report for Telegram: consolidating at support.",
            "disclaimer": "For research purposes only.",
        })
        resp = _CLIENT.post("/api/assistant", json={
            "messages": [{"role": "user", "content": "Napravi izveštaj za Telegram"}]
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ok"])
        self.assertIn("Telegram", data["response"])

    @patch.object(api_main, "_call_hermes_run", new_callable=AsyncMock)
    def test_assistant_response_does_not_expose_model_names(self, mock_hermes):
        mock_hermes.return_value = _mock_hermes_response("analyze_asset", {
            "decision": "CheggieTrade recommends holding NVDA.",
            "disclaimer": "For research purposes only.",
        })
        resp = _CLIENT.post("/api/assistant", json={
            "messages": [{"role": "user", "content": "What do you recommend for NVDA?"}]
        })
        body = resp.text.lower()
        for forbidden in ("claude", "anthropic", "gpt", "openai", "langchain", "langgraph"):
            self.assertNotIn(forbidden, body, f"Response leaks internal name: {forbidden}")


# ── /api/analyze ───────────────────────────────────────────────────── #

class TestAnalyzeEndpoint(unittest.TestCase):

    @patch.object(api_main, "_call_hermes_execute", new_callable=AsyncMock)
    @patch.object(api_main, "get_news", return_value=MOCK_NEWS)
    @patch.object(api_main, "get_stock_snapshot", return_value=MOCK_SNAPSHOT)
    def test_analyze_returns_snapshot_and_decision(self, _snap, _news, mock_hermes):
        mock_hermes.return_value = _mock_hermes_response("analyze_asset", {
            "ticker": "NVDA",
            "decision": "BUY",
            "analyst_reports": {},
            "risk_assessment": "Moderate risk.",
            "disclaimer": "For research purposes only.",
        })
        resp = _CLIENT.post("/api/analyze", json={"ticker": "NVDA"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ok"])
        self.assertEqual(data["ticker"], "NVDA")
        self.assertEqual(data["decision"], "BUY")
        self.assertIsInstance(data["news"], list)

    @patch.object(api_main, "_call_hermes_execute", new_callable=AsyncMock)
    @patch.object(api_main, "get_news", return_value=MOCK_NEWS)
    @patch.object(api_main, "get_stock_snapshot", return_value=MOCK_SNAPSHOT)
    def test_analyze_fallback_when_hermes_down(self, _snap, _news, mock_hermes):
        mock_hermes.return_value = None
        resp = _CLIENT.post("/api/analyze", json={"ticker": "AAPL"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ok"])
        self.assertIsNone(data["decision"])
        self.assertIsNotNone(data["error"])

    @patch.object(api_main, "_call_hermes_execute", new_callable=AsyncMock)
    @patch.object(api_main, "get_news", return_value=MOCK_NEWS)
    @patch.object(api_main, "get_stock_snapshot", return_value=MOCK_SNAPSHOT)
    def test_analyze_demo_mode_no_crash(self, _snap, _news, mock_hermes):
        mock_hermes.return_value = _mock_hermes_response("analyze_asset", {
            "ticker": "SPY",
            "decision": "[Demo] Connect API key for live analysis.",
            "analyst_reports": {},
            "disclaimer": "For research purposes only.",
            "mode": "demo",
        })
        resp = _CLIENT.post("/api/analyze", json={"ticker": "SPY"})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["ok"])


# ── /api/status ────────────────────────────────────────────────────── #

class TestStatusEndpoint(unittest.TestCase):

    @patch.object(api_main, "_ping_hermes", new_callable=AsyncMock, return_value=True)
    def test_status_operational(self, _ping):
        resp = _CLIENT.get("/api/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ok"])
        self.assertIn("mode", data)
        self.assertIn("services", data)

    @patch.object(api_main, "_ping_hermes", new_callable=AsyncMock, return_value=False)
    def test_status_hermes_degraded(self, _ping):
        resp = _CLIENT.get("/api/status")
        data = resp.json()
        self.assertEqual(data["services"]["hermes"], "degraded")
        self.assertEqual(data["services"]["api"], "operational")

    def test_status_demo_mode_reflected(self):
        # Module was loaded without API key → demo mode
        resp = _CLIENT.get("/api/status")
        data = resp.json()
        self.assertEqual(data["mode"], "demo")


# ── Forbidden action exposure tests ────────────────────────────────── #

class TestForbiddenExposure(unittest.TestCase):

    @patch.object(api_main, "_call_hermes_skills", new_callable=AsyncMock)
    def test_public_api_does_not_expose_slash_commands(self, mock_skills):
        mock_skills.return_value = None
        resp = _CLIENT.get("/api/skills")
        body = resp.text
        for cmd in ("/comps", "/dcf", "/earnings-preview", "/tlh", "/rebalance"):
            self.assertNotIn(cmd, body, f"Slash command exposed in public API: {cmd}")

    @patch.object(api_main, "_call_hermes_skills", new_callable=AsyncMock)
    def test_public_api_does_not_expose_lbo(self, mock_skills):
        mock_skills.return_value = None
        resp = _CLIENT.get("/api/skills")
        self.assertNotIn("lbo", resp.text.lower())

    @patch.object(api_main, "_call_hermes_run", new_callable=AsyncMock)
    def test_missing_api_key_returns_demo_not_crash(self, mock_hermes):
        mock_hermes.return_value = None
        # module in demo mode (loaded without API key)
        resp = _CLIENT.post("/api/assistant", json={
            "messages": [{"role": "user", "content": "test"}]
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["mode"], "demo")


if __name__ == "__main__":
    unittest.main()
