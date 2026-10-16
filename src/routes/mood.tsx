import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { DeviceNotice, trackingHead } from "@/components/mm/TrackingShared";
import { QUADRANTS, REFLECTION_NOTE, TAG_GROUPS, addMood, lastDays, moods, observations, removeMood, ymd } from "@/lib/tracking";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/mood")({ head: () => trackingHead("Mood Mapper", "A two-tap mood check-in, with gentle patterns over time. Kept on your phone."), component: Mood });

const q = (id: number) => QUADRANTS.find((x) => x.id === id);
function Mood() {
  const entries = moods.use();
  const { earn } = useRewards();
  const [selected, setSelected] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [saved, setSaved] = useState("");
  const quadrant = selected ? q(selected) : undefined;
  const toggle = (value: string, list: string[], setter: (v: string[]) => void) => setter(list.includes(value) ? list.filter((t) => t !== value) : [...list, value]);
  const days = lastDays(entries, 14);
  const notices = observations(entries.slice(-60));
  const save = () => {
    if (!quadrant) return;
    const first = !entries.some((e) => e.date === ymd(new Date()));
    addMood({ quadrant: quadrant.id, words, tags, ...(note.trim() ? { note: note.trim().slice(0, 280) } : {}) });
    if (first) earn(2, "Checked in with yourself");
    setSaved(`Saved: ${quadrant.name}.${first ? " Two petals for checking in." : ""}`);
    setSelected(null); setTags([]); setWords([]); setNote(""); setDay(ymd(new Date()));
  };
  const dayEntries = day ? entries.filter((e) => e.date === day) : [];

  return <>
    <ScreenTitle eyebrow="Mood Mapper" title="How are you, right now?" sub="Tap the square that fits best. Everything else is optional." />
    <DeviceNotice />
    <Card>
      <p className="text-xs text-muted-foreground">↑ More energy</p>
      <div className="grid grid-cols-2 gap-2.5">{QUADRANTS.map((x) => <Pill key={x.id} variant="ghost" aria-pressed={selected === x.id} onClick={() => { setSelected(x.id); setWords([]); setSaved(""); }} className={`aspect-square w-full rounded-[18px] border-2 p-4 text-center text-base ${x.tint} ${selected === x.id ? "border-plum" : "border-transparent"}`}>{x.name}</Pill>)}</div>
      <div className="flex justify-between text-xs text-muted-foreground"><span>← Less pleasant</span><span>More pleasant →</span></div><p className="text-xs text-muted-foreground">↓ Less energy</p>
      {quadrant && <div className="flex flex-col gap-4 border-t border-line pt-4">
        <div><p className="eyebrow mb-2">Closer to… (optional)</p><div className="flex flex-wrap gap-1.5">{quadrant.words.map((w) => <Chip key={w} pressed={words.includes(w)} onClick={() => toggle(w, words, setWords)}>{w}</Chip>)}</div></div>
        {TAG_GROUPS.map((g) => <div key={g.name}><p className="eyebrow mb-2">{g.name}</p><div className="flex flex-wrap gap-1.5">{g.tags.map((t) => <Chip key={t} pressed={tags.includes(t)} onClick={() => toggle(t, tags, setTags)}>{t}</Chip>)}</div></div>)}
        <label className="flex flex-col gap-1.5 text-sm font-bold">A note for yourself (optional)<textarea rows={2} maxLength={280} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything you want to remember about today" className="rounded-[14px] border-[1.5px] border-line bg-card px-3 py-2 text-base font-normal" /></label>
        <Pill onClick={save}>Save check-in</Pill>
      </div>}
      {saved && <p role="status" className="text-sm font-bold text-sage">{saved}</p>}
    </Card>
    <Card>
      <h3>Your last 2 weeks</h3>
      {entries.length ? <>
        <div className="grid grid-cols-7 gap-1.5">{days.map(({ date, entry }) => {
          const x = entry ? q(entry.quadrant) : undefined;
          return <button key={date} type="button" aria-pressed={day === date} onClick={() => setDay(day === date ? null : date)} aria-label={`${format(parseISO(date), "EEEE d MMMM")}: ${x?.name ?? "no check-in"}`} className={`press flex min-h-11 flex-col items-center gap-1 rounded-lg border-[1.5px] py-1 text-xs ${day === date ? "border-plum" : "border-transparent"}`}><span className={`size-5 rounded ${x ? x.solid : "border border-dashed border-line"}`} /><span>{format(parseISO(date), "EEEEE d")}</span></button>;
        })}</div>
        <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">{QUADRANTS.map((x) => <li key={x.id} className="flex items-center gap-1.5"><i className={`size-2.5 shrink-0 rounded ${x.solid}`} />{x.name}</li>)}</ul>
        {day && <div className="flex flex-col gap-2 border-t border-line pt-3"><b className="text-sm">{format(parseISO(day), "EEEE d MMMM")}</b>
          {dayEntries.length ? dayEntries.map((e) => <div key={e.id} className="flex items-start gap-2 text-sm"><span className="min-w-0 flex-1"><span className="text-muted-foreground">{format(parseISO(e.at), "h:mm a")} · </span><b>{q(e.quadrant)?.name}</b>{[...e.words, ...e.tags].length ? <span className="text-muted-foreground"> · {[...e.words, ...e.tags].join(", ")}</span> : null}{e.note ? <span className="mt-0.5 block italic text-muted-foreground">"{e.note}"</span> : null}</span><button type="button" aria-label="Delete this check-in" className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground" onClick={() => removeMood(e.id)}><Trash2 className="size-4" /></button></div>)
            : <Muted>No check-in that day.</Muted>}
        </div>}
      </> : <Muted>Your check-ins will show here as coloured squares, one for each day.</Muted>}
    </Card>
    <Card>
      <h3>Things you might notice</h3>
      {notices.length ? notices.slice(0, 2).map((line) => <p key={line} className="border-l-2 border-sage pl-3 text-sm">{line}</p>)
        : <Muted>After a few check-ins with tags, gentle patterns will show up here, like how sleep or a walk lines up with your mood.</Muted>}
      <Muted>{REFLECTION_NOTE}</Muted>
    </Card>
  </>;
}
