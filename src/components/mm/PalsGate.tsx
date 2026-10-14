import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Card, Muted, Pill } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { useRewards } from "@/lib/rewards";

/** PeriPals needs an account and an 18+ confirmation before anything is shared. */
export function PalsGate({ children, why = "PeriPals connects you with people you trust, so it needs an account." }: { children: ReactNode; why?: string }) {
  const { ready, user, openSave } = useRewards();
  const qc = useQueryClient();
  const settings = useQuery({
    queryKey: ["pal_settings", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("pal_settings").select("*").maybeSingle()).data,
  });
  if (!ready || (user && settings.isLoading)) return <Muted>Loading…</Muted>;
  if (!user)
    return (
      <Card>
        <h3>Sign in to use PeriPals</h3>
        <Muted>{why}</Muted>
        <Pill onClick={openSave}>Sign in or create an account</Pill>
      </Card>
    );
  if (!settings.data?.adult_confirmed_at)
    return (
      <Card>
        <h3>PeriPals is for adults</h3>
        <Muted>PeriPals is only for people aged 18 and over. Please confirm your age to continue.</Muted>
        <Pill
          onClick={async () => {
            await supabase.from("pal_settings").upsert({ user_id: user.id, adult_confirmed_at: new Date().toISOString() });
            qc.invalidateQueries({ queryKey: ["pal_settings"] });
          }}
        >
          I'm 18 or over
        </Pill>
      </Card>
    );
  return <>{children}</>;
}

export function CrisisCard() {
  return (
    <div role="note" className="rounded-2xl border border-line bg-rose-soft p-3 text-sm">
      <b>If you or someone you know is not safe right now</b>
      <p className="mt-1">Call <a className="font-bold underline" href="tel:131114">Lifeline 13 11 14</a> any time, or <a className="font-bold underline" href="tel:000">000</a> in an emergency.</p>
    </div>
  );
}

export function Initials({ name }: { name: string }) {
  const t = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "P";
  return <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-plum-soft font-display text-plum">{t}</span>;
}
