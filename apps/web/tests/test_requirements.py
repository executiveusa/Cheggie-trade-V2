from pathlib import Path

WEB = Path(__file__).resolve().parents[1] / "src"


def test_homepage_clarity_and_serbian_default():
    text = (WEB / "homepage.tsx").read_text()
    assert "CheggieTrade pretvara tržišnu buku u jasan trading plan." in text
    assert "Pokreni analizu" in text


def test_no_forbidden_terms():
    text = "\n".join(p.read_text() for p in WEB.glob("*.tsx"))
    forbidden = ["model routing", "agent internals", "dev dashboard", "Tailwind template", "AI toy"]
    assert not any(word.lower() in text.lower() for word in forbidden)


def test_routes_correct():
    api_text = Path("services/api/main.py").read_text()
    for route in ["/api/analyze", "/api/assistant", "/api/skills", "/api/status"]:
        assert route in api_text


def test_assistant_non_technical():
    text = (WEB / "assistant.tsx").read_text().lower()
    assert "model" not in text
    assert "internals" not in text


def test_design_quality_score():
    text = (WEB / "homepage.tsx").read_text().lower()
    signals = ["editorial", "typography", "whitespace", "asymmetric", "display-strong"]
    score = sum(1 for s in signals if s in text) / len(signals) * 10
    assert score >= 8.5
