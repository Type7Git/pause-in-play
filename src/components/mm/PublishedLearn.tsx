import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, Chip, Muted, Pill } from "./ui";
import type { LearnItem } from "./AdminSections";

export function PublishedLearn() {
  const q = useQuery({
    queryKey: ["learn-published"],
    queryFn: async () => {
      const { data } = await supabase.from("learn_content").select("*").eq("status", "approved").order("updated_at", { ascending: false });
      return (data ?? []) as unknown as LearnItem[];
    },
  });
  const [open, setOpen] = useState<string | null>(null);
  if (!q.data?.length) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="eyebrow">From Erin</p>
      {q.data.map((i) => <Item key={i.id} item={i} open={open === i.id} onToggle={() => setOpen(open === i.id ? null : i.id!)} />)}
    </div>
  );
}

function Item({ item, open, onToggle }: { item: LearnItem; open: boolean; onToggle: () => void }) {
  const [n, setN] = useState(0);
  const [ans, setAns] = useState<number | null>(null);
  const qq = item.quiz[n];
  const label = item.kind === "article" ? "Article" : item.kind === "video" ? "Video" : "Quiz";
  return (
    <Card>
      <div className="flex justify-between text-xs font-bold text-muted-foreground"><span>{label}</span>{item.tier === "plus" && <span className="text-plum">PLUS</span>}</div>
      <h3>{item.title}</h3>
      {item.summary && <Muted>{item.summary}</Muted>}
      <Pill variant="ghost" onClick={onToggle}>{open ? "Close" : "Open"}</Pill>
      {open && (item.tier === "plus" ? (
        <><LockKeyhole className="size-6 text-plum" /><Muted>Part of the Plus collection. Plans aren't available yet.</Muted></>
      ) : (
        <>
          {item.kind === "video" && item.video_url && <a href={item.video_url} target="_blank" rel="noreferrer" className="font-bold text-plum underline">Watch the video</a>}
          {item.body && <p className="whitespace-pre-line">{item.body}</p>}
          {item.kind === "quiz" && (qq ? (
            <>
              <Muted>Question {n + 1} of {item.quiz.length}</Muted>
              <h3>{qq.q}</h3>
              {qq.answers.map((a, i) => <Chip key={i} pressed={ans === i} onClick={() => setAns(i)} className="rounded-xl text-left">{a}</Chip>)}
              {ans !== null && <><p className="text-sm text-muted-foreground">{ans === qq.correct ? "Nicely done. " : ""}{qq.explanation}</p><Pill onClick={() => { setN(n + 1); setAns(null); }}>{n === item.quiz.length - 1 ? "Finish" : "Next question"}</Pill></>}
            </>
          ) : <><h3>A small win. Nicely done.</h3><Pill variant="ghost" onClick={() => { setN(0); setAns(null); }}>Try again</Pill></>)}
        </>
      ))}
    </Card>
  );
}
