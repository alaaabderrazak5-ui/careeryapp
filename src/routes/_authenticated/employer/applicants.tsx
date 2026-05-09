import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employer/applicants")({ component: ApplicantsPage });

function ApplicantsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const { data: c } = await supabase.from("companies").select("id").eq("owner_id", user.id).maybeSingle();
    if (!c) return setApps([]);
    const { data: jobs } = await supabase.from("jobs").select("id,title").eq("company_id", c.id);
    const ids = (jobs ?? []).map(j => j.id);
    if (!ids.length) return setApps([]);
    const { data } = await supabase.from("applications")
      .select("id,status,applied_at,cover_letter,cv_url,user_id,job_id,profile:profiles(full_name,headline,avatar_url),job:jobs(title)")
      .in("job_id", ids).order("applied_at", { ascending: false });
    setApps(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("application_events").insert({ application_id: id, actor_id: user?.id, event_type: status });
    load();
  };

  if (apps.length === 0) return (
    <div className="rounded-2xl border border-dashed p-12 text-center">
      <Users className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-3 font-medium">No applicants yet</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <h1 className="font-display text-4xl">Applicants</h1>
      {apps.map(a => (
        <article key={a.id} className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-display">
              {a.profile?.avatar_url ? <img src={a.profile.avatar_url} className="h-full w-full object-cover" /> : (a.profile?.full_name?.[0] ?? "?")}
            </div>
            <div>
              <p className="font-medium">{a.profile?.full_name ?? "Candidate"}</p>
              <p className="text-xs text-muted-foreground">{a.profile?.headline} · applied to {a.job?.title}</p>
              {a.cover_letter && <p className="mt-2 max-w-prose text-sm">{a.cover_letter}</p>}
              {a.cv_url && <a href={a.cv_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs underline">View CV</a>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{a.status}</span>
            <select className="input w-40" value={a.status} onChange={(e) => setStatus(a.id, e.target.value)}>
              {["submitted","reviewed","shortlisted","interview","offer","rejected"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </article>
      ))}
    </div>
  );
}
