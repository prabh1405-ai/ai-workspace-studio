import { useState } from "react";
import {
  Plus, Database, Table2, Folder, GitBranch, ChevronDown, ChevronRight,
  ListOrdered, Zap, FileCode2, Layers, Clock, Link2,
} from "lucide-react";
import { DESIGN_SUMMARY } from "./schema-data";

const TABLES = [
  "customers", "sellers", "products", "categories", "inventory", "cart",
  "orders", "order_items", "payments", "coupons", "reviews", "shipping_addresses",
];

const GROUPS = [
  { label: "Views (3)", icon: Folder },
  { label: "Relationships (16)", icon: GitBranch },
  { label: "Indexes (18)", icon: ListOrdered },
  { label: "Triggers (2)", icon: Zap },
  { label: "Stored Procedures (1)", icon: FileCode2 },
];

const SUMMARY_ICONS = [Layers, Link2, ListOrdered];

export function DesignerSidebar() {
  const [tablesOpen, setTablesOpen] = useState(true);

  return (
    <aside className="panel-surface scroll-slim flex w-[280px] shrink-0 flex-col overflow-y-auto p-4">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} />
        New Design
      </button>

      <span className="mt-6 px-1 text-[13px] font-medium tracking-wide text-muted-foreground">
        SCHEMA EXPLORER
      </span>

      <button
        type="button"
        className="mt-3 flex items-center gap-2.5 rounded-md px-1.5 py-2 text-left text-[15px] font-medium transition-colors hover:bg-secondary/60"
      >
        <Database className="h-[18px] w-[18px] shrink-0 text-accent" strokeWidth={1.8} />
        <span className="flex-1 truncate">ecommerce_db (AI Generated)</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        type="button"
        onClick={() => setTablesOpen((o) => !o)}
        className="mt-1 flex items-center gap-2.5 rounded-md px-1.5 py-2 text-left text-[15px] transition-colors hover:bg-secondary/60"
      >
        <Table2 className="h-[17px] w-[17px] text-code-number" strokeWidth={1.8} />
        <span className="flex-1">Tables (12)</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${tablesOpen ? "" : "-rotate-90"}`}
        />
      </button>

      {tablesOpen ? (
        <ul className="pl-4">
          {TABLES.map((t) => (
            <li key={t}>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-[6px] text-left text-[14.5px] text-foreground/85 transition-colors hover:bg-secondary/70 hover:text-foreground"
              >
                <Table2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                {t}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-2 flex flex-col">
        {GROUPS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex items-center gap-2.5 rounded-md px-1.5 py-2 text-left text-[15px] transition-colors hover:bg-secondary/60"
          >
            <Icon className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
            <span className="flex-1 truncate">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-secondary/20 p-4">
        <h3 className="text-[15px] font-semibold">Design Summary</h3>
        <dl className="mt-3 space-y-2.5 text-[14px]">
          {DESIGN_SUMMARY.map(([label, value], i) => {
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
              <dd className="font-medium">07 May 2025, 10:24 AM</dd>
            </div>
          </div>
        </dl>
      </div>
    </aside>
  );
}
