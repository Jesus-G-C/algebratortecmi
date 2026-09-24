import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { ExercisePlayer } from "@/components/ExercisePlayer";
import { fetchExerciseDetail } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/reto/$exerciseId")({
  head: () => ({
    meta: [
      { title: "Reto independiente — Algebrator" },
      {
        name: "description",
        content: "Resuelve sin pistas: este reto mide tu desempeño independiente y tu maestría.",
      },
      { property: "og:title", content: "Reto independiente — Algebrator" },
      { property: "og:description", content: "Sin escalera de ayuda. Solo tu procedimiento." },
    ],
  }),
  component: ChallengeRoute,
});

function ChallengeRoute() {
  const { exerciseId } = Route.useParams();
  const query = useQuery({
    queryKey: ["challenge", exerciseId],
    queryFn: () => fetchExerciseDetail(exerciseId),
  });

  return (
    <AppShell>
      <Link to="/panel" className="font-mono text-xs text-muted-foreground hover:text-foreground">
        ← Volver al panel
      </Link>

      <div className="mt-6 rounded-2xl border border-accent/40 bg-accent/5 p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Modo independiente</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          No hay pistas disponibles en esta pantalla. Si te trabas, vuelve a la práctica guiada de la lección y regresa
          cuando estés listo.
        </p>
      </div>

      <div className="mt-8">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando reto…</p>
        ) : query.isError ? (
          <p className="text-sm text-muted-foreground">No pudimos cargar este reto. Intenta de nuevo.</p>
        ) : !query.data ? (
          <p className="text-sm text-muted-foreground">No encontramos este reto.</p>
        ) : (
          <ExercisePlayer exercise={query.data} lessonTitle={query.data.lesson_title} independentMode />
        )}
      </div>
    </AppShell>
  );
}
