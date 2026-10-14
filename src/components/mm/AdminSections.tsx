import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listAccounts } from "@/lib/admin.functions";

export type QuizQ = { q: string; answers: string[]; correct: number; explanation: string };
export type LearnItem = {
  id?: string; kind: "article" | "video" | "quiz"; title: string; summary: string; body: string;
  video_url: string | null; quiz: QuizQ[]; tier: "free" | "plus"; status: "draft" | "approved"; updated_at?: string; section?: string;
};
const blank: LearnItem = { kind: "article", title: "", summary: "", body: "", video_url: null, quiz: [], tier: "free", status: "draft" };
const KIND = { article: "Article", video: "Video", quiz: "Quiz" } as const;
const input = "w-full rounded-[14px] border border-line bg-sunk px-3 py-2";

export function LearnAdmin({ userId }: { userId: string }) {
  const items = useQuery({
    queryKey: ["admin-learn"],
    queryFn: async () => {
      const { data, error } = await supabase.from("learn_content").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data as unknown as LearnItem[];
    },
  });
  const [editing, setEditing] = useState<LearnItem | null>(null);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Articles, videos and quizzes for the Learn page. Only Approved items are shown to users.</p>
        <button onClick={() => setEditing(blank)} className="press rounded-full bg-plum px-4 py-2 font-bold text-shell">+ New item</button>
      </div>
      <div className="overflow-hidden rounded-[18px] border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-sunk text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-2">Type</th><th className="px-4 py-2">Title</th><th className="px-4 py-2">Tier</th><th className="px-4 py-2">Status</th></tr>
          </thead>
          <tbody>
            {(items.data ?? []).map((i) => (
              <tr key={i.id} onClick={() => setEditing(i)} className="cursor-pointer border-t border-line hover:bg-sunk">
                <td className="px-4 py-2.5 text-muted-foreground">{KIND[i.kind]}</td>
                <td className="px-4 py-2.5 font-bold">{i.title}{i.section === "intimacy" && <span className="ml-2 rounded-full bg-rose-soft px-2 py-0.5 text-xs font-normal">Intimacy</span>}</td>
                <td className="px-4 py-2.5">{i.tier === "plus" ? "Plus" : "Free"}</td>
                <td className="px-4 py-2.5"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${i.status === "approved" ? "bg-sage-soft text-sage" : "bg-gold-soft text-ink"}`}>{i.status === "approved" ? "Approved" : "Draft"}</span></td>
              </tr>
            ))}
            {!items.data?.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">{items.isLoading ? "Fetching content…" : "Nothing here yet. Start with a new article, video or quiz."}</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <LearnEditor item={editing} userId={userId} onClose={() => setEditing(null)} />}
    </section>
  );
}

function LearnEditor({ item, userId, onClose }: { item: LearnItem; userId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [e, setE] = useState<LearnItem>(item);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof LearnItem>(k: K, v: LearnItem[K]) => setE((p) => ({ ...p, [k]: v }));
  const setQ = (n: number, patch: Partial<QuizQ>) => set("quiz", e.quiz.map((q, i) => (i === n ? { ...q, ...patch } : q)));

  async function save(approve: boolean) {
    if (!e.title.trim()) { toast.error("Give it a title first."); return; }
    if (e.kind === "video" && e.video_url && !/^https:\/\//.test(e.video_url)) { toast.error("Video link must start with https://"); return; }
    if (e.kind === "quiz" && e.quiz.some((q) => !q.q.trim() || q.answers.filter((a) => a.trim()).length < 2)) { toast.error("Each question needs wording and at least two answers."); return; }
    setBusy(true);
    const now = new Date().toISOString();
    const row = {
      kind: e.kind, title: e.title.trim(), summary: e.summary.trim(), body: e.body.trim(),
      video_url: e.kind === "video" ? e.video_url?.trim() || null : null,
      quiz: e.kind === "quiz" ? e.quiz.map((q) => ({ ...q, answers: q.answers.filter((a) => a.trim()) })) : [],
      tier: e.tier, status: approve ? "approved" : "draft", updated_at: now,
      approved_by: approve ? userId : null, approved_at: approve ? now : null,
    };
    const { error } = e.id ? await supabase.from("learn_content").update(row).eq("id", e.id) : await supabase.from("learn_content").insert(row);
    setBusy(false);
    if (error) { toast.error("That didn't save. Please try again."); return; }
    toast.success(approve ? "Approved and published to Learn." : "Saved as a draft.");
    qc.invalidateQueries({ queryKey: ["admin-learn"] });
    qc.invalidateQueries({ queryKey: ["learn-published"] });
    onClose();
  }
  async function remove() {
    if (!e.id || !confirm("Delete this item for good?")) return;
    const { error } = await supabase.from("learn_content").delete().eq("id", e.id);
    if (error) { toast.error("That didn't delete. Please try again."); return; }
    qc.invalidateQueries({ queryKey: ["admin-learn"] });
    qc.invalidateQueries({ queryKey: ["learn-published"] });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onClick={onClose}>
      <div role="dialog" aria-label="Edit Learn item" onClick={(ev) => ev.stopPropagation()} className="flex h-full w-full max-w-xl flex-col gap-3 overflow-y-auto bg-shell p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl font-extrabold">{e.id ? "Edit item" : "New item"}</h2><button onClick={onClose} className="text-sm font-bold text-plum underline">Close</button></div>
        <div className="flex gap-2">
          {(["article", "video", "quiz"] as const).map((k) => (
            <button key={k} onClick={() => set("kind", k)} aria-pressed={e.kind === k} className={`press rounded-full px-4 py-2 text-sm font-bold ${e.kind === k ? "bg-plum text-shell" : "border border-line text-plum"}`}>{KIND[k]}</button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-sm font-bold">Title<input className={input} value={e.title} maxLength={160} onChange={(v) => set("title", v.target.value)} /></label>
        <label className="flex flex-col gap-1 text-sm font-bold">Short summary<input className={input} value={e.summary} maxLength={400} onChange={(v) => set("summary", v.target.value)} /></label>
        {e.kind === "video" && <label className="flex flex-col gap-1 text-sm font-bold">Video link (https://)<input className={input} value={e.video_url ?? ""} onChange={(v) => set("video_url", v.target.value)} placeholder="https://www.youtube.com/watch?v=…" /></label>}
        <label className="flex flex-col gap-1 text-sm font-bold">{e.kind === "article" ? "Article text" : e.kind === "video" ? "Transcript / notes" : "Intro text"}<textarea className={`${input} min-h-40`} value={e.body} onChange={(v) => set("body", v.target.value)} /></label>
        {e.kind === "quiz" && (
          <div className="flex flex-col gap-3">
            {e.quiz.map((q, n) => (
              <div key={n} className="flex flex-col gap-2 rounded-[14px] border border-line bg-card p-3">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">Question {n + 1}<button onClick={() => set("quiz", e.quiz.filter((_, i) => i !== n))} className="text-rose underline">Remove</button></div>
                <input className={input} placeholder="Question" value={q.q} onChange={(v) => setQ(n, { q: v.target.value })} />
                {q.answers.map((a, ai) => (
                  <label key={ai} className="flex items-center gap-2 text-sm">
                    <input type="radio" name={`c${n}`} checked={q.correct === ai} onChange={() => setQ(n, { correct: ai })} aria-label="Correct answer" />
                    <input className={input} placeholder={`Answer ${ai + 1}`} value={a} onChange={(v) => setQ(n, { answers: q.answers.map((x, xi) => (xi === ai ? v.target.value : x)) })} />
                  </label>
                ))}
                {q.answers.length < 4 && <button onClick={() => setQ(n, { answers: [...q.answers, ""] })} className="self-start text-sm font-bold text-plum underline">+ Answer</button>}
                <input className={input} placeholder="Kind explanation shown after answering" value={q.explanation} onChange={(v) => setQ(n, { explanation: v.target.value })} />
              </div>
            ))}
            <button onClick={() => set("quiz", [...e.quiz, { q: "", answers: ["", ""], correct: 0, explanation: "" }])} className="self-start text-sm font-bold text-plum underline">+ Add question</button>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={e.tier === "plus"} onChange={(v) => set("tier", v.target.checked ? "plus" : "free")} />Plus content (for future paid plans)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button disabled={busy} onClick={() => save(false)} className="press rounded-full border border-line px-4 py-2 font-bold text-plum">Save draft</button>
          <button disabled={busy} onClick={() => save(true)} className="press rounded-full bg-plum px-4 py-2 font-bold text-shell">Approve &amp; publish</button>
          {e.id && <button onClick={remove} className="ml-auto text-sm font-bold text-rose underline">Delete</button>}
        </div>
      </div>
    </div>
  );
}

export function UsersAdmin() {
  const fetchAccounts = useServerFn(listAccounts);
  const q = useQuery({ queryKey: ["admin-accounts"], queryFn: () => fetchAccounts() });
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-AU") : "—");
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Everyone with an account. Emails only — no health or garden details are shown here.</p>
      <div className="overflow-hidden rounded-[18px] border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-sunk text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-2">Email</th><th className="px-4 py-2">Joined</th><th className="px-4 py-2">Last sign-in</th><th className="px-4 py-2">Role</th></tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-2.5 font-bold">{u.email}{!u.confirmed && <span className="ml-2 text-xs font-normal text-muted-foreground">(email not confirmed)</span>}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmt(u.createdAt)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmt(u.lastSignIn)}</td>
                <td className="px-4 py-2.5">{u.admin ? <span className="rounded-full bg-plum-soft px-2.5 py-0.5 text-xs font-bold text-plum">Admin</span> : "Member"}</td>
              </tr>
            ))}
            {!q.data?.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">{q.isLoading ? "Fetching accounts…" : q.isError ? "Couldn't load accounts. Please refresh." : "No accounts yet."}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Changing roles and plans will be added here later.</p>
    </section>
  );
}

export function PaymentsAdmin() {
  return (
    <section className="flex max-w-xl flex-col gap-2 rounded-[18px] border border-line bg-card p-5">
      <h2 className="font-display text-xl font-extrabold">Payments</h2>
      <p className="text-muted-foreground">No payment provider is connected yet. When you're ready to offer Plus plans, plans, prices and subscribers will be managed here.</p>
      <p className="text-sm text-muted-foreground">Items marked “Plus” in Learn content already stay locked for everyone until then.</p>
    </section>
  );
}
