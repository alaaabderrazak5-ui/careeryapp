import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Menu as MenuIcon, X, Shield } from "lucide-react";
import { RoleSwitcher } from "@/components/role-switcher";

interface NavItem { id: string; label: string; url: string }
interface Branding { site_name: string; tagline: string; logo_url: string | null }

export function SiteHeader() {
  const { user, signOut, hasRole } = useAuth();
  const [nav, setNav] = useState<NavItem[]>([]);
  const [brand, setBrand] = useState<Branding>({ site_name: "CAREERY", tagline: "", logo_url: null });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: n }, { data: b }] = await Promise.all([
        supabase.from("cms_navigation").select("id, label, url").eq("location", "navbar").eq("is_visible", true).order("position"),
        supabase.from("cms_settings").select("value").eq("key", "branding").maybeSingle(),
      ]);
      if (n?.length) setNav(n as NavItem[]);
      else setNav([{ id: "h", label: "Home", url: "/" }, { id: "j", label: "Jobs", url: "/jobs" }]);
      if (b?.value) setBrand({ site_name: "CAREERY", tagline: "", logo_url: null, ...(b.value as object) } as Branding);
    })();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-full glass px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} className="rounded-full p-2 hover:bg-secondary md:hidden" aria-label="Open menu"><MenuIcon className="h-5 w-5" /></button>
            <Link to="/" className="flex items-center gap-2">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.site_name} className="h-9 w-9 rounded-xl object-contain" />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-glow">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <span className="font-display text-lg tracking-tight">{brand.site_name}</span>
            </Link>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {nav.map((n) => (<Link key={n.id} to={n.url} className="transition hover:text-foreground">{n.label}</Link>))}
            {user && hasRole("admin") && <Link to="/admin" className="inline-flex items-center gap-1 text-foreground"><Shield className="h-3.5 w-3.5" /> Admin</Link>}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <RoleSwitcher />
                <button onClick={() => signOut()} className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary sm:inline-flex">Sign in</Link>
                <Link to="/auth" search={{ mode: "signup" }} className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile slide-in sidebar */}
      <div className={`fixed inset-0 z-[60] md:hidden ${open ? "" : "pointer-events-none"}`}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute left-0 top-0 h-full w-72 bg-background shadow-xl transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-border p-4">
            <span className="font-display text-lg">{brand.site_name}</span>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary"><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex flex-col p-3">
            {nav.map((n) => (<Link key={n.id} to={n.url} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">{n.label}</Link>))}
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">Dashboard</Link>
                <Link to="/quiz" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">Career quiz</Link>
                <Link to="/settings/profile" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">Settings</Link>
                {hasRole("admin") && <Link to="/admin" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-primary hover:bg-muted">Admin panel</Link>}
              </>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-2xl">CAREERY</p>
          <p className="mt-1 text-sm text-muted-foreground">AI-powered career & recruitment ecosystem</p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CAREERY</p>
      </div>
    </footer>
  );
}
