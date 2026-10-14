import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, ImageUp, MessageCircle, Share2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRewards } from "@/lib/rewards";
import { copyText, downloadImage, openOutside, shareUrl, systemShare, whatsappHref, type SharePayload } from "@/lib/share";
import { hasPlugin } from "@/lib/native";

type Pal = { other_id: string; other_name: string; blocked: boolean; i_share_status: string | null; they_share_status: string | null };

/**
 * One share sheet for the whole app: a PeriPal, WhatsApp, the phone's own share options,
 * copy link and (in browsers) save the picture. Nothing personal is attached unless the user wrote it.
 */
export function ShareSheet({ open, onClose, payload, pals = true }: { open: boolean; onClose: () => void; payload: SharePayload | null; pals?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { user } = useRewards();
  const [preview, setPreview] = useState<string | null>(null);
  const [palList, setPalList] = useState<Pal[] | null>(null);
  const [showPals, setShowPals] = useState(false);
  const [sent, setSent] = useState<string[]>([]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    if (!open) { setShowPals(false); setSent([]); }
  }, [open]);

  useEffect(() => {
    let url: string | null = null;
    setPreview(null);
    if (open && payload?.image) void payload.image().then((b) => { if (b) { url = URL.createObjectURL(b); setPreview(url); } });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [open, payload]);

  const loadPals = async () => {
    setShowPals(true);
    if (palList || !user) return;
    const { data } = await supabase.rpc("pal_overview");
    setPalList(((data ?? []) as Pal[]).filter((p) => !p.blocked && (p.i_share_status === "active" || p.they_share_status === "active")));
  };

  const sendToPal = async (p: Pal) => {
    if (!payload || !user) return;
    const body = `${payload.palText ?? payload.text}${payload.url ? ` ${payload.url}` : ""}`.slice(0, 1000);
    const { error } = await supabase.from("pal_messages").insert({ sender_id: user.id, recipient_id: p.other_id, body, kind: "text" });
    if (error) { toast(error.message.includes("rate_limited") ? "Slow down a little, then try again." : `You can't message ${p.other_name} right now.`); return; }
    setSent((s) => [...s, p.other_id]);
    toast(`Sent to ${p.other_name}`);
  };

  const more = async () => {
    if (!payload) return;
    const r = await systemShare(payload);
    if (r === "copied") toast("Copied. Paste it wherever you like.");
    if (r === "saved") toast("Picture saved and link copied. Attach the picture and paste the link.");
    if (r === "shared") onClose();
  };

  const opt = "press flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-sunk px-1 text-[13px] font-bold leading-tight text-ink";
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="share-title"
      className="mx-auto mb-0 mt-auto w-full max-w-[440px] rounded-t-[26px] border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/45 sm:mb-auto sm:rounded-[26px]"
    >
      {payload && (
        <div className="flex flex-col gap-3.5 p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="share-title" className="font-display text-[20px] font-bold leading-tight">Share</h2>
              <p className="text-[13px] text-muted-foreground">{payload.title}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground"><X className="size-5" aria-hidden="true" /></button>
          </div>
          {preview && <img src={preview} alt="" className="mx-auto max-h-[220px] w-auto rounded-2xl border border-line shadow-soft" />}
          {!showPals ? (
            <div className="flex flex-col gap-2">
              {payload.image && (
                <button type="button" onClick={() => void more()} className="press flex min-h-[64px] items-center gap-3 rounded-2xl bg-plum px-4 text-left text-shell">
                  <ImageUp className="size-6 shrink-0" aria-hidden="true" />
                  <span className="flex flex-col">
                    <b className="text-[15px] leading-tight">Share picture + link</b>
                    <span className="text-[12.5px] opacity-85">WhatsApp, Messages, Instagram and more</span>
                  </span>
                </button>
              )}
              <div className="grid grid-cols-3 gap-2">
                {pals && <button type="button" className={opt} onClick={() => void loadPals()}><Users className="size-6 text-plum" aria-hidden="true" />A PeriPal</button>}
                {!payload.image && <button type="button" className={opt} onClick={() => openOutside(whatsappHref(payload))}><MessageCircle className="size-6 text-[#1f9d55]" aria-hidden="true" />WhatsApp</button>}
                {!payload.image && <button type="button" className={opt} onClick={() => void more()}><Share2 className="size-6 text-plum" aria-hidden="true" />More options</button>}
                <button type="button" className={opt} onClick={async () => toast((await copyText(`${payload.text} ${shareUrl(payload)}`)) ? "Copied" : "Couldn't copy on this device")}><Copy className="size-6 text-plum" aria-hidden="true" />{payload.image ? "Copy link" : "Copy"}</button>
                {payload.image && !hasPlugin("Share") && <button type="button" className={opt} onClick={() => void downloadImage(payload)}><Download className="size-6 text-plum" aria-hidden="true" />Save picture</button>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => setShowPals(false)} className="self-start text-sm font-bold text-plum">‹ Other ways to share</button>
              {!user ? (
                <p className="rounded-2xl bg-sunk p-3 text-sm">PeriPals need a free account. <Link to="/pals" onClick={onClose} className="font-bold text-plum underline">Set up PeriPals</Link></p>
              ) : palList === null ? (
                <p className="text-sm text-muted-foreground">Finding your PeriPals…</p>
              ) : !palList.length ? (
                <p className="rounded-2xl bg-sunk p-3 text-sm">No PeriPals yet. <Link to="/pals/invite" onClick={onClose} className="font-bold text-plum underline">Invite someone you trust</Link></p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {palList.map((p) => {
                    const done = sent.includes(p.other_id);
                    return (
                      <li key={p.other_id}>
                        <button type="button" disabled={done} onClick={() => void sendToPal(p)} className="press flex min-h-12 w-full items-center gap-3 rounded-2xl border border-line bg-sunk px-3 text-left font-bold disabled:opacity-70">
                          <span className="grid size-8 place-items-center rounded-full bg-plum-soft text-sm text-plum">{p.other_name.slice(0, 1)}</span>
                          <span className="flex-1">{p.other_name}</span>
                          {done ? <Check className="size-5 text-sage" aria-label="Sent" /> : <span className="text-sm text-plum">Send</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
          <p className="text-center text-[12px] text-muted-foreground">Only what you see here is shared. Nothing from your logs or check-ins.</p>
        </div>
      )}
    </dialog>
  );
}
