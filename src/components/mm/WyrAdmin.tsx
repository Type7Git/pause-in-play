import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const blank = { category: "Just for fun", option_a: "", option_b: "", character_a: "q", character_b: "h" };

export function WyrAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-wyr"],
    queryFn: async () => {
      const [q, c] = await Promise.all([
        supabase.from("wyr_questions").select("*").order("id"),
        supabase.from("wyr_characters").select("code, name").order("name"),
      ]);
      if (q.error) throw q.error;
      return { questions: q.data, chars: c.data ?? [] };
    },
  });
  const [form, setForm] = useState<typeof blank & { id?: number }>(blank);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-wyr"] });
  const name = (code: string) => data?.chars.find((c) => c.code === code)?.name ?? code;

  const save = async (status: "draft" | "live") => {
    if (!form.option_a.trim() || !form.option_b.trim()) return toast.error("Both options are needed.");
    const row = { ...form, status };
    const { error } = form.id ? await supabase.from("wyr_questions").update(row).eq("id", form.id) : await supabase.from("wyr_questions").insert(row);
    if (error) return toast.error("Couldn't save that question.");
    toast.success(status === "live" ? "Question published" : "Draft saved");
    setForm(blank); refresh();
  };
  const setStatus = async (id: number, live: boolean) => {
    await supabase.from("wyr_questions").update({ status: live ? "live" : "draft" }).eq("id", id); refresh();
  };
  const publishAll = async () => {
    if (!confirm("Publish every draft question?")) return;
    const { error } = await supabase.from("wyr_questions").update({ status: "live" }).eq("status", "draft");
    if (error) toast.error("Couldn't publish."); else { toast.success("All questions are live"); refresh(); }
  };

  const qs = data?.questions ?? [];
  const sel = "rounded-xl border border-line bg-sunk px-2 py-2 text-sm";
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2 rounded-[22px] border border-line bg-card p-4">
        <h2 className="font-display text-lg">{form.id ? `Edit question ${form.id}` : "Add a question"}</h2>
        <input className={sel} aria-label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <div className="grid gap-2 sm:grid-cols-2">
          {(["a", "b"] as const).map((k) => (
            <div key={k} className="flex flex-col gap-1.5">
              <input className={sel} aria-label={`Option ${k.toUpperCase()}`} placeholder={`Option ${k.toUpperCase()}`} value={form[`option_${k}`]} onChange={(e) => setForm({ ...form, [`option_${k}`]: e.target.value })} />
              <select className={sel} aria-label={`Character for option ${k.toUpperCase()}`} value={form[`character_${k}`]} onChange={(e) => setForm({ ...form, [`character_${k}`]: e.target.value })}>
                {data?.chars.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="press rounded-full border border-line px-4 py-2 text-sm font-bold text-plum" onClick={() => save("draft")}>Save draft</button>
          <button className="press rounded-full bg-plum px-4 py-2 text-sm font-bold text-shell" onClick={() => save("live")}>Publish</button>
          {form.id && <button className="text-sm text-muted-foreground underline" onClick={() => setForm(blank)}>Cancel</button>}
        </div>
      </section>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{qs.filter((q) => q.status === "live").length} of {qs.length} live</p>
        <button className="press rounded-full border border-line px-4 py-2 text-sm font-bold text-plum" onClick={publishAll}>Publish all drafts</button>
      </div>
      <div className="overflow-x-auto rounded-[22px] border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-line"><th className="p-2">Live</th><th className="p-2">Topic</th><th className="p-2">Option A</th><th className="p-2">Option B</th><th className="p-2" /></tr></thead>
          <tbody>
            {qs.map((q) => (
              <tr key={q.id} className="border-b border-line align-top">
                <td className="p-2"><input type="checkbox" aria-label={`Question ${q.id} live`} checked={q.status === "live"} onChange={(e) => setStatus(q.id, e.target.checked)} className="size-5" /></td>
                <td className="p-2 text-muted-foreground">{q.category}</td>
                <td className="p-2">{q.option_a}<br /><span className="text-xs text-muted-foreground">{name(q.character_a)}</span></td>
                <td className="p-2">{q.option_b}<br /><span className="text-xs text-muted-foreground">{name(q.character_b)}</span></td>
                <td className="p-2"><button className="text-plum underline" onClick={() => setForm({ id: q.id, category: q.category, option_a: q.option_a, option_b: q.option_b, character_a: q.character_a, character_b: q.character_b })}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
