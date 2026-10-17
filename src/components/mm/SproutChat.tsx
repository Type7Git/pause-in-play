import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { askSprout } from "@/lib/sprout.functions";
import type { SproutReply } from "@/lib/sprout-guard";
import { PanelBadge } from "./Panel";
import { SproutMic } from "./icons";
import { Sprout } from "./Sprout";
import { Pill } from "./ui";
import { ChevronDown, ArrowLeft } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string; reply?: SproutReply };

const OPENING = "Hi, I'm Enera. Ask me about your health at any stage of life, or how to get the most out of Lumenera. I'll share what our clinically reviewed library says, point you to the right tool, or help you work out who to talk to. What's on your mind?";
const QUICK = [
  "I'm feeling really overwhelmed", "I can't sleep", "My periods are really heavy", "What health checks should I be having?",
  "How do I add my medicines?", "How do I bring up sex with my partner?", "We're thinking about trying for a baby", "How's my body meant to feel after birth?",
  "Is this perimenopause?", "What's the Lume Lounge?", "Where do I start?",
];

/** Chat panel: welcome, then the conversation, then the question box, so each answer reads top-down. Conversation lives only in memory and is cleared when the screen closes. */
export function SproutChat({ compact = false }: { compact?: boolean }) {
  const ask = useServerFn(askSprout);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", text: OPENING }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [cat, setCat] = useState<string | null>(null);
  const lastRef = useRef<HTMLDivElement>(null);
  const last = msgs.length > 1 ? msgs[msgs.length - 1] : undefined;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const topics = useQuery({
    queryKey: ["sprout-topics"],
    queryFn: async () => {
      const { data } = await supabase.from("library_entries").select("category,title").eq("status", "approved").order("title");
      const map = new Map<string, string[]>();
      for (const r of data ?? []) map.set(r.category, [...(map.get(r.category) ?? []), r.title]);
      return [...map.entries()];
    },
  });

  // Natural conversation: the newest message (your question, then Enera's answer) rises to the top of the screen,
  // with the question box sitting right below it for the next one.
  useEffect(() => {
    if (msgs.length > 1) lastRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [msgs.length]);

  async function send(raw: string) {
    const message = raw.trim();
    if (!message || busy) return;
    const history = msgs.slice(1).slice(-6).map(({ role, text }) => ({ role, text }));
    setMsgs((m) => [...m, { role: "user", text: message }]);
    setText("");
    setCat(null);
    setBusy(true);
    try {
      const reply = await ask({ data: { message, history } });
      setMsgs((m) => [...m, { role: "assistant", text: reply.text, reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Enera had a little wobble. Please try again in a moment.", reply: { kind: "error", text: "" } }]);
    } finally {
      setBusy(false);
      // On phones, don't pop the keyboard over the answer they're about to read.
      if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <Sprout size={30} mood="happy" animate={false} />
        <p className="min-w-0 rounded-[20px] rounded-bl-md border border-line bg-card px-4 py-3 text-[15px] leading-relaxed shadow-soft">{OPENING}</p>
      </div>
      <div className={`flex flex-col gap-3 empty:hidden ${compact ? "max-h-[460px] overflow-y-auto pr-1" : ""}`} aria-live="polite">
        {msgs.slice(1).map((m, i, all) => m.role === "user" ? (
          <div key={i} ref={i === all.length - 1 ? lastRef : undefined} style={{ scrollMarginTop: 12 }} className="mm-rise ml-auto max-w-[82%] whitespace-pre-line rounded-[20px] rounded-br-md bg-plum px-4 py-2.5 text-[15px] text-shell">{m.text}</div>
        ) : (
          <div key={i} ref={i === all.length - 1 ? lastRef : undefined} style={{ scrollMarginTop: 12 }} className="mm-rise flex max-w-[92%] items-end gap-2">
            <Sprout size={30} mood={m.reply?.kind === "crisis" || m.reply?.kind === "clinical" || m.reply?.kind === "urgent" ? "caring" : m.reply?.kind === "nomatch" ? "thinking" : "happy"} animate={false} />
            <div className={`flex flex-col gap-2 rounded-[20px] rounded-bl-md border px-4 py-3 text-[15px] shadow-soft ${m.reply?.kind === "crisis" || m.reply?.kind === "urgent" ? "border-rose bg-rose-soft" : "border-line bg-card"}`}>
              <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
              {m.reply?.source && (
                <span className="flex items-center gap-2 border-t border-line pt-2 text-xs text-muted-foreground">
                  {m.reply.source.reviewed ? <><PanelBadge size={22} className="shrink-0" />From the Lumenera library: {m.reply.source.title} · clinically reviewed</> : <>From the Lumenera guide: {m.reply.source.title}</>}
                </span>
              )}
              {m.reply?.link && (
                <Link to={m.reply.link.to as "/"} className="press inline-flex min-h-11 items-center self-start rounded-full bg-sage px-4 py-2 text-sm font-bold text-shell">
                  Open {m.reply.link.label} →
                </Link>
              )}
              {m.reply?.kind === "urgent" && (
                <span className="flex flex-wrap gap-2">
                  <a href="tel:000" className="press inline-flex min-h-11 items-center rounded-full bg-rose px-4 py-2 text-sm font-bold text-shell">Call 000</a>
                  <a href="tel:1800022222" className="press inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 py-2 text-sm font-bold text-plum">Healthdirect 1800 022 222</a>
                </span>
              )}
              {m.reply?.kind === "crisis" && (
                <a href="tel:131114" className="press inline-flex min-h-11 items-center self-start rounded-full bg-rose px-4 py-2 text-sm font-bold text-shell">Call Lifeline 13 11 14</a>
              )}
            </div>
          </div>
        ))}
        {!busy && last?.role === "assistant" && last.reply?.next?.length ? (
          <div className="flex flex-wrap gap-1.5 pl-[38px]" aria-label="Things you could say next">
            {last.reply.next.map((q) => <button key={q} type="button" onClick={() => send(q)} className="press min-h-10 rounded-full border-[1.5px] border-line bg-card px-3.5 py-1.5 text-left text-sm text-plum">{q}</button>)}
          </div>
        ) : null}
        {busy && (
          <div className="flex items-end gap-2" aria-label="Enera is typing">
            <Sprout size={30} mood="thinking" />
            <div className="flex gap-1.5 rounded-[20px] rounded-bl-md border border-line bg-card px-4 py-3.5 shadow-soft">
              {[0, 1, 2].map((d) => <span key={d} className="sprout-dot size-2 rounded-full bg-plum-2" style={{ animationDelay: `${d * 0.15}s` }} />)}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-2 rounded-[22px] border border-line bg-card p-2 shadow-soft">
        <Link to="/tell-enera" aria-label="Tell Enera by voice" className="press grid size-11 shrink-0 place-items-center rounded-full bg-plum-soft text-plum">
          <SproutMic className="size-5" />
        </Link>
        <label htmlFor="sprout-input" className="sr-only">Ask Enera something</label>
        <textarea
          id="sprout-input" ref={inputRef} rows={2} maxLength={600} value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
          placeholder="Ask Enera something…"
          className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-[14px] bg-transparent px-2 py-2 text-[15px] outline-none"
        />
        <Pill type="submit" disabled={busy || !text.trim()} aria-label="Send" className="size-11 shrink-0 p-0">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Pill>
      </form>

      <div className="divide-y divide-line border-y border-line">
        <details className="group" onToggle={(e) => { if (!e.currentTarget.open) setCat(null); }}>
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-bold text-plum [&::-webkit-details-marker]:hidden">
            Browse the Lumenera library
            <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          {cat && <Pill variant="ghost" size="sm" onClick={() => setCat(null)} className="mb-2 max-w-full justify-start whitespace-normal text-left"><ArrowLeft className="size-4 shrink-0" />All topics · {cat}</Pill>}
          {topics.isPending ? <p className="py-3 text-sm text-muted-foreground">Opening the library…</p> : topics.isError ? <p className="py-3 text-sm text-muted-foreground">The library couldn't load. <Pill variant="ghost" size="sm" onClick={() => topics.refetch()}>Try again</Pill></p> : !topics.data?.length ? <p className="py-3 text-sm text-muted-foreground">New library topics are being reviewed.</p> : (
            <div className={`mb-3 overflow-y-auto overscroll-contain ${cat ? "max-h-[168px]" : "max-h-36"}`} aria-label={cat ? `${cat} questions` : "Library topics"} tabIndex={0}>
              {cat ? topics.data.find(([c]) => c === cat)?.[1].map((t) => (
                <Pill key={t} variant="ghost" disabled={busy} onClick={() => send(`Tell me about: ${t}`)} className="min-h-14 w-full justify-start rounded-none border-0 border-b border-line px-3 py-2 text-left text-sm font-normal">{t}</Pill>
              )) : topics.data.map(([c]) => (
                <Pill key={c} variant="ghost" onClick={() => setCat(c)} className="h-12 w-full justify-between rounded-none border-0 border-b border-line px-3 py-2 text-left text-sm font-normal"><span>{c}</span><ChevronDown className="size-4 shrink-0 -rotate-90" aria-hidden="true" /></Pill>
              ))}
            </div>
          )}
        </details>
        <details className="group">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-bold text-plum [&::-webkit-details-marker]:hidden">
            Popular prompts<ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="mb-3 max-h-[168px] overflow-y-auto overscroll-contain">
            {QUICK.map((q) => <Pill key={q} variant="ghost" disabled={busy} onClick={() => send(q)} className="min-h-14 w-full justify-start rounded-none border-0 border-b border-line px-3 py-2 text-left text-sm font-normal">{q}</Pill>)}
          </div>
        </details>
      </div>
      {/* Room below, so even a short answer can rise to the top of the screen. */}
      {msgs.length > 1 ? <div aria-hidden="true" style={{ minHeight: "45vh" }} /> : null}
    </div>
  );
}
