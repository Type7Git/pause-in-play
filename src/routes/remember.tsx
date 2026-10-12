import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Field, Muted, Pill, Row, ScreenTitle } from "@/components/mm/ui";
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

const VIT_BADGE_AT = 6;

function Remember() {
  const { earn, vit: things, addVit, removeVit } = useRewards();
  const [q, setQ] = useState("");
  const [t, setT] = useState("");
  const [w, setW] = useState("");
  const [error, setError] = useState("");

  const ql = q.trim().toLowerCase();
  const shown = things.filter((x) => `${x.thing} ${x.location}`.toLowerCase().includes(ql));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!t.trim() || !w.trim()) return setError("Add the thing and where it lives.");
    const count = addVit(t.trim(), w.trim());
    setT(""); setW(""); setQ(""); setError("");
    earn(3, "Filed. The department thanks you", count >= VIT_BADGE_AT ? "VIT Department head" : undefined);
  };

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Help me remember" title="The Very Important Thing Department" sub="Open 24 hours. No questions asked." />
      <Card>
        <Field label="Search the department" type="search" placeholder="Try 'key' or 'car'" value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="flex flex-col gap-2">
          {shown.length ? shown.map((x) => (
            <Row key={x.id}>
              <span className="min-w-0">
                <b>{x.thing}</b>
                {x.example && <span className="ml-2 rounded-full bg-plum-soft px-2 py-0.5 text-[11px] font-bold text-plum">Example</span>}
                <br /><small className="text-[12.5px] text-muted-foreground">{x.location}</small>
              </span>
              <Pill variant="ghost" size="sm" aria-label={`Remove ${x.thing}`} onClick={() => removeVit(x.id)}>Remove</Pill>
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
