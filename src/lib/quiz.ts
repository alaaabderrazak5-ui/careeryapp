// Career orientation quiz — questions, scoring, and 4 archetype results.
export type QuizQuestion = {
  id: string;
  section: string;
  prompt: string;
  options: { label: string; tag: ArchetypeKey | "neutral" }[];
};

export type ArchetypeKey = "innovator" | "analyst" | "connector" | "builder";

export const ARCHETYPES: Record<ArchetypeKey, {
  label: string; description: string; careers: string[]; companies: string[]; skills: string[];
}> = {
  innovator: {
    label: "Creative Innovator",
    description: "You are imaginative, curious, and innovative. You enjoy solving problems creatively and thrive in flexible environments.",
    careers: ["UI/UX Designer", "Digital Marketing", "Content Creator", "Product Designer"],
    companies: ["Google", "Canva", "Adobe", "Spotify"],
    skills: ["Communication", "Team collaboration", "Project management"],
  },
  analyst: {
    label: "Strategic Analyst",
    description: "You are logical, detail-oriented and methodical. You excel at structured problem solving and data-driven decisions.",
    careers: ["Software Engineer", "Data Analyst", "Financial Analyst", "Researcher"],
    companies: ["Microsoft", "IBM", "Bloomberg", "Stripe"],
    skills: ["Public speaking", "Creativity", "Stakeholder management"],
  },
  connector: {
    label: "People Connector",
    description: "You are empathetic, social, and persuasive. You energize teams and bring out the best in people.",
    careers: ["HR Manager", "Sales Lead", "Communications", "Customer Success"],
    companies: ["LinkedIn", "Salesforce", "HubSpot", "Slack"],
    skills: ["Negotiation", "Data literacy", "Public speaking"],
  },
  builder: {
    label: "Ambitious Builder",
    description: "You are driven, decisive and execution-focused. You love shipping outcomes and leading initiatives.",
    careers: ["Entrepreneur", "Product Manager", "Operations Lead", "Engineering Manager"],
    companies: ["Tesla", "Shopify", "Airbnb", "Notion"],
    skills: ["Strategic thinking", "Mentorship", "Public speaking"],
  },
};

export const QUIZ: QuizQuestion[] = [
  // Section 2 — Interests
  { id: "i1", section: "Interests & Passions", prompt: "Which activity do you enjoy most?", options: [
    { label: "Coding", tag: "analyst" },{ label: "Designing", tag: "innovator" },
    { label: "Helping people", tag: "connector" },{ label: "Managing projects", tag: "builder" }] },
  { id: "i2", section: "Interests & Passions", prompt: "What motivates you the most?", options: [
    { label: "Innovation", tag: "innovator" },{ label: "Creativity", tag: "innovator" },
    { label: "Teamwork", tag: "connector" },{ label: "Leadership", tag: "builder" }] },
  { id: "i3", section: "Interests & Passions", prompt: "Preferred work style:", options: [
    { label: "Alone", tag: "analyst" },{ label: "In a team", tag: "connector" },{ label: "Flexible", tag: "innovator" }] },
  // Section 3 — Skills
  { id: "s1", section: "Skills Assessment", prompt: "Skills you already have:", options: [
    { label: "Programming", tag: "analyst" },{ label: "Graphic Design", tag: "innovator" },
    { label: "Communication", tag: "connector" },{ label: "Management", tag: "builder" }] },
  { id: "s2", section: "Skills Assessment", prompt: "How do you solve problems?", options: [
    { label: "Logic", tag: "analyst" },{ label: "Creativity", tag: "innovator" },
    { label: "Collaboration", tag: "connector" },{ label: "Strategy", tag: "builder" }] },
  // Section 4 — Personality
  { id: "p1", section: "Personality", prompt: "In a team, you are usually:", options: [
    { label: "The leader", tag: "builder" },{ label: "The creative", tag: "innovator" },
    { label: "The organizer", tag: "analyst" },{ label: "The supporter", tag: "connector" }] },
  { id: "p2", section: "Personality", prompt: "Under pressure you:", options: [
    { label: "Stay calm", tag: "analyst" },{ label: "Think creatively", tag: "innovator" },
    { label: "Ask for help", tag: "connector" },{ label: "Analyze deeply", tag: "analyst" }] },
  { id: "p3", section: "Personality", prompt: "Your biggest strength:", options: [
    { label: "Logical thinking", tag: "analyst" },{ label: "Imagination", tag: "innovator" },
    { label: "Communication", tag: "connector" },{ label: "Decision-making", tag: "builder" }] },
  // Section 5 — Preferences
  { id: "w1", section: "Preferences", prompt: "Preferred company type:", options: [
    { label: "Startup", tag: "builder" },{ label: "Big company", tag: "analyst" },
    { label: "NGO", tag: "connector" },{ label: "Freelance", tag: "innovator" }] },
  { id: "w2", section: "Preferences", prompt: "Preferred career field:", options: [
    { label: "Engineering / IT", tag: "analyst" },{ label: "Business", tag: "builder" },
    { label: "Creative Design", tag: "innovator" },{ label: "Communication / Media", tag: "connector" }] },
  { id: "w3", section: "Preferences", prompt: "What matters most:", options: [
    { label: "Salary", tag: "builder" },{ label: "Passion", tag: "innovator" },
    { label: "Stability", tag: "analyst" },{ label: "Freedom", tag: "innovator" }] },
  // Section 6 — MBTI-style
  { id: "m1", section: "Work style", prompt: "Decision making is based on:", options: [
    { label: "Logic", tag: "analyst" },{ label: "Emotions", tag: "connector" },
    { label: "Opportunities", tag: "builder" },{ label: "Planning", tag: "analyst" }] },
  { id: "m2", section: "Work style", prompt: "Your ideal job:", options: [
    { label: "Software Engineer", tag: "analyst" },{ label: "Graphic Designer", tag: "innovator" },
    { label: "Entrepreneur", tag: "builder" },{ label: "HR / Communication", tag: "connector" }] },
  { id: "m3", section: "Work style", prompt: "How do you learn best?", options: [
    { label: "Practice", tag: "builder" },{ label: "Observation", tag: "analyst" },
    { label: "Collaboration", tag: "connector" },{ label: "Experimentation", tag: "innovator" }] },
  { id: "m4", section: "Work style", prompt: "What kind of future do you want?", options: [
    { label: "Stable career", tag: "analyst" },{ label: "Innovative career", tag: "innovator" },
    { label: "Impact on society", tag: "connector" },{ label: "Financial success", tag: "builder" }] },
];

export function scoreQuiz(answers: Record<string, string>) {
  const counts: Record<ArchetypeKey, number> = { innovator: 0, analyst: 0, connector: 0, builder: 0 };
  for (const q of QUIZ) {
    const optLabel = answers[q.id];
    const opt = q.options.find(o => o.label === optLabel);
    if (opt && opt.tag !== "neutral") counts[opt.tag]++;
  }
  const dominant = (Object.keys(counts) as ArchetypeKey[]).reduce((a, b) => counts[a] >= counts[b] ? a : b);
  const total = QUIZ.length;
  const answered = Object.keys(answers).filter(k => QUIZ.some(q => q.id === k)).length;
  const score = Math.round((counts[dominant] / Math.max(1, total)) * 100);
  return { dominant, counts, score, answered, total, archetype: ARCHETYPES[dominant] };
}
