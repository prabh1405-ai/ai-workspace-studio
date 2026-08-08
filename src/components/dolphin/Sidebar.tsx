import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  RefreshCw,
  Search,
  Database,
  Folder,
  Table2,
  ChevronDown,
  Loader2,
  Columns3,
} from "lucide-react";
import { listLiveTables } from "@/lib/dolphin.functions";

export function Sidebar() {
  const fetchTables = useServerFn(listLiveTables);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["live-schema"],
    queryFn: () => fetchTables(),
  });

  const [query, setQuery] = useState("");
  const [dbOpen, setDbOpen] = useState(true);
  const [openTable, setOpenTable] = useState<string | null>(null);

  const tables = useMemo(() => {
    const list = data?.tables ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((t) => t.name.toLowerCase().includes(q)) : list;
  }, [data, query]);

  return (
    <aside className="panel-surface scroll-slim flex w-[280px] shrink-0 flex-col overflow-y-auto p-4">
      <button
        type="button"
        onClick={() => refetch()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <RefreshCw
          className={`h-[18px] w-[18px] ${isFetching ? "animate-spin" : ""}`}
          strokeWidth={2.4}
        />
        Refresh Schema
      </button>

      <div className="mt-6 flex items-center justify-between px-1">
        <span className="text-[13px] font-medium tracking-wide text-muted-foreground">
          CONNECTED DATABASE
        </span>
        <Columns3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
      </div>

      <div className="relative mt-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tables..."
          className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-[14px] placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      <nav className="mt-4 flex flex-col">
        {isLoading ? (
          <div className="flex items-center gap-2 px-1.5 py-3 text-[14.5px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Loading schema...
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setDbOpen((o) => !o)}
              className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-3 text-left text-[15px] font-medium transition-colors hover:bg-secondary/60"
            >
              <Database className="h-[18px] w-[18px] text-accent" strokeWidth={1.8} />
              <span className="flex-1 truncate">{data?.database ?? "—"}</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${dbOpen ? "" : "-rotate-90"}`}
              />
            </button>

            {dbOpen ? (
              <div className="pb-2">
                <div className="flex items-center gap-2 rounded-md px-2 py-2 text-[15px] text-foreground/90">
                  <Folder className="h-[17px] w-[17px] text-code-number" strokeWidth={1.8} />
                  Tables ({tables.length})
                </div>
                <ul className="pl-3">
                  {tables.map((t) => (
                    <li key={t.name}>
                      <button
                        type="button"
                        onClick={() => setOpenTable(openTable === t.name ? null : t.name)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2 py-[7px] text-left text-[14.5px] text-foreground/85 transition-colors hover:bg-secondary/70 hover:text-foreground"
                      >
                        <Table2 className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                        <span className="flex-1 truncate">{t.name}</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-muted-foreground/70 transition-transform ${openTable === t.name ? "" : "-rotate-90"}`}
                        />
                      </button>
                      {openTable === t.name ? (
                        <ul className="mb-1 pl-8">
                          {t.columns.map((c) => (
                            <li key={c} className="py-[3px] text-[13px] text-muted-foreground">
                              {c}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                  {tables.length === 0 ? (
                    <li className="px-2 py-2 text-[14px] text-muted-foreground">No tables found.</li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </nav>
    </aside>
  );
}
