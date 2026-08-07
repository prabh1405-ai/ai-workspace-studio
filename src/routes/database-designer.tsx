import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/dolphin/TopNav";
import { DesignerSidebar } from "@/components/dolphin/DesignerSidebar";
import { DescribeDatabasePanel } from "@/components/dolphin/DescribeDatabasePanel";
import { ErDiagram } from "@/components/dolphin/ErDiagram";
import { SqlPreviewPanel } from "@/components/dolphin/SqlPreviewPanel";
import {
  SchemaValidationPanel,
  GeneratedSummaryPanel,
  ExportOptionsPanel,
} from "@/components/dolphin/DesignerFooterPanels";

const title = "Database Designer — Dolphin AI Studio";
const description =
  "Describe your database in plain English and get a normalized schema, live ER diagram, validated SQL DDL and one-click exports.";

export const Route = createFileRoute("/database-designer")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: DatabaseDesigner,
});

function DatabaseDesigner() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav />
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <DesignerSidebar />
        <main className="scroll-slim flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <DescribeDatabasePanel />
              <ErDiagram />
            </div>
            <SqlPreviewPanel />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <SchemaValidationPanel />
            <GeneratedSummaryPanel />
            <ExportOptionsPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
