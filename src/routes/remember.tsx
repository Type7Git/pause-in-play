import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Field, Muted, Pill, Row, ScreenTitle, useStoredList } from "@/components/mm/ui";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/remember")({
  head: () => ({
    meta: [
      { title: "The Very Important Thing Department · Midlife Mind" },
      { name: "description", content: "Keep a searchable list of important things and where they live." },
      { property: "og:title", content: "The Very Important Thing Department" },
      { property: "og:description", content: "Open 24 hours. No questions asked." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Remember,
});

type Thing = { t: string; w: string; example?: boolean };
const SEED: Thing[] = [
  { t: "Passport", w: "Top drawer, under the tea towels", example: true },
  { t: "Spare house key", w: "Blue mug on the bookshelf", example: true },
  { t: "Car", w: "Westfield, level 3, near the lifts", example: true },
];
const VIT_BADGE_AT = 6;

function Remember() {
  const { earn } = useRewards();
  const [things, setThings] = useStoredList<Thing>("midlife-mind:vit", SEED);
  const [q, setQ] = useState("");
  const [t, setT] = useState("");
  const [w, setW] = useState("");
  const [error, setError] = useState("");

  const ql = q.trim().toLowerCase();
  const shown = things.filter((x) => `${x.t} ${x.w}`.toLowerCase().includes(ql));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!t.trim() || !w.trim()) return setError("Add the thing and where it lives.");
    const next = [{ t: t.trim(), w: w.trim() }, ...things];
    setThings(next);
    setT(""); setW(""); setQ(""); setError("");
    earn(3, "Filed. The department thanks you", next.length >= VIT_BADGE_AT ? "VIT Department head" : undefined);
  };

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Help me remember" title="The Very Important Thing Department" sub="Open 24 hours. No questions asked." />
      <Card>
        <Field label="Search the department" type="search" placeholder="Try 'key' or 'car'" value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="flex flex-col gap-2">
          {shown.length ? shown.map((x) => (
            <Row key={`${x.t}|${x.w}`}>
              <span className="min-w-0">
                <b>{x.t}</b>
                {x.example && <span className="ml-2 rounded-full bg-plum-soft px-2 py-0.5 text-[11px] font-bold text-plum">Example</span>}
                <br /><small className="text-[12.5px] text-muted-foreground">{x.w}</small>
              </span>
              <Pill variant="ghost" size="sm" aria-label={`Remove ${x.t}`} onClick={() => setThings((l) => l.filter((y) => y !== x))}>Remove</Pill>
            </Row>
          )) : (
            <li className="p-3 text-center">
              <Muted>{ql ? `Nothing filed under "${q.trim()}" yet. File it below once it turns up.` : "The department is empty. File your first thing below."}</Muted>
            </li>
          )}
        </ul>
      </Card>
      <Card as="form" onSubmit={submit} noValidate>
        <h3>File something new</h3>
        <Field label="The thing" placeholder="e.g. Birth certificates" value={t} onChange={(e) => setT(e.target.value)} />
        <Field label="Where it lives" placeholder="e.g. Grey folder, study shelf" value={w} onChange={(e) => setW(e.target.value)} />
        {error && <p className="text-sm font-bold text-rose">{error}</p>}
        <Pill type="submit">File it</Pill>
      </Card>
    </>
  );
}
