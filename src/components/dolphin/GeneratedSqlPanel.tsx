import { useState } from "react";
import { Sparkle, Copy, Check, Play, Loader2, Pencil } from "lucide-react";
import { highlightSql } from "./sql-highlight";

type Props = {
  sql: string;
  onSqlChange: (value: string) => void;
  onRun: () => void;
  isRunning: boolean;
  isGenerating: boolean;
};

export function GeneratedSqlPanel({ sql, onSqlChange, onRun, isRunning, isGenerating }: Props) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const lines = sql.split("\n");

  return (
    <section className="panel-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2.5 text-[19px] font-semibold">
          <Sparkle className="h-[18px] w-[18px] text-accent" strokeWidth={1.8} />
          Generated SQL
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-[14.5px] font-medium transition-colors hover:bg-secondary"
          >
            <Pencil className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
            {editing ? "Done" : "Edit"}
          </button>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(sql);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-[14.5px] font-medium transition-colors hover:bg-secondary"
          >
            {copied ? (
              <Check className="h-[17px] w-[17px] text-success" strokeWidth={2} />
            ) : (
              <Copy className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
            )}
            {copied ? "Copied" : "Copy SQL"}
          </button>
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning || sql.trim().length < 3}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[14.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isRunning ? (
              <Loader2 className="h-[17px] w-[17px] animate-spin" strokeWidth={2} />
            ) : (
              <Play className="h-[17px] w-[17px]" strokeWidth={2} />
            )}
            Run Query
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          value={sql}
          onChange={(e) => onSqlChange(e.target.value)}
          spellCheck={false}
          rows={Math.max(6, lines.length + 1)}
          aria-label="SQL editor"
          className="scroll-slim mt-4 w-full resize-y rounded-xl border border-border bg-secondary/20 p-4 font-mono text-[15px] leading-[2] focus:border-ring focus:outline-none"
        />
      ) : (
        <div className="scroll-slim mt-4 overflow-x-auto rounded-xl border border-border bg-secondary/20 py-4">
          {isGenerating ? (
            <p className="px-4 font-mono text-[15px] text-muted-foreground">
              Dolphin AI is writing your query...
            </p>
          ) : sql.trim() === "" ? (
            <p className="px-4 font-mono text-[15px] text-muted-foreground">
              -- Ask a question above to generate SQL
            </p>
          ) : (
            <pre className="font-mono text-[15px] leading-[2]">
              {lines.map((line, i) => (
                <div key={i} className="flex px-4">
                  <span className="w-8 select-none pr-4 text-right text-code-line">{i + 1}</span>
                  <code className="whitespace-pre">{highlightSql(line)}</code>
                </div>
              ))}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
