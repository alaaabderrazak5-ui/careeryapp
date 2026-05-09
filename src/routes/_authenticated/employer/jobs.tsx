import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employer/jobs")({ component: JobsAdmin });

const EMPTY = { title: "", description: "", location: "", work_mode: "remote", experience_level: "mid", salary_min: "", salary_max: "", salary_currency: "USD", status: "open" };

function JobsAdmin() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(EMPTY);

  const load = async () => {
    if (!user) return;
    const { data: c } = await supabase.from("companies").select("id").eq("owner_id", user.id).maybeSingle();
    if (!c) return;
    setCompanyId(c.id);
    const { data } = await supabase.from("jobs").select("*").eq("company_id", c.id).order("created_at", { ascending: false });
    setJobs(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const create = async () => {
    if (!user || !companyId) return toast.error("Create your company first");
    if (!draft.title || !draft.description) return toast.error("Title and description required");
    const payload = { ...draft, company_id: companyId, created_by: user.id,
      salary_min: draft.salary_min ? Number(draft.salary_min) : null,
      salary_max: draft.salary_max ? Number(draft.salary_max) : null };
    const { error } = await supabase.from("jobs").insert(payload);
    if (error) return toast.error(error.message);
    setDraft(EMPTY); load(); toast.success("Job posted");
  };

  const del = async (id: string) => { await supabase.from("jobs").delete().eq("id", id); load(); };
  const toggleStatus = async (j: any) => {
    await supabase.from("jobs").update({ status: j.status === "open" ? "archived" : "open" }).eq("id", j.id);
    load();
  };

  if (!companyId) return <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Create your company first.</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Jobs</h1>
      <section className="grid gap-3 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <input className="input sm:col-span-2" placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <textarea className="input sm:col-span-2 min-h-[140px]" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <input className="input" placeholder="Location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
        <select className="input" value={draft.work_mode} onChange={(e) => setDraft({ ...draft, work_mode: e.target.value })}>
          <option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
        </select>
        <select className="input" value={draft.experience_level} onChange={(e) => setDraft({ ...draft, experience_level: e.target.value })}>
          <option value="intern">Intern</option><option value="junior">Junior</option><option value="mid">Mid</option><option value="senior">Senior</option><option value="lead">Lead</option>
        </select>
        <select className="input" value={draft.salary_currency} onChange={(e) => setDraft({ ...draft, salary_currency: e.target.value })}>
          {["USD","EUR","GBP","MAD","AED","CAD"].map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="number" className="input" placeholder="Salary min" value={draft.salary_min} onChange={(e) => setDraft({ ...draft, salary_min: e.target.value })} />
        <input type="number" className="input" placeholder="Salary max" value={draft.salary_max} onChange={(e) => setDraft({ ...draft, salary_max: e.target.value })} />
        <div className="sm:col-span-2"><button onClick={create} className="btn-primary"><Plus className="h-4 w-4" /> Post job</button></div>
      </section>

      <section className="space-y-3">
        {jobs.length === 0 ? <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No jobs yet.</p>
         : jobs.map(j => (
          <article key={j.id} className="flex items-center justify-between rounded-2xl border bg-card p-5">
            <div>
              <h3 className="font-display text-lg">{j.title}</h3>
              <p className="text-xs text-muted-foreground">{j.work_mode} · {j.location} · <span className="capitalize">{j.status}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleStatus(j)} className="btn-ghost">{j.status === "open" ? "Archive" : "Reopen"}</button>
              <button onClick={() => del(j.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
