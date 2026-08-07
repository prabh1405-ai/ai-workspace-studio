import { Sparkle, Info, MoveRight } from "lucide-react";
import { EXPLANATION } from "./query-data";
import { highlightSql } from "./sql-highlight";

export function AiExplanationPanel() {
  return (
    <aside className="panel-surface flex w-[420px] shrink-0 flex-col overflow-hidden p-5">
      <h2 className="flex items-center gap-2.5 text-[19px] font-semibold">
        <Sparkle className="h-[18px] w-[18px] text-accent" strokeWidth={1.8} />
        AI Explanation
        <Info className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
      </h2>

      <ol className="scroll-slim mt-4 flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-secondary/15 p-4">
        {EXPLANATION.map((step, i) => (
          <li key={i} className="flex gap-3 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-[13px] font-semibold ${
                i % 3 === 0
                  ? "bg-primary/85 text-primary-foreground"
                  : i % 3 === 1
                    ? "bg-accent/80 text-accent-foreground"
                    : "bg-success/80 text-accent-foreground"
              }`}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <code className="block font-mono text-[14px] leading-[1.7] break-words">
                {highlightSql(step.code)}
              </code>
              <p className="mt-1.5 flex gap-2 text-[14.5px] leading-snug text-foreground/85">
                <MoveRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                <span>{step.text}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
