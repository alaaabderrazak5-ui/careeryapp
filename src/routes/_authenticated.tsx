import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, LayoutDashboard, MessageSquareHeart, User, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = useNavigate();
  const { user, loading, activeRole, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Loading…</div>;
  }

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/advisor", label: "AI Advisor", icon: MessageSquareHeart },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2 px-6 py-6">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg">CAREERY</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="rounded-xl bg-secondary px-3 py-2 text-xs">
            <p className="font-semibold text-foreground">{user.email}</p>
            <p className="mt-0.5 text-muted-foreground capitalize">{role.replace("_", " ")}</p>
          </div>
          <button onClick={() => signOut()} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="lg:pl-64">
        <Outlet />
      </main>
    </div>
  );
}
