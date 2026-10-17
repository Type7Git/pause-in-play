/** Turns Enera's raw model output into a safe reply: only real sources, only real links. Pure and browser-safe (tested). */
import { TOOL_ROUTES, TOOLS, isToolKey, type SproutReply } from "./sprout-guard";
import { linkFor, type Chunk } from "./enera-knowledge";

export type LibraryEntry = { id: string; title: string; body: string; linked_tool: string | null; keywords: string[] };
export type Article = { id: string; title: string; summary: string; body: string; section: string };
export type Sources = { library: LibraryEntry[]; articles: Article[]; guide: Chunk[] };

/** The SOURCES block given to the model, with prefixed ids: L (library entry), A (article), G (Lumenera guide). */
export function sourcesBlock(s: Sources): string {
  const parts = [
    ...s.library.map((e) => `[L:${e.id}] LIBRARY (clinically reviewed) · ${e.title}\n${e.body}`),
    ...s.articles.map((a) => `[A:${a.id}] ARTICLE (clinically reviewed) · ${a.title}\n${a.summary}\n${a.body.slice(0, 1500)}`),
    ...s.guide.map((c) => `[G:${c.id}] GUIDE · ${c.title}\n${c.text}`),
  ];
  return parts.length ? parts.join("\n\n") : "(No sources matched this message.)";
}

const strip = (id: string) => id.replace(/^\[|\]$/g, "").trim();
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+\n/g, "\n").trim().slice(0, max) : "");

export type Parsed = { reply: string; gap: boolean; text: string };
/** Validates the model's JSON against the sources it was actually given. Returns null when there's nothing usable. */
export function shapeReply(raw: string, s: Sources): (SproutReply & { gap: boolean }) | null {
  let j: Record<string, unknown>;
  try { j = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)) as Record<string, unknown>; } catch { return null; }
  const text = clean(j["reply"], 1200);
  if (!text || /NO_MATCH/.test(text)) return null;

  const used = (Array.isArray(j["used"]) ? j["used"] : []).filter((x): x is string => typeof x === "string").map(strip);
  const lib = used.map((u) => s.library.find((e) => `L:${e.id}` === u)).find(Boolean);
  const art = used.map((u) => s.articles.find((a) => `A:${a.id}` === u)).find(Boolean);
  const gui = used.map((u) => s.guide.find((c) => `G:${c.id}` === u || c.id === u)).find(Boolean);

  const reply: SproutReply & { gap: boolean } = { kind: "chat", text, gap: j["gap"] === true };
  if (lib) reply.source = { title: lib.title, reviewed: true };
  else if (art) reply.source = { title: art.title, reviewed: true };
  else if (gui) reply.source = { title: gui.title, reviewed: false };
  if (reply.source) reply.kind = "answer";

  // One place to go next: what the model chose, if it's real; otherwise the tool linked to the library entry it used.
  const want = typeof j["link"] === "string" ? strip(j["link"]) : "";
  const a = want.startsWith("A:") ? s.articles.find((x) => `A:${x.id}` === want) : undefined;
  const l = want.startsWith("L:") ? s.library.find((x) => `L:${x.id}` === want) : undefined;
  const g = want ? linkFor(want.replace(/^G:/, "")) : undefined;
  if (g) reply.link = { to: g.to, label: g.label };
  else if (a) reply.link = { to: `/read/${a.id}`, label: a.title };
  else if (l && isToolKey(l.linked_tool)) reply.link = { to: TOOL_ROUTES[l.linked_tool].to, label: TOOLS[l.linked_tool] };
  else if (lib && isToolKey(lib.linked_tool)) reply.link = { to: TOOL_ROUTES[lib.linked_tool].to, label: TOOLS[lib.linked_tool] };

  const next = (Array.isArray(j["next"]) ? j["next"] : []).map((x) => clean(x, 60)).filter((x) => x.length > 1);
  if (next.length) reply.next = [...new Set(next)].slice(0, 3);
  return reply;
}
