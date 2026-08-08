import { useState } from "react";
import { Lightbulb, Sparkles, ChevronDown, Database, Loader2 } from "lucide-react";

const DIALECTS = ["MySQL", "PostgreSQL", "SQLite", "SQL Server", "Oracle"] as const;

const SAMPLES = [
  "Create an e-commerce database with customers, sellers, products, categories, inventory, cart, orders, order items, payments, coupons, reviews and shipping addresses.",
  "Design a school management database with students, teachers, classes, subjects, timetable, attendance and exam results.",
  "Build a hospital system with patients, doctors, departments, appointments, prescriptions, medicines and billing.",
  "Model a SaaS billing platform with organisations, users, roles, plans, subscriptions, invoices and usage events.",
];

type Props = {
  prompt: string;
  onPromptChange: (value: string) => void;
  dialect: string;
  onDialectChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
};

export function DescribeDatabasePanel({
  prompt,
  onPromptChange,
  dialect,
  onDialectChange,
  onGenerate,
  isGenerating,
}: Props) {
  const [dialectOpen, setDialectOpen] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);

  return (
    <section className="panel-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Describe your database</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Provide your requirements in natural language.
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSamplesOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[15px] font-medium text-accent transition-colors hover:bg-secondary/60"
          >
            <Lightbulb className="h-[17px] w-[17px]" strokeWidth={1.8} />
            Sample Prompts
          </button>
          {samplesOpen ? (
            <ul className="absolute right-0 z-20 mt-2 w-[380px] overflow-hidden rounded-lg border border-border bg-popover shadow-panel">
              {SAMPLES.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => {
                      onPromptChange(s);
                      setSamplesOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-[14px] leading-snug transition-colors hover:bg-secondary"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onGenerate();
        }}
        rows={3}
        aria-label="Database requirements"
        placeholder="e.g. A library system with members, books, authors, loans and fines..."
        className="mt-4 w-full resize-none rounded-xl border border-border bg-secondary/25 p-4 text-[15.5px] leading-relaxed focus:border-ring focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDialectOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-[15px] font-medium transition-colors hover:bg-secondary"
          >
            <Database className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
            {dialect}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {dialectOpen ? (
            <ul className="absolute z-20 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-popover shadow-panel">
              {DIALECTS.map((d) => (
                <li key={d}>
                  <button
                    type="button"
                    onClick={() => {
                      onDialectChange(d);
                      setDialectOpen(false);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-[14.5px] transition-colors hover:bg-secondary"
                  >
                    {d}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || prompt.trim().length < 10}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isGenerating ? (
            <Loader2 className="h-[17px] w-[17px] animate-spin" strokeWidth={2} />
          ) : (
            <Sparkles className="h-[17px] w-[17px]" strokeWidth={2} />
          )}
          {isGenerating ? "Generating..." : "Generate Schema"}
        </button>
        <button
          type="button"
          onClick={() => onPromptChange("")}
          className="rounded-lg border border-border px-6 py-2.5 text-[15px] font-medium transition-colors hover:bg-secondary"
        >
          Clear
        </button>
      </div>
    </section>
  );
}
