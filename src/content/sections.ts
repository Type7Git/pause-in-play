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
  tabs: { key: "tabs", title: "My brain has 37 tabs open", desc: "A one-minute pause, then one thing", to: "/tabs", icon: "tabs", blob: "bg-plum-soft" },
  wind: { key: "wind", title: "Help me wind down", desc: "Quiet, no scores", to: "/wind-down", icon: "wind", blob: "bg-plum-soft" },
  colour: { key: "colour", title: "Calm colouring", desc: "Colour slowly, nothing to finish", icon: "colour", blob: "bg-gold-soft" },
  wyr: { key: "wyr", title: "Would you rather", desc: "Quick, silly choices", icon: "wyr", blob: "bg-rose-soft" },
  win: { key: "win", title: "Give me a little win", desc: "A short, untimed puzzle", to: "/little-win", icon: "win", blob: "bg-sage-soft" },
  laugh: { key: "laugh", title: "I need a laugh", desc: "An everyday scene to sort out", to: "/laugh", icon: "laugh", blob: "bg-gold-soft" },
  reflect: { key: "reflect", title: "Reflect privately", desc: "A few gentle prompts, just for you", icon: "reflect", blob: "bg-rose-soft" },
  talk: { key: "talk", title: "Talk about it", desc: "Words for tricky conversations", icon: "talk", blob: "bg-plum-soft" },
  kindly: { key: "kindly", title: "Be kind to your body", desc: "Comfort and confidence ideas", icon: "kindly", blob: "bg-sage-soft" },
  partner: { key: "partner", title: "For your partner", desc: "Something to share with them", icon: "partner", blob: "bg-gold-soft" },
  ilearn: { key: "ilearn", title: "Intimacy library", desc: "Clinically reviewed reading", icon: "ilearn", blob: "bg-plum-soft" },
  pals: { key: "pals", title: "My PeriPals", desc: "Check in with your people", icon: "pals", blob: "bg-rose-soft" },
  invite: { key: "invite", title: "Invite a PeriPal", desc: "Bring a friend along", icon: "invite", blob: "bg-sage-soft" },
  mood: { key: "mood", title: "Mood Mapper", desc: "Two taps to log how you feel", to: "/mood", icon: "mood", blob: "bg-rose-soft" },
  meds: { key: "meds", title: "Medicine Cabinet", desc: "Your reminders, your way", to: "/medicines", icon: "medicines", blob: "bg-plum-soft" },
  cycle: { key: "cycle", title: "Cycle Tracker", desc: "Periods, spotting and symptoms", to: "/cycle", icon: "cycle", blob: "bg-rose-soft" },
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
  { key: "calm", name: "Calming moments", blurb: "Settle your body. Quiet your mind.", icon: "calm", blob: "bg-plum-soft", activities: ["tabs", "wind", "colour"] },
  { key: "play", name: "Playful challenges", blurb: "Small wins and a good laugh.", icon: "play", blob: "bg-sage-soft", activities: ["wyr", "colour", "win", "laugh"] },
  {
    key: "love", name: "Intimacy & relationships", blurb: "Private, practical and kind.", icon: "love", blob: "bg-rose-soft",
    activities: ["reflect", "talk", "kindly", "partner", "ilearn"],
    lockLine: "Private by default. Never shared with PeriPals, and you can hide this section behind Face ID.",
  },
  { key: "pals", name: "PeriPals", blurb: "Support that goes both ways.", icon: "pals", blob: "bg-gold-soft", activities: ["pals", "invite"], palsStrip: true },
  { key: "track", name: "Track & support", blurb: "Record, remind, reflect.", icon: "track", blob: "bg-sage-soft", activities: ["mood", "meds", "cycle", "learn"] },
];
