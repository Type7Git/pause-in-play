import { useEffect, useRef, useState } from "react";
import { Share2, Users } from "lucide-react";
import type { Badge } from "@/lib/rewards";
import { BADGE_COPY } from "@/content/garden";
import { badgeShareLine, standingLine, type Standing } from "@/lib/garden";
import { BadgeGlyphShape } from "./icons";
import { prefersReducedMotion } from "./ui";
import { ShareSheet } from "./ShareSheet";
import { renderCard, svgImage } from "@/lib/share-cards";
import type { SharePayload } from "@/lib/share";

export function BadgeMedal({ badge, className = "size-[52px]" }: { badge: Badge; className?: string }) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" className={className}>
      {badge.earned ? (
        <>
          <path d="M18 42l-4 12 8-3 4 5 2-14zM38 42l4 12-8-3-4 5-2-14z" fill="var(--mm-rose)" />
          <circle cx="28" cy="27" r="20" fill="var(--mm-gold)" />
          <circle cx="28" cy="27" r="15.5" fill="var(--mm-gold-soft)" />
        </>
      ) : (
        <circle cx="28" cy="27" r="20" fill="none" stroke="var(--mm-line)" strokeWidth="2" strokeDasharray="4 4" />
      )}
      <g style={{ color: badge.earned ? "var(--mm-gold)" : "var(--mm-line)" }}><BadgeGlyphShape glyph={badge.glyph} /></g>
    </svg>
  );
}

function confetti(el: Element | null) {
  if (!el || prefersReducedMotion()) return;
  const r = el.getBoundingClientRect();
  const cols = ["var(--mm-gold)", "var(--mm-rose)", "var(--mm-plum-2)", "var(--mm-sage)"];
  for (let i = 0; i < 22; i++) {
    const b = document.createElement("i");
    b.className = "animate-fly pointer-events-none fixed z-[60] h-3.5 w-2.5";
    const a = (Math.PI * 2 * i) / 22;
    const d = 70 + (i % 3) * 22;
    Object.assign(b.style, { left: `${r.left + r.width / 2 - 5}px`, top: `${r.top + r.height / 2 - 7}px`, background: cols[i % 4], borderRadius: "50% 50% 50% 0" });
    b.style.setProperty("--dx", `${Math.cos(a) * d}px`);
    b.style.setProperty("--dy", `${Math.sin(a) * d}px`);
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 950);
  }
}

/** Tap a badge: it pops up big, says why it matters, and shows how it fits in the wider community. */
export function BadgeDialog({ badge, standing, onClose }: { badge: Badge | null; standing: Standing | null | undefined; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const medal = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (badge && !d.open) {
      d.showModal();
      if (badge.earned) setTimeout(() => confetti(medal.current), 380);
    }
    if (!badge && d.open) d.close();
  }, [badge]);
  const copy = badge ? BADGE_COPY[badge.key] : undefined;
  const [sharing, setSharing] = useState<SharePayload | null>(null);
  const share = () => {
    if (!badge) return;
    const el = medal.current?.querySelector<SVGSVGElement>(".badge-pop svg");
    setSharing({
      title: `${badge.name} badge`,
      text: `I just earned the "${badge.name}" badge in Lumenera. ${copy?.cheer ?? ""}`.trim(),
      palText: `🏅 I just earned "${badge.name}" in Lumenera! ${copy?.cheer ?? ""}`.trim(),
      fileName: `${badge.key}-badge.png`,
      image: async () => renderCard({ eyebrow: "Badge earned", title: badge.name, body: copy?.cheer, art: el ? await svgImage(el) : null, artShape: "medal", tint: "#FBEFD9" }),
    });
  };
  const rarity = badge ? badgeShareLine(standing, badge.key) : null;
  const line = standingLine(standing);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="badge-title"
      className="m-auto max-h-[calc(100dvh-24px)] w-[min(380px,calc(100%-24px))] overflow-visible rounded-[26px] border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/50"
    >
      {badge && (
        <div className="flex flex-col items-center gap-3 p-5 text-center">
          <div ref={medal} className="relative grid size-40 place-items-center">
            {badge.earned && (
              <svg viewBox="0 0 160 160" aria-hidden="true" className="badge-rays absolute inset-0">
                {Array.from({ length: 12 }, (_, i) => <path key={i} d="M80 80 L74 4 L86 4 Z" fill="var(--mm-gold)" opacity=".18" transform={`rotate(${i * 30} 80 80)`} />)}
              </svg>
            )}
            <div key={badge.key} className="badge-pop relative"><BadgeMedal badge={badge} className="size-32" /></div>
          </div>
          <div>
            <p className="eyebrow">{badge.earned ? "Congratulations!" : "Not yet, and that's fine"}</p>
            <h2 id="badge-title" className="font-display text-[24px] font-bold leading-tight">{badge.name}</h2>
          </div>
          {copy && (
            <div className="flex w-full flex-col gap-2.5 text-left">
              <div className="rounded-2xl bg-sunk p-3">
                <h3 className="text-[14px]">Why this matters</h3>
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{copy.why}</p>
              </div>
              {badge.earned ? (
                <p className="rounded-2xl bg-gold-soft p-3 text-sm font-bold leading-snug">{copy.cheer}</p>
              ) : (
                <div className="rounded-2xl border border-dashed border-line p-3">
                  <h3 className="text-[14px]">How to earn it</h3>
                  <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{copy.how} No rush. It'll be here when you're ready.</p>
                </div>
              )}
            </div>
          )}
          {(rarity || line) && (
            <div className="flex w-full items-start gap-2.5 border-t border-line pt-3 text-left text-[13px] leading-snug text-muted-foreground">
              <Users className="mt-0.5 size-4 shrink-0 text-plum" aria-hidden="true" />
              <p>{rarity}{rarity && line ? " " : ""}{line}</p>
            </div>
          )}
          <div className="flex w-full gap-2">
            {badge.earned && (
              <button type="button" onClick={share} className="press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-line bg-card px-4 text-sm font-bold text-plum">
                <Share2 className="size-4" aria-hidden="true" />Share
              </button>
            )}
            <button type="button" onClick={onClose} autoFocus className="press min-h-11 flex-[2] rounded-full bg-plum px-5 text-sm font-bold text-shell">
              Back to my garden
            </button>
          </div>
        </div>
      )}
      <ShareSheet open={!!sharing} payload={sharing} onClose={() => setSharing(null)} />
    </dialog>
  );
}
