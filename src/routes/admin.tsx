import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Shield, LayoutDashboard, Image as ImageIcon, Menu, FileText, Users, ListChecks, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      // client guard handles role check; redirect anonymous users to /auth
    }
  },
});

type NavLink = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavLink[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/branding", label: "Logo & Branding", icon: ImageIcon },
  { to: "/admin/navigation", label: "Navigation", icon: Menu },
  { to: "/admin/content", label: "Pages & Content", icon: FileText },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/quiz", label: "Quiz Editor", icon: ListChecks },
  { to: "/admin/careers", label: "Career Recommendations", icon: Sparkles },
];

function AdminLayout() {
  const { user, hasRole, loading } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/auth";
    return null;
  }
  if (!hasRole("admin")) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="max-w-md text-center">
          <Shield className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-2xl">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account does not have the admin role.</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background">Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-[1400px] gap-6 p-4 md:p-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-60 flex-col rounded-2xl border border-border bg-card p-4 md:flex">
          <div className="mb-6 flex items-center gap-2 px-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display text-lg">Admin</span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = item.exact ? path === item.to : path.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
          <Link to="/" className="mt-auto rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-muted">← Back to site</Link>
        </aside>
        <main className="flex-1 min-w-0">
          <div className="md:hidden mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-muted">{item.label}</Link>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
