import { useEffect, useState } from "react";
import { Card, Muted } from "./ui";
import { disableLock, enableLock, lockEnabled, lockSupported } from "@/lib/intimacy-lock";

export function IntimacyLockSetting() {
  const [on, setOn] = useState(false);
  const [supported, setSupported] = useState(true);
  const [msg, setMsg] = useState("");
  useEffect(() => { setOn(lockEnabled()); void lockSupported().then(setSupported); }, []);
  const toggle = async (next: boolean) => {
    setMsg("");
    if (!next) { disableLock(); setOn(false); return; }
    try { await enableLock(); setOn(true); setMsg("Done. You'll be asked each time you open the section."); }
    catch { setMsg("That didn't finish. Nothing has changed."); }
  };
  return (
    <Card>
      <label className="flex min-h-11 items-center justify-between gap-3">
        <span className="font-bold">Hide Intimacy & relationships behind Face ID / passcode</span>
        <input type="checkbox" className="size-6 accent-[var(--mm-plum)]" checked={on} disabled={!supported} onChange={(e) => void toggle(e.target.checked)} />
      </label>
      <Muted>{supported ? "Uses this device's own lock. Nothing about it is sent to us." : "This device doesn't offer Face ID, fingerprint or passcode unlock in the browser."}</Muted>
      {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
    </Card>
  );
}
