import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/admin/content")({ component: ContentAdmin });

interface Page { id: string; slug: string; title: string; meta_description: string | null; is_published: boolean }
interface Block { id: string; page_id: string; block_type: string; content: Record<string, unknown>; position: number; is_visible: boolean }

function ContentAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  const loadPages = async () => {
    const { data } = await supabase.from("cms_pages").select("*").order("slug");
    const list = (data ?? []) as Page[];
    setPages(list);
    if (!activeId && list[0]) setActiveId(list[0].id);
  };
  const loadBlocks = async (pid: string) => {
    const { data } = await supabase.from("cms_blocks").select("*").eq("page_id", pid).order("position");
    setBlocks((data ?? []) as Block[]);
  };

  useEffect(() => { loadPages(); }, []);
  useEffect(() => { if (activeId) loadBlocks(activeId); }, [activeId]);

  const newPage = async () => {
    const slug = prompt("Page slug (e.g. about, contact):");
    if (!slug) return;
    const { data, error } = await supabase.from("cms_pages").insert({ slug, title: slug.replace(/-/g, " "), is_published: true }).select().single();
    if (error) return toast.error(error.message);
    await loadPages();
    setActiveId(data.id);
  };
  const updatePage = async (id: string, patch: Partial<Page>) => {
    await supabase.from("cms_pages").update(patch).eq("id", id);
    loadPages();
  };
  const delPage = async (id: string) => {
    if (!confirm("Delete this page and all its blocks?")) return;
    await supabase.from("cms_blocks").delete().eq("page_id", id);
    await supabase.from("cms_pages").delete().eq("id", id);
    setActiveId(null);
    loadPages();
  };

  const addBlock = async () => {
    if (!activeId) return;
    const max = blocks.reduce((m, b) => Math.max(m, b.position), -1);
    await supabase.from("cms_blocks").insert({ page_id: activeId, block_type: "text", content: { heading: "New section", body: "" }, position: max + 1, is_visible: true });
    loadBlocks(activeId);
  };
  const updateBlock = async (id: string, patch: Partial<Block>) => {
    await supabase.from("cms_blocks").update(patch).eq("id", id);
    if (activeId) loadBlocks(activeId);
  };
  const delBlock = async (id: string) => { await supabase.from("cms_blocks").delete().eq("id", id); if (activeId) loadBlocks(activeId); };
  const moveBlock = async (i: number, dir: -1 | 1) => {
    const a = blocks[i]; const b = blocks[i + dir]; if (!a || !b) return;
    await Promise.all([
      supabase.from("cms_blocks").update({ position: b.position }).eq("id", a.id),
      supabase.from("cms_blocks").update({ position: a.position }).eq("id", b.id),
    ]);
    if (activeId) loadBlocks(activeId);
  };

  const active = pages.find((p) => p.id === activeId);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Pages & content</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add and edit pages, sections, and copy across the site.</p>
        </div>
        <button onClick={newPage} className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"><Plus className="h-4 w-4" /> New page</button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-2">
          {pages.length === 0 && <p className="p-3 text-sm text-muted-foreground">No pages yet.</p>}
          {pages.map((p) => (
            <button key={p.id} onClick={() => setActiveId(p.id)} className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${activeId === p.id ? "bg-foreground text-background" : "hover:bg-muted"}`}>
              <div className="font-medium">{p.title}</div>
              <div className={`text-xs ${activeId === p.id ? "text-background/70" : "text-muted-foreground"}`}>/{p.slug}</div>
            </button>
          ))}
        </aside>

        <div className="space-y-4">
          {!active && <p className="text-sm text-muted-foreground">Select or create a page.</p>}
          {active && (
            <>
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block"><span className="text-xs text-muted-foreground">Title</span>
                    <input className="input mt-1 w-full" value={active.title} onChange={(e) => setPages(pages.map((p) => p.id === active.id ? { ...p, title: e.target.value } : p))} onBlur={(e) => updatePage(active.id, { title: e.target.value })} />
                  </label>
                  <label className="block"><span className="text-xs text-muted-foreground">Slug</span>
                    <input className="input mt-1 w-full" value={active.slug} onChange={(e) => setPages(pages.map((p) => p.id === active.id ? { ...p, slug: e.target.value } : p))} onBlur={(e) => updatePage(active.id, { slug: e.target.value })} />
                  </label>
                </div>
                <label className="block"><span className="text-xs text-muted-foreground">Meta description</span>
                  <textarea className="input mt-1 w-full" rows={2} value={active.meta_description ?? ""} onChange={(e) => setPages(pages.map((p) => p.id === active.id ? { ...p, meta_description: e.target.value } : p))} onBlur={(e) => updatePage(active.id, { meta_description: e.target.value })} />
                </label>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active.is_published} onChange={(e) => updatePage(active.id, { is_published: e.target.checked })} /> Published</label>
                  <button onClick={() => delPage(active.id)} className="text-sm text-destructive hover:underline">Delete page</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Blocks</h2>
                <button onClick={addBlock} className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background"><Plus className="h-3 w-3" /> Add block</button>
              </div>
              <div className="space-y-3">
                {blocks.length === 0 && <p className="text-sm text-muted-foreground">No blocks yet — add one to compose the page.</p>}
                {blocks.map((b, i) => {
                  const c = (b.content ?? {}) as Record<string, string>;
                  return (
                    <div key={b.id} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <select className="input" value={b.block_type} onChange={(e) => updateBlock(b.id, { block_type: e.target.value })}>
                          <option value="hero">Hero</option><option value="text">Text</option><option value="cta">Call to action</option><option value="features">Features</option>
                        </select>
                        <div className="flex-1" />
                        <button onClick={() => moveBlock(i, -1)} disabled={i === 0} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                        <button onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={b.is_visible} onChange={(e) => updateBlock(b.id, { is_visible: e.target.checked })} /> visible</label>
                        <button onClick={() => delBlock(b.id)} className="rounded p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <input className="input w-full" placeholder="Heading" value={c.heading ?? ""} onChange={(e) => updateBlock(b.id, { content: { ...c, heading: e.target.value } })} />
                      <textarea className="input w-full" rows={3} placeholder="Body" value={c.body ?? ""} onChange={(e) => updateBlock(b.id, { content: { ...c, body: e.target.value } })} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
