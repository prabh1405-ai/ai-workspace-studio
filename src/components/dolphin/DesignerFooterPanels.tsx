import { CheckCircle2, Check, FileCode2, Image, FileText, FileArchive, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";
import type { SchemaDesign } from "./schema-data";

export function SchemaValidationPanel({ design }: { design: SchemaDesign | null }) {
  if (!design) {
    return (
      <section className="panel-surface p-5">
        <h2 className="text-[18px] font-semibold">Schema Validation</h2>
        <div className="mt-4 flex items-center gap-2.5 text-muted-foreground">
          <ShieldQuestion className="h-6 w-6" strokeWidth={1.8} />
          <span className="text-[15px]">Generate a schema to run validation.</span>
        </div>
      </section>
    );
  }

  const checks =
    design.validation.length > 0
      ? design.validation
      : [
          `${design.tables.length} Tables`,
          `${design.relations.length} Relationships`,
          `${design.indexCount} Indexes`,
          "No issues found",
        ];

  return (
    <section className="panel-surface p-5">
      <h2 className="text-[18px] font-semibold">Schema Validation</h2>
      <div className="mt-4 flex items-center gap-2.5">
        <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={1.8} />
        <span className="text-[18px] font-semibold text-success">Schema looks good!</span>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14.5px]">
        {checks.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-1 h-4 w-4 shrink-0 text-success" strokeWidth={2.4} />
            {item}
          </li>
        ))}
      </ul>
      {design.notes ? (
        <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">{design.notes}</p>
      ) : null}
    </section>
  );
}

export function GeneratedSummaryPanel({ design }: { design: SchemaDesign | null }) {
  const rows: [string, string][] = design
    ? [
        ["Database Name", design.databaseName],
        ["Dialect", design.dialect],
        ["Total Tables", String(design.tables.length)],
        ["Total Relationships", String(design.relations.length)],
        ["Total Indexes", String(design.indexCount)],
        ["Normalization", design.normalization],
      ]
    : [];

  return (
    <section className="panel-surface p-5">
      <h2 className="text-[18px] font-semibold">Generated Summary</h2>
      {rows.length > 0 ? (
        <dl className="mt-4 space-y-2.5 text-[14.5px]">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="flex-1 text-muted-foreground before:mr-2 before:content-['•']">
                {label}
              </dt>
              <span className="text-muted-foreground">:</span>
              <dd className="w-[45%] font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-[15px] text-muted-foreground">
          Nothing generated yet — your schema stats will show up here.
        </p>
      )}
    </section>
  );
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportOptionsPanel({ design }: { design: SchemaDesign | null }) {
  const disabled = !design;

  function documentation(d: SchemaDesign) {
    const tables = d.tables
      .map(
        (t) =>
          `## ${t.name}\n\n| Column | Type | Key |\n| --- | --- | --- |\n` +
          t.columns.map((c) => `| ${c.name} | ${c.type} | ${c.key ?? ""} |`).join("\n"),
      )
      .join("\n\n");
    const rels = d.relations.map((r) => `- ${r.from} → ${r.to} ${r.label}`).join("\n");
    return `# ${d.databaseName}\n\nDialect: ${d.dialect}\nTables: ${d.tables.length}\nRelationships: ${d.relations.length}\nIndexes: ${d.indexCount}\nNormalization: ${d.normalization}\n\n${tables}\n\n# Relationships\n\n${rels}\n`;
  }

  const actions = [
    {
      label: "Export SQL",
      icon: FileCode2,
      run: (d: SchemaDesign) => download(`${d.databaseName}.sql`, d.ddl, "text/sql"),
    },
    {
      label: "Export ER Diagram",
      icon: Image,
      run: (d: SchemaDesign) =>
        download(`${d.databaseName}-er.json`, JSON.stringify({ tables: d.tables, relations: d.relations }, null, 2), "application/json"),
    },
    {
      label: "Export Documentation",
      icon: FileText,
      run: (d: SchemaDesign) => download(`${d.databaseName}.md`, documentation(d), "text/markdown"),
    },
    {
      label: "Export All (JSON)",
      icon: FileArchive,
      run: (d: SchemaDesign) => download(`${d.databaseName}-design.json`, JSON.stringify(d, null, 2), "application/json"),
    },
  ];

  return (
    <section className="panel-surface p-5">
      <h2 className="text-[18px] font-semibold">Export Options</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map(({ label, icon: Icon, run }) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!design) return;
              run(design);
              toast.success(`${label} downloaded`);
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-[14.5px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
