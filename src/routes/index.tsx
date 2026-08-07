import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { TopNav } from "@/components/dolphin/TopNav";
import { Sidebar } from "@/components/dolphin/Sidebar";
import { QueryPromptPanel } from "@/components/dolphin/QueryPromptPanel";
import { GeneratedSqlPanel } from "@/components/dolphin/GeneratedSqlPanel";
import { ResultsPanel, type RunState } from "@/components/dolphin/ResultsPanel";
import {
  AiExplanationPanel,
  type ExplanationStep,
} from "@/components/dolphin/AiExplanationPanel";
import { generateSql, runQuery } from "@/lib/dolphin.functions";

const title = "Dolphin AI Studio — SQL Workspace Hub";
const description =
  "Ask questions in plain English and get instant SQL, live results and a step-by-step AI explanation across all your databases.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const generate = useServerFn(generateSql);
  const run = useServerFn(runQuery);

  const [prompt, setPrompt] = useState(
    "Show top 10 customers who spent the most money in the last 3 months.",
  );
  const [language, setLanguage] = useState("English");
  const [sql, setSql] = useState("");
  const [steps, setSteps] = useState<ExplanationStep[]>([]);
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runState, setRunState] = useState<RunState | null>(null);

  async function executeSql(sqlText: string, sourcePrompt: string) {
    setIsRunning(true);
    try {
      const result = await run({ data: { sql: sqlText, prompt: sourcePrompt } });
      setRunState({
        columns: result.columns,
        rows: result.rows,
        rowCount: result.rowCount,
        durationMs: result.durationMs,
        error: result.ok ? null : (result.error ?? "Query failed"),
        ranAt: new Date().toLocaleTimeString(),
      });
      if (!result.ok) toast.error(result.error ?? "Query failed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not run the query");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setSteps([]);
    setNotes("");
    try {
      const result = await generate({ data: { prompt, language } });
      setSql(result.sql);
      setSteps(result.explanation);
      setNotes(result.notes);
      await executeSql(result.sql, prompt);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate SQL");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav />
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <Sidebar />
        <main className="scroll-slim flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <QueryPromptPanel
            prompt={prompt}
            onPromptChange={setPrompt}
            language={language}
            onLanguageChange={setLanguage}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
          <GeneratedSqlPanel
            sql={sql}
            onSqlChange={setSql}
            onRun={() => executeSql(sql, prompt)}
            isRunning={isRunning}
            isGenerating={isGenerating}
          />
          <ResultsPanel run={runState} isRunning={isRunning} sql={sql} />
        </main>
        <AiExplanationPanel steps={steps} notes={notes} isLoading={isGenerating} />
      </div>
    </div>
  );
}
