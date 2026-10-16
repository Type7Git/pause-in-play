import { Apple, BookHeart, BookOpen, CircleDot, Flower2, Footprints, Lightbulb, Brush, HeartHandshake, MessageCircleHeart, MessageSquareHeart, NotebookPen, Scale, Sparkle, UserPlus, Users } from "lucide-react";
import { ChoiceGlyph, SproutMic, type ChoiceIcon } from "@/components/mm/icons";
import { TrackingGlyph } from "@/components/mm/TrackingShared";

const CHOICE = new Set(["quest", "tabs", "win", "wind", "laugh", "vit"]);
const TRACK = new Set(["mood", "medicines", "cycle", "learn"]);
const LUCIDE = { colour: Brush, wyr: Scale, reflect: NotebookPen, talk: MessageCircleHeart, kindly: Sparkle, partner: HeartHandshake, ilearn: BookHeart, pals: Users, invite: UserPlus, move: Footprints, pelvic: CircleDot, food: Apple, bodylearn: Lightbulb, notes: MessageSquareHeart, garden: Flower2, library: BookOpen } as const;

/** The little picture for each tool, shared by every tile that links to it. */
export function ActivityIcon({ icon, className = "size-7" }: { icon: string; className?: string }) {
  if (CHOICE.has(icon)) return <ChoiceGlyph name={icon as ChoiceIcon} />;
  if (TRACK.has(icon)) return <TrackingGlyph name={icon as "mood"} />;
  if (icon === "voice") return <SproutMic className={`${className} text-sage`} />;
  const I = LUCIDE[icon as keyof typeof LUCIDE] ?? Sparkle;
  return <I className={`${className} text-plum`} aria-hidden="true" />;
}
