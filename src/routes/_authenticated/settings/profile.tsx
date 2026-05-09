import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/profile")({
  component: ProfileBasics,
  head: () => ({ meta: [{ title: "Profile basics — CAREERY" }] }),
});

type Profile = {
  full_name: string | null; headline: string | null; bio: string | null; location: string | null;
  remote_preference: string | null; salary_min: number | null; salary_max: number | null;
  salary_currency: string | null; avatar_url: string | null; cv_url: string | null;
  onboarded: boolean; completion_pct: number;
};

const EMPTY: Profile = {
  full_name: "", headline: "", bio: "", location: "", remote_preference: "any",
  salary_min: null, salary_max: null, salary_currency: "USD",
  avatar_url: null, cv_url: null, onboarded: false, completion_pct: 0,
};

export default function ProfileBasics() {
  const { user } = useAuth();
  const [p, setP] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) setP({ ...EMPTY, ...data });
      setLoading(false);
    })();
  }, [user]);

  const upd = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((s) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const completion = computeCompletion(p);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, full_name: p.full_name, headline: p.headline, bio: p.bio, location: p.location,
      remote_preference: p.remote_preference, salary_min: p.salary_min, salary_max: p.salary_max,
      salary_currency: p.salary_currency, onboarded: true, completion_pct: completion,
    });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  const onAvatar = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
    setP((s) => ({ ...s, avatar_url: data.publicUrl }));
    toast.success("Avatar updated");
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Profile basics</h1>
        <p className="text-sm text-muted-foreground">This information powers AI matching and your public profile.</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-foreground transition-all" style={{ width: `${computeCompletion(p)}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{computeCompletion(p)}% complete</p>
      </header>

      <section className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-secondary text-2xl font-display">
            {p.avatar_url ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover" /> : (p.full_name?.[0]?.toUpperCase() ?? "?")}
          </div>
          <label className="cursor-pointer rounded-full border px-4 py-2 text-sm hover:bg-secondary">
            Upload avatar
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])} />
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <Field label="Full name"><input className="input" value={p.full_name ?? ""} onChange={(e) => upd("full_name", e.target.value)} /></Field>
        <Field label="Headline"><input className="input" value={p.headline ?? ""} onChange={(e) => upd("headline", e.target.value)} placeholder="e.g. Frontend engineer" /></Field>
        <Field label="Location"><input className="input" value={p.location ?? ""} onChange={(e) => upd("location", e.target.value)} /></Field>
        <Field label="Remote preference">
          <select className="input" value={p.remote_preference ?? "any"} onChange={(e) => upd("remote_preference", e.target.value)}>
            <option value="any">Any</option><option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
          </select>
        </Field>
        <Field label="Salary min"><input type="number" className="input" value={p.salary_min ?? ""} onChange={(e) => upd("salary_min", e.target.value ? Number(e.target.value) : null)} /></Field>
        <Field label="Salary max"><input type="number" className="input" value={p.salary_max ?? ""} onChange={(e) => upd("salary_max", e.target.value ? Number(e.target.value) : null)} /></Field>
        <Field label="Currency">
          <select className="input" value={p.salary_currency ?? "USD"} onChange={(e) => upd("salary_currency", e.target.value)}>
            {["USD","EUR","GBP","MAD","AED","CAD"].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Bio" full>
          <textarea className="input min-h-[120px]" value={p.bio ?? ""} onChange={(e) => upd("bio", e.target.value)} />
        </Field>
      </section>

      <button onClick={save} disabled={saving} className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50">
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function computeCompletion(p: Profile) {
  const fields = [p.full_name, p.headline, p.bio, p.location, p.remote_preference, p.salary_min, p.avatar_url];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}
