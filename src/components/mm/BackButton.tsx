/** Lumenera's top bar now carries Back on every tool page, so the old in-page button stays out of the way. */
export function BackButton() {
  return null;
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
