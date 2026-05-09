import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/education")({ component: EducationPage });

type Edu = { id?: string; institution: string; degree: string | null; field: string | null; start_date: string | null; end_date: string | null; is_current: boolean; description: string | null };
const EMPTY: Edu = { institution: "", degree: "", field: "", start_date: "", end_date: "", is_current: false, description: "" };

export default function EducationPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Edu[]>([]);
  const [draft, setDraft] = useState<Edu>(EMPTY);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("education").select("*").eq("user_id", user.id).order("start_date", { ascending: false });
    setItems((data as any) ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !draft.institution) return toast.error("Institution required");
    const { error } = await supabase.from("education").insert({ ...draft, user_id: user.id, start_date: draft.start_date || null, end_date: draft.is_current ? null : draft.end_date || null });
    if (error) return toast.error(error.message);
    setDraft(EMPTY); load();
  };
  const del = async (id: string) => { await supabase.from("education").delete().eq("id", id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Education</h1>
      <section className="grid gap-3 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <input className="input" placeholder="Institution" value={draft.institution} onChange={(e) => setDraft({ ...draft, institution: e.target.value })} />
        <input className="input" placeholder="Degree" value={draft.degree ?? ""} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} />
        <input className="input" placeholder="Field of study" value={draft.field ?? ""} onChange={(e) => setDraft({ ...draft, field: e.target.value })} />
        <div />
        <input type="date" className="input" value={draft.start_date ?? ""} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} />
        <input type="date" className="input" disabled={draft.is_current} value={draft.end_date ?? ""} onChange={(e) => setDraft({ ...draft, end_date: e.target.value })} />
        <label className="col-span-2 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.is_current} onChange={(e) => setDraft({ ...draft, is_current: e.target.checked })} /> Currently studying
        </label>
        <textarea className="input col-span-2 min-h-[80px]" placeholder="Notes (GPA, honors, courses)…" value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <div className="col-span-2"><button onClick={add} className="btn-primary"><Plus className="h-4 w-4" /> Add</button></div>
      </section>

      <section className="space-y-3">
        {items.length === 0 ? <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No education entries yet.</p>
          : items.map(x => (
            <article key={x.id} className="flex items-start justify-between rounded-2xl border bg-card p-5">
              <div>
                <h3 className="font-display text-lg">{x.degree || "Degree"} {x.field && <span className="text-muted-foreground">· {x.field}</span>}</h3>
                <p className="text-sm">{x.institution}</p>
                <p className="text-xs text-muted-foreground">{x.start_date ?? ""} → {x.is_current ? "Present" : (x.end_date ?? "")}</p>
              </div>
              <button onClick={() => del(x.id!)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </article>
          ))}
      </section>
    </div>
  );
}
