import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — CAREERY" }] }),
});

function ProfilePage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", headline: "", bio: "", location: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({
        full_name: data.full_name ?? "",
        headline: data.headline ?? "",
        bio: data.bio ?? "",
        location: data.location ?? "",
      });
      setLoading(false);
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{role?.replace("_", " ")}</p>
      <h1 className="mt-2 text-4xl">Your profile</h1>
      <p className="mt-1 text-muted-foreground">This information powers your AI matches.</p>

      <form onSubmit={save} className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <Field label="Full name"><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={120} /></Field>
        <Field label="Headline"><input className="input" placeholder="e.g. Junior Frontend Developer" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} maxLength={160} /></Field>
        <Field label="Location"><input className="input" placeholder="Paris, France" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={120} /></Field>
        <Field label="Bio"><textarea className="input min-h-32" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={1000} /></Field>
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
        </button>
      </form>

      <style>{`.input{width:100%;border-radius:0.75rem;border:1px solid var(--input);background:var(--background);padding:0.7rem 1rem;font-size:0.9rem;outline:none;transition:all .15s}.input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold">{label}</span>{children}</label>;
}
