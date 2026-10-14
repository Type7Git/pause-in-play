import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/mm/BackButton";
import { CrisisCard, Initials, PalsGate } from "@/components/mm/PalsGate";
import { Card, Chip, Muted, Pill } from "@/components/mm/ui";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { getLevel } from "@/lib/levels";
import { fetchPals, friendlyError, NUDGES, statusLabel } from "@/lib/pals";
import { useRewards } from "@/lib/rewards";
import { isCrisis } from "@/lib/sprout-guard";
import { NeverShared, PermSwitches } from "./pals.invite";

export const Route = createFileRoute("/pals/$id")({
  head: () => ({
    meta: [
      { title: "PeriPal · Pause in Play" },
      { name: "description", content: "Messages, nudges and what you share with this PeriPal." },
      { property: "og:title", content: "PeriPal · Pause in Play" },
      { property: "og:description", content: "Messages, nudges and sharing choices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <>
      <BackButton />
      <PalsGate><Pal /></PalsGate>
    </>
  ),
});

type Msg = { id: string; sender_id: string; recipient_id: string; body: string; kind: string; created_at: string };

function Pal() {
  const { id } = Route.useParams();
  const { user } = useRewards();
  const pals = useQuery({ queryKey: ["pals"], queryFn: fetchPals });
  const [tab, setTab] = useState<"messages" | "sees">("messages");
  const p = pals.data?.find((x) => x.other_id === id);
  if (pals.isLoading) return <Muted>Loading…</Muted>;
  if (!p) return <Card><h3>You're no longer connected</h3><Muted>This PeriPal connection has ended.</Muted></Card>;
  const st = statusLabel(p.their_status);
  return (
    <>
      <div className="flex items-center gap-3">
        <Initials name={p.other_name} />
        <div><h1 className="leading-tight">{p.other_name}</h1><p className="text-sm text-muted-foreground">{p.relationship}{st ? ` · ${st.emoji} ${st.label}` : ""}</p></div>
      </div>
      {p.i_share_status === "pending" && <Confirm linkId={p.i_share_link!} name={p.other_name} />}
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-full bg-sunk p-1">
        {(["messages", "sees"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`press min-h-11 rounded-full text-sm font-bold ${tab === k ? "bg-card text-plum shadow-soft" : "text-muted-foreground"}`}>
            {k === "messages" ? "Messages" : `What ${p.other_name} sees`}
          </button>
        ))}
      </div>
      {tab === "messages" ? <Messages me={user!.id} other={id} name={p.other_name} blocked={p.blocked} theyShare={p.they_share_status === "active"} /> : p.i_share_link ? <Sees linkId={p.i_share_link} status={p.i_share_status!} name={p.other_name} /> : <Card><Muted>You're not sharing anything with {p.other_name} yet.</Muted><Link to="/pals/invite" className="font-bold text-plum underline">Invite {p.other_name} to share back</Link></Card>}
    </>
  );
}

function Confirm({ linkId, name }: { linkId: string; name: string }) {
  const qc = useQueryClient();
  const set = async (status: "active" | "removed") => {
    await supabase.from("pal_links").update({ status }).eq("id", linkId);
    qc.invalidateQueries({ queryKey: ["pals"] });
    toast(status === "active" ? `${name} is now your PeriPal` : "Invite declined");
  };
  return (
    <Card className="bg-gold-soft">
      <h3>{name} accepted your invite</h3>
      <Muted>Nothing is shared until you confirm it's really her.</Muted>
      <div className="flex gap-2"><Pill onClick={() => set("active")}>Confirm {name}</Pill><Pill variant="ghost" onClick={() => set("removed")}>Not her</Pill></div>
    </Card>
  );
}

function Messages({ me, other, name, blocked, theyShare }: { me: string; other: string; name: string; blocked: boolean; theyShare: boolean }) {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const key = ["pal_messages", other];
  const msgs = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await supabase.from("pal_messages").select("id, sender_id, recipient_id, body, kind, created_at")
        .or(`and(sender_id.eq.${me},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${me})`).order("created_at").limit(200);
      await supabase.rpc("pal_mark_read", { _other: other });
      return (data ?? []) as Msg[];
    },
  });
  const garden = useQuery({ queryKey: ["pal_garden", other], enabled: theyShare, queryFn: async () => (await supabase.rpc("pal_garden", { _owner: other })).data?.[0] ?? null });

  useEffect(() => {
    const ch = supabase.channel(`pal-${other}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pal_messages" }, () => qc.invalidateQueries({ queryKey: key }))
      .on("postgres_changes", { event: "*", schema: "public", table: "pal_permissions" }, () => { qc.invalidateQueries({ queryKey: ["pals"] }); qc.invalidateQueries({ queryKey: ["pal_garden", other] }); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pal_links" }, () => qc.invalidateQueries({ queryKey: ["pals"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [other]);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs.data?.length]);

  const send = async (body: string, kind: "text" | "nudge") => {
    if (!body.trim()) return;
    const { error } = await supabase.from("pal_messages").insert({ sender_id: me, recipient_id: other, body: body.trim().slice(0, 1000), kind });
    if (error) { toast(error.message.includes("rate_limited") ? "Slow down a little, then try again." : `You can't message ${name} right now.`); return; }
    if (kind === "text") setText("");
    qc.invalidateQueries({ queryKey: key });
  };
  const report = async (m: Msg) => {
    const { error } = await supabase.from("pal_reports").insert({ message_id: m.id, reason: "Reported from chat" });
    setMenu(null);
    toast(error ? friendlyError(error) : "Thanks. Our team will look at this within 24 hours.");
  };
  const block = async () => {
    await supabase.from("pal_blocks").insert({ blocked_id: other });
    toast(`${name} is blocked. She can't message you or see anything.`);
    qc.invalidateQueries({ queryKey: ["pals"] });
    nav({ to: "/pals" });
  };

  if (blocked) return <Card><Muted>You've blocked {name}.</Muted><Pill variant="ghost" onClick={async () => { await supabase.from("pal_blocks").delete().eq("blocked_id", other); qc.invalidateQueries({ queryKey: ["pals"] }); }}>Unblock</Pill></Card>;
  const g = garden.data ? getLevel(garden.data.petals) : null;
  return (
    <>
      {g && <Card className="bg-sage-soft"><Muted>{name}'s garden: <b>{g.name}</b> · {garden.data!.petals} petals · {garden.data!.badges.length} badges</Muted></Card>}
      <section aria-label={`Messages with ${name}`} aria-live="polite" className="flex flex-col gap-2">
        {msgs.data?.length === 0 && <Muted>No messages yet. A nudge is a nice way to start.</Muted>}
        {msgs.data?.map((m) => {
          const mine = m.sender_id === me;
          return (
            <div key={m.id} className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] rounded-[18px] px-3.5 py-2.5 text-sm ${mine ? "bg-plum text-shell" : "border border-line bg-card"}`}>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <span className={`mt-1 block text-[11px] ${mine ? "text-shell/80" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleString("en-AU", { weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
              </div>
              {!mine && <button className="text-xs text-muted-foreground underline" onClick={() => setMenu(menu === m.id ? null : m.id)}>Report or block</button>}
              {menu === m.id && <div className="flex gap-2"><Pill size="sm" variant="ghost" onClick={() => report(m)}>Report message</Pill><Pill size="sm" variant="ghost" onClick={block}>Block {name}</Pill></div>}
              {m.kind === "text" && isCrisis(m.body) && <CrisisCard />}
            </div>
          );
        })}
        <div ref={end} />
      </section>
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Quick nudges">
        {NUDGES.map((n) => <Chip key={n} className="shrink-0" onClick={() => send(n, "nudge")}>{n}</Chip>)}
      </div>
      {isCrisis(text) && <CrisisCard />}
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(text, "text"); }}>
        <label className="sr-only" htmlFor="composer">Message {name}</label>
        <input id="composer" value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder={`Message ${name}`} className="min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-sunk px-4 py-2.5" />
        <Pill type="submit" disabled={!text.trim()}>Send</Pill>
      </form>
      <button className="self-start text-sm text-muted-foreground underline" onClick={block}>Block {name}</button>
    </>
  );
}

function Sees({ linkId, status, name }: { linkId: string; status: string; name: string }) {
  const qc = useQueryClient();
  const nav = useNavigate();
  const perms = useQuery({ queryKey: ["pal_permissions", linkId], queryFn: async () => (await supabase.from("pal_permissions").select("*").eq("link_id", linkId).single()).data });
  const setPerm = async (k: string, v: boolean) => {
    const { error } = await supabase.from("pal_permissions").update({ [k]: v } as { garden: boolean }).eq("link_id", linkId);
    if (error) toast("Couldn't change that. Please try again.");
    qc.invalidateQueries({ queryKey: ["pal_permissions", linkId] });
  };
  const setStatus = async (s: "active" | "paused" | "removed") => {
    await supabase.from("pal_links").update({ status: s }).eq("id", linkId);
    qc.invalidateQueries({ queryKey: ["pals"] });
    if (s === "removed") { toast(`${name} has been removed`); nav({ to: "/pals" }); }
  };
  if (!perms.data) return <Muted>Loading…</Muted>;
  return (
    <>
      <Card>
        <PermSwitches value={perms.data as unknown as Record<string, boolean>} name={name} onChange={setPerm} />
      </Card>
      <NeverShared />
      <Card>
        <label className="flex items-center justify-between gap-3 text-sm font-bold">
          Pause sharing with {name}
          <Switch checked={status === "paused"} onCheckedChange={(v) => setStatus(v ? "paused" : "active")} />
        </label>
        <Pill variant="ghost" onClick={() => { if (confirm(`Remove ${name}? She'll lose access straight away.`)) setStatus("removed"); }}>Remove {name}</Pill>
        <Muted className="text-xs">{name} isn't told when you change these. If you remove her, she just sees that you're no longer connected.</Muted>
      </Card>
    </>
  );
}
