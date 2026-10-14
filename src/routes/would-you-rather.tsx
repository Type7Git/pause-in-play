import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { useRewards } from "@/lib/rewards";
import { WYR_TOPICS, pickRound, scoreRound } from "@/lib/wyr";

export const Route = createFileRoute("/would-you-rather")({
  head: () => ({
    meta: [
      { title: "Would you rather? · Pause in Play" },
      { name: "description", content: "Swipe to find out who you'd rather be. Ten quick choices, no wrong answers." },
      { property: "og:title", content: "Would you rather? · Pause in Play" },
      { property: "og:description", content: "Swipe to find out who you'd rather be." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Wyr,
});

type Q = { id: number; category: string; option_a: string; option_b: string; character_a: string; character_b: string };
type Char = { code: string; name: string; result_text: string; portrait_svg: string };
const LOCAL_FOUND = "midlife-mind:wyr-found";

function Portrait({ c, className = "" }: { c: Char; className?: string }) {
  return <span aria-hidden="true" className={`block [&_svg]:size-full ${className}`} dangerouslySetInnerHTML={{ __html: c.portrait_svg }} />;
}

async function shareImage(c: Char) {
  const css = getComputedStyle(document.documentElement);
  const svg = c.portrait_svg.replace(/var\((--[\w-]+)\)/g, (_, v: string) => css.getPropertyValue(v).trim() || "#EADFF1").replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  const img = new Image();
  img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  await img.decode();
  const cv = document.createElement("canvas"); cv.width = cv.height = 1080;
  const x = cv.getContext("2d")!;
  x.fillStyle = "#FAF7FB"; x.fillRect(0, 0, 1080, 1080);
  x.fillStyle = "#5B3A6B"; x.textAlign = "center";
  x.font = "bold 44px sans-serif"; x.fillText("Today, I'd rather be…", 540, 130);
  x.drawImage(img, 290, 180, 500, 500);
  x.font = "bold 76px sans-serif"; x.fillText(c.name, 540, 790);
  x.fillStyle = "#6E6479"; x.font = "36px sans-serif"; x.fillText("Would you rather? · Pause in Play", 540, 1000);
  const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], "my-pause-in-play-result.png", { type: "image/png" });
  const text = `Today, I'd rather be ${c.name}. ${c.result_text}`;
  if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text }).catch(() => {}); return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
}

function Wyr() {
  const { earn, user } = useRewards();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["wyr"],
    queryFn: async () => {
      const [q, c] = await Promise.all([
        supabase.from("wyr_questions").select("id, category, option_a, option_b, character_a, character_b").eq("status", "live"),
        supabase.from("wyr_characters").select("code, name, result_text, portrait_svg"),
      ]);
      return { questions: (q.data ?? []) as Q[], chars: (c.data ?? []) as Char[] };
    },
  });
  const { data: remoteFound = [] } = useQuery({
    queryKey: ["wyr-found", user?.id],
    enabled: !!user,
    queryFn: async () => [...new Set(((await supabase.from("wyr_results").select("character_code")).data ?? []).map((r) => r.character_code))],
  });
  const [localFound, setLocalFound] = useState<string[]>([]);
  useEffect(() => { try { setLocalFound(JSON.parse(localStorage.getItem(LOCAL_FOUND) ?? "[]")); } catch {} }, []);
  const found = user ? remoteFound : localFound;

  const [topic, setTopic] = useState("all");
  const [deck, setDeck] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [result, setResult] = useState<{ winner: string; runnerUp: string | null; isNew: boolean } | null>(null);
  const [dx, setDx] = useState(0);
  const [fly, setFly] = useState<0 | -1 | 1>(0);
  const start = useRef<number | null>(null);

  const newRound = (t = topic) => {
    const pool = (data?.questions ?? []).filter((q) => t === "all" || q.category === t);
    setDeck(pickRound(pool)); setI(0); setChoices([]); setResult(null); setDx(0); setFly(0);
  };
  useEffect(() => { if (data) newRound(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [data]);

  const finish = (all: string[]) => {
    const { winner, runnerUp } = scoreRound(all);
    if (!winner) { setResult(null); setDeck([]); return; }
    const isNew = !found.includes(winner);
    setResult({ winner, runnerUp, isNew });
    if (user) {
      void supabase.from("wyr_results").insert({ user_id: user.id, character_code: winner }).then(() => qc.invalidateQueries({ queryKey: ["wyr-found"] }));
    } else {
      const next = [...new Set([...localFound, winner])];
      setLocalFound(next); try { localStorage.setItem(LOCAL_FOUND, JSON.stringify(next)); } catch {}
    }
    earn(3, "Would you rather?", "Decisive queen");
  };

  const advance = (code: string | null) => {
    const all = code ? [...choices, code] : choices;
    setChoices(all); setDx(0); setFly(0);
    if (i + 1 >= deck.length) finish(all); else setI(i + 1);
  };
  const choose = (side: -1 | 1) => {
    const q = deck[i]; if (!q || fly) return;
    setFly(side);
    setTimeout(() => advance(side < 0 ? q.character_a : q.character_b), 260);
  };

  const down = (e: PointerEvent<HTMLDivElement>) => { start.current = e.clientX; };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current === null) return;
    const d = e.clientX - start.current;
    if (Math.abs(d) > 4 && !e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId);
    setDx(d);
  };
  const up = () => {
    if (start.current === null) return;
    start.current = null;
    if (dx > 80) choose(1); else if (dx < -80) choose(-1); else setDx(0);
  };
  const key = (side: -1 | 1) => (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(side); } };

  const chars = data?.chars ?? [];
  const char = (code: string | null) => chars.find((c) => c.code === code);
  const q = deck[i];
  const offset = fly ? fly * 520 : dx;
  const lean = fly || (dx > 30 ? 1 : dx < -30 ? -1 : 0);
  const win = result && char(result.winner);

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Would you rather?" title="Swipe to find out who you'd rather be." sub="Ten quick choices. Swipe or tap the side you'd pick. No wrong answers, only better stories." />
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]" role="group" aria-label="Pick a topic">
        {WYR_TOPICS.map(([k, n]) => <Chip key={k} pressed={topic === k} className="shrink-0" onClick={() => { setTopic(k); newRound(k); }}>{n}</Chip>)}
      </div>

      {win && result ? (
        <Card className="items-center text-center">
          <p className="eyebrow">Today, you'd rather be…</p>
          <Portrait c={win} className="size-40" />
          <h2 className="font-display text-2xl">{win.name}</h2>
          {result.isNew && <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-plum">New character found</span>}
          <p>{win.result_text}</p>
          {char(result.runnerUp) && <Muted>With a dash of {char(result.runnerUp)!.name.replace(/^The /, "")}</Muted>}
          <div className="flex flex-wrap justify-center gap-2">
            <Pill onClick={() => newRound()}>Play again</Pill>
            <Pill variant="ghost" onClick={() => void shareImage(win)}>Share my result</Pill>
          </div>
        </Card>
      ) : q ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-muted-foreground"><b className="text-ink">{i + 1} of {deck.length}</b><span>{q.category}</span></div>
          <div className="relative">
            {deck[i + 1] && <div aria-hidden="true" className="absolute inset-x-3 -bottom-2 top-2 rounded-[22px] border border-line bg-card" />}
            <div
              onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
              style={{ transform: `translateX(${offset}px) rotate(${offset / 18}deg)`, transition: start.current === null ? "transform 260ms ease-out, opacity 260ms" : "none", opacity: fly ? 0 : 1 }}
              className="mm-card relative touch-pan-y select-none p-[18px]"
            >
              <p className="mb-3 text-center font-display text-lg">Would you rather…</p>
              <div className="relative grid grid-cols-2 gap-2">
                <div role="button" tabIndex={0} aria-label={`Choose: ${q.option_a}`} onClick={() => choose(-1)} onKeyDown={key(-1)}
                  className={`flex min-h-40 cursor-pointer flex-col justify-between rounded-2xl bg-plum-soft p-3 text-sm font-bold transition-shadow ${lean === -1 ? "ring-[3px] ring-plum" : ""}`}>
                  <span>{q.option_a}</span><span className="text-xs font-normal text-muted-foreground">← Swipe left</span>
                </div>
                <div role="button" tabIndex={0} aria-label={`Choose: ${q.option_b}`} onClick={() => choose(1)} onKeyDown={key(1)}
                  className={`flex min-h-40 cursor-pointer flex-col justify-between rounded-2xl bg-gold-soft p-3 text-right text-sm font-bold transition-shadow ${lean === 1 ? "ring-[3px] ring-gold" : ""}`}>
                  <span>{q.option_b}</span><span className="text-xs font-normal text-muted-foreground">Swipe right →</span>
                </div>
                <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-card text-sm font-bold text-plum shadow-soft">or</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => advance(null)} className="mt-2 min-h-11 self-center text-sm font-bold text-plum underline">Skip this one</button>
        </div>
      ) : (
        <Card><Muted>{data ? "No questions in this topic yet. Try Mix it up, or check back soon." : "Shuffling the questions…"}</Muted></Card>
      )}

      <Card>
        <div className="flex items-center justify-between"><h3>Your characters</h3><span className="text-sm text-muted-foreground">{found.length} of {chars.length || 10} found</span></div>
        <ul className="grid grid-cols-5 gap-2">
          {chars.map((c) => {
            const got = found.includes(c.code);
            return (
              <li key={c.code} aria-label={got ? c.name : "Not found yet"} className="flex flex-col items-center gap-1 text-center text-[11px] leading-tight">
                <Portrait c={c} className={`size-12 ${got ? "" : "opacity-40 blur-[3px] grayscale"}`} />
                <span className={got ? "font-bold" : "text-muted-foreground"}>{got ? c.name.replace(/^The /, "") : "?"}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
