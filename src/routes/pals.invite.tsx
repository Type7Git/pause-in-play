import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/mm/BackButton";
import { PalsGate } from "@/components/mm/PalsGate";
import { Card, Chip, Field, Muted, Pill } from "@/components/mm/ui";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { friendlyError, NEVER_SHARED, PERMS, RELATIONSHIPS } from "@/lib/pals";
import { useRewards } from "@/lib/rewards";
import { ShareSheet } from "@/components/mm/ShareSheet";
import type { SharePayload } from "@/lib/share";

export const Route = createFileRoute("/pals/invite")({
  head: () => ({
    meta: [
      { title: "Invite someone · Lumenera" },
      { name: "description", content: "Invite someone you trust and choose exactly what they can see." },
      { property: "og:title", content: "Invite someone · Lumenera" },
      { property: "og:description", content: "Choose exactly what a trusted person can see." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <BackButton />
      <div><p className="eyebrow">My people</p><h1>Invite someone</h1></div>
      <PalsGate><Invite /></PalsGate>
    </>
  ),
});

export function PermSwitches({ value, onChange, name }: { value: Record<string, boolean>; onChange: (k: string, v: boolean) => void; name?: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {PERMS.map((p) => (
        <li key={p.key} className="flex items-center justify-between gap-3 rounded-2xl bg-sunk px-3.5 py-3">
          <span className="min-w-0">
            <b className="block text-sm">{p.label}</b>
            <span className="text-xs text-muted-foreground">{"soon" in p ? "Coming soon, once private health saving opens" : p.desc}</span>
          </span>
          <Switch aria-label={`${name ? `Let ${name} see ` : ""}${p.label}`} disabled={"soon" in p} checked={!("soon" in p) && !!value[p.key]} onCheckedChange={(v) => onChange(p.key, v)} />
        </li>
      ))}
    </ul>
  );
}

export function NeverShared() {
  return (
    <Card>
      <h3>Never shared</h3>
      <ul className="flex flex-col gap-1.5 text-sm">{NEVER_SHARED.map((n) => <li key={n} className="flex items-center gap-2"><Lock className="size-3.5 text-plum" aria-hidden="true" />{n}</li>)}</ul>
    </Card>
  );
}

function Invite() {
  const { user, earn } = useRewards();
  const [name, setName] = useState("");
  const [rel, setRel] = useState("Friend");
  const [perms, setPerms] = useState<Record<string, boolean>>({ messages: true });
  const [days, setDays] = useState(1);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sharing, setSharing] = useState<SharePayload | null>(null);

  const create = async () => {
    setBusy(true);
    const { data, error } = await supabase.from("pal_invites")
      .insert({ owner_id: user!.id, name: name.trim(), relationship: rel, permissions: perms, expires_at: new Date(Date.now() + days * 864e5).toISOString() })
      .select("code").single();
    setBusy(false);
    if (error) { toast(friendlyError(error)); return; }
    setLink(`${window.location.origin}/pal/${data.code}`);
    earn(3, "Reaching out counts", "Support circle");
  };

  const sees = PERMS.filter((p) => !("soon" in p) && perms[p.key]).map((p) => p.label);
  if (link)
    return (
      <Card>
        <h3>Your invite for {name}</h3>
        <Muted>{name} will be able to see: {sees.length ? sees.join(", ") : "nothing yet"}. You'll confirm her before anything is shared.</Muted>
        <p className="break-all rounded-2xl bg-sunk p-3 text-sm">{link}</p>
        <Muted className="text-xs">Single use. Expires in {days === 1 ? "24 hours" : "7 days"}.</Muted>
        <div className="flex gap-2">
          <Pill onClick={() => setSharing({ title: `Your invite for ${name}`, text: `Will you be one of my people on Lumenera? It's a private way to check in with each other.`, url: link })}>Share</Pill>
          <Pill variant="ghost" onClick={() => { navigator.clipboard.writeText(link); toast("Link copied"); }}>Copy</Pill>
        </div>
        <ShareSheet open={!!sharing} payload={sharing} pals={false} onClose={() => setSharing(null)} />
      </Card>
    );

  return (
    <>
      <Card>
        <Field label="Their first name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
        <p className="text-[13px] font-bold text-muted-foreground">They are my…</p>
        <div className="flex flex-wrap gap-2">{RELATIONSHIPS.map((r) => <Chip key={r} pressed={rel === r} onClick={() => setRel(r)}>{r}</Chip>)}</div>
      </Card>
      <Card>
        <h3>What {name.trim() || "they"} can see</h3>
        <PermSwitches value={perms} name={name.trim()} onChange={(k, v) => setPerms({ ...perms, [k]: v })} />
      </Card>
      <NeverShared />
      <Card>
        <h3>Link expires in</h3>
        <div className="flex gap-2"><Chip pressed={days === 1} onClick={() => setDays(1)}>24 hours</Chip><Chip pressed={days === 7} onClick={() => setDays(7)}>7 days</Chip></div>
        <Pill disabled={!name.trim() || busy} onClick={create}>Create invite link</Pill>
      </Card>
    </>
  );
}
