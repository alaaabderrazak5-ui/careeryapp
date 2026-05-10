import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/navigation")({ component: NavAdmin });

interface NavItem { id: string; label: string; url: string; position: number; is_visible: boolean; location: string }

function NavAdmin() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loc, setLoc] = useState<"navbar" | "footer">("navbar");

  const load = async () => {
    const { data } = await supabase.from("cms_navigation").select("*").eq("location", loc).order("position");
    setItems((data ?? []) as NavItem[]);
  };
  useEffect(() => { load(); }, [loc]);

  const update = async (id: string, patch: Partial<NavItem>) => {
    const { error } = await supabase.from("cms_navigation").update(patch).eq("id", id);
    if (error) toast.error(error.message); else load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this nav item?")) return;
    await supabase.from("cms_navigation").delete().eq("id", id);
    load();
  };
  const add = async () => {
    const max = items.reduce((m, i) => Math.max(m, i.position), -1);
    const { error } = await supabase.from("cms_navigation").insert({ location: loc, label: "New item", url: "/", position: max + 1, is_visible: true });
    if (error) toast.error(error.message); else load();
  };
  const move = async (i: number, dir: -1 | 1) => {
    const a = items[i]; const b = items[i + dir]; if (!a || !b) return;
    await Promise.all([
      supabase.from("cms_navigation").update({ position: b.position }).eq("id", a.id),
      supabase.from("cms_navigation").update({ position: a.position }).eq("id", b.id),
    ]);
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Navigation</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit menu items shown in the site header and footer.</p>
        </div>
        <div className="flex gap-2">
          <select className="input" value={loc} onChange={(e) => setLoc(e.target.value as "navbar" | "footer")}>
            <option value="navbar">Header (navbar)</option>
            <option value="footer">Footer</option>
          </select>
          <button onClick={add} className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"><Plus className="h-4 w-4" /> Add item</button>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-card divide-y">
        {items.length === 0 && <p className="p-6 text-sm text-muted-foreground">No items yet.</p>}
        {items.map((item, i) => (
          <div key={item.id} className="flex flex-wrap items-center gap-2 p-3">
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
            </div>
            <input className="input flex-1 min-w-[140px]" value={item.label} onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, label: e.target.value } : x))} onBlur={(e) => update(item.id, { label: e.target.value })} />
            <input className="input flex-1 min-w-[140px]" value={item.url} onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, url: e.target.value } : x))} onBlur={(e) => update(item.id, { url: e.target.value })} />
            <button onClick={() => update(item.id, { is_visible: !item.is_visible })} className="rounded-full p-2 hover:bg-muted" title={item.is_visible ? "Hide" : "Show"}>
              {item.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </button>
            <button onClick={() => del(item.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
