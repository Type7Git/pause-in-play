/**
 * Flowella (concept demo): questions, spaces, sample library, checks and example people.
 * All copy here is sample content for demonstration. Final content is written and reviewed by clinicians.
 */
export type Opt = { id: string; label: string };
const opts = (pairs: [string, string][]): Opt[] => pairs.map(([id, label]) => ({ id, label }));
export const labelOf = (list: Opt[], id: string | undefined) => list.find((o) => o.id === id)?.label ?? id ?? "";

export const STAGES = opts([["periods", "Having periods"], ["trying", "Trying to get pregnant"], ["pregnant", "Pregnant"], ["baby", "Had a baby in the last year"], ["peri", "Signs of perimenopause"], ["post", "Post-menopause"], ["unsure", "Not sure"]]);
export const STAGE_SHORT: Record<string, string> = { periods: "Periods", trying: "Trying", pregnant: "Pregnant", baby: "New baby", peri: "Peri­menopause", post: "Post-meno­pause", unsure: "Not sure" };
export const TOPICS = opts([["periods", "Periods"], ["contra", "Contraception"], ["sexual", "Sexual health"], ["fertility", "Fertility"], ["pregnancy", "Pregnancy"], ["parenting", "Baby and parenting"], ["meno", "Perimenopause and menopause"], ["mind", "Mood and mind"], ["sleep", "Sleep"], ["breast", "Breast health"], ["pelvic", "Pelvic floor"], ["move", "Movement and food"]]);
export const TOPIC_SHORT: Record<string, string> = { periods: "Periods", contra: "Contra\u00adception", sexual: "Sexual health", fertility: "Fertility", pregnancy: "Pregnancy", parenting: "Parenting", meno: "Menopause", mind: "Mood and mind", sleep: "Sleep", breast: "Breast health", pelvic: "Pelvic floor", move: "Movement" };
export const CHILDREN = opts([["none", "No children"], ["pregnant", "Pregnant now"], ["u1", "A baby under 1"], ["u5", "Under 5"], ["school", "School age"], ["teen", "Teenagers"], ["adult", "Adult children"], ["skip", "Prefer not to say"]]);
export const PERIODS = opts([["regular", "Fairly regular"], ["irregular", "Irregular or unpredictable"], ["heavy", "Heavy or painful"], ["none", "None right now"], ["skip", "Prefer not to say"]]);
export const CONTRA = opts([["none", "None"], ["pill", "The pill"], ["iud", "IUD (hormonal or copper)"], ["implant", "Implant"], ["injection", "Injection"], ["ring", "Vaginal ring"], ["condoms", "Condoms"], ["other", "Something else"], ["skip", "Prefer not to say"]]);
export const CONDS = opts([["endo", "Endometriosis"], ["pcos", "PCOS"], ["thyroid", "Thyroid condition"], ["anx", "Anxiety or depression"], ["diabetes", "Diabetes"], ["other", "Something else"], ["none", "None of these"], ["skip", "Prefer not to say"]]);
export const LEARN = opts([["read", "Short reads"], ["watch", "Videos"], ["listen", "Audio"], ["do", "Tools and trackers"]]);
export const SCREEN_BANDS = opts([["recent", "In the last 2 years"], ["mid", "2 to 5 years ago"], ["old", "More than 5 years ago"], ["never", "Never"], ["unsure", "Not sure"]]);
export const FAMILY = opts([["breast", "Breast or ovarian cancer"], ["bowel", "Bowel cancer"], ["earlymeno", "Early menopause (before 45)"], ["bones", "Osteoporosis"], ["heart", "Heart disease"], ["diabetes", "Diabetes"], ["none", "None that I know of"], ["unsure", "Not sure"]]);
export const SLEEP = opts([["well", "Sleeping well"], ["falling", "Trouble falling asleep"], ["waking", "Waking at 3am"], ["sweats", "Night sweats wake me"], ["shift", "Shift work"], ["baby", "A little one wakes me"]]);
export const MOVE = opts([["most", "Most days"], ["some", "A few times a week"], ["rarely", "Rarely"], ["cant", "I can't at the moment"]]);
export const IDENTITY = opts([["ab", "Aboriginal"], ["ts", "Torres Strait Islander"], ["both", "Both"], ["neither", "Neither"], ["skip", "Prefer not to say"]]);
export const LANG = opts([["en", "English"], ["other", "Another language"], ["both", "Both"], ["skip", "Prefer not to say"]]);
export const SUPPORT = opts([["partner", "A partner"], ["family", "Family"], ["friends", "Friends"], ["gp", "A GP I trust"], ["online", "An online community"], ["alone", "I feel on my own with it"]]);
export const DAYS = opts([["work", "Paid work"], ["shift", "Shift work"], ["kids", "Caring for kids"], ["parents", "Caring for parents"], ["study", "Study"], ["retired", "Retired"]]);
export const ALCOHOL = opts([["none", "None"], ["some", "Some weeks"], ["most", "Most days"]]);
export const SMOKE = opts([["no", "No"], ["some", "Sometimes"], ["daily", "Daily"]]);
export const MOODS = ["Really low", "Low", "Up and down", "Pretty good", "Great"];

export type SpaceId = "periods" | "contra" | "fertility" | "baby" | "meno";
export type Space = { id: SpaceId; name: string; short: string; tint: "rose" | "lilac"; by?: string; blurb: string; seeSomeone: string[] };
export const SPACES: Record<SpaceId, Space> = {
  periods: { id: "periods", name: "Periods and cycles", short: "Periods", tint: "rose", blurb: "Understand your cycle, and get real help when periods get in the way of life.", seeSomeone: ["Periods so heavy you change protection every hour or two", "Pain that stops you doing everyday things", "Bleeding between periods or after sex"] },
  contra: { id: "contra", name: "Contraception and sexual health", short: "Sexual health", tint: "lilac", blurb: "Clear, judgement-free information so you can choose what suits you.", seeSomeone: ["New pain, sores or unusual discharge", "You think your contraception may have failed", "Sex has become painful"] },
  fertility: { id: "fertility", name: "Fertility and pregnancy", short: "Fertility", tint: "rose", blurb: "From thinking about it, to trying, to growing a little person.", seeSomeone: ["Trying for 12 months (6 if you're over 35)", "Bleeding or strong pain in pregnancy", "Your baby's movements change or slow down"] },
  baby: { id: "baby", name: "After baby", short: "After baby", tint: "lilac", blurb: "Your recovery, your baby, and how you're really going.", seeSomeone: ["Heavy bleeding, fever or a painful wound", "Low mood or worry that won't lift", "Your baby is unusually drowsy or won't feed"] },
  meno: { id: "meno", name: "Perimenopause and menopause", short: "Menopause", tint: "rose", by: "Powered by Pause in Play", blurb: "Brain fog, sleep, mood and body changes, with tools that actually help.", seeSomeone: ["Any bleeding after menopause", "Symptoms getting in the way of work or sleep", "You'd like to talk about treatment options"] },
};
export const SPACE_IDS = Object.keys(SPACES) as SpaceId[];
/** Hubs are everything you can explore: the five life-stage spaces plus Mind, which runs through every stage. */
export type HubId = SpaceId | "mind";
export const MIND: Omit<Space, "id"> & { id: "mind" } = { id: "mind", name: "Mood and mind", short: "Mind", tint: "lilac", blurb: "How you're really going, with small things that help on hard days.", seeSomeone: ["Low mood or worry most days for two weeks or more", "Sleep, eating or work are falling apart", "You're having thoughts of harming yourself: call Lifeline on 13 11 14 or 000"] };
export const HUBS: Record<HubId, Omit<Space, "id"> & { id: HubId }> = { ...SPACES, mind: MIND };
export const HUB_IDS = Object.keys(HUBS) as HubId[];

export type Format = "read" | "watch" | "listen" | "do";
export const FORMAT_LABEL: Record<Format, string> = { read: "Read", watch: "Watch", listen: "Listen", do: "Try" };
export type Tool = "cycle" | "breathe" | "week" | "pelvic" | "move" | "compare";
export type Tags = { periods?: string[]; conds?: string[]; contra?: string[]; stages?: string[]; children?: string[]; focus?: string[]; sleep?: boolean; lowMood?: boolean; family?: string[]; minAge?: number };
export type Item = { id: string; space: SpaceId | "mind" | "checks"; title: string; format: Format; mins: number; tags: Tags; summary: string; body: string[]; tool?: Tool };

export const LIBRARY: Item[] = [
  { id: "heavy-periods", space: "periods", title: "Heavy periods: what's normal, and when to get help", format: "read", mins: 4, tags: { periods: ["heavy"] }, summary: "Heavy bleeding is common, and it's treatable.", body: ["Heavy periods are one of the most common reasons women see a GP, and they're very treatable. A useful guide: if you're changing a pad or tampon every hour or two, passing large clots, or planning your days around your period, it's worth a chat.", "Your GP may suggest a blood test for iron, and there are several treatment options, from tablets you take only during your period to a hormonal IUD.", "Keep a note of your next couple of cycles. It makes that conversation easier."] },
  { id: "period-pain", space: "periods", title: "Period pain: what actually helps", format: "watch", mins: 3, tags: { periods: ["heavy"] }, summary: "Heat, movement and timing your pain relief.", body: ["Some cramping is common. Pain that stops you working, studying or sleeping is not something you just have to put up with.", "Heat packs, gentle movement and taking anti-inflammatory pain relief early (if it suits you) help many people.", "If pain is severe or getting worse over time, ask your GP about endometriosis."] },
  { id: "cycle-tracker", space: "periods", title: "Track your cycle in 10 seconds a day", format: "do", mins: 1, tool: "cycle", tags: { periods: ["irregular", "regular"] }, summary: "Tap today. Spot your pattern.", body: ["A simple log of bleeding days, pain and mood shows patterns faster than memory ever will, and makes GP visits easier."] },
  { id: "endo", space: "periods", title: "Endometriosis: getting a diagnosis", format: "read", mins: 6, tags: { conds: ["endo"] }, summary: "What to ask, and what happens next.", body: ["Endometriosis affects around one in seven women, and diagnosis often takes years. Writing down your symptoms and how they affect your life helps.", "Endometriosis and pelvic pain clinics now operate around Australia, including in Tasmania."] },
  { id: "pcos", space: "periods", title: "PCOS explained, simply", format: "watch", mins: 5, tags: { conds: ["pcos"], periods: ["irregular"] }, summary: "Cycles, skin, hair and fertility.", body: ["Polycystic ovary syndrome is common and looks different for everyone: irregular periods, skin or hair changes, and sometimes trouble getting pregnant.", "Small changes to movement, sleep and food can help symptoms, and your GP can talk you through treatment if you're trying to conceive."] },
  { id: "iud-first-year", space: "contra", title: "Your IUD: the first year", format: "read", mins: 4, tags: { contra: ["iud"] }, summary: "What to expect, month by month.", body: ["Irregular spotting is common in the first few months with a hormonal IUD, and often settles. A copper IUD can make periods heavier for some people.", "You can check your strings after each period. If you can't feel them, or they feel different, use other contraception and see your GP."] },
  { id: "compare-contra", space: "contra", title: "Choosing contraception, side by side", format: "do", mins: 3, tool: "compare", tags: { contra: ["none", "pill", "condoms"] }, summary: "Compare how often, how well and how it feels.", body: ["Long-acting options like the implant and IUD are the most effective and you don't have to remember them. Condoms are the only option that also protects against STIs."] },
  { id: "sexual-health-checks", space: "contra", title: "Sexual health check-ups, without the awkwardness", format: "listen", mins: 8, tags: { focus: ["sexual"] }, summary: "What happens, and what to say.", body: ["A sexual health check is usually a quick conversation and a urine test or self-collected swab. Clinicians have heard it all."] },
  { id: "ttc-six-months", space: "fertility", title: "Trying to conceive: the first six months", format: "read", mins: 5, tags: { stages: ["trying"] }, summary: "Timing, folate, and when to check in.", body: ["Start folic acid at least a month before trying, and keep it going through early pregnancy.", "Sex every two to three days across the cycle works as well as precise timing, with a lot less pressure.", "See your GP if you've been trying for 12 months, or 6 months if you're over 35."] },
  { id: "fertility-35", space: "fertility", title: "Fertility after 35: what changes", format: "read", mins: 4, tags: { stages: ["trying"], minAge: 35 }, summary: "The honest picture, and your options.", body: ["Fertility changes gradually with age, and many people conceive naturally in their late 30s. Checking in with your GP after 6 months of trying gives you more options sooner."] },
  { id: "pregnancy-weeks", space: "fertility", title: "Your pregnancy, week by week", format: "do", mins: 2, tool: "week", tags: { stages: ["pregnant"] }, summary: "See what's happening this week.", body: ["Each week brings changes for you and your baby. Slide to your week to see what's happening."] },
  { id: "pregnancy-sleep", space: "fertility", title: "Sleep in pregnancy", format: "listen", mins: 7, tags: { stages: ["pregnant"], sleep: true }, summary: "Positions, pillows and winding down.", body: ["From the third trimester, going to sleep on your side is recommended. A pillow between your knees and behind your back can make it more comfortable."] },
  { id: "six-week-check", space: "baby", title: "The 6-week check, for you and your baby", format: "read", mins: 4, tags: { children: ["u1"] }, summary: "What's checked, and what to ask.", body: ["The 6-week check is for you as much as your baby: your recovery, contraception, pelvic floor and how you're feeling.", "Write down your questions beforehand. Nothing is too small to ask."] },
  { id: "night-feeds", space: "baby", title: "Night feeds and broken sleep: realistic tips", format: "listen", mins: 9, tags: { children: ["u1"], sleep: true }, summary: "Getting through, together.", body: ["Broken sleep is hard. Sharing night shifts where you can, and resting when your baby rests, both help."] },
  { id: "pelvic-after-birth", space: "baby", title: "Pelvic floor after birth", format: "do", mins: 3, tool: "pelvic", tags: { focus: ["pelvic"] }, summary: "Squeeze, lift, let go.", body: ["Gentle pelvic floor exercises can start soon after birth. A women's health physiotherapist can check you're doing them right."] },
  { id: "is-this-peri", space: "meno", title: "Is this perimenopause? The signs", format: "read", mins: 5, tags: { stages: ["peri", "unsure"] }, summary: "It's not just hot flushes.", body: ["Perimenopause can start in your early 40s, sometimes earlier. Changes to periods, sleep, mood, memory and joints are all common.", "Since July 2025, Medicare covers a menopause health assessment with your GP."] },
  { id: "hot-flushes", space: "meno", title: "Hot flushes and night sweats: what helps", format: "watch", mins: 4, tags: { sleep: true, stages: ["peri"] }, summary: "From layers to treatment options.", body: ["Layers, a cooler bedroom and limiting alcohol help some women. Menopausal hormone therapy and other treatments are effective options to discuss with your GP."] },
  { id: "brain-fog-reset", space: "meno", title: "37 tabs open: a one-minute reset for brain fog", format: "do", mins: 1, tool: "breathe", tags: { stages: ["peri"], focus: ["mind"] }, summary: "One breath, then one thing.", body: ["One minute of slower breathing, then pick the single next thing. It's the Pause in Play favourite for foggy days."] },
  { id: "strong-bones", space: "meno", title: "Strong bones after menopause", format: "read", mins: 5, tags: { stages: ["post"], focus: ["move"], family: ["bones"] }, summary: "Calcium, vitamin D and lifting things.", body: ["Bone density falls faster after menopause. Weight-bearing movement, enough calcium and vitamin D, and not smoking all help.", "If osteoporosis runs in your family, ask your GP whether a bone density scan makes sense for you."] },
  { id: "move-today", space: "meno", title: "Move today: gentle 10-minute sessions", format: "do", mins: 10, tool: "move", tags: { focus: ["move"] }, summary: "Pick a session that fits your energy.", body: ["Short, gentle sessions count. Strength, balance and stretching all support you through this stage."] },
  { id: "talk-to-someone", space: "mind", title: "When to talk to someone, and who", format: "read", mins: 3, tags: { lowMood: true, conds: ["anx"] }, summary: "GP, psychologist, helpline: where to start.", body: ["If low mood or worry has hung around for more than a couple of weeks, your GP is a good first step. They can set up a mental health plan for Medicare-rebated psychology sessions.", "If you need someone now, Lifeline is there 24/7 on 13 11 14."] },
  { id: "one-minute-pause", space: "mind", title: "A one-minute pause", format: "do", mins: 1, tool: "breathe", tags: { focus: ["mind"] }, summary: "In for 4, out for 6.", body: ["Breathing out for longer than you breathe in helps your body settle. One minute is enough."] },
  { id: "sleep-mind", space: "mind", title: "Sleep when your mind won't switch off", format: "listen", mins: 12, tags: { sleep: true }, summary: "A wind-down for busy heads.", body: ["Writing tomorrow's list before bed, dimming lights and a slow breath out can help a racing mind settle."] },
  { id: "breast-awareness", space: "checks", title: "Breast awareness: know your normal", format: "watch", mins: 3, tags: { focus: ["breast"], minAge: 30 }, summary: "Look, feel, and know what to report.", body: ["There's no special technique. Get to know how your breasts normally look and feel, and see your GP about any new lump, nipple change, skin change or pain that doesn't go away."] },
];
export const itemById = (id: string) => LIBRARY.find((i) => i.id === id);

/** National screening facts are general Australian program information. */
export type CheckId = "cervical" | "breast" | "bones";
export const CHECK_INFO: Record<CheckId, { name: string; what: string; how: string; why: string; where: string[]; national: string }> = {
  cervical: {
    name: "Cervical screening",
    what: "A quick test that looks for HPV, the virus that causes almost all cervical cancers. You can have a clinician take the sample, or choose to collect it yourself.",
    how: "Every 5 years from age 25 to 74, if you have a cervix and have ever been sexually active. Your result may mean you're asked back sooner.",
    why: "Regular screening finds changes early, long before they could become cancer. It's one of the most effective cancer prevention programs we have.",
    where: ["Your GP or a women's health clinic", "Many sexual health and community health centres", "Self-collection is available if you'd prefer to take the sample yourself"],
    national: "National Cervical Screening Program",
  },
  breast: {
    name: "Breast screen",
    what: "A free mammogram (breast X-ray) that can find cancers too small to feel.",
    how: "Every 2 years from age 50 to 74, and free from 40 if you'd like one. Family history may mean your GP suggests starting earlier.",
    why: "Finding breast cancer early means more treatment options and better outcomes.",
    where: ["BreastScreen: book on 13 20 50 from anywhere in Australia", "No GP referral needed", "Mobile screening vans visit regional towns"],
    national: "BreastScreen Australia",
  },
  bones: {
    name: "Bone health",
    what: "A conversation with your GP, and sometimes a bone density scan, to check how strong your bones are.",
    how: "There's no routine screening program. Your GP will suggest a scan based on your age, family history and other risk factors.",
    why: "Bones can thin quickly after menopause. Knowing early means you can act early.",
    where: ["Your GP", "A women's health clinic"],
    national: "Talk to your GP",
  },
};

export type Profile = {
  name?: string; pronouns?: string; year?: number; stages?: string[]; focus?: string[]; children?: string; periods?: string; contra?: string; conds?: string[];
  mood?: number; cervical?: string; mammo?: string; postcode?: string; learn?: string[]; deeper?: boolean | null;
  family?: string[]; sleep?: string; move?: string; identity?: string; lang?: string; support?: string[]; days?: string[]; alcohol?: string; smoke?: string;
  consent: { tailor: boolean; clinic: boolean; research: boolean; remind: boolean };
};
export const blankProfile = (): Profile => ({ consent: { tailor: true, clinic: false, research: false, remind: false }, deeper: null });

const Y = new Date().getFullYear();
export const PERSONAS: Record<string, { label: string; sub: string; tint: "rose" | "lilac"; profile: Profile }> = {
  maddie: { label: "Maddie, 24", sub: "Heavy periods, IUD, feeling low", tint: "rose", profile: { ...blankProfile(), name: "Maddie", pronouns: "she/her", year: Y - 24, stages: ["periods"], focus: ["periods", "mind", "contra"], children: "none", periods: "heavy", contra: "iud", conds: ["anx"], mood: 2, postcode: "7000", learn: ["watch", "read"], deeper: false } },
  sam: { label: "Sam, 38", sub: "Toddler at home, trying for a second", tint: "lilac", profile: { ...blankProfile(), name: "Sam", pronouns: "she/her", year: Y - 38, stages: ["trying", "periods"], focus: ["fertility", "sleep", "pregnancy"], children: "u5", periods: "regular", conds: ["pcos"], mood: 4, cervical: "old", postcode: "7250", learn: ["read", "listen"], deeper: true, sleep: "falling", move: "some", support: ["partner", "friends"], days: ["work", "kids"] } },
  lyn: { label: "Lyn, 62", sub: "Post-menopause, bones and sleep", tint: "rose", profile: { ...blankProfile(), name: "Lyn", pronouns: "she/her", year: Y - 62, stages: ["post"], focus: ["meno", "move", "breast"], children: "adult", conds: ["thyroid"], mood: 3, cervical: "mid", mammo: "old", postcode: "7018", learn: ["read", "do"], deeper: true, family: ["bones"], sleep: "waking", move: "some", support: ["partner", "friends", "gp"], days: ["retired", "parents"], alcohol: "some", smoke: "no" } },
};
