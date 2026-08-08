import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
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
import type { SchemaDesign } from "@/components/dolphin/schema-data";
import { designSchema } from "@/lib/dolphin.functions";

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
  const design = useServerFn(designSchema);

  const [prompt, setPrompt] = useState("");
  const [dialect, setDialect] = useState("MySQL");
  const [schema, setSchema] = useState<SchemaDesign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const result = await design({ data: { prompt, dialect } });
      setSchema(result as SchemaDesign);
      toast.success(`Generated ${result.tables.length} tables for ${result.databaseName}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the schema");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav />
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <DesignerSidebar
          design={schema}
          onNewDesign={() => {
            setSchema(null);
            setPrompt("");
          }}
        />
        <main className="scroll-slim flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <DescribeDatabasePanel
                prompt={prompt}
                onPromptChange={setPrompt}
                dialect={dialect}
                onDialectChange={setDialect}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
              <ErDiagram design={schema} />
            </div>
            <SqlPreviewPanel ddl={schema?.ddl ?? ""} />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <SchemaValidationPanel design={schema} />
            <GeneratedSummaryPanel design={schema} />
            <ExportOptionsPanel design={schema} />
          </div>
        </main>
      </div>
    </div>
  );
}
