import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { fetchIsAdmin } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administración — Algebrator" },
      { name: "description", content: "Gestiona lecciones, ejercicios y revisa métricas de aprendizaje." },
      { property: "og:title", content: "Administración — Algebrator" },
      { property: "og:description", content: "Panel de contenido y métricas de Algebrator." },
    ],
  }),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Métricas", exact: true },
  { to: "/admin/lecciones", label: "Lecciones", exact: false },
  { to: "/admin/ejercicios", label: "Ejercicios", exact: false },
] as const;

function AdminLayout() {
  const isAdmin = useQuery({ queryKey: ["is-admin"], queryFn: fetchIsAdmin });

  if (isAdmin.isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Verificando permisos…</p>
      </AppShell>
    );
  }

  if (!isAdmin.data) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-destructive/40 bg-card/50 p-8">
          <h1 className="text-2xl font-bold">Acceso restringido</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Esta sección es solo para administradores de contenido. Si crees que deberías tener acceso, pide que te
            asignen el rol de administrador.
          </p>
          <Link
            to="/panel"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Volver al panel
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Administración</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tighter">Contenido y métricas</h1>
      </header>

      <nav aria-label="Secciones de administración" className="mt-8 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.exact }}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground border-primary" }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-10">
        <Outlet />
      </div>
    </AppShell>
  );
}
