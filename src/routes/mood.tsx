import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { ExampleConsent, ExampleLabel, TrackingNotice, trackingHead } from "@/components/mm/TrackingShared";
import { MOODS, QUADRANTS, TAG_GROUPS, REFLECTION_NOTE, observations } from "@/lib/tracking-examples";
import { SproutMic } from "@/components/mm/icons";

export const Route = createFileRoute("/mood")({ head: () => trackingHead("Mood Mapper", "Explore a two-tap mood map with clearly labelled examples. Personal health saving is not enabled."), component: Mood });
function Mood() {
  const [selected, setSelected] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [day, setDay] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const quadrant = QUADRANTS.find(q => q.id === selected);
  const toggle = (value: string, list: string[], setter: (v: string[]) => void) => setter(list.includes(value) ? list.filter(t => t !== value) : [...list, value]);
  return <><BackButton /><ScreenTitle eyebrow="Mood Mapper" title="How are you, right now?" sub="Tap the square that fits best. Everything else is optional." /><TrackingNotice />
    <Card><div className="flex items-center justify-between text-xs text-muted-foreground"><span>↑ More energy</span><ExampleLabel /></div>
      <div className="grid grid-cols-2 gap-2.5">{QUADRANTS.map(q => <Pill key={q.id} variant="ghost" aria-pressed={selected === q.id} onClick={() => { setSelected(q.id); setWords([]); setSaved(false); }} className={`aspect-square w-full rounded-[18px] border-2 p-4 text-center text-base ${q.tint} ${selected === q.id ? "border-plum" : "border-transparent"}`}>{q.name}</Pill>)}</div>
      <div className="flex justify-between text-xs text-muted-foreground"><span>← Less pleasant</span><span>More pleasant →</span></div><p className="text-xs text-muted-foreground">↓ Less energy</p>
      {quadrant && <div className="flex flex-col gap-4 border-t border-line pt-4"><div><p className="eyebrow mb-2">Closer to… (optional)</p><div className="flex flex-wrap gap-1.5">{quadrant.words.map(word => <Chip key={word} pressed={words.includes(word)} onClick={() => toggle(word, words, setWords)}>{word}</Chip>)}</div></div>
        {TAG_GROUPS.map(group => <div key={group.name}><p className="eyebrow mb-2">{group.name}</p><div className="flex flex-wrap gap-1.5">{group.tags.map(tag => <Chip key={tag} pressed={tags.includes(tag)} onClick={() => toggle(tag, tags, setTags)}>{tag}</Chip>)}</div></div>)}
        <div className="flex items-center gap-2 rounded-input border border-line bg-sunk p-3 text-sm text-muted-foreground"><SproutMic className="size-5 shrink-0" /><span>Personal notes, voice and custom tags are unavailable in this example.</span></div>
        <Pill onClick={() => setSaved(true)}>Try example save</Pill>{saved && <p role="status" className="text-sm text-sage">Example checked: {quadrant.name}. Nothing saved; no petals added.</p>}
      </div>}
    </Card>
    <Card><div className="flex items-center justify-between"><h3>Your last 2 weeks</h3><ExampleLabel /></div><div className="grid grid-cols-7 gap-2">{MOODS.map(m => <Pill key={m.date} variant="ghost" className="min-h-11 flex-col gap-1 rounded-lg px-0 py-1 text-xs" aria-label={`Example ${format(parseISO(m.date), "d MMM")}: ${QUADRANTS.find(q => q.id === m.quadrant)?.name}`} onClick={() => setDay(m.date)}><span className={`size-5 rounded ${QUADRANTS.find(q => q.id === m.quadrant)?.solid}`} /><span>{format(parseISO(m.date), "EEEEE d")}</span></Pill>)}</div>
      <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">{QUADRANTS.map(q => <li key={q.id} className="flex items-center gap-1.5"><i className={`size-2.5 shrink-0 rounded ${q.solid}`} />{q.name}</li>)}</ul>
      {day && <div className="border-t border-line pt-3"><b className="text-sm">Example · {format(parseISO(day), "d MMMM")}</b>{MOODS.filter(m => m.date === day).map(m => <p key={m.date} className="text-sm text-muted-foreground">{QUADRANTS.find(q => q.id === m.quadrant)?.name} · {m.tags.join(", ")}</p>)}</div>}
    </Card>
    <Card><div className="flex flex-wrap items-center justify-between gap-2"><h3>Things you might notice</h3><ExampleLabel /></div>{observations(MOODS).slice(0,2).map(line => <p key={line} className="border-l-2 border-sage pl-3 text-sm">{line}</p>)}<Muted>{REFLECTION_NOTE}</Muted></Card><ExampleConsent />
  </>;
}