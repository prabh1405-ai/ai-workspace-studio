"""Small, provider-specific AI client for the standalone learning backend.

Configuration is read from the process environment:
    GEMINI_API_KEY  Required Google AI Studio API key (never commit it).
    GEMINI_MODEL    Optional model name; defaults to gemini-2.5-flash.

The module keeps HTTP and response parsing in one place so SQL generation and
explanation code can focus on their own prompts and output validation.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

DEFAULT_MODEL = "gemini-2.5-flash"
API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models"


class AIServiceError(RuntimeError):
    """A safe, user-facing AI provider error without secrets or response bodies."""


def _parse_json_response(text: str) -> dict[str, Any]:
    """Parse a JSON object, tolerating a model's optional Markdown code fence."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise AIServiceError("The AI returned a response that was not valid JSON.") from exc
    if not isinstance(result, dict):
        raise AIServiceError("The AI response must be a JSON object.")
    return result


async def generate_json(*, system_instruction: str, user_prompt: str) -> dict[str, Any]:
    """Call Gemini and return one JSON object; API credentials stay server-side."""
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise AIServiceError("AI is not configured. Set GEMINI_API_KEY in the backend environment.")

    model = os.environ.get("GEMINI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    url = f"{API_ROOT}/{model}:generateContent"
    payload = {
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.1},
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(35.0, connect=8.0)) as client:
            response = await client.post(
                url,
                headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
                json=payload,
            )
    except httpx.TimeoutException as exc:
        raise AIServiceError("The AI request timed out. Please try again.") from exc
    except httpx.RequestError as exc:
        raise AIServiceError("The AI service could not be reached.") from exc

    if response.status_code in (401, 403):
        raise AIServiceError("The AI provider rejected the configured API key.")
    if response.status_code == 429:
        raise AIServiceError("The AI service is rate-limited. Try again shortly.")
    if response.status_code >= 500:
        raise AIServiceError("The AI service is temporarily unavailable.")
    if not response.is_success:
        raise AIServiceError(f"The AI request was rejected (HTTP {response.status_code}).")

    try:
        body = response.json()
        candidates = body.get("candidates", [])
        content = candidates[0].get("content", {}) if candidates else {}
        parts = content.get("parts", [])
        text = "".join(str(part.get("text", "")) for part in parts)
    except (ValueError, AttributeError, IndexError, TypeError) as exc:
        raise AIServiceError("The AI service returned an unreadable response.") from exc
    if not text.strip():
        raise AIServiceError("The AI returned an empty response. Please try again.")
    return _parse_json_response(text)