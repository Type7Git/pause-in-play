/** Pure, browser-safe Enera rules (Enera was called Sprout; code names keep "sprout"): safety screening, privacy scrubbing and tool names. */

export const TOOLS = {
  "side-quest": "What was I doing?",
  remember: "Help me remember",
  tabs: "37 tabs",
  "wind-down": "Relax and Restore",
  notes: "Little notes",
  "little-win": "A little win",
  laugh: "I need a laugh",
  erin: "Our clinical panel",
  panel: "Our clinical panel",
  medicines: "Medicine cabinet",
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
  "That's an important question, and it really needs someone who knows your health. I can't advise on your own medicines, doses, results or symptoms. Your GP is the best place to start (or your pharmacist for anything about medicines), and they can refer you on if needed. Healthdirect is also there any time on 1800 022 222.";

export const URGENT_REPLY = `That sounds like it needs care today, not a chat with me.
If it's severe or sudden, call 000 or go to your nearest emergency department.
Otherwise, call your GP today, or Healthdirect on 1800 022 222 (24 hours) for advice on where to go.`;

/** Used only if Enera can't form a reply at all. */
export const NO_MATCH_REPLY =
  "I'm not sure I've got anything helpful on that just yet, and I'd rather not guess. Could you tell me a little more about what's going on? Or have a look at the Guide in the menu, which explains every space and tool.";

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

/** Red flags: point to urgent care before anything else. */
const URGENT = [
  /\bchest pain\b/, /\b(can'?t|cannot|struggling to|hard to|trouble) breath/, /\bfaint(ed|ing)?\b/, /\bpass(ed|ing) out\b/,
  /\bsevere (pain|bleeding|headache)\b/, /\bsoak(ing|ed)?\b.*\b(hour|pad|pads)\b/, /\bseizure/, /\boverdos/,
  /\bbaby\b.*\b(not moving|stopped moving|moving less|isn'?t moving)\b/, /\b(not|stopped|isn'?t) breathing\b/,
];
export const isUrgent = (msg: string) => URGENT.some((r) => r.test(normalise(msg)));

/** Personal medical advice never reaches the model: her own medicines, doses, results, diagnoses and worrying symptoms. General health questions do. */
const CLINICAL = [
  /\bshould i (take|stop|start|use|try|come off|go on|switch|swap|increase|decrease|reduce|double|skip|mix)\b/,
  /\b(can|could) i (take|stop|come off|go on|switch|swap|increase|decrease|reduce|double|skip|mix)\b/,
  /\bdos(e|es|age|ing)\b/, /\bhow (much|many) .*\b(take|use)\b/, /\bhow often .*\btake\b/, /\bmissed (a |my )?(pill|dose|injection|tablet)\b/,
  /\bis it (safe|ok|okay) (to|for me|if i)\b/, /\binteract/, /\bside effects? (of|from) my\b/, /\bwith my (medicine|medication|pill|tablets?|hrt|mht)\b/,
  /\bdo i have\b/, /\bhave i got\b/, /\bwhat'?s wrong with me\b/, /\bdiagnos(e|is) me\b/, /\bcould (it|this) be\b/,
  /\bam i (pregnant|in (peri)?menopause|perimenopausal|menopausal|infertile|going through)\b/, /\bis (this|my) .*\bnormal\b/, /\bis it normal (that|for) my\b/,
  /\bmy ((blood|test|scan|pap|smear|screening|mammogram|ultrasound|biopsy) )*results?\b/, /\blump\b/,
  /\bbleed(ing)? after (menopause|sex|intercourse)\b/, /\bpost-?menopausal bleed/, /\bpalpitation/,
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
  kind: "answer" | "chat" | "crisis" | "clinical" | "urgent" | "nomatch" | "limit" | "error";
  text: string;
  /** Where the answer came from: an approved library entry or article (reviewed), or Lumenera's own guide. */
  source?: { title: string; reviewed: boolean };
  /** One place to go next. */
  link?: { to: string; label: string };
  /** Up to three short follow-ups she might tap. */
  next?: string[];
};
