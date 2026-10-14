import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { WhyThisHelps } from "@/components/mm/Panel";
import { Card, Chip, Muted, ScreenTitle } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { dayKey, useBody } from "@/lib/body";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/food")({
  head: () => ({ meta: [{ title: "Food for this stage · Pause in Play" }, { name: "description", content: "Add in, never cut out. Simple food ideas for bones, muscle, sleep, mood and more." }, { property: "og:title", content: "Food for this stage · Pause in Play" }, { property: "og:description", content: "Add in, never cut out." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Food,
});

const ADDINS = ["Calcium-rich food", "Protein with my meals", "Colour on my plate", "Wholegrains or legumes", "Water through the day", "Something I really enjoyed"];
const FOCUS = ["All", "Bones", "Muscle", "Sleep", "Mood", "Hot flushes", "Heart", "Energy", "Gut"];

function Food() {
  const body = useBody();
  const { earn } = useRewards();
  const [focus, setFocus] = useState("All");
  const { data, isLoading } = useQuery({
    queryKey: ["food-tips"],
    queryFn: async () => (await supabase.from("food_tips").select("*").eq("status", "approved").order("sort")).data ?? [],
  });
  const today = dayKey(new Date());
  const ticked = body.addins[today] ?? [];
  const toggle = (l: string) => {
    const firstToday = !Object.prototype.hasOwnProperty.call(body.addins, today);
    body.update((b) => { const cur = b.addins[today] ?? []; return { ...b, addins: { [today]: cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l] } }; });
    if (firstToday) earn(1, "A little something added in.");
  };
  const tips = (data ?? []).filter((t) => focus === "All" || t.focus === focus);

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Food for this stage" title="Add in, never cut out." />
      <WhyThisHelps>Your body's needs shift through this stage, especially for bones and muscle. Small additions to what you already eat can make a real difference, without rules or restriction.</WhyThisHelps>
      <Card>
        <h3>Today's add-ins</h3>
        <Muted>Tap anything you've had. No score, just noticing.</Muted>
        <div className="flex flex-wrap gap-2">{ADDINS.map((l) => <Chip key={l} pressed={ticked.includes(l)} onClick={() => toggle(l)}>{l}</Chip>)}</div>
        <p className="text-xs text-muted-foreground">Kept on this device only.</p>
      </Card>
      <div className="flex flex-wrap gap-2">{FOCUS.map((f) => <Chip key={f} pressed={focus === f} onClick={() => setFocus(f)}>{f}</Chip>)}</div>
      {isLoading ? <Muted>Finding ideas…</Muted> : !tips.length ? <Muted>{data?.length ? "Nothing here for that focus yet." : "Food ideas are being reviewed by our clinical advisory panel. Check back soon."}</Muted> : tips.map((t) => (
        <Card key={t.id}>
          <span className="self-start rounded-full bg-sage-soft px-2.5 py-0.5 text-xs font-bold">{t.focus}</span>
          <h3>{t.title}</h3>
          <p className="text-sm">{t.text}</p>
          {t.try_these && <p className="rounded-2xl bg-sunk p-3 text-sm"><b>Try: </b>{t.try_these}</p>}
        </Card>
      ))}
      <p className="text-xs text-muted-foreground">For advice that fits you, find an Accredited Practising Dietitian through Dietitians Australia. If food or eating feels hard, the Butterfly Foundation helpline is on <a href="tel:1800334673" className="font-bold underline">1800 33 4673</a>.</p>
    </>
  );
}
