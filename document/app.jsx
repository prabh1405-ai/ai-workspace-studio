import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Braces,
  ChevronDown,
  CircleHelp,
  Database,
  LoaderCircle,
  Play,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Table2,
} from "lucide-react";
import { ErDiagram } from "./ERDiagram";

// Standalone learning example. Start the FastAPI service on port 8000, then
// run this file from a React/Vite project. Set VITE_API_BASE_URL if needed.
const API_BASE = (import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Request failed (${response.status})`);
  }
  return payload;
}

function IconButton({ label, children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function EmptyState({ icon: Icon, title, detail }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-5 text-center">
      <Icon className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

export default function App() {
  const [schema, setSchema] = useState({ database: "", tables: [], relations: [] });
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState("");
  const [activeView, setActiveView] = useState("workspace");
  const [filter, setFilter] = useState("");
  const [prompt, setPrompt] = useState("");
  const [sql, setSql] = useState("");
  const [explanation, setExplanation] = useState([]);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const loadSchema = useCallback(async () => {
    setSchemaLoading(true);
    setSchemaError("");
    try {
      setSchema(await request("/api/schema"));
    } catch (cause) {
      setSchemaError(cause instanceof Error ? cause.message : "Could not load the database schema.");
    } finally {
      setSchemaLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchema();
  }, [loadSchema]);

  const visibleTables = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return schema.tables;
    return schema.tables.filter((table) =>
      table.name.toLowerCase().includes(term) ||
      table.columns.some((column) => column.name.toLowerCase().includes(term)),
    );
  }, [filter, schema.tables]);

  async function generateSql() {
    if (prompt.trim().length < 3 || busy) return;
    setBusy("generate");
    setError("");
    setResult(null);
    try {
      const generated = await request("/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: prompt.trim(), language: "English" }),
      });
      setSql(generated.sql);
      setNotes(generated.notes || "");
      setExplanation(generated.explanation || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate SQL.");
    } finally {
      setBusy("");
    }
  }

  async function runSql() {
    if (sql.trim().length < 3 || busy) return;
    setBusy("run");
    setError("");
    try {
      setResult(await request("/api/run", {
        method: "POST",
        body: JSON.stringify({ sql: sql.trim() }),
      }));
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : "Could not run this query.");
    } finally {
      setBusy("");
    }
  }

  async function explainSql() {
    if (sql.trim().length < 3 || busy) return;
    setBusy("explain");
    setError("");
    try {
      const response = await request("/api/explain", {
        method: "POST",
        body: JSON.stringify({ sql: sql.trim() }),
      });
      setExplanation(response.explanation || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not explain this query.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex h-screen min-h-[680px] flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center gap-8 border-b border-border bg-card px-5">
        <a href="#workspace" className="flex items-center gap-2.5 font-semibold" aria-label="Dolphin AI Studio home">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Database className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>Dolphin AI Studio</span>
        </a>
        <nav className="flex h-full items-center gap-1" aria-label="Main navigation">
          {[
            { id: "workspace", label: "Workspace", icon: Braces },
            { id: "diagram", label: "ER Diagram", icon: Table2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveView(id)}
              aria-current={activeView === id ? "page" : undefined}
              className={`flex h-full items-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors ${
                activeView === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />{label}
            </button>
          ))}
        </nav>
        <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${schemaError ? "bg-destructive" : "bg-success"}`} />
          {schemaError ? "Connection unavailable" : schemaLoading ? "Connecting…" : "Local database"}
        </span>
      </header>

      {activeView === "workspace" ? (
        <div className="flex min-h-0 flex-1 gap-4 p-4">
          <aside className="flex w-64 shrink-0 flex-col border-r border-border pr-4" aria-label="Database tables">
            <div className="flex items-center justify-between gap-2 py-2">
              <div>
                <p className="text-sm font-semibold">Schema Explorer</p>
                <p className="mt-1 text-xs text-muted-foreground">{schema.database || "Loading database"}</p>
              </div>
              <IconButton label="Refresh schema" onClick={() => void loadSchema()} disabled={schemaLoading}>
                <RefreshCw className={`h-4 w-4 ${schemaLoading ? "animate-spin" : ""}`} />
              </IconButton>
            </div>
            <label className="my-3 flex items-center gap-2 rounded-md border border-border px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Find a table or field"
                aria-label="Find a table or field"
              />
            </label>
            <div className="scroll-slim min-h-0 flex-1 overflow-y-auto">
              {schemaError ? (
                <p className="px-2 py-3 text-sm text-destructive">{schemaError}</p>
              ) : visibleTables.length === 0 && !schemaLoading ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No matching tables.</p>
              ) : visibleTables.map((table) => (
                <details key={table.name} className="group border-b border-border/70 py-2" open>
                  <summary className="flex cursor-pointer list-none items-center gap-2 py-1 text-sm font-medium">
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-0 -rotate-90" />
                    <Table2 className="h-4 w-4 text-accent" />
                    <span className="truncate">{table.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{table.columns.length}</span>
                  </summary>
                  <ul className="ml-6 mt-1 space-y-1">
                    {table.columns.map((column) => (
                      <li key={column.name} className="flex items-center gap-2 py-0.5 text-xs text-muted-foreground">
                        <span className="min-w-0 truncate">{column.name}</span>
                        <span className="ml-auto shrink-0 font-mono">{column.key || column.type}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </aside>

          <main className="scroll-slim min-w-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <section className="border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
                <div>
                  <h1 className="text-xl font-semibold">Query Workspace</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Describe the data you need to explore.</p>
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") void generateSql();
                }}
                rows={3}
                maxLength={2000}
                aria-label="Natural language query"
                placeholder="For example: Show the top 10 products by total sales."
                className="mt-4 w-full resize-y rounded-md border border-border bg-card p-4 text-sm leading-relaxed outline-none focus:border-ring"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">AI creates a read-only SQL draft; review it before running.</p>
                <button
                  type="button"
                  onClick={() => void generateSql()}
                  disabled={prompt.trim().length < 3 || Boolean(busy)}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === "generate" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Generate SQL
                </button>
              </div>
            </section>

            {error ? (
              <div role="alert" className="flex items-start gap-2 border-l-2 border-destructive bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
              </div>
            ) : null}

            <section className="border-b border-border pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-semibold"><Braces className="h-4 w-4 text-accent" />Generated SQL</h2>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => void explainSql()} disabled={sql.trim().length < 3 || Boolean(busy)} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-secondary disabled:opacity-50">
                    {busy === "explain" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CircleHelp className="h-4 w-4" />}
                    Explain
                  </button>
                  <button type="button" onClick={() => void runSql()} disabled={sql.trim().length < 3 || Boolean(busy)} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {busy === "run" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Run Query
                  </button>
                </div>
              </div>
              <textarea
                value={sql}
                onChange={(event) => setSql(event.target.value)}
                spellCheck={false}
                rows={Math.max(5, Math.min(14, sql.split("\n").length + 1))}
                aria-label="SQL editor"
                placeholder="Your generated SQL will appear here. You can edit it before execution."
                className="scroll-slim mt-3 w-full resize-y rounded-md border border-border bg-secondary/20 p-4 font-mono text-sm leading-6 outline-none focus:border-ring"
              />
              {notes ? <p className="mt-2 text-xs text-muted-foreground">{notes}</p> : null}
            </section>

            <section className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Query Results</h2>
                {result ? <span className="text-xs text-muted-foreground">{result.rowCount} rows · {result.durationMs} ms</span> : null}
              </div>
              {result ? (
                result.columns.length ? (
                  <div className="scroll-slim mt-3 overflow-auto border border-border">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead><tr className="bg-secondary/50">{result.columns.map((column) => <th key={column} className="border-b border-border px-3 py-2 font-medium">{column}</th>)}</tr></thead>
                      <tbody>{result.rows.map((row, index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          {result.columns.map((column) => <td key={column} className="max-w-64 truncate px-3 py-2 font-mono text-xs" title={row[column] == null ? "NULL" : String(row[column])}>{row[column] == null ? "NULL" : String(row[column])}</td>)}
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : <p className="mt-3 text-sm text-muted-foreground">The query returned no rows.</p>
              ) : <EmptyState icon={Database} title="No results yet" detail="Generate or edit a read-only query, then run it to see the database results here." />}
            </section>
          </main>

          <aside className="hidden w-72 shrink-0 border-l border-border pl-4 xl:block" aria-label="AI explanation">
            <div className="flex items-center gap-2 py-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold">AI Explanation</h2>
            </div>
            {explanation.length ? (
              <ol className="mt-4 space-y-4">
                {explanation.map((step, index) => (
                  <li key={`${step.code}-${index}`} className="border-b border-border pb-3">
                    {step.code ? <code className="block break-all font-mono text-xs text-accent">{step.code}</code> : null}
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Generate a query or choose Explain to see a plain-language breakdown.</p>}
          </aside>
        </div>
      ) : (
        <main className="scroll-slim min-h-0 flex-1 overflow-auto p-5">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold">ER Diagram</h1>
                <p className="mt-1 text-sm text-muted-foreground">{schema.database || "Database schema"} · {schema.tables.length} tables</p>
              </div>
              <IconButton label="Refresh database schema" onClick={() => void loadSchema()} disabled={schemaLoading}>
                <RefreshCw className={`h-4 w-4 ${schemaLoading ? "animate-spin" : ""}`} />
              </IconButton>
            </div>
            {schemaError ? <p role="alert" className="mb-3 text-sm text-destructive">{schemaError}</p> : null}
            <ErDiagram tables={schema.tables} relations={schema.relations} isLoading={schemaLoading} />
          </div>
        </main>
      )}
    </div>
  );
}