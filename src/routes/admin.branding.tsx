import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/branding")({ component: BrandingAdmin });

interface Branding { site_name: string; tagline: string; logo_url: string | null }

function BrandingAdmin() {
  const [b, setB] = useState<Branding>({ site_name: "CAREERY", tagline: "", logo_url: null });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("cms_settings").select("value").eq("key", "branding").maybeSingle().then(({ data }) => {
      if (data?.value) setB({ site_name: "CAREERY", tagline: "", logo_url: null, ...(data.value as object) });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("cms_settings").upsert({ key: "branding", value: b as never });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Branding saved");
  };

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Please select an image");
    setUploading(true);
    const path = `logo-${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
    const { error: upErr } = await supabase.storage.from("cms-media").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data } = supabase.storage.from("cms-media").getPublicUrl(path);
    const next = { ...b, logo_url: data.publicUrl };
    setB(next);
    await supabase.from("cms_settings").upsert({ key: "branding", value: next as never });
    setUploading(false);
    toast.success("Logo updated");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Logo & Branding</h1>
        <p className="mt-1 text-sm text-muted-foreground">Replace the platform logo (PNG with transparent background recommended) and edit site copy.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Logo</h2>
        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 place-items-center rounded-2xl border border-dashed border-border bg-muted/30">
            {b.logo_url ? <img src={b.logo_url} alt="Logo preview" className="max-h-20 max-w-20 object-contain" /> : <span className="text-xs text-muted-foreground">No logo</span>}
          </div>
          <div className="flex flex-col gap-2">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-50">{uploading ? "Uploading…" : b.logo_url ? "Replace logo" : "Upload logo"}</button>
            {b.logo_url && <button onClick={async () => { const next = { ...b, logo_url: null }; setB(next); await supabase.from("cms_settings").upsert({ key: "branding", value: next as never }); toast.success("Logo removed"); }} className="text-xs text-muted-foreground hover:text-foreground">Remove logo</button>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Site copy</h2>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Site name</span>
          <input className="input mt-1 w-full" value={b.site_name} onChange={(e) => setB({ ...b, site_name: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Tagline</span>
          <input className="input mt-1 w-full" value={b.tagline} onChange={(e) => setB({ ...b, tagline: e.target.value })} />
        </label>
        <button onClick={save} disabled={saving} className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
      </div>
    </div>
  );
}
