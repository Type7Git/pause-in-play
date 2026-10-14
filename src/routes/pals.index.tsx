import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BackButton } from "@/components/mm/BackButton";
import { Initials, PalsGate } from "@/components/mm/PalsGate";
import { Card, Chip, Muted } from "@/components/mm/ui";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { fetchPals, STATUSES, statusLabel } from "@/lib/pals";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/pals/")({
  head: () => ({
    meta: [
      { title: "My PeriPals · Pause in Play" },
      { name: "description", content: "Support that goes both ways. Share only what you choose with the people you trust." },
      { property: "og:title", content: "My PeriPals · Pause in Play" },
      { property: "og:description", content: "Share only what you choose with the people you trust." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <BackButton />
      <div>
        <p className="eyebrow">PeriPals</p>
        <h1>My PeriPals</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Support that goes both ways.</p>
      </div>
      <PalsGate><Pals /></PalsGate>
    </>
  ),
});

function Pals() {
  const { user } = useRewards();
  const qc = useQueryClient();
  const pals = useQuery({ queryKey: ["pals"], queryFn: fetchPals });
  const mine = useQuery({ queryKey: ["pal_status_mine", user!.id], queryFn: async () => (await supabase.from("pal_status").select("status").eq("user_id", user!.id).maybeSingle()).data?.status ?? null });
  const settings = useQuery({ queryKey: ["pal_settings", user!.id], queryFn: async () => (await supabase.from("pal_settings").select("*").maybeSingle()).data });

  const post = async (k: string) => {
    const { error } = await supabase.from("pal_status").upsert({ user_id: user!.id, status: k, updated_at: new Date().toISOString() });
    if (error) { toast("Couldn't post that. Please try again."); return; }
    qc.invalidateQueries({ queryKey: ["pal_status_mine"] });
    toast(`Posted '${statusLabel(k)!.label}' to your PeriPals`);
  };
  const pauseAll = async (on: boolean) => {
    await supabase.from("pal_settings").upsert({ user_id: user!.id, paused_all: on });
    qc.invalidateQueries({ queryKey: ["pal_settings"] });
    toast(on ? "Sharing paused with everyone" : "Sharing is back on");
  };

  return (
    <>
      <Card>
        <h3>How's your weather today?</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Your status">
          {STATUSES.map((s) => <Chip key={s.key} pressed={mine.data === s.key} onClick={() => post(s.key)}>{s.emoji} {s.label}</Chip>)}
        </div>
        <Muted className="text-xs">Only PeriPals you've allowed to see your status will see this.</Muted>
      </Card>

      <section className="flex flex-col gap-2.5" aria-label="Your PeriPals">
        {pals.isLoading && <Muted>Loading…</Muted>}
        {pals.data?.length === 0 && <p className="mm-card p-[18px] text-sm text-muted-foreground">No PeriPals yet. Invite someone you trust; you choose exactly what they see.</p>}
        {pals.data?.map((p) => {
          const st = statusLabel(p.their_status);
          const pending = p.i_share_status === "pending";
          return (
            <Link key={p.other_id} to="/pals/$id" params={{ id: p.other_id }} className="mm-card press flex items-center gap-3 p-3.5">
              <Initials name={p.other_name} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2"><b className="truncate">{p.other_name}</b><span className="text-xs text-muted-foreground">{p.relationship}</span></span>
                <span className="block truncate text-sm text-muted-foreground">
                  {pending ? "Accepted your invite · tap to confirm" : st ? `${st.emoji} ${st.label}` : p.last_body ?? "Say hello"}
                </span>
              </span>
              {p.unread > 0 && <span className="grid min-w-6 place-items-center rounded-full bg-plum px-1.5 text-xs font-bold text-shell" aria-label={`${p.unread} unread`}>{p.unread}</span>}
            </Link>
          );
        })}
        <Link to="/pals/invite" className="press inline-flex min-h-11 items-center justify-center rounded-full bg-plum px-5 py-3 font-bold text-shell shadow-soft">+ Invite a PeriPal</Link>
      </section>

      <Card>
        <h3>Sharing is always your choice</h3>
        <label className="flex items-center justify-between gap-3 text-sm font-bold">
          Pause all sharing
          <Switch checked={!!settings.data?.paused_all} onCheckedChange={pauseAll} />
        </label>
        <Muted>If someone is pressuring you to share, or checking up on you in a way that doesn't feel right, you can remove them at any time. <a href="tel:1800737732" className="font-bold underline">1800RESPECT</a> is there 24/7 on 1800 737 732.</Muted>
      </Card>
    </>
  );
}
