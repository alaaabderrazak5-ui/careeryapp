import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Briefcase, Building2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "Choose your path — CAREERY" }] }),
});

const ROLES = [
  { id: "student" as const, icon: GraduationCap, title: "Student", desc: "Discover careers, get study guidance and learning roadmaps.", color: "from-lilac/40 to-lilac/10" },
  { id: "job_seeker" as const, icon: Briefcase, title: "Job Seeker", desc: "Build your profile and get matched to your next role.", color: "from-sun/50 to-sun/10" },
  { id: "employer" as const, icon: Building2, title: "Employer", desc: "Find the right talent with AI ranking and smart filters.", color: "from-primary/30 to-primary/5" },
];

function Onboarding() {
  const navigate = useNavigate();
  const { user, loading, role, refreshRole } = useAuth();
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && role) navigate({ to: "/dashboard" });
  }, [loading, user, role, navigate]);

  const choose = async (r: "student" | "job_seeker" | "employer") => {
    if (!user) return;
    setSubmitting(r);
    try {
      const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: r });
      if (error) throw error;
      await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
      await refreshRole();
      toast.success("You're all set!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message);
      setSubmitting(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <Link to="/" className="mb-10 inline-flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg">CAREERY</span>
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Step 1 of 1</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Who are you on CAREERY?</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Pick the role that matches you best. You can refine your profile next.</p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => choose(r.id)}
              disabled={!!submitting}
              className={`group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${r.color} p-8 text-left transition hover:-translate-y-1 hover:shadow-elegant disabled:opacity-50`}
            >
              <r.icon className="h-8 w-8" />
              <h3 className="mt-6 font-display text-2xl">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold">
                {submitting === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue →"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
