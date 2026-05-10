import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/admin/quiz")({ component: QuizAdmin });

interface Option { value: string; label: string }
interface Question { id: string; position: number; question: string; helper: string | null; category: string | null; is_multiselect: boolean; options: Option[]; is_active: boolean }

function QuizAdmin() {
  const [qs, setQs] = useState<Question[]>([]);

  const load = async () => {
    const { data } = await supabase.from("quiz_questions").select("*").order("position");
    setQs(((data ?? []) as unknown as Question[]).map((q) => ({ ...q, options: Array.isArray(q.options) ? q.options : [] })));
  };
  useEffect(() => { load(); }, []);

  const addQ = async () => {
    const max = qs.reduce((m, q) => Math.max(m, q.position), -1);
    await supabase.from("quiz_questions").insert({ position: max + 1, question: "New question", is_multiselect: true, options: [] });
    load();
  };
  const update = async (id: string, patch: Partial<Question>) => {
    await supabase.from("quiz_questions").update(patch as never).eq("id", id);
    load();
  };
  const del = async (id: string) => { if (!confirm("Delete this question?")) return; await supabase.from("quiz_questions").delete().eq("id", id); load(); };
  const move = async (i: number, dir: -1 | 1) => {
    const a = qs[i]; const b = qs[i + dir]; if (!a || !b) return;
    await Promise.all([
      supabase.from("quiz_questions").update({ position: b.position }).eq("id", a.id),
      supabase.from("quiz_questions").update({ position: a.position }).eq("id", b.id),
    ]);
    load();
  };

  const setOption = (q: Question, idx: number, patch: Partial<Option>) => {
    const opts = q.options.map((o, i) => i === idx ? { ...o, ...patch } : o);
    return update(q.id, { options: opts });
  };
  const addOption = (q: Question) => update(q.id, { options: [...q.options, { value: `opt_${q.options.length + 1}`, label: "New option" }] });
  const removeOption = (q: Question, idx: number) => update(q.id, { options: q.options.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Quiz editor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit the CAREERY quiz. Option <code>value</code> matches keys in career path scoring.</p>
        </div>
        <button onClick={addQ} className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"><Plus className="h-4 w-4" /> Add question</button>
      </header>

      <div className="space-y-4">
        {qs.length === 0 && <p className="text-sm text-muted-foreground">No questions yet.</p>}
        {qs.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">#{i + 1}</span>
              <input className="input flex-1" value={q.question} onChange={(e) => setQs(qs.map((x) => x.id === q.id ? { ...x, question: e.target.value } : x))} onBlur={(e) => update(q.id, { question: e.target.value })} />
              <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1.5 hover:bg-muted disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button onClick={() => move(i, 1)} disabled={i === qs.length - 1} className="rounded p-1.5 hover:bg-muted disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              <button onClick={() => del(q.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input className="input" placeholder="Category (e.g. interests)" value={q.category ?? ""} onChange={(e) => setQs(qs.map((x) => x.id === q.id ? { ...x, category: e.target.value } : x))} onBlur={(e) => update(q.id, { category: e.target.value })} />
              <input className="input" placeholder="Helper text (optional)" value={q.helper ?? ""} onChange={(e) => setQs(qs.map((x) => x.id === q.id ? { ...x, helper: e.target.value } : x))} onBlur={(e) => update(q.id, { helper: e.target.value })} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={q.is_multiselect} onChange={(e) => update(q.id, { is_multiselect: e.target.checked })} /> Multi-select</label>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Options</p>
              {q.options.map((o, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2">
                  <input className="input w-40" placeholder="value" value={o.value} onChange={(e) => setOption(q, idx, { value: e.target.value })} />
                  <input className="input flex-1" placeholder="Label shown to user" value={o.label} onChange={(e) => setOption(q, idx, { label: e.target.value })} />
                  <button onClick={() => removeOption(q, idx)} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <button onClick={() => addOption(q)} className="text-xs font-medium text-primary hover:underline">+ Add option</button>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={q.is_active} onChange={(e) => update(q.id, { is_active: e.target.checked })} /> Active (shown in quiz)</label>
          </div>
        ))}
      </div>
    </div>
  );
}
