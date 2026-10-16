/**
 * Clinical advisory panel and ownership details.
 * Anything in [square brackets] is a placeholder and is highlighted on screen until filled in.
 */
export const company = { name: "[Company] Pty Ltd", founder: "Al [Surname]" } as const;

export const disclosure = "[Disclose any family or financial relationship between a panel member and the owner here.]";

export type PanelMember = { name: string; role: string; covers: string; initials: string; tile: string };

export const panel: PanelMember[] = [
  { name: "[Name]", role: "Clinical Psychologist", covers: "Psychological skills, mood, sleep and wellbeing content", initials: "CP", tile: "bg-plum-soft" },
  { name: "[Name]", role: "General Practitioner, menopause training", covers: "Medical content: hormones, medicines, bleeding, bones and heart", initials: "GP", tile: "bg-sage-soft" },
  { name: "[Name]", role: "Pelvic Health Physiotherapist", covers: "Bladder, pelvic floor and movement content", initials: "PT", tile: "bg-gold-soft" },
  { name: "[Name]", role: "Accredited Exercise Physiologist", covers: "Movement sessions and exercise safety", initials: "EP", tile: "bg-sage-soft" },
  { name: "[Name]", role: "Accredited Practising Dietitian", covers: "Food and nutrition content", initials: "DT", tile: "bg-gold-soft" },
  { name: "[Name]", role: "Psychosexual therapist or sexologist", covers: "Intimacy, desire and relationships content", initials: "ST", tile: "bg-rose-soft" },
];

export const principles = [
  "Every tool and article is reviewed by a registered health professional before it goes live.",
  "Education and skills only. No diagnosis, no symptom scores, no medical advice.",
  "Enera answers only from the reviewed library, and points you to your GP for anything medical.",
  "Private by default. You choose what's saved and what's shared.",
] as const;

/** The "why this helps" line under each tool, signed by the clinical team. */
export const whyThisHelps = {
  sideQuest: "Putting the next step in writing means your brain can stop rehearsing it.",
  tabs: "One breath first, then one tab. Fewer things open is fewer things to hold.",
  littleWin: "A small finished thing is easier to start than a big one, and it still counts.",
  laugh: "A laugh loosens the moment. Nothing here is scored except the petals you choose to collect.",
  remember: "A thing written down once is a thing you no longer have to carry around.",
} as const;

export const isPlaceholder = (s: string) => /\[[^\]]+\]/.test(s);
