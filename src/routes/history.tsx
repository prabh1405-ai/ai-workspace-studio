import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, History as HistoryIcon, Loader2 } from "lucide-react";
import { TopNav } from "@/components/dolphin/TopNav";
import { highlightSql } from "@/components/dolphin/sql-highlight";
import { listHistory } from "@/lib/dolphin.functions";

const title = "Query History — Dolphin AI Studio";
const description =
  "Every natural-language question, the SQL Dolphin AI generated for it, and how each query performed against your database.";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: HistoryPage,
});

type Row = {
  id: string;
  prompt: string;
  sql: string;
  row_count: number;
  duration_ms: number;
  status: string;
  error: string | null;
  created_at: string;
};

function HistoryPage() {
  const fetchHistory = useServerFn(listHistory);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        setRows((await fetchHistory()) as Row[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchHistory]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav />
      <div className="scroll-slim flex-1 overflow-y-auto p-4">
        <section className="panel-surface mx-auto max-w-[1100px] p-6">
          <h1 className="flex items-center gap-2.5 text-[25px] font-bold tracking-tight">
            <HistoryIcon className="h-6 w-6 text-accent" strokeWidth={1.8} />
            Query History
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Every question you asked and the SQL that ran against your database.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {loading ? (
              <p className="flex items-center gap-2 text-[15px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading history...
              </p>
            ) : rows.length === 0 ? (
              <p className="text-[15px] text-muted-foreground">
                No queries yet — run one from the Workspace.
              </p>
            ) : (
              rows.map((row) => (
                <article key={row.id} className="rounded-xl border border-border bg-secondary/15 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[15.5px] font-medium">{row.prompt}</p>
                    <div className="flex items-center gap-4 text-[14px] text-muted-foreground">
                      <span>{new Date(row.created_at).toLocaleString()}</span>
                      <span>{row.row_count} rows</span>
                      <span>{(row.duration_ms / 1000).toFixed(3)} sec</span>
                      {row.status === "success" ? (
                        <CheckCircle2 className="h-[18px] w-[18px] text-success" strokeWidth={1.8} />
                      ) : (
                        <XCircle className="h-[18px] w-[18px] text-destructive" strokeWidth={1.8} />
                      )}
                    </div>
                  </div>
                  <pre className="scroll-slim mt-3 overflow-x-auto font-mono text-[14px] leading-[1.9]">
                    {row.sql.split("\n").map((line, i) => (
                      <div key={i}>
                        <code className="whitespace-pre">{highlightSql(line)}</code>
                      </div>
                    ))}
                  </pre>
                  {row.error ? (
                    <p className="mt-2 text-[14px] text-destructive">{row.error}</p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
