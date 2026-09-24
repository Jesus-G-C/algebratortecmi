CREATE OR REPLACE FUNCTION public.norm_answer(_a text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(
           regexp_replace(lower(coalesce(_a, '')), '^[a-z]\s*=\s*', ''),
           '\s+', '', 'g');
$$;

CREATE OR REPLACE FUNCTION public.level_for_xp(_xp int)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN _xp >= 2000 THEN 5
    WHEN _xp >= 1000 THEN 4
    WHEN _xp >= 500 THEN 3
    WHEN _xp >= 200 THEN 2
    ELSE 1 END;
$$;

-- learner-facing exercise reader: never exposes the stored answer
CREATE OR REPLACE FUNCTION public.lesson_exercises(p_lesson_id uuid)
RETURNS TABLE (
  id uuid, lesson_id uuid, title text, problem text, equation text,
  difficulty text, xp int, concept text, hints text[],
  transfer_problem text, ask_reasoning boolean, independent boolean, order_index int
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.id, e.lesson_id, e.title, e.problem, e.equation, e.difficulty, e.xp, e.concept,
         e.hints, e.transfer_problem, e.ask_reasoning, e.independent, e.position
  FROM public.exercises e
  WHERE e.lesson_id = p_lesson_id
  ORDER BY e.position;
$$;
GRANT EXECUTE ON FUNCTION public.lesson_exercises(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.retrieval_exercise()
RETURNS TABLE (id uuid, lesson_id uuid, title text, problem text, concept text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.id, e.lesson_id, e.title, coalesce(e.transfer_problem, e.problem), e.concept
  FROM public.exercises e
  JOIN public.exercise_attempts a ON a.exercise_id = e.id AND a.user_id = auth.uid() AND a.correct
  ORDER BY random() LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.retrieval_exercise() TO authenticated;

CREATE OR REPLACE FUNCTION public.grant_achievement(_user_id uuid, _code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a_id uuid;
BEGIN
  SELECT id INTO a_id FROM public.achievements WHERE code = _code;
  IF a_id IS NOT NULL THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (_user_id, a_id) ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_attempt(
  p_exercise_id uuid,
  p_answer text,
  p_assistance int DEFAULT 0,
  p_mode text DEFAULT 'practice',
  p_reasoning text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  ex public.exercises%ROWTYPE;
  v_correct boolean;
  v_expected text;
  v_attempts int;
  v_prior_correct int;
  v_xp int := 0;
  v_total int; v_solved int; v_independent int;
  v_new_level int;
  v_hint text;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;
  SELECT * INTO ex FROM public.exercises WHERE id = p_exercise_id;
  IF ex.id IS NULL THEN RAISE EXCEPTION 'Ejercicio no encontrado'; END IF;

  v_expected := CASE WHEN p_mode = 'transfer' AND ex.transfer_answer IS NOT NULL
                     THEN ex.transfer_answer ELSE ex.answer END;
  v_correct := public.norm_answer(p_answer) = public.norm_answer(v_expected);

  SELECT count(*), count(*) FILTER (WHERE correct)
    INTO v_attempts, v_prior_correct
    FROM public.exercise_attempts
   WHERE user_id = v_user AND exercise_id = p_exercise_id AND mode = p_mode;

  INSERT INTO public.exercise_attempts (user_id, exercise_id, answer, correct, assistance_level, attempt_number, mode, reasoning)
  VALUES (v_user, p_exercise_id, p_answer, v_correct, coalesce(p_assistance, 0), v_attempts + 1, p_mode, p_reasoning);

  IF v_correct AND v_prior_correct = 0 THEN
    v_xp := CASE p_mode
              WHEN 'transfer' THEN 25
              WHEN 'independent' THEN 30
              ELSE CASE WHEN ex.difficulty = 'dificil' THEN 20 ELSE ex.xp END
            END;
    IF p_reasoning IS NOT NULL AND length(trim(p_reasoning)) > 0 AND p_mode <> 'independent' THEN
      v_xp := v_xp + 15;
    END IF;
  END IF;

  SELECT count(*) INTO v_total FROM public.exercises WHERE lesson_id = ex.lesson_id;
  SELECT count(DISTINCT a.exercise_id) INTO v_solved
    FROM public.exercise_attempts a JOIN public.exercises e2 ON e2.id = a.exercise_id
   WHERE a.user_id = v_user AND e2.lesson_id = ex.lesson_id AND a.correct;
  SELECT count(DISTINCT a.exercise_id) INTO v_independent
    FROM public.exercise_attempts a JOIN public.exercises e2 ON e2.id = a.exercise_id
   WHERE a.user_id = v_user AND e2.lesson_id = ex.lesson_id AND a.correct AND a.assistance_level <= 1;

  INSERT INTO public.progress (user_id, lesson_id, completion, mastery, xp_earned, independent_passed, updated_at)
  VALUES (v_user, ex.lesson_id,
          CASE WHEN v_total = 0 THEN 0 ELSE (v_solved * 100) / v_total END,
          CASE WHEN v_total = 0 THEN 0 ELSE (v_independent * 100) / v_total END,
          v_xp, (p_mode = 'independent' AND v_correct), now())
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET
    completion = EXCLUDED.completion,
    mastery = EXCLUDED.mastery,
    xp_earned = public.progress.xp_earned + v_xp,
    independent_passed = public.progress.independent_passed OR EXCLUDED.independent_passed,
    updated_at = now();

  UPDATE public.profiles SET
    xp = xp + v_xp,
    level = public.level_for_xp(xp + v_xp),
    streak = CASE
      WHEN last_active_date = current_date THEN greatest(streak, 1)
      WHEN last_active_date = current_date - 1 THEN streak + 1
      ELSE 1 END,
    last_active_date = current_date
  WHERE id = v_user
  RETURNING level INTO v_new_level;

  IF v_correct THEN
    PERFORM public.grant_achievement(v_user, 'primer_acierto');
    IF p_mode = 'independent' THEN PERFORM public.grant_achievement(v_user, 'sin_ayuda'); END IF;
    IF p_mode = 'transfer' THEN PERFORM public.grant_achievement(v_user, 'transferencia'); END IF;
    IF coalesce(p_assistance, 0) = 0 THEN PERFORM public.grant_achievement(v_user, 'cero_pistas'); END IF;
    IF v_total > 0 AND v_solved = v_total THEN PERFORM public.grant_achievement(v_user, 'leccion_completa'); END IF;
  END IF;

  v_hint := CASE WHEN v_correct THEN NULL ELSE ex.diagnostic END;

  RETURN jsonb_build_object(
    'correct', v_correct,
    'xp', v_xp,
    'diagnostic', v_hint,
    'attempt', v_attempts + 1,
    'completion', CASE WHEN v_total = 0 THEN 0 ELSE (v_solved * 100) / v_total END,
    'mastery', CASE WHEN v_total = 0 THEN 0 ELSE (v_independent * 100) / v_total END,
    'level', coalesce(v_new_level, 1),
    'has_transfer', ex.transfer_problem IS NOT NULL
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_attempt(uuid, text, int, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_metrics()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Acceso denegado'; END IF;
  SELECT jsonb_build_object(
    'learners', (SELECT count(*) FROM public.profiles),
    'attempts', (SELECT count(*) FROM public.exercise_attempts),
    'success_rate', (SELECT coalesce(round(100.0 * avg(CASE WHEN correct THEN 1 ELSE 0 END)), 0) FROM public.exercise_attempts),
    'independent_rate', (SELECT coalesce(round(100.0 * avg(CASE WHEN correct THEN 1 ELSE 0 END)), 0) FROM public.exercise_attempts WHERE mode = 'independent'),
    'avg_assistance', (SELECT coalesce(round(avg(assistance_level)::numeric, 1), 0) FROM public.exercise_attempts),
    'exercises', (SELECT count(*) FROM public.exercises),
    'lessons', (SELECT count(*) FROM public.lessons)
  ) INTO r;
  RETURN r;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_metrics() TO authenticated;
