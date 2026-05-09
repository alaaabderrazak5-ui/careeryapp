import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/interests")({ component: InterestsPage });

export default function InterestsPage() {
  const { user } = useAuth();
  const [interests, setInterests] = useState<{ id: string; interest: string }[]>([]);
  const [goals, setGoals] = useState<{ id: string; goal: string; target_role: string | null; timeline: string | null }[]>([]);
  const [iv, setIv] = useState("");
  const [g, setG] = useState({ goal: "", target_role: "", timeline: "" });

  const load = async () => {
    if (!user) return;
    const [i, gs] = await Promise.all([
      supabase.from("user_interests").select("*").eq("user_id", user.id),
      supabase.from("career_goals").select("*").eq("user_id", user.id),
    ]);
    setInterests((i.data as any) ?? []); setGoals((gs.data as any) ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const addI = async () => {
    if (!user || !iv.trim()) return;
    const { error } = await supabase.from("user_interests").insert({ user_id: user.id, interest: iv.trim() });
    if (error) return toast.error(error.message);
    setIv(""); load();
  };
  const delI = async (id: string) => { await supabase.from("user_interests").delete().eq("id", id); load(); };

  const addG = async () => {
    if (!user || !g.goal.trim()) return;
    const { error } = await supabase.from("career_goals").insert({ user_id: user.id, ...g });
    if (error) return toast.error(error.message);
    setG({ goal: "", target_role: "", timeline: "" }); load();
  };
  const delG = async (id: string) => { await supabase.from("career_goals").delete().eq("id", id); load(); };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Interests</h1>
        <section className="mt-4 rounded-2xl border bg-card p-6">
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="e.g. Climate tech, gaming, fintech" value={iv} onChange={(e) => setIv(e.target.value)} />
            <button onClick={addI} className="btn-primary"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.length === 0 && <p className="text-sm text-muted-foreground">No interests yet.</p>}
            {interests.map(i => (
              <span key={i.id} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
                {i.interest}<button onClick={() => delI(i.id)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </section>
      </div>

      <div>
        <h2 className="font-display text-2xl">Career goals</h2>
        <section className="mt-4 grid gap-3 rounded-2xl border bg-card p-6 sm:grid-cols-3">
          <input className="input sm:col-span-3" placeholder="What's your goal?" value={g.goal} onChange={(e) => setG({ ...g, goal: e.target.value })} />
          <input className="input" placeholder="Target role" value={g.target_role} onChange={(e) => setG({ ...g, target_role: e.target.value })} />
          <input className="input" placeholder="Timeline (e.g. 12 months)" value={g.timeline} onChange={(e) => setG({ ...g, timeline: e.target.value })} />
          <button onClick={addG} className="btn-primary"><Plus className="h-4 w-4" /> Add</button>
        </section>
        <ul className="mt-4 space-y-2">
          {goals.map(x => (
            <li key={x.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <div><p className="font-medium">{x.goal}</p><p className="text-xs text-muted-foreground">{x.target_role} · {x.timeline}</p></div>
              <button onClick={() => delG(x.id)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
