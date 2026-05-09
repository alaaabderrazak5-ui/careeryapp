import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/employer/company")({ component: CompanyPage });

function CompanyPage() {
  const { user } = useAuth();
  const [c, setC] = useState<any>({ name: "", slug: "", website: "", description: "", industry: "", location: "", size: "" });
  const [existing, setExisting] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("companies").select("*").eq("owner_id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setC(data); setExisting(data); }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    const slug = (c.slug || c.name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = { ...c, slug, owner_id: user.id };
    const { data, error } = existing
      ? await supabase.from("companies").update(payload).eq("id", existing.id).select().single()
      : await supabase.from("companies").insert(payload).select().single();
    if (error) return toast.error(error.message);
    if (!existing && data) await supabase.from("company_members").insert({ company_id: data.id, user_id: user.id, member_role: "owner" });
    setExisting(data); toast.success("Company saved");
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Company profile</h1>
      <section className="grid gap-3 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <input className="input" placeholder="Name" value={c.name ?? ""} onChange={(e) => setC({ ...c, name: e.target.value })} />
        <input className="input" placeholder="Industry" value={c.industry ?? ""} onChange={(e) => setC({ ...c, industry: e.target.value })} />
        <input className="input" placeholder="Website" value={c.website ?? ""} onChange={(e) => setC({ ...c, website: e.target.value })} />
        <input className="input" placeholder="Location" value={c.location ?? ""} onChange={(e) => setC({ ...c, location: e.target.value })} />
        <input className="input" placeholder="Size (e.g. 10-50)" value={c.size ?? ""} onChange={(e) => setC({ ...c, size: e.target.value })} />
        <textarea className="input col-span-2 min-h-[100px]" placeholder="Description" value={c.description ?? ""} onChange={(e) => setC({ ...c, description: e.target.value })} />
      </section>
      <button onClick={save} className="btn-primary">{existing ? "Update" : "Create"} company</button>
    </div>
  );
}
