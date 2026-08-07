import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/dolphin/TopNav";
import { Sidebar } from "@/components/dolphin/Sidebar";
import { QueryPromptPanel } from "@/components/dolphin/QueryPromptPanel";
import { GeneratedSqlPanel } from "@/components/dolphin/GeneratedSqlPanel";
import { ResultsPanel } from "@/components/dolphin/ResultsPanel";
import { AiExplanationPanel } from "@/components/dolphin/AiExplanationPanel";

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
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav />
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <Sidebar />
        <main className="scroll-slim flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <QueryPromptPanel />
          <GeneratedSqlPanel />
          <ResultsPanel />
        </main>
        <AiExplanationPanel />
      </div>
    </div>
  );
}
