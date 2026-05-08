import { useAuth, type Role } from "@/lib/auth-context";
import { ChevronDown, GraduationCap, Briefcase, Building2, UserSearch, Shield, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

const META: Record<Role, { label: string; icon: typeof GraduationCap }> = {
  student: { label: "Student", icon: GraduationCap },
  job_seeker: { label: "Job Seeker", icon: Briefcase },
  employer: { label: "Employer", icon: Building2 },
  recruiter: { label: "Recruiter", icon: UserSearch },
  admin: { label: "Admin", icon: Shield },
};

export function RoleSwitcher() {
  const { roles, activeRole, setActiveRole } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (roles.length === 0) {
    return (
      <Link to="/onboarding" className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary">
        <Plus className="h-3.5 w-3.5" /> Add a role
      </Link>
    );
  }

  const current = activeRole ? META[activeRole] : null;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/80">
        {current && <current.icon className="h-3.5 w-3.5" />}
        <span>{current?.label ?? "Pick role"}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-elegant">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active context</div>
          {roles.map((r) => {
            const m = META[r];
            const isActive = r === activeRole;
            return (
              <button
                key={r}
                onClick={() => { setActiveRole(r); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-secondary ${isActive ? "bg-secondary font-semibold" : ""}`}
              >
                <m.icon className="h-4 w-4" /> {m.label}
              </button>
            );
          })}
          <Link to="/settings/roles" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Plus className="h-4 w-4" /> Manage roles
          </Link>
        </div>
      )}
    </div>
  );
}
