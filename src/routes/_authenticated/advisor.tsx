import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/advisor")({
  component: Advisor,
  head: () => ({ meta: [{ title: "AI Career Advisor — CAREERY" }] }),
});

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "What career fits a curious mind who loves design and tech?",
  "I'm a junior dev — what should I learn next to land a remote job?",
  "Compare Data Analyst vs Data Scientist for someone with a stats degree.",
];

function Advisor() {
  const { activeRole: role } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-advisor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, role }),
      });

      if (resp.status === 429) { toast.error("Rate limited. Try again in a moment."); setStreaming(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Add credits in Lovable Cloud."); setStreaming(false); return; }
      if (!resp.ok || !resp.body) throw new Error("AI request failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      setMessages([...next, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { buf = ""; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col px-6 py-8">
      <header className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-hero shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl">AI Career Advisor</h1>
          <p className="text-xs text-muted-foreground">Personalized guidance, powered by AI</p>
        </div>
      </header>

      <div ref={scrollRef} className="mt-6 flex-1 overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-soft">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="font-display text-3xl">How can I help your career today?</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">Ask about career paths, skill gaps, learning roadmaps, or job strategy.</p>
            <div className="mt-8 grid w-full max-w-2xl gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-2xl border border-border bg-background p-4 text-left text-sm transition hover:border-primary hover:bg-secondary">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}>
                  {m.content || <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-4 flex gap-2">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your career…"
          className="flex-1 rounded-full border border-input bg-card px-5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          disabled={streaming}
        />
        <button type="submit" disabled={streaming || !input.trim()} className="grid h-12 w-12 place-items-center rounded-full bg-foreground text-background transition hover:opacity-90 disabled:opacity-50">
          {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
