import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell, SectionTitle } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { fetchIsAdmin, fetchProfile, fetchProgress } from "@/lib/data";
import { levelInfo } from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Tu perfil — Algebrator" },
      { name: "description", content: "Tus datos de cuenta, tu nivel actual y el resumen de tu actividad." },
      { property: "og:title", content: "Tu perfil — Algebrator" },
      { property: "og:description", content: "Administra tu cuenta y revisa tu nivel." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const progress = useQuery({ queryKey: ["progress"], queryFn: fetchProgress });
  const isAdmin = useQuery({ queryKey: ["is-admin"], queryFn: fetchIsAdmin });
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile.data?.name) setName(profile.data.name);
  }, [profile.data?.name]);

  const info = levelInfo(profile.data?.xp ?? 0);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.data) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", profile.data.id);
    setBusy(false);
    if (error) {
      toast.error("No pudimos guardar tu nombre.");
      return;
    }
    toast.success("Perfil actualizado.");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  return (
    <AppShell>
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Cuenta</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tighter">Tu perfil</h1>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionTitle>Datos de la cuenta</SectionTitle>
          <form onSubmit={save} className="rounded-2xl border border-border bg-card/50 p-6">
            <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Nombre
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
            />

            <label
              htmlFor="email"
              className="mt-6 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              Correo
            </label>
            <input
              id="email"
              value={profile.data?.email ?? ""}
              readOnly
              className="mt-2 w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-muted-foreground"
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <SectionTitle>Resumen</SectionTitle>
          <dl className="space-y-3">
            {[
              { k: "Nivel", v: `${info.level} · ${info.name}` },
              { k: "XP", v: `${profile.data?.xp ?? 0}` },
              { k: "Racha", v: `${profile.data?.streak ?? 0} días` },
              { k: "Lecciones con progreso", v: `${progress.data?.length ?? 0}` },
              { k: "Rol", v: isAdmin.data ? "Administrador" : "Estudiante" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between rounded-xl border border-border bg-card/40 px-5 py-4">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{row.k}</dt>
                <dd className="text-sm font-bold">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </AppShell>
  );
}
