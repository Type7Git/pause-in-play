const HELPS = ["Ask what would help, rather than guessing", "Take something off her plate without being asked", "Offer closeness that doesn't have to lead to sex", "Learn about it yourself, so she doesn't have to explain everything", "Treat changes in desire as something you face together, not a verdict on you", "Offer to come to an appointment, if she'd like"];
const DONT = ['Jokes about her being "hormonal"', 'Taking a "not tonight" personally', "Jumping to fix it when she wants to be heard", "Keeping score"];
const ASK = ["What would make this week easier?", "What kind of closeness feels good right now?", "Is there anything you'd like me to read or learn?"];

/** Static partner guide. Contains no user data, so it is safe on the public /partners page. */
export function PartnerGuide() {
  const list = (items: string[]) => <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">{items.map((t) => <li key={t}>{t}</li>)}</ul>;
  return (
    <>
      <section className="mm-card flex flex-col gap-2 p-[18px]"><h2 className="font-display text-lg">What's happening</h2><p className="text-sm">Perimenopause is the lead-up to menopause, when hormone levels rise and fall unpredictably, often for several years. It can affect sleep, mood, memory, energy, body temperature, comfort and desire. It's a normal life stage, and it can still be really hard.</p></section>
      <section className="mm-card flex flex-col gap-2 p-[18px]"><h2 className="font-display text-lg">What helps</h2>{list(HELPS)}</section>
      <section className="mm-card flex flex-col gap-2 p-[18px]"><h2 className="font-display text-lg">What doesn't help</h2>{list(DONT)}</section>
      <section className="mm-card flex flex-col gap-2 p-[18px]"><h2 className="font-display text-lg">Questions you could ask</h2>{list(ASK.map((q) => `"${q}"`))}</section>
      <p className="text-xs text-muted-foreground">Clinically reviewed by our clinical advisory panel.</p>
    </>
  );
}
