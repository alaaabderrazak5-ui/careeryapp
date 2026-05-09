import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, X, FileText, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/portfolio")({ component: PortfolioPage });

type Link = { id: string; label: string; url: string; link_type: string | null };

export default function PortfolioPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [draft, setDraft] = useState({ label: "", url: "", link_type: "website" });
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!user) return;
    const [l, p] = await Promise.all([
      supabase.from("portfolio_links").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("cv_url").eq("id", user.id).maybeSingle(),
    ]);
    setLinks((l.data as any) ?? []); setCvUrl(p.data?.cv_url ?? null);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !draft.url || !draft.label) return;
    const { error } = await supabase.from("portfolio_links").insert({ user_id: user.id, ...draft });
    if (error) return toast.error(error.message);
    setDraft({ label: "", url: "", link_type: "website" }); load();
  };
  const del = async (id: string) => { await supabase.from("portfolio_links").delete().eq("id", id); load(); };

  const onCv = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("cvs").upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data: signed } = await supabase.storage.from("cvs").createSignedUrl(path, 60 * 60 * 24 * 365);
    const url = signed?.signedUrl ?? path;
    await supabase.from("profiles").update({ cv_url: url }).eq("id", user.id);
    setCvUrl(url); setUploading(false); toast.success("CV uploaded");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Portfolio links</h1>
        <section className="mt-4 grid gap-3 rounded-2xl border bg-card p-6 sm:grid-cols-3">
          <input className="input" placeholder="Label (e.g. GitHub)" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          <input className="input" placeholder="https://" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
          <select className="input" value={draft.link_type} onChange={(e) => setDraft({ ...draft, link_type: e.target.value })}>
            {["website","github","linkedin","dribbble","behance","other"].map(t => <option key={t}>{t}</option>)}
          </select>
          <button onClick={add} className="btn-primary sm:col-span-3 w-fit"><Plus className="h-4 w-4" /> Add link</button>
        </section>
        <ul className="mt-4 space-y-2">
          {links.length === 0 && <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No links yet.</p>}
          {links.map(l => (
            <li key={l.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <div>
                <p className="font-medium">{l.label} <span className="text-xs text-muted-foreground">· {l.link_type}</span></p>
                <a href={l.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground underline">{l.url}</a>
              </div>
              <button onClick={() => del(l.id)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-display text-2xl">Resume / CV</h2>
        <section className="mt-4 flex items-center justify-between rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-muted-foreground" />
            {cvUrl ? <a href={cvUrl} target="_blank" rel="noreferrer" className="text-sm underline">View current CV</a>
                   : <p className="text-sm text-muted-foreground">No CV uploaded</p>}
          </div>
          <label className="btn-ghost cursor-pointer">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload PDF"}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && onCv(e.target.files[0])} />
          </label>
        </section>
      </div>
    </div>
  );
}
