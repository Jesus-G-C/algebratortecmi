import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell, SectionTitle } from "@/components/AppShell";
import { fetchLesson, fetchLessonExercises, fetchProgress } from "@/lib/data";
import { DIFFICULTY_LABEL } from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/leccion/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lección — Algebrator" },
      { name: "description", content: "El concepto de la lección, sus ejercicios y el reto independiente final." },
      { property: "og:title", content: "Lección — Algebrator" },
      { property: "og:description", content: "Practica el concepto y demuéstralo después sin ayuda." },
    ],
  }),
  component: LessonView,
});

function LessonView() {
  const { lessonId } = Route.useParams();
  const lesson = useQuery({ queryKey: ["lesson", lessonId], queryFn: () => fetchLesson(lessonId) });
  const exercises = useQuery({ queryKey: ["exercises", lessonId], queryFn: () => fetchLessonExercises(lessonId) });
  const progress = useQuery({ queryKey: ["progress"], queryFn: fetchProgress });

  const p = progress.data?.find((r) => r.lesson_id === lessonId);
  const practice = (exercises.data ?? []).filter((e) => !e.independent);
  const independent = (exercises.data ?? []).filter((e) => e.independent);

  return (
    <AppShell>
      <Link to="/panel" className="font-mono text-xs text-muted-foreground hover:text-foreground">
        ← Volver al panel
      </Link>

      <header className="mt-6 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Lección</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tighter">{lesson.data?.title ?? "Cargando…"}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lesson.data?.description}</p>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Concepto central</p>
            <p className="mt-2 text-base font-bold">{lesson.data?.concept}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <dt className="font-mono text-[9px] uppercase text-muted-foreground">Avance</dt>
                <dd className="text-lg font-bold">{p?.completion ?? 0}%</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase text-muted-foreground">Maestría</dt>
                <dd className="text-lg font-bold">{p?.mastery ?? 0}%</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="mt-14">
        <SectionTitle>Práctica guiada</SectionTitle>
        {exercises.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando ejercicios…</p>
        ) : practice.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta lección aún no tiene ejercicios de práctica.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {practice.map((ex, i) => (
              <Link
                key={ex.id}
                to="/ejercicio/$exerciseId"
                params={{ exerciseId: ex.id }}
                className="group rounded-2xl border border-border bg-card/50 p-6 transition hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Ejercicio {i + 1} · {DIFFICULTY_LABEL[ex.difficulty] ?? ex.difficulty}
                  </span>
                  <span className="font-mono text-xs font-bold text-accent">+{ex.xp} XP</span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{ex.title}</h3>
                {ex.equation ? (
                  <p className="mt-3 font-mono text-2xl font-bold text-primary">{ex.equation}</p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">{ex.problem}</p>
                )}
                <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">
                  Resolver ↘
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <SectionTitle>Reto independiente</SectionTitle>
        {independent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Esta lección aún no tiene reto independiente configurado.
          </p>
        ) : (
          independent.map((ex) => (
            <div key={ex.id} className="rounded-2xl border border-accent/40 bg-card/60 p-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Sin pistas · sin ayuda</p>
              <h3 className="mt-3 text-2xl font-bold">{ex.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Aquí no hay escalera de asistencia. Este reto mide lo que ya puedes hacer solo y define tu maestría en
                la lección.
              </p>
              <Link
                to="/reto/$exerciseId"
                params={{ exerciseId: ex.id }}
                className="mt-6 inline-flex rounded-full bg-accent px-7 py-3.5 font-bold text-primary-foreground transition hover:brightness-110"
              >
                Intentar el reto
              </Link>
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}
