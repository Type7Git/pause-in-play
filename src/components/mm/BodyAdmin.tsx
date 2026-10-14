import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Status = "draft" | "approved";
const input = "w-full rounded-[14px] border border-line bg-sunk px-3 py-2 font-normal";

/** Exercise (movement sessions + moves) and Nutrition (food tips) review areas. Writes are admin-only via RLS. */
export function BodyAdmin({ userId }: { userId: string }) {
  const [area, setArea] = useState<"exercise" | "nutrition">("exercise");
  const [status, setStatus] = useState<"all" | Status>("draft");
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {(["exercise", "nutrition"] as const).map((a) => (
          <button key={a} aria-pressed={area === a} onClick={() => setArea(a)} className={`press rounded-full border px-4 py-2 text-sm font-bold ${area === a ? "border-plum bg-plum-soft" : "border-line"}`}>
            {a === "exercise" ? "Exercise · movement sessions" : "Nutrition · food tips"}
          </button>
        ))}
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-[14px] border border-line bg-sunk px-3 py-2">
          <option value="all">All</option><option value="draft">Draft</option><option value="approved">Approved</option>
        </select>
      </div>
      <p className="text-sm text-muted-foreground">{area === "exercise" ? "For review by the Accredited Exercise Physiologist (and the pelvic health physio for pelvic floor moves)." : "For review by the Accredited Practising Dietitian."} Only approved items appear in the app.</p>
      {area === "exercise" ? <Sessions userId={userId} status={status} /> : <Tips userId={userId} status={status} />}
    </section>
  );
}

function useSetStatus(table: "movement_sessions" | "food_tips", userId: string, qk: string) {
  const qc = useQueryClient();
  return async (match: Record<string, string>, s: Status) => {
    const patch = s === "approved" ? { status: s, approved_by: userId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() } : { status: s, approved_by: null, approved_at: null, updated_at: new Date().toISOString() };
    const q = supabase.from(table).update(patch);
    const { error } = await (table === "movement_sessions" ? q.eq("key", match.key!) : q.eq("id", match.id!));
    if (error) return toast.error(error.message);
    toast.success(s === "approved" ? "Approved — now live in the app" : "Moved back to draft");
    void qc.invalidateQueries({ queryKey: [qk] });
  };
}

function Badge({ s }: { s: Status }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${s === "approved" ? "bg-sage-soft text-sage" : "bg-gold-soft"}`}>{s === "approved" ? "Approved" : "Draft"}</span>;
}

function Sessions({ userId, status }: { userId: string; status: "all" | Status }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const [s, m] = await Promise.all([supabase.from("movement_sessions").select("*").order("sort"), supabase.from("session_moves").select("*").order("order")]);
      if (s.error) throw s.error;
      return { sessions: s.data ?? [], moves: m.data ?? [] };
    },
  });
  const setS = useSetStatus("movement_sessions", userId, "admin-sessions");
  const [edit, setEdit] = useState<Record<string, { title: string; description: string }>>({});
  if (isLoading) return <p className="text-muted-foreground">Loading sessions…</p>;
  const list = (data?.sessions ?? []).filter((s) => status === "all" || s.status === status);
  const save = async (key: string) => {
    const { error } = await supabase.from("movement_sessions").update({ ...edit[key]!, updated_at: new Date().toISOString() }).eq("key", key);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEdit(({ [key]: _, ...r }) => r); void qc.invalidateQueries({ queryKey: ["admin-sessions"] });
  };
  if (!list.length) return <p className="text-muted-foreground">Nothing here.</p>;
  return (
    <>
      {status !== "approved" && list.some((s) => s.status === "draft") && (
        <button className="press self-start rounded-full bg-plum px-4 py-2 text-sm font-bold text-shell" onClick={async () => { for (const s of list.filter((x) => x.status === "draft")) await setS({ key: s.key }, "approved"); }}>Approve all {list.filter((x) => x.status === "draft").length} shown</button>
      )}
      {list.map((s) => {
        const e = edit[s.key];
        const moves = (data?.moves ?? []).filter((m) => m.session_key === s.key);
        return (
          <details key={s.key} className="rounded-[18px] border border-line bg-card p-4">
            <summary className="flex cursor-pointer flex-wrap items-center gap-2">
              <b>{s.title}</b><span className="text-sm text-muted-foreground">{s.minutes} min · {s.type} · {s.energy} · {moves.length} moves</span><Badge s={s.status as Status} />
              {moves.some((m) => m.caution_flag) && <span className="text-xs font-bold text-rose">has caution moves</span>}
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              {e ? (
                <>
                  <input className={input} value={e.title} onChange={(x) => setEdit({ ...edit, [s.key]: { ...e, title: x.target.value } })} aria-label="Title" />
                  <textarea className={input} rows={3} value={e.description} onChange={(x) => setEdit({ ...edit, [s.key]: { ...e, description: x.target.value } })} aria-label="Description" />
                </>
              ) : <p className="text-sm">{s.description}</p>}
              <p className="text-xs text-muted-foreground">Benefits: {s.benefit_tags.join(", ")}</p>
              <ol className="flex flex-col gap-2 text-sm">
                {moves.map((m) => (
                  <li key={m.id} className="rounded-xl bg-sunk p-3">
                    <b>{m.order}. {m.move}</b> · {m.seconds}s {m.caution_flag && <span className="font-bold text-rose">· check first ({m.caution_flag})</span>}
                    <p>{m.how}</p>
                    {m.easier_version && <p className="text-muted-foreground">Easier: {m.easier_version}</p>}
                    {m.caution_text && <p className="text-rose">{m.caution_text}</p>}
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2">
                {e ? <><button className="press rounded-full bg-plum px-4 py-2 text-sm font-bold text-shell" onClick={() => save(s.key)}>Save</button><button className="text-sm font-bold text-plum" onClick={() => setEdit(({ [s.key]: _, ...r }) => r)}>Cancel</button></>
                  : <button className="press rounded-full border border-line px-4 py-2 text-sm font-bold" onClick={() => setEdit({ ...edit, [s.key]: { title: s.title, description: s.description } })}>Edit</button>}
                {s.status === "draft" ? <button className="press rounded-full bg-sage px-4 py-2 text-sm font-bold text-shell" onClick={() => setS({ key: s.key }, "approved")}>Approve</button>
                  : <button className="press rounded-full border border-line px-4 py-2 text-sm font-bold" onClick={() => setS({ key: s.key }, "draft")}>Back to draft</button>}
              </div>
            </div>
          </details>
        );
      })}
    </>
  );
}

function Tips({ userId, status }: { userId: string; status: "all" | Status }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-tips"],
    queryFn: async () => { const r = await supabase.from("food_tips").select("*").order("sort"); if (r.error) throw r.error; return r.data ?? []; },
  });
  const setS = useSetStatus("food_tips", userId, "admin-tips");
  const [edit, setEdit] = useState<Record<string, { title: string; text: string; try_these: string }>>({});
  if (isLoading) return <p className="text-muted-foreground">Loading food tips…</p>;
  const list = (data ?? []).filter((t) => status === "all" || t.status === status);
  const save = async (id: string) => {
    const { error } = await supabase.from("food_tips").update({ ...edit[id]!, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEdit(({ [id]: _, ...r }) => r); void qc.invalidateQueries({ queryKey: ["admin-tips"] });
  };
  if (!list.length) return <p className="text-muted-foreground">Nothing here.</p>;
  return (
    <>
      {status !== "approved" && list.some((t) => t.status === "draft") && (
        <button className="press self-start rounded-full bg-plum px-4 py-2 text-sm font-bold text-shell" onClick={async () => { for (const t of list.filter((x) => x.status === "draft")) await setS({ id: t.id }, "approved"); }}>Approve all {list.filter((x) => x.status === "draft").length} shown</button>
      )}
      {list.map((t) => {
        const e = edit[t.id];
        return (
          <div key={t.id} className="flex flex-col gap-2 rounded-[18px] border border-line bg-card p-4">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-sage-soft px-2 py-0.5 text-xs font-bold">{t.focus}</span><b>{t.title}</b><Badge s={t.status as Status} /></div>
            {e ? (
              <>
                <input className={input} value={e.title} onChange={(x) => setEdit({ ...edit, [t.id]: { ...e, title: x.target.value } })} aria-label="Title" />
                <textarea className={input} rows={3} value={e.text} onChange={(x) => setEdit({ ...edit, [t.id]: { ...e, text: x.target.value } })} aria-label="Text" />
                <input className={input} value={e.try_these} onChange={(x) => setEdit({ ...edit, [t.id]: { ...e, try_these: x.target.value } })} aria-label="Try these" />
              </>
            ) : <><p className="text-sm">{t.text}</p>{t.try_these && <p className="text-sm text-muted-foreground"><b>Try:</b> {t.try_these}</p>}</>}
            <div className="flex flex-wrap gap-2">
              {e ? <><button className="press rounded-full bg-plum px-4 py-2 text-sm font-bold text-shell" onClick={() => save(t.id)}>Save</button><button className="text-sm font-bold text-plum" onClick={() => setEdit(({ [t.id]: _, ...r }) => r)}>Cancel</button></>
                : <button className="press rounded-full border border-line px-4 py-2 text-sm font-bold" onClick={() => setEdit({ ...edit, [t.id]: { title: t.title, text: t.text, try_these: t.try_these } })}>Edit</button>}
              {t.status === "draft" ? <button className="press rounded-full bg-sage px-4 py-2 text-sm font-bold text-shell" onClick={() => setS({ id: t.id }, "approved")}>Approve</button>
                : <button className="press rounded-full border border-line px-4 py-2 text-sm font-bold" onClick={() => setS({ id: t.id }, "draft")}>Back to draft</button>}
            </div>
          </div>
        );
      })}
    </>
  );
}
