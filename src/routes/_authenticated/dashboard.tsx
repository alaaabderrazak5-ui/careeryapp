import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, TrendingUp, Target, Award, ArrowRight, Brain, Briefcase, Building2, GraduationCap, MessageSquareHeart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — CAREERY" }] }),
});

function Dashboard() {
  const { user, activeRole: role } = useAuth();
  const name = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{role?.replace("_", " ")}</p>
          <h1 className="mt-2 text-4xl">Hi, <span className="text-gradient">{name}</span> 👋</h1>
          <p className="mt-1 text-muted-foreground">Here's what's happening on your career path today.</p>
        </div>
        <Link to="/advisor" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">
          <MessageSquareHeart className="h-4 w-4" /> Ask AI Advisor
        </Link>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <StatCard icon={Brain} label="Top match" value="Cybersecurity" tag="94%" tone="primary" />
        <StatCard icon={TrendingUp} label="Profile strength" value="68%" tag="+12 this week" tone="lilac" />
        <StatCard icon={Award} label="Skills tracked" value="14" tag="3 new" tone="sun" />
      </section>

      {role === "student" && <StudentPanel />}
      {role === "job_seeker" && <JobSeekerPanel />}
      {role === "employer" && <EmployerPanel />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tag, tone }: { icon: typeof Brain; label: string; value: string; tag: string; tone: "primary" | "lilac" | "sun" }) {
  const map = { primary: "bg-primary text-primary-foreground", lilac: "bg-lilac text-lilac-foreground", sun: "bg-sun text-sun-foreground" };
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${map[tone]}`}><Icon className="h-5 w-5" /></div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">{tag}</span>
      </div>
      <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}

function StudentPanel() {
  const careers = [
    { t: "UX Researcher", m: 91, tags: ["Empathy", "Interviews", "Figma"] },
    { t: "Data Analyst", m: 86, tags: ["SQL", "Stats", "Python"] },
    { t: "Product Designer", m: 82, tags: ["Figma", "Systems", "Prototype"] },
  ];
  return (
    <Section title="Recommended career paths" icon={GraduationCap}>
      <div className="grid gap-4 md:grid-cols-3">
        {careers.map((c) => (
          <article key={c.t} className="rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">{c.t}</h3>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">{c.m}%</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${c.m}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
              {c.tags.map(t => <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{t}</span>)}
            </div>
            <button className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View roadmap <ArrowRight className="h-4 w-4" /></button>
          </article>
        ))}
      </div>
    </Section>
  );
}

function JobSeekerPanel() {
  const jobs = [
    { t: "Frontend Engineer", c: "Stripe", l: "Remote · EU", m: 92, s: "$80–110k" },
    { t: "Product Manager", c: "Notion", l: "Hybrid · Paris", m: 84, s: "$95–130k" },
    { t: "Growth Marketer", c: "Linear", l: "Remote", m: 78, s: "$70–95k" },
  ];
  return (
    <Section title="Top job matches for you" icon={Briefcase}>
      <div className="space-y-3">
        {jobs.map((j) => (
          <article key={j.t} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-elegant">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-white font-display">{j.c[0]}</div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg">{j.t}</h3>
              <p className="text-sm text-muted-foreground">{j.c} · {j.l} · {j.s}</p>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{j.m}% match</span>
            <button className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90">Apply</button>
          </article>
        ))}
      </div>
    </Section>
  );
}

function EmployerPanel() {
  const candidates = [
    { n: "Léa Martin", r: "Senior Product Designer", m: 96, sk: ["Figma", "Systems", "Research"] },
    { n: "Yusuf Demir", r: "Full Stack Engineer", m: 91, sk: ["React", "Node", "AWS"] },
    { n: "Clara Fischer", r: "Data Scientist", m: 88, sk: ["Python", "ML", "SQL"] },
  ];
  return (
    <Section title="Top candidates for your roles" icon={Building2}>
      <div className="grid gap-4 md:grid-cols-3">
        {candidates.map((c) => (
          <article key={c.n} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-hero text-white font-display">{c.n[0]}</div>
              <div>
                <p className="font-display text-lg leading-tight">{c.n}</p>
                <p className="text-xs text-muted-foreground">{c.r}</p>
              </div>
              <span className="ml-auto rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">{c.m}%</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
              {c.sk.map(s => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{s}</span>)}
            </div>
            <div className="mt-5 flex gap-2">
              <button className="flex-1 rounded-full bg-foreground py-2 text-xs font-semibold text-background hover:opacity-90">Contact</button>
              <button className="flex-1 rounded-full border border-border py-2 text-xs font-semibold hover:bg-secondary">Save</button>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Target; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
