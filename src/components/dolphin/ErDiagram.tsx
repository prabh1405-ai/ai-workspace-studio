import { KeyRound, Link2, ZoomIn, ZoomOut, Maximize2, RefreshCw, LayoutGrid } from "lucide-react";
import { ENTITIES, RELATIONS, type Entity } from "./schema-data";

const NODE_W = 150;
const HEAD_H = 30;
const ROW_H = 20;
const PAD_B = 8;

const ACCENT: Record<Entity["accent"], string> = {
  primary: "border-primary/60",
  accent: "border-accent/50",
  success: "border-success/50",
  number: "border-code-number/50",
  keyword: "border-code-keyword/50",
};

const HEAD_BG: Record<Entity["accent"], string> = {
  primary: "bg-primary/25",
  accent: "bg-accent/15",
  success: "bg-success/15",
  number: "bg-code-number/15",
  keyword: "bg-code-keyword/15",
};

function nodeHeight(e: Entity) {
  return HEAD_H + e.columns.length * ROW_H + PAD_B;
}

function byId(id: string) {
  const e = ENTITIES.find((n) => n.id === id);
  if (!e) throw new Error(`Unknown entity ${id}`);
  return e;
}

function edgePath(fromId: string, toId: string, kind: "h" | "v") {
  const a = byId(fromId);
  const b = byId(toId);

  if (kind === "h") {
    const y1 = a.y + HEAD_H + ROW_H * 0.9;
    const y2 = b.y + HEAD_H + ROW_H * 0.9;
    const x1 = a.x + NODE_W;
    const x2 = b.x;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} H ${mx} V ${y2} H ${x2}`;
  }

  const ay = a.y + nodeHeight(a);
  const by = b.y;
  if (by > ay) {
    const x1 = a.x + NODE_W * 0.35;
    const x2 = b.x + NODE_W * 0.45;
    const my = ay + (by - ay) / 2;
    return `M ${x1} ${ay} V ${my} H ${x2} V ${by}`;
  }
  // target sits above the source
  const x1 = a.x + NODE_W * 0.6;
  const x2 = b.x + NODE_W * 0.5;
  const my = b.y + nodeHeight(b) + (a.y - (b.y + nodeHeight(b))) / 2;
  return `M ${x1} ${a.y} V ${my} H ${x2} V ${b.y + nodeHeight(b)}`;
}

const CANVAS_W = 880;
const CANVAS_H = 570;
const SCALE = 0.8;

export function ErDiagram() {
  return (
    <section className="panel-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[19px] font-semibold">ER Diagram</h2>
        <div className="flex items-center gap-2">
          {[ZoomIn, ZoomOut, Maximize2, RefreshCw, LayoutGrid].map((Icon, i) => (
            <button
              key={i}
              type="button"
              aria-label={["Zoom in", "Zoom out", "Fit view", "Re-layout", "Toggle grid"][i]}
              className="rounded-lg border border-border bg-secondary/40 p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-slim mt-4 overflow-auto rounded-xl border border-border bg-secondary/10 p-3">
        <div style={{ height: CANVAS_H * SCALE, width: CANVAS_W * SCALE }}>
        <div
          className="relative origin-top-left"
          style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${SCALE})` }}
        >
          <svg
            className="pointer-events-none absolute inset-0"
            width={CANVAS_W}
            height={CANVAS_H}
            aria-hidden="true"
          >
            {RELATIONS.map((r, i) => (
              <path
                key={i}
                d={edgePath(r.from, r.to, r.kind)}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={1.5}
              />
            ))}
          </svg>

          {ENTITIES.map((e) => (
            <div
              key={e.id}
              className={`absolute overflow-hidden rounded-lg border bg-card shadow-panel ${ACCENT[e.accent]}`}
              style={{ left: e.x, top: e.y, width: NODE_W }}
            >
              <div
                className={`flex h-[30px] items-center justify-center px-2 text-[12.5px] font-semibold ${HEAD_BG[e.accent]}`}
              >
                <span className="truncate">{e.id}</span>
              </div>
              <ul className="py-1">
                {e.columns.map((c) => (
                  <li
                    key={c.name}
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
      </div>

    </section>
  );
}
