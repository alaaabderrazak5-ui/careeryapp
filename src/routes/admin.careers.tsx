import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/careers")({ component: CareersAdmin });

interface RoadmapStep { step: string; duration: string }
interface Career {
  id: string; slug: string; title: string; category: string | null; short_description: string | null; why_match: string | null;
  required_skills: string[]; certifications: string[]; future_opportunities: string[];
  roadmap: RoadmapStep[]; score_keywords: Record<string, number>; is_active: boolean; position: number;
}

const csv = (a?: string[] | null) => (a ?? []).join(", ");
const fromCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function CareersAdmin() {
  const [items, setItems] = useState<Career[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("career_paths").select("*").order("position");
    const list = ((data ?? []) as unknown as Career[]).map((c) => ({
      ...c,
      required_skills: c.required_skills ?? [], certifications: c.certifications ?? [], future_opportunities: c.future_opportunities ?? [],
      roadmap: Array.isArray(c.roadmap) ? c.roadmap : [], score_keywords: (c.score_keywords as Record<string, number>) ?? {},
    }));
    setItems(list);
    if (!activeId && list[0]) setActiveId(list[0].id);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Career>) => {
    const { error } = await supabase.from("career_paths").update(patch as never).eq("id", id);
    if (error) toast.error(error.message); else load();
  };
  const add = async () => {
    const slug = prompt("Slug (e.g. devops-engineer):"); if (!slug) return;
    const { error } = await supabase.from("career_paths").insert({ slug, title: slug.replace(/-/g, " "), is_active: true });
    if (error) toast.error(error.message); else load();
  };
  const del = async (id: string) => { if (!confirm("Delete career path?")) return; await supabase.from("career_paths").delete().eq("id", id); setActiveId(null); load(); };

  const active = items.find((c) => c.id === activeId);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Career recommendations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Editable career paths used by the rule-based recommendation engine.</p>
        </div>
        <button onClick={add} className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"><Plus className="h-4 w-4" /> Add career</button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-2 space-y-1">
          {items.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${activeId === c.id ? "bg-foreground text-background" : "hover:bg-muted"}`}>
              <div className="font-medium">{c.title}</div>
              <div className={`text-xs ${activeId === c.id ? "text-background/70" : "text-muted-foreground"}`}>{c.category}</div>
            </button>
          ))}
        </aside>

        {active && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label><span className="text-xs text-muted-foreground">Title</span>
                <input className="input mt-1 w-full" value={active.title} onChange={(e) => setItems(items.map((x) => x.id === active.id ? { ...x, title: e.target.value } : x))} onBlur={(e) => update(active.id, { title: e.target.value })} />
              </label>
              <label><span className="text-xs text-muted-foreground">Category</span>
                <input className="input mt-1 w-full" value={active.category ?? ""} onChange={(e) => setItems(items.map((x) => x.id === active.id ? { ...x, category: e.target.value } : x))} onBlur={(e) => update(active.id, { category: e.target.value })} />
              </label>
            </div>
            <label className="block"><span className="text-xs text-muted-foreground">Short description</span>
              <textarea className="input mt-1 w-full" rows={2} value={active.short_description ?? ""} onChange={(e) => setItems(items.map((x) => x.id === active.id ? { ...x, short_description: e.target.value } : x))} onBlur={(e) => update(active.id, { short_description: e.target.value })} />
            </label>
            <label className="block"><span className="text-xs text-muted-foreground">Why this career matches</span>
              <textarea className="input mt-1 w-full" rows={2} value={active.why_match ?? ""} onChange={(e) => setItems(items.map((x) => x.id === active.id ? { ...x, why_match: e.target.value } : x))} onBlur={(e) => update(active.id, { why_match: e.target.value })} />
            </label>
            <label className="block"><span className="text-xs text-muted-foreground">Required skills (comma separated)</span>
              <input className="input mt-1 w-full" defaultValue={csv(active.required_skills)} onBlur={(e) => update(active.id, { required_skills: fromCsv(e.target.value) })} />
            </label>
            <label className="block"><span className="text-xs text-muted-foreground">Certifications (comma separated)</span>
              <input className="input mt-1 w-full" defaultValue={csv(active.certifications)} onBlur={(e) => update(active.id, { certifications: fromCsv(e.target.value) })} />
            </label>
            <label className="block"><span className="text-xs text-muted-foreground">Future opportunities (comma separated)</span>
              <input className="input mt-1 w-full" defaultValue={csv(active.future_opportunities)} onBlur={(e) => update(active.id, { future_opportunities: fromCsv(e.target.value) })} />
            </label>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Roadmap (step + duration)</p>
              {active.roadmap.map((r, idx) => (
                <div key={idx} className="flex flex-wrap gap-2">
                  <input className="input flex-1" value={r.step} onChange={(e) => {
                    const next = [...active.roadmap]; next[idx] = { ...r, step: e.target.value };
                    setItems(items.map((x) => x.id === active.id ? { ...x, roadmap: next } : x));
                  }} onBlur={() => update(active.id, { roadmap: active.roadmap })} />
                  <input className="input w-40" value={r.duration} onChange={(e) => {
                    const next = [...active.roadmap]; next[idx] = { ...r, duration: e.target.value };
                    setItems(items.map((x) => x.id === active.id ? { ...x, roadmap: next } : x));
                  }} onBlur={() => update(active.id, { roadmap: active.roadmap })} />
                  <button onClick={() => update(active.id, { roadmap: active.roadmap.filter((_, i) => i !== idx) })} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <button onClick={() => update(active.id, { roadmap: [...active.roadmap, { step: "New step", duration: "1 month" }] })} className="text-xs font-medium text-primary hover:underline">+ Add step</button>
            </div>

            <label className="block"><span className="text-xs text-muted-foreground">Scoring keywords (JSON: option_value → weight)</span>
              <textarea className="input mt-1 w-full font-mono text-xs" rows={3} defaultValue={JSON.stringify(active.score_keywords, null, 2)} onBlur={(e) => {
                try { update(active.id, { score_keywords: JSON.parse(e.target.value) }); } catch { toast.error("Invalid JSON"); }
              }} />
            </label>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active.is_active} onChange={(e) => update(active.id, { is_active: e.target.checked })} /> Active</label>
              <button onClick={() => del(active.id)} className="text-sm text-destructive hover:underline">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
