/** Where every Lumenera tool lives: which spaces show it, and what the top bar says on its page. */
import { ACTIVITIES, type Activity } from "@/content/sections";
import type { HubId } from "./content";

/** Extra tiles that aren't in the original activity list. */
const EXTRA: Record<string, Activity> = {
  library: { key: "library", title: "Lume Library", desc: "Articles, videos, audio and quizzes", to: "/library", icon: "library", blob: "bg-plum-soft" },
  medsadd: { key: "medsadd", title: "Add a medicine", desc: "Find it, then set your schedule", to: "/medicines?add=1", icon: "medicines", blob: "bg-plum-soft" },
  garden: { key: "garden", title: "Your garden", desc: "Petals, flowers and badges for showing up", to: "/garden", icon: "garden", blob: "bg-sage-soft" },
};
export const TOOL: Record<string, Activity> = { ...ACTIVITIES, ...EXTRA };

/** Tools shown in each space, most useful first. A tool can live in more than one space. */
export const HUB_TOOLS: Record<HubId, string[]> = {
  periods: ["cycle", "mood", "meds"],
  contra: ["reflect", "talk", "kindly", "partner", "ilearn"],
  fertility: ["cycle", "mood", "pals"],
  baby: ["pelvic", "mood", "wind", "pals"],
  meno: ["quest", "vit", "voice", "tabs", "library", "cycle", "meds", "move", "food"],
  mind: ["mood", "tabs", "wind", "notes", "colour", "wyr", "win", "laugh", "pals", "invite"],
  body: ["move", "pelvic", "food", "bodylearn"],
  meds: ["meds"],
};
export const toolsFor = (hub: HubId) => HUB_TOOLS[hub].map((k) => TOOL[k]).filter((t): t is Activity => !!t?.to);

/** Top bar for tool pages: a quiet title, and where Back goes when there is no history. */
type Meta = { title: string; hub: HubId | null };
const META: [RegExp, Meta][] = [
  [/^\/mood/, { title: "Mood Mapper", hub: "mind" }],
  [/^\/tabs/, { title: "37 tabs", hub: "mind" }],
  [/^\/wind-down/, { title: "Relax and Restore", hub: "mind" }],
  [/^\/notes/, { title: "Little notes", hub: "mind" }],
  [/^\/colour/, { title: "Colour me calm", hub: "mind" }],
  [/^\/would-you-rather/, { title: "Would you rather?", hub: "mind" }],
  [/^\/little-win/, { title: "A little win", hub: "mind" }],
  [/^\/laugh/, { title: "I need a laugh", hub: "mind" }],
  [/^\/pals?(\/|$)/, { title: "Lume Lounge", hub: "mind" }],
  [/^\/side-quest/, { title: "What was I doing?", hub: "meno" }],
  [/^\/remember/, { title: "Help me remember", hub: "meno" }],
  [/^\/tell-enera/, { title: "Tell Enera", hub: "meno" }],
  [/^\/(learn|read|library)/, { title: "Lume Library", hub: null }],
  [/^\/guide/, { title: "Guide", hub: null }],
  [/^\/tools/, { title: "Quick tools", hub: null }],
  [/^\/profile/, { title: "Profile and account", hub: null }],
  [/^\/(move|pelvic|food|body)/, { title: "Resilient body", hub: "body" }],
  [/^\/medicines/, { title: "Medicine cabinet", hub: "meds" }],
  [/^\/cycle/, { title: "Cycle Tracker", hub: "periods" }],
  [/^\/intimacy/, { title: "Relationships", hub: "contra" }],
  [/^\/enera/, { title: "Enera", hub: null }],
  [/^\/garden/, { title: "Your garden", hub: null }],
  [/^\/settings/, { title: "Settings", hub: null }],
  [/^\/privacy/, { title: "Privacy", hub: null }],
  [/^\/panel/, { title: "Clinical panel", hub: null }],
];
export function metaFor(path: string): Meta {
  return META.find(([re]) => re.test(path))?.[1] ?? { title: "Lumenera", hub: null };
}

/** Everyday tool groups: the home slider, the Quick tools page and the menu all use these. */
export type CategoryId = "recent" | "fav" | "practical" | "meds" | "body" | "mind" | "fun" | "lounge" | "library";
export type Category = { id: CategoryId; name: string; blurb: string; tools: string[]; art: { hub?: HubId; icon?: string } };
export const CATEGORIES: Category[] = [
  { id: "recent", name: "Recently used", blurb: "Pick up where you left off.", tools: [], art: { icon: "recent" } },
  { id: "fav", name: "Favourites", blurb: "Tap the heart on any tool and it lives here.", tools: [], art: { icon: "heart" } },
  { id: "practical", name: "Practical help", blurb: "For busy days and foggy moments.", tools: ["quest", "vit", "voice", "tabs", "cycle", "mood"], art: { icon: "tabs" } },
  { id: "meds", name: "Medicine cabinet", blurb: "Your medicines, on your schedule.", tools: ["meds", "medsadd"], art: { hub: "meds" } },
  { id: "body", name: "My body", blurb: "Move, strengthen and nourish.", tools: ["move", "pelvic", "food", "bodylearn", "cycle"], art: { hub: "body" } },
  { id: "mind", name: "Mood and mind", blurb: "Check in, settle and rest.", tools: ["mood", "wind", "notes", "tabs", "reflect"], art: { hub: "mind" } },
  { id: "fun", name: "Fun therapy", blurb: "Small wins and a good laugh.", tools: ["colour", "wyr", "win", "laugh", "garden"], art: { icon: "colour" } },
  { id: "lounge", name: "Lume Lounge", blurb: "The people in your corner.", tools: ["pals", "invite"], art: { icon: "pals" } },
  { id: "library", name: "Lume Library", blurb: "Read, watch and listen.", tools: ["library", "ilearn", "bodylearn"], art: { icon: "library" } },
];

/** Tools you've opened lately, newest first, kept on this device. */
const RECENT_KEY = "lum:recent";
export function readRecent(): string[] {
  try { const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as unknown; return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []; } catch { return []; }
}
export function noteVisit(path: string) {
  const key = Object.values(TOOL).find((t) => t.to && !t.to.includes("?") && (path === t.to || path.startsWith(`${t.to}/`)))?.key;
  if (!key) return;
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([key, ...readRecent().filter((k) => k !== key)].slice(0, 8))); } catch { /* private window */ }
}
