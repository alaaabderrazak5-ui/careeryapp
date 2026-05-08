import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import {
  Brain, Sparkles, Target, Users, GraduationCap, Briefcase, Building2,
  ArrowRight, Compass, MapPinned, BadgeCheck, MessageSquareHeart, Rocket
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "CAREERY — Find the career that truly matches you" },
      { name: "description", content: "AI-driven career guidance, smart job matching and recruitment for students, job seekers and employers." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <LogoStrip />
      <Features />
      <ForWho />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <CTA />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-80" />
      <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-lilac/40 blur-3xl animate-float" />
      <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-sun/50 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 md:py-32 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            AI Career & Recruitment, reimagined
          </div>
          <h1 className="mt-6 text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
            Find the career that <span className="text-gradient">truly matches</span> you.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            CAREERY is an intelligent ecosystem that guides students to their path, connects job seekers with their next role, and helps employers find the perfect talent — powered by AI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-elegant transition hover:opacity-90">
              Get started <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur hover:bg-secondary">
              Explore careers
            </a>
            <a href="#for-who" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90">
              Find talent
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex -space-x-2">
              {["bg-primary", "bg-lilac", "bg-sun", "bg-foreground"].map((c, i) => (
                <div key={i} className={`h-7 w-7 rounded-full border-2 border-background ${c}`} />
              ))}
            </div>
            <p>Trusted by students, professionals & recruiters worldwide</p>
          </div>
        </div>

        {/* Hero visual grid */}
        <div className="relative lg:col-span-5">
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-6 rounded-3xl bg-card p-5 shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Career Match</p>
                  <p className="font-display text-lg">Cybersecurity Analyst</p>
                </div>
                <div className="ml-auto rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">94%</div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[94%] rounded-full bg-gradient-hero" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {["Python", "Networks", "Linux", "Risk"].map(t => (
                  <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{t}</span>
                ))}
              </div>
            </div>

            <div className="col-span-3 rounded-3xl bg-lilac/30 p-5">
              <BadgeCheck className="h-5 w-5 text-lilac-foreground" />
              <p className="mt-3 font-display text-2xl">+12</p>
              <p className="text-xs text-lilac-foreground/80">new matches today</p>
            </div>
            <div className="col-span-3 rounded-3xl bg-sun/40 p-5">
              <Rocket className="h-5 w-5 text-sun-foreground" />
              <p className="mt-3 font-display text-2xl">85%</p>
              <p className="text-xs text-sun-foreground/80">employability score</p>
            </div>

            <div className="col-span-6 rounded-3xl bg-foreground p-5 text-background">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-70">
                <MessageSquareHeart className="h-4 w-4" /> AI Advisor
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                "Based on your skills in design and curiosity for ML, I'd explore <span className="font-semibold text-accent">Product Design + AI</span> roles."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <div className="border-y border-border bg-secondary/30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span>MIT</span><span>Google</span><span>Stripe</span><span>Notion</span>
        <span>Sorbonne</span><span>Airbnb</span><span>Figma</span>
      </div>
    </div>
  );
}

const features = [
  { icon: Brain, title: "AI Career Matching", desc: "Match with careers that align with your skills, interests and personality." },
  { icon: Target, title: "Smart Job Recommendations", desc: "Jobs ranked by skills compatibility, location and growth potential." },
  { icon: Users, title: "Employer Talent Search", desc: "Discover candidates with AI ranking, skill filters and instant insights." },
  { icon: Sparkles, title: "Skill Gap Analyzer", desc: "See exactly what to learn next to reach the role of your dreams." },
  { icon: Compass, title: "Learning Roadmaps", desc: "Personalized step-by-step paths from where you are to where you want to be." },
  { icon: BadgeCheck, title: "Smart CV Builder", desc: "Generate, optimize and analyze your CV with AI in seconds." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">What we do</p>
        <h2 className="mt-3 text-4xl md:text-5xl">An ecosystem, not a job board.</h2>
        <p className="mt-4 text-muted-foreground">CAREERY combines orientation, learning and recruitment so every step of your career feels guided — not random.</p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <article key={f.title} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant">
            <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl ${i % 3 === 0 ? "bg-primary text-primary-foreground" : i % 3 === 1 ? "bg-lilac text-lilac-foreground" : "bg-sun text-sun-foreground"}`}>
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const personas = [
  { icon: GraduationCap, title: "Students", color: "bg-lilac/30", goal: "Discover the right field, get study & career roadmaps tailored to you." },
  { icon: Briefcase, title: "Job Seekers", color: "bg-sun/40", goal: "Build a strong profile, get matched to roles, and improve employability." },
  { icon: Building2, title: "Employers", color: "bg-primary/15", goal: "Post jobs, search talent with AI ranking, and manage your pipeline." },
];

function ForWho() {
  return (
    <section id="for-who" className="mx-auto max-w-7xl px-6">
      <div className="grid gap-4 md:grid-cols-3">
        {personas.map((p) => (
          <div key={p.title} className={`relative overflow-hidden rounded-3xl ${p.color} p-8`}>
            <p.icon className="h-8 w-8" />
            <h3 className="mt-6 font-display text-3xl">{p.title}</h3>
            <p className="mt-2 text-sm">{p.goal}</p>
            <Link to="/auth" search={{ mode: "signup" }} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
              Start as {p.title.toLowerCase().replace(/s$/, "")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Create your profile", d: "Tell us about your skills, education and aspirations — or import from your CV." },
    { n: "02", t: "Run AI analysis", d: "Our engine analyzes your strengths, interests and personality fit." },
    { n: "03", t: "Get matched", d: "Receive personalized career paths, learning roadmaps and job recommendations." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How it works</p>
        <h2 className="mt-3 text-4xl md:text-5xl">From confused to confident in 3 steps.</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="relative rounded-3xl border border-border bg-card p-8 shadow-soft">
            <span className="font-display text-6xl text-gradient">{s.n}</span>
            <h3 className="mt-4 font-display text-2xl">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "50K+", l: "Registered users" },
    { v: "200K", l: "Careers analyzed" },
    { v: "1.2K", l: "Companies onboarded" },
    { v: "92%", l: "Match satisfaction" },
  ];
  return (
    <section id="stats" className="relative overflow-hidden mx-4 rounded-[2rem] bg-foreground py-20 text-background md:mx-6">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l}>
            <p className="font-display text-5xl text-gradient">{s.v}</p>
            <p className="mt-2 text-sm opacity-70">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { q: "I switched from accounting to product design thanks to CAREERY's roadmap. Game changer.", a: "Léa M.", r: "Job Seeker" },
    { q: "We cut hiring time by 60%. The AI ranking is shockingly good.", a: "Marc D.", r: "Head of Talent" },
    { q: "I had no idea what to study. CAREERY mapped my interests to UX research.", a: "Yasmine K.", r: "Student" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <h2 className="text-4xl md:text-5xl">Loved by people who choose carefully.</h2>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {t.map((x) => (
          <figure key={x.a} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <blockquote className="text-base leading-relaxed">"{x.q}"</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-hero" />
              <div>
                <p className="text-sm font-semibold">{x.a}</p>
                <p className="text-xs text-muted-foreground">{x.r}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-hero p-10 text-center text-white shadow-elegant md:p-16">
        <MapPinned className="mx-auto h-10 w-10" />
        <h2 className="mt-4 text-4xl md:text-5xl">Your career, mapped.</h2>
        <p className="mx-auto mt-3 max-w-xl opacity-90">Join CAREERY and let AI guide your next move — whether you're starting out, switching paths, or hiring the next generation of talent.</p>
        <Link to="/auth" search={{ mode: "signup" }} className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-background hover:opacity-90">
          Create your free profile <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
