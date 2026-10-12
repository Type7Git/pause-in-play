import { createFileRoute, Link } from "@tanstack/react-router";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Muted, ScreenTitle } from "@/components/mm/ui";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy · Pause and Play" },
      { name: "description", content: "What Pause and Play stores, why, and how to delete it. We never store moods, symptoms or health information." },
      { property: "og:title", content: "Privacy · Pause and Play" },
      { property: "og:description", content: "What we store, why, and how to delete it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const STORED: [string, string][] = [
  ["Your email address", "So you can sign in with a link or Google."],
  ["A display name (optional)", "Taken from Google if you use it. Only you see it."],
  ["Petals and badges", "To grow your garden and remember what you've earned."],
  ["Parked missions", "What you were doing, the next step and an optional nudge time, so you can come back to it."],
  ["Very Important Things", "The things you file and where they live, so you can search them."],
  ["Reminder settings", "A label, when it repeats and whether it's on."],
  ["A notification token for this device", "So we can send nudges you've asked for. Removed when you delete your account."],
];

function Privacy() {
  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Privacy" title="What we store, and why." sub="Short version: only what your garden needs." />
      <Card>
        <h3>If you don't sign in</h3>
        <Muted>Everything stays on this device only. Nothing is sent to us.</Muted>
      </Card>
      <Card>
        <h3>If you save your garden</h3>
        <ul className="flex flex-col gap-2.5">
          {STORED.map(([what, why]) => (
            <li key={what} className="rounded-2xl bg-sunk px-3.5 py-3">
              <b>{what}</b>
              <p className="text-sm text-muted-foreground">{why}</p>
            </li>
          ))}
        </ul>
        <Muted>Your data is private to your account. Nobody else can read it.</Muted>
      </Card>
      <Card>
        <h3>What we never store</h3>
        <Muted>Moods, symptoms, health conditions, or any "how I feel" notes. The wind-down sessions keep no record at all.</Muted>
      </Card>
      <Card>
        <h3>Deleting your data</h3>
        <Muted>You can delete your account and everything with it at any time from Settings. It's permanent and immediate.</Muted>
        <Link to="/settings" className="inline-flex min-h-11 items-center self-start text-sm font-bold text-plum underline underline-offset-2">Go to Settings</Link>
      </Card>
    </>
  );
}
