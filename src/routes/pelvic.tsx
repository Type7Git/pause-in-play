import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { WhyThisHelps } from "@/components/mm/Panel";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { dayKey, repPhases, useBody } from "@/lib/body";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/pelvic")({
  head: () => ({ meta: [{ title: "Pelvic floor trainer · Lumenera" }, { name: "description", content: "A paced pelvic floor trainer with holds, quick squeezes and discreet reminders." }, { property: "og:title", content: "Pelvic floor trainer · Lumenera" }, { property: "og:description", content: "Squeeze, lift and let go, at your own pace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Pelvic,
});

function Pelvic() {
  const body = useBody();
  const { earn } = useRewards();
  const [hold, setHold] = useState(5);
  const [reps, setReps] = useState(8);
  const [run, setRun] = useState<{ rep: number; phase: number; left: number } | null>(null);
  const phases = repPhases(hold);
  const done = useRef(false);

  useEffect(() => {
    if (!run) return;
    const t = setTimeout(() => {
      if (run.left > 1) return setRun({ ...run, left: run.left - 1 });
      if (run.phase < phases.length - 1) return setRun({ ...run, phase: run.phase + 1, left: phases[run.phase + 1]!.seconds });
      if (run.rep < reps) return setRun({ rep: run.rep + 1, phase: 0, left: phases[0]!.seconds });
      if (!done.current) {
        done.current = true;
        body.update((b) => ({ ...b, pelvic: [...b.pelvic, { completed_at: new Date().toISOString(), hold, reps }] }));
        earn(2, "One set done. Nicely squeezed.");
      }
      setRun(null);
    }, 1000);
    return () => clearTimeout(t);
  }, [run, phases, reps, hold, body, earn]);

  const start = () => { done.current = false; setRun({ rep: 1, phase: 0, left: phases[0]!.seconds }); };
  const ph = run ? phases[run.phase]! : null;
  const setsToday = body.pelvic.filter((p) => dayKey(new Date(p.completed_at)) === dayKey(new Date())).length;

  const toggleReminders = async () => {
    const on = !body.pelvicReminders;
    if (on && typeof Notification !== "undefined" && Notification.permission === "default") await Notification.requestPermission();
    body.update((b) => ({ ...b, pelvicReminders: on }));
  };
  const blocked = typeof Notification !== "undefined" && Notification.permission === "denied";

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Resilient body" title="Pelvic floor trainer" sub="A few minutes, a few times a day. Nobody can tell you're doing it." />
      <WhyThisHelps>A stronger pelvic floor supports your bladder, bowel and core, and can help with leaks when you cough, laugh or lift. Regular practice matters more than effort.</WhyThisHelps>
      <Card>
        <h3>Finding the right muscles</h3>
        <p className="text-sm">Imagine you're stopping yourself passing wind and holding in a wee at the same time. Squeeze and lift up inside. Your tummy, bottom and thighs should stay relaxed, and keep breathing.</p>
      </Card>
      <Card className="items-center text-center">
        <div className="grid size-[180px] place-items-center" aria-hidden="true">
          <div className={`rounded-full bg-rose-soft transition-all ease-in-out ${ph?.grow ? "size-[170px] duration-[1500ms]" : "size-[90px] duration-[1500ms]"} motion-reduce:transition-none`} />
        </div>
        <b className="font-display text-xl" aria-live="polite">{ph ? ph.label : "Ready when you are"}</b>
        <Muted>{run ? `${run.left}s · ${run.rep} of ${reps}` : `${hold}s holds · ${reps} repeats`}</Muted>
        {!run && <>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Hold time">{[3, 5, 8, 10].map((n) => <Chip key={n} pressed={hold === n} onClick={() => setHold(n)}>{n} sec</Chip>)}</div>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Repeats">{[5, 8, 10].map((n) => <Chip key={n} pressed={reps === n} onClick={() => setReps(n)}>{n} repeats</Chip>)}</div>
        </>}
        {run ? <Pill variant="ghost" onClick={() => setRun(null)}>Stop</Pill> : <Pill onClick={start}>Start</Pill>}
        <div className="flex items-center gap-2 text-sm">Sets today
          {[0, 1, 2].map((i) => <i key={i} className={`block size-3 rounded-full ${i < setsToday ? "bg-sage" : "bg-line"}`} />)}
        </div>
      </Card>
      <Card>
        <label className="flex items-center justify-between gap-3">
          <span><b>Time for a little squeeze</b><br /><span className="text-sm text-muted-foreground">Discreet reminders at 9am, 1pm and 7pm while the app is open.</span></span>
          <input type="checkbox" role="switch" className="size-6 accent-[var(--mm-plum)]" checked={body.pelvicReminders} onChange={toggleReminders} />
        </label>
        {blocked && body.pelvicReminders && <Muted>Notifications are turned off for this app in your browser settings.</Muted>}
      </Card>
      <Card>
        <h3>The knack</h3>
        <p className="text-sm">Squeeze just before you cough, sneeze, laugh or lift, and hold until it's over. With practice it becomes automatic.</p>
      </Card>
      <Card className="bg-sage-soft">
        <h3>Get it checked</h3>
        <p className="text-sm">If you're not sure you're doing it right, or you have leaks, heaviness or pain, a pelvic health physiotherapist can help. You don't need a referral. The Continence Foundation helpline is free on <a href="tel:1800330066" className="font-bold underline">1800 33 00 66</a>.</p>
      </Card>
      <p className="text-xs text-muted-foreground">Sets are kept on this device only.</p>
    </>
  );
}
