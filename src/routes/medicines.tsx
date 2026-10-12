import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pill as MedicineIcon, Check, Clock, X, Plus, History } from "lucide-react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { ExampleConsent, ExampleLabel, TrackingNotice, trackingHead } from "@/components/mm/TrackingShared";
import { MEDICINES, MEDICINE_NOTE } from "@/lib/tracking-examples";

export const Route = createFileRoute("/medicines")({ head: () => trackingHead("Medicine Cabinet", "Explore medicine reminder examples. No medicine or dose recommendations and no personal records saved."), component: Medicines });
const patterns = ["Every day", "Certain days of the week", "Every N days", "Days on, days off", "A start-up, then ongoing", "Long-term device or injection", "Only when I need it"];
function Medicines() {
  const [view, setView] = useState("cabinet");
  const [pattern, setPattern] = useState(patterns[0] ?? "Every day");
  const [status, setStatus] = useState<Record<string,string>>({});
  const [discreet, setDiscreet] = useState(true);
  const [days, setDays] = useState(["Mon", "Thu"]);
  return <><BackButton /><ScreenTitle eyebrow="Medicine Cabinet" title="Your medicines and supplements, on your schedule." /><p className="border-l-4 border-plum bg-plum-soft p-3.5 text-sm">{MEDICINE_NOTE}</p><TrackingNotice />
    <div className="flex flex-wrap gap-2"><Chip pressed={view === "cabinet"} onClick={() => setView("cabinet")}><MedicineIcon className="mr-1 inline size-4" />Cabinet</Chip><Chip pressed={view === "history"} onClick={() => setView("history")}><History className="mr-1 inline size-4" />History</Chip></div>
    {view === "history" ? <Card><ExampleLabel /><h3>Example dose history</h3>{MEDICINES.filter(m => m.time).map(m => <div key={m.id} className="flex items-center justify-between border-b border-line pb-2 text-sm"><span>{m.name}<small className="block text-muted-foreground">12 Oct · {m.time}</small></span><b className="text-sage">{status[m.id] ?? "Not logged"}</b></div>)}<Muted>Example actions stay on this page only.</Muted></Card> : <Card><div className="flex justify-between"><h3>In your cabinet</h3><ExampleLabel /></div>{MEDICINES.map(m => <article key={m.id} className="flex gap-3 border-b border-line py-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-plum-soft text-plum"><MedicineIcon className="size-5" /></span><div className="min-w-0 flex-1"><b className="text-sm">{m.name}</b><span className="text-sm">{m.amount ? ` · ${m.amount}` : ""}</span><p className="mt-1 text-xs text-muted-foreground">{m.summary}{m.time ? ` · ${m.time}` : ""}</p>
      {m.id === "capsule" && <div className="mt-2 grid grid-cols-14 gap-0.5" aria-label="Example 12 on-days in a 28-day cycle">{Array.from({ length: 28 }, (_,i) => <i key={i} className={`h-2 rounded-sm ${i === 4 ? "bg-ink" : i < 12 ? "bg-plum" : "bg-sunk"}`} />)}</div>}
      {m.id === "pessary" && <div className="mt-2 grid grid-cols-7 gap-1">{["M", "T", "W", "T", "F", "S", "S"].map((d,i) => <span key={i} className={`rounded py-1 text-center text-xs ${[0,3].includes(i) ? "bg-plum-soft text-plum" : "bg-sunk text-muted-foreground"}`}>{d}</span>)}</div>}
      {m.supply && <p className="mt-2 text-xs text-muted-foreground">Example supply · {m.supply} days left</p>}
      {m.time && <div className="mt-2 flex flex-wrap gap-1.5">{[["Done", Check], ["Skip", X], ["Snooze 30 min", Clock]].map(([label, Icon]) => { const I = Icon as typeof Check; const text = String(label); return <Pill key={text} variant="ghost" size="sm" className="px-2.5 text-xs" onClick={() => setStatus(s => ({ ...s, [m.id]: text }))}><I className="size-3.5" />{text}</Pill>; })}</div>}
      {status[m.id] && <p role="status" className="mt-1 text-xs text-sage">Example: {status[m.id]}. No reminder sent.</p>}
    </div></article>)}<Pill variant="ghost" onClick={() => setView("form")}><Plus className="size-4" />Explore an example schedule</Pill></Card>}
    {view === "form" && <Card><h3>Example schedule</h3><Muted>Oestrogen gel · 2 pumps. These are sample details, not instructions for you.</Muted><div className="flex flex-col gap-2">{patterns.map(p => <Chip key={p} pressed={pattern === p} onClick={() => setPattern(p)} className="rounded-xl text-left">{p}</Chip>)}</div>
      {(pattern === "Certain days of the week" || pattern === "A start-up, then ongoing") && <div className="flex flex-wrap gap-1">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <Chip key={d} pressed={days.includes(d)} onClick={() => setDays(l => l.includes(d) ? l.filter(v => v !== d) : [...l,d])}>{d}</Chip>)}</div>}
      {pattern === "Every N days" && <Muted>Example: every 3 days, starting 12 October.</Muted>}{pattern === "Days on, days off" && <Muted>Example: 12 days on in every 28; today is day 5.</Muted>}{pattern === "A start-up, then ongoing" && <Muted>Example: daily for 14 days, then on the selected days.</Muted>}{pattern === "Long-term device or injection" && <Muted>Example replacement date: 12 March 2029. Nudges one month and one week before.</Muted>}{pattern === "Only when I need it" && <Muted>No scheduled reminders.</Muted>}
      <Pill variant="ghost" role="switch" aria-checked={discreet} onClick={() => setDiscreet(v => !v)}>Discreet mode: {discreet ? "On" : "Off"}</Pill><p className="rounded-xl bg-sunk p-3 text-sm">Example lock screen: {discreet ? "Time for your morning routine" : "Time for: Oestrogen gel · 2 pumps"}</p><Pill onClick={() => setView("cabinet")}>Back to example cabinet</Pill>
    </Card>}<ExampleConsent />
  </>;
}