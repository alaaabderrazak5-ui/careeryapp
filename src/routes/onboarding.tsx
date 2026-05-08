import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, type Role } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Briefcase, Building2, UserSearch, Sparkles, Loader2, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "Welcome to CAREERY" }] }),
});

const ROLE_OPTIONS: { id: Role; icon: typeof GraduationCap; title: string; desc: string; color: string }[] = [
  { id: "student", icon: GraduationCap, title: "Student", desc: "Discover careers and study paths.", color: "from-lilac/40 to-lilac/10" },
  { id: "job_seeker", icon: Briefcase, title: "Job Seeker", desc: "Get matched to your next role.", color: "from-sun/50 to-sun/10" },
  { id: "employer", icon: Building2, title: "Employer", desc: "Hire talent with AI ranking.", color: "from-primary/30 to-primary/5" },
  { id: "recruiter", icon: UserSearch, title: "Recruiter", desc: "Source and contact candidates.", color: "from-accent/30 to-accent/5" },
];

function Onboarding() {
  const navigate = useNavigate();
  const { user, loading, roles, refreshRoles, setActiveRole } = useAuth();
  const [selected, setSelected] = useState<Set<Role>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

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
        const { error } = await supabase.from("user_roles").insert(
          toAdd.map((role) => ({ user_id: user.id, role }))
        );
        if (error) throw error;
      }
      for (const r of toRemove) {
        await supabase.from("user_roles").delete().eq("user_id", user.id).eq("role", r);
      }
      await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
      await refreshRoles();
      if (desired[0]) setActiveRole(desired[0]);
      toast.success("You're all set!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setSaving(false); }
  };

  const skip = async () => {
    if (user) await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg">CAREERY</span>
          </Link>
          <button onClick={skip} className="text-sm text-muted-foreground hover:text-foreground">Skip for now →</button>
        </div>

        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Tell us who you are</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Pick one or more roles</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          You can be a student <em>and</em> a job seeker. Or an employer <em>and</em> a recruiter. Change anytime from settings.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLE_OPTIONS.map((r) => {
            const active = selected.has(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggle(r.id)}
                className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition hover:-translate-y-1 hover:shadow-elegant ${active ? "border-primary ring-2 ring-primary/30" : "border-border"} bg-gradient-to-br ${r.color}`}
              >
                {active && (
                  <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <r.icon className="h-7 w-7" />
                <h3 className="mt-5 font-display text-xl">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={saving || selected.size === 0}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
          </button>
          <button onClick={skip} className="rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">
            I'll decide later
          </button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">You can complete the rest of your profile (skills, education, preferences…) anytime from your dashboard.</p>
      </div>
    </div>
  );
}
