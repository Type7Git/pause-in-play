/** Home section wheel content. Add a section or activity here — no component changes needed. */
export type ActivityKey = string;
export type Activity = {
  key: ActivityKey;
  title: string;
  desc: string;
  /** Route path; omit for activities not built yet (shown as "Coming soon"). */
  to?: string;
  icon: string;
  blob: string;
};

export const ACTIVITIES: Record<ActivityKey, Activity> = {
  quest: { key: "quest", title: "What was I doing?", desc: "Save my place and the next step", to: "/side-quest", icon: "quest", blob: "bg-gold-soft" },
  vit: { key: "vit", title: "Help me remember", desc: "The Very Important Thing Department", to: "/remember", icon: "vit", blob: "bg-rose-soft" },
  voice: { key: "voice", title: "Tell Sprout", desc: "Say it out loud, Sprout files it", to: "/tell-sprout", icon: "voice", blob: "bg-sage-soft" },
  tabs: { key: "tabs", title: "My brain has 37 tabs open", desc: "Get it out of your head, then pick one", to: "/tabs", icon: "tabs", blob: "bg-plum-soft" },
  wind: { key: "wind", title: "Relax and Restore", desc: "Guided relaxations and rest poses", to: "/wind-down", icon: "wind", blob: "bg-plum-soft" },
  notes: { key: "notes", title: "Little notes", desc: "Kind words that turn up when you need them", to: "/notes", icon: "notes", blob: "bg-rose-soft" },
  colour: { key: "colour", title: "Colour me calm", desc: "Colour in. No going over the lines", to: "/colour", icon: "colour", blob: "bg-gold-soft" },
  wyr: { key: "wyr", title: "Would you rather?", desc: "Swipe to find out who you'd rather be", to: "/would-you-rather", icon: "wyr", blob: "bg-rose-soft" },
  win: { key: "win", title: "Give me a little win", desc: "A short, untimed puzzle", to: "/little-win", icon: "win", blob: "bg-sage-soft" },
  laugh: { key: "laugh", title: "I need a laugh", desc: "An everyday scene to sort out", to: "/laugh", icon: "laugh", blob: "bg-gold-soft" },
  reflect: { key: "reflect", to: "/intimacy/check-in", title: "What's changed for me", desc: "A private check-in", icon: "reflect", blob: "bg-rose-soft" },
  talk: { key: "talk", to: "/intimacy/cards", title: "Conversation cards", desc: "Questions to ask each other", icon: "talk", blob: "bg-plum-soft" },
  kindly: { key: "kindly", to: "/intimacy/say-it-kindly", title: "Say it kindly", desc: "Words for tricky conversations", icon: "kindly", blob: "bg-sage-soft" },
  partner: { key: "partner", to: "/intimacy/partner-guide", title: "For your partner", desc: "Something to share with them", icon: "partner", blob: "bg-gold-soft" },
  ilearn: { key: "ilearn", to: "/intimacy/library", title: "Intimacy library", desc: "Clinically reviewed reading", icon: "ilearn", blob: "bg-plum-soft" },
  pals: { key: "pals", to: "/pals", title: "My PeriPals", desc: "Check in with your people", icon: "pals", blob: "bg-rose-soft" },
  invite: { key: "invite", to: "/pals/invite", title: "Invite a PeriPal", desc: "Bring a friend along", icon: "invite", blob: "bg-sage-soft" },
  mood: { key: "mood", title: "Mood Mapper", desc: "Two taps to log how you feel", to: "/mood", icon: "mood", blob: "bg-rose-soft" },
  meds: { key: "meds", title: "Medicine Cabinet", desc: "Your reminders, your way", to: "/medicines", icon: "medicines", blob: "bg-plum-soft" },
  cycle: { key: "cycle", title: "Cycle Tracker", desc: "Periods, spotting and symptoms", to: "/cycle", icon: "cycle", blob: "bg-rose-soft" },
  move: { key: "move", title: "Move today", desc: "Short sessions, when you feel you can", to: "/move", icon: "move", blob: "bg-sage-soft" },
  pelvic: { key: "pelvic", title: "Pelvic floor trainer", desc: "Squeeze, lift and let go", to: "/pelvic", icon: "pelvic", blob: "bg-rose-soft" },
  food: { key: "food", title: "Food for this stage", desc: "Add in, never cut out", to: "/food", icon: "food", blob: "bg-gold-soft" },
  bodylearn: { key: "bodylearn", title: "Why it helps", desc: "The why behind moving and eating well", to: "/body/why", icon: "bodylearn", blob: "bg-plum-soft" },
  learn: { key: "learn", title: "Learn", desc: "Videos, articles and quizzes", to: "/learn", icon: "learn", blob: "bg-sage-soft" },
};

export type Section = {
  key: string;
  name: string;
  blurb: string;
  icon: string;
  blob: string;
  /** Activity keys; Favourites fills itself from the user's hearts. */
  activities: ActivityKey[];
  lockLine?: string;
  palsStrip?: boolean;
};

export const SECTIONS: Section[] = [
  { key: "favourites", name: "Favourites", blurb: "Your go-to tools, all in one place.", icon: "heart", blob: "bg-rose-soft", activities: [] },
  { key: "fog", name: "Brain fog helpers", blurb: "For the 'why did I walk in here?' moments.", icon: "brain", blob: "bg-gold-soft", activities: ["quest", "vit", "voice"] },
  { key: "calm", name: "Some me time", blurb: "Settle your body. Quiet your mind.", icon: "calm", blob: "bg-plum-soft", activities: ["tabs", "wind", "notes", "colour"] },
  { key: "play", name: "Playful challenges", blurb: "Small wins and a good laugh.", icon: "play", blob: "bg-sage-soft", activities: ["wyr", "colour", "win", "laugh"] },
  { key: "body", name: "Resilient body", blurb: "Move and nourish, when you feel you can.", icon: "body", blob: "bg-sage-soft", activities: ["move", "pelvic", "food", "bodylearn"] },
  {
    key: "love", name: "Intimacy & relationships", blurb: "Private, practical and kind.", icon: "love", blob: "bg-rose-soft",
    activities: ["reflect", "talk", "kindly", "partner", "ilearn"],
    lockLine: "Private by default. Never shared with PeriPals, and you can hide this section behind Face ID in Settings.",
  },
  { key: "pals", name: "PeriPals", blurb: "Support that goes both ways.", icon: "pals", blob: "bg-gold-soft", activities: ["pals", "invite"], palsStrip: true },
  { key: "track", name: "Track & support", blurb: "Record, remind, reflect.", icon: "track", blob: "bg-sage-soft", activities: ["mood", "meds", "cycle", "learn"] },
];
