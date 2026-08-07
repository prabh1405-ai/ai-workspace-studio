/**
 * Server-only helpers for Dolphin AI Studio: schema metadata, the Lovable AI
 * Gateway calls and the read-only SQL executor.
 */

export type ExplanationStep = { code: string; text: string };

export type GeneratedQuery = {
  sql: string;
  explanation: ExplanationStep[];
  notes: string;
};

export type Cell = string | number | boolean | null;

export type QueryResult = {
  columns: string[];
  rows: Record<string, Cell>[];
  rowCount: number;
  durationMs: number;
};

export const DEMO_SCHEMA = `customers(customer_id text PK, name, email, city, country, signup_date date)
categories(category_id int PK, name)
products(product_id int PK, name, category_id int FK -> categories, price numeric, stock int)
orders(order_id int PK, customer_id text FK -> customers, order_date date, total_amount numeric, status text)
order_items(order_item_id int PK, order_id int FK -> orders, product_id int FK -> products, quantity int, price numeric)
payments(payment_id int PK, order_id int FK -> orders, method text, amount numeric, paid_at date)
reviews(review_id int PK, product_id int FK -> products, customer_id text FK -> customers, rating int, comment text)`;

export const DEMO_TABLES = [
  "customers",
  "categories",
  "products",
  "orders",
  "order_items",
  "payments",
  "reviews",
] as const;

type ChatMessage = { role: "system" | "user"; content: string };

async function callGateway(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured on this project.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up to continue.");
    throw new Error(`AI request failed [${res.status}]: ${body}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content ?? "";
}

function parseJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

export async function generateSqlFromPrompt(
  prompt: string,
  language: string,
): Promise<GeneratedQuery> {
  const raw = await callGateway([
    {
      role: "system",
      content: `You are a senior PostgreSQL engineer inside "Dolphin AI Studio".
Translate the user's natural-language request into ONE read-only SQL SELECT statement for this schema:

${DEMO_SCHEMA}

Rules:
- PostgreSQL syntax only. Never use INSERT/UPDATE/DELETE/DDL.
- Reference tables without a schema prefix.
- Do not end the statement with a semicolon.
- Always add a sensible LIMIT when the result could be large.
- Format the SQL over multiple lines with uppercase keywords.
- The user may write in ${language}; always answer with English column aliases.

Reply as JSON: {"sql": string, "explanation": [{"code": string, "text": string}], "notes": string}
Each explanation item pairs one clause of your SQL with a short plain-English sentence.
"notes" is one short sentence about correctness or performance.`,
    },
    { role: "user", content: prompt },
  ]);

  const parsed = parseJson<Partial<GeneratedQuery>>(raw);
  const sql = (parsed.sql ?? "").trim().replace(/;$/, "");
  if (!sql) throw new Error("The AI could not build a query for that request.");

  return {
    sql,
    explanation: Array.isArray(parsed.explanation)
      ? parsed.explanation
          .filter((s) => s && typeof s.text === "string")
          .map((s) => ({ code: String(s.code ?? ""), text: String(s.text) }))
      : [],
    notes: typeof parsed.notes === "string" ? parsed.notes : "",
  };
}

export async function explainSql(sql: string): Promise<ExplanationStep[]> {
  const raw = await callGateway([
    {
      role: "system",
      content: `You review PostgreSQL queries against this schema:

${DEMO_SCHEMA}

Reply as JSON: {"explanation": [{"code": string, "text": string}]} — one item per clause of the query, each with a short plain-English sentence.`,
    },
    { role: "user", content: sql },
  ]);
  const parsed = parseJson<{ explanation?: ExplanationStep[] }>(raw);
  return Array.isArray(parsed.explanation)
    ? parsed.explanation
        .filter((s) => s && typeof s.text === "string")
        .map((s) => ({ code: String(s.code ?? ""), text: String(s.text) }))
    : [];
}

export async function runReadOnlySql(sql: string): Promise<QueryResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const started = Date.now();
  const { data, error } = await supabaseAdmin.rpc("exec_demo_readonly", {
    query_text: sql,
  });
  const durationMs = Date.now() - started;
  if (error) throw new Error(error.message);

  const raw = (Array.isArray(data) ? data : []) as Record<string, unknown>[];
  const rows = raw.map((row) => {
    const out: Record<string, Cell> = {};
    for (const [key, value] of Object.entries(row)) {
      out[key] =
        value === null || value === undefined
          ? null
          : typeof value === "object"
            ? JSON.stringify(value)
            : (value as Cell);
    }
    return out;
  });
  const columns = rows.length > 0 ? Object.keys(rows[0]!) : [];
  return { columns, rows, rowCount: rows.length, durationMs };
}

export function normalizeRows(rows: Record<string, Cell>[]): string {
  return JSON.stringify(
    rows.map((row) =>
      Object.keys(row)
        .sort()
        .map((k) => String(row[k] ?? "")),
    ),
  );
}
