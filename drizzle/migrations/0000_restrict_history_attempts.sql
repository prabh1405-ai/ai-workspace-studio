DROP POLICY IF EXISTS "Query history is readable" ON public.query_history;
DROP POLICY IF EXISTS "Practice attempts are readable" ON public.practice_attempts;
REVOKE SELECT ON public.query_history FROM anon, authenticated;
REVOKE SELECT ON public.practice_attempts FROM anon, authenticated;