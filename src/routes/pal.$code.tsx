import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PalsGate } from "@/components/mm/PalsGate";
import { Card, Muted, Pill } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { friendlyError, PERMS } from "@/lib/pals";

export const Route = createFileRoute("/pal/$code")({
  head: () => ({
    meta: [
      { title: "You're invited to be a PeriPal · Pause in Play" },
      { name: "description", content: "Someone you know has invited you to be their PeriPal on Pause in Play." },
      { property: "og:title", content: "You're invited to be a PeriPal" },
      { property: "og:description", content: "Support that goes both ways, on Pause in Play." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <>
      <div><p className="eyebrow">PeriPals</p><h1>You're invited</h1></div>
      <PalsGate why="Sign in or create a free account to see this invite."><Accept /></PalsGate>
    </>
  ),
});

function Accept() {
  const { code } = Route.useParams();
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["invite", code], queryFn: async () => (await supabase.rpc("pal_invite_preview", { _code: code })).data?.[0] ?? null });
  if (q.isLoading) return <Muted>Loading…</Muted>;
  const i = q.data;
  if (!i || !i.valid) return <Card><h3>This invite has expired or was already used</h3><Muted>Ask for a new link if you'd like to connect.</Muted><Link to="/" className="font-bold text-plum underline">Go home</Link></Card>;
  if (i.is_mine) return <Card><h3>This is your own invite</h3><Muted>Send the link to the person you're inviting.</Muted></Card>;
  const p = i.permissions as Record<string, boolean>;
  const sees = PERMS.filter((x) => p[x.key]).map((x) => x.label);
  return (
    <Card>
      <h3>{i.owner_name} has invited you to be their PeriPal.</h3>
      <Muted>You'll be able to see: {sees.length ? sees.join(", ") : "nothing yet, just that you're connected"}.</Muted>
      <Muted className="text-xs">{i.owner_name} confirms you before anything is shared.</Muted>
      <div className="flex gap-2">
        <Pill onClick={async () => {
          const { error } = await supabase.rpc("pal_accept_invite", { _code: code });
          if (error) { toast(friendlyError(error)); return; }
          toast(`Accepted. ${i.owner_name} will confirm you soon.`);
          nav({ to: "/pals" });
        }}>Accept</Pill>
        <Pill variant="ghost" onClick={() => nav({ to: "/" })}>Decline</Pill>
      </div>
      <Muted className="text-xs">Want to share back with {i.owner_name}? After accepting, <Link to="/pals/invite" className="font-bold underline">invite her too</Link>.</Muted>
    </Card>
  );
}
