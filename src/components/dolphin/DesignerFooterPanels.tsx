import { CheckCircle2, Check, FileCode2, Image, FileText, FileArchive } from "lucide-react";
import { GENERATED_SUMMARY, VALIDATION } from "./schema-data";

export function SchemaValidationPanel() {
  return (
    <section className="panel-surface p-5">
      <h2 className="text-[18px] font-semibold">Schema Validation</h2>
      <div className="mt-4 flex items-center gap-2.5">
        <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={1.8} />
        <span className="text-[18px] font-semibold text-success">Schema looks good!</span>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14.5px]">
        {VALIDATION.map((item) => (
          <li key={item} className="flex items-center gap-2 text-foreground/90">
            <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={2.4} />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GeneratedSummaryPanel() {
  return (
    <section className="panel-surface p-5">
      <h2 className="text-[18px] font-semibold">Generated Summary</h2>
      <dl className="mt-4 space-y-2.5 text-[14.5px]">
        {GENERATED_SUMMARY.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="flex-1 text-muted-foreground before:mr-2 before:content-['•']">
              {label}
            </dt>
            <span className="text-muted-foreground">:</span>
            <dd className="w-[45%] font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const EXPORTS = [
  { label: "Export SQL", icon: FileCode2 },
  { label: "Export ER Diagram", icon: Image },
  { label: "Export Documentation", icon: FileText },
  { label: "Export All (ZIP)", icon: FileArchive },
];

export function ExportOptionsPanel() {
  return (
    <section className="panel-surface p-5">
      <h2 className="text-[18px] font-semibold">Export Options</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {EXPORTS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-[14.5px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
