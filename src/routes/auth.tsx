import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Search = { modo?: "registro" | "acceso" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    modo: search["modo"] === "registro" ? "registro" : "acceso",
  }),
  head: () => ({
    meta: [
      { title: "Entrar o registrarte — Algebrator" },
      { name: "description", content: "Accede a tu ruta de álgebra, tu progreso y tus retos independientes." },
      { property: "og:title", content: "Entrar o registrarte — Algebrator" },
      { property: "og:description", content: "Accede a tu ruta de álgebra y continúa donde te quedaste." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(modo === "registro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/panel" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name }, emailRedirectTo: `${window.location.origin}/panel` },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/panel" });
        } else {
          toast.success("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.");
          setIsRegister(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/panel" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos completar la operación.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("No pudimos iniciar sesión con Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/panel" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-12 math-grid">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary font-mono font-bold text-primary-foreground">
            ax
          </span>
          <span className="font-bold tracking-tight">ALGEBRATOR</span>
        </Link>

        <div className="rounded-3xl border border-border bg-card/80 p-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {isRegister ? "Crea tu cuenta" : "Entra a tu ruta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister
              ? "Tu progreso, tu nivel de asistencia y tu desempeño independiente quedan guardados."
              : "Continúa donde te quedaste en tu ruta de álgebra."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isRegister ? (
              <div>
                <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Nombre
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary"
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Correo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Procesando…" : isRegister ? "Crear cuenta" : "Entrar"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-3 w-full rounded-xl border border-border px-6 py-3.5 font-bold transition hover:bg-secondary"
          >
            Continuar con Google
          </button>

          <button
            type="button"
            onClick={() => setIsRegister((v) => !v)}
            className="mt-6 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {isRegister ? "Ya tengo cuenta, quiero entrar" : "No tengo cuenta, quiero registrarme"}
          </button>
        </div>
      </div>
    </div>
  );
}
