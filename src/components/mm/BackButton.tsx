import { Link } from "@tanstack/react-router";

export function BackButton() {
  return (
    <Link
      to="/"
      className="press inline-flex items-center gap-1.5 self-start rounded-full border border-line bg-card py-1.5 pl-2.5 pr-3.5 text-sm font-bold text-plum shadow-soft"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      What do you need?
    </Link>
  );
}

export function PlaceholderScreen({ eyebrow, title, blurb }: { eyebrow: string; title: string; blurb: string }) {
  return (
    <>
      <BackButton />
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="mm-card flex flex-col gap-3 p-[18px]">
        <p className="text-muted-foreground">{blurb}</p>
        <p className="text-sm text-muted-foreground">This one's still growing. Check back soon.</p>
      </div>
    </>
  );
}
