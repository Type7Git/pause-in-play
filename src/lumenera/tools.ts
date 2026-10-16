/** Where every Lumenera tool lives: which spaces show it, and what the top bar says on its page. */
import { ACTIVITIES, type Activity } from "@/content/sections";
import type { HubId } from "./content";

/** Extra tiles that aren't in the original activity list. */
const EXTRA: Record<string, Activity> = {
  library: { key: "library", title: "Library", desc: "Videos, articles and quizzes, clinically reviewed", to: "/learn", icon: "library", blob: "bg-plum-soft" },
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
  [/^\/pals?(\/|$)/, { title: "My people", hub: "mind" }],
  [/^\/side-quest/, { title: "What was I doing?", hub: "meno" }],
  [/^\/remember/, { title: "Help me remember", hub: "meno" }],
  [/^\/tell-enera/, { title: "Tell Enera", hub: "meno" }],
  [/^\/(learn|read)/, { title: "Library", hub: "meno" }],
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
