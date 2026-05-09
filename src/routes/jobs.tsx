import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Briefcase, MapPin, Search, Building2 } from "lucide-react";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
  head: () => ({ meta: [
    { title: "Jobs — CAREERY" },
    { name: "description", content: "Browse open roles ranked by AI compatibility." },
  ]}),
});

type Job = {
  id: string; title: string; description: string; location: string | null; work_mode: string | null;
  salary_min: number | null; salary_max: number | null; salary_currency: string | null;
  experience_level: string | null; created_at: string;
  company: { id: string; name: string; logo_url: string | null; location: string | null } | null;
};

function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState(""); const [mode, setMode] = useState<string>("any");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      let query = supabase.from("jobs").select("id,title,description,location,work_mode,salary_min,salary_max,salary_currency,experience_level,created_at,company:companies(id,name,logo_url,location)")
        .eq("status", "open").order("created_at", { ascending: false }).limit(50);
      if (q.trim()) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (mode !== "any") query = query.eq("work_mode", mode);
      const { data } = await query;
      setJobs((data as any) ?? []); setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [q, mode]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-8">
          <h1 className="font-display text-5xl">Jobs</h1>
          <p className="mt-2 text-muted-foreground">Real opportunities, ranked by your profile match.</p>
        </header>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3 shadow-soft">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="input pl-9" placeholder="Search title, keywords…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input w-44" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="any">Any mode</option><option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
          </select>
        </div>

        <div className="mt-6 grid gap-4">
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p>
          : jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No open jobs match your search</p>
              <p className="mt-1 text-sm text-muted-foreground">Try clearing filters or check back soon.</p>
            </div>
          ) : jobs.map(j => (
            <Link key={j.id} to="/jobs/$jobId" params={{ jobId: j.id }} className="block rounded-2xl border bg-card p-5 transition hover:shadow-elegant">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary">
                  {j.company?.logo_url ? <img src={j.company.logo_url} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">{j.company?.name ?? "Company"}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {j.work_mode && <span className="rounded-full bg-secondary px-2 py-1">{j.work_mode}</span>}
                    {j.location && <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1"><MapPin className="h-3 w-3" />{j.location}</span>}
                    {j.experience_level && <span className="rounded-full bg-secondary px-2 py-1">{j.experience_level}</span>}
                    {j.salary_min && <span className="rounded-full bg-secondary px-2 py-1">{j.salary_currency ?? "USD"} {j.salary_min}{j.salary_max ? `–${j.salary_max}` : "+"}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
