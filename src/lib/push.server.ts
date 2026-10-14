import type { SupabaseClient } from "@supabase/supabase-js";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

type Quest = { id: string; user_id: string; doing: string; next_step: string | null };

/**
 * Send due Side Quest nudges and mark them sent. With userId, only that user's
 * quests (RLS client); without, all users (admin client, scheduled job).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deliverDueNudges(supabase: SupabaseClient<any>, userId?: string) {
  const now = new Date().toISOString();
  let q = supabase
    .from("side_quests")
    .select("id, user_id, doing, next_step")
    .is("done_at", null)
    .is("notified_at", null)
    .not("remind_at", "is", null)
    .lte("remind_at", now)
    .limit(userId ? 5 : 200);
  if (userId) q = q.eq("user_id", userId);
  const { data: due, error: qErr } = await q;
  if (qErr) throw new Error(qErr.message);
  const quests = (due ?? []) as Quest[];
  if (!quests.length) return { sent: 0 };

  const userIds = [...new Set(quests.map((x) => x.user_id))];
  const { data: tokens, error: tErr } = await supabase
    .from("push_tokens")
    .select("id, user_id, token")
    .in("user_id", userIds);
  if (tErr) throw new Error(tErr.message);
  if (!tokens?.length) return { sent: 0 };

  const LOVABLE_API_KEY = process.env["LOVABLE_API_KEY"];
  const connectionApiKey = process.env["FIREBASE_MESSAGING_API_KEY"];
  if (!LOVABLE_API_KEY || !connectionApiKey) throw new Error("Push is not configured");
  const headers = {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": connectionApiKey,
    "Content-Type": "application/json",
  };

  let sent = 0;
  const stale: string[] = [];
  for (const quest of quests) {
    const body = `Your parked mission is waiting: ${quest.doing}. Next step: ${quest.next_step ?? "Pick up where I left off"}.`;
    let delivered = false;
    for (const t of tokens.filter((t) => t.user_id === quest.user_id)) {
      if (stale.includes(t.id)) continue;
      const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: {
            token: t.token,
            notification: { title: "Pause in Play", body },
            data: { path: "/side-quest" },
          },
        }),
      });
      if (res.ok) {
        delivered = true;
        continue;
      }
      console.error(`FCM send failed [${res.status}]: ${await res.text()}`);
      if (res.status === 404 || res.status === 400) stale.push(t.id);
    }
    if (delivered) {
      sent += 1;
      await supabase.from("side_quests").update({ notified_at: now }).eq("id", quest.id);
    }
  }
  if (stale.length) await supabase.from("push_tokens").delete().in("id", stale);
  return { sent };
}

type NoteSchedule = { freq: "few" | "daily" | "twice"; from: number; to: number; tz: string; next: number | null; recent?: string[] };

/**
 * Little notes for browsers with push turned on: each enabled "little_notes" reminder holds its next
 * random time; when it's due we send one note and plan the next. Runs from the 5-minute job only.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deliverLittleNotes(supabase: SupabaseClient<any>, origin: string) {
  const { nextNoteTime, pickNote } = await import("./notes");
  const now = Date.now();
  const { data: rows, error } = await supabase.from("reminders").select("id, user_id, schedule").eq("label", "little_notes").eq("enabled", true).limit(500);
  if (error) throw new Error(error.message);
  const due: { id: string; user_id: string; s: NoteSchedule }[] = [];
  for (const r of rows ?? []) {
    let s: NoteSchedule;
    try { s = JSON.parse(r.schedule) as NoteSchedule; } catch { continue; }
    if (!s.next) {
      s.next = nextNoteTime(now, s, s.tz);
      await supabase.from("reminders").update({ schedule: JSON.stringify(s) }).eq("id", r.id);
    } else if (s.next <= now) due.push({ id: r.id, user_id: r.user_id, s });
  }
  if (!due.length) return { notes: 0 };

  const { data: tokens } = await supabase.from("push_tokens").select("id, user_id, token").in("user_id", [...new Set(due.map((d) => d.user_id))]);
  const LOVABLE_API_KEY = process.env["LOVABLE_API_KEY"];
  const connectionApiKey = process.env["FIREBASE_MESSAGING_API_KEY"];
  if (!LOVABLE_API_KEY || !connectionApiKey) throw new Error("Push is not configured");
  const headers = { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": connectionApiKey, "Content-Type": "application/json" };

  let sent = 0;
  for (const d of due) {
    const note = pickNote(d.s.recent ?? []);
    for (const t of (tokens ?? []).filter((x) => x.user_id === d.user_id)) {
      const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: {
            token: t.token,
            notification: { title: "A little note for you", body: note.text },
            data: { path: `/notes?card=${note.id}` },
            webpush: { fcm_options: { link: `${origin}/notes?card=${note.id}` } },
          },
        }),
      });
      if (res.ok) sent += 1;
      else if (res.status === 404 || res.status === 400) await supabase.from("push_tokens").delete().eq("id", t.id);
    }
    // Plan the next one whether or not a device was reachable, so a dead token never causes a burst later.
    const next = { ...d.s, next: nextNoteTime(now, d.s, d.s.tz), recent: [...(d.s.recent ?? []), note.id].slice(-12) };
    await supabase.from("reminders").update({ schedule: JSON.stringify(next) }).eq("id", d.id);
  }
  return { notes: sent };
}
