import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/experience")({ component: ExperiencePage });

type Exp = {
  id?: string; user_id?: string; title: string; company: string;
  location: string | null; work_mode: string | null;
  start_date: string | null; end_date: string | null; is_current: boolean; description: string | null;
};

const EMPTY: Exp = { title: "", company: "", location: "", work_mode: "onsite", start_date: "", end_date: "", is_current: false, description: "" };

export default function ExperiencePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Exp[]>([]);
  const [draft, setDraft] = useState<Exp>(EMPTY);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("experiences").select("*").eq("user_id", user.id).order("start_date", { ascending: false });
    setItems((data as any) ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !draft.title || !draft.company) return toast.error("Title and company required");
    const { error } = await supabase.from("experiences").insert({ ...draft, user_id: user.id, end_date: draft.is_current ? null : draft.end_date || null, start_date: draft.start_date || null });
    if (error) return toast.error(error.message);
    setDraft(EMPTY); load();
  };

  const del = async (id: string) => { await supabase.from("experiences").delete().eq("id", id); load(); };

  return (
    <div className="space-y-6">
      <header><h1 className="font-display text-3xl">Experience</h1></header>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 font-display text-lg">Add experience</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Role / title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input className="input" placeholder="Company" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
          <input className="input" placeholder="Location" value={draft.location ?? ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
          <select className="input" value={draft.work_mode ?? ""} onChange={(e) => setDraft({ ...draft, work_mode: e.target.value })}>
            <option value="onsite">On-site</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option>
          </select>
          <input type="date" className="input" value={draft.start_date ?? ""} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} />
          <input type="date" className="input" disabled={draft.is_current} value={draft.end_date ?? ""} onChange={(e) => setDraft({ ...draft, end_date: e.target.value })} />
          <label className="col-span-2 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.is_current} onChange={(e) => setDraft({ ...draft, is_current: e.target.checked })} /> I currently work here
          </label>
          <textarea className="input col-span-2 min-h-[100px]" placeholder="Description, achievements, technologies…" value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </div>
        <button onClick={add} className="btn-primary mt-4"><Plus className="h-4 w-4" /> Add</button>
      </section>

      <section className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No experiences yet.</p>
        ) : items.map(x => (
          <article key={x.id} className="flex items-start justify-between rounded-2xl border bg-card p-5">
            <div>
              <h3 className="font-display text-lg">{x.title} <span className="text-muted-foreground">· {x.company}</span></h3>
              <p className="text-xs text-muted-foreground">{x.start_date ?? ""} → {x.is_current ? "Present" : (x.end_date ?? "")} · {x.location} · {x.work_mode}</p>
              {x.description && <p className="mt-2 text-sm">{x.description}</p>}
            </div>
            <button onClick={() => del(x.id!)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </article>
        ))}
      </section>
    </div>
  );
}
