import { Code2, Copy, FileCode2 } from "lucide-react";
import { toast } from "sonner";
import { highlightSql } from "./sql-highlight";

export function SqlPreviewPanel({ ddl }: { ddl: string }) {
  const lines = ddl ? ddl.split("\n") : [];

  return (
    <aside className="panel-surface flex w-[420px] shrink-0 flex-col overflow-hidden p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-[19px] font-semibold">
          <Code2 className="h-[19px] w-[19px] text-accent" strokeWidth={1.8} />
          SQL Preview
        </h2>
        <button
          type="button"
          disabled={!ddl}
          onClick={async () => {
            await navigator.clipboard.writeText(ddl);
            toast.success("SQL copied to clipboard");
          }}
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3.5 py-2 text-[14px] font-medium transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <Copy className="h-[16px] w-[16px] text-muted-foreground" strokeWidth={1.8} />
          Copy SQL
        </button>
      </div>

      <div className="scroll-slim mt-4 flex-1 overflow-auto rounded-xl border border-border bg-secondary/15 py-3">
        {lines.length > 0 ? (
          <pre className="font-mono text-[13.5px] leading-[1.75]">
            {lines.map((line, i) => (
              <div key={i} className="flex px-3">
                <span className="w-7 shrink-0 select-none pr-3 text-right text-code-line">
                  {i + 1}
                </span>
                <code className="whitespace-pre">{highlightSql(line) as never}</code>
              </div>
            ))}
          </pre>
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
            <FileCode2 className="h-7 w-7" strokeWidth={1.6} />
            <p className="text-[14.5px]">Your generated DDL will appear here.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
