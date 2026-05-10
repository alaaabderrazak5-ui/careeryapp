import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersAdmin });

const ALL_ROLES = ["student", "job_seeker", "employer", "recruiter", "admin"] as const;
type Role = typeof ALL_ROLES[number];
interface ProfileRow { id: string; full_name: string | null; headline: string | null; created_at: string }

function UsersAdmin() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, Role[]>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: ps } = await supabase.from("profiles").select("id, full_name, headline, created_at").order("created_at", { ascending: false }).limit(200);
    const { data: urs } = await supabase.from("user_roles").select("user_id, role");
    const map: Record<string, Role[]> = {};
    (urs ?? []).forEach((r) => {
      const k = r.user_id as string;
      (map[k] ||= []).push(r.role as Role);
    });
    setProfiles((ps ?? []) as ProfileRow[]);
    setRolesByUser(map);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (uid: string, role: Role) => {
    const has = rolesByUser[uid]?.includes(role);
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
      if (error) return toast.error(error.message);
    }
    load();
  };

  const filtered = profiles.filter((p) => !search || (p.full_name ?? "").toLowerCase().includes(search.toLowerCase()) || p.id.includes(search));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Users & roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">Assign roles to platform members. Admins have full CMS access.</p>
      </header>
      <input className="input w-full max-w-md" placeholder="Search by name or user id…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="p-3">User</th><th className="p-3">Roles</th><th className="p-3">Joined</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No users found.</td></tr>}
            {filtered.map((p) => (
              <tr key={p.id} className="align-top">
                <td className="p-3">
                  <div className="font-medium">{p.full_name ?? "Unnamed"}</div>
                  <div className="text-xs text-muted-foreground">{p.headline}</div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">{p.id.slice(0, 8)}…</div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {ALL_ROLES.map((r) => {
                      const on = rolesByUser[p.id]?.includes(r);
                      return (
                        <button key={r} onClick={() => toggle(p.id, r)} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${on ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-muted"}`}>{r}</button>
                      );
                    })}
                  </div>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
