import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/skills")({ component: SkillsPage });

type Skill = { id: string; name: string; slug: string; category_id: string | null };
type UserSkill = { id: string; skill_id: string; level: number; years: number | null; skill?: Skill };

export default function SkillsPage() {
  const { user } = useAuth();
  const [mine, setMine] = useState<UserSkill[]>([]);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_skills").select("id, skill_id, level, years, skill:skills(id,name,slug,category_id)").eq("user_id", user.id);
    setMine((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [user]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from("skills").select("id,name,slug,category_id").ilike("name", `%${q}%`).limit(8);
      setResults((data as any) ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const add = async (s: Skill) => {
    if (!user || mine.some(m => m.skill_id === s.id)) return;
    const { error } = await supabase.from("user_skills").insert({ user_id: user.id, skill_id: s.id, level: 3 });
    if (error) return toast.error(error.message);
    setQ(""); setResults([]); refresh();
  };

  const suggest = async () => {
    if (!user || !q.trim()) return;
    const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { data, error } = await supabase.from("skills").insert({ name: q.trim(), slug, is_custom: true, is_approved: false, created_by: user.id }).select().single();
    if (error) return toast.error(error.message);
    await add(data as Skill);
    toast.success("Skill suggested and added");
  };

  const remove = async (id: string) => {
    await supabase.from("user_skills").delete().eq("id", id);
    refresh();
  };

  const setLevel = async (id: string, level: number) => {
    await supabase.from("user_skills").update({ level }).eq("id", id);
    setMine(m => m.map(x => x.id === id ? { ...x, level } : x));
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Skills</h1>
        <p className="text-sm text-muted-foreground">Search the global library or suggest a custom skill. Set proficiency 1–5.</p>
      </header>

      <section className="rounded-2xl border bg-card p-6">
        <div className="relative">
          <input className="input" placeholder="Search skills (e.g. React, Figma, SQL…)" value={q} onChange={(e) => setQ(e.target.value)} />
          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border bg-card shadow-elegant">
              {results.map(r => (
                <button key={r.id} onClick={() => add(r)} className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-secondary">
                  <span>{r.name}</span><Plus className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
        </div>
        {q.trim() && results.length === 0 && (
          <button onClick={suggest} className="mt-2 text-sm underline">Add "{q}" as a new skill</button>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="font-display text-lg">Your skills ({mine.length})</h2>
        {mine.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No skills yet. Search above to add some.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {mine.map(us => (
              <li key={us.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                <span className="font-medium">{us.skill?.name}</span>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setLevel(us.id, n)} className={`h-6 w-6 rounded-full text-xs ${n <= us.level ? "bg-foreground text-background" : "border"}`}>{n}</button>
                  ))}
                  <button onClick={() => remove(us.id)} className="ml-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
