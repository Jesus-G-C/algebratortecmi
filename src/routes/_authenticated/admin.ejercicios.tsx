import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { fetchLessons } from "@/lib/data";
import { DIFFICULTY_LABEL } from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/admin/ejercicios")({
  component: AdminExercises,
});

type ExerciseRow = {
  id: string;
  lesson_id: string;
  title: string;
  problem: string;
  equation: string | null;
  answer: string;
  difficulty: string;
  xp: number;
  concept: string;
  hints: string[];
  diagnostic: string | null;
  transfer_problem: string | null;
  transfer_answer: string | null;
  ask_reasoning: boolean;
  independent: boolean;
  position: number;
};

const EMPTY = {
  lesson_id: "",
  title: "",
  problem: "",
  equation: "",
  answer: "",
  difficulty: "facil",
  xp: 10,
  concept: "",
  hints: "",
  diagnostic: "",
  transfer_problem: "",
  transfer_answer: "",
  ask_reasoning: false,
  independent: false,
  position: 1,
};

async function fetchExercises() {
  const { data, error } = await supabase.from("exercises").select("*").order("position");
  if (error) throw error;
  return data as ExerciseRow[];
}

function AdminExercises() {
  const queryClient = useQueryClient();
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: fetchLessons });
  const exercises = useQuery({ queryKey: ["admin-exercises"], queryFn: fetchExercises });
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");
  const [lessonFilter, setLessonFilter] = useState("");

  const visible = (exercises.data ?? []).filter(
    (e) =>
      (e.title + e.problem + e.concept).toLowerCase().includes(filter.toLowerCase()) &&
      (lessonFilter ? e.lesson_id === lessonFilter : true),
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.lesson_id) {
      toast.error("Selecciona la lección a la que pertenece el ejercicio.");
      return;
    }
    setBusy(true);
    const payload = {
      lesson_id: form.lesson_id,
      title: form.title,
      problem: form.problem,
      equation: form.equation || null,
      answer: form.answer,
      difficulty: form.difficulty,
      xp: Number(form.xp),
      concept: form.concept,
      hints: form.hints
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
      diagnostic: form.diagnostic || null,
      transfer_problem: form.transfer_problem || null,
      transfer_answer: form.transfer_answer || null,
      ask_reasoning: form.ask_reasoning,
      independent: form.independent,
      position: Number(form.position),
    };
    const res = editingId
      ? await supabase.from("exercises").update(payload).eq("id", editingId)
      : await supabase.from("exercises").insert(payload);
    setBusy(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editingId ? "Ejercicio actualizado." : "Ejercicio creado.");
    setForm(EMPTY);
    setEditingId(null);
    queryClient.invalidateQueries({ queryKey: ["admin-exercises"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("exercises").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar. Puede tener intentos registrados.");
      return;
    }
    toast.success("Ejercicio eliminado.");
    queryClient.invalidateQueries({ queryKey: ["admin-exercises"] });
  }

  const textField = (id: keyof typeof EMPTY, label: string, required = false) => (
    <div>
      <label htmlFor={id} className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        required={required}
        value={String(form[id])}
        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
      />
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <form onSubmit={save} className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-lg font-bold">{editingId ? "Editar ejercicio" : "Nuevo ejercicio"}</h2>

          <label htmlFor="lesson" className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Lección
          </label>
          <select
            id="lesson"
            value={form.lesson_id}
            onChange={(e) => setForm({ ...form, lesson_id: e.target.value })}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
          >
            <option value="">Selecciona una lección</option>
            {(lessons.data ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>

          {textField("title", "Título", true)}
          {textField("equation", "Ecuación mostrada")}
          {textField("answer", "Respuesta correcta", true)}
          {textField("concept", "Concepto", true)}

          <label htmlFor="problem" className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Enunciado
          </label>
          <textarea
            id="problem"
            rows={3}
            required
            value={form.problem}
            onChange={(e) => setForm({ ...form, problem: e.target.value })}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
          />

          <label htmlFor="hints" className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Escalera de ayuda (una por línea, sin revelar la respuesta)
          </label>
          <textarea
            id="hints"
            rows={5}
            value={form.hints}
            onChange={(e) => setForm({ ...form, hints: e.target.value })}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
          />

          <label
            htmlFor="diagnostic"
            className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            Retroalimentación diagnóstica al fallar
          </label>
          <textarea
            id="diagnostic"
            rows={3}
            value={form.diagnostic}
            onChange={(e) => setForm({ ...form, diagnostic: e.target.value })}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
          />

          {textField("transfer_problem", "Problema de transferencia")}
          {textField("transfer_answer", "Respuesta de transferencia")}

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="difficulty"
                className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                Dificultad
              </label>
              <select
                id="difficulty"
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
              >
                <option value="facil">Fácil</option>
                <option value="media">Media</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
            <div>
              <label htmlFor="xp" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                XP
              </label>
              <input
                id="xp"
                type="number"
                min={0}
                value={form.xp}
                onChange={(e) => setForm({ ...form, xp: Number(e.target.value) })}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.ask_reasoning}
                onChange={(e) => setForm({ ...form, ask_reasoning: e.target.checked })}
                className="size-4"
              />
              Pedir razonamiento
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.independent}
                onChange={(e) => setForm({ ...form, independent: e.target.checked })}
                className="size-4"
              />
              Reto independiente
            </label>
          </div>

          <label htmlFor="position" className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Orden en la lección
          </label>
          <input
            id="position"
            type="number"
            min={1}
            value={form.position}
            onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
          />

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Guardando…" : editingId ? "Guardar cambios" : "Crear ejercicio"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY);
                }}
                className="rounded-xl border border-border px-6 py-3 font-bold transition hover:bg-secondary"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="lg:col-span-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="q" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Buscar
            </label>
            <input
              id="q"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Título, enunciado o concepto"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="lf" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Filtrar por lección
            </label>
            <select
              id="lf"
              value={lessonFilter}
              onChange={(e) => setLessonFilter(e.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
            >
              <option value="">Todas las lecciones</option>
              {(lessons.data ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {visible.length} ejercicios
        </p>

        <div className="mt-3 space-y-3">
          {exercises.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando ejercicios…</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay ejercicios que coincidan.</p>
          ) : (
            visible.map((ex) => (
              <div key={ex.id} className="rounded-2xl border border-border bg-card/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {lessons.data?.find((l) => l.id === ex.lesson_id)?.title ?? "Lección"} ·{" "}
                      {DIFFICULTY_LABEL[ex.difficulty] ?? ex.difficulty} · {ex.xp} XP
                      {ex.independent ? " · sin ayuda" : ""}
                    </p>
                    <h3 className="mt-1 font-bold">{ex.title}</h3>
                    <p className="mt-1 font-mono text-sm text-primary">{ex.equation ?? ex.problem}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(ex.id);
                        setForm({
                          lesson_id: ex.lesson_id,
                          title: ex.title,
                          problem: ex.problem,
                          equation: ex.equation ?? "",
                          answer: ex.answer,
                          difficulty: ex.difficulty,
                          xp: ex.xp,
                          concept: ex.concept ?? "",
                          hints: (ex.hints ?? []).join("\n"),
                          diagnostic: ex.diagnostic ?? "",
                          transfer_problem: ex.transfer_problem ?? "",
                          transfer_answer: ex.transfer_answer ?? "",
                          ask_reasoning: ex.ask_reasoning,
                          independent: ex.independent,
                          position: ex.position,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-full border border-border px-4 py-2 text-xs font-bold transition hover:bg-secondary"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(ex.id)}
                      className="rounded-full border border-destructive/50 px-4 py-2 text-xs font-bold text-destructive transition hover:bg-destructive/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
