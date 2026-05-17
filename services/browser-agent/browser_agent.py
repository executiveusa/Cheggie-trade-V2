"""
Browser Agent — Chrome DevTools control via Playwright.

Exposes session management and action execution with step logging,
screenshots, and an approval system for sensitive actions.
"""

import base64
import logging
import uuid
from datetime import datetime
from typing import Optional

from playwright.async_api import async_playwright, Browser, BrowserContext, Page

logger = logging.getLogger(__name__)

SENSITIVE_ACTIONS = {"click", "fill", "submit", "navigate"}
APPROVAL_REQUIRED_DOMAINS = ["brokerage", "trading", "bank", "account"]


class BrowserSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.created_at = datetime.utcnow().isoformat() + "Z"
        self.steps: list[dict] = []
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.playwright = None
        self._pending_approval: Optional[dict] = None

    async def start(self, headless: bool = True):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=headless)
        self.context = await self.browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (compatible; CheggieTrade Research Agent)",
        )
        self.page = await self.context.new_page()
        self._log_step("session_start", {"headless": headless})

    async def close(self):
        if self.page:
            await self.page.close()
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        self._log_step("session_close", {})

    async def execute_action(self, action: str, params: dict, approved: bool = False) -> dict:
        """Execute a browser action. Sensitive actions require approval."""
        if action in SENSITIVE_ACTIONS and not approved:
            self._pending_approval = {"action": action, "params": params}
            return {
                "status": "pending_approval",
                "action": action,
                "params": params,
                "message": f"Action '{action}' requires approval before execution.",
            }

        try:
            result = await self._dispatch(action, params)
            screenshot = await self._screenshot()
            self._log_step(action, params, result, screenshot)
            return {"status": "ok", "action": action, "result": result, "screenshot": screenshot}
        except Exception as e:
            logger.error("Browser action %s failed: %s", action, e)
            self._log_step(action, params, error=str(e))
            return {"status": "error", "action": action, "error": str(e)}

    async def approve_pending(self) -> dict:
        if not self._pending_approval:
            return {"status": "no_pending_action"}
        action = self._pending_approval["action"]
        params = self._pending_approval["params"]
        self._pending_approval = None
        return await self.execute_action(action, params, approved=True)

    def get_steps(self) -> list[dict]:
        return self.steps

    async def _dispatch(self, action: str, params: dict):
        page = self.page
        if action == "navigate":
            await page.goto(params["url"], wait_until="domcontentloaded", timeout=30000)
            return {"url": page.url, "title": await page.title()}
        elif action == "click":
            await page.click(params["selector"])
            return {"clicked": params["selector"]}
        elif action == "fill":
            await page.fill(params["selector"], params["value"])
            return {"filled": params["selector"]}
        elif action == "screenshot":
            return await self._screenshot()
        elif action == "extract":
            selector = params.get("selector", "body")
            text = await page.inner_text(selector)
            return {"text": text[:5000]}
        elif action == "wait":
            ms = params.get("ms", 1000)
            await page.wait_for_timeout(ms)
            return {"waited_ms": ms}
        else:
            raise ValueError(f"Unknown action: {action}")

    async def _screenshot(self) -> Optional[str]:
        try:
            data = await self.page.screenshot(type="jpeg", quality=60)
            return base64.b64encode(data).decode()
        except Exception:
            return None

    def _log_step(self, action: str, params: dict, result=None, screenshot=None, error=None):
        self.steps.append({
            "step": len(self.steps) + 1,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "action": action,
            "params": params,
            "result": result,
            "screenshot_available": screenshot is not None,
            "error": error,
        })


class BrowserAgentManager:
    def __init__(self):
        self._sessions: dict[str, BrowserSession] = {}

    async def create_session(self, headless: bool = True) -> BrowserSession:
        session_id = str(uuid.uuid4())
        session = BrowserSession(session_id)
        await session.start(headless=headless)
        self._sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[BrowserSession]:
        return self._sessions.get(session_id)

    async def close_session(self, session_id: str):
        session = self._sessions.pop(session_id, None)
        if session:
            await session.close()

    def list_sessions(self) -> list[dict]:
        return [
            {
                "session_id": s.session_id,
                "created_at": s.created_at,
                "step_count": len(s.steps),
                "has_pending_approval": s._pending_approval is not None,
            }
            for s in self._sessions.values()
        ]
