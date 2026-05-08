import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "student" | "job_seeker" | "employer" | "recruiter" | "admin";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: Role[];
  activeRole: Role | null;
  setActiveRole: (r: Role | null) => void;
  hasRole: (r: Role) => boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);
const ACTIVE_KEY = "careery.activeRole";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeRole, setActiveRoleState] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const list = (data ?? []).map((r) => r.role as Role);
    setRoles(list);
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(ACTIVE_KEY) as Role | null;
      const next = stored && list.includes(stored) ? stored : list[0] ?? null;
      setActiveRoleState(next);
      if (next) window.localStorage.setItem(ACTIVE_KEY, next);
    } else {
      setActiveRoleState(list[0] ?? null);
    }
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) setTimeout(() => fetchRoles(s.user.id), 0);
      else { setRoles([]); setActiveRoleState(null); }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchRoles(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [fetchRoles]);

  const setActiveRole = (r: Role | null) => {
    setActiveRoleState(r);
    if (typeof window !== "undefined") {
      if (r) window.localStorage.setItem(ACTIVE_KEY, r);
      else window.localStorage.removeItem(ACTIVE_KEY);
    }
  };

  return (
    <Ctx.Provider value={{
      user, session, roles, activeRole, setActiveRole,
      hasRole: (r) => roles.includes(r),
      loading,
      signOut: async () => { await supabase.auth.signOut(); },
      refreshRoles: async () => { if (user) await fetchRoles(user.id); },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
