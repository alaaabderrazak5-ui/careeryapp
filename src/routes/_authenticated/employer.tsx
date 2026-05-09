import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Building2, Briefcase, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employer")({ component: EmployerLayout });

const NAV = [
  { to: "/employer", label: "Overview", icon: Building2, exact: true },
  { to: "/employer/company", label: "Company", icon: Building2 },
  { to: "/employer/jobs", label: "Jobs", icon: Briefcase },
  { to: "/employer/applicants", label: "Applicants", icon: Users },
] as const;

function EmployerLayout() {
  const loc = useLocation();
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-1">
        <h2 className="px-3 pb-3 font-display text-2xl">Employer</h2>
        {NAV.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? loc.pathname === to : loc.pathname.startsWith(to);
          return (
            <Link key={to} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-foreground text-background" : "hover:bg-secondary"}`}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
      </aside>
      <main className="min-w-0"><Outlet /></main>
    </div>
  );
}
