import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { submitAttempt, type AttemptResult, type PublicExercise } from "@/lib/data";
import { ASSISTANCE_LADDER, DIFFICULTY_LABEL, REASONING_OPTIONS, assistanceMessage } from "@/lib/learning";

type Mode = "practice" | "transfer" | "independent";

export function ExercisePlayer({
  exercise,
  lessonTitle,
  independentMode,
}: {
  exercise: PublicExercise;
  lessonTitle: string;
  independentMode: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<Mode>(independentMode ? "independent" : "practice");
  const [assistance, setAssistance] = useState(0);
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [attempts, setAttempts] = useState(0);

  const hints = independentMode ? [] : exercise.hints;
  const maxAssistance = hints.length;
  const problem = mode === "transfer" ? (exercise.transfer_problem ?? exercise.problem) : exercise.problem;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    setBusy(true);
    try {
      const res = await submitAttempt({
        exerciseId: exercise.id,
        answer,
        assistance,
        mode,
        reasoning: reasoning || null,
      });
      setResult(res);
      setAttempts((n) => n + 1);
      if (res.correct) {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["progress"] });
        queryClient.invalidateQueries({ queryKey: ["achievements"] });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos registrar tu intento.");
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setResult(null);
    setAnswer("");
  }

  function startTransfer() {
    setResult(null);
    setAnswer("");
    setReasoning("");
    setAssistance(0);
    setMode("transfer");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="rounded-3xl border border-border bg-card/70 p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              {mode === "independent"
                ? "Reto independiente · sin pistas"
                : mode === "transfer"
                  ? "Transferencia · mismo concepto, nuevo contexto"
                  : `Práctica · ${DIFFICULTY_LABEL[exercise.difficulty] ?? exercise.difficulty}`}
            </span>
            <span className="font-mono text-xs font-bold text-accent">+{exercise.xp} XP</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight">{exercise.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{problem}</p>

          {exercise.equation && mode !== "transfer" ? (
            <p className="mt-8 font-mono text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="animate-term-shift inline-block">{exercise.equation}</span>
            </p>
          ) : null}

          {result ? (
            <div
              role="status"
              className={`mt-8 rounded-2xl border p-6 ${
                result.correct ? "border-success/50 bg-success/10" : "border-accent/50 bg-accent/10"
              }`}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest">
                {result.correct ? "Resultado válido" : "Revisemos tu procedimiento"}
              </p>
              {result.correct ? (
                <>
                  <p className="mt-3 text-base leading-relaxed">
                    {assistanceMessage(assistance)} Tu respuesta satisface la igualdad en cada paso.
                  </p>
                  <p className="mt-3 font-mono text-sm text-accent">
                    +{result.xp} XP · avance {result.completion}% · maestría {result.mastery}%
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {result.has_transfer && mode === "practice" ? (
                      <button
                        type="button"
                        onClick={startTransfer}
                        className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110"
                      >
                        Probar la transferencia
                      </button>
                    ) : null}
                    <Link
                      to="/leccion/$lessonId"
                      params={{ lessonId: exercise.lesson_id }}
                      className="rounded-full border border-border px-6 py-3 text-sm font-bold transition hover:bg-secondary"
                    >
                      Volver a la lección
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/progreso" })}
                      className="rounded-full border border-border px-6 py-3 text-sm font-bold transition hover:bg-secondary"
                    >
                      Ver mi progreso
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-base leading-relaxed">{result.diagnostic}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Intento {result.attempt}. No te damos la respuesta: vuelve al paso donde cambió el signo y
                    reescribe la expresión.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={retry}
                      className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110"
                    >
                      Intentar de nuevo
                    </button>
                    {!independentMode && assistance < maxAssistance ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAssistance((a) => a + 1);
                          retry();
                        }}
                        className="rounded-full border border-border px-6 py-3 text-sm font-bold transition hover:bg-secondary"
                      >
                        Subir un nivel de ayuda
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8">
              <label htmlFor="answer" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Tu respuesta
              </label>
              <input
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="x = 5"
                autoComplete="off"
                className="mt-2 w-full rounded-xl border border-input bg-background px-5 py-4 font-mono text-2xl font-bold outline-none focus:border-primary"
              />

              {exercise.ask_reasoning && mode !== "independent" ? (
                <fieldset className="mt-6">
                  <legend className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    ¿Por qué diste ese paso? (opcional, suma XP)
                  </legend>
                  <div className="mt-3 space-y-2">
                    {REASONING_OPTIONS.map((opt) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="reasoning"
                          value={opt}
                          checked={reasoning === opt}
                          onChange={(e) => setReasoning(e.target.value)}
                          className="size-4 accent-[oklch(0.7_0.201_45)]"
                        />
                        <span className="text-muted-foreground">{opt}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <button
                type="submit"
                disabled={busy || !answer.trim()}
                className="mt-8 w-full rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                {busy ? "Verificando…" : "Comprobar respuesta"}
              </button>
            </form>
          )}
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="rounded-3xl border border-border bg-card/50 p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lección</p>
          <p className="mt-1 text-sm font-bold">{lessonTitle}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Concepto</p>
          <p className="mt-1 text-sm text-muted-foreground">{exercise.concept}</p>

          <div className="mt-6 border-t border-border pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Escalera de asistencia
            </p>
            {independentMode ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Este reto es sin ayuda. La escalera está desactivada a propósito: aquí se mide tu desempeño
                independiente.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm font-bold text-primary">
                  Nivel {assistance} · {ASSISTANCE_LADDER[assistance] ?? "Máximo"}
                </p>
                <ol className="mt-4 space-y-3">
                  {hints.slice(0, assistance).map((hint, i) => (
                    <li key={i} className="rounded-xl border border-primary/20 bg-background/60 p-3 text-sm leading-relaxed">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                        Ayuda {i + 1}
                      </span>
                      <p className="mt-1 text-muted-foreground">{hint}</p>
                    </li>
                  ))}
                </ol>
                {assistance < maxAssistance ? (
                  <button
                    type="button"
                    onClick={() => setAssistance((a) => a + 1)}
                    className="mt-4 w-full rounded-xl border border-border px-4 py-3 text-sm font-bold transition hover:bg-secondary"
                  >
                    Pedir ayuda ({maxAssistance - assistance} restantes)
                  </button>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Llegaste al último nivel de ayuda. Nunca mostramos la respuesta final.
                  </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Menos ayuda equivale a más maestría. Los intentos con nivel 0 desbloquean logros de independencia.
                </p>
              </>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
            <div>
              <dt className="font-mono text-[9px] uppercase text-muted-foreground">Intentos</dt>
              <dd className="text-lg font-bold">{attempts}</dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase text-muted-foreground">Ayuda usada</dt>
              <dd className="text-lg font-bold">{assistance}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
