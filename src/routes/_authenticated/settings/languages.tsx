import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/languages")({ component: LanguagesPage });

type L = { id: string; language: string; proficiency: string | null };

export default function LanguagesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<L[]>([]);
  const [lang, setLang] = useState(""); const [prof, setProf] = useState("conversational");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_languages").select("*").eq("user_id", user.id);
    setItems((data as any) ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !lang.trim()) return;
    const { error } = await supabase.from("user_languages").insert({ user_id: user.id, language: lang.trim(), proficiency: prof });
    if (error) return toast.error(error.message);
    setLang(""); load();
  };
  const del = async (id: string) => { await supabase.from("user_languages").delete().eq("id", id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Languages</h1>
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap gap-2">
          <input className="input flex-1 min-w-[200px]" placeholder="Language" value={lang} onChange={(e) => setLang(e.target.value)} />
          <select className="input w-48" value={prof} onChange={(e) => setProf(e.target.value)}>
            <option value="basic">Basic</option><option value="conversational">Conversational</option>
            <option value="fluent">Fluent</option><option value="native">Native</option>
          </select>
          <button onClick={add} className="btn-primary"><Plus className="h-4 w-4" /> Add</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground">No languages yet.</p>}
          {items.map(l => (
            <span key={l.id} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
              {l.language} <em className="text-xs text-muted-foreground">{l.proficiency}</em>
              <button onClick={() => del(l.id)}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
