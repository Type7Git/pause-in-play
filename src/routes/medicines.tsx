import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, Clock, History, Lock, Pill as MedicineIcon, Plus, Search, Trash2, X } from "lucide-react";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { trackingHead } from "@/components/mm/TrackingShared";
import { FORM_LABEL, PATTERN_LABEL, TAG_LABEL, searchMedicines, type Form, type MedTag, type Medicine, type Pattern, type Schedule } from "@/content/medicines";
import { WEEKDAYS, cabinet, dayKey, describe, doseKey, dosesOn, planPhoneReminders, replaceBy, useCabinet, type CabinetEntry, type DoseStatus } from "@/lib/cabinet";
import { suggestMedicine, useMedicineList } from "@/lib/medicines-db";
import { isNativeApp } from "@/lib/native";

export const Route = createFileRoute("/medicines")({
  validateSearch: (s: Record<string, unknown>): { add?: 1 } => (s["add"] ? { add: 1 } : {}),
  head: () => trackingHead("Medicine cabinet", "Your medicines and supplements, on your schedule, with discreet reminders. Kept on your phone."),
  component: Medicines,
});

type Draft = { entry: CabinetEntry; med?: Medicine; isNew: boolean; suggest: boolean; tag: MedTag | null };
const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => dayKey(new Date());
const nowHM = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

function Medicines() {
  const { add } = Route.useSearch();
  const { entries, log } = useCabinet();
  const [view, setView] = useState<"today" | "cabinet" | "history">("today");
  const [finding, setFinding] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  useEffect(() => { if (add) setFinding(true); }, [add]);

  const startFrom = (med: Medicine | null, name: string, form: Form, tag: MedTag | null) => {
    setFinding(false);
    setDraft({
      isNew: true, suggest: !med, tag, ...(med ? { med } : {}),
      entry: { id: uid(), ...(med ? { medId: med.id } : {}), name: med?.name ?? name, form: med?.form ?? form, amount: "", schedule: structuredClone(med?.schedule ?? { pattern: "daily", times: ["08:00"] }), start: today(), remind: true, discreet: true },
    });
  };

  if (finding) return <FindMedicine onCancel={() => setFinding(false)} onPick={startFrom} />;
  if (draft) return <ScheduleEditor draft={draft} onDone={() => { setDraft(null); setView("today"); }} />;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <ScreenTitle eyebrow="Medicine cabinet" title="Your medicines, on your schedule." />
        <Pill size="sm" className="mt-1 shrink-0" onClick={() => setFinding(true)}><Plus className="size-4" />Add</Pill>
      </div>
      <p className="flex items-start gap-2 text-sm text-muted-foreground"><Lock className="mt-0.5 size-4 shrink-0 text-plum" aria-hidden="true" />Kept on this phone only. Lumenera never suggests medicines or doses: follow your prescriber or the label, and ask your pharmacist if you're unsure.</p>
      {entries.length ? <div className="flex flex-wrap gap-2" role="tablist" aria-label="Cabinet views">
        <Chip role="tab" aria-selected={view === "today"} pressed={view === "today"} onClick={() => setView("today")}><Clock className="mr-1 inline size-4" />Today</Chip>
        <Chip role="tab" aria-selected={view === "cabinet"} pressed={view === "cabinet"} onClick={() => setView("cabinet")}><MedicineIcon className="mr-1 inline size-4" />Cabinet{entries.length ? ` · ${entries.length}` : ""}</Chip>
        <Chip role="tab" aria-selected={view === "history"} pressed={view === "history"} onClick={() => setView("history")}><History className="mr-1 inline size-4" />History</Chip>
      </div> : null}
      {!entries.length ? (
        <Card className="items-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-plum-soft text-plum"><MedicineIcon className="size-7" aria-hidden="true" /></span>
          <h3>Your cabinet is empty</h3>
          <Muted>Add your medicines and supplements, set when you take them, and tick them off each day. Reminders can stay discreet.</Muted>
          <Pill onClick={() => setFinding(true)}><Plus className="size-4" />Add your first medicine</Pill>
        </Card>
      ) : view === "today" ? <TodayView entries={entries} log={log} onEdit={(e) => setDraft({ entry: structuredClone(e), isNew: false, suggest: false, tag: null })} />
        : view === "cabinet" ? <CabinetView entries={entries} onEdit={(e) => setDraft({ entry: structuredClone(e), isNew: false, suggest: false, tag: null })} />
        : <HistoryView entries={entries} log={log} />}
    </>
  );
}

/* ---------- Today ---------- */
function TodayView({ entries, log, onEdit }: { entries: CabinetEntry[]; log: Record<string, DoseStatus>; onEdit: (e: CabinetEntry) => void }) {
  const d = new Date();
  const doses = entries.flatMap((e) => dosesOn(e, d).map((t) => ({ e, t, key: doseKey(e, d, t) }))).sort((a, b) => a.t.localeCompare(b.t));
  const asNeeded = entries.filter((e) => e.schedule.pattern === "asNeeded");
  const devices = entries.filter((e) => e.schedule.pattern === "device");
  const taken = doses.filter((x) => log[x.key] === "done").length;
  return (
    <>
      {doses.length ? (
        <Card>
          <div className="flex items-baseline justify-between"><h3>Today</h3><span className="text-sm text-muted-foreground">{taken} of {doses.length} done</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-sunk" aria-hidden="true"><i className="petal-bar block h-full rounded-full transition-[width]" style={{ width: `${(taken / doses.length) * 100}%` }} /></div>
          {doses.map(({ e, t, key }) => {
            const s = log[key];
            return (
              <article key={key} className="flex flex-col gap-2 border-t border-line pt-3">
                <div className="flex items-start gap-3">
                  <span className="w-12 shrink-0 font-display text-lg text-plum tabular-nums">{t}</span>
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onEdit(e)}><b className="text-sm">{e.name}</b><span className="block text-xs text-muted-foreground">{e.amount || FORM_LABEL[e.form]}</span></button>
                  {s ? <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${s === "done" ? "bg-sage-soft text-sage" : s === "skip" ? "bg-sunk text-muted-foreground" : "bg-gold-soft text-ink"}`}>{s === "done" ? "Done" : s === "skip" ? "Skipped" : "Snoozed"}</span> : null}
                </div>
                <div className="flex flex-wrap gap-1.5 pl-[60px]">
                  <Pill variant={s === "done" ? undefined : "ghost"} size="sm" className="px-3 text-xs" aria-pressed={s === "done"} onClick={() => cabinet.mark(key, s === "done" ? null : "done")}><Check className="size-3.5" />Done</Pill>
                  <Pill variant="ghost" size="sm" className="px-3 text-xs" aria-pressed={s === "skip"} onClick={() => cabinet.mark(key, s === "skip" ? null : "skip")}><X className="size-3.5" />Skip</Pill>
                  <Pill variant="ghost" size="sm" className="px-3 text-xs" aria-pressed={s === "snooze"} onClick={() => cabinet.mark(key, s === "snooze" ? null : "snooze")}><Clock className="size-3.5" />Later</Pill>
                </div>
              </article>
            );
          })}
        </Card>
      ) : <Card><h3>Nothing scheduled today</h3><Muted>Enjoy a day off from your routine.</Muted></Card>}
      {asNeeded.length ? (
        <Card>
          <h3>When you need them</h3>
          {asNeeded.map((e) => {
            const todays = Object.keys(log).filter((k) => k.startsWith(`${today()}|${e.id}|`)).length;
            return (
              <div key={e.id} className="flex items-center gap-3 border-t border-line pt-3">
                <div className="min-w-0 flex-1"><b className="text-sm">{e.name}</b><span className="block text-xs text-muted-foreground">{todays ? `${todays} logged today` : e.amount || "Only when I need it"}</span></div>
                <Pill variant="ghost" size="sm" className="px-3 text-xs" onClick={() => cabinet.mark(`${today()}|${e.id}|${nowHM()}`, "done")}><Plus className="size-3.5" />Took one</Pill>
              </div>
            );
          })}
          <Muted className="text-xs">Check the label for the most you can take in a day.</Muted>
        </Card>
      ) : null}
      {devices.length ? (
        <Card>
          <h3>Long-lasting</h3>
          {devices.map((e) => {
            const by = replaceBy(e);
            const days = by ? Math.round((by.getTime() - Date.now()) / 864e5) : null;
            return (
              <button key={e.id} type="button" onClick={() => onEdit(e)} className="flex items-center gap-3 border-t border-line pt-3 text-left">
                <div className="min-w-0 flex-1"><b className="text-sm">{e.name}</b><span className="block text-xs text-muted-foreground">{by ? `Replace by ${by.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}` : "Long-lasting"}</span></div>
                {days !== null && days <= 60 ? <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${days < 0 ? "bg-rose-soft text-rose" : "bg-gold-soft text-ink"}`}>{days < 0 ? "Overdue" : "Due soon"}</span> : null}
              </button>
            );
          })}
        </Card>
      ) : null}
    </>
  );
}

/* ---------- Cabinet ---------- */
function CabinetView({ entries, onEdit }: { entries: CabinetEntry[]; onEdit: (e: CabinetEntry) => void }) {
  return (
    <Card>
      <h3>In your cabinet</h3>
      {[...entries].sort((a, b) => a.name.localeCompare(b.name)).map((e) => (
        <button key={e.id} type="button" onClick={() => onEdit(e)} className="flex gap-3 border-t border-line py-3 text-left">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-plum-soft text-plum"><MedicineIcon className="size-5" aria-hidden="true" /></span>
          <span className="min-w-0 flex-1">
            <b className="text-sm">{e.name}</b>{e.amount ? <span className="text-sm"> · {e.amount}</span> : null}
            <span className="mt-0.5 block text-xs text-muted-foreground">{describe(e.schedule)}{e.remind ? " · Reminders on" : ""}</span>
          </span>
          <span className="self-center text-sm font-bold text-plum">Edit</span>
        </button>
      ))}
    </Card>
  );
}

/* ---------- History ---------- */
function HistoryView({ entries, log }: { entries: CabinetEntry[]; log: Record<string, DoseStatus> }) {
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d; });
  const label: Record<DoseStatus, string> = { done: "Done", skip: "Skipped", snooze: "Later" };
  return (
    <Card>
      <h3>The last two weeks</h3>
      {days.map((d) => {
        const k = dayKey(d);
        const rows = [
          ...entries.flatMap((e) => dosesOn(e, d).map((t) => ({ name: e.name, t, s: log[doseKey(e, d, t)] }))),
          ...Object.entries(log).filter(([key]) => key.startsWith(`${k}|`)).map(([key, s]) => { const [, id, t] = key.split("|"); const e = entries.find((x) => x.id === id); return e && e.schedule.pattern === "asNeeded" ? { name: e.name, t: t!, s } : null; }).filter((x): x is { name: string; t: string; s: DoseStatus } => !!x),
        ].sort((a, b) => a.t.localeCompare(b.t));
        if (!rows.length) return null;
        return (
          <div key={k} className="border-t border-line pt-2.5">
            <p className="eyebrow mb-1">{d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "short" })}</p>
            {rows.map((r, i) => <div key={i} className="flex justify-between gap-2 py-0.5 text-sm"><span className="min-w-0">{r.t} · {r.name}</span><b className={r.s === "done" ? "text-sage" : "text-muted-foreground"}>{r.s ? label[r.s] : k === today() ? "Not yet" : "Not ticked"}</b></div>)}
          </div>
        );
      })}
    </Card>
  );
}

/* ---------- Find your medicine ---------- */
function FindMedicine({ onPick, onCancel }: { onPick: (m: Medicine | null, name: string, form: Form, tag: MedTag | null) => void; onCancel: () => void }) {
  const list = useMedicineList();
  const [q, setQ] = useState("");
  const [unsure, setUnsure] = useState(false);
  const [tag, setTag] = useState<MedTag | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [custom, setCustom] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);
  const results = useMemo(() => (q.trim() || tag || form ? searchMedicines(list.data ?? [], q, { ...(tag ? { tags: [tag] } : {}), form }) : []), [list.data, q, tag, form]);

  if (custom) return (
    <>
      <ScreenTitle eyebrow="Add a medicine" title={`Add "${q.trim()}"`} sub="Tell us a little about it so it goes in the right place. Both are optional." />
      <Card>
        <h3>What does it look like?</h3>
        <div className="flex flex-wrap gap-1.5">{(Object.keys(FORM_LABEL) as Form[]).map((f) => <Chip key={f} pressed={form === f} onClick={() => setForm(form === f ? null : f)}>{FORM_LABEL[f]}</Chip>)}</div>
        <h3>What's it for?</h3>
        <div className="flex flex-wrap gap-1.5">{(Object.keys(TAG_LABEL) as MedTag[]).map((t) => <Chip key={t} pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>{TAG_LABEL[t]}</Chip>)}</div>
        <Muted className="text-xs">We'll pass the name to our team so they can add it for everyone. Nothing that identifies you is sent.</Muted>
        <Pill onClick={() => onPick(null, q.trim(), form ?? "other", tag)}>Next: set your schedule</Pill>
        <Pill variant="ghost" onClick={() => setCustom(false)}>Back to search</Pill>
      </Card>
    </>
  );

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <ScreenTitle eyebrow="Add a medicine" title="Find your medicine" sub="Type the name on the box or label. Brand names work too." />
        <Pill variant="ghost" size="sm" className="mt-1 shrink-0" onClick={onCancel}>Cancel</Pill>
      </div>
      <label className="flex min-h-[52px] items-center gap-2.5 rounded-full border-[1.5px] border-line bg-card px-4 shadow-soft focus-within:border-plum">
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Medicine name</span>
        <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Estrogel, thyroxine, Mirena" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-base outline-none" />
      </label>
      {!unsure ? (
        <button type="button" className="self-start text-sm font-bold text-plum underline underline-offset-2" onClick={() => setUnsure(true)}>Not sure what it's called? Help me find it</button>
      ) : (
        <Card>
          <div className="flex items-center justify-between"><h3>Let's narrow it down</h3><button type="button" className="text-sm font-bold text-plum" onClick={() => { setUnsure(false); setTag(null); setForm(null); }}>Close</button></div>
          <p className="text-sm font-bold">What's it for?</p>
          <div className="flex flex-wrap gap-1.5">{(Object.keys(TAG_LABEL) as MedTag[]).map((t) => <Chip key={t} pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>{TAG_LABEL[t]}</Chip>)}</div>
          <p className="text-sm font-bold">What does it look like?</p>
          <div className="flex flex-wrap gap-1.5">{(Object.keys(FORM_LABEL) as Form[]).map((f) => <Chip key={f} pressed={form === f} onClick={() => setForm(form === f ? null : f)}>{FORM_LABEL[f]}</Chip>)}</div>
          <Muted className="text-xs">Still unsure? The name is on the box, the pharmacy label or your script, and your pharmacist can check for you.</Muted>
        </Card>
      )}
      {results.length ? (
        <Card>
          <p className="text-sm text-muted-foreground" aria-live="polite">{results.length > 30 ? "Showing the first 30" : `${results.length} ${results.length === 1 ? "match" : "matches"}`}</p>
          {results.slice(0, 30).map((m) => (
            <button key={m.id} type="button" onClick={() => onPick(m, m.name, m.form, null)} className="press flex gap-3 border-t border-line py-3 text-left">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-plum-soft text-plum"><MedicineIcon className="size-5" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><b className="text-sm">{m.name}</b><span className="block text-xs text-muted-foreground">{FORM_LABEL[m.form]}{m.alsoCalled.length ? ` · Also called ${m.alsoCalled.slice(0, 4).join(", ")}` : ""}</span></span>
            </button>
          ))}
        </Card>
      ) : q.trim() ? <Muted>No match for "{q.trim()}" yet.</Muted> : null}
      {q.trim().length >= 2 ? (
        <Card className="bg-sunk">
          <h3>Can't see yours?</h3>
          <Muted>Add it yourself. We'll let the team know so it's in the list for everyone.</Muted>
          <Pill variant="ghost" onClick={() => setCustom(true)}><Plus className="size-4" />Add "{q.trim()}"</Pill>
        </Card>
      ) : null}
    </>
  );
}

/* ---------- Schedule ---------- */
function ScheduleEditor({ draft, onDone }: { draft: Draft; onDone: () => void }) {
  const [e, setE] = useState<CabinetEntry>(draft.entry);
  const [status, setStatus] = useState("");
  const s = e.schedule;
  const setS = (p: Partial<Schedule>) => setE((x) => ({ ...x, schedule: { ...x.schedule, ...p } }));
  const needsTimes = !["device", "asNeeded"].includes(s.pattern);
  const needsDays = s.pattern === "weekdays" || s.pattern === "startup";
  const toggleDay = (d: string) => setS({ days: (s.days ?? []).includes(d) ? (s.days ?? []).filter((x) => x !== d) : WEEKDAYS.filter((w) => w === d || (s.days ?? []).includes(w)) });
  const num = (v: string) => Math.max(1, Math.min(999, Number(v) || 1));
  const save = async () => {
    cabinet.save(e);
    if (draft.suggest) void suggestMedicine(e.name, e.form, draft.tag);
    if (e.remind && isNativeApp()) {
      const r = await planPhoneReminders(true);
      if (r === "denied") { setStatus("Saved. Reminders are turned off for Lumenera in your phone's settings."); return; }
    }
    onDone();
  };
  const input = "min-h-11 rounded-[14px] border-[1.5px] border-line bg-card px-3 text-base";
  return (
    <>
      <ScreenTitle eyebrow={draft.isNew ? "Add a medicine" : "Edit"} title={e.name} sub={FORM_LABEL[e.form]} />
      {draft.med?.schedule.note || draft.med ? (
        <p className="rounded-2xl bg-plum-soft p-3.5 text-sm"><b className="block">We've started with the usual pattern.</b>{draft.med?.schedule.note ? `${draft.med.schedule.note} ` : ""}Change anything to match your prescriber or label.</p>
      ) : null}
      <Card>
        {draft.suggest ? <label className="flex flex-col gap-1.5 text-sm font-bold">Name<input className={input} value={e.name} maxLength={80} onChange={(ev) => setE({ ...e, name: ev.target.value })} /></label> : null}
        <label className="flex flex-col gap-1.5 text-sm font-bold">How much<input className={input} value={e.amount} maxLength={60} placeholder="e.g. 1 tablet, 2 pumps" onChange={(ev) => setE({ ...e, amount: ev.target.value })} /><span className="text-xs font-normal text-muted-foreground">Exactly as your prescriber or the label says.</span></label>
        <p className="text-sm font-bold">How often</p>
        <div className="grid grid-cols-2 gap-1.5">{(Object.keys(PATTERN_LABEL) as Pattern[]).map((p) => <Chip key={p} pressed={s.pattern === p} onClick={() => setS({ pattern: p, ...(p === "weekdays" && !s.days?.length ? { days: ["Mon"] } : {}) })} className="rounded-xl px-3 text-left text-[13px] leading-tight">{PATTERN_LABEL[p]}</Chip>)}</div>
        {s.pattern === "startup" ? <label className="flex items-center justify-between gap-3 text-sm">Daily for the first<span className="flex items-center gap-2"><input type="number" inputMode="numeric" className={`${input} w-20`} value={s.startupDays ?? 14} onChange={(ev) => setS({ startupDays: num(ev.target.value) })} />days, then</span></label> : null}
        {needsDays ? <div className="flex flex-wrap gap-1" role="group" aria-label="Days">{WEEKDAYS.map((d) => <Chip key={d} pressed={(s.days ?? []).includes(d)} onClick={() => toggleDay(d)}>{d}</Chip>)}</div> : null}
        {s.pattern === "everyN" ? <label className="flex items-center justify-between gap-3 text-sm">Every<span className="flex items-center gap-2"><input type="number" inputMode="numeric" className={`${input} w-20`} value={s.every ?? 3} onChange={(ev) => setS({ every: num(ev.target.value) })} />days</span></label> : null}
        {s.pattern === "cycle" ? (
          <div className="flex flex-wrap items-center gap-2 text-sm"><input type="number" inputMode="numeric" aria-label="Days on" className={`${input} w-20`} value={s.on ?? 21} onChange={(ev) => setS({ on: num(ev.target.value) })} />days on,<input type="number" inputMode="numeric" aria-label="Days off" className={`${input} w-20`} value={s.off ?? 7} onChange={(ev) => setS({ off: num(ev.target.value) })} />days off</div>
        ) : null}
        {s.pattern === "course" ? <label className="flex items-center justify-between gap-3 text-sm">For<span className="flex items-center gap-2"><input type="number" inputMode="numeric" className={`${input} w-20`} value={s.courseDays ?? 5} onChange={(ev) => setS({ courseDays: num(ev.target.value) })} />days</span></label> : null}
        {s.pattern === "device" ? <label className="flex items-center justify-between gap-3 text-sm">Replace every<span className="flex items-center gap-2"><input type="number" inputMode="numeric" className={`${input} w-20`} value={s.replaceMonths ?? 12} onChange={(ev) => setS({ replaceMonths: num(ev.target.value) })} />months</span></label> : null}
        {needsTimes ? (
          <>
            <p className="text-sm font-bold">At</p>
            <div className="flex flex-wrap gap-2">
              {(s.times?.length ? s.times : ["08:00"]).map((t, i) => (
                <span key={i} className="flex items-center gap-1">
                  <input type="time" aria-label={`Time ${i + 1}`} className={input} value={t} onChange={(ev) => setS({ times: (s.times?.length ? s.times : ["08:00"]).map((x, j) => (j === i ? ev.target.value : x)) })} />
                  {(s.times?.length ?? 1) > 1 ? <button type="button" aria-label={`Remove ${t}`} className="grid size-9 place-items-center rounded-full text-muted-foreground" onClick={() => setS({ times: (s.times ?? []).filter((_, j) => j !== i) })}><X className="size-4" /></button> : null}
                </span>
              ))}
              {(s.times?.length ?? 1) < 6 ? <Pill variant="ghost" size="sm" onClick={() => setS({ times: [...(s.times?.length ? s.times : ["08:00"]), "20:00"] })}><Plus className="size-4" />Add a time</Pill> : null}
            </div>
          </>
        ) : null}
        <label className="flex items-center justify-between gap-3 text-sm font-bold">{s.pattern === "device" ? "Put in or given on" : "Starting"}<input type="date" className={input} value={e.start} onChange={(ev) => setE({ ...e, start: ev.target.value || today() })} /></label>
        <p className="rounded-xl bg-sunk p-3 text-sm"><b>Your schedule: </b>{describe(s)}</p>
      </Card>
      {s.pattern !== "asNeeded" ? (
        <Card>
          <button type="button" role="switch" aria-checked={e.remind} onClick={() => setE({ ...e, remind: !e.remind })} className="flex items-center gap-3 text-left">
            <Bell className="size-5 shrink-0 text-plum" aria-hidden="true" /><span className="min-w-0 flex-1"><b className="block text-sm">Reminders</b><span className="text-xs text-muted-foreground">{isNativeApp() ? "A gentle nudge on this phone when it's time." : "Reminders arrive in the Lumenera app on your phone."}</span></span>
            <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${e.remind ? "bg-plum" : "bg-line"}`}><i className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${e.remind ? "translate-x-6" : "translate-x-1"}`} /></span>
          </button>
          <button type="button" role="switch" aria-checked={e.discreet} onClick={() => setE({ ...e, discreet: !e.discreet })} className="flex items-center gap-3 text-left">
            <Lock className="size-5 shrink-0 text-plum" aria-hidden="true" /><span className="min-w-0 flex-1"><b className="block text-sm">Discreet</b><span className="text-xs text-muted-foreground">Your lock screen says "{e.discreet ? "Time for your routine" : `Time for ${e.name}`}".</span></span>
            <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${e.discreet ? "bg-plum" : "bg-line"}`}><i className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${e.discreet ? "translate-x-6" : "translate-x-1"}`} /></span>
          </button>
        </Card>
      ) : null}
      {status ? <p role="status" className="text-sm text-muted-foreground">{status}</p> : null}
      <Pill onClick={() => void save()} disabled={!e.name.trim()}>{draft.isNew ? "Add to my cabinet" : "Save changes"}</Pill>
      <Pill variant="ghost" onClick={onDone}>Cancel</Pill>
      {!draft.isNew ? <Pill variant="ghost" className="text-rose" onClick={() => { cabinet.remove(e.id); void planPhoneReminders(); onDone(); }}><Trash2 className="size-4" />Remove from my cabinet</Pill> : null}
    </>
  );
}
