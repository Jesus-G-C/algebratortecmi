import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { ExercisePlayer } from "@/components/ExercisePlayer";
import { supabase } from "@/integrations/supabase/client";
import { fetchLesson, fetchLessonExercises, type PublicExercise } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/ejercicio/$exerciseId")({
  head: () => ({
    meta: [
      { title: "Ejercicio — Algebrator" },
      { name: "description", content: "Resuelve el ejercicio con asistencia progresiva y retroalimentación diagnóstica." },
      { property: "og:title", content: "Ejercicio — Algebrator" },
      { property: "og:description", content: "Pistas graduales, nunca la respuesta." },
    ],
  }),
  component: ExerciseRoute,
});

async function loadExercise(exerciseId: string) {
  const { data, error } = await supabase.from("exercises").select("lesson_id").eq("id", exerciseId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const list = await fetchLessonExercises(data.lesson_id);
  const exercise = list.find((e) => e.id === exerciseId) ?? null;
  const lesson = await fetchLesson(data.lesson_id);
  return { exercise, lessonTitle: lesson?.title ?? "" } as {
    exercise: PublicExercise | null;
    lessonTitle: string;
  };
}

function ExerciseRoute() {
  const { exerciseId } = Route.useParams();
  const query = useQuery({ queryKey: ["exercise", exerciseId], queryFn: () => loadExercise(exerciseId) });

  return (
    <AppShell>
      <Link to="/panel" className="font-mono text-xs text-muted-foreground hover:text-foreground">
        ← Volver al panel
      </Link>
      <div className="mt-6">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando ejercicio…</p>
        ) : !query.data?.exercise ? (
          <p className="text-sm text-muted-foreground">No encontramos este ejercicio.</p>
        ) : (
          <ExercisePlayer
            exercise={query.data.exercise}
            lessonTitle={query.data.lessonTitle}
            independentMode={false}
          />
        )}
      </div>
    </AppShell>
  );
}
