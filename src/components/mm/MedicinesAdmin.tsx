/** Admin: the medicine list women search in their cabinet, with tags, the usual schedule, and names women have added. */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { FORM_LABEL, PATTERN_LABEL, TAG_LABEL, slug, type Form, type MedTag, type Pattern, type Schedule } from "@/content/medicines";
import { WEEKDAYS, describe } from "@/lib/cabinet";
import { toSchedule } from "@/lib/medicines-db";

type Med = { id: string; isNew: boolean; name: string; also_called: string[]; form: Form; tags: MedTag[]; schedule: Schedule; status: "draft" | "approved"; updated_at?: string; fromSuggestion?: string };
type Suggestion = { id: string; name: string; form: string | null; for_what: string | null; status: string; created_at: string };

const field = "rounded-[14px] border border-line bg-sunk px-3 py-2 font-normal";
const chip = (on: boolean) => `press rounded-full px-3 py-1 text-xs font-bold ${on ? "bg-plum text-shell" : "bg-plum-soft text-plum"}`;

function useAdminMedicines() {
  return useQuery({
    queryKey: ["admin-medicines"],
    queryFn: async (): Promise<Med[]> => {
      const { data, error } = await supabase.from("medicines").select("*").order("name");
      if (error) throw error;
      return data.map((r) => ({ id: r.id, isNew: false, name: r.name, also_called: r.also_called ?? [], form: r.form as Form, tags: (r.tags ?? []) as MedTag[], schedule: toSchedule(r.default_schedule), status: r.status === "approved" ? "approved" : "draft", updated_at: r.updated_at }));
    },
  });
}
function useSuggestions() {
  return useQuery({
    queryKey: ["admin-medicine-suggestions"],
    queryFn: async (): Promise<Suggestion[]> => {
      const { data, error } = await supabase.from("medicine_suggestions").select("*").eq("status", "new").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function MedicinesAdmin({ userId }: { userId: string }) {
  const meds = useAdminMedicines();
  const sugg = useSuggestions();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "approved">("all");
  const [tag, setTag] = useState<MedTag | "">("");
  const [editing, setEditing] = useState<Med | null>(null);
  const blank: Med = { id: "", isNew: true, name: "", also_called: [], form: "tablet", tags: [], schedule: { pattern: "daily", times: ["08:00"] }, status: "draft" };
  const rows = (meds.data ?? []).filter((m) => (status === "all" || m.status === status) && (!tag || m.tags.includes(tag)) && (!q || `${m.name} ${m.also_called.join(" ")}`.toLowerCase().includes(q.toLowerCase())));

  async function dismiss(s: Suggestion) {
    const { error } = await supabase.from("medicine_suggestions").update({ status: "dismissed" }).eq("id", s.id);
    if (error) { toast.error("Couldn't update that suggestion. Try again."); return; }
    qc.invalidateQueries({ queryKey: ["admin-medicine-suggestions"] });
  }
  const fromSuggestion = (s: Suggestion) => setEditing({
    ...blank, name: s.name, fromSuggestion: s.id,
    form: (s.form && s.form in FORM_LABEL ? s.form : "tablet") as Form,
    tags: s.for_what && s.for_what in TAG_LABEL ? [s.for_what as MedTag] : [],
  });

  if (meds.isError) return <p className="rounded-[14px] border border-gold bg-gold-soft px-4 py-3 text-sm">The medicine tables aren't set up in Lovable Cloud yet. Ask Lovable to apply the migration <b>0016_medicine_cabinet.sql</b>. Until then the app uses its built-in list.</p>;

  const pending = sugg.data ?? [];
  return (
    <section className="flex flex-col gap-4">
      <p className="rounded-[14px] border border-line bg-card px-4 py-2.5 text-sm">Women search this list when adding to their Medicine cabinet. Only <b>Approved</b> medicines appear. The usual schedule fills in their reminders to start with, and they can change it. <b>Never add doses</b>: women follow their prescriber or the label.</p>

      <div className="rounded-[18px] border border-line bg-card p-4">
        <h2 className="font-display text-lg font-extrabold">Added by women {pending.length ? <span className="ml-1 rounded-full bg-gold-soft px-2.5 py-0.5 align-middle text-xs font-bold text-ink">{pending.length} new</span> : null}</h2>
        <p className="text-sm text-muted-foreground">Names women typed when they couldn't find their medicine. Check each one, then add it to the list or dismiss it. Nothing identifies who sent it.</p>
        {sugg.isLoading ? <p className="pt-2 text-sm text-muted-foreground">Fetching…</p> : !pending.length ? <p className="pt-2 text-sm text-muted-foreground">Nothing waiting. All caught up.</p> : (
          <ul className="mt-2 flex flex-col">
            {pending.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-2 border-t border-line py-2.5">
                <div className="min-w-[200px] flex-1"><b>{s.name}</b><span className="block text-xs text-muted-foreground">{[s.form ? FORM_LABEL[s.form as Form] ?? s.form : null, s.for_what ? TAG_LABEL[s.for_what as MedTag] ?? s.for_what : null, new Date(s.created_at).toLocaleDateString("en-AU")].filter(Boolean).join(" · ")}</span></div>
                <button onClick={() => fromSuggestion(s)} className="press rounded-full bg-plum px-4 py-1.5 text-sm font-bold text-shell">Check and add</button>
                <button onClick={() => void dismiss(s)} className="text-sm font-bold text-muted-foreground underline">Dismiss</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicines or brand names…" className={`min-w-[240px] flex-1 ${field}`} />
        <select value={tag} onChange={(e) => setTag(e.target.value as MedTag | "")} className={field}><option value="">All tags</option>{(Object.keys(TAG_LABEL) as MedTag[]).map((t) => <option key={t} value={t}>{TAG_LABEL[t]}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={field}><option value="all">All</option><option value="draft">Draft</option><option value="approved">Approved</option></select>
        <button onClick={() => setEditing(blank)} className="press rounded-full bg-plum px-4 py-2 font-bold text-shell">+ New medicine</button>
      </div>
      <div className="overflow-x-auto rounded-[18px] border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-sunk text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-2">Medicine</th><th className="px-4 py-2">Form</th><th className="px-4 py-2">Tags</th><th className="px-4 py-2">Usual schedule</th><th className="px-4 py-2">Status</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} onClick={() => setEditing(structuredClone(m))} className="cursor-pointer border-t border-line align-top hover:bg-sunk">
                <td className="px-4 py-2.5"><b>{m.name}</b>{m.also_called.length ? <span className="block text-xs text-muted-foreground">{m.also_called.join(", ")}</span> : null}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{FORM_LABEL[m.form] ?? m.form}</td>
                <td className="px-4 py-2.5"><span className="flex flex-wrap gap-1">{m.tags.map((t) => <span key={t} className="rounded-full bg-plum-soft px-2 py-0.5 text-xs font-bold text-plum">{TAG_LABEL[t] ?? t}</span>)}</span></td>
                <td className="px-4 py-2.5 text-muted-foreground">{describe(m.schedule)}</td>
                <td className="px-4 py-2.5"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${m.status === "approved" ? "bg-sage-soft text-sage" : "bg-gold-soft text-ink"}`}>{m.status === "approved" ? "Approved" : "Draft"}</span></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">{meds.isLoading ? "Fetching the medicine list…" : "Nothing matches. Try another word, or add a new medicine."}</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <MedicineEditor med={editing} userId={userId} existing={meds.data ?? []} onClose={() => setEditing(null)} />}
    </section>
  );
}

function MedicineEditor({ med, userId, existing, onClose }: { med: Med; userId: string; existing: Med[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [m, setM] = useState<Med>(med);
  const [alias, setAlias] = useState("");
  const [busy, setBusy] = useState(false);
  const s = m.schedule;
  const setS = (p: { [K in keyof Schedule]?: Schedule[K] | undefined }) => setM((x) => { const next = { ...x.schedule, ...p } as Record<string, unknown>; for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k]; return { ...x, schedule: next as Schedule }; });
  const n = (v: string) => { const x = Math.round(Number(v)); return x > 0 ? x : undefined; };
  const addAlias = () => { const v = alias.trim(); if (v && !m.also_called.includes(v)) setM({ ...m, also_called: [...m.also_called, v] }); setAlias(""); };
  const timed = !["device", "asNeeded"].includes(s.pattern);

  async function save(approve: boolean) {
    const name = m.name.trim();
    if (!name) { toast.error("The medicine needs a name."); return; }
    const id = m.isNew ? slug(name) : m.id;
    if (m.isNew && existing.some((x) => x.id === id)) { toast.error(`"${name}" is already in the list. Open it there and add any other names to it.`); return; }
    // Keep only the fields this pattern uses, so women don't inherit stale settings.
    const keep: Record<Pattern, (keyof Schedule)[]> = { daily: ["times"], weekdays: ["days", "times"], everyN: ["every", "times"], cycle: ["on", "off", "times"], startup: ["startupDays", "days", "times"], device: ["replaceMonths"], asNeeded: [], course: ["courseDays", "times"] };
    const schedule: Record<string, unknown> = { pattern: s.pattern };
    for (const k of keep[s.pattern]) if (s[k] !== undefined) schedule[k] = s[k];
    if (s.note?.trim()) schedule["note"] = s.note.trim();
    setBusy(true);
    const now = new Date().toISOString();
    const row = { name, also_called: m.also_called, form: m.form, tags: m.tags, default_schedule: schedule as Json, status: approve ? "approved" : "draft", updated_at: now, approved_by: approve ? userId : null, approved_at: approve ? now : null };
    const { error } = m.isNew ? await supabase.from("medicines").insert({ id, ...row }) : await supabase.from("medicines").update(row).eq("id", m.id);
    if (!error && m.fromSuggestion) await supabase.from("medicine_suggestions").update({ status: "added" }).eq("id", m.fromSuggestion);
    setBusy(false);
    if (error) { toast.error("That didn't save. Your changes are still here, so check your connection and try again."); return; }
    toast.success(approve ? "Approved. Women can find it now." : "Saved as a draft. Women won't see it yet.");
    await Promise.all(["admin-medicines", "admin-medicine-suggestions", "medicine-list"].map((k) => qc.invalidateQueries({ queryKey: [k] })));
    onClose();
  }
  async function remove() {
    if (m.isNew || !confirm(`Delete ${m.name} from the list? Women who already added it keep it in their cabinet.`)) return;
    const { error } = await supabase.from("medicines").delete().eq("id", m.id);
    if (error) { toast.error("That couldn't be deleted just now. Try again in a moment."); return; }
    await qc.invalidateQueries({ queryKey: ["admin-medicines"] });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <div role="dialog" aria-label="Edit medicine" onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] w-full max-w-2xl flex-col gap-3 overflow-y-auto rounded-[22px] border border-line bg-card p-6 shadow-lift">
        <h2 className="font-display text-xl font-extrabold">{m.isNew ? "New medicine" : "Edit medicine"}</h2>
        {m.fromSuggestion ? <p className="rounded-[14px] bg-gold-soft px-3 py-2 text-sm">A woman typed this name. Check the spelling, use the generic name as the main name and add the brand as another name.</p> : null}
        <label className="flex flex-col gap-1 text-sm font-bold">Name (generic, as on the label)<input value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} className={field} /></label>
        <div className="flex flex-col gap-1 text-sm font-bold">Also called (brands and other names)
          <div className="flex flex-wrap gap-1.5 rounded-[14px] border border-line bg-sunk p-2">
            {m.also_called.map((a) => <button key={a} onClick={() => setM({ ...m, also_called: m.also_called.filter((x) => x !== a) })} className="rounded-full bg-plum-soft px-2.5 py-0.5 text-xs font-bold text-plum" aria-label={`Remove ${a}`}>{a} ×</button>)}
            <input value={alias} onChange={(e) => setAlias(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addAlias(); } }} onBlur={addAlias} placeholder="Type and press Enter" className="min-w-[140px] flex-1 bg-transparent px-1 text-sm font-normal outline-none" />
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm font-bold">Form<select value={m.form} onChange={(e) => setM({ ...m, form: e.target.value as Form })} className={field}>{(Object.keys(FORM_LABEL) as Form[]).map((f) => <option key={f} value={f}>{FORM_LABEL[f]}</option>)}</select></label>
        <div className="flex flex-col gap-1 text-sm font-bold">Tags (what it's for, used by "Not sure?")
          <div className="flex flex-wrap gap-1.5">{(Object.keys(TAG_LABEL) as MedTag[]).map((t) => <button key={t} aria-pressed={m.tags.includes(t)} onClick={() => setM({ ...m, tags: m.tags.includes(t) ? m.tags.filter((x) => x !== t) : [...m.tags, t] })} className={chip(m.tags.includes(t))}>{TAG_LABEL[t]}</button>)}</div>
        </div>
        <fieldset className="flex flex-col gap-2 rounded-[14px] border border-line p-3">
          <legend className="px-1 text-sm font-bold">Usual schedule (prefills her reminders)</legend>
          <select value={s.pattern} onChange={(e) => setS({ pattern: e.target.value as Pattern })} className={field}>{(Object.keys(PATTERN_LABEL) as Pattern[]).map((p) => <option key={p} value={p}>{PATTERN_LABEL[p]}</option>)}</select>
          {s.pattern === "startup" ? <label className="flex items-center gap-2 text-sm">Daily for the first<input type="number" min={1} value={s.startupDays ?? ""} onChange={(e) => setS({ startupDays: n(e.target.value) })} className={`${field} w-20`} />days, then the days below</label> : null}
          {s.pattern === "weekdays" || s.pattern === "startup" ? <div className="flex flex-wrap gap-1">{WEEKDAYS.map((d) => { const on = (s.days ?? []).includes(d); return <button key={d} aria-pressed={on} onClick={() => setS({ days: on ? (s.days ?? []).filter((x) => x !== d) : WEEKDAYS.filter((w) => w === d || (s.days ?? []).includes(w)) })} className={chip(on)}>{d}</button>; })}</div> : null}
          {s.pattern === "everyN" ? <label className="flex items-center gap-2 text-sm">Every<input type="number" min={1} value={s.every ?? ""} onChange={(e) => setS({ every: n(e.target.value) })} className={`${field} w-20`} />days</label> : null}
          {s.pattern === "cycle" ? <label className="flex flex-wrap items-center gap-2 text-sm"><input type="number" min={1} aria-label="Days on" value={s.on ?? ""} onChange={(e) => setS({ on: n(e.target.value) })} className={`${field} w-20`} />days on,<input type="number" min={1} aria-label="Days off" value={s.off ?? ""} onChange={(e) => setS({ off: n(e.target.value) })} className={`${field} w-20`} />days off</label> : null}
          {s.pattern === "course" ? <label className="flex items-center gap-2 text-sm">For<input type="number" min={1} value={s.courseDays ?? ""} onChange={(e) => setS({ courseDays: n(e.target.value) })} className={`${field} w-20`} />days</label> : null}
          {s.pattern === "device" ? <label className="flex items-center gap-2 text-sm">Replace every<input type="number" min={1} value={s.replaceMonths ?? ""} onChange={(e) => setS({ replaceMonths: n(e.target.value) })} className={`${field} w-20`} />months</label> : null}
          {timed ? <label className="flex flex-col gap-1 text-sm">Usual times, comma separated (24 hour)<input value={(s.times ?? []).join(", ")} onChange={(e) => setS({ times: e.target.value.split(",").map((x) => x.trim()).filter((x) => /^\d{1,2}:\d{2}$/.test(x)).map((x) => x.padStart(5, "0")) })} placeholder="08:00, 20:00" className={field} /></label> : null}
          <label className="flex flex-col gap-1 text-sm">Note shown when she adds it (timing tips, never doses)<input value={s.note ?? ""} maxLength={160} onChange={(e) => setS({ note: e.target.value })} placeholder="e.g. Usually taken on an empty stomach, 30 to 60 minutes before breakfast." className={field} /></label>
          <p className="text-xs text-muted-foreground">She'll see: <b>{describe(s)}</b></p>
        </fieldset>
        <div className="flex flex-wrap gap-2 pt-1">
          <button disabled={busy} onClick={() => void save(true)} className="press rounded-full bg-sage px-5 py-2.5 font-bold text-shell">Approve and publish</button>
          <button disabled={busy} onClick={() => void save(false)} className="press rounded-full border border-line bg-card px-5 py-2.5 font-bold text-plum">Save draft</button>
          <span className="flex-1" />
          {!m.isNew && <button onClick={() => void remove()} className="text-sm font-bold text-rose underline">Delete</button>}
          <button onClick={onClose} className="text-sm font-bold text-muted-foreground underline">Cancel</button>
        </div>
      </div>
    </div>
  );
}
