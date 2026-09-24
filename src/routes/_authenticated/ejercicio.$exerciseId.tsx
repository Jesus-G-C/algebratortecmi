import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { ExercisePlayer } from "@/components/ExercisePlayer";
import { fetchExerciseDetail } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/ejercicio/$exerciseId")({
  head: () => ({
    meta: [
      { title: "Ejercicio — Algebrator" },
      {
        name: "description",
        content: "Resuelve el ejercicio con asistencia progresiva y retroalimentación diagnóstica.",
      },
      { property: "og:title", content: "Ejercicio — Algebrator" },
      { property: "og:description", content: "Pistas graduales, nunca la respuesta." },
    ],
  }),
  component: ExerciseRoute,
});

function ExerciseRoute() {
  const { exerciseId } = Route.useParams();
  const query = useQuery({
    queryKey: ["exercise", exerciseId],
    queryFn: () => fetchExerciseDetail(exerciseId),
  });

  return (
    <AppShell>
      <Link to="/panel" className="font-mono text-xs text-muted-foreground hover:text-foreground">
        ← Volver al panel
      </Link>
      <div className="mt-6">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando ejercicio…</p>
        ) : query.isError ? (
          <p className="text-sm text-muted-foreground">No pudimos cargar este ejercicio. Intenta de nuevo.</p>
        ) : !query.data ? (
          <p className="text-sm text-muted-foreground">No encontramos este ejercicio.</p>
        ) : (
          <ExercisePlayer exercise={query.data} lessonTitle={query.data.lesson_title} independentMode={false} />
        )}
      </div>
    </AppShell>
  );
}
