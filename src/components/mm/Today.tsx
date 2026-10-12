import { Link } from "@tanstack/react-router";
import { CalendarDays, Check, Pill as PillIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRewards } from "@/lib/rewards";
import { EXAMPLE_DAY, MEDICINES, isDue } from "@/lib/tracking-examples";
import { Pill } from "./ui";
import { ExampleLabel } from "./TrackingShared";

export function Today() {
  const { quests } = useRewards();
  const [date, setDate] = useState<Date | null>(null);
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => setDate(new Date()), []);
  const sample = MEDICINES.filter(m => isDue(m.schedule, m.start, EXAMPLE_DAY)).sort((a,b) => a.time.localeCompare(b.time));
  const quest = [...quests].filter(q => q.remindAt).sort((a,b) => (a.remindAt ?? "").localeCompare(b.remindAt ?? ""))[0];
  return <section className="mm-card flex flex-col gap-3 p-[18px]">
    <div className="flex items-center gap-2"><CalendarDays className="size-5 text-sage" /><h3>Today{date ? ` · ${date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}` : ""}</h3></div>
    <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Sample routine · 12 Oct</span><ExampleLabel /></div>
    {sample.map(m => <div key={m.id} className="flex items-center gap-3 border-b border-line pb-2.5"><PillIcon className="size-5 shrink-0 text-plum" /><div className="min-w-0 flex-1 text-sm"><b>{m.name}</b><p className="text-xs text-muted-foreground">{m.time} · {m.amount}</p></div><Pill variant="ghost" className={`size-11 shrink-0 p-0 ${done.includes(m.id) ? "bg-sage-soft text-sage" : ""}`} aria-label={`Mark example ${m.name} done`} aria-pressed={done.includes(m.id)} onClick={() => setDone(d => d.includes(m.id) ? d.filter(id => id !== m.id) : [...d, m.id])}><Check className="size-4" /></Pill></div>)}
    {quest && <Link to="/side-quest" className="text-sm"><b>Next parked mission</b><p className="text-muted-foreground">{quest.doing} · {quest.remindAt ? new Date(quest.remindAt).toLocaleString("en-AU") : ""}</p></Link>}
    {!quest && <p className="text-xs text-muted-foreground">No personal reminders due. Enjoy the space.</p>}
    <Link to="/settings" className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-plum"><CalendarDays className="size-4" />Connect your calendar →</Link>
  </section>;
}