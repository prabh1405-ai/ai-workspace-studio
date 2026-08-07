REVOKE ALL ON FUNCTION public.exec_demo_readonly(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_demo_readonly(text) TO service_role;