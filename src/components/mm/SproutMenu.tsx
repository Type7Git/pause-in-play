import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, MessageCircleHeart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sprout } from "./Sprout";
import { SproutMic } from "./icons";

const OPTIONS = [
  { to: "/sprout", title: "Ask Sprout", desc: "Questions answered from our reviewed library", icon: <MessageCircleHeart className="size-6 text-plum" aria-hidden="true" />, tint: "bg-plum-soft" },
  { to: "/tell-sprout", title: "File it", desc: "Say it out loud and Sprout puts it in the right place", icon: <SproutMic className="size-6 text-sage" />, tint: "bg-sage-soft" },
] as const;

/** Sprout lives top right. One tap opens two choices: ask a question, or file something by voice. */
export function SproutMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Sprout: ask a question or file something"
        className="press relative -my-1 grid size-11 shrink-0 min-[400px]:size-[50px] place-items-center rounded-full bg-sage-soft shadow-soft data-[state=open]:ring-2 data-[state=open]:ring-sage"
      >
        <Sprout size={40} mood={open ? "wave" : "happy"} className="-mb-1 max-[399px]:h-[38px] max-[399px]:w-[34px]" />
        <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-shell bg-gold" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(300px,calc(100vw-24px))] rounded-[22px] border-line bg-card p-2 text-ink shadow-lift data-[state=open]:zoom-in-90"
      >
        <p className="px-2.5 pb-1.5 pt-1 text-xs font-bold uppercase tracking-[0.1em] text-plum-2">What would help?</p>
        <ul className="flex flex-col gap-1">
          {OPTIONS.map((o, i) => (
            <li key={o.to} className="sprout-option" style={{ animationDelay: `${60 + i * 70}ms` }}>
              <Link
                to={o.to}
                onClick={() => setOpen(false)}
                className="flex min-h-[64px] items-center gap-3 rounded-2xl px-2.5 py-2 hover:bg-sunk focus-visible:bg-sunk"
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] ${o.tint}`}>{o.icon}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <b className="font-display text-[16px] leading-tight">
                    <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
                    {o.title}
                  </b>
                  <span className="text-[13px] leading-snug text-muted-foreground">{o.desc}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
