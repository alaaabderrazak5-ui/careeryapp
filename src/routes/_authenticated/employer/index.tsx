import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, Users, Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employer/")({ component: EmployerHome });

function EmployerHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ companies: 0, jobs: 0, apps: 0 });
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: companies } = await supabase.from("companies").select("id").eq("owner_id", user.id);
      const ids = (companies ?? []).map(c => c.id);
      const jobs = ids.length ? await supabase.from("jobs").select("id", { count: "exact", head: true }).in("company_id", ids) : { count: 0 };
      const jobIds = ids.length ? ((await supabase.from("jobs").select("id").in("company_id", ids)).data ?? []).map(j => j.id) : [];
      const apps = jobIds.length ? await supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds) : { count: 0 };
      setStats({ companies: companies?.length ?? 0, jobs: jobs.count ?? 0, apps: apps.count ?? 0 });
    })();
  }, [user]);
  return (
    <div>
      <h1 className="font-display text-4xl">Employer overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={Building2} label="Companies" value={stats.companies} to="/employer/company" />
        <Stat icon={Briefcase} label="Jobs" value={stats.jobs} to="/employer/jobs" />
        <Stat icon={Users} label="Applicants" value={stats.apps} to="/employer/applicants" />
      </div>
    </div>
  );
}
function Stat({ icon: I, label, value, to }: any) {
  return (
    <Link to={to} className="rounded-2xl border bg-card p-5 hover:shadow-elegant">
      <I className="h-5 w-5 text-muted-foreground" />
      <p className="mt-2 text-3xl font-display">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Link>
  );
}
