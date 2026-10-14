import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { CHECKIN_RESULTS, CHECKIN_STATEMENTS, GP_KEYS } from "@/content/intimacy";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/intimacy/check-in")({
  head: () => ({ meta: [{ title: "What's changed for me · Pause in Play" }, { name: "description", content: "A private check-in on desire, body and heart, with ideas that might help." }, { property: "og:title", content: "What's changed for me · Pause in Play" }, { property: "og:description", content: "A private check-in with ideas that might help." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: CheckIn,
});

const ROUTE: Record<string, "/intimacy/library" | "/intimacy/cards" | "/intimacy/say-it-kindly"> = { ilearn: "/intimacy/library", talk: "/intimacy/cards", kindly: "/intimacy/say-it-kindly" };
const GROUPS = [...new Set(CHECKIN_STATEMENTS.map((s) => s.group))];

function CheckIn() {
  const { earn } = useRewards();
  const [picked, setPicked] = useState<string[]>([]);
  const [shown, setShown] = useState(false);
  const [note, setNote] = useState("");
  const toggle = (k: string) => { setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k])); setShown(false); };
  const results = [...new Set(CHECKIN_STATEMENTS.filter((s) => picked.includes(s.key)).map((s) => s.result_key))];
  const gp = picked.some((k) => GP_KEYS.includes(k));
  const show = () => { if (!shown) earn(2, "A kind check-in"); setShown(true); };

  return (
    <>
      <ScreenTitle eyebrow="Intimacy & relationships" title="What's changed for me" sub="Tap anything that sounds like you. There are no wrong answers." />
      {GROUPS.map((g) => (
        <Card key={g}>
          <h2 className="font-display text-base">{g}</h2>
          <div className="flex flex-wrap gap-2">
            {CHECKIN_STATEMENTS.filter((s) => s.group === g).map((s) => <Chip key={s.key} pressed={picked.includes(s.key)} onClick={() => toggle(s.key)}>{s.statement}</Chip>)}
          </div>
        </Card>
      ))}
      <Pill onClick={show} disabled={!picked.length}>See what might help</Pill>
      {shown && (
        <>
          {results.map((k) => { const r = CHECKIN_RESULTS[k]; if (!r) return null; const to = ROUTE[r.to];
            return <Card key={k}><h3>{r.title}</h3><Muted>{r.text}</Muted>{to && <Link to={to} className="min-h-11 self-start pt-2 text-sm font-bold text-plum">{r.label} →</Link>}</Card>; })}
          {gp && (
            <section className="mm-card flex flex-col gap-2 border-sage bg-sage-soft p-[18px]">
              <h3>Worth a GP visit</h3>
              <p className="text-sm">Bring this list to your appointment. Any bleeding after menopause, or pain that's new or getting worse, should be checked soon.</p>
            </section>
          )}
          <div className="flex flex-wrap gap-2">
            <Link to="/intimacy/say-it-kindly" className="press inline-flex min-h-11 items-center rounded-full bg-plum px-5 font-bold text-shell">Turn this into a conversation</Link>
            <Pill variant="ghost" onClick={() => setNote("Saving check-ins isn't switched on yet. We'll only offer it once your private information can be stored in Australia, with your clear consent. For now, nothing you tapped here has been kept.")}>Keep this, privately</Pill>
          </div>
          {note && <p role="status" className="text-sm text-muted-foreground">{note}</p>}
        </>
      )}
    </>
  );
}
