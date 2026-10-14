import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { WhyThisHelps } from "@/components/mm/Panel";
import { ChoiceGlyph } from "@/components/mm/icons";
import { Card, Muted, Pill, ScreenTitle, prefersReducedMotion } from "@/components/mm/ui";
import { whyThisHelps } from "@/content/panel";
import { useRewards } from "@/lib/rewards";
import { DictateButton } from "@/components/mm/DictateButton";
import { addTab, closeTab, emptyBasket, readTabs, removeTab, restoreAll, restoreTab, syncVit, writeTabs, type TabState } from "@/lib/tabs";

export const Route = createFileRoute("/tabs")({
  head: () => ({
    meta: [
      { title: "37 tabs open · Pause in Play" },
      { name: "description", content: "A one-minute breathing pause, then put what is on your mind into tabs and close them until only one next action remains." },
      { property: "og:title", content: "37 tabs open · Pause in Play" },
      { property: "og:description", content: "Let's close a few. You only need one." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tabs,
});

const IDEAS = ["Dentist appointment?", "That email from work", "Dinner. Again.", "School excursion form", "Mum's birthday present", "Car rego", "Reply to the group chat", "Return the parcel"];
const STEPS: [string, number, number][] = [["In", 4, 1.8], ["Hold", 4, 1.8], ["Out", 6, 1]];

function Tabs() {
  const { earn, vit, ready } = useRewards();
  const [running, setRunning] = useState(false);
  const [cue, setCue] = useState("Ready");
  const [orb, setOrb] = useState({ scale: 1, dur: 4 });
  const [msg, setMsg] = useState("In for 4, hold for 4, out for 6.");
  const [state, setState] = useState<TabState | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tabsRef = useRef<HTMLElement>(null);
  const rewarded = useRef(false);
  const startedWith = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);
  // Load this device's tabs, and pull in anything new from Help me remember.
  useEffect(() => {
    // Wait until the real Help me remember list has loaded, or we'd briefly treat it as empty.
    if (!ready) { setState(readTabs()); return; }
    const s = syncVit(readTabs(), vit);
    writeTabs(s);
    setState(s);
  }, [ready, vit]);
  const update = (fn: (s: TabState) => TabState) => setState((s) => { const n = fn(s ?? readTabs()); writeTabs(n); return n; });
  const toTabs = () => tabsRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });

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
          timer.current = setTimeout(toTabs, 900);
        } else run();
      }, s * 1000);
    };
    run();
  };

  const add = (e?: FormEvent) => {
    e?.preventDefault();
    update((s) => addTab(s, draft));
    setDraft("");
  };
  const close = (id: string) => {
    if (!state) return;
    if (startedWith.current < state.open.length) startedWith.current = state.open.length;
    const next = closeTab(state, id);
    update(() => next);
    if (next.open.length === 1 && startedWith.current >= 2 && !rewarded.current) {
      rewarded.current = true;
      earn(5, "Down to one tab", "Tab closer");
    }
  };
  const done = (id: string) => { update((s) => closeTab(s, id, true)); earn(2, "One thing done. Nicely."); rewarded.current = false; startedWith.current = 0; };

  const open = state?.open ?? [];
  const basket = state?.basket ?? [];
  const one = open.length === 1 ? open[0]! : null;

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
          <Pill variant="ghost" onClick={() => { clearTimeout(timer.current); toTabs(); }}>Skip to tabs</Pill>
        </div>
        <details className="w-full text-left">
          <summary className="cursor-pointer text-sm font-bold text-plum">Optional: ground yourself (5-4-3-2-1)</summary>
          <ol className="mt-2 list-decimal pl-5 text-sm text-muted-foreground">
            <li>5 things you can see</li><li>4 things you can feel</li><li>3 things you can hear</li><li>2 things you can smell</li><li>1 slow breath out</li>
          </ol>
        </details>
      </Card>

      <Card ref={tabsRef}>
        <h3>What's on your mind?</h3>
        <Muted>Put every open tab in your head here. Big, small or silly. Then close them until only one is left.</Muted>
        <form onSubmit={add} className="flex items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-[13px] font-bold text-muted-foreground">
            New tab
            <input value={draft} maxLength={80} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. Book the dentist" className="min-h-11 rounded-[14px] border border-line bg-sunk px-3 text-[15px] font-normal text-ink" />
          </label>
          <DictateButton label="a new tab" onText={(t) => update((s) => addTab(s, t))} />
          <Pill type="submit" disabled={!draft.trim()}>Add</Pill>
        </form>
        {!open.length && !basket.length && (
          <div className="flex flex-wrap gap-1.5" aria-label="Ideas to get you started">
            <span className="w-full text-[12.5px] text-muted-foreground">Need a nudge? Tap any that ring true.</span>
            {IDEAS.map((t) => <button key={t} type="button" onClick={() => update((s) => addTab(s, t))} className="press min-h-11 rounded-full border border-dashed border-line px-3 text-[13px]">+ {t}</button>)}
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-2xl bg-sunk px-2.5 pb-3 pt-2.5">
          <div className="flex items-center gap-[5px]" aria-hidden="true">
            {[0, 1, 2].map((d) => <i key={d} className="size-[9px] rounded-full bg-line" />)}
            <span className="ml-auto text-[11.5px] font-bold text-muted-foreground">{open.length} open</span>
          </div>
          {one ? (
            <span className="tab-pop self-start rounded-t-xl rounded-b-md border-2 border-sage bg-sage-soft px-3.5 py-2.5 text-[15px] font-bold">{one.text}</span>
          ) : open.length ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Open tabs">
              {open.map((t) => (
                <li key={t.id} className="tab-pop max-w-full">
                  <button onClick={() => close(t.id)} aria-label={`Close tab: ${t.text}. It goes to the basket.`} className="group flex min-h-11 max-w-full items-center gap-2 rounded-t-xl rounded-b-md border border-line bg-card py-[7px] pl-2.5 pr-2 text-left text-[13px] text-ink">
                    <span className="min-w-0">
                      {t.text}
                      {t.vitId && <span className="block text-[11px] text-muted-foreground">Help me remember{t.note ? ` · ${t.note}` : ""}</span>}
                    </span>
                    <i className="grid size-[18px] shrink-0 place-items-center rounded-full bg-sunk text-xs font-bold not-italic text-muted-foreground group-hover:bg-rose-soft group-hover:text-rose">×</i>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-1 py-2 text-sm text-muted-foreground">No tabs open. Add what's on your mind, or bring something back from the basket.</p>
          )}
        </div>
        {open.length > 1 && <Muted>Tap × on anything that can wait. It goes to the basket below, not the bin.</Muted>}
        {one && (
          <div className="flex flex-col gap-2.5 rounded-2xl bg-sage-soft p-3.5">
            <div className="flex items-start gap-3">
              <span className="flex-none"><ChoiceGlyph name="win" /></span>
              <div>
                <b>Your one next action: {one.text}.</b>
                <Muted>Everything else can wait. It's safe in the basket, and so are you.</Muted>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill size="sm" onClick={() => done(one.id)}>Done it</Pill>
              {basket.length > 0 && <Pill variant="ghost" size="sm" onClick={() => { update(restoreAll); rewarded.current = false; startedWith.current = 0; }}>Choose again</Pill>}
            </div>
          </div>
        )}
      </Card>

      <WhyThisHelps>{whyThisHelps.tabs}</WhyThisHelps>

      <Card aria-label="Basket">
        <div className="flex items-center gap-3">
          <Basket count={basket.length} />
          <div className="min-w-0 flex-1">
            <h3>The basket</h3>
            <Muted>{basket.length ? "Closed tabs wait here. Restore any you want back, or remove them for good." : "Closed tabs land here, safe until you want them."}</Muted>
          </div>
        </div>
        {basket.length > 0 && (
          <>
            <ul className="flex flex-col gap-1.5">
              {basket.map((t) => (
                <li key={t.id} className="flex min-h-12 items-center gap-2 rounded-2xl bg-sunk py-1.5 pl-3 pr-1.5 text-sm">
                  <span className={`min-w-0 flex-1 ${t.done ? "text-muted-foreground line-through decoration-sage" : ""}`}>
                    {t.text}
                    {(t.done || t.vitId) && <span className="block text-[11px] text-muted-foreground no-underline">{t.done ? "Done" : "Help me remember"}</span>}
                  </span>
                  <button type="button" onClick={() => update((s) => restoreTab(s, t.id))} aria-label={`Restore ${t.text}`} className="press min-h-11 rounded-full px-2.5 text-sm font-bold text-plum">Restore</button>
                  <button type="button" onClick={() => update((s) => removeTab(s, t.id))} aria-label={`Remove ${t.text} for good`} className="press min-h-11 rounded-full px-2.5 text-sm font-bold text-muted-foreground">Remove</button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Pill variant="ghost" size="sm" onClick={() => { update(restoreAll); rewarded.current = false; startedWith.current = 0; }}>Restore all</Pill>
              {confirmEmpty ? (
                <>
                  <Pill variant="ghost" size="sm" onClick={() => { update(emptyBasket); setConfirmEmpty(false); }}>Yes, empty it</Pill>
                  <button type="button" onClick={() => setConfirmEmpty(false)} className="min-h-11 px-2 text-sm font-bold text-muted-foreground">Keep them</button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmEmpty(true)} className="min-h-11 px-2 text-sm font-bold text-muted-foreground">Empty the basket</button>
              )}
            </div>
            {confirmEmpty && <p className="text-[12.5px] text-muted-foreground">Typed tabs will be gone for good. Anything from Help me remember stays in that list.</p>}
          </>
        )}
        <p className="text-[12px] text-muted-foreground">Your tabs stay on this device.</p>
      </Card>
    </>
  );
}

function Basket({ count }: { count: number }) {
  return (
    <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-gold-soft">
      <svg viewBox="0 0 48 48" aria-hidden="true" className="size-10">
        <path d="M14 20 Q24 4 34 20" stroke="#a8744a" strokeWidth="3" fill="none" strokeLinecap="round" />
        {count > 0 && <><rect x="15" y="13" width="9" height="7" rx="1.5" fill="var(--mm-plum-soft)" stroke="var(--mm-plum-2)" strokeWidth="1.2" transform="rotate(-12 19 16)" /><rect x="24" y="12" width="9" height="7" rx="1.5" fill="var(--mm-rose-soft)" stroke="var(--mm-rose)" strokeWidth="1.2" transform="rotate(10 28 15)" /></>}
        <path d="M8 20 h32 l-4 20 q-1 3 -4 3 h-16 q-3 0 -4 -3z" fill="#d9a066" />
        <path d="M11 26 h26 M12 32 h24 M13 38 h22" stroke="#a8744a" strokeWidth="1.6" />
        <path d="M18 21 l2 21 M24 21 v21 M30 21 l-2 21" stroke="#a8744a" strokeWidth="1.2" opacity=".7" />
      </svg>
      {count > 0 && <b className="absolute -right-1.5 -top-1.5 grid min-w-6 place-items-center rounded-full bg-plum px-1.5 text-xs text-shell">{count}</b>}
    </span>
  );
}
