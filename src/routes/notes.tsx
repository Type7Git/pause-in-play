import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Shuffle, Share2 } from "lucide-react";
import { BackButton } from "@/components/mm/BackButton";
import { NoteCard } from "@/components/mm/NoteCard";
import { ShareSheet } from "@/components/mm/ShareSheet";
import { Card, Chip, Muted, ScreenTitle } from "@/components/mm/ui";
import { Switch } from "@/components/ui/switch";
import { NOTES, NOTE_KINDS, noteById, styleFor, type Note, type NoteKind } from "@/content/notes";
import { FREQ_LABEL, noteOfTheDay, pickNote, type NoteFreq, type NotePrefs } from "@/lib/notes";
import { localTz, phoneCanNotify, readNotes, receivedNotes, scheduleOnPhone, writeNotes } from "@/lib/notes-device";
import { saveLittleNotes } from "@/lib/notes.functions";
import { enablePush } from "@/lib/push";
import { savePushToken } from "@/lib/push.functions";
import { useRewards } from "@/lib/rewards";
import { renderCard } from "@/lib/share-cards";
import { shareOrigin, type SharePayload } from "@/lib/share";

export const Route = createFileRoute("/notes")({
  validateSearch: (s: Record<string, unknown>): { card?: string } => (typeof s["card"] === "string" ? { card: s["card"] } : {}),
  head: () => ({
    meta: [
      { title: "Little notes · Lumenera" },
      { name: "description", content: "Kind, real words of encouragement, understanding and support, sent now and then." },
      { property: "og:title", content: "Little notes · Lumenera" },
      { property: "og:description", content: "Kind words that turn up when you need them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Notes,
});

const FROM = [6, 7, 8, 9, 10, 11, 12];
const TO = [16, 17, 18, 19, 20, 21, 22];
const hour = (h: number) => (h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`);

function Notes() {
  const { card } = Route.useSearch();
  const { user } = useRewards();
  const [kind, setKind] = useState<NoteKind | "all">("all");
  const list = useMemo(() => (kind === "all" ? NOTES : NOTES.filter((n) => n.kind === kind)), [kind]);
  const arrived = noteById(card);
  const [note, setNote] = useState<Note>(() => arrived ?? noteOfTheDay());
  const [sharing, setSharing] = useState<SharePayload | null>(null);
  const swipe = useRef<number | null>(null);

  const step = (d: number) => {
    const i = list.indexOf(note);
    setNote(list[(i < 0 ? 0 : i + d + list.length) % list.length]!);
  };
  const random = () => setNote(pickNote([note.id], Math.random));
  useEffect(() => { if (!list.includes(note)) setNote(list[0]!); }, [list, note]);

  const share = () => {
    const s = styleFor(note);
    setSharing({
      title: "A little note",
      text: `"${note.text}" A little note from Lumenera.`,
      palText: `Thought you might need this today: "${note.text}"`,
      url: `${shareOrigin()}/notes?card=${note.id}`,
      fileName: "a-little-note.png",
      image: () => renderCard({ eyebrow: NOTE_KINDS.find((k) => k.key === note.kind)?.name ?? "A little note", body: note.text, tint: s.bg.match(/#[0-9A-F]{6}/i)?.[0] }),
    });
  };

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Little notes" title="Kind words, now and then." sub="Encouragement, understanding, support and a bit of wisdom. Just keeping it real." />

      <section aria-label="Note cards" className="flex flex-col gap-3">
        {arrived && note.id === arrived.id && <p className="eyebrow text-center">A note for you</p>}
        <div
          onPointerDown={(e: PointerEvent) => { swipe.current = e.clientX; }}
          onPointerUp={(e: PointerEvent) => { if (swipe.current !== null && Math.abs(e.clientX - swipe.current) > 50) step(e.clientX < swipe.current ? 1 : -1); swipe.current = null; }}
          className="touch-pan-y select-none"
        >
          <div key={note.id} className="sprout-option" aria-live="polite"><NoteCard note={note} /></div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button type="button" aria-label="Previous note" onClick={() => step(-1)} className="press grid size-12 place-items-center rounded-full border border-line bg-card text-plum shadow-soft"><ChevronLeft className="size-5" /></button>
          <button type="button" onClick={random} className="press flex min-h-12 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-card px-3.5 text-sm font-bold text-plum shadow-soft"><Shuffle className="size-4" aria-hidden="true" />Another</button>
          <button type="button" onClick={share} className="press flex min-h-12 items-center gap-2 whitespace-nowrap rounded-full bg-plum px-3.5 text-sm font-bold text-shell shadow-soft"><Share2 className="size-4" aria-hidden="true" />Share</button>
          <button type="button" aria-label="Next note" onClick={() => step(1)} className="press grid size-12 place-items-center rounded-full border border-line bg-card text-plum shadow-soft"><ChevronRight className="size-5" /></button>
        </div>
        <div role="group" aria-label="Kind of note" className="flex flex-wrap justify-center gap-1.5">
          <Chip pressed={kind === "all"} onClick={() => setKind("all")}>All</Chip>
          {NOTE_KINDS.map((k) => <Chip key={k.key} pressed={kind === k.key} onClick={() => setKind(k.key)}>{k.name}</Chip>)}
        </div>
      </section>

      <NoteSettings signedIn={!!user} />
      <Received />
      <ShareSheet open={!!sharing} payload={sharing} onClose={() => setSharing(null)} />
    </>
  );
}

function NoteSettings({ signedIn }: { signedIn: boolean }) {
  const [prefs, setPrefs] = useState<NotePrefs | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [app, setApp] = useState(false);
  useEffect(() => { const s = readNotes(); setPrefs({ on: s.on, freq: s.freq, from: s.from, to: s.to }); setApp(phoneCanNotify()); }, []);
  if (!prefs) return null;

  const save = async (next: NotePrefs) => {
    setPrefs(next);
    setBusy(true);
    writeNotes({ ...readNotes(), ...next });
    try {
      if (app) {
        const r = await scheduleOnPhone(next, true);
        setStatus(r === "scheduled" ? `All set. Notes will pop up on this phone, ${FREQ_LABEL[next.freq].toLowerCase()}, between ${hour(next.from)} and ${hour(next.to)}.`
          : r === "off" ? "Notes are off. You can still read them here any time."
          : r === "denied" ? "Your phone has notifications turned off for Lumenera. Turn them on in your phone's settings, then try again."
          : "Something went wrong setting up notes on this phone.");
      } else if (signedIn) {
        if (next.on) {
          const p = await enablePush();
          if (p.status === "registered") await savePushToken({ data: { token: p.token } });
          else { setStatus(p.status === "denied" ? "Notifications are blocked in this browser. Allow them for this site, or use the Lumenera app." : "This browser can't show notifications. The Lumenera app can."); }
          await saveLittleNotes({ data: { ...next, tz: localTz() } });
          if (p.status === "registered") setStatus(`All set. Notes will arrive in this browser, ${FREQ_LABEL[next.freq].toLowerCase()}, between ${hour(next.from)} and ${hour(next.to)}.`);
        } else {
          await saveLittleNotes({ data: { ...next, tz: localTz() } });
          setStatus("Notes are off. You can still read them here any time.");
        }
      } else {
        setStatus(next.on ? "To send notes to you, use the Lumenera app, or sign in so we can send them to this browser." : "");
      }
    } catch {
      setStatus("That didn't save. Please try again.");
    }
    setBusy(false);
  };

  const sel = "min-h-11 rounded-[14px] border border-line bg-sunk px-3 font-bold";
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Send me little notes</h2>
          <Muted>At random times, inside the hours you choose.</Muted>
        </div>
        <Switch checked={prefs.on} disabled={busy} onCheckedChange={(on) => void save({ ...prefs, on })} aria-label="Send me little notes" />
      </div>
      {prefs.on && (
        <>
          <div role="radiogroup" aria-label="How often" className="flex flex-wrap gap-1.5">
            {(Object.keys(FREQ_LABEL) as NoteFreq[]).map((f) => <Chip key={f} role="radio" aria-checked={prefs.freq === f} pressed={prefs.freq === f} onClick={() => void save({ ...prefs, freq: f })}>{FREQ_LABEL[f]}</Chip>)}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>Between</span>
            <select aria-label="From" className={sel} value={prefs.from} onChange={(e) => void save({ ...prefs, from: Number(e.target.value) })}>{FROM.map((h) => <option key={h} value={h}>{hour(h)}</option>)}</select>
            <span>and</span>
            <select aria-label="Until" className={sel} value={prefs.to} onChange={(e) => void save({ ...prefs, to: Number(e.target.value) })}>{TO.map((h) => <option key={h} value={h}>{hour(h)}</option>)}</select>
          </div>
        </>
      )}
      {status && <p role="status" className="rounded-2xl bg-sunk p-3 text-sm">{status}{!signedIn && !app && prefs.on && <> <Link to="/settings" className="font-bold text-plum underline">Sign in</Link></>}</p>}
      <p className="text-[12px] text-muted-foreground">Notes are picked at random. Nothing about you is used to choose them, and nothing you do here is tracked.</p>
    </Card>
  );
}

function Received() {
  const [list, setList] = useState<ReturnType<typeof receivedNotes>>([]);
  useEffect(() => setList(receivedNotes()), []);
  if (!list.length) return null;
  return (
    <Card>
      <h2 className="font-display text-lg font-bold">Notes you've had lately</h2>
      <ul className="flex flex-col gap-2">
        {list.map((n) => (
          <li key={`${n.id}-${n.at}`} className="rounded-2xl bg-sunk p-3 text-sm">
            <span className="block text-[11.5px] font-bold text-muted-foreground">{new Date(n.at).toLocaleString("en-AU", { weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
            {n.text}
          </li>
        ))}
      </ul>
    </Card>
  );
}
