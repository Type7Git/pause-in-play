import { supabase } from "@/integrations/supabase/client";

export const STATUSES = [
  { key: "sunny", label: "Sunny", emoji: "☀️" },
  { key: "mixed", label: "Mixed", emoji: "⛅" },
  { key: "rainy", label: "Rainy", emoji: "🌧️" },
  { key: "empty", label: "Running on empty", emoji: "🪫" },
] as const;
export const statusLabel = (k?: string | null) => STATUSES.find((s) => s.key === k);

export const RELATIONSHIPS = ["Friend", "Partner", "Sister", "Mum", "Daughter (18+)", "Colleague", "Other"];

export const NUDGES = ["☕ Sending you a cuppa", "💛 Thinking of you", "💪 You've got this", "🚶‍♀️ Walk later?", "😂 This made me laugh"];

/** Sharing choices. `soon` ones stay locked until personal health saving is switched on. */
export const PERMS = [
  { key: "garden", label: "My garden", desc: "Petals, level and badges" },
  { key: "status", label: "My status", desc: "Sunny, Mixed, Rainy or Running on empty" },
  { key: "shared_reminders", label: "Shared reminders", desc: "Reminders you choose to share" },
  { key: "messages", label: "Messages and nudges", desc: "You can message each other" },
  { key: "med_checkins", label: "Medicine check-ins", desc: "Done or missed, never the name or dose", soon: true },
  { key: "cycle_summary", label: "Cycle summary", desc: "A short summary, never details", soon: true },
] as const;
export type PermKey = (typeof PERMS)[number]["key"];

export const NEVER_SHARED = ["Mood logs and notes", "Sprout chats and Tell Sprout", "Intimacy & relationships", "Medicine names and doses", "Your Side Quests and VIT items"];

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "P";

export type PalRow = {
  other_id: string; other_name: string; relationship: string;
  i_share_link: string | null; i_share_status: string | null;
  they_share_link: string | null; they_share_status: string | null;
  their_status: string | null; last_body: string | null; last_at: string | null; unread: number; blocked: boolean;
};

export async function fetchPals(): Promise<PalRow[]> {
  const { data, error } = await supabase.rpc("pal_overview");
  if (error) throw error;
  return (data ?? []) as PalRow[];
}

export const friendlyError = (e: unknown) => {
  const m = (e as { message?: string })?.message ?? "";
  if (m.includes("rate_limited")) return m.replace(/^.*rate_limited:\s*/, "Please wait: ");
  return m || "Something went wrong. Please try again.";
};
