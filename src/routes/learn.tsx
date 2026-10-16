import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Play, HelpCircle, LockKeyhole, ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { ExampleLabel, trackingHead } from "@/components/mm/TrackingShared";
import { Sprout } from "@/components/mm/Sprout";
import { PublishedLearn } from "@/components/mm/PublishedLearn";

export const Route = createFileRoute("/learn")({ head: () => trackingHead("Learn", "Explore sample articles, videos and quizzes for Lumenera. Content is awaiting clinical review."), component: Learn });
const items = [
  { id: 1, type: "Articles", title: "Making space for a small pause", topic: "Sleep", duration: "5 min read", tier: "free" },
  { id: 2, type: "Videos", title: "A moment with Erin", topic: "Brain fog", duration: "6 min", tier: "free" },
  { id: 3, type: "Quizzes", title: "Small skills, everyday moments", topic: "Mood", duration: "3 min", tier: "free" },
  { id: 4, type: "Articles", title: "A little space for connection", topic: "Relationships", duration: "5 min read", tier: "plus" },
];
const questions = [
  { q: "What does Side Quest Saver help you keep?", answers: ["Your place and next step", "A score for your day", "Medicine instructions"], correct: 0, explanation: "It keeps your place and next step, so you can come back when you're ready." },
  { q: "Do wind-down sessions earn petals?", answers: ["Yes, for staying longer", "No — just rest"], correct: 1, explanation: "Nothing to win here. Wind-down is a quiet space without rewards." },
];
function Learn() {
  const [type, setType] = useState("All");
  const [topic, setTopic] = useState("All topics");
  const [opened, setOpened] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const item = items.find(i => i.id === opened);
  const question = questions[index];
  return <><BackButton /><ScreenTitle eyebrow="Learn" title="Short, trustworthy and made for real life." /><PublishedLearn /><div className="border-l-4 border-sage bg-sage-soft p-3.5 text-sm"><ExampleLabel /><p className="mt-1 text-muted-foreground">Sample library. Articles, videos and quizzes need Erin's review before release.</p></div>
    {!item ? <><div className="flex flex-wrap gap-2">{["All", "Videos", "Articles", "Quizzes"].map(t => <Chip key={t} pressed={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div><div className="flex flex-wrap gap-1.5">{["All topics","Sleep","Mood","Brain fog","Body","Relationships","Work","Treatment questions"].map(t => <Chip key={t} pressed={topic === t} onClick={() => setTopic(t)} className="px-3 text-xs">{t}</Chip>)}</div>
      <div className="flex flex-col gap-3">{items.filter(i => (type === "All" || i.type === type) && (topic === "All topics" || i.topic === topic)).map(i => { const Icon = i.type === "Articles" ? BookOpen : i.type === "Videos" ? Play : HelpCircle; return <Card key={i.id}><div className={`flex aspect-[2.6] items-center justify-center gap-5 rounded-xl ${i.type === "Videos" ? "bg-plum-soft" : i.type === "Quizzes" ? "bg-gold-soft" : "bg-sage-soft"}`}><Sprout size={60} mood="wave" /><Icon className="size-10 text-plum" aria-hidden="true" /></div><div className="flex justify-between text-xs font-bold text-muted-foreground"><span>{i.type.slice(0,-1)} · {i.topic}</span>{i.tier === "plus" && <span className="text-plum">PLUS</span>}</div><h3>{i.title}</h3><Muted>Sample content · {i.duration} · Awaiting review</Muted><Pill variant="ghost" onClick={() => { setOpened(i.id); setIndex(0); setAnswer(null); setFinished(false); }}>{i.tier === "plus" ? <LockKeyhole className="size-4" /> : <Icon className="size-4" />}{i.tier === "plus" ? "View Plus preview" : "Open example"}</Pill></Card>; })}</div>
      {!items.some(i => (type === "All" || i.type === type) && (topic === "All topics" || i.topic === topic)) && <Muted>No example content in this topic yet.</Muted>}
    </> : <><Pill variant="ghost" className="self-start" onClick={() => setOpened(null)}><ArrowLeft className="size-4" />Back to library</Pill><Card><ExampleLabel /><h3>{item.title}</h3>
      {item.tier === "plus" ? <><LockKeyhole className="size-8 text-plum" /><Muted>Part of the Plus collection. Plans and pricing are not available yet.</Muted><Pill variant="ghost" onClick={() => setOpened(null)}>Keep exploring free examples</Pill></> : item.type === "Videos" ? <><div className="flex aspect-video items-center justify-center rounded-xl bg-plum-soft"><Play className="size-10 text-plum" /></div><Muted>Erin's video, captions and transcript will appear here once provided and reviewed. No sample recording is being presented as hers.</Muted></> : item.type === "Articles" ? <><p className="text-sm text-muted-foreground">Example article · Not clinically reviewed</p><p>A pause doesn't have to be a big project. You might put down what you're holding, notice the room around you, and choose one small thing to return to.</p><h3>One thing can be enough</h3><p>If you'd like, park your place in Side Quest Saver. Your next step can wait there while you take a moment.</p><Muted>This is draft example copy, not Erin's published advice.</Muted></> : finished ? <><Sprout size={80} mood="wave" /><h3>A small win. Nicely done.</h3><Muted>Example quiz completed. No score and no petals added in this preview.</Muted><Pill onClick={() => { setIndex(0); setAnswer(null); setFinished(false); }}>Try again</Pill></> : question ? <><Muted>Question {index+1} of {questions.length}</Muted><h3>{question.q}</h3>{question.answers.map((a,n) => <Chip key={a} pressed={answer === n} onClick={() => setAnswer(n)} className="rounded-xl text-left">{a}</Chip>)}{answer !== null && <><p className="text-sm text-muted-foreground">{question.explanation}</p><Pill onClick={() => { if (index === questions.length-1) setFinished(true); else { setIndex(i => i+1); setAnswer(null); } }}>{index === questions.length-1 ? "Finish example quiz" : "Next question"}</Pill></>}</> : null}
    </Card></>}
  </>;
}