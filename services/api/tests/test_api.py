import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from fastapi.testclient import TestClient

from services.api.main import app

client = TestClient(app)


def test_skills_registry_full():
    r = client.get('/api/skills')
    assert r.status_code == 200
    skills = r.json()['skills']
    assert any(s['id'] == 'discounted-cash-flow' for s in skills)


def test_skills_run_safe_not_implemented_and_blocked():
    r = client.post('/api/skills/run', json={'command': '/thesis', 'payload': {}})
    assert r.status_code == 200
    assert r.json()['status'] in ['not_implemented', 'available_as_reference']

    blocked = client.post('/api/skills/run', json={'command': '/dcf', 'payload': {}, 'approved': False})
    assert blocked.status_code == 200
    assert blocked.json()['blocked'] is True


def test_assistant_routes_analyze_asset():
    r = client.post('/api/assistant', json={'messages': [{'role': 'user', 'content': 'Analiziraj NVDA za swing trade'}]})
    assert r.status_code == 200
    assert r.json()['response']['parsed_intent']['intent'] == 'analyze_asset'


def test_assistant_routes_generate_report():
    r = client.post('/api/assistant', json={'messages': [{'role': 'user', 'content': 'Napravi izveštaj za Telegram'}]})
    assert r.status_code == 200
    assert r.json()['response']['parsed_intent']['intent'] == 'generate_report'


def test_missing_key_demo_mode():
    r = client.get('/api/status')
    assert r.status_code == 200
    assert r.json()['mode'] == 'demo'


def test_public_ui_no_internal_terms():
    body = client.post('/api/assistant', json={'messages': [{'role': 'user', 'content': 'Analiziraj NVDA'}]}).text.lower()
    for forbidden in ['/comps', '/dcf', 'lbo', 'claude', 'anthropic']:
        assert forbidden not in body
