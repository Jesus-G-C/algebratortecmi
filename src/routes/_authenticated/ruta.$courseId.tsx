import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell, SectionTitle } from "@/components/AppShell";
import { fetchCourses, fetchLessons, fetchProgress } from "@/lib/data";
import { LEVEL_LABEL } from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/ruta/$courseId")({
  head: () => ({
    meta: [
      { title: "Ruta de aprendizaje — Algebrator" },
      { name: "description", content: "Las lecciones de esta ruta, en orden, con tu avance y dominio en cada nodo." },
      { property: "og:title", content: "Ruta de aprendizaje — Algebrator" },
      { property: "og:description", content: "Avanza nodo por nodo, de la práctica guiada al reto independiente." },
    ],
  }),
  component: RouteView,
});

function RouteView() {
  const { courseId } = Route.useParams();
  const courses = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: fetchLessons });
  const progress = useQuery({ queryKey: ["progress"], queryFn: fetchProgress });

  const course = courses.data?.find((c) => c.id === courseId);
  const courseLessons = (lessons.data ?? [])
    .filter((l) => l.course_id === courseId)
    .sort((a, b) => a.position - b.position);
  const progressMap = new Map((progress.data ?? []).map((p) => [p.lesson_id, p]));

  return (
    <AppShell>
      <Link to="/panel" className="font-mono text-xs text-muted-foreground hover:text-foreground">
        ← Volver al panel
      </Link>

      <header className="mt-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          {course ? (LEVEL_LABEL[course.level] ?? course.level) : "Cargando"}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tighter">{course?.title ?? "Ruta"}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{course?.description}</p>
      </header>

      <section className="mt-12">
        <SectionTitle>Nodos de la ruta</SectionTitle>

        {lessons.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando lecciones…</p>
        ) : courseLessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta ruta todavía no tiene lecciones publicadas.</p>
        ) : (
          <ol className="relative space-y-4 pl-10">
            <div aria-hidden className="absolute bottom-6 left-4 top-6 w-px bg-border" />
            {courseLessons.map((lesson, i) => {
              const p = progressMap.get(lesson.id);
              const completion = p?.completion ?? 0;
              const previous = i === 0 ? null : progressMap.get(courseLessons[i - 1]!.id);
              const locked = i > 0 && (previous?.completion ?? 0) < 100;
              return (
                <li key={lesson.id} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-10 top-6 flex size-8 items-center justify-center rounded-full border font-mono text-xs font-bold ${
                      completion === 100
                        ? "border-primary bg-primary text-primary-foreground"
                        : locked
                          ? "border-border bg-card text-muted-foreground"
                          : "border-primary bg-card text-primary"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div
                    className={`rounded-2xl border p-6 ${
                      locked ? "border-border bg-card/30" : "border-border bg-card/60 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-xl">
                        <h3 className={`text-lg font-bold ${locked ? "text-muted-foreground" : ""}`}>{lesson.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{lesson.description}</p>
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Concepto: {lesson.concept}
                        </p>
                      </div>
                      {locked ? (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Completa la lección anterior
                        </span>
                      ) : (
                        <Link
                          to="/leccion/$lessonId"
                          params={{ lessonId: lesson.id }}
                          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
                        >
                          {completion === 0 ? "Empezar" : completion === 100 ? "Repasar" : "Continuar"}
                        </Link>
                      )}
                    </div>

                    <div className="mt-5 flex items-center gap-4">
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"
                        role="progressbar"
                        aria-valuenow={completion}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Avance de ${lesson.title}`}
                      >
                        <div className="h-full bg-primary" style={{ width: `${completion}%` }} />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {completion}% · maestría {p?.mastery ?? 0}%
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </AppShell>
  );
}
