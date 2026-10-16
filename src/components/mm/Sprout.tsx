/** Enera (formerly Sprout): Lumenera's guide, drawn as the Lumenera flower. Never a person, never anyone's image. */
import { Flower } from "@/lumenera/art";

export type SproutMood = "happy" | "thinking" | "caring" | "wave";

export function Sprout({ size = 64, mood = "happy", animate = true, className = "" }: { size?: number; mood?: SproutMood; animate?: boolean; className?: string }) {
  // Thinking: the petals turn while she looks something up. Otherwise she sits still and calm.
  return (
    <span role="img" aria-label="Enera, the Lumenera guide" className={`inline-grid shrink-0 place-items-center ${mood === "thinking" && animate ? "enera-think" : ""} ${className}`} style={{ width: size, height: size }}>
      <Flower size={size} still={!animate || mood !== "wave"} />
    </span>
  );
}
