import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { ExampleConsent, ExampleLabel, TrackingNotice, trackingHead } from "@/components/mm/TrackingShared";
import { EXAMPLE_DAY } from "@/lib/tracking-examples";

export const Route = createFileRoute("/cycle")({ head: () => trackingHead("Cycle Tracker", "Explore a cycle calendar with example data, without fertility predictions or personal health saving."), component: Cycle });
const symptoms = ["Hot flushes", "Night sweats", "Headache", "Breast tenderness", "Bloating", "Joint aches", "Brain fog", "Poor sleep", "Low libido", "Vaginal dryness"];
function Cycle() {
  const [month, setMonth] = useState(parseISO(EXAMPLE_DAY));
  const [day, setDay] = useState<string | null>(null);
  const [flow, setFlow] = useState("Light");
  const [selected, setSelected] = useState<string[]>([]);
  const [spotting, setSpotting] = useState(false);
  const [hourly, setHourly] = useState(false);
  const [saved, setSaved] = useState(false);
  const [summary, setSummary] = useState(false);
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  return <><BackButton /><ScreenTitle eyebrow="Cycle Tracker" title="Your cycle, as it really is right now." sub="Cycles often get less predictable in perimenopause. This is a record to help you and your GP see the pattern." /><TrackingNotice />
    <Card><ExampleLabel /><div className="flex items-center justify-between"><Pill variant="ghost" className="size-11 p-0" aria-label="Previous month" onClick={() => setMonth(m => addMonths(m,-1))}><ChevronLeft className="size-5" /></Pill><h3>{format(month, "MMMM yyyy")}</h3><Pill variant="ghost" className="size-11 p-0" aria-label="Next month" onClick={() => setMonth(m => addMonths(m,1))}><ChevronRight className="size-5" /></Pill></div>
      <div className="grid grid-cols-7 gap-1">{["M","T","W","T","F","S","S"].map((d,i) => <span key={i} className="text-center text-xs text-muted-foreground">{d}</span>)}{Array.from({ length: (startOfMonth(month).getDay()+6)%7 }, (_,i) => <span key={`blank-${i}`} />)}{days.map(d => { const key = format(d, "yyyy-MM-dd"); const period = key >= "2026-09-19" && key <= "2026-09-23"; return <Pill key={key} variant="ghost" className={`aspect-square min-h-0 rounded-full p-0 text-sm ${period ? "bg-rose text-shell" : "border-transparent"} ${key === "2026-10-08" ? "border-2 border-rose" : ""} ${key === EXAMPLE_DAY ? "ring-2 ring-ink" : ""}`} aria-label={`Example ${format(d,"d MMMM")}`} disabled={key > EXAMPLE_DAY} onClick={() => { setDay(key); setSaved(false); }}>{d.getDate()}</Pill>; })}</div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span>● Period</span><span>○ Spotting</span><span>◉ Today</span></div><div className="flex flex-wrap gap-2"><Pill size="sm" onClick={() => { setDay(EXAMPLE_DAY); setSpotting(false); }}>Period started today</Pill><Pill variant="ghost" size="sm" onClick={() => { setDay(EXAMPLE_DAY); setSpotting(true); }}>Log spotting</Pill><Pill variant="ghost" size="sm" onClick={() => { setDay(EXAMPLE_DAY); setFlow("None"); }}>Period ended</Pill></div>
    </Card>
    {day && <Card><h3>Example daily log · {format(parseISO(day),"d MMM")}</h3><div className="flex flex-wrap gap-1.5">{["None","Light","Medium","Heavy","Very heavy"].map(f => <Chip key={f} pressed={flow === f} onClick={() => setFlow(f)}>{f}</Chip>)}</div><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={spotting} onChange={e => setSpotting(e.target.checked)} />Spotting</label><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={hourly} onChange={e => setHourly(e.target.checked)} />Changing protection every hour or less</label><div className="flex flex-wrap gap-1.5">{symptoms.map(s => <Chip key={s} pressed={selected.includes(s)} onClick={() => setSelected(l => l.includes(s) ? l.filter(v => v !== s) : [...l,s])}>{s}</Chip>)}</div><Pill onClick={() => setSaved(true)}>Try example save</Pill>{saved && <p role="status" className="text-sm text-sage">Example checked. No personal record saved.</p>}</Card>}
    <Card><div className="flex justify-between"><h3>Your pattern</h3><ExampleLabel /></div><div className="grid grid-cols-3 gap-3 text-center">{[["23","days since last period"],["38","days, last cycle"],["26–53","day range"]].map(([v,l]) => <div key={l}><b className="font-display text-xl text-plum">{v}</b><p className="mt-1 text-xs text-muted-foreground">{l}</p></div>)}</div><div className="flex h-32 items-end justify-around gap-5 border-b border-line px-4" aria-label="Example cycle lengths: 53, 26 and 38 days">{[53,26,38].map(n => <div key={n} className="flex w-12 flex-col justify-end text-center"><span className="text-xs text-muted-foreground">{n}</span><i className={`mt-1 rounded-t-lg bg-rose-soft ${n === 53 ? "h-24" : n === 26 ? "h-12" : "h-18"}`} /></div>)}</div><Muted>Your cycles vary, so this is a rough range. These examples vary widely; no expected window is shown. No fertility or ovulation predictions.</Muted></Card>
    <p className="border-l-4 border-rose bg-rose-soft p-3.5 text-sm">Very heavy bleeding, bleeding after sex, or bleeding after your periods have stopped are worth checking with your GP.</p>
    <Card><h3>Seeing your GP?</h3><Muted>A personal summary will be available once tracking opens.</Muted><Pill variant="sage" onClick={() => setSummary(v => !v)}><FileDown className="size-4" />Preview GP summary</Pill>{summary && <div className="border-t border-line pt-3"><ExampleLabel /><h3 className="mt-2">Pause in Play · GP summary</h3><p className="text-sm text-muted-foreground">Example only · Last 3 months<br />Recent cycles: 53, 26, 38 days<br />Flow: 4–6 days per period<br />No personal information included.</p></div>}</Card><ExampleConsent />
  </>;
}