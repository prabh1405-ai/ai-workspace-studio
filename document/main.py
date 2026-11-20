"""FastAPI service for the separate Dolphin AI Studio learning example.

Run from this folder with: uvicorn main:app --reload --port 8000
Install: fastapi, uvicorn[standard], httpx. Set GEMINI_API_KEY in the server
environment to enable AI generation and explanations. The local demo database
is created automatically; set DOLPHIN_DB_PATH to choose another SQLite file.
"""

from __future__ import annotations

import os
import re
import sqlite3
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
from urllib.parse import quote

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_service import AIServiceError
from query_genrator import DATABASE_SCHEMA, generate_query
from sql_explainer import explain_sql

DB_PATH = Path(os.environ.get("DOLPHIN_DB_PATH", Path(__file__).with_name("dolphin_learning.db"))).expanduser().resolve()
MAX_RETURNED_ROWS = 500
QUERY_TIMEOUT_SECONDS = 5
WRITE_KEYWORDS = {
    "ALTER", "ATTACH", "CREATE", "DELETE", "DETACH", "DROP", "INSERT",
    "INTO", "PRAGMA", "REINDEX", "REPLACE", "TRUNCATE", "UPDATE", "VACUUM",
}


class PromptRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)
    language: str = Field(default="English", min_length=2, max_length=40)


class SqlRequest(BaseModel):
    sql: str = Field(min_length=3, max_length=5000)


def _initialize_database() -> None:
    """Create a small, fictional ecommerce database for local practice."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH, timeout=5) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS customers (
                customer_id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE,
                city TEXT, country TEXT, signup_date TEXT
            );
            CREATE TABLE IF NOT EXISTS categories (
                category_id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE
            );
            CREATE TABLE IF NOT EXISTS products (
                product_id INTEGER PRIMARY KEY, name TEXT NOT NULL,
                category_id INTEGER REFERENCES categories(category_id),
                price NUMERIC NOT NULL CHECK (price >= 0), stock INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS orders (
                order_id INTEGER PRIMARY KEY, customer_id TEXT NOT NULL REFERENCES customers(customer_id),
                order_date TEXT NOT NULL, total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
                status TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS order_items (
                order_item_id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(order_id),
                product_id INTEGER NOT NULL REFERENCES products(product_id),
                quantity INTEGER NOT NULL CHECK (quantity > 0), price NUMERIC NOT NULL
            );
            CREATE TABLE IF NOT EXISTS payments (
                payment_id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(order_id),
                method TEXT NOT NULL, amount NUMERIC NOT NULL, paid_at TEXT
            );
            CREATE TABLE IF NOT EXISTS reviews (
                review_id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(product_id),
                customer_id TEXT NOT NULL REFERENCES customers(customer_id),
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT
            );
            """
        )
        connection.executemany(
            "INSERT OR IGNORE INTO customers VALUES (?, ?, ?, ?, ?, ?)",
            [
                ("C001", "Ava Chen", "ava@example.test", "Boston", "US", "2025-01-12"),
                ("C002", "Noah Patel", "noah@example.test", "Austin", "US", "2025-02-03"),
                ("C003", "Mia Rivera", "mia@example.test", "Seattle", "US", "2025-03-18"),
            ],
        )
        connection.executemany(
            "INSERT OR IGNORE INTO categories VALUES (?, ?)",
            [(1, "Electronics"), (2, "Home"), (3, "Books")],
        )
        connection.executemany(
            "INSERT OR IGNORE INTO products VALUES (?, ?, ?, ?, ?)",
            [(101, "Wireless Headphones", 1, 79.99, 24), (102, "Desk Lamp", 2, 34.50, 18), (103, "SQL Field Guide", 3, 28.00, 42)],
        )
        connection.executemany(
            "INSERT OR IGNORE INTO orders VALUES (?, ?, ?, ?, ?)",
            [(1001, "C001", "2025-04-04", 159.98, "paid"), (1002, "C002", "2025-04-12", 34.50, "paid"), (1003, "C003", "2025-04-20", 56.00, "pending")],
        )
        connection.executemany(
            "INSERT OR IGNORE INTO order_items VALUES (?, ?, ?, ?, ?)",
            [(1, 1001, 101, 2, 79.99), (2, 1002, 102, 1, 34.50), (3, 1003, 103, 2, 28.00)],
        )
        connection.executemany(
            "INSERT OR IGNORE INTO payments VALUES (?, ?, ?, ?, ?)",
            [(1, 1001, "card", 159.98, "2025-04-04"), (2, 1002, "wallet", 34.50, "2025-04-12")],
        )
        connection.executemany(
            "INSERT OR IGNORE INTO reviews VALUES (?, ?, ?, ?, ?)",
            [(1, 101, "C001", 5, "Clear sound"), (2, 102, "C002", 4, "Good light"), (3, 103, "C003", 5, "Helpful book")],
        )


@asynccontextmanager
async def lifespan(_: FastAPI):
    _initialize_database()
    yield


app = FastAPI(
    title="Dolphin AI Studio — Learning API",
    description="Standalone natural-language SQL, read-only query, and explanation sample.",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = [
    origin.strip()
    for origin in os.environ.get("DOLPHIN_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def validate_read_only_sql(sql: str) -> str:
    """Allow one SELECT/WITH statement; reject comments, writes, and stacked SQL.

    SQLite is also opened in URI read-only mode and with ``query_only`` enabled;
    these checks are defense in depth, not the only read-only control.
    """
    if not sql or len(sql) > 5000:
        raise HTTPException(status_code=422, detail="SQL must contain between 1 and 5000 characters.")

    output: list[str] = []
    semicolon_positions: list[int] = []
    i = 0
    while i < len(sql):
        char = sql[i]
        next_char = sql[i + 1] if i + 1 < len(sql) else ""
        if char == "-" and next_char == "-":
            i += 2
            while i < len(sql) and sql[i] not in "\r\n":
                i += 1
            output.append(" ")
            continue
        if char == "/" and next_char == "*":
            end = sql.find("*/", i + 2)
            if end < 0:
                raise HTTPException(status_code=422, detail="SQL contains an unfinished comment.")
            output.append(" ")
            i = end + 2
            continue
        if char in ("'", '"', "`", "["):
            closing = "]" if char == "[" else char
            output.append(" ")
            i += 1
            while i < len(sql):
                if sql[i] == closing:
                    if closing != "]" and i + 1 < len(sql) and sql[i + 1] == closing:
                        i += 2
                        continue
                    i += 1
                    break
                if sql[i] == "\\" and i + 1 < len(sql):
                    i += 2
                else:
                    i += 1
            else:
                raise HTTPException(status_code=422, detail="SQL contains an unfinished quoted value.")
            continue
        if char == ";":
            semicolon_positions.append(len(output))
        output.append(char)
        i += 1

    neutral = "".join(output)
    if semicolon_positions:
        last_semicolon = semicolon_positions[0]
        if len(semicolon_positions) > 1 or neutral[last_semicolon + 1 :].strip():
            raise HTTPException(status_code=422, detail="Only one SQL statement may be run at a time.")
        neutral = neutral[:last_semicolon]

    first = re.match(r"\s*(SELECT|WITH)\b", neutral, flags=re.IGNORECASE)
    if not first:
        raise HTTPException(status_code=422, detail="Only read-only SELECT queries are allowed.")
    tokens = set(re.findall(r"\b[A-Za-z_][A-Za-z_0-9]*\b", neutral.upper()))
    if tokens & WRITE_KEYWORDS:
        raise HTTPException(status_code=422, detail="This SQL contains a write or administrative operation and was blocked.")
    return sql.strip().rstrip(";").strip()


def _open_read_only_database() -> sqlite3.Connection:
    """Open only the configured local database with SQLite read-only mode."""
    uri = f"file:{quote(str(DB_PATH), safe='/')}?mode=ro"
    connection = sqlite3.connect(uri, uri=True, timeout=2)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA query_only = ON")
    return connection


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "Dolphin AI Studio Learning API"}


@app.get("/api/schema")
async def get_schema() -> dict[str, Any]:
    """Expose table/column metadata for the local ER diagram and explorer."""
    tables: list[dict[str, Any]] = []
    relations: list[dict[str, str]] = []
    try:
        with _open_read_only_database() as connection:
            names = [
                row["name"]
                for row in connection.execute(
                    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
                )
            ]
            for table_name in names:
                escaped = table_name.replace('"', '""')
                columns = connection.execute(f'PRAGMA table_info("{escaped}")').fetchall()
                tables.append({
                    "name": table_name,
                    "columns": [
                        {"name": row["name"], "type": row["type"] or "TEXT", "key": "PK" if row["pk"] else None}
                        for row in columns
                    ],
                })
                foreign_keys = connection.execute(f'PRAGMA foreign_key_list("{escaped}")').fetchall()
                for foreign_key in foreign_keys:
                    target = str(foreign_key["table"])
                    source_column = str(foreign_key["from"])
                    target_column = str(foreign_key["to"])
                    for column in tables[-1]["columns"]:
                        if column["name"] == source_column:
                            column["key"] = "FK"
                    relations.append({"from": table_name, "to": target, "label": f"{source_column} → {target_column}"})
    except sqlite3.Error as exc:
        raise HTTPException(status_code=503, detail="Could not read the local database schema.") from exc
    return {"database": DB_PATH.stem, "tables": tables, "relations": relations}


@app.post("/api/generate")
async def generate_sql(body: PromptRequest) -> dict[str, Any]:
    """Ask the model for a read-only SQL draft; this endpoint does not execute it."""
    try:
        generated = await generate_query(body.prompt.strip(), body.language)
        generated["sql"] = validate_read_only_sql(generated["sql"])
        return generated
    except AIServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/api/explain")
async def explain_query(body: SqlRequest) -> dict[str, Any]:
    """Explain an edited SQL draft without executing it."""
    sql = validate_read_only_sql(body.sql)
    try:
        return {"explanation": await explain_sql(sql)}
    except AIServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/api/run")
async def run_query(body: SqlRequest) -> dict[str, Any]:
    """Run a bounded, read-only SQL query against the local learning database."""
    sql = validate_read_only_sql(body.sql)
    started = time.perf_counter()
    deadline = started + QUERY_TIMEOUT_SECONDS
    try:
        with _open_read_only_database() as connection:
            connection.set_progress_handler(lambda: int(time.perf_counter() > deadline), 1000)
            cursor = connection.execute(sql)
            if cursor.description is None:
                raise HTTPException(status_code=422, detail="The query did not return a result set.")
            columns = [str(description[0]) for description in cursor.description]
            rows = [dict(row) for row in cursor.fetchmany(MAX_RETURNED_ROWS + 1)]
            truncated = len(rows) > MAX_RETURNED_ROWS
            rows = rows[:MAX_RETURNED_ROWS]
    except HTTPException:
        raise
    except sqlite3.OperationalError as exc:
        message = str(exc).lower()
        if "interrupted" in message:
            raise HTTPException(status_code=408, detail="The query exceeded the 5-second time limit.") from exc
        raise HTTPException(status_code=422, detail="SQLite could not run this query. Check its table names, fields, and syntax.") from exc
    except sqlite3.Error as exc:
        raise HTTPException(status_code=422, detail="The database rejected this query.") from exc
    return {
        "columns": columns,
        "rows": rows,
        "rowCount": len(rows),
        "durationMs": round((time.perf_counter() - started) * 1000, 2),
        "truncated": truncated,
    }


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Dolphin AI Studio learning API", "health": "/api/health", "docs": "/docs"}