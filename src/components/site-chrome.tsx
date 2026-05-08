import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-full glass px-4 py-2 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg tracking-tight">CAREERY</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="/#features" className="transition hover:text-foreground">Features</a>
          <a href="/#how" className="transition hover:text-foreground">How it works</a>
          <a href="/#stats" className="transition hover:text-foreground">Impact</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary">Dashboard</Link>
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
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">About</a>
          <a href="#" className="hover:text-foreground">Contact</a>
          <a href="#" className="hover:text-foreground">FAQ</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CAREERY</p>
      </div>
    </footer>
  );
}
