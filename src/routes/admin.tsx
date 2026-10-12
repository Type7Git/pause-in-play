import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SignInForm } from "@/components/mm/SignInForm";
import { Sprout } from "@/components/mm/Sprout";
import { SproutChat } from "@/components/mm/SproutChat";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS, type ToolKey } from "@/lib/sprout-guard";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Sprout library admin · Pause and Play" },
      { name: "description", content: "Erin's workspace for writing, approving and testing Sprout's library." },
      { property: "og:title", content: "Sprout library admin · Pause and Play" },
      { property: "og:description", content: "Write, approve and test Sprout's answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Entry = { id?: string; category: string; title: string; body: string; keywords: string[]; linked_tool: ToolKey | null; status: "draft" | "approved"; updated_at?: string; approved_at?: string | null };
const blank: Entry = { category: "", title: "", body: "", keywords: [], linked_tool: null, status: "draft" };
const words = (s: string) => (s.trim().match(/\S+/g) ?? []).length;

function Admin() {
  const { user, ready } = useRewards();
  const isAdmin = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" })).data === true,
  });
  const [tab, setTab] = useState<"library" | "questions" | "test">("library");
  const [editing, setEditing] = useState<Entry | null>(null);

  if (!ready || (user && isAdmin.isLoading)) return <p className="p-10 text-muted-foreground">Loading…</p>;
  if (!user) return <div className="mx-auto flex max-w-md flex-col gap-4 p-10"><h1 className="font-display text-2xl font-extrabold">Sign in to the Sprout library</h1><SignInForm /></div>;
  if (!isAdmin.data) return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-10 text-center">
      <Sprout size={64} mood="thinking" />
      <h1 className="font-display text-2xl font-extrabold">This area is just for Erin</h1>
      <p className="text-muted-foreground">Your account doesn't have library access.</p>
      <Link to="/" className="font-bold text-plum underline">Back to Pause and Play</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sprout size={48} />
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="font-display text-[28px] font-extrabold tracking-[-0.02em]">Sprout's library</h1>
          </div>
        </div>
        <Link to="/" className="text-sm font-bold text-plum underline">← Back to the app</Link>
      </header>
      <p className="rounded-[14px] border border-gold bg-gold-soft px-4 py-2.5 text-sm">Sprout only uses <b>Approved</b> entries. Drafts are never shown to users.</p>
      <nav className="flex gap-1 rounded-full border border-line bg-card p-1 self-start" role="tablist">
        {([["library", "Library"], ["questions", "Questions Sprout couldn't answer"], ["test", "Test Sprout"]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`press rounded-full px-4 py-2 text-sm font-bold ${tab === k ? "bg-plum text-shell" : "text-plum"}`}>{l}</button>
        ))}
      </nav>
      {tab === "library" && <Library onEdit={setEditing} />}
      {tab === "questions" && <Questions onWrite={(q) => { setEditing({ ...blank, title: q }); setTab("library"); }} />}
      {tab === "test" && <div className="max-w-xl rounded-[22px] border border-line bg-shell p-4"><SproutChat compact /></div>}
      {editing && <Editor entry={editing} userId={user.id} onClose={() => setEditing(null)} />}
    </div>
  );
}

function useEntries() {
  return useQuery({
    queryKey: ["admin-library"],
    queryFn: async () => {
      const { data, error } = await supabase.from("library_entries").select("*").order("category").order("title");
      if (error) throw error;
      return data as unknown as Entry[];
    },
  });
}

function Library({ onEdit }: { onEdit: (e: Entry) => void }) {
  const entries = useEntries();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "approved">("all");
  const rows = (entries.data ?? []).filter((e) => (status === "all" || e.status === status) && (!q || `${e.title} ${e.body} ${e.category} ${e.keywords.join(" ")}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the library…" className="min-w-[240px] flex-1 rounded-[14px] border border-line bg-sunk px-3 py-2" />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-[14px] border border-line bg-sunk px-3 py-2">
          <option value="all">All</option><option value="draft">Draft</option><option value="approved">Approved</option>
        </select>
        <button onClick={() => onEdit(blank)} className="press rounded-full bg-plum px-4 py-2 font-bold text-shell">+ New entry</button>
      </div>
      <div className="overflow-hidden rounded-[18px] border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-sunk text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-2">Category</th><th className="px-4 py-2">Title</th><th className="px-4 py-2">Tool</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Updated</th></tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} onClick={() => onEdit(e)} className="cursor-pointer border-t border-line hover:bg-sunk">
                <td className="px-4 py-2.5 text-muted-foreground">{e.category}</td>
                <td className="px-4 py-2.5 font-bold">{e.title}</td>
                <td className="px-4 py-2.5">{e.linked_tool ? TOOLS[e.linked_tool] : "—"}</td>
                <td className="px-4 py-2.5"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${e.status === "approved" ? "bg-sage-soft text-sage" : "bg-gold-soft text-ink"}`}>{e.status === "approved" ? "Approved" : "Draft"}</span></td>
                <td className="px-4 py-2.5 text-muted-foreground">{e.updated_at ? new Date(e.updated_at).toLocaleDateString("en-AU") : ""}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">{entries.isLoading ? "Loading…" : "No entries match."}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Editor({ entry, userId, onClose }: { entry: Entry; userId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const all = useEntries();
  const cats = useMemo(() => [...new Set((all.data ?? []).map((e) => e.category))], [all.data]);
  const [e, setE] = useState<Entry>(entry);
  const [kw, setKw] = useState("");
  const [busy, setBusy] = useState(false);
  const n = words(e.body);

  async function save(approve: boolean) {
    if (!e.title.trim() || !e.body.trim() || !e.category.trim()) { toast.error("Category, title and body are all needed."); return; }
    setBusy(true);
    const now = new Date().toISOString();
    const row = {
      category: e.category.trim(), title: e.title.trim(), body: e.body.trim(), keywords: e.keywords, linked_tool: e.linked_tool,
      status: approve ? "approved" : "draft", updated_at: now,
      ...(approve ? { approved_by: userId, approved_at: now } : {}),
    };
    const { error } = e.id ? await supabase.from("library_entries").update(row).eq("id", e.id) : await supabase.from("library_entries").insert(row);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(approve ? "Approved. Sprout can use it now." : "Saved as a draft. Sprout won't use it yet.");
    await qc.invalidateQueries({ queryKey: ["admin-library"] });
    await qc.invalidateQueries({ queryKey: ["sprout-topics"] });
    onClose();
  }
  async function remove() {
    if (!e.id || !confirm("Delete this entry for good?")) return undefined;
    const { error } = await supabase.from("library_entries").delete().eq("id", e.id);
    if (error) { toast.error(error.message); return; }
    await qc.invalidateQueries({ queryKey: ["admin-library"] });
    onClose();
  }
  const addKw = () => { const v = kw.trim().toLowerCase(); if (v && !e.keywords.includes(v)) setE({ ...e, keywords: [...e.keywords, v] }); setKw(""); };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <div role="dialog" aria-label="Edit library entry" onClick={(ev) => ev.stopPropagation()} className="flex max-h-[92vh] w-full max-w-2xl flex-col gap-3 overflow-y-auto rounded-[22px] border border-line bg-card p-6 shadow-lift">
        <h2 className="font-display text-xl font-extrabold">{e.id ? "Edit entry" : "New entry"}</h2>
        <label className="flex flex-col gap-1 text-sm font-bold">Category (chat section)
          <input list="cats" value={e.category} onChange={(x) => setE({ ...e, category: x.target.value })} className="rounded-[14px] border border-line bg-sunk px-3 py-2 font-normal" />
          <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">Title
          <input value={e.title} onChange={(x) => setE({ ...e, title: x.target.value })} className="rounded-[14px] border border-line bg-sunk px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">Body
          <textarea rows={8} value={e.body} onChange={(x) => setE({ ...e, body: x.target.value })} className="rounded-[14px] border border-line bg-sunk px-3 py-2 font-normal leading-relaxed" />
          <span className={`text-xs font-normal ${n >= 60 && n <= 120 ? "text-sage" : "text-muted-foreground"}`}>{n} words · {e.body.length} characters · aim for 60–120 words</span>
        </label>
        <div className="flex flex-col gap-1 text-sm font-bold">Keywords
          <div className="flex flex-wrap gap-1.5 rounded-[14px] border border-line bg-sunk p-2">
            {e.keywords.map((k) => (
              <button key={k} onClick={() => setE({ ...e, keywords: e.keywords.filter((x) => x !== k) })} className="rounded-full bg-plum-soft px-2.5 py-0.5 text-xs font-bold text-plum" aria-label={`Remove ${k}`}>{k} ×</button>
            ))}
            <input value={kw} onChange={(x) => setKw(x.target.value)} onKeyDown={(x) => { if (x.key === "Enter" || x.key === ",") { x.preventDefault(); addKw(); } }} onBlur={addKw} placeholder="Type and press Enter" className="min-w-[140px] flex-1 bg-transparent px-1 text-sm font-normal outline-none" />
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm font-bold">Linked tool
          <select value={e.linked_tool ?? ""} onChange={(x) => setE({ ...e, linked_tool: (x.target.value || null) as ToolKey | null })} className="rounded-[14px] border border-line bg-sunk px-3 py-2 font-normal">
            <option value="">None</option>
            {Object.entries(TOOLS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <p className="text-xs text-muted-foreground">Currently: <b>{e.status === "approved" ? "Approved" : "Draft"}</b>{e.approved_at ? ` · approved ${new Date(e.approved_at).toLocaleString("en-AU")}` : ""}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button disabled={busy} onClick={() => save(true)} className="press rounded-full bg-sage px-5 py-2.5 font-bold text-shell">Approve and publish</button>
          <button disabled={busy} onClick={() => save(false)} className="press rounded-full border border-line bg-card px-5 py-2.5 font-bold text-plum">Save draft</button>
          <span className="flex-1" />
          {e.id && <button onClick={remove} className="text-sm font-bold text-rose underline">Delete</button>}
          <button onClick={onClose} className="text-sm font-bold text-muted-foreground underline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Questions({ onWrite }: { onWrite: (q: string) => void }) {
  const qc = useQueryClient();
  const qs = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("unanswered_questions").select("*").eq("handled", false).order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });
  const groups = useMemo(() => {
    const m = new Map<string, { text: string; ids: string[]; latest: string }>();
    for (const r of qs.data ?? []) {
      const k = r.question_text.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
      const g = m.get(k);
      if (g) g.ids.push(r.id); else m.set(k, { text: r.question_text, ids: [r.id], latest: r.created_at });
    }
    return [...m.values()];
  }, [qs.data]);
  async function handled(ids: string[]) {
    const { error } = await supabase.from("unanswered_questions").update({ handled: true }).in("id", ids);
    if (error) { toast.error(error.message); return; }
    await qc.invalidateQueries({ queryKey: ["admin-questions"] });
  }
  return (
    <section className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Saved anonymously, with emails and phone numbers removed.</p>
      {groups.map((g) => (
        <div key={g.ids[0]} className="flex flex-wrap items-center gap-3 rounded-[16px] border border-line bg-card px-4 py-3">
          <span className="flex-1 min-w-[200px]">{g.text}</span>
          {g.ids.length > 1 && <span className="rounded-full bg-plum-soft px-2.5 py-0.5 text-xs font-bold text-plum">×{g.ids.length}</span>}
          <span className="text-xs text-muted-foreground">{new Date(g.latest).toLocaleDateString("en-AU")}</span>
          <button onClick={() => onWrite(g.text)} className="press rounded-full bg-plum px-3.5 py-1.5 text-sm font-bold text-shell">Write an entry for this</button>
          <button onClick={() => handled(g.ids)} className="press rounded-full border border-line px-3.5 py-1.5 text-sm font-bold text-plum">Mark handled</button>
        </div>
      ))}
      {!groups.length && <p className="rounded-[16px] border border-line bg-card px-4 py-6 text-center text-muted-foreground">{qs.isLoading ? "Loading…" : "Nothing waiting. Sprout's doing well."}</p>}
    </section>
  );
}
