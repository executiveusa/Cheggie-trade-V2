"""
Tests for skills_manifest.py and financial_skills_adapter.py.
No external network calls — all LLM interactions are mocked.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# Add hermes directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Mock heavy dependencies before any import touches them
_trading_mock = MagicMock()
_trading_mock.DEFAULT_CONFIG = {}
sys.modules.setdefault("yfinance", MagicMock())
sys.modules.setdefault("tradingagents", MagicMock())
sys.modules.setdefault("tradingagents.graph", MagicMock())
sys.modules.setdefault("tradingagents.graph.trading_graph", _trading_mock)
sys.modules.setdefault("tradingagents.default_config", _trading_mock)

import skills_manifest as sm
import financial_skills_adapter as fsa


# ── skills_manifest tests ──────────────────────────────────────────── #

class TestSkillsRegistry(unittest.TestCase):

    def test_registry_returns_all_skills(self):
        reg = sm.registry_as_dict()
        self.assertEqual(len(reg), len(sm.SKILLS))

    def test_registry_public_fields_present(self):
        for item in sm.registry_as_dict():
            self.assertIn("id", item)
            self.assertIn("name", item)
            self.assertIn("description", item)
            self.assertIn("status", item)
            self.assertIn("risk_level", item)
            self.assertIn("requires_approval", item)

    def test_registry_does_not_expose_internals(self):
        for item in sm.registry_as_dict(include_internals=False):
            self.assertNotIn("source", item)
            self.assertNotIn("command", item)
            self.assertNotIn("used_by", item)

    def test_registry_with_internals(self):
        for item in sm.registry_as_dict(include_internals=True):
            self.assertIn("source", item)
            self.assertIn("command", item)
            self.assertIn("used_by", item)

    def test_get_skill_known(self):
        skill = sm.get_skill("analyze-asset")
        self.assertIsNotNone(skill)
        self.assertEqual(skill.id, "analyze-asset")

    def test_get_skill_unknown_returns_none(self):
        self.assertIsNone(sm.get_skill("nonexistent-skill"))

    def test_all_skill_ids_unique(self):
        ids = [s.id for s in sm.SKILLS]
        self.assertEqual(len(ids), len(set(ids)))

    def test_get_skills_for_intent_analyze_asset(self):
        skills = sm.get_skills_for_intent("analyze_asset")
        ids = [s.id for s in skills]
        self.assertIn("analyze-asset", ids)

    def test_get_skills_for_intent_earnings_review(self):
        skills = sm.get_skills_for_intent("earnings_review")
        ids = [s.id for s in skills]
        self.assertIn("earnings-analysis", ids)

    def test_get_skills_for_intent_unknown_returns_empty(self):
        skills = sm.get_skills_for_intent("unknown_intent")
        self.assertEqual(skills, [])


class TestForbiddenActions(unittest.TestCase):

    def test_forbidden_actions_present(self):
        required = [
            "trade_execution",
            "money_transfer",
            "broker_login",
            "profit_guarantee",
            "regulated_advice",
            "expose_model_name",
            "expose_agent_name",
            "expose_internal_tools",
        ]
        for action in required:
            self.assertIn(action, sm.FORBIDDEN_ACTIONS, f"Missing: {action}")

    def test_lbo_model_forbidden(self):
        self.assertIn("lbo_model", sm.FORBIDDEN_ACTIONS)


class TestApprovalRequired(unittest.TestCase):

    def test_high_risk_skills_require_approval(self):
        self.assertIn("portfolio-rebalance", sm.APPROVAL_REQUIRED)
        self.assertIn("tax-loss-harvesting", sm.APPROVAL_REQUIRED)

    def test_low_risk_skills_do_not_require_approval(self):
        self.assertNotIn("analyze-asset", sm.APPROVAL_REQUIRED)
        self.assertNotIn("earnings-analysis", sm.APPROVAL_REQUIRED)


class TestDisclaimer(unittest.TestCase):

    def test_disclaimer_all_locales(self):
        for locale in ("sr-RS", "en-US", "es-ES"):
            self.assertIn(locale, sm.DISCLAIMER)
            self.assertTrue(len(sm.DISCLAIMER[locale]) > 10)

    def test_default_locale_is_serbian(self):
        self.assertEqual(sm.DEFAULT_LOCALE, "sr-RS")


# ── financial_skills_adapter tests ────────────────────────────────── #

class TestCommandMap(unittest.TestCase):

    EXPECTED_COMMANDS = [
        "/comps", "/dcf", "/earnings", "/earnings-preview",
        "/sector", "/thesis", "/catalysts", "/screen",
        "/rebalance", "/tlh",
    ]

    def test_all_slash_commands_present(self):
        for cmd in self.EXPECTED_COMMANDS:
            self.assertIn(cmd, fsa.COMMAND_MAP, f"Missing command: {cmd}")

    def test_all_commands_map_to_known_skill(self):
        for cmd, skill_id in fsa.COMMAND_MAP.items():
            self.assertIsNotNone(sm.get_skill(skill_id), f"{cmd} maps to unknown skill: {skill_id}")

    def test_resolve_command_known(self):
        self.assertEqual(fsa.resolve_command("/earnings"), "earnings-analysis")
        self.assertEqual(fsa.resolve_command("/dcf"), "discounted-cash-flow")
        self.assertEqual(fsa.resolve_command("/comps"), "comparable-company-analysis")
        self.assertEqual(fsa.resolve_command("/screen"), "idea-generation")
        self.assertEqual(fsa.resolve_command("/tlh"), "tax-loss-harvesting")

    def test_resolve_command_unknown_returns_none(self):
        self.assertIsNone(fsa.resolve_command("/unknown"))
        self.assertIsNone(fsa.resolve_command(""))

    def test_resolve_command_case_insensitive(self):
        self.assertEqual(fsa.resolve_command("/EARNINGS"), "earnings-analysis")
        self.assertEqual(fsa.resolve_command("/Sector"), "sector-overview")


class TestGetSkillReference(unittest.TestCase):

    def test_not_implemented_skill_returns_structured_status(self):
        ref = fsa.get_skill_reference("portfolio-rebalance")
        self.assertIn(ref["status"], ("not_implemented", "available_as_reference"))
        self.assertNotIn("cookbook_path", ref)  # internal paths not exposed

    def test_unknown_skill_returns_not_implemented(self):
        ref = fsa.get_skill_reference("totally-unknown-skill")
        self.assertEqual(ref["status"], "not_implemented")

    def test_never_crashes(self):
        for skill_id in ["portfolio-rebalance", "tax-loss-harvesting", "nonexistent", "", "!@#"]:
            try:
                ref = fsa.get_skill_reference(skill_id)
                self.assertIn("status", ref)
            except Exception as exc:
                self.fail(f"get_skill_reference raised unexpectedly for '{skill_id}': {exc}")


class TestRunSkill(unittest.TestCase):

    def _mock_client(self, text="Mock analysis result."):
        client = MagicMock()
        client.messages.create.return_value = MagicMock(
            content=[MagicMock(text=text)]
        )
        return client

    def test_not_implemented_skill_returns_structured_error_no_crash(self):
        result = fsa.run_skill("portfolio-rebalance", {}, self._mock_client())
        self.assertFalse(result["ok"])
        self.assertEqual(result["status"], "requires_approval")
        self.assertIsNone(result["result"])

    def test_tax_loss_harvesting_requires_approval(self):
        result = fsa.run_skill("tax-loss-harvesting", {}, self._mock_client())
        self.assertFalse(result["ok"])
        self.assertEqual(result["status"], "requires_approval")

    def test_unknown_skill_returns_not_found(self):
        result = fsa.run_skill("does-not-exist", {}, self._mock_client())
        self.assertFalse(result["ok"])
        self.assertEqual(result["status"], "not_found")

    def test_reference_skill_returns_llm_result(self):
        client = self._mock_client("Comps analysis: NVDA trades at 30x P/E vs peers at 25x.")
        result = fsa.run_skill("comparable-company-analysis", {"ticker": "NVDA"}, client)
        self.assertTrue(result["ok"])
        self.assertIsNotNone(result["result"])
        self.assertEqual(result["skill_id"], "comparable-company-analysis")

    def test_demo_mode_no_client(self):
        result = fsa.run_skill("comparable-company-analysis", {"ticker": "NVDA"}, None)
        self.assertTrue(result["ok"])
        self.assertEqual(result["status"], "demo")
        self.assertIn("[Demo mode]", result["result"])

    def test_llm_failure_returns_graceful_error(self):
        client = MagicMock()
        client.messages.create.side_effect = Exception("Network error")
        result = fsa.run_skill("comparable-company-analysis", {"ticker": "NVDA"}, client)
        self.assertFalse(result["ok"])
        self.assertEqual(result["status"], "error")
        self.assertIsNone(result["result"])


# ── HermesOrchestrator unit tests ─────────────────────────────────── #

class TestHermesOrchestrator(unittest.TestCase):

    def _make_orchestrator(self, demo=True):
        """Build orchestrator without loading TradingAgents graph."""
        from hermes_orchestrator import HermesOrchestrator
        with patch.dict(os.environ, {}, clear=False):
            if demo:
                os.environ.pop("ANTHROPIC_API_KEY", None)
            orch = HermesOrchestrator.__new__(HermesOrchestrator)
            orch._demo_mode = demo
            orch.anthropic = None if demo else MagicMock()
            orch._graph_cache = {}
            orch.config = {}
            return orch

    def test_select_tools_analyze_asset(self):
        orch = self._make_orchestrator()
        skills = orch.select_tools("analyze_asset")
        self.assertTrue(len(skills) > 0)

    def test_select_tools_unknown_intent_returns_empty(self):
        orch = self._make_orchestrator()
        self.assertEqual(orch.select_tools("unknown_intent"), [])

    def test_parse_intent_demo_mode_returns_analyze_asset(self):
        orch = self._make_orchestrator(demo=True)
        intent = orch.parse_intent("Analiziraj NVDA za swing trade")
        self.assertEqual(intent["intent"], "analyze_asset")

    def test_parse_intent_with_mock_client(self):
        from hermes_orchestrator import HermesOrchestrator
        orch = HermesOrchestrator.__new__(HermesOrchestrator)
        orch._demo_mode = False
        mock_client = MagicMock()
        mock_client.messages.create.return_value = MagicMock(
            content=[MagicMock(
                text='{"intent": "analyze_asset", "params": {"ticker": "NVDA", "date": "2025-01-20", "analysts": ["market"]}, "confidence": 0.95}'
            )]
        )
        orch.anthropic = mock_client
        orch._graph_cache = {}
        orch.config = {}

        intent = orch.parse_intent("Analiziraj NVDA za swing trade")
        self.assertEqual(intent["intent"], "analyze_asset")
        self.assertEqual(intent["params"]["ticker"], "NVDA")

    def test_parse_intent_report_serbian(self):
        from hermes_orchestrator import HermesOrchestrator
        orch = HermesOrchestrator.__new__(HermesOrchestrator)
        orch._demo_mode = False
        mock_client = MagicMock()
        mock_client.messages.create.return_value = MagicMock(
            content=[MagicMock(
                text='{"intent": "generate_report", "params": {"subject": "TLGN", "period": "week"}, "confidence": 0.85}'
            )]
        )
        orch.anthropic = mock_client
        orch._graph_cache = {}
        orch.config = {}

        intent = orch.parse_intent("Napravi izveštaj za Telegram")
        self.assertEqual(intent["intent"], "generate_report")

    def test_execute_demo_mode_returns_demo_result(self):
        orch = self._make_orchestrator(demo=True)
        result = orch.execute({"intent": "analyze_asset", "params": {"ticker": "NVDA"}})
        self.assertTrue(result["ok"])
        self.assertIn("audit", result)
        audit = result["audit"]
        self.assertIn("run_id", audit)
        self.assertEqual(audit["mode"], "demo")

    def test_execute_legacy_intent_name_normalized(self):
        orch = self._make_orchestrator(demo=True)
        result = orch.execute({"intent": "analyze", "params": {"ticker": "AAPL"}})
        self.assertEqual(result["intent"], "analyze_asset")

    def test_execute_status_always_works(self):
        orch = self._make_orchestrator(demo=True)
        result = orch.execute({"intent": "status", "params": {}})
        self.assertTrue(result["ok"])
        self.assertIn("service", result["result"])

    def test_audit_block_has_required_fields(self):
        orch = self._make_orchestrator(demo=True)
        result = orch.execute({"intent": "status"})
        audit = result["audit"]
        required = ["run_id", "tenant_id", "user_id", "skill_ids", "tools_used",
                    "approval_required", "mode", "errors", "created_at"]
        for field in required:
            self.assertIn(field, audit, f"Missing audit field: {field}")

    def test_run_skill_plan_not_implemented_no_crash(self):
        orch = self._make_orchestrator(demo=True)
        plan = orch.run_skill_plan("analyze_asset", {"ticker": "SPY"})
        self.assertIn("skills_planned", plan)
        self.assertIn("audit", plan)
        self.assertIn("disclaimer", plan)

    def test_build_audit_fields(self):
        orch = self._make_orchestrator(demo=True)
        audit = orch._build_audit("analyze_asset", ["analyze-asset"], ["analyze-asset"], [])
        self.assertIn("run_id", audit)
        self.assertEqual(audit["skill_ids"], ["analyze-asset"])
        self.assertEqual(audit["mode"], "demo")
        self.assertFalse(audit["approval_required"])


if __name__ == "__main__":
    unittest.main()
