import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS, isToolKey, type ToolKey } from "@/lib/sprout-guard";

type Row = { category: string; title: string; body: string; keywords: string[]; linked_tool: ToolKey | null };
const HEADERS = ["category", "title", "body", "keywords", "linked_tool"];

function toTool(v: string): ToolKey | null {
  const s = v.trim().toLowerCase();
  if (!s) return null;
  if (isToolKey(s)) return s;
  const hit = Object.entries(TOOLS).find(([, label]) => label.toLowerCase() === s);
  return hit ? (hit[0] as ToolKey) : null;
}

/** Bulk-imports library entries from .xlsx/.csv. Everything arrives as a draft so Erin still approves each one. */
export function LibraryUpload() {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [busy, setBusy] = useState(false);

  async function read(file: File) {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer());
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]!]!, { defval: "" });
      const ok: Row[] = [];
      let bad = 0;
      for (const r of raw) {
        const g = (k: string) => String(Object.entries(r).find(([h]) => h.trim().toLowerCase().replace(/\s+/g, "_") === k)?.[1] ?? "").trim();
        const row = { category: g("category"), title: g("title"), body: g("body"), keywords: g("keywords").split(/[,;]/).map((k) => k.trim().toLowerCase()).filter(Boolean), linked_tool: toTool(g("linked_tool")) };
        if (row.category && row.title && row.body) ok.push(row); else bad++;
      }
      setRows(ok); setSkipped(bad);
    } catch {
      toast.error("That file couldn't be read. Please use an .xlsx or .csv file.");
    }
  }

  async function importAll() {
    if (!rows?.length) return;
    setBusy(true);
    const now = new Date().toISOString();
    const { error } = await supabase.from("library_entries").insert(rows.map((r) => ({ ...r, status: "draft", updated_at: now })));
    setBusy(false);
    if (error) { toast.error("The import didn't save. Nothing was added, so please try again."); return; }
    toast.success(`${rows.length} entries added as drafts. Approve each one before Sprout uses it.`);
    setRows(null);
    await qc.invalidateQueries({ queryKey: ["admin-library"] });
  }

  async function template() {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([HEADERS, ["Sleep & rest", "Waking at 3am", "A short, warm answer of 60–120 words…", "sleep, 3am, waking", "wind-down"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sprout library");
    XLSX.writeFile(wb, "sprout-library-template.xlsx");
  }

  return (
    <div className="flex flex-col gap-2 rounded-[18px] border border-line bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <b className="flex-1">Upload a spreadsheet</b>
        <button onClick={template} className="text-sm font-bold text-plum underline">Download template</button>
        <button onClick={() => input.current?.click()} className="press rounded-full border border-line px-4 py-2 text-sm font-bold text-plum">Choose file</button>
        <input ref={input} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) read(f); e.target.value = ""; }} />
      </div>
      <p className="text-xs text-muted-foreground">Columns: category, title, body, keywords (comma-separated), linked_tool (optional). Every row comes in as a draft.</p>
      {rows && (
        <div className="flex flex-col gap-2">
          <ul className="max-h-48 overflow-y-auto rounded-[12px] bg-sunk p-2 text-sm">
            {rows.map((r, i) => <li key={i} className="py-0.5"><span className="text-muted-foreground">{r.category} · </span><b>{r.title}</b></li>)}
          </ul>
          {skipped > 0 && <p className="text-xs text-rose">{skipped} row{skipped > 1 ? "s were" : " was"} skipped for missing a category, title or body.</p>}
          <div className="flex gap-2">
            <button disabled={busy || !rows.length} onClick={importAll} className="press rounded-full bg-plum px-4 py-2 text-sm font-bold text-shell">Import {rows.length} as drafts</button>
            <button onClick={() => setRows(null)} className="text-sm font-bold text-muted-foreground underline">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
