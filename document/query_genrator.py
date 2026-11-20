"""Natural-language to read-only SQL generation for the learning example.

The filename follows the requested ``query_genrator.py`` spelling. Generated
SQL is checked here for obvious model mistakes and checked again by the
database execution boundary in ``main.py`` before it can run.
"""

from __future__ import annotations

import re
from typing import Any

from ai_service import AIServiceError, generate_json

DATABASE_SCHEMA = """
customers(customer_id TEXT PK, name TEXT, email TEXT, city TEXT, country TEXT, signup_date DATE)
categories(category_id INTEGER PK, name TEXT)
products(product_id INTEGER PK, name TEXT, category_id INTEGER FK, price NUMERIC, stock INTEGER)
orders(order_id INTEGER PK, customer_id TEXT FK, order_date DATE, total_amount NUMERIC, status TEXT)
order_items(order_item_id INTEGER PK, order_id INTEGER FK, product_id INTEGER FK, quantity INTEGER, price NUMERIC)
payments(payment_id INTEGER PK, order_id INTEGER FK, method TEXT, amount NUMERIC, paid_at DATE)
reviews(review_id INTEGER PK, product_id INTEGER FK, customer_id TEXT FK, rating INTEGER, comment TEXT)
""".strip()

_WRITE_KEYWORDS = {
    "ALTER", "ATTACH", "CREATE", "DELETE", "DETACH", "DROP", "INSERT",
    "INTO", "PRAGMA", "REPLACE", "REINDEX", "TRUNCATE", "UPDATE", "VACUUM",
}


def _check_select_shape(sql: str) -> str:
    """Reject obvious non-query model output; the runner applies stricter checks."""
    cleaned = sql.strip()
    first = re.match(r"(?is)^(?:\ufeff|\s)*(SELECT|WITH)\b", cleaned)
    if not first:
        raise AIServiceError("The AI did not return a SELECT query. Please try a more specific request.")
    # Strip literals/comments before checking dangerous statement keywords.
    neutral = re.sub(r"--[^\n]*|/\*[\s\S]*?\*/|(?:'(?:''|[^'])*'|\"(?:\"\"|[^\"])*\")", " ", cleaned)
    if re.search(r";\s*\S", neutral):
        raise AIServiceError("The AI returned more than one SQL statement; it was not accepted.")
    tokens = set(re.findall(r"\b[A-Za-z_][A-Za-z_0-9]*\b", neutral.upper()))
    if tokens & _WRITE_KEYWORDS:
        raise AIServiceError("The AI returned a statement with a write operation; it was not accepted.")
    return cleaned


async def generate_query(prompt: str, language: str = "English") -> dict[str, Any]:
    """Generate a single SQL query and concise explanations for the live schema."""
    system_instruction = f"""You are the SQL assistant for Dolphin AI Studio.
Translate the user's request into one SQLite-compatible, read-only SELECT query.
The database schema is:
{DATABASE_SCHEMA}

Rules:
- Return a JSON object with keys sql, explanation, and notes.
- sql is exactly one SELECT or WITH ... SELECT statement. Never use writes, DDL,
  PRAGMA, ATTACH, multiple statements, or schema-qualified table names.
- Use only the listed tables and columns. Include a LIMIT 100 for potentially
  large result sets. Do not include Markdown fences or a trailing semicolon.
- explanation is a list of objects with code and text string fields.
- Answer explanations in English; user's preferred language is {language}.
- notes is a brief correctness or performance note."""
    result = await generate_json(system_instruction=system_instruction, user_prompt=prompt)
    sql = result.get("sql")
    if not isinstance(sql, str) or not sql.strip():
        raise AIServiceError("The AI did not provide a SQL query.")
    safe_sql = _check_select_shape(sql)
    raw_explanation = result.get("explanation", [])
    explanation = [
        {"code": str(item.get("code", ""))[:300], "text": str(item.get("text", ""))[:800]}
        for item in raw_explanation[:20]
        if isinstance(item, dict) and str(item.get("text", "")).strip()
    ] if isinstance(raw_explanation, list) else []
    return {
        "sql": safe_sql,
        "explanation": explanation,
        "notes": str(result.get("notes", ""))[:1000],
    }