import { useState } from "react";
import {
  Plus,
  Search,
  Database,
  Folder,
  Table2,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";

const TABLES = [
  "customers",
  "products",
  "orders",
  "order_items",
  "payments",
  "categories",
  "reviews",
];

const DATABASES = ["ecommerce_db", "hr_db", "school_db"];

export function Sidebar() {
  const [open, setOpen] = useState<string | null>("ecommerce_db");

  return (
    <aside className="panel-surface scroll-slim flex w-[280px] shrink-0 flex-col overflow-y-auto p-4">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} />
        New Connection
      </button>

      <div className="mt-6 flex items-center justify-between px-1">
        <span className="text-[13px] font-medium tracking-wide text-muted-foreground">
          DATABASES
        </span>
        <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
      </div>

      <div className="relative mt-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search databases..."
          className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-[14px] placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      <nav className="mt-4 flex flex-col">
        {DATABASES.map((db) => {
          const isOpen = open === db;
          return (
            <div key={db} className="border-b border-border/60 last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : db)}
                className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-3 text-left text-[15px] font-medium transition-colors hover:bg-secondary/60"
              >
                <Database className="h-[18px] w-[18px] text-accent" strokeWidth={1.8} />
                <span className="flex-1 truncate">{db}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "" : "-rotate-90"}`}
                />
              </button>

              {isOpen ? (
                <div className="pb-2">
                  <div className="flex items-center gap-2 rounded-md px-2 py-2 text-[15px] text-foreground/90">
                    <Folder className="h-[17px] w-[17px] text-code-number" strokeWidth={1.8} />
                    Tables
                  </div>
                  <ul className="pl-3">
                    {TABLES.map((t) => (
                      <li key={t}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2.5 rounded-md px-2 py-[7px] text-left text-[14.5px] text-foreground/85 transition-colors hover:bg-secondary/70 hover:text-foreground"
                        >
                          <Table2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {["Views", "Stored Procedures"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[15px] transition-colors hover:bg-secondary/60"
                    >
                      <Folder className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
                      {item}
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/60" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
