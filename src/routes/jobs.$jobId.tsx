import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Building2, MapPin, ArrowLeft, Send, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$jobId")({ component: JobDetail });

function JobDetail() {
  const { jobId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("jobs").select("*, company:companies(*)").eq("id", jobId).maybeSingle();
      setJob(data); setLoading(false);
      if (user) {
        const [a, s] = await Promise.all([
          supabase.from("applications").select("id").eq("job_id", jobId).eq("user_id", user.id).maybeSingle(),
          supabase.from("saved_jobs").select("id").eq("job_id", jobId).eq("user_id", user.id).maybeSingle(),
        ]);
        setApplied(!!a.data); setSaved(!!s.data);
      }
    })();
  }, [jobId, user]);

  const apply = async () => {
    if (!user) return nav({ to: "/auth" });
    setSubmitting(true);
    const { data: profile } = await supabase.from("profiles").select("cv_url").eq("id", user.id).maybeSingle();
    const { error } = await supabase.from("applications").insert({
      job_id: jobId, user_id: user.id, cover_letter: coverLetter, cv_url: profile?.cv_url ?? null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setApplied(true); toast.success("Application submitted");
  };

  const toggleSave = async () => {
    if (!user) return nav({ to: "/auth" });
    if (saved) {
      await supabase.from("saved_jobs").delete().eq("job_id", jobId).eq("user_id", user.id);
      setSaved(false);
    } else {
      await supabase.from("saved_jobs").insert({ job_id: jobId, user_id: user.id });
      setSaved(true);
    }
  };

  if (loading) return <div className="min-h-screen"><SiteHeader /><div className="p-12 text-center text-sm text-muted-foreground">Loading…</div></div>;
  if (!job) return <div className="min-h-screen"><SiteHeader /><div className="p-12 text-center">Job not found.</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All jobs</Link>

        <header className="mt-6 flex items-start gap-4">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-secondary">
            {job.company?.logo_url ? <img src={job.company.logo_url} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-7 w-7" />}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-4xl">{job.title}</h1>
            <p className="text-muted-foreground">{job.company?.name}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {job.work_mode && <span className="rounded-full bg-secondary px-2 py-1">{job.work_mode}</span>}
              {job.location && <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1"><MapPin className="h-3 w-3" />{job.location}</span>}
              {job.salary_min && <span className="rounded-full bg-secondary px-2 py-1">{job.salary_currency ?? "USD"} {job.salary_min}–{job.salary_max ?? "+"}</span>}
            </div>
          </div>
          <button onClick={toggleSave} className="btn-ghost">{saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}{saved ? "Saved" : "Save"}</button>
        </header>

        <section className="prose prose-neutral mt-8 max-w-none">
          <h2 className="font-display text-2xl">About the role</h2>
          <p className="whitespace-pre-wrap">{job.description}</p>
        </section>

        <section className="mt-10 rounded-2xl border bg-card p-6">
          <h2 className="font-display text-2xl">Apply</h2>
          {applied ? (
            <p className="mt-3 text-sm text-foreground/80">You've applied to this role. Track it in <Link to="/applications" className="underline">My applications</Link>.</p>
          ) : (
            <>
              <textarea className="input mt-3 min-h-[140px]" placeholder="Cover letter (optional)" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
              <p className="mt-2 text-xs text-muted-foreground">Your CV from settings will be attached automatically.</p>
              <button onClick={apply} disabled={submitting} className="btn-primary mt-3"><Send className="h-4 w-4" /> {submitting ? "Sending…" : "Submit application"}</button>
            </>
          )}
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}
