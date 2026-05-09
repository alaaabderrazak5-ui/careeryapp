import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/certifications")({ component: CertsPage });

type C = { id?: string; name: string; issuer: string | null; issued_at: string | null; expires_at: string | null; credential_url: string | null };
const EMPTY: C = { name: "", issuer: "", issued_at: "", expires_at: "", credential_url: "" };

export default function CertsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<C[]>([]);
  const [draft, setDraft] = useState<C>(EMPTY);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("certifications").select("*").eq("user_id", user.id).order("issued_at", { ascending: false });
    setItems((data as any) ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !draft.name) return toast.error("Name required");
    const { error } = await supabase.from("certifications").insert({ ...draft, user_id: user.id, issued_at: draft.issued_at || null, expires_at: draft.expires_at || null });
    if (error) return toast.error(error.message);
    setDraft(EMPTY); load();
  };
  const del = async (id: string) => { await supabase.from("certifications").delete().eq("id", id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Certifications</h1>
      <section className="grid gap-3 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <input className="input" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input className="input" placeholder="Issuer" value={draft.issuer ?? ""} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} />
        <input type="date" className="input" value={draft.issued_at ?? ""} onChange={(e) => setDraft({ ...draft, issued_at: e.target.value })} />
        <input type="date" className="input" value={draft.expires_at ?? ""} onChange={(e) => setDraft({ ...draft, expires_at: e.target.value })} />
        <input className="input col-span-2" placeholder="Credential URL" value={draft.credential_url ?? ""} onChange={(e) => setDraft({ ...draft, credential_url: e.target.value })} />
        <div className="col-span-2"><button onClick={add} className="btn-primary"><Plus className="h-4 w-4" /> Add</button></div>
      </section>
      <section className="space-y-3">
        {items.length === 0 ? <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No certifications yet.</p>
          : items.map(x => (
            <article key={x.id} className="flex items-center justify-between rounded-2xl border bg-card p-5">
              <div>
                <p className="font-medium">{x.name}</p>
                <p className="text-xs text-muted-foreground">{x.issuer} · {x.issued_at ?? "—"}</p>
              </div>
              <div className="flex items-center gap-3">
                {x.credential_url && <a href={x.credential_url} target="_blank" rel="noreferrer" className="text-sm underline">View</a>}
                <button onClick={() => del(x.id!)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}
