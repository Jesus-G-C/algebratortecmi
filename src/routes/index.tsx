import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Algebrator — álgebra con asistencia que se desvanece" },
      {
        name: "description",
        content:
          "Practica álgebra básica, intermedia y avanzada con pistas graduales, retroalimentación diagnóstica, transferencia y retos sin ayuda.",
      },
      { property: "og:title", content: "Algebrator — álgebra con asistencia que se desvanece" },
      {
        property: "og:description",
        content: "Construir capacidad, reducir ayuda: la práctica de álgebra que mide lo que puedes hacer solo.",
      },
    ],
  }),
  component: Landing,
});

const LOOP = [
  { k: "Contexto", v: "Un problema breve con sentido, no una lista de ejercicios sueltos." },
  { k: "Compromiso", v: "Antes de resolver, comprometes una respuesta o predicción." },
  { k: "Retroalimentación", v: "Diagnóstico de tu procedimiento, nunca la respuesta revelada." },
  { k: "Transferencia", v: "La misma estructura matemática en un contexto nuevo." },
  { k: "Independencia", v: "Retos sin pistas donde se mide lo que ya dominas." },
];

function Landing() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background math-grid">
      <div aria-hidden className="pointer-events-none absolute left-12 top-0 h-full w-px bg-primary/20 axis-line" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-32 h-px w-full bg-primary/20 axis-line" />

      <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-lg bg-primary font-mono text-xl font-bold text-primary-foreground glow-primary">
            ax
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ALGEBRATOR</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Álgebra · VELARA · Shift</p>
          </div>
        </div>
        <Link
          to="/auth"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-bold transition-colors hover:bg-secondary"
        >
          Entrar
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-8 sm:px-10">
        <section className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Construir capacidad · Reducir ayuda</p>
            <h2 className="mt-5 text-4xl font-bold tracking-tighter sm:text-6xl">
              Aprende álgebra hasta <span className="text-primary">no necesitar pistas</span>.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Algebrator no entrega respuestas. Te da una escalera de asistencia que baja conforme avanzas,
              retroalimentación que corrige tu procedimiento y retos independientes donde se mide lo que ya puedes
              hacer sin ayuda.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/auth"
                search={{ modo: "registro" }}
                className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:brightness-110"
              >
                Crear cuenta
                <span aria-hidden className="font-mono">
                  →
                </span>
              </Link>
              <Link
                to="/auth"
                className="rounded-full border border-border bg-card/50 px-8 py-4 font-bold transition hover:bg-secondary"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-primary/20 bg-card/80 p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Gesto de transformación
              </p>
              <div className="mt-6 space-y-4 font-mono">
                <p className="text-3xl font-bold">
                  <span className="animate-term-shift inline-block">3x</span>{" "}
                  <span className="text-muted-foreground">+ 5</span> <span className="text-primary">=</span> 20
                </p>
                <p className="text-2xl font-bold text-muted-foreground">
                  3x <span className="text-primary">=</span> 15
                </p>
                <p className="text-2xl font-bold text-accent">
                  x <span className="text-primary">=</span> 5
                </p>
              </div>
              <p className="mt-6 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                Cada paso que das reescribe la expresión. La animación no decora: muestra qué término cruzó la igualdad
                y por qué cambió de signo.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-6 flex items-center gap-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">El ciclo de práctica</h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {LOOP.map((item, i) => (
              <div key={item.k} className="rounded-2xl border border-border bg-card/40 p-5">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-primary">0{i + 1}</dt>
                <dd className="mt-3 text-base font-bold">{item.k}</dd>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 rounded-3xl border border-border bg-card/40 p-8">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Algebrator implementa principios de diseño de la arquitectura de aprendizaje VELARA y del reto de
            gamificación Shift. Es un prototipo funcional: no está validado formalmente ni certificado en
            accesibilidad, seguridad o efectividad educativa.
          </p>
        </section>
      </main>
    </div>
  );
}
