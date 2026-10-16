import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Muted, ScreenTitle } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { ShareArticle } from "@/components/mm/ShareArticle";

export const Route = createFileRoute("/intimacy/library")({
  head: () => ({ meta: [{ title: "Intimacy library · Lumenera" }, { name: "description", content: "Clinically reviewed articles on desire, comfort and connection at midlife." }, { property: "og:title", content: "Intimacy library · Lumenera" }, { property: "og:description", content: "Clinically reviewed reading on desire, comfort and connection." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Library,
});

function Library() {
  const { data, isLoading } = useQuery({
    queryKey: ["intimacy-library"],
    queryFn: async () => (await supabase.from("learn_content").select("id, title, body, review_label").eq("section", "intimacy").eq("status", "approved").order("title")).data ?? [],
  });
  return (
    <>
      <ScreenTitle eyebrow="Intimacy & relationships" title="Intimacy library" sub="Short, honest reads. Open any that interest you." />
      {isLoading ? <Muted>Opening the library…</Muted> : !data?.length ? <Muted>New articles are being reviewed by our clinical advisory panel. Check back soon.</Muted> : data.map((a) => (
        <details key={a.id} className="mm-card group p-[18px]">
          <summary className="flex min-h-11 cursor-pointer list-none flex-col gap-1 [&::-webkit-details-marker]:hidden">
            <b className="font-display text-base">{a.title}</b>
            <span className="text-xs font-bold text-sage">{a.review_label ?? "Clinically reviewed"}</span>
          </summary>
          <p className="mt-3 whitespace-pre-line border-t border-line pt-3 text-sm">{a.body}</p>
          <div className="mt-3"><ShareArticle id={a.id} title={a.title} /></div>
        </details>
      ))}
      <p className="text-xs text-muted-foreground">General information only, not medical advice. Medical topics are reviewed by a medical practitioner on our clinical advisory panel.</p>
    </>
  );
}
