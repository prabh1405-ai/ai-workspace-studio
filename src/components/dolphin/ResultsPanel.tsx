import { useState } from "react";
import { Hash, ShieldCheck } from "lucide-react";
import { QUERY_INFO, RESULT_ROWS } from "./query-data";

const TABS = ["Result (Preview)", "Query Info"] as const;

export function ResultsPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Result (Preview)");

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
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full border-collapse text-left text-[14.5px]">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground">
                <th className="w-10 border-b border-r border-border px-3 py-2.5 font-normal">
                  <Hash className="h-4 w-4" strokeWidth={1.8} />
                </th>
                <th className="border-b border-r border-border px-3 py-2.5 font-normal">
                  customer_id
                </th>
                <th className="border-b border-r border-border px-3 py-2.5 font-normal">name</th>
                <th className="border-b border-border px-3 py-2.5 font-normal">total_spent</th>
              </tr>
            </thead>
            <tbody>
              {RESULT_ROWS.map((row) => (
                <tr key={row.n} className="transition-colors hover:bg-secondary/25">
                  <td className="border-b border-r border-border px-3 py-2.5 text-muted-foreground">
                    {row.n}
                  </td>
                  <td className="border-b border-r border-border px-3 py-2.5 font-mono">
                    {row.customer_id}
                  </td>
                  <td className="border-b border-r border-border px-3 py-2.5">{row.name}</td>
                  <td className="border-b border-border px-3 py-2.5 font-mono">
                    {row.total_spent}
                  </td>
                </tr>
              ))}
              <tr className="text-muted-foreground">
                {["...", "...", "...", "..."].map((c, i) => (
                  <td key={i} className={`px-3 py-2.5 ${i < 3 ? "border-r border-border" : ""}`}>
                    {c}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col rounded-xl border border-border p-4">
          <dl className="space-y-3.5">
            {QUERY_INFO.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4">
                <dt className="text-[14.5px] text-muted-foreground">{label}</dt>
                <dd className="text-[14.5px] font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex flex-col items-end gap-1.5 pt-6">
            <ShieldCheck className="h-5 w-5 text-success" strokeWidth={1.8} />
            <span className="text-[14.5px] font-medium text-success">Query looks good!</span>
          </div>
        </div>
      </div>
    </section>
  );
}
