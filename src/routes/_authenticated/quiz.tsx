import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { QUIZ, scoreQuiz, ARCHETYPES, type ArchetypeKey } from "@/lib/quiz";
import { toast } from "sonner";
import { Brain, ArrowRight, Sparkles, RotateCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/quiz")({
  component: QuizPage,
  head: () => ({ meta: [{ title: "Career quiz — CAREERY" }] }),
});

type SavedResult = { id: string; score: number; personality_type: string; description: string;
  recommended_careers: string[]; recommended_companies: string[]; skills_to_improve: string[]; created_at: string; };

function QuizPage() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<SavedResult | null>(null);
  const [recent, setRecent] = useState<SavedResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("career_quiz_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setRecent((data as any) ?? null));
  }, [user]);

  const sections = Array.from(new Set(QUIZ.map(q => q.section)));
  const current = sections[step];
  const sectionQs = QUIZ.filter(q => q.section === current);
  const isLast = step === sections.length - 1;

  const submit = async () => {
    if (!user) return;
    const r = scoreQuiz(answers);
    const arch = ARCHETYPES[r.dominant];
    const { data, error } = await supabase.from("career_quiz_results").insert({
      user_id: user.id, answers, score: r.score, personality_type: arch.label,
      description: arch.description, recommended_careers: arch.careers,
      recommended_companies: arch.companies, skills_to_improve: arch.skills,
    }).select().single();
    if (error) return toast.error(error.message);
    setSubmitted(data as any);
    toast.success("Quiz saved");
  };

  if (submitted || (recent && step === 0 && Object.keys(answers).length === 0)) {
    const r = (submitted ?? recent)!;
    return <ResultView r={r} onRetake={() => { setSubmitted(null); setRecent(null); setAnswers({}); setStep(0); }} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-white"><Brain className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl">Career discovery quiz</h1>
          <p className="text-sm text-muted-foreground">Section {step + 1} of {sections.length} — {current}</p>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-foreground transition-all" style={{ width: `${((step + 1) / sections.length) * 100}%` }} />
      </div>

      <div className="mt-8 space-y-6">
        {sectionQs.map(q => (
          <fieldset key={q.id} className="rounded-2xl border bg-card p-5">
            <legend className="px-2 font-medium">{q.prompt}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map(o => {
                const sel = answers[q.id] === o.label;
                return (
                  <button key={o.label} onClick={() => setAnswers({ ...answers, [q.id]: o.label })}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${sel ? "border-primary bg-primary/10" : "hover:bg-secondary"}`}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="btn-ghost disabled:opacity-50">Back</button>
        {isLast ? (
          <button onClick={submit} className="btn-primary"><Sparkles className="h-4 w-4" /> See my result</button>
        ) : (
          <button onClick={() => setStep(s => s + 1)} className="btn-primary">Next <ArrowRight className="h-4 w-4" /></button>
        )}
      </div>
    </div>
  );
}

function ResultView({ r, onRetake }: { r: SavedResult; onRetake: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-3xl border bg-gradient-mesh p-8 shadow-elegant">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your career archetype</p>
        <h1 className="mt-2 font-display text-5xl">{r.personality_type}</h1>
        <p className="mt-3 text-lg text-foreground/80">{r.description}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background">
          Match strength · {r.score}%
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card title="Recommended careers" items={r.recommended_careers} />
        <Card title="Recommended companies" items={r.recommended_companies} />
        <Card title="Skills to improve" items={r.skills_to_improve} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/jobs" className="btn-primary">Browse matching jobs <ArrowRight className="h-4 w-4" /></Link>
        <Link to="/settings/skills" className="btn-ghost">Update my skills</Link>
        <button onClick={onRetake} className="btn-ghost"><RotateCw className="h-4 w-4" /> Retake quiz</button>
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="font-display text-lg">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-sm">{items.map(i => <li key={i} className="rounded-md bg-secondary px-2 py-1">{i}</li>)}</ul>
    </div>
  );
}
