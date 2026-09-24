import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell, SectionTitle } from "@/components/AppShell";
import { fetchAchievements } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/logros")({
  head: () => ({
    meta: [
      { title: "Logros — Algebrator" },
      { name: "description", content: "Logros que reconocen independencia y transferencia, no solo volumen de práctica." },
      { property: "og:title", content: "Logros — Algebrator" },
      { property: "og:description", content: "Reconocimientos ligados a lo que resuelves sin ayuda." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const achievements = useQuery({ queryKey: ["achievements"], queryFn: fetchAchievements });
  const earned = (achievements.data ?? []).filter((a) => a.earned_at).length;

  return (
    <AppShell>
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Capa de apoyo</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tighter">Logros</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Los logros no son la meta: marcan momentos donde tu desempeño cambió de guiado a independiente.
        </p>
      </header>

      <section className="mt-12">
        <SectionTitle
          aside={
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
              {earned}/{achievements.data?.length ?? 0} obtenidos
            </span>
          }
        >
          Tus reconocimientos
        </SectionTitle>

        {achievements.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando logros…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(achievements.data ?? []).map((a) => (
              <div
                key={a.id}
                className={`rounded-2xl border p-6 ${
                  a.earned_at ? "border-accent/40 bg-card/70" : "border-border bg-card/25"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex size-11 items-center justify-center rounded-xl font-mono text-lg font-bold ${
                    a.earned_at ? "bg-accent text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {a.earned_at ? "✓" : "—"}
                </span>
                <span className="sr-only">{a.earned_at ? "Logro obtenido" : "Logro pendiente"}</span>
                <h3 className={`mt-4 text-lg font-bold ${a.earned_at ? "" : "text-muted-foreground"}`}>{a.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {a.earned_at
                    ? `Obtenido el ${new Date(a.earned_at).toLocaleDateString("es")}`
                    : `Requisito: ${a.requirement}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
