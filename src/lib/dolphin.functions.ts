import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const promptSchema = z.object({
  prompt: z.string().min(3).max(2000),
  language: z.string().min(2).max(40).default("English"),
});

const sqlSchema = z.object({
  sql: z.string().min(3).max(5000),
  prompt: z.string().max(2000).default(""),
});

const attemptSchema = z.object({
  problemId: z.string().uuid(),
  sql: z.string().min(3).max(5000),
});

export const generateSql = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => promptSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateSqlFromPrompt } = await import("./dolphin.server");
    return generateSqlFromPrompt(data.prompt, data.language);
  });

export const runQuery = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => sqlSchema.parse(input))
  .handler(async ({ data }) => {
    const { runReadOnlySql } = await import("./dolphin.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      const result = await runReadOnlySql(data.sql);
      await supabaseAdmin.from("query_history").insert({
        prompt: data.prompt || "(manual SQL)",
        sql: data.sql,
        row_count: result.rowCount,
        duration_ms: result.durationMs,
        status: "success",
      });
      return { ok: true as const, ...result };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Query failed";
      await supabaseAdmin.from("query_history").insert({
        prompt: data.prompt || "(manual SQL)",
        sql: data.sql,
        status: "error",
        error: message,
      });
      return {
        ok: false as const,
        error: message,
        columns: [] as string[],
        rows: [] as Record<string, string | number | boolean | null>[],
        rowCount: 0,
        durationMs: 0,
      };
    }
  });

export const explainQuery = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ sql: z.string().min(3).max(5000) }).parse(input))
  .handler(async ({ data }) => {
    const { explainSql } = await import("./dolphin.server");
    return { explanation: await explainSql(data.sql) };
  });

export const listHistory = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase
    .from("query_history")
    .select("id, prompt, sql, row_count, duration_ms, status, error, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listProblems = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase
    .from("practice_problems")
    .select("id, number, difficulty, topic, question, tables, hint, pro_tip")
    .order("number", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getExpectedOutput = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ problemId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { runReadOnlySql } = await import("./dolphin.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: problem, error } = await supabaseAdmin
      .from("practice_problems")
      .select("solution_sql")
      .eq("id", data.problemId)
      .single();
    if (error || !problem) throw new Error("Problem not found");
    return runReadOnlySql(problem.solution_sql);
  });

export const checkAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => attemptSchema.parse(input))
  .handler(async ({ data }) => {
    const { runReadOnlySql, normalizeRows } = await import("./dolphin.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: problem, error } = await supabaseAdmin
      .from("practice_problems")
      .select("solution_sql")
      .eq("id", data.problemId)
      .single();
    if (error || !problem) throw new Error("Problem not found");

    try {
      const attempt = await runReadOnlySql(data.sql);
      const expected = await runReadOnlySql(problem.solution_sql);
      const isCorrect = normalizeRows(attempt.rows) === normalizeRows(expected.rows);

      await supabaseAdmin.from("practice_attempts").insert({
        problem_id: data.problemId,
        submitted_sql: data.sql,
        is_correct: isCorrect,
        row_count: attempt.rowCount,
        duration_ms: attempt.durationMs,
      });

      return { ok: true as const, isCorrect, ...attempt };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Query failed";
      await supabaseAdmin.from("practice_attempts").insert({
        problem_id: data.problemId,
        submitted_sql: data.sql,
        is_correct: false,
      });
      return {
        ok: false as const,
        isCorrect: false,
        error: message,
        columns: [] as string[],
        rows: [] as Record<string, string | number | boolean | null>[],
        rowCount: 0,
        durationMs: 0,
      };
    }
  });

export const getProgress = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  const [{ count: total }, { data: attempts }] = await Promise.all([
    supabase.from("practice_problems").select("id", { count: "exact", head: true }),
    supabase.from("practice_attempts").select("problem_id, is_correct").eq("is_correct", true),
  ]);
  const solved = new Set((attempts ?? []).map((a) => a.problem_id)).size;
  return { solved, total: total ?? 0 };
});
