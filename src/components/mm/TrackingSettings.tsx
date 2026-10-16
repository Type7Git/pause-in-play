import { useState } from "react";
import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { Card, Muted, Pill } from "./ui";
import { clearDeviceRecords, deviceRecords } from "@/lib/tracking";

/** Your health records on this phone: Mood Mapper, Cycle Tracker and Medicine cabinet. Download or delete them. */
export function TrackingSettings() {
  const [status, setStatus] = useState("");
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(deviceRecords(), null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `lumenera-my-records-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Downloaded.");
  };
  const remove = () => {
    if (!confirm("Delete your moods, cycle log and medicine cabinet from this phone? This can't be undone.")) return;
    clearDeviceRecords();
    setStatus("Deleted from this phone.");
  };
  return (
    <Card>
      <ShieldCheck className="size-6 text-sage" aria-hidden="true" />
      <h3>Your health records</h3>
      <Muted>Your moods, cycle log and medicine cabinet are kept on this phone only. They aren't part of your account and aren't sent to Lumenera, so they won't move to a new phone. Health information will never be sold or used for advertising.</Muted>
      <div className="flex flex-wrap gap-2">
        <Pill variant="ghost" size="sm" onClick={download}><Download className="size-4" />Download my records</Pill>
        <Pill variant="ghost" size="sm" className="text-rose" onClick={remove}><Trash2 className="size-4" />Delete from this phone</Pill>
      </div>
      {status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
    </Card>
  );
}
