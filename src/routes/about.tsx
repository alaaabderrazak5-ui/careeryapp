import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({ component: () => <CmsPage slug="about" defaultTitle="About CAREERY" /> });

export function CmsPage({ slug, defaultTitle }: { slug: string; defaultTitle: string }) {
  const [page, setPage] = useState<{ title: string; meta_description: string | null } | null>(null);
  const [blocks, setBlocks] = useState<Array<{ id: string; block_type: string; content: Record<string, string> }>>([]);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("cms_pages").select("id, title, meta_description").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (!p) return setPage({ title: defaultTitle, meta_description: null });
      setPage({ title: p.title, meta_description: p.meta_description });
      const { data: b } = await supabase.from("cms_blocks").select("id, block_type, content").eq("page_id", p.id).eq("is_visible", true).order("position");
      setBlocks((b ?? []).map((x) => ({ ...x, content: (x.content as Record<string, string>) ?? {} })));
    })();
  }, [slug, defaultTitle]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-display text-5xl">{page?.title ?? defaultTitle}</h1>
        {page?.meta_description && <p className="mt-3 text-lg text-muted-foreground">{page.meta_description}</p>}
        <div className="mt-10 space-y-10">
          {blocks.length === 0 && (
            <p className="text-muted-foreground">This page hasn't been customized yet. An admin can add sections from <a href="/admin/content" className="text-primary underline">/admin/content</a>.</p>
          )}
          {blocks.map((b) => (
            <section key={b.id}>
              {b.content.heading && <h2 className="font-display text-2xl">{b.content.heading}</h2>}
              {b.content.body && <p className="mt-3 whitespace-pre-line text-muted-foreground">{b.content.body}</p>}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
