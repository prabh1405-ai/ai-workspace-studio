import { Globe2, CheckCircle2, Flame, Sparkles, BarChart3, Table2 } from "lucide-react";

export type Problem = {
  id: string;
  number: number;
  difficulty: string;
  topic: string;
  question: string;
  tables: string[];
  hint: string;
  pro_tip: string;
};

const LEVELS = [
  { name: "Easy", icon: Globe2, blurb: "Basic SQL queries", className: "text-success" },
  { name: "Medium", icon: Sparkles, blurb: "Intermediate SQL queries", className: "text-primary" },
  { name: "Hard", icon: Flame, blurb: "Advanced SQL queries", className: "text-destructive" },
];

const TOPICS = [
  "SELECT",
  "WHERE",
  "JOIN",
  "GROUP BY",
  "AGGREGATE",
  "SUBQUERY",
  "ORDER BY",
  "HAVING",
];

type SidebarProps = {
  problems: Problem[];
  activeLevel: string | null;
  onLevelChange: (level: string | null) => void;
  activeTopic: string | null;
  onTopicChange: (topic: string | null) => void;
  solved: number;
  total: number;
};

export function PracticeSidebar({
  problems,
  activeLevel,
  onLevelChange,
  activeTopic,
  onTopicChange,
  solved,
  total,
}: SidebarProps) {
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <aside className="flex w-[280px] shrink-0 flex-col gap-4 overflow-y-auto scroll-slim">
      <div className="panel-surface p-4">
        <span className="text-[13px] font-medium tracking-wide text-muted-foreground">
          PROBLEM SETS
        </span>

        <button
          type="button"
          onClick={() => onLevelChange(null)}
          className="mt-3 flex h-11 w-full items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 text-[14.5px] font-medium transition-colors hover:bg-secondary"
        >
          {activeLevel ?? "All Levels"}
          <span className="text-muted-foreground">▾</span>
        </button>

        <div className="mt-4 flex flex-col gap-1.5">
          {LEVELS.map(({ name, icon: Icon, blurb, className }) => {
            const count = problems.filter((p) => p.difficulty === name).length;
            const isActive = activeLevel === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onLevelChange(isActive ? null : name)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isActive ? "bg-primary/25 ring-1 ring-primary/50" : "hover:bg-secondary/60"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${className}`} strokeWidth={1.8} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-[15px] font-semibold ${className}`}>
                    {name} ({count})
                  </span>
                  <span className="block text-[13.5px] text-muted-foreground">{blurb}</span>
                </span>
              </button>
            );
          })}
        </div>

        <span className="mt-6 block text-[13px] font-medium tracking-wide text-muted-foreground">
          TOPICS
        </span>
        <ul className="mt-2 flex flex-col">
          {TOPICS.map((t) => (
            <li key={t}>
              <button
                type="button"
                onClick={() => onTopicChange(activeTopic === t ? null : t)}
                className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-[14.5px] transition-colors ${
                  activeTopic === t
                    ? "bg-secondary text-foreground"
                    : "text-foreground/85 hover:bg-secondary/60"
                }`}
              >
                <Table2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                {t}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-surface p-5">
        <h2 className="text-[17px] font-semibold">Practice Progress</h2>
        <div className="mt-4 grid place-items-center">
          <div
            className="grid h-[150px] w-[150px] place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--primary) ${percent * 3.6}deg, var(--secondary) 0deg)`,
            }}
          >
            <div className="grid h-[118px] w-[118px] place-items-center rounded-full bg-panel">
              <span className="text-[30px] font-bold text-primary">{percent}%</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[14.5px] text-muted-foreground">
          {solved} / {total} Problems Solved
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 py-2.5 text-[14.5px] font-medium">
          <BarChart3 className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
          View Progress
        </div>
      </div>
    </aside>
  );
}

type ExpectedProps = {
  columns: string[];
  rows: Record<string, string | number | boolean | null>[];
  isLoading: boolean;
  revealed: boolean;
};

export function ExpectedOutputPanel({ columns, rows, isLoading, revealed }: ExpectedProps) {
  return (
    <section className="panel-surface p-5">
      <h2 className="text-[17px] font-semibold">Expected Output (Sample)</h2>
      <div className="scroll-slim mt-4 overflow-x-auto rounded-xl border border-border">
        {!revealed ? (
          <p className="px-3 py-5 text-[14px] text-muted-foreground">
            Hidden — use “View Expected Output” to compare.
          </p>
        ) : isLoading ? (
          <p className="px-3 py-5 text-[14px] text-muted-foreground">Loading sample...</p>
        ) : columns.length === 0 ? (
          <p className="px-3 py-5 text-[14px] text-muted-foreground">No sample rows.</p>
        ) : (
          <table className="w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground">
                {columns.map((c, i) => (
                  <th
                    key={c}
                    className={`border-b border-border px-3 py-2.5 font-normal ${
                      i < columns.length - 1 ? "border-r" : ""
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 6).map((row, r) => (
                <tr key={r}>
                  {columns.map((c, i) => (
                    <td
                      key={c}
                      className={`border-b border-border px-3 py-2.5 font-mono ${
                        i < columns.length - 1 ? "border-r" : ""
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
    </section>
  );
}

export function ProTipPanel({ tip, onShowExample }: { tip: string; onShowExample: () => void }) {
  return (
    <section className="panel-surface p-5">
      <h2 className="flex items-center gap-2 text-[17px] font-semibold text-accent">
        <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
        Pro Tip
      </h2>
      <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/85">{tip}</p>
      <button
        type="button"
        onClick={onShowExample}
        className="mt-4 w-full rounded-lg bg-primary py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Show Example
      </button>
    </section>
  );
}
