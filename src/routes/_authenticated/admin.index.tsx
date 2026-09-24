import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminMetrics,
});

type Metric = {
  learners: number;
  attempts: number;
  correct_attempts: number;
  independent_passes: number;
  avg_assistance: number;
  lessons_completed: number;
};

async function fetchMetrics() {
  const { data, error } = await supabase.rpc("admin_metrics");
  if (error) throw error;
  return (data ?? null) as unknown as Metric | null;
}

function AdminMetrics() {
  const metrics = useQuery({ queryKey: ["admin-metrics"], queryFn: fetchMetrics });
  const m = metrics.data;
  const successRate = m && m.attempts > 0 ? Math.round((m.correct_attempts / m.attempts) * 100) : 0;

  if (metrics.isLoading) return <p className="text-sm text-muted-foreground">Cargando métricas…</p>;
  if (metrics.isError) return <p className="text-sm text-muted-foreground">No pudimos cargar las métricas.</p>;

  return (
    <div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { k: "Estudiantes activos", v: m?.learners ?? 0 },
          { k: "Intentos registrados", v: m?.attempts ?? 0 },
          { k: "Tasa de acierto", v: `${successRate}%` },
          { k: "Retos sin ayuda superados", v: m?.independent_passes ?? 0 },
          { k: "Nivel de ayuda promedio", v: m?.avg_assistance ?? 0 },
          { k: "Lecciones completadas", v: m?.lessons_completed ?? 0 },
        ].map((row) => (
          <div key={row.k} className="rounded-2xl border border-border bg-card/50 p-6">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{row.k}</dt>
            <dd className="mt-2 text-3xl font-bold">{row.v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Estas métricas son agregadas sobre los intentos reales registrados. Sirven para detectar dónde la asistencia no
        está bajando con la práctica, no para evaluar individualmente a un estudiante.
      </p>
    </div>
  );
}
