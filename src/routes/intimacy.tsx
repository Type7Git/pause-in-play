import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Muted, Pill } from "@/components/mm/ui";
import { isUnlocked, lockEnabled, unlock } from "@/lib/intimacy-lock";

export const Route = createFileRoute("/intimacy")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: IntimacyLayout,
});

export function PrivacyBanner() {
  return (
    <p className="flex items-start gap-2.5 rounded-2xl border border-line bg-sunk p-3 text-[13px] leading-snug text-muted-foreground">
      <Lock className="mt-0.5 size-4 shrink-0 text-plum" aria-hidden="true" />
      Private by default. Nothing here is saved unless you choose, it's never shared with PeriPals, and notifications from this section never show on your lock screen.
    </p>
  );
}

function IntimacyLayout() {
  const [state, setState] = useState<"checking" | "locked" | "open">("checking");
  const [err, setErr] = useState("");
  useEffect(() => { setState(lockEnabled() && !isUnlocked() ? "locked" : "open"); }, []);
  const tryUnlock = async () => {
    setErr("");
    try { if (await unlock()) setState("open"); } catch { setErr("That didn't work. Try again when you're ready."); }
  };
  if (state === "checking") return null;
  return (
    <>
      <BackButton />
      <PrivacyBanner />
      {state === "locked" ? (
        <Card className="items-center text-center">
          <Lock className="size-8 text-plum" aria-hidden="true" />
          <h1 className="text-2xl">This section is locked</h1>
          <Muted>Use Face ID, your fingerprint or your passcode to open Intimacy & relationships.</Muted>
          <Pill onClick={tryUnlock}>Unlock</Pill>
          {err && <p role="alert" className="text-sm text-muted-foreground">{err}</p>}
        </Card>
      ) : (
        <Outlet />
      )}
    </>
  );
}
