import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { WhyThisHelps } from "@/components/mm/Panel";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/colour")({
  head: () => ({
    meta: [
      { title: "Colour me calm · Pause in Play" },
      { name: "description", content: "Colour in. No going over the lines. A slow, untimed colouring game." },
      { property: "og:title", content: "Colour me calm · Pause in Play" },
      { property: "og:description", content: "Colour in. No going over the lines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Colour,
});

type Scene = { id: string; key: string; name: string; svg: string; layer_order: { name: string; svg_id: string }[] };

export const PALETTE: [string, string][] = [
  ["#F28B82", "Coral"], ["#D9577F", "Raspberry"], ["#F2A7C8", "Pink"], ["#C7B3E6", "Lavender"], ["#8E6BBF", "Purple"], ["#7FC28E", "Green"], ["#3E8E64", "Deep green"], ["#C9E7A7", "Lime"],
  ["#9ED8E8", "Sky blue"], ["#5AA9D6", "Blue"], ["#2F5E9E", "Navy"], ["#FDE58A", "Lemon"], ["#FBBC7A", "Apricot"], ["#E08A3C", "Orange"], ["#C99A6B", "Sand"], ["#8A5A3C", "Brown"],
  ["#F5D3BC", "Skin tone 1"], ["#E7B99A", "Skin tone 2"], ["#C68E6A", "Skin tone 3"], ["#8D5B3E", "Skin tone 4"], ["#5C3A28", "Skin tone 5"], ["#CFCBD6", "Silver"], ["#6B5B73", "Charcoal"], ["#FFFFFF", "White"],
];
const BRUSHES: [string, number][] = [["Fine", 6], ["Medium", 14], ["Big", 28]];
const S = 2; // backing scale: 600×600 for a 300×300 viewBox
const N = 300 * S;
const INK = "#2E2438";

function layerPaths(svg: string, ids: string[]) {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  return ids.map((id) => {
    const d = doc.getElementById(id)?.getAttribute("d") ?? "";
    return { whole: new Path2D(d), subs: d.split(/(?=M)/).map((s) => s.trim()).filter(Boolean).map((s) => new Path2D(s)) };
  });
}
const mk = () => { const c = document.createElement("canvas"); c.width = c.height = N; const x = c.getContext("2d")!; x.scale(S, S); return c; };

function outline(p: { whole: Path2D; subs: Path2D[] }, width: number, colour: string) {
  const c = mk(), x = c.getContext("2d")!;
  x.lineWidth = width; x.strokeStyle = colour; x.lineJoin = "round"; x.stroke(p.whole);
  x.globalCompositeOperation = "destination-out";
  p.subs.forEach((s) => x.fill(s));
  return c;
}

function Colour() {
  const { earn, user } = useRewards();
  const { data: scenes = [] } = useQuery({
    queryKey: ["colouring-scenes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("colouring_scenes").select("id, key, name, svg, layer_order").eq("published", true).order("sort");
      if (error) throw error;
      return data as unknown as Scene[];
    },
  });
  const [sceneIdx, setSceneIdx] = useState(0);
  const scene = scenes[sceneIdx];
  const [layer, setLayer] = useState(0);
  const [colour, setColour] = useState(PALETTE[0]![0]);
  const [brush, setBrush] = useState(14);
  const [swatches, setSwatches] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const view = useRef<HTMLCanvasElement>(null);
  const colourCanvases = useRef<HTMLCanvasElement[]>([]);
  const outlines = useRef<HTMLCanvasElement[]>([]);
  const paths = useRef<ReturnType<typeof layerPaths>>([]);
  const glow = useRef<HTMLCanvasElement | null>(null);
  const glowTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const history = useRef<{ layer: number; img: ImageData }[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);

  const compose = useCallback(() => {
    const v = view.current; if (!v) return;
    const x = v.getContext("2d")!;
    x.globalCompositeOperation = "source-over";
    x.fillStyle = "#FFFFFF"; x.fillRect(0, 0, N, N);
    colourCanvases.current.forEach((c, i) => { x.drawImage(c, 0, 0); x.drawImage(outlines.current[i]!, 0, 0); });
    if (glow.current) x.drawImage(glow.current, 0, 0);
  }, []);

  const reset = useCallback(() => {
    if (!scene) return;
    paths.current = layerPaths(scene.svg, scene.layer_order.map((l) => l.svg_id));
    colourCanvases.current = paths.current.map((p) => { const c = mk(), x = c.getContext("2d")!; x.fillStyle = "#FFFFFF"; p.subs.forEach((s) => x.fill(s)); return c; });
    outlines.current = paths.current.map((p) => outline(p, 3.6, INK));
    history.current = []; setSwatches({}); setLayer(0); setMsg("");
    compose();
  }, [scene, compose]);
  useEffect(reset, [reset]);

  const pickLayer = (i: number) => {
    setLayer(i);
    const p = paths.current[i]; if (!p) return;
    glow.current = outline(p, 9, "#E9B949");
    compose();
    clearTimeout(glowTimer.current);
    glowTimer.current = setTimeout(() => { glow.current = null; compose(); }, 1300);
  };

  const snapshot = () => {
    const c = colourCanvases.current[layer]; if (!c) return;
    history.current.push({ layer, img: c.getContext("2d")!.getImageData(0, 0, N, N) });
    if (history.current.length > 15) history.current.shift();
  };
  const layerCtx = () => {
    const x = colourCanvases.current[layer]!.getContext("2d")!;
    x.globalCompositeOperation = "source-atop";
    return x;
  };
  const mark = () => setSwatches((s) => ({ ...s, [layer]: colour }));

  const pt = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 300, y: ((e.clientY - r.top) / r.height) * 300 };
  };
  const stroke = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const x = layerCtx();
    x.strokeStyle = colour; x.lineWidth = brush; x.lineCap = "round"; x.lineJoin = "round";
    x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
    compose();
  };
  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!colourCanvases.current[layer]) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    snapshot(); mark();
    const p = pt(e); last.current = p; stroke(p, p);
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!last.current) return;
    const p = pt(e); stroke(last.current, p); last.current = p;
  };
  const up = () => { last.current = null; };

  const fill = () => {
    if (!colourCanvases.current[layer]) return;
    snapshot(); mark();
    const x = layerCtx(); x.fillStyle = colour; x.fillRect(0, 0, 300, 300); compose();
  };
  const undo = () => {
    const h = history.current.pop(); if (!h) return;
    colourCanvases.current[h.layer]!.getContext("2d")!.putImageData(h.img, 0, 0); compose();
  };

  const finish = async () => {
    if (!scene || !view.current) return;
    setSaving(true);
    const layerColours = Object.fromEntries(Object.entries(swatches).map(([i, c]) => [scene.layer_order[Number(i)]?.name ?? i, c]));
    try {
      if (user) {
        const blob = await new Promise<Blob | null>((r) => view.current!.toBlob(r, "image/png"));
        const path = `${user.id}/${scene.key}.png`;
        if (blob) await supabase.storage.from("gallery").upload(path, blob, { upsert: true, contentType: "image/png" });
        await supabase.from("colouring_saves").upsert({ user_id: user.id, scene_id: scene.id, layer_colours: layerColours, image_url: path, updated_at: new Date().toISOString() });
        setMsg("Saved to your gallery.");
      } else {
        try { localStorage.setItem(`midlife-mind:colour-${scene.key}`, JSON.stringify(layerColours)); } catch {}
        setMsg("Lovely. Sign in to keep your pictures in a gallery.");
      }
      earn(4, "Colour me calm", "Calm colourist");
    } catch {
      setMsg("That didn't save this time. Your picture is still here.");
    }
    setSaving(false);
  };

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Colour me calm" title="No rush. No going over the lines." sub="Colour in. No going over the lines." />
      <WhyThisHelps>Colouring inside a shape asks for just enough attention to quiet a busy mind, without asking anything else of you. Slow, repetitive movement can help your body settle. There is no wrong way to do it, and nobody is marking it.</WhyThisHelps>

      <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1" role="radiogroup" aria-label="Choose a picture">
        {scenes.map((s, i) => (
          <button key={s.id} type="button" role="radio" aria-checked={i === sceneIdx} aria-label={s.name} onClick={() => setSceneIdx(i)}
            className={`press size-[76px] shrink-0 overflow-hidden rounded-2xl border-2 bg-[#FFFFFF] p-1.5 ${i === sceneIdx ? "border-plum" : "border-line"}`}>
            <span className="block size-full [&_path]:fill-none [&_path]:stroke-[#2E2438] [&_path]:[stroke-width:5] [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: s.svg }} />
          </button>
        ))}
      </div>

      {scene ? (
        <Card>
          <h2 className="font-display text-lg">{scene.name}</h2>
          <canvas
            ref={view} width={N} height={N}
            aria-label={`Colouring canvas: ${scene.name}. Painting on ${scene.layer_order[layer]?.name}.`}
            role="img"
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            className="aspect-square w-full touch-none rounded-2xl border border-line bg-[#FFFFFF]"
          />
          <div>
            <p className="mb-2 text-[13px] font-bold text-muted-foreground">1. Choose a part</p>
            <div className="flex flex-wrap gap-2">
              {scene.layer_order.map((l, i) => (
                <Chip key={l.svg_id} pressed={i === layer} onClick={() => pickLayer(i)} className="inline-flex items-center gap-2">
                  <i aria-hidden="true" className="block size-3.5 rounded-full border border-line" style={{ background: swatches[i] ?? "#FFFFFF" }} />{l.name}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold text-muted-foreground">2. Choose a colour</p>
            <div className="grid grid-cols-8 gap-1.5">
              {PALETTE.map(([hex, name]) => (
                <button key={hex} type="button" aria-label={name} aria-pressed={colour === hex} onClick={() => setColour(hex)}
                  className={`press aspect-square min-h-8 rounded-full border-2 ${colour === hex ? "border-plum ring-2 ring-plum/30" : "border-line"}`} style={{ background: hex }} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Brush size">
            {BRUSHES.map(([n, w]) => <Chip key={n} pressed={brush === w} onClick={() => setBrush(w)}>{n}</Chip>)}
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill variant="ghost" size="sm" onClick={fill}>Fill this part</Pill>
            <Pill variant="ghost" size="sm" onClick={undo}>Undo</Pill>
            <Pill variant="ghost" size="sm" onClick={reset}>Start again</Pill>
          </div>
          <Pill onClick={finish} disabled={saving}>{saving ? "Saving…" : "I'm finished"}</Pill>
          {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
        </Card>
      ) : (
        <Muted>Getting the pictures ready…</Muted>
      )}
    </>
  );
}
