/** Shared types + layout helpers for the AI-generated schema designs. */

export type DesignColumn = { name: string; type: string; key?: "PK" | "FK" | null };
export type DesignTable = { name: string; columns: DesignColumn[] };
export type DesignRelation = { from: string; to: string; label?: string };

export type SchemaDesign = {
  databaseName: string;
  dialect: string;
  tables: DesignTable[];
  relations: DesignRelation[];
  ddl: string;
  indexCount: number;
  normalization: string;
  validation: string[];
  notes: string;
  generatedAt: string;
};

export const ACCENTS = ["accent", "primary", "success", "number", "keyword"] as const;
export type Accent = (typeof ACCENTS)[number];

export const NODE_W = 152;
export const HEAD_H = 30;
export const ROW_H = 20;
export const PAD_B = 8;
export const COL_GAP = 24;
export const ROW_GAP = 40;
export const COLS = 4;

export type PlacedTable = DesignTable & { x: number; y: number; h: number; accent: Accent };

export function nodeHeight(t: DesignTable) {
  return HEAD_H + t.columns.length * ROW_H + PAD_B;
}

/** Simple grid layout: 4 columns, each row as tall as its tallest node. */
export function layoutTables(tables: DesignTable[]): {
  placed: PlacedTable[];
  width: number;
  height: number;
} {
  const placed: PlacedTable[] = [];
  let y = 8;
  let maxRight = 0;

  for (let i = 0; i < tables.length; i += COLS) {
    const row = tables.slice(i, i + COLS);
    const rowH = Math.max(...row.map(nodeHeight));
    row.forEach((t, j) => {
      const x = 16 + j * (NODE_W + COL_GAP);
      placed.push({
        ...t,
        x,
        y,
        h: nodeHeight(t),
        accent: ACCENTS[(i / COLS + j) % ACCENTS.length]!,
      });
      maxRight = Math.max(maxRight, x + NODE_W);
    });
    y += rowH + ROW_GAP;
  }

  return { placed, width: Math.max(maxRight + 16, 600), height: Math.max(y, 260) };
}

/** Orthogonal connector between two placed nodes. */
export function edgePath(a: PlacedTable, b: PlacedTable) {
  const ay = a.y + a.h / 2;
  const by = b.y + b.h / 2;

  if (Math.abs(a.y - b.y) < 8) {
    const [left, right] = a.x <= b.x ? [a, b] : [b, a];
    const x1 = left.x + NODE_W;
    const x2 = right.x;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${left.y + left.h / 2} H ${mx} V ${right.y + right.h / 2} H ${x2}`;
  }

  const [top, bottom] = a.y <= b.y ? [a, b] : [b, a];
  const y1 = top.y + top.h;
  const y2 = bottom.y;
  const my = (y1 + y2) / 2;
  return `M ${top.x + NODE_W * 0.4} ${y1} V ${my} H ${bottom.x + NODE_W * 0.5} V ${y2}` +
    (ay === by ? "" : "");
}
