import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { WhyThisHelps } from "@/components/mm/Panel";
import { ChoiceGlyph } from "@/components/mm/icons";
import { Card, Muted, Pill, ScreenTitle, prefersReducedMotion } from "@/components/mm/ui";
import { whyThisHelps } from "@/content/erin";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/tabs")({
  head: () => ({
    meta: [
      { title: "37 tabs open · Pause and Play" },
      { name: "description", content: "A one-minute breathing pause, then close tabs until only one next action remains." },
      { property: "og:title", content: "37 tabs open · Pause and Play" },
      { property: "og:description", content: "Let's close a few. You only need one." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tabs,
});

const TABS = ["Dentist appointment?", "That email from work", "Dinner. Again.", "School excursion form", "Mum's birthday present", "Why is the dog barking", "Car rego", "Reply to the group chat", "Did I take my tablets?", "Gym membership I never use", "Return the parcel"];
const STEPS: [string, number, number][] = [["In", 4, 1.8], ["Hold", 4, 1.8], ["Out", 6, 1]];

function Tabs() {
  const { earn } = useRewards();
  const [running, setRunning] = useState(false);
  const [cue, setCue] = useState("Ready");
  const [orb, setOrb] = useState({ scale: 1, dur: 4 });
  const [msg, setMsg] = useState("In for 4, hold for 4, out for 6.");
  const [showTabs, setShowTabs] = useState(false);
  const [open, setOpen] = useState(TABS);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tabsRef = useRef<HTMLElement>(null);
  const rewarded = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (showTabs) tabsRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }, [showTabs]);

  const start = () => {
    setRunning(true);
    let round = 0, ph = 0;
    const run = () => {
      const [label, s, sc] = STEPS[ph]!;
      setCue(label);
      setOrb({ scale: sc, dur: s });
      timer.current = setTimeout(() => {
        ph++;
        if (ph === 3) { ph = 0; round++; setMsg(`Round ${round} of 4.`); }
        if (round === 4) {
          setCue("Good");
          setMsg("That was a minute just for you.");
          timer.current = setTimeout(() => setShowTabs(true), 900);
        } else run();
      }, s * 1000);
    };
    run();
  };

  const close = (i: number) => {
    const next = open.filter((_, j) => j !== i);
    setOpen(next);
    if (next.length === 1 && !rewarded.current) {
      rewarded.current = true;
      earn(5, "Down to one tab", "Tab closer");
    }
  };

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="37 tabs open" title="Let's close a few. You only need one." />
      <Card className="items-center text-center">
        <h3>A one-minute pause</h3>
        <div className="breath-ring relative mx-auto my-1 grid size-[190px] place-items-center rounded-full">
          <div className="orb size-[84px] rounded-full" style={{ transform: `scale(${orb.scale})`, transitionDuration: `${orb.dur}s` }} />
          <div className="absolute font-display text-lg font-bold text-shell" aria-live="polite">{cue}</div>
        </div>
        <Muted>{msg}</Muted>
        <div className="flex flex-wrap justify-center gap-2">
          <Pill onClick={start} disabled={running}>Start the minute</Pill>
          <Pill variant="ghost" onClick={() => { clearTimeout(timer.current); setShowTabs(true); }}>Skip to tabs</Pill>
        </div>
        <details className="w-full text-left">
          <summary className="cursor-pointer text-sm font-bold text-plum">Optional: ground yourself (5-4-3-2-1)</summary>
          <ol className="mt-2 list-decimal pl-5 text-sm text-muted-foreground">
            <li>5 things you can see</li><li>4 things you can feel</li><li>3 things you can hear</li><li>2 things you can smell</li><li>1 slow breath out</li>
          </ol>
        </details>
      </Card>

      <WhyThisHelps>{whyThisHelps.tabs}</WhyThisHelps>

      {showTabs && (
        <Card ref={tabsRef}>
          <h3>Close tabs until one remains</h3>
          <Muted>Tap × on anything that can wait. The last tab standing is your one next action.</Muted>
          <div className="flex flex-col gap-2 rounded-2xl bg-sunk px-2.5 pb-3 pt-2.5">
            <div className="flex gap-[5px]" aria-hidden="true">
              {[0, 1, 2].map((d) => <i key={d} className="size-[9px] rounded-full bg-line" />)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {open.length > 1 ? (
                open.map((t, i) => (
                  <button key={t} onClick={() => close(i)} aria-label={`Close tab: ${t}`} className="group flex min-h-11 max-w-full items-center gap-2 rounded-t-xl rounded-b-md border border-line bg-card py-[7px] pl-2.5 pr-2 text-[13px] text-ink">
                    {t}
                    <i className="grid size-[18px] place-items-center rounded-full bg-sunk text-xs font-bold not-italic text-muted-foreground group-hover:bg-rose-soft group-hover:text-rose">×</i>
                  </button>
                ))
              ) : (
                <span className="rounded-t-xl rounded-b-md border-2 border-sage bg-sage-soft px-3.5 py-2.5 text-[15px] font-bold">{open[0]}</span>
              )}
            </div>
          </div>
          {open.length === 1 && (
            <div className="flex items-start gap-3 rounded-2xl bg-sage-soft p-3.5">
              <span className="flex-none"><ChoiceGlyph name="win" /></span>
              <div>
                <b>Your one next action: {open[0]}.</b>
                <Muted>Everything else can wait. It will still be there, and so will you.</Muted>
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
