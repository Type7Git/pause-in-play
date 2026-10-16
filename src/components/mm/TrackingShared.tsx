import { Link } from "@tanstack/react-router";
import type React from "react";
import { Lock, Grid2X2, Pill as PillIcon, CircleDot, GraduationCap } from "lucide-react";

export const trackingHead = (name: string, description: string) => ({ meta: [{ title: `${name} · Lumenera` }, { name: "description", content: description }, { property: "og:title", content: `${name} · Lumenera` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] });
/** The privacy line on every personal tracker: records stay on this phone. */
export function DeviceNotice({ children }: { children?: React.ReactNode }) { return <p className="flex items-start gap-2 text-sm text-muted-foreground"><Lock className="mt-0.5 size-4 shrink-0 text-plum" aria-hidden="true" /><span>{children ?? "Kept on this phone only. Nothing is sent to Lumenera."} <Link to="/settings" className="font-bold text-plum underline underline-offset-2">Your records</Link></span></p>; }
export function TrackingGlyph({ name }: { name: "mood" | "medicines" | "cycle" | "learn" }) { const Icon = { mood: Grid2X2, medicines: PillIcon, cycle: CircleDot, learn: GraduationCap }[name]; return <Icon className="size-7 text-plum" aria-hidden="true" />; }