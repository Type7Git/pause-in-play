import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { getLevel } from "@/lib/levels";
import { useRewards } from "@/lib/rewards";
import { LogoMark, PetalShape } from "./icons";

function Meter() {
  const { petals } = useRewards();
  const L = getLevel(petals);
  const C = 2 * Math.PI * 12;
  return (
    <div
      id="petal-meter"
      aria-label={`${petals} petals, ${L.name}`}
      className="flex items-center gap-2 rounded-full border border-line bg-card py-1 pl-1 pr-3 font-bold tabular-nums shadow-soft"
    >
      <svg viewBox="0 0 30 30" aria-hidden="true" className="size-[30px]">
        <circle cx="15" cy="15" r="12" fill="none" stroke="var(--mm-sunk)" strokeWidth="3.5" />
        <circle
          cx="15" cy="15" r="12" fill="none" stroke="var(--mm-gold)" strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - L.pct)} transform="rotate(-90 15 15)"
          className="transition-[stroke-dashoffset] duration-500"
        />
        <g transform="translate(9 9) scale(.5)"><PetalShape /></g>
      </svg>
      <span>{petals}</span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const quiet = useLocation({ select: (l) => l.pathname }) === "/wind-down";
  return (
    <div className="px-4 py-6">
      <div className="mx-auto flex max-w-[440px] flex-col">
        <div className={`relative flex min-h-[760px] flex-col overflow-hidden rounded-[32px] border border-line bg-shell shadow-lift transition-colors duration-500 ${quiet ? "quiet" : ""}`}>
          <header className="flex items-center justify-between gap-3 px-5 pb-1.5 pt-[22px]">
            <Link
              to="/"
              aria-label="Pause and Play, go to home"
              className="flex items-center gap-2 font-display text-xl font-extrabold tracking-[-0.01em] text-plum"
            >
              <LogoMark className="size-[26px]" />
              Pause and Play
            </Link>
            <div className={`flex items-center gap-2 ${quiet ? "invisible" : ""}`} aria-hidden={quiet || undefined}>
              <Meter />
              <Link to="/settings" aria-label="Settings and account" className="press grid size-[38px] place-items-center rounded-full border border-line bg-card text-plum shadow-soft">
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
              </Link>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-[18px] px-5 pb-7 pt-2">{children}</main>
          <footer className="px-5 pb-5 text-center text-xs text-muted-foreground">
            Education and skills, not medical advice or treatment. If you are in crisis, call Lifeline 13 11 14 or 000.{" "}
            <Link to="/privacy" className="underline underline-offset-2">Privacy</Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
