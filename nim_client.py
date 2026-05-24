import os
import time
from openai import OpenAI

NIM_BASE_URL = os.getenv("NVIDIA_NIM_BASE_URL", "http://31.220.58.212:8082")
NIM_API_KEY  = os.getenv("NVIDIA_NIM_API_KEY",  "dummy")
NIM_MODEL    = os.getenv("NVIDIA_NIM_MODEL",    "moonshotai/kimi-k2-thinking")

nim_client = OpenAI(
    base_url=NIM_BASE_URL,
    api_key=NIM_API_KEY,
)


def nim_chat(
    messages: list[dict],
    system_prompt: str = None,
    max_tokens: int = 4096,
    temperature: float = 0.7,
) -> str:
    if system_prompt:
        messages = [{"role": "system", "content": system_prompt}] + messages

    for attempt in range(2):
        try:
            res = nim_client.chat.completions.create(
                model=NIM_MODEL,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return res.choices[0].message.content or ""
        except Exception as e:
            if getattr(e, "status_code", None) == 429 and attempt == 0:
                time.sleep(2)
            else:
                raise
