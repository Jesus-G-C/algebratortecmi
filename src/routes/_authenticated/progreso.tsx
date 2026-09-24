import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell, SectionTitle } from "@/components/AppShell";
import { fetchCourses, fetchLessons, fetchProfile, fetchProgress } from "@/lib/data";
import { levelInfo } from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/progreso")({
  head: () => ({
    meta: [
      { title: "Tu progreso — Algebrator" },
      { name: "description", content: "Avance por lección, maestría independiente, racha y nivel alcanzado." },
      { property: "og:title", content: "Tu progreso — Algebrator" },
      { property: "og:description", content: "Mide lo que puedes resolver sin ayuda, no solo lo que completaste." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: fetchLessons });
  const courses = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });
  const progress = useQuery({ queryKey: ["progress"], queryFn: fetchProgress });

  const info = levelInfo(profile.data?.xp ?? 0);
  const rows = progress.data ?? [];
  const independentPassed = rows.filter((r) => r.independent_passed).length;
  const masteryAvg = rows.length ? Math.round(rows.reduce((s, r) => s + r.mastery, 0) / rows.length) : 0;
  const completed = rows.filter((r) => r.completion === 100).length;

  return (
    <AppShell>
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Evidencia de aprendizaje</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tighter">Tu progreso</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Lo que cuenta aquí no es cuánto practicaste, sino cuánto puedes resolver ya sin asistencia.
        </p>
      </header>

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "Nivel", v: `${info.level} · ${info.name}` },
          { k: "XP acumulado", v: `${profile.data?.xp ?? 0}` },
          { k: "Lecciones completadas", v: `${completed}/${lessons.data?.length ?? 0}` },
          { k: "Retos sin ayuda superados", v: `${independentPassed}` },
        ].map((m) => (
          <div key={m.k} className="rounded-2xl border border-border bg-card/50 p-6">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{m.k}</dt>
            <dd className="mt-2 text-2xl font-bold">{m.v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-14">
        <SectionTitle
          aside={
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
              Maestría promedio {masteryAvg}%
            </span>
          }
        >
          Detalle por lección
        </SectionTitle>

        {progress.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando tu progreso…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Todavía no registras intentos. Resuelve tu primer ejercicio para empezar a medir tu avance.
            </p>
            <Link
              to="/panel"
              className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Ir a mi ruta
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Avance y maestría por lección</caption>
              <thead className="bg-card/80 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-4">Lección</th>
                  <th scope="col" className="px-5 py-4">Ruta</th>
                  <th scope="col" className="px-5 py-4">Avance</th>
                  <th scope="col" className="px-5 py-4">Maestría</th>
                  <th scope="col" className="px-5 py-4">Sin ayuda</th>
                  <th scope="col" className="px-5 py-4">XP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const lesson = lessons.data?.find((l) => l.id === r.lesson_id);
                  const course = courses.data?.find((c) => c.id === lesson?.course_id);
                  return (
                    <tr key={r.lesson_id} className="border-t border-border bg-card/30">
                      <td className="px-5 py-4 font-bold">
                        {lesson ? (
                          <Link to="/leccion/$lessonId" params={{ lessonId: lesson.id }} className="hover:text-primary">
                            {lesson.title}
                          </Link>
                        ) : (
                          "Lección"
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{course?.title ?? "—"}</td>
                      <td className="px-5 py-4 font-mono">{r.completion}%</td>
                      <td className="px-5 py-4 font-mono text-accent">{r.mastery}%</td>
                      <td className="px-5 py-4">{r.independent_passed ? "Sí" : "Pendiente"}</td>
                      <td className="px-5 py-4 font-mono">{r.xp_earned}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
