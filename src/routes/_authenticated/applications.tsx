import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, Bookmark } from "lucide-react";

export const Route = createFileRoute("/_authenticated/applications")({ component: ApplicationsPage });

function ApplicationsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [tab, setTab] = useState<"applied" | "saved">("applied");

  useEffect(() => {
    if (!user) return;
    supabase.from("applications").select("*, job:jobs(id,title,company:companies(name,logo_url))").eq("user_id", user.id).order("applied_at", { ascending: false })
      .then(({ data }) => setApps(data ?? []));
    supabase.from("saved_jobs").select("*, job:jobs(id,title,company:companies(name,logo_url))").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setSaved(data ?? []));
  }, [user]);

  const list = tab === "applied" ? apps : saved;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-4xl">My applications</h1>
      <div className="mt-6 inline-flex rounded-full border bg-card p-1">
        {(["applied","saved"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-foreground text-background" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            {tab === "applied" ? <Briefcase className="mx-auto h-10 w-10 text-muted-foreground" /> : <Bookmark className="mx-auto h-10 w-10 text-muted-foreground" />}
            <p className="mt-3 font-medium">Nothing here yet</p>
            <Link to="/jobs" className="mt-3 inline-block text-sm underline">Browse jobs</Link>
          </div>
        ) : list.map((x: any) => (
          <Link key={x.id} to="/jobs/$jobId" params={{ jobId: x.job?.id ?? x.job_id }} className="flex items-center justify-between rounded-2xl border bg-card p-5 hover:shadow-elegant">
            <div>
              <h3 className="font-display text-lg">{x.job?.title ?? "Job"}</h3>
              <p className="text-sm text-muted-foreground">{x.job?.company?.name}</p>
            </div>
            {tab === "applied" && <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{x.status}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
