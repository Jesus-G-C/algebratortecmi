CREATE OR REPLACE FUNCTION public.admin_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Acceso denegado'; END IF;
  SELECT jsonb_build_object(
    'learners', (SELECT count(*) FROM public.profiles),
    'attempts', (SELECT count(*) FROM public.exercise_attempts),
    'correct_attempts', (SELECT count(*) FROM public.exercise_attempts WHERE correct),
    'independent_passes', (SELECT count(*) FROM public.exercise_attempts WHERE correct AND mode = 'independent'),
    'avg_assistance', (SELECT coalesce(round(avg(assistance_level)::numeric, 1), 0) FROM public.exercise_attempts),
    'lessons_completed', (SELECT count(*) FROM public.progress WHERE completion >= 100),
    'exercises', (SELECT count(*) FROM public.exercises),
    'lessons', (SELECT count(*) FROM public.lessons)
  ) INTO r;
  RETURN r;
END;
$$;