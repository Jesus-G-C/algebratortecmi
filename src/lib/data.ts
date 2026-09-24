import { supabase } from "@/integrations/supabase/client";

export type Course = {
  id: string;
  title: string;
  level: string;
  description: string;
  symbol: string;
  position: number;
  min_level: number;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  concept: string;
  position: number;
};

export type PublicExercise = {
  id: string;
  lesson_id: string;
  title: string;
  problem: string;
  equation: string | null;
  difficulty: string;
  xp: number;
  concept: string;
  hints: string[];
  transfer_problem: string | null;
  ask_reasoning: boolean;
  independent: boolean;
  order_index: number;
};

export type Profile = {
  id: string;
  name: string;
  email: string | null;
  level: number;
  xp: number;
  streak: number;
  last_active_date: string | null;
};

export type ProgressRow = {
  lesson_id: string;
  completion: number;
  mastery: number;
  xp_earned: number;
  independent_passed: boolean;
  updated_at: string;
};

export type AttemptResult = {
  correct: boolean;
  xp: number;
  diagnostic: string | null;
  attempt: number;
  completion: number;
  mastery: number;
  level: number;
  has_transfer: boolean;
};

export async function fetchCourses() {
  const { data, error } = await supabase.from("courses").select("*").order("position");
  if (error) throw error;
  return data as Course[];
}

export async function fetchLessons() {
  const { data, error } = await supabase.from("lessons").select("*").order("position");
  if (error) throw error;
  return data as Lesson[];
}

export async function fetchLesson(id: string) {
  const { data, error } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Lesson | null;
}

export async function fetchLessonExercises(lessonId: string) {
  const { data, error } = await supabase.rpc("lesson_exercises", { p_lesson_id: lessonId });
  if (error) throw error;
  return (data ?? []) as PublicExercise[];
}

export async function fetchProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  if (data) return data as Profile;

  const inserted = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
      name: (user.user_metadata?.["name"] as string | undefined) ?? user.email?.split("@")[0] ?? "Estudiante",
    })
    .select("*")
    .single();
  if (inserted.error) throw inserted.error;
  return inserted.data as Profile;
}

export async function fetchProgress() {
  const { data, error } = await supabase
    .from("progress")
    .select("lesson_id, completion, mastery, xp_earned, independent_passed, updated_at");
  if (error) throw error;
  return (data ?? []) as ProgressRow[];
}

export async function fetchAchievements() {
  const [all, mine] = await Promise.all([
    supabase.from("achievements").select("*"),
    supabase.from("user_achievements").select("achievement_id, earned_at"),
  ]);
  if (all.error) throw all.error;
  if (mine.error) throw mine.error;
  const earned = new Map(mine.data.map((r) => [r.achievement_id, r.earned_at]));
  return all.data.map((a) => ({ ...a, earned_at: earned.get(a.id) ?? null }));
}

export async function submitAttempt(input: {
  exerciseId: string;
  answer: string;
  assistance: number;
  mode: "practice" | "transfer" | "independent";
  reasoning?: string | null;
}) {
  const { data, error } = await supabase.rpc("submit_attempt", {
    p_exercise_id: input.exerciseId,
    p_answer: input.answer,
    p_assistance: input.assistance,
    p_mode: input.mode,
    p_reasoning: input.reasoning ?? null,
  });
  if (error) throw error;
  return data as unknown as AttemptResult;
}

export async function fetchIsAdmin() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", auth.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function fetchRetrieval() {
  const { data, error } = await supabase.rpc("retrieval_exercise");
  if (error) throw error;
  const rows = (data ?? []) as { id: string; lesson_id: string; title: string; problem: string; concept: string }[];
  return rows[0] ?? null;
}
