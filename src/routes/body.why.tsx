import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/mm/BackButton";
import { Muted, ScreenTitle } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { ShareArticle } from "@/components/mm/ShareArticle";

export const Route = createFileRoute("/body/why")({
  head: () => ({ meta: [{ title: "Why it helps · Pause in Play" }, { name: "description", content: "Clinically reviewed reading on movement, bones, pelvic floor and food at midlife." }, { property: "og:title", content: "Why it helps · Pause in Play" }, { property: "og:description", content: "The why behind movement and food in perimenopause." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Why,
});

function Why() {
  const { data, isLoading } = useQuery({
    queryKey: ["body-why"],
    queryFn: async () => (await supabase.from("learn_content").select("id, title, body, review_label").eq("section", "body").eq("status", "approved").order("updated_at")).data ?? [],
  });
  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Resilient body" title="Why it helps" sub="Short reads on movement, bones and food." />
      {isLoading ? <Muted>Opening…</Muted> : !data?.length ? <Muted>New articles are being reviewed by our clinical advisory panel. Check back soon.</Muted> : data.map((a) => (
        <details key={a.id} className="mm-card p-[18px]">
          <summary className="flex min-h-11 cursor-pointer list-none flex-col gap-1 [&::-webkit-details-marker]:hidden">
            <b className="font-display text-base">{a.title}</b>
            <span className="text-xs font-bold text-sage">{a.review_label ?? "Clinically reviewed"}</span>
          </summary>
          <p className="mt-3 whitespace-pre-line border-t border-line pt-3 text-sm">{a.body}</p>
          <div className="mt-3"><ShareArticle id={a.id} title={a.title} /></div>
        </details>
      ))}
      <p className="text-xs text-muted-foreground">General information only, not medical advice.</p>
    </>
  );
}
