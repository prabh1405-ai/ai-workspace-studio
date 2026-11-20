"""AI-assisted, plain-language explanation of a SQL SELECT statement."""

from __future__ import annotations

from typing import Any

from ai_service import generate_json
from query_genrator import DATABASE_SCHEMA


async def explain_sql(sql: str) -> list[dict[str, str]]:
    """Return one short explanation item per major SQL clause."""
    system_instruction = f"""Explain SQL for a beginner using plain, concise English.
The known SQLite schema is:
{DATABASE_SCHEMA}

Return only a JSON object of the form {{"explanation": [{{"code": "...", "text": "..."}}]}}.
Use one item per meaningful clause (SELECT, FROM/JOIN, WHERE, GROUP BY, ORDER BY,
LIMIT, or CTE when present). Quote the actual clause briefly. Do not claim that
the query was executed or that its results are correct."""
    result: dict[str, Any] = await generate_json(system_instruction=system_instruction, user_prompt=sql)
    raw_steps = result.get("explanation", [])
    if not isinstance(raw_steps, list):
        return []
    return [
        {"code": str(item.get("code", ""))[:300], "text": str(item.get("text", ""))[:800]}
        for item in raw_steps[:20]
        if isinstance(item, dict) and str(item.get("text", "")).strip()
    ]