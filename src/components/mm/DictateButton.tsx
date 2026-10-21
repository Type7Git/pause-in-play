import { useEffect, useRef, useState } from "react";
import { SproutMic } from "@/components/mm/icons";
import { listen, voiceSupported } from "@/lib/speech";

/**
 * Small mic button that dictates into a single field, using the shared voice helper
 * (live recognition where it works, else a short clip transcribed on the server and discarded).
 */
export function DictateButton({ onText, label }: { onText: (text: string) => void; label: string }) {
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState("");
  const [supported, setSupported] = useState(true);
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!voiceSupported()) setSupported(false);
    return () => stopRef.current();
  }, []);

  const toggle = async () => {
    if (listening) { stopRef.current(); return; }
    setNote(""); setListening(true);
    const h = await listen({
      silenceMs: 2_000, maxMs: 15_000,
      onDone: (text) => { setListening(false); if (text) onText(text); else setNote((n) => n || "Didn't catch that. Try again."); },
      onProblem: (m) => { setListening(false); setNote(m); },
    });
    stopRef.current = h.stop;
  };

  if (!supported) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={listening ? `Stop dictating ${label}` : `Dictate ${label}`}
        aria-pressed={listening}
        className="press relative grid size-11 place-items-center rounded-full border-[1.5px] border-line bg-card text-plum aria-pressed:border-sage aria-pressed:bg-sage-soft aria-pressed:text-sage"
      >
        {listening && <span className="mm-ring absolute inset-0 rounded-full border-2 border-sage" />}
        <SproutMic className="size-5" />
      </button>
      {note && <span role="status" className="text-xs font-bold text-muted-foreground">{note}</span>}
    </span>
  );
}
