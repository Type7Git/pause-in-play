import { Link } from "@tanstack/react-router";
import { CalendarDays, Check, Pill as PillIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRewards } from "@/lib/rewards";
import { EXAMPLE_DAY, MEDICINES, isDue } from "@/lib/tracking-examples";
import { Pill } from "./ui";
import { ExampleLabel } from "./TrackingShared";

const OPEN_KEY = "midlife-mind:today-open";

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${((h! + 11) % 12) + 1}:${String(m).padStart(2, "0")}${h! < 12 ? "am" : "pm"}`;
}

export function Today() {
  const { quests } = useRewards();
  const [date, setDate] = useState<Date | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setDate(new Date());
    try { setOpen(sessionStorage.getItem(OPEN_KEY) === "1"); } catch {}
  }, []);
  const sample = MEDICINES.filter(m => isDue(m.schedule, m.start, EXAMPLE_DAY)).sort((a,b) => a.time.localeCompare(b.time));
  const quest = [...quests].filter(q => q.remindAt).sort((a,b) => (a.remindAt ?? "").localeCompare(b.remindAt ?? ""))[0];
  const left = sample.filter(m => !done.includes(m.id));
  const summary = sample.length === 0 ? "Nothing due. Enjoy the space."
    : left.length === 0 ? "All done for today. Lovely."
    : `${left.length} to do · next: ${left[0]!.name}, ${fmtTime(left[0]!.time)}`;
  const day = date ? date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }).replace(",", "") : "";
  return <details className="mm-card group p-[18px]" open={open} onToggle={e => {
    const o = (e.currentTarget as HTMLDetailsElement).open;
    setOpen(o);
    try { sessionStorage.setItem(OPEN_KEY, o ? "1" : "0"); } catch {}
  }}>
    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden"><CalendarDays className="size-5 shrink-0 text-sage" /><span className="flex min-w-0 flex-1 flex-col"><b className="font-display text-base">Today{day ? ` · ${day}` : ""}</b><span className="text-xs text-muted-foreground" aria-live="polite">{summary}</span></span><span aria-hidden="true" className="text-plum transition-transform group-open:rotate-180">⌄</span></summary>
    <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
    <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Sample routine</span><ExampleLabel /></div>
    {sample.map(m => <div key={m.id} className="flex items-center gap-3 border-b border-line pb-2.5"><PillIcon className="size-5 shrink-0 text-plum" /><div className="min-w-0 flex-1 text-sm"><b>{m.name}</b><p className="text-xs text-muted-foreground">{fmtTime(m.time)} · {m.amount}</p></div><Pill variant="ghost" className={`size-11 shrink-0 p-0 ${done.includes(m.id) ? "bg-sage-soft text-sage" : ""}`} aria-label={`Mark example ${m.name} done`} aria-pressed={done.includes(m.id)} onClick={() => setDone(d => d.includes(m.id) ? d.filter(id => id !== m.id) : [...d, m.id])}><Check className="size-4" /></Pill></div>)}
    {quest && <Link to="/side-quest" className="text-sm"><b>Next parked mission</b><p className="text-muted-foreground">{quest.doing} · {quest.remindAt ? new Date(quest.remindAt).toLocaleString("en-AU") : ""}</p></Link>}
    <Link to="/settings" className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-plum"><CalendarDays className="size-4" />Connect your calendar →</Link>
    </div>
  </details>;
}
