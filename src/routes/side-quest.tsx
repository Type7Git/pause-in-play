import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Chip, Field, Muted, Pill, Row, ScreenTitle } from "@/components/mm/ui";
import { remindAtFor, useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/side-quest")({
  head: () => ({
    meta: [
      { title: "Side Quest Saver · Midlife Mind" },
      { name: "description", content: "Park what you were doing and the very next step, so you can come back to it." },
      { property: "og:title", content: "Side Quest Saver · Midlife Mind" },
      { property: "og:description", content: "Your original mission is safely parked here." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SideQuest,
});

const REMINDERS = ["No reminder", "In 10 min", "In 30 min", "Tonight"];

function SideQuest() {
  const { earn, quests, addQuest, completeQuest } = useRewards();
  const [doing, setDoing] = useState("");
  const [next, setNext] = useState("");
  const [remind, setRemind] = useState<string>("No reminder");
  const [error, setError] = useState("");
  const doingRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!doing.trim()) {
      setError("Add what you were doing first.");
      doingRef.current?.focus();
      return;
    }
    addQuest({ doing: doing.trim(), next: next.trim(), remindAt: remindAtFor(remind) });
    setDoing("");
    setNext("");
    setError("");
    earn(3, "Mission parked. Go handle the side quest", "Side Quest Saver");
  };

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Side Quest Saver" title="Your original mission is safely parked here." />
      <Card as="form" onSubmit={submit} noValidate>
        <Field ref={doingRef} label="What I'm doing" required placeholder="e.g. Filling in the school form" value={doing} onChange={(e) => setDoing(e.target.value)} aria-invalid={!!error} />
        {error && <p className="text-sm font-bold text-rose">{error}</p>}
        <Field label="The very next step" placeholder="e.g. Find Mia's Medicare number" value={next} onChange={(e) => setNext(e.target.value)} />
        <div className="flex flex-col gap-1.5 text-[13px] font-bold text-muted-foreground" role="group" aria-label="Nudge me">
          Nudge me
          <div className="flex flex-wrap gap-2">
            {REMINDERS.map((r) => (
              <Chip key={r} pressed={remind === r} onClick={() => setRemind(r)}>{r}</Chip>
            ))}
          </div>
        </div>
        <Pill type="submit">Park this mission</Pill>
      </Card>
      <Card>
        <h3>Parked missions</h3>
        <ul className="flex flex-col gap-2">
          {quests.length ? (
            quests.map((q) => (
              <Row key={q.id}>
                <span className="min-w-0">
                  <b>{q.doing}</b>
                  <br />
                  <small className="text-[12.5px] text-muted-foreground">
                    Next: {q.next || "Pick up where I left off"}
                    {q.remindAt && ` · Nudge ${new Date(q.remindAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                  </small>
                </span>
                <Pill variant="sage" size="sm" onClick={() => { completeQuest(q.id); earn(4, "Mission complete. You came back to it"); }}>
                  Done
                </Pill>
              </Row>
            ))
          ) : (
            <li className="p-3 text-center"><Muted>Nothing parked. Your brain is all yours.</Muted></li>
          )}
        </ul>
      </Card>
    </>
  );
}
