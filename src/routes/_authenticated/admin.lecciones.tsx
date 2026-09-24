import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { fetchCourses, fetchLessons } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/admin/lecciones")({
  component: AdminLessons,
});

const EMPTY = { course_id: "", title: "", description: "", concept: "", position: 1 };

function AdminLessons() {
  const queryClient = useQueryClient();
  const courses = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: fetchLessons });
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const visible = (lessons.data ?? []).filter((l) =>
    (l.title + l.concept).toLowerCase().includes(filter.toLowerCase()),
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.course_id) {
      toast.error("Selecciona una ruta para la lección.");
      return;
    }
    setBusy(true);
    const payload = { ...form, position: Number(form.position) };
    const res = editingId
      ? await supabase.from("lessons").update(payload).eq("id", editingId)
      : await supabase.from("lessons").insert(payload);
    setBusy(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editingId ? "Lección actualizada." : "Lección creada.");
    setForm(EMPTY);
    setEditingId(null);
    queryClient.invalidateQueries({ queryKey: ["lessons"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar. Puede tener ejercicios asociados.");
      return;
    }
    toast.success("Lección eliminada.");
    queryClient.invalidateQueries({ queryKey: ["lessons"] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <form onSubmit={save} className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-lg font-bold">{editingId ? "Editar lección" : "Nueva lección"}</h2>

          <label htmlFor="course" className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Ruta
          </label>
          <select
            id="course"
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
          >
            <option value="">Selecciona una ruta</option>
            {(courses.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {[
            { id: "title", label: "Título", key: "title" as const },
            { id: "concept", label: "Concepto central", key: "concept" as const },
          ].map((f) => (
            <div key={f.id}>
              <label
                htmlFor={f.id}
                className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                {f.label}
              </label>
              <input
                id={f.id}
                required
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </div>
          ))}

          <label
            htmlFor="description"
            className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
          />

          <label
            htmlFor="position"
            className="mt-5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            Orden en la ruta
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
              {busy ? "Guardando…" : editingId ? "Guardar cambios" : "Crear lección"}
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
        <label htmlFor="filter" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Buscar lecciones
        </label>
        <input
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Título o concepto"
          className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
        />

        <div className="mt-5 space-y-3">
          {lessons.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando lecciones…</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay lecciones que coincidan con la búsqueda.</p>
          ) : (
            visible.map((l) => (
              <div key={l.id} className="rounded-2xl border border-border bg-card/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {courses.data?.find((c) => c.id === l.course_id)?.title ?? "Ruta"} · orden {l.position}
                    </p>
                    <h3 className="mt-1 font-bold">{l.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{l.concept}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(l.id);
                        setForm({
                          course_id: l.course_id,
                          title: l.title,
                          description: l.description ?? "",
                          concept: l.concept ?? "",
                          position: l.position,
                        });
                      }}
                      className="rounded-full border border-border px-4 py-2 text-xs font-bold transition hover:bg-secondary"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(l.id)}
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
