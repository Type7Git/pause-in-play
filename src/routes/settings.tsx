import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { SignInForm } from "@/components/mm/SignInForm";
import { Card, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Pause and Play" },
      { name: "description", content: "Save your garden across devices, sign out, or delete your account and data." },
      { property: "og:title", content: "Settings · Pause and Play" },
      { property: "og:description", content: "Your account, your garden, your choice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { user, ready } = useRewards();
  const navigate = useNavigate();
  const del = useServerFn(deleteMyAccount);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const destroy = async () => {
    setBusy(true);
    setError("");
    try {
      await del();
      await supabase.auth.signOut();
      localStorage.clear();
      navigate({ to: "/", replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Settings" title={user ? "Your garden is saved." : "Save your garden"} sub={user ? `Signed in as ${user.email}` : "Use the app freely without an account. Sign in to keep your garden on every device."} />
      {!ready ? null : user ? (
        <>
          <Card>
            <h3>Account</h3>
            <Muted>Your petals, badges, parked missions and Very Important Things sync wherever you sign in.</Muted>
            <Pill variant="ghost" onClick={signOut}>Sign out</Pill>
          </Card>
          <Card>
            <h3>Delete my account and data</h3>
            <Muted>This permanently removes your account and everything stored with it. It can't be undone.</Muted>
            {!confirming ? (
              <Pill variant="ghost" className="text-rose" onClick={() => setConfirming(true)}>Delete my account and data</Pill>
            ) : (
              <div className="flex flex-col gap-2 rounded-2xl bg-rose-soft p-3.5">
                <b>Are you sure?</b>
                <Muted>Your garden, badges and lists will be gone for good.</Muted>
                <div className="flex flex-wrap gap-2">
                  <Pill size="sm" className="bg-rose" onClick={destroy} disabled={busy}>{busy ? "Deleting…" : "Yes, delete everything"}</Pill>
                  <Pill size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>Keep my account</Pill>
                </div>
              </div>
            )}
            {error && <p className="text-sm font-bold text-rose" role="alert">{error}</p>}
          </Card>
        </>
      ) : (
        <Card><SignInForm /></Card>
      )}
      <Link to="/privacy" className="self-start text-sm font-bold text-plum underline-offset-2 hover:underline">What we store and why</Link>
    </>
  );
}
