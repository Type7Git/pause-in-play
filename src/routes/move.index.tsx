import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check } from "lucide-react";
import { SafetyCard } from "@/components/mm/MoveSafety";
import { BackButton } from "@/components/mm/BackButton";
import { WhyThisHelps } from "@/components/mm/Panel";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { dayKey, ENERGY_CHIPS, filterSessions, TYPE_STYLE, TYPES, weekDays, weekStats, useBody, type Energy, type Session, type SessionType } from "@/lib/body";

export const sessionsQuery = {
  queryKey: ["movement-sessions"],
  queryFn: async () => ((await supabase.from("movement_sessions").select("*").eq("status", "approved").order("sort")).data ?? []) as unknown as Session[],
};

export const Route = createFileRoute("/move/")({
  head: () => ({ meta: [{ title: "Move today · Lumenera" }, { name: "description", content: "Short stretch, yoga, Pilates, strength and walking sessions. Move when you feel you can." }, { property: "og:title", content: "Move today · Lumenera" }, { property: "og:description", content: "Gentle movement sessions for perimenopause. No streaks, no pressure." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MoveToday,
});

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function MoveToday() {
  const { data, isLoading } = useQuery(sessionsQuery);
  const body = useBody();
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [type, setType] = useState<SessionType | "All">("All");
  const stats = weekStats(body.log);
  const today = dayKey(new Date());
  const doneToday = new Set(body.log.filter((l) => dayKey(new Date(l.completed_at)) === today).map((l) => l.session_key));
  const list = filterSessions(data ?? [], energy, type);

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Resilient body" title="Move today" sub="Move when you feel you can." />
      <WhyThisHelps>Movement supports your bones, heart, muscles, sleep and mood through this stage. A few minutes counts, and there are no streaks to break.</WhyThisHelps>
      {body.ready && !body.safetySeen && <SafetyCard onDone={() => body.update((s) => ({ ...s, safetySeen: true }))} />}

      <Card>
        <p className="eyebrow">This week</p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {weekDays().map((d, i) => {
            const k = dayKey(d);
            const dots = stats.week.filter((l) => dayKey(new Date(l.completed_at)) === k);
            return (
              <div key={k} className={`flex min-h-14 flex-col items-center gap-1 rounded-xl p-1 ${k === today ? "border-2 border-plum" : "border border-line"}`}>
                <b>{DAYS[i]}</b>
                <span className="flex flex-wrap justify-center gap-0.5">{dots.map((l, j) => <i key={j} className={`block size-2 rounded-full ${TYPE_STYLE[l.type]?.dot ?? "bg-plum"}`} title={l.type} />)}</span>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><b className="font-display text-xl">{stats.sessions}</b><Muted>sessions</Muted></div>
          <div><b className="font-display text-xl">{stats.minutes}</b><Muted>minutes</Muted></div>
          <div><b className="font-display text-xl">{Math.min(stats.strengthDays, 2)} of 2</b><Muted>strength days</Muted></div>
        </div>
        <p className="text-xs text-muted-foreground">Australian guidelines suggest moving most days and strengthening muscles on at least 2 days a week. Every bit counts, and there are no streaks to break.</p>
        <p className="text-xs text-muted-foreground">Kept on this device only.</p>
      </Card>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg">How much have you got in you today?</h2>
        <div className="flex flex-wrap gap-2">{ENERGY_CHIPS.map((c) => <Chip key={c.level} pressed={energy === c.level} onClick={() => setEnergy(energy === c.level ? null : c.level)}>{c.label}</Chip>)}</div>
        <div className="flex flex-wrap gap-2">{(["All", ...TYPES] as const).map((t) => <Chip key={t} pressed={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
      </div>

      {isLoading ? <Muted>Finding sessions…</Muted> : !list.length ? <Muted>{data?.length ? "Nothing matches those choices. Try another." : "New sessions are being reviewed by our clinical advisory panel. Check back soon."}</Muted> : list.map((s) => (
        <Link key={s.key} to="/move/$key" params={{ key: s.key }} className="mm-card lift flex items-start gap-3 p-4">
          <span className={`grid size-12 shrink-0 place-items-center rounded-[15px] text-xs font-bold ${TYPE_STYLE[s.type].tile}`}>{s.minutes}′</span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <b className="font-display">{s.title}</b>
            <span className="text-xs text-muted-foreground">{s.minutes} min · {s.type} · {s.energy}</span>
            <span className="flex flex-wrap gap-1">{s.benefit_tags.map((t) => <span key={t} className="rounded-full bg-sunk px-2 py-0.5 text-xs">{t}</span>)}</span>
          </span>
          {doneToday.has(s.key) && <Check className="size-6 shrink-0 text-sage" aria-label="Done today" />}
        </Link>
      ))}
    </>
  );
}
