import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Copy, FileDown, Share2 } from "lucide-react";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { DeviceNotice, trackingHead } from "@/components/mm/TrackingShared";
import { CYCLE_SYMPTOMS, FLOWS, cycle, cycleStats, gpSummary, setCycleDay, ymd, type CycleDay, type Flow } from "@/lib/tracking";

export const Route = createFileRoute("/cycle")({ head: () => trackingHead("Cycle Tracker", "Log periods, spotting and symptoms, see your own pattern, and take a summary to your GP. No fertility predictions. Kept on your phone."), component: Cycle });

const BLANK: CycleDay = { flow: "None", hourly: false, symptoms: [] };
const bleeding = (f?: Flow) => !!f && !["None", "Spotting"].includes(f);
function Cycle() {
  const log = cycle.use();
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(ymd(new Date())), []);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [day, setDay] = useState<string | null>(null);
  const [summary, setSummary] = useState(false);
  const [copied, setCopied] = useState("");
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const stats = cycleStats(log);
  const sel = day ? log[day] ?? BLANK : BLANK;
  const edit = (p: Partial<CycleDay>) => { if (day) setCycleDay(day, { ...sel, ...p }); };
  const quick = (flow: Flow) => { if (!today) return; setCycleDay(today, { ...(log[today] ?? BLANK), flow }); setDay(today); setMonth(startOfMonth(new Date())); };
  const text = summary ? gpSummary(log) : "";
  const share = async () => {
    try { if (navigator.share) { await navigator.share({ title: "My cycle summary", text }); return; } } catch { return; }
    await navigator.clipboard?.writeText(text).catch(() => undefined); setCopied("Copied. Paste it into a message or your notes.");
  };
  const maxBar = Math.max(...stats.lengths.slice(-6), 1);

  return <>
    <ScreenTitle eyebrow="Cycle Tracker" title="Your cycle, as it really is right now." sub="Periods, spotting and symptoms in one place. Whatever your stage, it's a record to help you and your GP see the pattern." />
    <DeviceNotice />
    <Card>
      <div className="flex items-center justify-between"><Pill variant="ghost" className="size-11 p-0" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))}><ChevronLeft className="size-5" /></Pill><h3>{format(month, "MMMM yyyy")}</h3><Pill variant="ghost" className="size-11 p-0" aria-label="Next month" disabled={!!today && format(month, "yyyy-MM") >= today.slice(0, 7)} onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="size-5" /></Pill></div>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="text-center text-xs text-muted-foreground">{d}</span>)}
        {Array.from({ length: (startOfMonth(month).getDay() + 6) % 7 }, (_, i) => <span key={`b${i}`} />)}
        {days.map((d) => {
          const key = ymd(d), e = log[key];
          const cls = bleeding(e?.flow) ? "bg-rose text-shell" : e?.flow === "Spotting" ? "border-2 border-rose" : "border-transparent";
          return <Pill key={key} variant="ghost" aria-pressed={day === key} aria-label={`${format(d, "d MMMM")}${e ? `: ${e.flow === "None" ? "symptoms" : e.flow.toLowerCase()}` : ""}`} disabled={!today || key > today} onClick={() => setDay(day === key ? null : key)}
            className={`relative aspect-square min-h-0 rounded-full p-0 text-sm ${cls} ${key === today ? "ring-2 ring-ink" : ""} ${day === key ? "outline outline-2 outline-offset-1 outline-plum" : ""}`}>
            {d.getDate()}{e?.symptoms.length && !bleeding(e.flow) ? <i className="absolute bottom-1 size-1 rounded-full bg-plum" aria-hidden="true" /> : null}
          </Pill>;
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span><i className="mr-1 inline-block size-2.5 rounded-full bg-rose align-middle" />Period</span><span><i className="mr-1 inline-block size-2.5 rounded-full border-2 border-rose align-middle" />Spotting</span><span><i className="mr-1 inline-block size-1.5 rounded-full bg-plum align-middle" />Symptoms</span><span>◉ Today</span></div>
      <div className="flex flex-wrap gap-2"><Pill size="sm" onClick={() => quick("Medium")}>Period today</Pill><Pill variant="ghost" size="sm" onClick={() => quick("Spotting")}>Spotting today</Pill><Pill variant="ghost" size="sm" onClick={() => { if (today) { setDay(today); setMonth(startOfMonth(new Date())); } }}>Log symptoms</Pill></div>
      <Muted className="text-xs">Tap any day to add or change it.</Muted>
    </Card>
    {day && <Card>
      <h3>{format(parseISO(day), "EEEE d MMMM")}</h3>
      <p className="text-sm font-bold">Bleeding</p>
      <div className="flex flex-wrap gap-1.5">{FLOWS.map((f) => <Chip key={f} pressed={sel.flow === f} onClick={() => edit({ flow: f })}>{f}</Chip>)}</div>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5 accent-[var(--mm-plum)]" checked={sel.hourly} onChange={(e) => edit({ hourly: e.target.checked })} />Changing pads, tampons or a cup every hour or less</label>
      <p className="text-sm font-bold">Symptoms</p>
      <div className="flex flex-wrap gap-1.5">{CYCLE_SYMPTOMS.map((s) => <Chip key={s} pressed={sel.symptoms.includes(s)} onClick={() => edit({ symptoms: sel.symptoms.includes(s) ? sel.symptoms.filter((v) => v !== s) : [...sel.symptoms, s] })}>{s}</Chip>)}</div>
      <p role="status" className="text-xs text-muted-foreground">{log[day] ? "Saved on this phone as you go." : "Nothing logged for this day."}</p>
      {log[day] ? <Pill variant="ghost" size="sm" className="self-start" onClick={() => setCycleDay(day, null)}>Clear this day</Pill> : null}
    </Card>}
    <Card>
      <h3>Your pattern</h3>
      {stats.periods.length ? <>
        <div className="grid grid-cols-3 gap-3 text-center">{([[stats.sinceLast ?? "–", "days since your last period started"], [stats.lastLength ?? "–", "days, your last cycle"], [stats.range ? `${stats.range[0]}–${stats.range[1]}` : "–", "day range"]] as const).map(([v, l]) => <div key={l}><b className="font-display text-xl text-plum">{v}</b><p className="mt-1 text-xs text-muted-foreground">{l}</p></div>)}</div>
        {stats.lengths.length ? <div className="flex h-32 items-end justify-around gap-3 border-b border-line px-2" role="img" aria-label={`Recent cycle lengths: ${stats.lengths.slice(-6).join(", ")} days`}>{stats.lengths.slice(-6).map((n, i) => <div key={i} className="flex w-10 flex-col justify-end text-center"><span className="text-xs text-muted-foreground">{n}</span><i className="mt-1 block rounded-t-lg bg-rose-soft" style={{ height: `${Math.max(8, (n / maxBar) * 96)}px` }} /></div>)}</div> : <Muted>Log your next period start to see your first cycle length.</Muted>}
        <Muted>Cycles often vary a lot around perimenopause, so this is your real range, not a prediction. Lumenera never predicts fertility or ovulation.</Muted>
      </> : <Muted>Log a period and your pattern will start to build here: days since your last period, cycle lengths and your range.</Muted>}
    </Card>
    <p className="border-l-4 border-rose bg-rose-soft p-3.5 text-sm">Very heavy bleeding, bleeding after sex, or bleeding after your periods have stopped are worth checking with your GP.</p>
    <Card>
      <h3>Seeing your GP?</h3>
      <Muted>Make a short summary of the last three months from what you've logged. It has no name or account details.</Muted>
      <Pill variant="sage" disabled={!Object.keys(log).length} onClick={() => { setSummary((v) => !v); setCopied(""); }}><FileDown className="size-4" />{summary ? "Hide summary" : "Make my GP summary"}</Pill>
      {summary && <div className="flex flex-col gap-2 border-t border-line pt-3">
        <pre className="whitespace-pre-wrap rounded-xl bg-sunk p-3 font-sans text-sm">{text}</pre>
        <div className="flex flex-wrap gap-2"><Pill size="sm" onClick={() => void share()}><Share2 className="size-4" />Share</Pill><Pill variant="ghost" size="sm" onClick={() => void navigator.clipboard?.writeText(text).then(() => setCopied("Copied."), () => setCopied("Couldn't copy. Select the text instead."))}><Copy className="size-4" />Copy</Pill></div>
        {copied && <p role="status" className="text-sm text-muted-foreground">{copied}</p>}
      </div>}
    </Card>
  </>;
}
