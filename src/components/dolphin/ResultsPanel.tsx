import { useState } from "react";
import { Hash, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";

type Cell = string | number | boolean | null;

export type RunState = {
  columns: string[];
  rows: Record<string, Cell>[];
  rowCount: number;
  durationMs: number;
  error: string | null;
  ranAt: string | null;
};

const TABS = ["Result (Preview)", "Query Info"] as const;

type Props = { run: RunState | null; isRunning: boolean; sql: string };

export function ResultsPanel({ run, isRunning, sql }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Result (Preview)");

  const info: [string, string][] = [
    ["Rows Returned", run ? `${run.rowCount}` : "—"],
    ["Execution Time", run ? `${(run.durationMs / 1000).toFixed(3)} sec` : "—"],
    ["Query Status", run ? (run.error ? "Failed" : "Success") : "Not run"],
    ["Statement Type", sql.trim().toLowerCase().startsWith("with") ? "WITH / SELECT" : "SELECT"],
    ["Database", "ecommerce_db"],
    ["Last Run", run?.ranAt ?? "—"],
  ];

  return (
    <section className="panel-surface p-6">
      <div className="flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative -mb-px px-1 pb-3 text-[15.5px] font-medium transition-colors ${
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            {tab === t ? (
              <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-accent" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="scroll-slim overflow-x-auto rounded-xl border border-border">
          {isRunning ? (
            <p className="flex items-center gap-2 px-4 py-6 text-[14.5px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Running query against your database...
            </p>
          ) : run?.error ? (
            <p className="px-4 py-6 text-[14.5px] text-destructive">{run.error}</p>
          ) : !run || run.columns.length === 0 ? (
            <p className="px-4 py-6 text-[14.5px] text-muted-foreground">
              {run ? "Query returned no rows." : "Run a query to see live results here."}
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-[14.5px]">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground">
                  <th className="w-10 border-b border-r border-border px-3 py-2.5 font-normal">
                    <Hash className="h-4 w-4" strokeWidth={1.8} />
                  </th>
                  {run.columns.map((c, i) => (
                    <th
                      key={c}
                      className={`border-b border-border px-3 py-2.5 font-normal ${
                        i < run.columns.length - 1 ? "border-r" : ""
                      }`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {run.rows.slice(0, 50).map((row, r) => (
                  <tr key={r} className="transition-colors hover:bg-secondary/25">
                    <td className="border-b border-r border-border px-3 py-2.5 text-muted-foreground">
                      {r + 1}
                    </td>
                    {run.columns.map((c, i) => (
                      <td
                        key={c}
                        className={`border-b border-border px-3 py-2.5 font-mono ${
                          i < run.columns.length - 1 ? "border-r" : ""
                        }`}
                      >
                        {row[c] === null ? "NULL" : String(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col rounded-xl border border-border p-4">
          <dl className="space-y-3.5">
            {info.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4">
                <dt className="text-[14.5px] text-muted-foreground">{label}</dt>
                <dd className="text-[14.5px] font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex flex-col items-end gap-1.5 pt-6">
            {run?.error ? (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.8} />
                <span className="text-[14.5px] font-medium text-destructive">Query failed</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5 text-success" strokeWidth={1.8} />
                <span className="text-[14.5px] font-medium text-success">
                  {run ? "Query looks good!" : "Read-only & safe"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
