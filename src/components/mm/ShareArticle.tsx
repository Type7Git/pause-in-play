import { useState } from "react";
import { Share2 } from "lucide-react";
import { shareOrigin, type SharePayload } from "@/lib/share";
import { ShareSheet } from "./ShareSheet";

/** Share an article as a link into the app. Whoever opens it needs a free account to read it. */
export function ShareArticle({ id, title }: { id: string; title: string }) {
  const [sharing, setSharing] = useState<SharePayload | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => setSharing({
          title: `Share "${title}"`,
          text: `I found this helpful: "${title}". It's in Lumenera (free account needed to read it).`,
          palText: `I found this helpful and thought of you: "${title}"`,
          url: `${shareOrigin()}/read/${id}`,
        })}
        className="press inline-flex min-h-11 items-center gap-2 self-start rounded-full border-[1.5px] border-line bg-card px-4 text-sm font-bold text-plum"
      >
        <Share2 className="size-4" aria-hidden="true" />Share this
      </button>
      <ShareSheet open={!!sharing} payload={sharing} onClose={() => setSharing(null)} />
    </>
  );
}
