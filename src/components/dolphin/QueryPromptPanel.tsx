import { useState } from "react";
import { Sparkles, Globe, ChevronDown, Mic, MessageSquareCode, SendHorizonal } from "lucide-react";

export function QueryPromptPanel() {
  const [prompt, setPrompt] = useState(
    "Show top 10 customers who spent the most money in the last 3 months.",
  );

  return (
    <section className="panel-surface p-6">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 h-6 w-6 text-accent" strokeWidth={1.8} />
        <div>
          <h1 className="text-[25px] font-bold leading-tight tracking-tight">Query Workspace</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Ask in natural language. Get SQL instantly.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl shadow-glow">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          aria-label="Natural language query"
          className="w-full resize-none rounded-xl border border-ring/60 bg-secondary/25 p-5 text-[18px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Ask anything about your data..."
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-[15px] font-medium transition-colors hover:bg-secondary"
        >
          <Globe className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
          English
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          aria-label="Voice input"
          className="rounded-lg border border-border bg-secondary/40 p-3 transition-colors hover:bg-secondary"
        >
          <Mic className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
        </button>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-[15px] font-medium transition-colors hover:bg-secondary"
          >
            <MessageSquareCode className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
            Example Prompts
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <SendHorizonal className="h-[18px] w-[18px]" strokeWidth={2} />
            Generate SQL
          </button>
        </div>
      </div>
    </section>
  );
}
