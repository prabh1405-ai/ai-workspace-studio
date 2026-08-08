import { KeyRound, Link2, ZoomIn, ZoomOut, Maximize2, RefreshCw, LayoutGrid, Waypoints } from "lucide-react";
import { useMemo, useState } from "react";
import {
  layoutTables,
  edgePath,
  NODE_W,
  type Accent,
  type SchemaDesign,
} from "./schema-data";

const ACCENT: Record<Accent, string> = {
  primary: "border-primary/60",
  accent: "border-accent/50",
  success: "border-success/50",
  number: "border-code-number/50",
  keyword: "border-code-keyword/50",
};

const HEAD_BG: Record<Accent, string> = {
  primary: "bg-primary/25",
  accent: "bg-accent/15",
  success: "bg-success/15",
  number: "bg-code-number/15",
  keyword: "bg-code-keyword/15",
};

export function ErDiagram({ design }: { design: SchemaDesign | null }) {
  const [scale, setScale] = useState(0.8);
  const [grid, setGrid] = useState(true);

  const { placed, width, height } = useMemo(
    () => layoutTables(design?.tables ?? []),
    [design],
  );

  const byName = useMemo(
    () => new Map(placed.map((p) => [p.name, p])),
    [placed],
  );

  return (
    <section className="panel-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[19px] font-semibold">
          ER Diagram
          {design ? (
            <span className="ml-2 text-[14px] font-normal text-muted-foreground">
              {design.databaseName} · {design.tables.length} tables
            </span>
          ) : null}
        </h2>
        <div className="flex items-center gap-2">
          {[
            { Icon: ZoomIn, label: "Zoom in", onClick: () => setScale((s) => Math.min(1.4, +(s + 0.1).toFixed(2))) },
            { Icon: ZoomOut, label: "Zoom out", onClick: () => setScale((s) => Math.max(0.4, +(s - 0.1).toFixed(2))) },
            { Icon: Maximize2, label: "Fit view", onClick: () => setScale(0.8) },
            { Icon: RefreshCw, label: "Re-layout", onClick: () => setScale((s) => s) },
            { Icon: LayoutGrid, label: "Toggle grid", onClick: () => setGrid((g) => !g) },
          ].map(({ Icon, label, onClick }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={onClick}
              className="rounded-lg border border-border bg-secondary/40 p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </button>
          ))}
        </div>
      </div>

      <div
        className={`scroll-slim mt-4 overflow-auto rounded-xl border border-border p-3 ${grid ? "bg-secondary/10" : "bg-transparent"}`}
      >
        {design ? (
          <div style={{ height: height * scale, width: width * scale }}>
            <div
              className="relative origin-top-left"
              style={{ width, height, transform: `scale(${scale})` }}
            >
              <svg
                className="pointer-events-none absolute inset-0"
                width={width}
                height={height}
                aria-hidden="true"
              >
                {design.relations.map((r, i) => {
                  const a = byName.get(r.from);
                  const b = byName.get(r.to);
                  if (!a || !b) return null;
                  return (
                    <path
                      key={i}
                      d={edgePath(a, b)}
                      fill="none"
                      stroke="var(--color-border)"
                      strokeWidth={1.5}
                    />
                  );
                })}
              </svg>

              {placed.map((t) => (
                <div
                  key={t.name}
                  className={`absolute overflow-hidden rounded-lg border bg-card shadow-panel ${ACCENT[t.accent]}`}
                  style={{ left: t.x, top: t.y, width: NODE_W }}
                >
                  <div
                    className={`flex h-[30px] items-center justify-center px-2 text-[12.5px] font-semibold ${HEAD_BG[t.accent]}`}
                  >
                    <span className="truncate">{t.name}</span>
                  </div>
                  <ul className="py-1">
                    {t.columns.map((c) => (
                      <li
                        key={c.name}
                        title={`${c.name} ${c.type}`}
                        className="flex h-[20px] items-center gap-1.5 px-2 text-[11.5px] text-foreground/85"
                      >
                        {c.key === "PK" ? (
                          <KeyRound className="h-3 w-3 shrink-0 text-code-number" strokeWidth={2.2} />
                        ) : c.key === "FK" ? (
                          <Link2 className="h-3 w-3 shrink-0 text-accent" strokeWidth={2.2} />
                        ) : (
                          <span className="w-3 shrink-0" />
                        )}
                        <span className="truncate">{c.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Waypoints className="h-7 w-7" strokeWidth={1.6} />
            <p className="text-[15px]">No schema yet — describe your database above and generate.</p>
          </div>
        )}
      </div>
    </section>
  );
}
