from __future__ import annotations

from typing import Callable, Dict


def voice_to_text(audio_bytes: bytes | None) -> str | None:
    if not audio_bytes:
        return None
    return "transcribed voice command"


def process_voice_or_text(audio_bytes: bytes | None, text_input: str | None, hermes_runner: Callable[[str], Dict]):
    transcript = voice_to_text(audio_bytes)
    query = transcript or text_input or ""
    return {"input_mode": "voice" if transcript else "text", "result": hermes_runner(query)}
