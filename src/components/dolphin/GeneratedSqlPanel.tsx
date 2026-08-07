import { Sparkle, Copy } from "lucide-react";
import { SQL_LINES } from "./query-data";
import { highlightSql } from "./sql-highlight";

export function GeneratedSqlPanel() {
  return (
    <section className="panel-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2.5 text-[19px] font-semibold">
          <Sparkle className="h-[18px] w-[18px] text-accent" strokeWidth={1.8} />
          Generated SQL
        </h2>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-[14.5px] font-medium transition-colors hover:bg-secondary"
        >
          <Copy className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
          Copy SQL
        </button>
      </div>

      <div className="scroll-slim mt-4 overflow-x-auto rounded-xl border border-border bg-secondary/20 py-4">
        <pre className="font-mono text-[15px] leading-[2]">
          {SQL_LINES.map((line, i) => (
            <div key={i} className="flex px-4">
              <span className="w-8 select-none pr-4 text-right text-code-line">{i + 1}</span>
              <code className="whitespace-pre">{highlightSql(line)}</code>
            </div>
          ))}
        </pre>
      </div>
    </section>
  );
}
