/**
 * Everything Enera knows about Lumenera itself: every space, tool, check, life-stage timeline and built-in read,
 * plus a one-line map of the whole app so she can always point somewhere useful. Pure and browser-safe (tested).
 */
import { guideEntries } from "@/lumenera/guide";
import { CHECK_INFO, HUBS, HUB_IDS, LIBRARY, LIFE_STAGE_CHECKS, type CheckId } from "@/lumenera/content";
import { HUB_TOOLS, TOOL } from "@/lumenera/tools";

/** A piece of app knowledge Enera can answer from. `to` is where its "Open" button goes. */
export type Chunk = { id: string; title: string; text: string; to: string; label: string; keywords: string; reviewed: boolean };

let cache: Chunk[] | null = null;
export function appKnowledge(): Chunk[] {
  if (cache) return cache;
  const out: Chunk[] = [];
  for (const g of guideEntries()) out.push({ id: g.id, title: g.title, text: g.body, to: g.to, label: g.title, keywords: `${g.group} ${g.keywords}`, reviewed: false });
  for (const id of HUB_IDS) {
    const h = HUBS[id];
    const tools = (HUB_TOOLS[id] ?? []).map((k) => TOOL[k]?.title).filter(Boolean).join(", ");
    out.push({
      id: `space-${id}`, title: `${h.name}: tools and when to see someone`, to: h.to ?? `/space/${id}`, label: h.name, reviewed: false,
      text: `${h.blurb} Tools here: ${tools}. When to see someone: ${h.seeSomeone.join("; ")}.`,
      keywords: `${h.short} ${h.name} space`,
    });
  }
  for (const [id, c] of Object.entries(CHECK_INFO) as [CheckId, (typeof CHECK_INFO)[CheckId]][]) {
    out.push({
      id: `check-${id}`, title: c.name, to: `/check/${id}`, label: c.name, reviewed: false,
      text: `${c.what} How often: ${c.how} Why it matters: ${c.why} Where to go: ${c.where.join("; ")}.${c.national ? ` (${c.national})` : ""}`,
      keywords: `check screening test ${c.name} ${id}`,
    });
  }
  out.push({
    id: "life-stages", title: "Health checks through each life stage", to: "/check/life", label: "Checks by life stage", reviewed: false,
    text: LIFE_STAGE_CHECKS.map((s) => `${s.when}: ${s.items.join("; ")}`).join(". "),
    keywords: "checks screening age life stage when should i timeline birthday 40 45 50 65 75 what checks",
  });
  for (const i of LIBRARY) {
    out.push({ id: `item-${i.id}`, title: i.title, text: `${i.summary} ${i.body.join(" ")}`, to: `/item/${i.id}`, label: i.title, keywords: `${i.space} ${i.format}`, reviewed: false });
  }
  cache = out;
  return out;
}

/** One short line per space and tool, so Enera can suggest where to go even when nothing matches. */
export function appMap(): string {
  const spaces = HUB_IDS.map((id) => `space-${id}: ${HUBS[id].name}`).join("; ");
  const tools = guideEntries().filter((g) => g.id.startsWith("tool-") || ["home", "tools", "profile", "settings", "panel", "enera"].includes(g.id)).map((g) => `${g.id}: ${g.title}`).join("; ");
  return `Spaces: ${spaces}.\nTools and pages: ${tools}.\nChecks: ${Object.entries(CHECK_INFO).map(([id, c]) => `check-${id}: ${c.name}`).join("; ")}; life-stages: Checks by life stage.`;
}
export const linkFor = (id: string) => appKnowledge().find((c) => c.id === id);

const STOP = new Set("i im i'm me my a an the is am are was were to of and or in on at it its for do does did why what how can could would should you your so with that this be been being keep about tell more just really very get got have has had feel feeling want need know like help please there they them their when where which who will any some much many lot lots also not dont don't".split(" "));
/** Lower-case words that matter, roughly stemmed ("periods" → "period", "sleeping" → "sleep"). */
export function terms(text: string): string[] {
  const words = (text.toLowerCase().replace(/[’‘]/g, "'").match(/[a-z0-9']+/g) ?? []).filter((w) => w.length > 2 && !STOP.has(w));
  return [...new Set(words.map(stem))];
}
function stem(w: string) {
  if (w.length > 5 && w.endsWith("ies")) return `${w.slice(0, -3)}y`;
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

/** Best-matching chunks for a question, title hits weighted highest. */
export function searchKnowledge<T extends { title: string; text: string; keywords: string }>(chunks: T[], query: string, limit = 6): T[] {
  const q = terms(query);
  if (!q.length) return [];
  const scored = chunks.map((c) => {
    const title = terms(c.title), keys = terms(c.keywords), body = terms(c.text);
    const hit = (list: string[], w: string) => list.some((x) => x === w || (w.length > 4 && (x.startsWith(w) || w.startsWith(x))));
    const score = q.reduce((s, w) => s + (hit(title, w) ? 3 : 0) + (hit(keys, w) ? 2 : 0) + (hit(body, w) ? 1 : 0), 0);
    return { c, score };
  });
  return scored.filter((s) => s.score >= 2).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.c);
}
