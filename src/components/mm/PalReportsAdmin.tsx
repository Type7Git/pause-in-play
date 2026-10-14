import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Reported PeriPal messages. Aim to handle each within 24 hours. */
export function PalReportsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-pal-reports"],
    queryFn: async () => (await supabase.from("pal_reports").select("id, reason, created_at, handled_at, pal_messages(body, sender_id, created_at)").order("created_at", { ascending: false })).data ?? [],
  });
  const handle = async (id: string) => {
    await supabase.from("pal_reports").update({ handled_at: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-pal-reports"] });
  };
  return (
    <section className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Target: respond within 24 hours. Overdue reports are highlighted.</p>
      {data?.length === 0 && <p className="text-sm">No reports.</p>}
      {data?.map((r) => {
        const overdue = !r.handled_at && Date.now() - new Date(r.created_at).getTime() > 864e5;
        return (
          <div key={r.id} className={`rounded-[18px] border p-3 text-sm ${overdue ? "border-rose bg-rose-soft" : "border-line bg-card"}`}>
            <p className="whitespace-pre-wrap">{(r.pal_messages as { body: string } | null)?.body ?? "(message deleted)"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Reported {new Date(r.created_at).toLocaleString("en-AU")} · sender {(r.pal_messages as { sender_id: string } | null)?.sender_id.slice(0, 8)}</p>
            {r.handled_at ? <p className="text-xs font-bold text-sage">Handled</p> : <button className="mt-2 font-bold text-plum underline" onClick={() => handle(r.id)}>Mark handled</button>}
          </div>
        );
      })}
    </section>
  );
}
