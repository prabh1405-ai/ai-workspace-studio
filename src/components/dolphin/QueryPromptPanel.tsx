import { useState } from "react";
import { Sparkles, Globe, ChevronDown, Mic, MessageSquareCode, SendHorizonal, Loader2 } from "lucide-react";

const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German"] as const;

const EXAMPLES = [
  "Show top 10 customers who spent the most money in the last 3 months.",
  "Which product categories bring in the highest revenue?",
  "List orders that are still pending with the customer name.",
  "Average review rating per product, best first.",
];

type Props = {
  prompt: string;
  onPromptChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
};

export function QueryPromptPanel({
  prompt,
  onPromptChange,
  language,
  onLanguageChange,
  onGenerate,
  isGenerating,
}: Props) {
  const [langOpen, setLangOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);

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
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onGenerate();
          }}
          rows={5}
          aria-label="Natural language query"
          className="w-full resize-none rounded-xl border border-ring/60 bg-secondary/25 p-5 text-[18px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Ask anything about your data..."
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-[15px] font-medium transition-colors hover:bg-secondary"
          >
            <Globe className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
            {language}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {langOpen ? (
            <ul className="absolute z-20 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-popover shadow-panel">
              {LANGUAGES.map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    onClick={() => {
                      onLanguageChange(l);
                      setLangOpen(false);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-[14.5px] transition-colors hover:bg-secondary"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Voice input"
          className="rounded-lg border border-border bg-secondary/40 p-3 transition-colors hover:bg-secondary"
        >
          <Mic className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
        </button>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExamplesOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-[15px] font-medium transition-colors hover:bg-secondary"
            >
              <MessageSquareCode className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
              Example Prompts
            </button>
            {examplesOpen ? (
              <ul className="absolute right-0 z-20 mt-2 w-[380px] overflow-hidden rounded-lg border border-border bg-popover shadow-panel">
                {EXAMPLES.map((ex) => (
                  <li key={ex}>
                    <button
                      type="button"
                      onClick={() => {
                        onPromptChange(ex);
                        setExamplesOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-left text-[14.5px] leading-snug transition-colors hover:bg-secondary"
                    >
                      {ex}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || prompt.trim().length < 3}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isGenerating ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2} />
            ) : (
              <SendHorizonal className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
            {isGenerating ? "Generating..." : "Generate SQL"}
          </button>
        </div>
      </div>
    </section>
  );
}
