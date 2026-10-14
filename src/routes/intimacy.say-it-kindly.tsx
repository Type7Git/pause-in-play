import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, Chip, Pill, ScreenTitle } from "@/components/mm/ui";
import { KINDLY_PARTS } from "@/content/intimacy";

export const Route = createFileRoute("/intimacy/say-it-kindly")({
  head: () => ({ meta: [{ title: "Say it kindly · Pause and Play" }, { name: "description", content: "Build gentle words for a tricky conversation with your partner." }, { property: "og:title", content: "Say it kindly · Pause and Play" }, { property: "og:description", content: "Gentle words for a tricky conversation." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Kindly,
});

export function buildKindly(p: (string | undefined)[]) {
  const [a = "…", b = "…", c = "…", d = "…"] = p;
  return `I've noticed ${a}. It's not about ${b}, it's this stage of life. What would help me is ${c}. Could we ${d}`;
}

function Kindly() {
  const [sel, setSel] = useState<(string | undefined)[]>([undefined, undefined, undefined, undefined]);
  const [text, setText] = useState(buildKindly(sel));
  useEffect(() => setText(buildKindly(sel)), [sel]);
  const copy = async () => { try { await navigator.clipboard.writeText(text); toast("Copied"); } catch { toast("Couldn't copy. You can select the words instead."); } };
  return (
    <>
      <ScreenTitle eyebrow="Intimacy & relationships" title="Say it kindly" sub="Pick one from each row. You can change any of the words after." />
      {KINDLY_PARTS.map(([part, lines], i) => (
        <Card key={part}>
          <h2 className="font-display text-base">{part}</h2>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={part}>
            {lines.map((l) => <Chip key={l} role="radio" aria-checked={sel[i] === l} pressed={sel[i] === l} onClick={() => setSel((s) => s.map((x, j) => (j === i ? l : x)))}>{l}</Chip>)}
          </div>
        </Card>
      ))}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-muted-foreground">Your words</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="rounded-[22px] rounded-bl-md bg-plum p-4 text-base text-shell shadow-soft" />
      </label>
      <div className="flex flex-wrap gap-2">
        <Pill onClick={copy}>Copy</Pill>
        <Pill variant="ghost" onClick={() => toast("Invite your partner as a PeriPal first")}>Send to a PeriPal</Pill>
      </div>
    </>
  );
}
