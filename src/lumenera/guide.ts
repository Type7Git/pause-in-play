/** The Lumenera Guide: every space and tool, explained simply, with a link straight there. */
import { HUBS, HUB_IDS } from "./content";
import { TOOL } from "./tools";

export type GuideEntry = { id: string; group: string; title: string; body: string; to: string; keywords: string };

const TOOL_GUIDE: Record<string, { body: string; keywords: string }> = {
  quest: { body: "Halfway through something and pulled away? Save what you were doing and the very next step, with an optional nudge. When you come back, it's waiting for you.", keywords: "side quest saver distracted forgot interrupted what was i doing" },
  vit: { body: "The Very Important Thing Department. Note where you put things like passports, spare keys or the car park level, then search for them when you need them.", keywords: "remember lost keys where did i put vit department" },
  voice: { body: "Just say it out loud. Enera turns your words into text and files them in What was I doing? or Help me remember, and you check it before anything is saved. Your voice isn't stored.", keywords: "voice dictate speak tell enera microphone" },
  tabs: { body: "When your brain has too many tabs open, get them all out of your head, then close them one at a time. Starts with a one-minute breathing pause.", keywords: "37 tabs overwhelm to-do list brain dump busy head" },
  wind: { body: "Guided relaxations and gentle rest poses for 3am wake-ups, night sweats or a busy mind. The screen goes quiet and dark while you use it.", keywords: "relax restore sleep rest body scan wind down night" },
  notes: { body: "Kind words of encouragement, understanding and support. Read one now, or choose to receive them now and then, inside hours you pick.", keywords: "little notes encouragement quotes kind words reminders" },
  colour: { body: "Colour in a calming picture. Paint never goes over the lines, so there's nothing to get wrong. Save or share what you make.", keywords: "colour colouring art calm mindful" },
  wyr: { body: "Ten quick 'would you rather' choices that reveal which character you'd rather be today. No wrong answers, only better stories.", keywords: "would you rather game fun quiz character" },
  win: { body: "A short, untimed puzzle for a small sense of achievement. No timer, no rush.", keywords: "little win puzzle game sort match" },
  laugh: { body: "Everyday scenes to sort out, like finding her glasses or a handbag audit. Light relief for heavy days.", keywords: "laugh funny game find glasses handbag" },
  reflect: { body: "A private check-in on desire and intimacy. Tap what sounds like you to understand what's changed. Nothing is saved.", keywords: "intimacy desire libido sex check-in changed" },
  talk: { body: "Gentle questions for couples to ask each other, one card at a time, from connection to the practical.", keywords: "conversation cards couples partner questions" },
  kindly: { body: "Build gentle words for a tricky conversation by picking a phrase from each row. You can change any of the words after.", keywords: "say it kindly difficult conversation words partner" },
  partner: { body: "A short guide you can share with a partner about what's going on and how they can help. It contains none of your information.", keywords: "partner guide husband wife explain share" },
  ilearn: { body: "Short, honest, clinically reviewed reads on intimacy and relationships. Open any that interest you.", keywords: "intimacy library sex relationships articles" },
  pals: { body: "Invite trusted people into your Lume Lounge to check in with each other. You choose exactly what each person sees, and you can pause or remove anyone at any time.", keywords: "lume lounge friends support peripals people share" },
  invite: { body: "Send a private invite to someone you trust. They join your Lume Lounge once they accept.", keywords: "invite friend lume lounge support" },
  mood: { body: "Two taps to log how you feel, with optional words and tags. Over time you'll see patterns that can help you and your GP. Kept on this device.", keywords: "mood mapper feelings emotions track log" },
  meds: { body: "Add your medicines and supplements, set your schedule and tick off doses. Find your medicine in our list or add your own. Kept on this device, with discreet reminders.", keywords: "medicine cabinet pills tablets hrt reminders supplements doses schedule" },
  medsadd: { body: "Search our list of medicines and supplements, or add your own, then set when you take it.", keywords: "add medicine new pill" },
  cycle: { body: "Log periods, spotting and symptoms on a calendar. See your cycle lengths over time and take a summary to your GP. Kept on this device.", keywords: "cycle tracker period bleeding spotting calendar symptoms" },
  move: { body: "Short stretch, yoga, Pilates and strength sessions, with easier versions for every move. Go when you feel you can.", keywords: "move exercise yoga pilates strength sessions" },
  pelvic: { body: "A paced pelvic floor trainer with holds and rests you can adjust. A few minutes, a few times a day.", keywords: "pelvic floor kegels bladder leaks trainer" },
  food: { body: "Food ideas that add in, never cut out, for bones, muscle and sleep. Tap what you've had today. No scores.", keywords: "food nutrition diet calcium protein eat" },
  bodylearn: { body: "Clinically reviewed reading on why moving and eating well helps your body through each stage.", keywords: "why it helps bones exercise reading" },
  library: { body: "All our articles, videos, audio and quizzes in one place, with search and filters by type and area of life.", keywords: "lume library articles videos audio learn read watch listen" },
  garden: { body: "Every time you use a tool, petals grow your garden. Earn badges, tend your flowers and watch it change with the weather. No streaks, no penalties.", keywords: "garden petals badges rewards flowers" },
};

const HUB_GUIDE: Record<string, string> = {
  periods: "Understand your cycle, get help when periods get in the way, and log yours in the Cycle Tracker.",
  contra: "Contraception, sexual health and intimacy, all private by default. Includes conversation cards, Say it kindly and a guide for your partner.",
  fertility: "From thinking about it, to trying, to pregnancy week by week, with when to check in with your GP.",
  baby: "Your recovery after birth, your pelvic floor, sleep and how you're really going.",
  meno: "Brain fog, sleep, mood and body changes, with the Pause in Play tools that started it all.",
  mind: "How you're really going, with Mood Mapper, Relax and Restore, Little notes and the games.",
  body: "Movement sessions, the pelvic floor trainer and food that adds in.",
  meds: "Your medicines and supplements, your schedule, discreet reminders.",
};

export function guideEntries(): GuideEntry[] {
  const out: GuideEntry[] = [
    { id: "home", group: "Getting started", title: "Your home", body: "Your home is built from your welcome answers: your focus areas, your checks, everyday tools and something picked for you today. It changes as your life does.", to: "/home", keywords: "home start focus dashboard" },
    { id: "enera", group: "Getting started", title: "Ask Enera", body: "Enera is your AI guide. Chat about whatever is on your mind, at any stage of life. She shares what our clinically reviewed library says, explains any space or tool, and helps you work out who to talk to. She won't guess, and she can't give personal medical advice.", to: "/enera", keywords: "enera ai chat ask help question sprout" },
    { id: "checks", group: "Getting started", title: "Your checks", body: "Green means up to date, light orange means due soon and soft red means overdue. Tap any check to see what it is, how often, why it matters, and where to go near you.", to: "/home", keywords: "checks screening cervical breast mammogram bones skin due overdue" },
    { id: "profile", group: "Getting started", title: "Your answers and profile", body: "Change your welcome answers any time with Something's changed, or answer the deeper questions for an even more personal space. Your answers stay on this device.", to: "/profile", keywords: "profile survey answers questionnaire update personal account membership" },
    { id: "tools", group: "Getting started", title: "Quick tools", body: "Every everyday tool in one place, grouped into Practical help, Medicine cabinet, My body, Mood and mind, Fun therapy, Lume Lounge and Lume Library.", to: "/tools", keywords: "quick tools all tools list" },
  ];
  for (const id of HUB_IDS) {
    const h = HUBS[id];
    out.push({ id: `hub-${id}`, group: "Spaces", title: h.name, body: HUB_GUIDE[id] ?? h.blurb, to: h.to ?? `/space/${id}`, keywords: `${h.short} space ${h.blurb}` });
  }
  for (const [key, g] of Object.entries(TOOL_GUIDE)) {
    const t = TOOL[key];
    if (!t?.to || key === "medsadd") continue;
    const group = key === "pals" || key === "invite" ? "Lume Lounge" : key === "garden" ? "Your account" : "Tools";
    out.push({ id: `tool-${key}`, group, title: t.title, body: g.body, to: t.to, keywords: `${t.desc} ${g.keywords}` });
  }
  out.push(
    { id: "settings", group: "Your account", title: "Settings and sign in", body: "Sign in to keep your garden on every device, choose notifications, and lock Sexual health and relationships behind Face ID or your fingerprint.", to: "/settings", keywords: "settings account sign in login password lock face id notifications delete" },
    { id: "privacy", group: "Your account", title: "Privacy", body: "What we store, why, and how to download or delete it. Your health answers and logs stay on your device.", to: "/privacy", keywords: "privacy data delete download stored" },
    { id: "panel", group: "Your account", title: "Our clinical advisory panel", body: "Every tool and article is reviewed by registered health professionals. Meet the panel.", to: "/panel", keywords: "clinical panel doctors reviewed experts" },
  );
  return out;
}

export const GUIDE_GROUPS = ["Getting started", "Spaces", "Tools", "Lume Lounge", "Your account"];

/** Every word of the query must appear somewhere in the entry. */
export function searchGuide(entries: GuideEntry[], q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return entries;
  return entries.filter((e) => { const hay = `${e.title} ${e.group} ${e.body} ${e.keywords}`.toLowerCase(); return words.every((w) => hay.includes(w)); });
}
