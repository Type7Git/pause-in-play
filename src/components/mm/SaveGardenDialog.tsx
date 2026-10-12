import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { SignInForm } from "./SignInForm";

/** Gentle prompt shown once after the first reward for signed-out visitors. */
export function SaveGardenDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={() => onOpenChange(false)}
      aria-labelledby="save-garden-title"
      className="m-auto w-[min(400px,calc(100%-32px))] rounded-[22px] border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/40"
    >
      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="eyebrow">Your garden is growing</p>
          <h2 id="save-garden-title" className="font-display text-[22px] font-bold leading-tight">Save your garden?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep your petals, badges and lists on any phone or computer. Totally optional.</p>
        </div>
        <SignInForm />
        <div className="flex items-center justify-between text-sm">
          <Link to="/privacy" onClick={() => onOpenChange(false)} className="font-bold text-plum underline-offset-2 hover:underline">What we store</Link>
          <button onClick={() => onOpenChange(false)} className="font-bold text-muted-foreground">Maybe later</button>
        </div>
      </div>
    </dialog>
  );
}
