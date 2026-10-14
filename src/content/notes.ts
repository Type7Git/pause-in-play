/** Little notes: kind, real words. Not inspirational-quote style, no medical claims. Ids are stable (used in links). */
export type NoteKind = "encouragement" | "understanding" | "support" | "wisdom";
export type Note = { id: string; kind: NoteKind; text: string };

export const NOTE_KINDS: { key: NoteKind; name: string }[] = [
  { key: "encouragement", name: "Encouragement" },
  { key: "understanding", name: "Understanding" },
  { key: "support", name: "Support" },
  { key: "wisdom", name: "Wisdom" },
];

const E = (n: number, text: string): Note => ({ id: `e${n}`, kind: "encouragement", text });
const U = (n: number, text: string): Note => ({ id: `u${n}`, kind: "understanding", text });
const S = (n: number, text: string): Note => ({ id: `s${n}`, kind: "support", text });
const W = (n: number, text: string): Note => ({ id: `w${n}`, kind: "wisdom", text });

export const NOTES: Note[] = [
  E(1, "You don't have to feel ready. You just have to start small."),
  E(2, "Some days the win is just getting through. That counts."),
  E(3, "You've handled every hard day so far. Today's allowed to be one of them."),
  E(4, "Done is better than perfect. Especially today."),
  E(5, "You're allowed to go slower than you used to."),
  E(6, "That thing you've been putting off? Five minutes. That's all it needs from you."),
  E(7, "Look how far you've come, even on the days it didn't feel like it."),
  E(8, "Tiny steps still move you forward."),
  E(9, "Trust yourself a bit more today. You know more than you think."),
  E(10, "Be proud of the quiet things nobody saw you do."),
  E(11, "You don't need to earn a rest. Take it anyway."),
  E(12, "You've got more in you than this week is letting you feel."),

  U(1, "Losing a word mid-sentence is really common at this stage. It doesn't make you any less clever."),
  U(2, "Feeling flat for no clear reason is still a real feeling."),
  U(3, "If you're tired of being tired, that makes complete sense."),
  U(4, "Irritability that comes out of nowhere is common right now. You're not turning into someone else."),
  U(5, "It's okay if your body feels unfamiliar right now. It's changing, and you're allowed to take time to catch up."),
  U(6, "Not wanting to do the things you used to love is information, not failure."),
  U(7, "Awake at 3am? So are a lot of us. You're not the only one up."),
  U(8, "You can love your people and still need an hour where nobody needs you."),
  U(9, "Brain like 37 open tabs? Close one. Leave the rest for later."),
  U(10, "Your patience isn't broken. It's just running on less sleep."),
  U(11, "Hot, cold, hot again. Your thermostat's having a moment, not you."),
  U(12, "Cried at an ad today? Welcome. You're in good company."),

  S(1, "You don't have to carry it all. Who could take one thing off your plate?"),
  S(2, "Asking for help is a skill, not a weakness."),
  S(3, "A text to a friend who gets it can change your whole afternoon."),
  S(4, "Your GP is there for this. It's okay to book the appointment."),
  S(5, "Have a glass of water. Seriously. Then come back to the rest."),
  S(6, "If today is heavy, put it down for five minutes. It'll still be there."),
  S(7, "You're allowed to say 'not today'."),
  S(8, "Step outside for a minute. Fresh air is cheap and it works."),
  S(9, "Someone out there is going through exactly this today. You're not alone in it."),
  S(10, "Eat something kind before the next big thing."),
  S(11, "Unclench your jaw. Drop your shoulders. Breathe out slowly."),
  S(12, "It's okay to need more support than you used to."),

  W(1, "This is a season, not a sentence."),
  W(2, "You can't pour from an empty cup. But a slightly chipped one still holds plenty."),
  W(3, "Rest is productive. Your body is doing a lot of work right now."),
  W(4, "Comparison is loud. Your own pace is quieter, and wiser."),
  W(5, "Not everything needs an answer today."),
  W(6, "Boundaries are just kindness with a clear edge."),
  W(7, "Change feels uncomfortable because it matters."),
  W(8, "Midlife isn't the end of anything. It's the middle of your story."),
  W(9, "The goal isn't to get it all done. It's to feel okay while you do some of it."),
  W(10, "What you're feeling is real, and it will shift."),
  W(11, "You get to decide what 'enough' looks like today."),
  W(12, "Kindness to yourself isn't soft. It's how people keep going."),
];

export const noteById = (id: string | undefined) => NOTES.find((n) => n.id === id);

/** Card looks: a soft background, an accent and a little drawing. */
export const NOTE_STYLES = [
  { bg: "linear-gradient(150deg,#F6DEDA,#FBEFEA)", ink: "#5a2a25", accent: "#A8483F", art: "petals" },
  { bg: "linear-gradient(150deg,#DCEBE0,#F1F7F2)", ink: "#23402c", accent: "#3F6A4C", art: "leaf" },
  { bg: "linear-gradient(150deg,#FAE8CB,#FDF5E7)", ink: "#5c3c0c", accent: "#D48A22", art: "sun" },
  { bg: "linear-gradient(150deg,#EADFF1,#F7F2FA)", ink: "#3d2649", accent: "#6F4D80", art: "moon" },
  { bg: "linear-gradient(150deg,#DDE8F3,#F2F7FB)", ink: "#22384f", accent: "#4F7AA3", art: "wave" },
  { bg: "linear-gradient(150deg,#F3E3EC,#FBF4F8)", ink: "#4a2338", accent: "#9C4A73", art: "heart" },
] as const;
export const styleFor = (n: Note) => NOTE_STYLES[NOTES.indexOf(n) % NOTE_STYLES.length]!;
