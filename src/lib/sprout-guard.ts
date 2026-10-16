/** Pure, browser-safe Enera rules (Enera was called Enera; code names keep "sprout"): safety screening, privacy scrubbing and tool names. */

export const TOOLS = {
  "side-quest": "Side Quest Saver",
  remember: "the VIT Department",
  tabs: "37 tabs open",
  "wind-down": "Relax and Restore",
  notes: "Little notes",
  "little-win": "Give me a little win",
  laugh: "I need a laugh",
  erin: "Our clinical panel",
  panel: "Our clinical panel",
  medicines: "Medicine Cabinet",
  mood: "Mood Mapper",
  learn: "Lume Library",
  cycle: "Cycle Tracker",
  settings: "Settings",
  sprout: "Ask Enera",
  "tell-sprout": "Tell Enera",
  home: "Home",
  favourites: "Favourites",
  colour: "Colour me calm",
  "would-you-rather": "Would you rather?",
  peripals: "Lume Lounge",
  intimacy: "Sexual health and relationships",
  reflect: "What's changed for me",
  "talk-cards": "Conversation cards",
  "say-it-kindly": "Say it kindly",
  "partner-guide": "For your partner",
  "intimacy-library": "Intimacy library",
  move: "Move today",
  pelvic: "Pelvic floor trainer",
  food: "Food for this stage",
} as const;
export type ToolKey = keyof typeof TOOLS;
/** Where each linked tool opens. Section links open home with that section selected. */
export const TOOL_ROUTES: Record<ToolKey, { to: string; section?: string }> = {
  "side-quest": { to: "/side-quest" }, remember: { to: "/remember" }, tabs: { to: "/tabs" }, "wind-down": { to: "/wind-down" }, notes: { to: "/notes" },
  "little-win": { to: "/little-win" }, laugh: { to: "/laugh" }, erin: { to: "/panel" }, panel: { to: "/panel" },
  medicines: { to: "/medicines" }, mood: { to: "/mood" }, learn: { to: "/library" }, cycle: { to: "/cycle" }, settings: { to: "/settings" },
  sprout: { to: "/enera" }, "tell-sprout": { to: "/tell-enera" }, home: { to: "/home" }, favourites: { to: "/home" },
  colour: { to: "/colour" }, "would-you-rather": { to: "/would-you-rather" }, peripals: { to: "/pals" }, intimacy: { to: "/space/contra" },
  reflect: { to: "/intimacy/check-in" }, "talk-cards": { to: "/intimacy/cards" }, "say-it-kindly": { to: "/intimacy/say-it-kindly" },
  "partner-guide": { to: "/intimacy/partner-guide" }, "intimacy-library": { to: "/intimacy/library" },
  move: { to: "/move" }, pelvic: { to: "/pelvic" }, food: { to: "/food" },
};
export const isToolKey = (v: unknown): v is ToolKey => typeof v === "string" && v in TOOLS;

export const CRISIS_REPLY = `I'm really glad you told me. I'm an AI and can't give you the support you deserve right now, but people can.
Lifeline: 13 11 14 (24 hours, call or text)
Emergency: 000
If you can, let someone close to you know how you're feeling, or see your GP soon.`;

export const CLINICAL_REPLY =
  "That's an important question, and it needs someone who knows your health. I can't advise on medication, hormones, tests or symptoms. Your GP is the best place to start, and they can refer you on if needed.";

export const NO_MATCH_REPLY =
  "I don't have anything on that in the Lumenera library yet. I've noted the question (anonymously) so the clinical team can consider adding it. In the meantime, the spaces on your home screen are full of tools that might fit.";

export const RATE_LIMIT_REPLY =
  "I need a little rest. You've sent lots of messages this hour, so let's pick this up a bit later. The tools on the home screen are always there.";

export const normalise = (s: string) =>
  s.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();

const CRISIS = [
  /\bsuicid/, /\bkill(ing)? my ?self\b/, /\bend(ing)? (my|it) (life|all)\b/, /\bend it all\b/, /\btake my (own )?life\b/,
  /\b(don'?t|do not|dont) want to (be here|live|exist|wake up)\b/, /\bhurt(ing)? my ?self\b/, /\bself[- ]?harm/,
  /\bharm(ing)? my ?self\b/, /\bcut(ting)? my ?self\b/, /\b(can'?t|cannot|cant) go on\b/, /\bno reason to (live|go on)\b/,
  /\bbetter off without me\b/, /\bwant to die\b/, /\bwish i (was|were) dead\b/, /\bhurt (someone|somebody|him|her|them|my (kids?|husband|partner))\b/,
];
export const isCrisis = (msg: string) => CRISIS.some((r) => r.test(normalise(msg)));

const CLINICAL = [
  /\bmedic(ation|ine)s?\b/, /\bmeds\b/, /\bhrt\b/, /\bmht\b/, /\bhormone/, /\boestrogen|\bestrogen|\bprogesterone|\btestosterone/,
  /\bsupplements?\b/, /\bvitamins?\b/, /\bmagnesium\b/, /\bdos(e|es|age)\b/, /\bhow much .* (should i )?take\b/, /\bpills?\b/,
  /\bprescri/, /\bantidepress/, /\bblood tests?\b/, /\btests?\b/, /\bdiagnos/, /\bbleed/, /\bperiod (is|has|keeps)\b/,
  /\bhot flush|\bhot flash|\bnight sweats?\b/, /\blump\b/, /\bpain\b/, /\bpalpitation/,
];
export const isClinical = (msg: string) => CLINICAL.some((r) => r.test(normalise(msg)));

/** Removes emails and phone numbers before anything is saved. */
export function scrubPII(msg: string) {
  return msg
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email removed]")
    .replace(/(\+?\d[\d\s().-]{6,}\d)/g, "[number removed]")
    .trim()
    .slice(0, 500);
}

const STOP = new Set("i me my a an the is am are was to of and or in on at it for do does why what how can can't cant you your so with that this be keep".split(" "));
/** Builds an OR tsquery from the user's words, e.g. "losing | keys". */
export function toTsQuery(msg: string) {
  const words = [...new Set((normalise(msg).match(/[a-z0-9]+/g) ?? []).filter((w) => w.length > 2 && !STOP.has(w)))].slice(0, 12);
  return words.join(" | ");
}

export type SproutReply = {
  kind: "answer" | "crisis" | "clinical" | "nomatch" | "limit" | "error";
  text: string;
  entry?: { title: string; linked_tool: ToolKey | null };
};
