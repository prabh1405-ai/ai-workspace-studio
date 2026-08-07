import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bookmark,
  RefreshCw,
  FileCode2,
  Play,
  SendHorizonal,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Timer,
  Rows3,
  Activity,
  Eye,
  Loader2,
} from "lucide-react";
import { TopNav } from "@/components/dolphin/TopNav";
import {
  PracticeSidebar,
  ExpectedOutputPanel,
  ProTipPanel,
  type Problem,
} from "@/components/dolphin/PracticePanels";
import {
  AiExplanationPanel,
  type ExplanationStep,
} from "@/components/dolphin/AiExplanationPanel";
import {
  listProblems,
  checkAnswer,
  getExpectedOutput,
  getProgress,
  explainQuery,
} from "@/lib/dolphin.functions";

const title = "Practice Mode — Dolphin AI Studio";
const description =
  "Solve real SQL challenges against a live database, get instant correctness checks and AI explanations of your own query.";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PracticeMode,
});

type Cell = string | number | boolean | null;

const DIFF_STYLES: Record<string, string> = {
  Easy: "bg-success/20 text-success",
  Medium: "bg-code-number/20 text-code-number",
  Hard: "bg-destructive/20 text-destructive",
};

function PracticeMode() {
  const fetchProblems = useServerFn(listProblems);
  const submit = useServerFn(checkAnswer);
  const fetchExpected = useServerFn(getExpectedOutput);
  const fetchProgress = useServerFn(getProgress);
  const explain = useServerFn(explainQuery);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [sql, setSql] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [steps, setSteps] = useState<ExplanationStep[]>([]);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ solved: 0, total: 0 });
  const [expected, setExpected] = useState<{ columns: string[]; rows: Record<string, Cell>[] }>({
    columns: [],
    rows: [],
  });
  const [expectedVisible, setExpectedVisible] = useState(false);
  const [loadingExpected, setLoadingExpected] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    error: string | null;
    rowCount: number;
    durationMs: number;
    columns: string[];
    rows: Record<string, Cell>[];
  } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [rows, prog] = await Promise.all([fetchProblems(), fetchProgress()]);
        setProblems(rows as Problem[]);
        setProgress(prog);
        setActiveId((rows[0] as Problem | undefined)?.id ?? null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load problems");
      }
    })();
  }, [fetchProblems, fetchProgress]);

  const filtered = useMemo(
    () =>
      problems.filter(
        (p) => (!level || p.difficulty === level) && (!topic || p.topic === topic),
      ),
    [problems, level, topic],
  );

  const problem = problems.find((p) => p.id === activeId) ?? filtered[0] ?? problems[0];

  useEffect(() => {
    setSql("");
    setResult(null);
    setSteps([]);
    setShowHint(false);
    setExpectedVisible(false);
    setExpected({ columns: [], rows: [] });
  }, [problem?.id]);

  async function handleRun(alsoSubmit: boolean) {
    if (!problem || sql.trim().length < 3) return;
    setIsRunning(true);
    try {
      const res = await submit({ data: { problemId: problem.id, sql } });
      setResult({
        isCorrect: res.isCorrect,
        error: res.ok ? null : (res.error ?? "Query failed"),
        rowCount: res.rowCount,
        durationMs: res.durationMs,
        columns: res.columns,
        rows: res.rows,
      });
      if (alsoSubmit) {
        setProgress(await fetchProgress());
        toast[res.isCorrect ? "success" : "error"](
          res.isCorrect ? "Correct! Problem solved." : "Not quite — results don't match yet.",
        );
      }
      if (res.ok) {
        setIsExplaining(true);
        try {
          const { explanation } = await explain({ data: { sql } });
          setSteps(explanation);
        } finally {
          setIsExplaining(false);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not check your query");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleViewExpected() {
    if (!problem) return;
    setExpectedVisible(true);
    if (expected.columns.length > 0) return;
    setLoadingExpected(true);
    try {
      const res = await fetchExpected({ data: { problemId: problem.id } });
      setExpected({ columns: res.columns, rows: res.rows });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load expected output");
    } finally {
      setLoadingExpected(false);
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav />
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <PracticeSidebar
          problems={problems}
          activeLevel={level}
          onLevelChange={setLevel}
          activeTopic={topic}
          onTopicChange={setTopic}
          solved={progress.solved}
          total={progress.total}
        />

        <main className="scroll-slim flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <section className="panel-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[15px] text-muted-foreground">
                <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
                Back to Problems
              </div>
              <div className="flex items-center gap-3">
                {problem ? (
                  <>
                    <span
                      className={`rounded-full px-3 py-1 text-[14px] font-semibold ${
                        DIFF_STYLES[problem.difficulty] ?? "bg-secondary text-foreground"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-[16px] font-semibold text-primary">
                      Problem #{problem.number}
                    </span>
                  </>
                ) : null}
                <Bookmark className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
              </div>
            </div>

            <h1 className="mt-5 text-[22px] font-bold tracking-tight">Problem</h1>
            <p className="mt-2 text-[16px] text-foreground/90">
              {problem?.question ?? "Loading problems..."}
            </p>

            <h2 className="mt-5 text-[16px] font-semibold text-primary">Database Schema</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {(problem?.tables ?? []).map((t) => (
                <div key={t} className="rounded-xl border border-border bg-secondary/20 p-3">
                  <span className="text-[15px] font-semibold text-accent">{t}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[17px] font-semibold">Write your SQL query below</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSql(sql.replace(/\s+/g, " ").trim())}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-[14.5px] font-medium transition-colors hover:bg-secondary"
                >
                  <FileCode2 className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
                  Format SQL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSql("");
                    setResult(null);
                    setSteps([]);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-[14.5px] font-medium transition-colors hover:bg-secondary"
                >
                  <RefreshCw className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
                  Reset
                </button>
              </div>
            </div>

            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              spellCheck={false}
              rows={8}
              aria-label="SQL answer"
              placeholder="SELECT ..."
              className="scroll-slim mt-3 w-full resize-y rounded-xl border border-border bg-secondary/20 p-4 font-mono text-[15px] leading-[2] focus:border-ring focus:outline-none"
            />

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleRun(false)}
                disabled={isRunning || sql.trim().length < 3}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {isRunning ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2} />
                ) : (
                  <Play className="h-[18px] w-[18px]" strokeWidth={2} />
                )}
                Run &amp; Check
              </button>
              <div className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleRun(true)}
                  disabled={isRunning || sql.trim().length < 3}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-5 py-3 text-[15px] font-medium transition-colors hover:bg-secondary disabled:opacity-60"
                >
                  <SendHorizonal className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-5 py-3 text-[15px] font-medium transition-colors hover:bg-secondary"
                >
                  <Lightbulb className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
                  Hint
                </button>
              </div>
            </div>

            {showHint && problem ? (
              <p className="mt-4 rounded-xl border border-border bg-secondary/25 p-3 text-[14.5px] text-foreground/85">
                {problem.hint}
              </p>
            ) : null}
          </section>

          <section className="panel-surface p-6">
            <h2 className="text-[22px] font-bold tracking-tight">Test Result</h2>
            {!result ? (
              <p className="mt-4 text-[15px] text-muted-foreground">
                Run your query to check it against the live database.
              </p>
            ) : (
              <>
                <div className="mt-5 flex items-center gap-4">
                  {result.error ? (
                    <XCircle className="h-14 w-14 text-destructive" strokeWidth={1.6} />
                  ) : result.isCorrect ? (
                    <CheckCircle2 className="h-14 w-14 text-success" strokeWidth={1.6} />
                  ) : (
                    <XCircle className="h-14 w-14 text-code-number" strokeWidth={1.6} />
                  )}
                  <div>
                    <p
                      className={`text-[24px] font-bold ${
                        result.error
                          ? "text-destructive"
                          : result.isCorrect
                            ? "text-success"
                            : "text-code-number"
                      }`}
                    >
                      {result.error
                        ? "Error"
                        : result.isCorrect
                          ? "Correct! 🎉"
                          : "Not matching yet"}
                    </p>
                    <p className="mt-1 text-[15px] text-foreground/85">
                      {result.error
                        ? result.error
                        : result.isCorrect
                          ? "Your query is 100% correct."
                          : "Your query ran, but the rows differ from the expected output."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-8 border-t border-border pt-5">
                  <Stat
                    icon={<Timer className="h-[18px] w-[18px]" strokeWidth={1.8} />}
                    label="Execution Time"
                    value={`${(result.durationMs / 1000).toFixed(3)} sec`}
                  />
                  <Stat
                    icon={<Rows3 className="h-[18px] w-[18px]" strokeWidth={1.8} />}
                    label="Rows Returned"
                    value={`${result.rowCount} rows`}
                  />
                  <Stat
                    icon={<Activity className="h-[18px] w-[18px]" strokeWidth={1.8} />}
                    label="Query Status"
                    value={result.error ? "Failed" : "Success"}
                    valueClass={result.error ? "text-destructive" : "text-success"}
                  />
                  <button
                    type="button"
                    onClick={handleViewExpected}
                    className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-5 py-3 text-[15px] font-medium transition-colors hover:bg-secondary"
                  >
                    <Eye className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
                    View Expected Output
                  </button>
                </div>
              </>
            )}
          </section>
        </main>

        <div className="scroll-slim flex w-[420px] shrink-0 flex-col gap-4 overflow-y-auto">
          <ExpectedOutputPanel
            columns={expected.columns}
            rows={expected.rows}
            isLoading={loadingExpected}
            revealed={expectedVisible}
          />
          <AiExplanationPanel steps={steps} notes="" isLoading={isExplaining} />
          {problem ? (
            <ProTipPanel
              tip={problem.pro_tip}
              onShowExample={() => setShowHint(true)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  valueClass = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[14.5px] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={`mt-1 text-[17px] font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
