import { NOTE_KINDS, styleFor, type Note } from "@/content/notes";

function Art({ kind, colour }: { kind: string; colour: string }) {
  const c = { fill: colour, opacity: 0.22 };
  switch (kind) {
    case "petals": return <g {...c}>{[0, 60, 120, 180, 240, 300].map((d) => <ellipse key={d} cx="50" cy="32" rx="9" ry="16" transform={`rotate(${d} 50 50)`} />)}<circle cx="50" cy="50" r="7" /></g>;
    case "leaf": return <g {...c}><path d="M20 80 C20 40 50 15 85 15 C85 50 60 80 20 80Z" /><path d="M20 80 L70 30" stroke={colour} strokeWidth="3" /></g>;
    case "sun": return <g {...c}><circle cx="50" cy="50" r="18" />{Array.from({ length: 10 }, (_, i) => <rect key={i} x="48" y="10" width="4" height="14" rx="2" transform={`rotate(${i * 36} 50 50)`} />)}</g>;
    case "moon": return <g {...c}><path d="M64 78A32 32 0 0 1 40 18 32 32 0 1 0 64 78z" /><circle cx="80" cy="22" r="3" /><circle cx="22" cy="70" r="2.5" /></g>;
    case "wave": return <g fill="none" stroke={colour} strokeOpacity=".28" strokeWidth="5" strokeLinecap="round">{[30, 50, 70].map((y) => <path key={y} d={`M8 ${y} q14 -12 28 0 t28 0 t28 0`} />)}</g>;
    default: return <g {...c}><path d="M50 82 C14 58 14 26 34 22 C44 20 50 28 50 34 C50 28 56 20 66 22 C86 26 86 58 50 82Z" /></g>;
  }
}

/** A little note as a picture card. */
export function NoteCard({ note, className = "" }: { note: Note; className?: string }) {
  const s = styleFor(note);
  const kind = NOTE_KINDS.find((k) => k.key === note.kind)?.name ?? "";
  return (
    <figure className={`relative flex min-h-[290px] w-full flex-col overflow-hidden rounded-[26px] p-6 shadow-lift ${className}`} style={{ background: s.bg, color: s.ink }}>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute -right-4 -top-4 size-36"><Art kind={s.art} colour={s.accent} /></svg>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute -bottom-6 -left-6 size-28 rotate-180"><Art kind={s.art} colour={s.accent} /></svg>
      <figcaption className="relative text-xs font-bold uppercase tracking-[0.12em]" style={{ color: s.accent }}>{kind}</figcaption>
      <blockquote className="relative my-auto font-display text-[clamp(22px,6.4vw,28px)] font-bold leading-[1.22] tracking-[-0.01em]">{note.text}</blockquote>
      <p className="relative text-sm font-extrabold" style={{ color: s.accent }}>Lumenera</p>
    </figure>
  );
}
