import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, type Role } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Briefcase, Building2, UserSearch, Loader2, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings/roles")({
  component: RolesSettings,
  head: () => ({ meta: [{ title: "Manage roles — CAREERY" }] }),
});

const OPTIONS: { id: Role; icon: typeof GraduationCap; title: string; desc: string }[] = [
  { id: "student", icon: GraduationCap, title: "Student", desc: "Discover careers and study paths." },
  { id: "job_seeker", icon: Briefcase, title: "Job Seeker", desc: "Get matched to jobs." },
  { id: "employer", icon: Building2, title: "Employer", desc: "Hire talent." },
  { id: "recruiter", icon: UserSearch, title: "Recruiter", desc: "Source candidates." },
];

function RolesSettings() {
  const { user, roles, refreshRoles, setActiveRole } = useAuth();
  const [selected, setSelected] = useState<Set<Role>>(new Set(roles));
  const [saving, setSaving] = useState(false);

  useEffect(() => { setSelected(new Set(roles)); }, [roles]);

  const toggle = (r: Role) => {
    const next = new Set(selected);
    next.has(r) ? next.delete(r) : next.add(r);
    setSelected(next);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const desired = Array.from(selected);
      const toAdd = desired.filter((r) => !roles.includes(r));
      const toRemove = roles.filter((r) => !desired.includes(r) && r !== "admin");
      if (toAdd.length) {
        const { error } = await supabase.from("user_roles").insert(toAdd.map((role) => ({ user_id: user.id, role })));
        if (error) throw error;
      }
      for (const r of toRemove) {
        await supabase.from("user_roles").delete().eq("user_id", user.id).eq("role", r);
      }
      await refreshRoles();
      if (desired[0]) setActiveRole(desired[0]);
      toast.success("Roles updated");
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <h1 className="mt-6 font-display text-3xl">Your roles</h1>
      <p className="mt-2 text-sm text-muted-foreground">Add or remove roles anytime. Multiple roles can be active in parallel.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((r) => {
          const active = selected.has(r.id);
          return (
            <button
              key={r.id}
              onClick={() => toggle(r.id)}
              className={`relative rounded-2xl border p-5 text-left transition hover:shadow-elegant ${active ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border bg-card"}`}
            >
              {active && (
                <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              <r.icon className="h-6 w-6" />
              <h3 className="mt-3 font-display text-lg">{r.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
      </button>
    </div>
  );
}
