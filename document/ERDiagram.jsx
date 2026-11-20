import { useMemo, useState } from "react";
import { KeyRound, Link2, Waypoints } from "lucide-react";

const NODE_WIDTH = 208;
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 27;
const H_GAP = 36;
const V_GAP = 44;
const COLUMNS = 3;

function arrangeTables(tables) {
  const placed = [];
  let y = 16;
  let maxRight = 0;
  for (let start = 0; start < tables.length; start += COLUMNS) {
    const row = tables.slice(start, start + COLUMNS);
    const rowHeight = Math.max(...row.map((table) => HEADER_HEIGHT + Math.max(table.columns.length, 1) * ROW_HEIGHT));
    row.forEach((table, column) => {
      const x = 16 + column * (NODE_WIDTH + H_GAP);
      const height = HEADER_HEIGHT + Math.max(table.columns.length, 1) * ROW_HEIGHT;
      placed.push({ ...table, x, y, width: NODE_WIDTH, height });
      maxRight = Math.max(maxRight, x + NODE_WIDTH);
    });
    y += rowHeight + V_GAP;
  }
  return { placed, width: Math.max(maxRight + 16, 680), height: Math.max(y, 300) };
}

function relationPath(from, to) {
  const sourceX = from.x + from.width / 2;
  const targetX = to.x + to.width / 2;
  if (Math.abs(from.y - to.y) < 8) {
    const left = from.x < to.x ? from : to;
    const right = left === from ? to : from;
    const midX = (left.x + left.width + right.x) / 2;
    const centerY = left.y + left.height / 2;
    return `M ${left.x + left.width} ${centerY} H ${midX} V ${centerY} H ${right.x}`;
  }
  const top = from.y < to.y ? from : to;
  const bottom = top === from ? to : from;
  const midY = (top.y + top.height + bottom.y) / 2;
  return `M ${sourceX} ${top.y + top.height} V ${midY} H ${targetX} V ${bottom.y}`;
}

/**
 * Visualizes the table and relationship metadata returned by GET /api/schema.
 * Expected data shape: { tables: [{ name, columns: [{ name, type, key }] }],
 * relations: [{ from, to, label }] }.
 */
export function ErDiagram({ tables = [], relations = [], isLoading = false }) {
  const [zoom, setZoom] = useState(1);
  const { placed, width, height } = useMemo(() => arrangeTables(tables), [tables]);
  const byName = useMemo(() => new Map(placed.map((table) => [table.name, table])), [placed]);

  if (isLoading) {
    return <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground" role="status">Loading schema…</div>;
  }

  if (tables.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <Waypoints className="h-8 w-8" aria-hidden="true" />
        <p className="font-medium">No tables to display</p>
        <p className="text-sm">When the database is available, its tables and relationships appear here.</p>
      </div>
    );
  }

  return (
    <section aria-label="Database entity relationship diagram">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{tables.length} tables · {relations.length} relationships</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setZoom((value) => Math.max(0.55, +(value - 0.1).toFixed(2)))} aria-label="Zoom out" title="Zoom out" className="h-9 w-9 rounded-md border border-border text-lg hover:bg-secondary">−</button>
          <span className="min-w-12 text-center text-xs text-muted-foreground" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.4, +(value + 0.1).toFixed(2)))} aria-label="Zoom in" title="Zoom in" className="h-9 w-9 rounded-md border border-border text-lg hover:bg-secondary">+</button>
          <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom" title="Reset zoom" className="h-9 rounded-md border border-border px-3 text-sm hover:bg-secondary">Reset</button>
        </div>
      </div>
      <div className="scroll-slim overflow-auto rounded-md border border-border bg-secondary/10 p-3">
        <div style={{ width: width * zoom, height: height * zoom }}>
          <div className="relative origin-top-left" style={{ width, height, transform: `scale(${zoom})` }}>
            <svg className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={height} aria-label="Table relationships">
              {relations.map((relation, index) => {
                const from = byName.get(relation.from);
                const to = byName.get(relation.to);
                if (!from || !to) return null;
                return <path key={`${relation.from}-${relation.to}-${index}`} d={relationPath(from, to)} fill="none" stroke="currentColor" className="text-border" strokeWidth="1.6" />;
              })}
            </svg>
            {placed.map((table) => (
              <article key={table.name} className="absolute overflow-hidden rounded-md border border-border bg-card" style={{ left: table.x, top: table.y, width: NODE_WIDTH }}>
                <h3 className="flex h-9 items-center gap-2 border-b border-border bg-secondary/50 px-3 text-sm font-semibold">
                  <Waypoints className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="truncate">{table.name}</span>
                </h3>
                <ul className="p-1.5">
                  {table.columns.map((column) => (
                    <li key={column.name} title={`${column.name} · ${column.type}`} className="flex h-[27px] items-center gap-2 px-1.5 text-xs">
                      {column.key === "PK" ? <KeyRound className="h-3.5 w-3.5 shrink-0 text-accent" aria-label="Primary key" /> : column.key === "FK" ? <Link2 className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Foreign key" /> : <span className="w-3.5 shrink-0" />}
                      <span className="min-w-0 truncate">{column.name}</span>
                      <span className="ml-auto max-w-20 truncate font-mono text-muted-foreground">{column.type}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ErDiagram;