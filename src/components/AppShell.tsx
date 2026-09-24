import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { fetchIsAdmin, fetchProfile } from "@/lib/data";
import { levelInfo } from "@/lib/learning";

const NAV = [
  { to: "/panel", label: "Panel" },
  { to: "/progreso", label: "Progreso" },
  { to: "/logros", label: "Logros" },
  { to: "/perfil", label: "Perfil" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const { data: isAdmin } = useQuery({ queryKey: ["is-admin"], queryFn: fetchIsAdmin });
  const info = levelInfo(profile?.xp ?? 0);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background math-grid">
      <div aria-hidden className="pointer-events-none absolute left-12 top-0 h-full w-px bg-primary/20 axis-line" />

      <header className="relative z-20 border-b border-border/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <Link to="/panel" className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary font-mono text-lg font-bold text-primary-foreground glow-primary">
              ax
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">ALGEBRATOR</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                construir capacidad · reducir ayuda
              </span>
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                to="/admin"
                className="rounded-full px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
                activeProps={{ className: "bg-secondary" }}
              >
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden flex-col items-end sm:flex">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {info.name}
              </span>
              <span className="text-sm font-bold text-accent">{profile?.xp ?? 0} XP</span>
            </div>
            <div className="hidden flex-col items-end sm:flex">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Racha</span>
              <span className="text-sm font-bold">{profile?.streak ?? 0} días</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.navigate({ to: "/auth" });
              }}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-10">{children}</main>
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-6">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{children}</h2>
      <div className="h-px flex-1 bg-border" />
      {aside}
    </div>
  );
}
