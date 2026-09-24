import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell, SectionTitle } from "@/components/AppShell";
import { fetchCourses, fetchLessons, fetchProfile, fetchProgress, fetchRetrieval } from "@/lib/data";
import { LEVEL_LABEL, levelInfo } from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Tu panel — Algebrator" },
      { name: "description", content: "Tu nivel, tu racha, tu lección actual y el siguiente reto recomendado." },
      { property: "og:title", content: "Tu panel — Algebrator" },
      { property: "og:description", content: "Continúa tu ruta de álgebra donde te quedaste." },
    ],
  }),
  component: Panel,
});

function Panel() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const courses = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: fetchLessons });
  const progress = useQuery({ queryKey: ["progress"], queryFn: fetchProgress });
  const retrieval = useQuery({ queryKey: ["retrieval"], queryFn: fetchRetrieval });

  const info = levelInfo(profile.data?.xp ?? 0);
  const progressMap = new Map((progress.data ?? []).map((p) => [p.lesson_id, p]));
  const orderedLessons = (lessons.data ?? []).slice().sort((a, b) => {
    const ca = courses.data?.find((c) => c.id === a.course_id)?.position ?? 0;
    const cb = courses.data?.find((c) => c.id === b.course_id)?.position ?? 0;
    return ca - cb || a.position - b.position;
  });
  const currentLesson = orderedLessons.find((l) => (progressMap.get(l.id)?.completion ?? 0) < 100);
  const currentCourse = courses.data?.find((c) => c.id === currentLesson?.course_id);
  const masteryAvg = progress.data?.length
    ? Math.round(progress.data.reduce((s, p) => s + p.mastery, 0) / progress.data.length)
    : 0;
  const lessonsDone = (progress.data ?? []).filter((p) => p.completion === 100).length;

  const loading = profile.isLoading || lessons.isLoading || courses.isLoading;

  return (
    <AppShell>
      <section className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Tu sesión de hoy</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">
            Hola, <span className="text-primary">{profile.data?.name ?? "estudiante"}</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {loading
              ? "Preparando tu ruta…"
              : currentLesson
                ? `Estás en «${currentLesson.title}». El objetivo de esta lección es ${currentLesson.concept.toLowerCase()}.`
                : "Completaste todas las lecciones disponibles. Vuelve por práctica de recuperación para sostener lo aprendido."}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {currentLesson ? (
              <Link
                to="/leccion/$lessonId"
                params={{ lessonId: currentLesson.id }}
                className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:brightness-110"
              >
                Continuar aprendiendo
                <span aria-hidden className="font-mono">
                  →
                </span>
              </Link>
            ) : null}
            <Link
              to="/progreso"
              className="rounded-full border border-border bg-card/50 px-8 py-4 font-bold transition hover:bg-secondary"
            >
              Ver mi dominio
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-primary/20 bg-card/80 p-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Dominio total</p>
                <p className="text-3xl font-bold">
                  {profile.data?.xp ?? 0} <span className="text-sm font-normal text-muted-foreground">XP</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  Nivel {info.level} · {info.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {info.next === null ? "Nivel máximo alcanzado" : `${info.toNext} XP para el siguiente nivel`}
                </p>
              </div>
            </div>

            <div
              className="relative mt-5 h-3 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={info.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Avance hacia el siguiente nivel"
            >
              <div className="h-full animate-rail-fill bg-primary glow-primary" style={{ width: `${info.pct}%` }} />
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
              <div>
                <dt className="font-mono text-[9px] uppercase text-muted-foreground">Racha</dt>
                <dd className="text-lg font-bold">{profile.data?.streak ?? 0} días</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase text-muted-foreground">Maestría</dt>
                <dd className="text-lg font-bold">{masteryAvg}%</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase text-muted-foreground">Lecciones</dt>
                <dd className="text-lg font-bold">
                  {lessonsDone}/{orderedLessons.length}
                </dd>
              </div>
            </dl>
          </div>

          {retrieval.data ? (
            <div className="mt-4 rounded-2xl border border-accent/30 bg-card/50 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Práctica de recuperación</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Vuelve sobre «{retrieval.data.concept}» en un contexto transformado desde la lección que ya practicaste.
              </p>
              <Link
                to="/leccion/$lessonId"
                params={{ lessonId: retrieval.data.lesson_id }}
                className="mt-3 inline-block font-mono text-xs font-bold text-accent hover:underline"
              >
                Repasar ahora ↘
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle>Tus rutas de aprendizaje</SectionTitle>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(courses.data ?? []).map((course) => {
            const courseLessons = orderedLessons.filter((l) => l.course_id === course.id);
            const done = courseLessons.filter((l) => (progressMap.get(l.id)?.completion ?? 0) === 100).length;
            const locked = (profile.data?.level ?? 1) < course.min_level;
            return (
              <div
                key={course.id}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition ${
                  locked ? "border-border bg-card/30" : "border-primary/30 bg-card/60 hover:border-primary"
                }`}
              >
                <span aria-hidden className="absolute -right-4 -top-4 font-mono text-8xl font-bold text-foreground/5">
                  {course.symbol}
                </span>
                <span className="inline-block rounded-md bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {LEVEL_LABEL[course.level] ?? course.level}
                </span>
                <h3 className={`mt-4 text-xl font-bold ${locked ? "text-muted-foreground" : ""}`}>{course.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {done}/{courseLessons.length} lecciones
                  </span>
                  {locked ? (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Requiere nivel {course.min_level}
                    </span>
                  ) : (
                    <Link
                      to="/ruta/$courseId"
                      params={{ courseId: course.id }}
                      className="font-mono text-xs font-bold text-primary hover:underline"
                    >
                      Abrir ruta ↘
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {currentCourse ? (
        <p className="mt-10 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Ruta activa: {currentCourse.title}
        </p>
      ) : null}
    </AppShell>
  );
}
