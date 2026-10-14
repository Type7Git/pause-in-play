import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import { BackButton } from "@/components/mm/BackButton";
import { ShareArticle } from "@/components/mm/ShareArticle";
import { SignInForm } from "@/components/mm/SignInForm";
import { Card, Muted } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/read/$id")({
  head: () => ({
    meta: [
      { title: "Shared with you · Pause in Play" },
      { name: "description", content: "Someone shared an article from Pause in Play with you." },
      { property: "og:title", content: "Shared with you · Pause in Play" },
      { property: "og:description", content: "A clinically reviewed read from Pause in Play." },
      { property: "og:type", content: "article" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Read,
});

const MORE = { general: { to: "/learn", label: "More in Learn" }, intimacy: { to: "/intimacy/library", label: "More in the Intimacy library" }, body: { to: "/body/why", label: "More in Why it helps" } } as const;

/** A shared article. Signed in: the full read. Not signed in: a taste, and a free account to read on. */
function Read() {
  const { id } = Route.useParams();
  const { ready, user } = useRewards();
  const q = useQuery({
    queryKey: ["read", id],
    queryFn: async () => (await supabase.from("learn_content").select("id, title, summary, body, kind, video_url, tier, section, review_label").eq("id", id).eq("status", "approved").maybeSingle()).data,
  });
  if (q.isLoading || !ready) return <Muted>Opening…</Muted>;
  const a = q.data;
  if (!a) return <Card><h3>This article isn't available any more</h3><Muted>It may have been updated or moved.</Muted><Link to="/" className="font-bold text-plum underline">Go to Pause in Play</Link></Card>;
  const more = MORE[(a.section ?? "general") as keyof typeof MORE] ?? MORE.general;
  const teaser = a.summary || `${(a.body ?? "").slice(0, 180).trim()}…`;
  return (
    <>
      {user && <BackButton />}
      <div>
        <p className="eyebrow">{user ? "Shared with you" : "Someone shared this with you"}</p>
        <h1>{a.title}</h1>
        <p className="mt-1 text-xs font-bold text-sage">{a.review_label ?? "Clinically reviewed"}</p>
      </div>
      {user ? (
        <Card>
          {a.tier === "plus" ? (
            <><LockKeyhole className="size-6 text-plum" aria-hidden="true" /><Muted>Part of the Plus collection. Plans aren't available yet.</Muted></>
          ) : (
            <>
              {a.kind === "video" && a.video_url && <a href={a.video_url} target="_blank" rel="noreferrer" className="font-bold text-plum underline">Watch the video</a>}
              <p className="whitespace-pre-line text-sm">{a.body}</p>
              <ShareArticle id={a.id} title={a.title} />
            </>
          )}
          <Link to={more.to} className="font-bold text-plum underline">{more.label}</Link>
        </Card>
      ) : (
        <>
          <Card>
            <p className="text-sm">{teaser}</p>
            <div className="rounded-2xl bg-plum-soft p-3.5 text-sm">
              <b className="font-display text-base">Read the rest in Pause in Play</b>
              <p className="mt-0.5 text-muted-foreground">It's free. A small, kind companion for perimenopause, with tools, games and clinically reviewed reads.</p>
            </div>
          </Card>
          <Card><h3>Create your free account</h3><SignInForm /></Card>
        </>
      )}
      <p className="text-xs text-muted-foreground">General information only, not medical advice.</p>
    </>
  );
}
