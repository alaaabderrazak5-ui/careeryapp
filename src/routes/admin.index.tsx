import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0, careers: 0 });
  useEffect(() => {
    (async () => {
      const [u, j, a, c] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("career_paths").select("id", { count: "exact", head: true }),
      ]);
      setStats({ users: u.count ?? 0, jobs: j.count ?? 0, applications: a.count ?? 0, careers: c.count ?? 0 });
    })();
  }, []);
  const items = [
    { k: "Users", v: stats.users },
    { k: "Jobs posted", v: stats.jobs },
    { k: "Applications", v: stats.applications },
    { k: "Career paths", v: stats.careers },
  ];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Admin overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage CAREERY content, users, and AI recommendations.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s) => (
          <div key={s.k} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.k}</p>
            <p className="mt-2 font-display text-3xl">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/admin/branding" className="rounded-2xl border border-border bg-card p-5 hover:bg-muted/40">
          <h3 className="font-semibold">Update logo & branding →</h3>
          <p className="mt-1 text-sm text-muted-foreground">Upload a PNG logo, edit site name and tagline.</p>
        </Link>
        <Link to="/admin/quiz" className="rounded-2xl border border-border bg-card p-5 hover:bg-muted/40">
          <h3 className="font-semibold">Edit career quiz →</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add multi-select questions, options and scoring categories.</p>
        </Link>
      </div>
    </div>
  );
}
