/** Placeholder line art (300×300) used until the illustrator's SVGs arrive. Layers are back to front.
 * Every subpath starts with an absolute "M" so it can be filled on its own. */
const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
const petals = (cx: number, cy: number, n: number, d: number, r: number) =>
  Array.from({ length: n }, (_, i) => circle(Math.round(cx + d * Math.cos((i * 2 * Math.PI) / n)), Math.round(cy + d * Math.sin((i * 2 * Math.PI) / n)), r)).join(" ");

export type SceneLayer = { name: string; d: string };
export type SeedScene = { key: string; name: string; layers: SceneLayer[] };

export const SEED_SCENES: SeedScene[] = [
  { key: "flower", name: "Flower in a pot", layers: [
    { name: "Stem", d: "M146 120 L154 120 L154 196 L146 196 Z" },
    { name: "Leaves", d: "M150 170 C120 145 96 152 88 170 C112 182 134 180 150 170 Z M150 160 C180 135 204 142 212 160 C188 172 166 170 150 160 Z" },
    { name: "Petals", d: petals(150, 95, 6, 34, 24) },
    { name: "Centre", d: circle(150, 95, 18) },
    { name: "Pot", d: "M96 192 L204 192 L188 272 L112 272 Z" },
  ] },
  { key: "teacup", name: "Cup of tea", layers: [
    { name: "Saucer", d: "M50 236 C70 262 230 262 250 236 C230 222 70 222 50 236 Z" },
    { name: "Handle", d: circle(214, 175, 28) },
    { name: "Cup", d: "M70 130 L230 130 C228 200 200 238 150 238 C100 238 72 200 70 130 Z" },
    { name: "Tea", d: "M76 130 C76 116 224 116 224 130 C224 144 76 144 76 130 Z" },
    { name: "Steam", d: "M124 100 C110 80 140 66 126 40 L134 40 C148 66 118 80 132 100 Z M168 100 C154 80 184 66 170 40 L178 40 C192 66 162 80 176 100 Z" },
  ] },
  { key: "cottage", name: "Little cottage", layers: [
    { name: "Hill", d: "M0 250 C80 214 220 214 300 250 L300 300 L0 300 Z" },
    { name: "Walls", d: "M80 150 L220 150 L220 250 L80 250 Z" },
    { name: "Roof", d: "M66 152 L150 82 L234 152 Z" },
    { name: "Door", d: "M134 196 C134 178 166 178 166 196 L166 250 L134 250 Z" },
    { name: "Windows", d: "M96 170 L124 170 L124 198 L96 198 Z M176 170 L204 170 L204 198 L176 198 Z" },
    { name: "Sun", d: circle(250, 54, 26) },
  ] },
  { key: "fish", name: "Happy fish", layers: [
    { name: "Bubbles", d: `${circle(250, 70, 12)} ${circle(270, 40, 8)} ${circle(236, 30, 6)}` },
    { name: "Tail", d: "M80 150 L30 104 L42 150 L30 196 Z" },
    { name: "Body", d: "M70 150 C110 80 210 80 240 150 C210 220 110 220 70 150 Z" },
    { name: "Fin", d: "M140 112 C150 84 186 84 196 106 Z M140 188 C150 214 180 214 190 194 Z" },
    { name: "Eye", d: circle(200, 138, 11) },
    { name: "Seaweed", d: "M40 300 C30 270 60 250 46 220 L56 220 C70 250 40 270 52 300 Z M256 300 C246 266 276 246 262 212 L272 212 C286 246 256 266 268 300 Z" },
  ] },
  { key: "night", name: "Quiet night", layers: [
    { name: "Sky", d: "M10 10 L290 10 L290 220 L10 220 Z" },
    { name: "Moon", d: "M190 50 C140 56 130 130 186 150 C150 160 108 126 116 86 C122 54 160 40 190 50 Z" },
    { name: "Stars", d: "M60 50 L66 64 L80 66 L68 74 L72 88 L60 80 L48 88 L52 74 L40 66 L54 64 Z M240 110 L245 121 L256 122 L247 129 L250 140 L240 134 L230 140 L233 129 L224 122 L235 121 Z M90 140 L94 149 L103 150 L96 156 L98 165 L90 160 L82 165 L84 156 L77 150 L86 149 Z" },
    { name: "Hills", d: "M0 220 C70 170 140 200 170 220 C210 180 260 190 300 220 L300 290 L0 290 Z" },
  ] },
];

export function sceneSvg(s: SeedScene) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">${s.layers.map((l, i) => `<path id="${s.key}-${i}" d="${l.d}"/>`).join("")}</svg>`;
}
