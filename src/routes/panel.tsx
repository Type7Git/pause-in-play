import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/mm/BackButton";
import { PanelBadge } from "@/components/mm/Panel";
import { Card, Muted, Pill } from "@/components/mm/ui";
import { company, disclosure, panel, principles } from "@/content/panel";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Our clinical advisory panel · Pause and Play" },
      { name: "description", content: "Every tool and article in Pause and Play is reviewed by registered health professionals." },
      { property: "og:title", content: "Our clinical advisory panel · Pause and Play" },
      { property: "og:description", content: "Who reviews Pause and Play, and who's behind it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PanelPage,
});

/** Highlights [placeholders] so unfilled details are obvious. */
function Fill({ text }: { text: string }) {
  return <>{text.split(/(\[[^\]]+\])/).map((p, i) => p.startsWith("[") ? <mark key={i} className="rounded bg-gold-soft px-1 text-ink">{p}</mark> : <Fragment key={i}>{p}</Fragment>)}</>;
}

function PanelPage() {
  return (
    <>
      <BackButton />
      <div className="flex items-start gap-3">
        <PanelBadge size={44} />
        <div>
          <p className="eyebrow">Clinically reviewed</p>
          <h1>Our clinical advisory panel</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Every tool and article is reviewed by registered health professionals.</p>
        </div>
      </div>

      <Card>
        <h3>The panel</h3>
        <ul className="flex flex-col gap-2.5">
          {panel.map((m) => (
            <li key={m.role} className="flex items-start gap-3">
              <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-2xl font-display text-plum ${m.tile}`}>{m.initials}</span>
              <span className="min-w-0">
                <b className="block"><Fill text={m.name} />, {m.role}</b>
                <span className="text-sm text-muted-foreground">{m.covers}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3>How it's built</h3>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">{principles.map((p) => <li key={p}>{p}</li>)}</ul>
      </Card>

      <Card className="bg-gold-soft">
        <h3>The Pause and Play program</h3>
        <Muted>Live group sessions led by qualified facilitators, with guest sessions from health professionals.</Muted>
        <Pill onClick={() => toast("Thanks! We'll let you know when the program opens.")}>Join the waitlist</Pill>
      </Card>

      <Card>
        <h3>Who's behind Pause and Play</h3>
        <Muted>
          Pause and Play is owned and operated by <Fill text={company.name} />, founded by <Fill text={company.founder} />. Panel members are independent advisers paid a fee to review content. They don't own the business or run it day to day. <Fill text={disclosure} />
        </Muted>
      </Card>

      <Card>
        <h3>Need more than an app?</h3>
        <Muted>Your GP is the best place to start, and can refer you on. If you're in crisis, call Lifeline on 13 11 14, or 000 in an emergency.</Muted>
        <Link to="/" className="font-bold text-plum underline">Back to home</Link>
      </Card>
    </>
  );
}
