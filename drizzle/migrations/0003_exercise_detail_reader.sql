CREATE OR REPLACE FUNCTION public.exercise_detail(p_exercise_id uuid)
RETURNS TABLE(
  id uuid, lesson_id uuid, title text, problem text, equation text,
  difficulty text, xp integer, concept text, hints text[],
  transfer_problem text, ask_reasoning boolean, independent boolean,
  order_index integer, lesson_title text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT e.id, e.lesson_id, e.title, e.problem, e.equation, e.difficulty, e.xp, e.concept,
         e.hints, e.transfer_problem, e.ask_reasoning, e.independent, e.position, l.title
  FROM public.exercises e
  JOIN public.lessons l ON l.id = e.lesson_id
  WHERE e.id = p_exercise_id;
$$;

GRANT EXECUTE ON FUNCTION public.exercise_detail(uuid) TO authenticated;