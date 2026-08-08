import { useState } from "react";
import {
  Plus, Database, Table2, GitBranch, ChevronDown, ChevronRight,
  ListOrdered, Layers, Clock, Link2, KeyRound,
} from "lucide-react";
import type { SchemaDesign } from "./schema-data";

type Props = {
  design: SchemaDesign | null;
  onNewDesign: () => void;
};

export function DesignerSidebar({ design, onNewDesign }: Props) {
  const [tablesOpen, setTablesOpen] = useState(true);
  const [openTable, setOpenTable] = useState<string | null>(null);

  const summary: [string, string][] = design
    ? [
        ["Total Tables", String(design.tables.length)],
        ["Relationships", String(design.relations.length)],
        ["Indexes", String(design.indexCount)],
      ]
    : [];

  const SUMMARY_ICONS = [Layers, Link2, ListOrdered];

  return (
    <aside className="panel-surface scroll-slim flex w-[280px] shrink-0 flex-col overflow-y-auto p-4">
      <button
        type="button"
        onClick={onNewDesign}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} />
        New Design
      </button>

      <span className="mt-6 px-1 text-[13px] font-medium tracking-wide text-muted-foreground">
        SCHEMA EXPLORER
      </span>

      {design ? (
        <>
          <div className="mt-3 flex items-center gap-2.5 rounded-md px-1.5 py-2 text-[15px] font-medium">
            <Database className="h-[18px] w-[18px] shrink-0 text-accent" strokeWidth={1.8} />
            <span className="flex-1 truncate">{design.databaseName} (AI Generated)</span>
          </div>

          <button
            type="button"
            onClick={() => setTablesOpen((o) => !o)}
            className="mt-1 flex items-center gap-2.5 rounded-md px-1.5 py-2 text-left text-[15px] transition-colors hover:bg-secondary/60"
          >
            <Table2 className="h-[17px] w-[17px] text-code-number" strokeWidth={1.8} />
            <span className="flex-1">Tables ({design.tables.length})</span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${tablesOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {tablesOpen ? (
            <ul className="pl-4">
              {design.tables.map((t) => (
                <li key={t.name}>
                  <button
                    type="button"
                    onClick={() => setOpenTable(openTable === t.name ? null : t.name)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-[6px] text-left text-[14.5px] text-foreground/85 transition-colors hover:bg-secondary/70 hover:text-foreground"
                  >
                    <Table2 className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                    <span className="flex-1 truncate">{t.name}</span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-muted-foreground/70 transition-transform ${openTable === t.name ? "rotate-90" : ""}`}
                    />
                  </button>
                  {openTable === t.name ? (
                    <ul className="mb-1 pl-6">
                      {t.columns.map((c) => (
                        <li
                          key={c.name}
                          className="flex items-center gap-1.5 py-[3px] text-[13px] text-muted-foreground"
                        >
                          {c.key === "PK" ? (
                            <KeyRound className="h-3 w-3 shrink-0 text-code-number" strokeWidth={2.2} />
                          ) : c.key === "FK" ? (
                            <Link2 className="h-3 w-3 shrink-0 text-accent" strokeWidth={2.2} />
                          ) : (
                            <span className="w-3 shrink-0" />
                          )}
                          <span className="truncate">{c.name}</span>
                          <span className="truncate text-muted-foreground/70">{c.type}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-2 flex flex-col">
            <div className="flex items-center gap-2.5 rounded-md px-1.5 py-2 text-[15px]">
              <GitBranch className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
              <span className="flex-1 truncate">Relationships ({design.relations.length})</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-md px-1.5 py-2 text-[15px]">
              <ListOrdered className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
              <span className="flex-1 truncate">Indexes ({design.indexCount})</span>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-3 px-1.5 text-[14.5px] leading-relaxed text-muted-foreground">
          No design yet. Describe your requirements and generate a schema — tables, keys and
          relationships will show up here.
        </p>
      )}

      {design ? (
        <div className="mt-6 rounded-xl border border-border bg-secondary/20 p-4">
          <h3 className="text-[15px] font-semibold">Design Summary</h3>
          <dl className="mt-3 space-y-2.5 text-[14px]">
            {summary.map(([label, value], i) => {
              const Icon = SUMMARY_ICONS[i] ?? Layers;
              return (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                  <dt className="text-muted-foreground">{label} :</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              );
            })}
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
              <div>
                <dt className="text-muted-foreground">Generated at :</dt>
                <dd className="font-medium">
                  {new Date(design.generatedAt).toLocaleString()}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      ) : null}
    </aside>
  );
}
