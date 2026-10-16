/**
 * Starter medicine list for the Medicine cabinet: names, other names, form, what it's for, and the usual schedule pattern.
 * Never a dose. Usual patterns follow typical labels and are always editable; a woman follows her prescriber or label.
 * The team manages the live list in Admin → Medicines (table `medicines`); this list is the fallback and the seed.
 */
export type Pattern = "daily" | "weekdays" | "everyN" | "cycle" | "startup" | "device" | "asNeeded" | "course";
export type Schedule = {
  pattern: Pattern;
  times?: string[];        // "08:00"
  days?: string[];         // "Mon".."Sun" for weekdays, and the ongoing days after a start-up
  every?: number;          // everyN: every N days
  on?: number; off?: number; // cycle: days on, days off
  startupDays?: number;    // startup: daily for this many days first
  replaceMonths?: number;  // device: replace after this many months
  courseDays?: number;     // course: daily for this many days
  note?: string;
};
export type Form = "tablet" | "capsule" | "gel" | "patch" | "spray" | "pessary" | "cream" | "injection" | "implant" | "ring" | "iud" | "inhaler" | "liquid" | "drops" | "other";
export type MedTag = "menopause" | "contraception" | "periods" | "thyroid" | "mood" | "sleep" | "pain" | "migraine" | "iron" | "vitamins" | "bones" | "fertility" | "pregnancy" | "bladder" | "skin" | "allergy" | "asthma" | "heart" | "diabetes" | "stomach" | "infection" | "adhd" | "weight" | "vaginal";
export type Medicine = { id: string; name: string; alsoCalled: string[]; form: Form; tags: MedTag[]; schedule: Schedule };

export const PATTERN_LABEL: Record<Pattern, string> = {
  daily: "Every day", weekdays: "Certain days of the week", everyN: "Every few days", cycle: "Days on, days off",
  startup: "A start-up, then ongoing", device: "Long-lasting device or injection", asNeeded: "Only when I need it", course: "A short course",
};
export const FORM_LABEL: Record<Form, string> = {
  tablet: "Tablet", capsule: "Capsule", gel: "Gel", patch: "Patch", spray: "Spray", pessary: "Pessary or vaginal tablet", cream: "Cream",
  injection: "Injection", implant: "Implant", ring: "Vaginal ring", iud: "IUD", inhaler: "Inhaler", liquid: "Liquid", drops: "Drops", other: "Something else",
};
export const TAG_LABEL: Record<MedTag, string> = {
  menopause: "Menopause and HRT", contraception: "Contraception", periods: "Heavy or painful periods", thyroid: "Thyroid", mood: "Mood, anxiety or depression",
  sleep: "Sleep", pain: "Pain relief", migraine: "Migraine", iron: "Iron", vitamins: "Vitamins and supplements", bones: "Bone health", fertility: "Fertility",
  pregnancy: "Pregnancy", bladder: "Bladder", skin: "Skin and acne", allergy: "Allergy and hay fever", asthma: "Asthma", heart: "Heart, blood pressure or cholesterol",
  diabetes: "Diabetes or blood sugar", stomach: "Reflux and stomach", infection: "Infections", adhd: "ADHD and focus", weight: "Weight", vaginal: "Vaginal health",
};

const D = (times = ["08:00"], note?: string): Schedule => ({ pattern: "daily", times, ...(note ? { note } : {}) });
const NIGHT = (note?: string): Schedule => D(["21:00"], note);
const AS = (note?: string): Schedule => ({ pattern: "asNeeded", ...(note ? { note } : {}) });
const WEEKLY = (day: string, note?: string): Schedule => ({ pattern: "weekdays", days: [day], times: ["08:00"], ...(note ? { note } : {}) });
const DEVICE = (months: number, note?: string): Schedule => ({ pattern: "device", replaceMonths: months, ...(note ? { note } : {}) });
const COURSE = (days: number, times = ["08:00", "20:00"], note?: string): Schedule => ({ pattern: "course", courseDays: days, times, ...(note ? { note } : {}) });
const EMPTY = "Take before food, as the label says.";

type Row = [string, string[], Form, MedTag[], Schedule];
const ROWS: Row[] = [
  // Menopause and HRT
  ["Estradiol gel", ["Estrogel", "Sandrena"], "gel", ["menopause"], D(["08:00"], "Usually once a day at the same time. Your prescriber sets the number of pumps or sachets.")],
  ["Estradiol patch", ["Estradot", "Climara"], "patch", ["menopause"], { pattern: "weekdays", days: ["Mon", "Thu"], times: ["08:00"], note: "Many patches are changed twice a week; some (like Climara) once a week. Check your box." }],
  ["Estradiol tablets", ["Progynova", "Zumenon"], "tablet", ["menopause"], D()],
  ["Estradiol spray", ["Lenzetto"], "spray", ["menopause"], D(["08:00"], "Usually once a day on the inner forearm.")],
  ["Micronised progesterone", ["Prometrium"], "capsule", ["menopause"], NIGHT("Often taken at bedtime. Some take it every night, others 12 to 14 nights a month. Follow your prescriber.")],
  ["Dydrogesterone", ["Duphaston"], "tablet", ["menopause", "fertility"], D()],
  ["Medroxyprogesterone tablets", ["Provera"], "tablet", ["menopause", "periods"], D()],
  ["Norethisterone", ["Primolut N"], "tablet", ["menopause", "periods"], D()],
  ["Estradiol with dydrogesterone", ["Femoston", "Femoston-Conti"], "tablet", ["menopause"], D()],
  ["Estradiol with norethisterone", ["Kliovance", "Kliogest", "Estalis patch"], "tablet", ["menopause"], D()],
  ["Conjugated estrogens with bazedoxifene", ["Duavive"], "tablet", ["menopause"], D()],
  ["Tibolone", ["Livial"], "tablet", ["menopause"], D()],
  ["Vaginal estradiol tablets", ["Vagifem", "Vagirux"], "pessary", ["menopause", "vaginal"], { pattern: "startup", startupDays: 14, days: ["Mon", "Thu"], times: ["21:00"], note: "Usually one a day for two weeks, then twice a week." }],
  ["Estriol vaginal cream", ["Ovestin"], "cream", ["menopause", "vaginal"], { pattern: "startup", startupDays: 21, days: ["Mon", "Thu"], times: ["21:00"], note: "Usually daily for a few weeks, then twice a week." }],
  ["Estriol pessaries", ["Ovestin pessaries"], "pessary", ["menopause", "vaginal"], { pattern: "startup", startupDays: 21, days: ["Mon", "Thu"], times: ["21:00"] }],
  ["Vaginal estradiol ring", ["Estring"], "ring", ["menopause", "vaginal"], DEVICE(3, "Usually replaced every three months.")],
  ["Testosterone cream", ["AndroFeme"], "cream", ["menopause"], D()],
  ["Fezolinetant", ["Veoza"], "tablet", ["menopause"], D()],
  ["Vaginal moisturiser", ["Replens", "Sylk", "Yes VM"], "gel", ["vaginal", "menopause"], { pattern: "weekdays", days: ["Mon", "Wed", "Fri"], times: ["21:00"], note: "Often used every two to three days." }],
  // Contraception
  ["Combined pill (levonorgestrel)", ["Levlen", "Microgynon", "Monofeme", "Loette", "Femme-Tab", "Seasonique"], "tablet", ["contraception", "periods"], D(["08:00"], "Same time each day. Some packs include sugar pills, some are taken continuously.")],
  ["Combined pill (drospirenone)", ["Yaz", "Yasmin", "Petibelle", "Isabelle"], "tablet", ["contraception", "skin", "periods"], D()],
  ["Combined pill (cyproterone)", ["Diane-35", "Brenda-35", "Juliet-35"], "tablet", ["contraception", "skin"], D()],
  ["Combined pill (estradiol)", ["Zoely", "Qlaira"], "tablet", ["contraception"], D()],
  ["Combined pill (gestodene)", ["Minulet", "Femoden"], "tablet", ["contraception"], D()],
  ["Combined pill (desogestrel)", ["Marvelon"], "tablet", ["contraception"], D()],
  ["Progestogen-only pill (norethisterone)", ["Micronor", "Noriday", "Mini pill"], "tablet", ["contraception"], D(["08:00"], "Within the same three hours each day.")],
  ["Progestogen-only pill (levonorgestrel)", ["Microlut"], "tablet", ["contraception"], D(["08:00"], "Within the same three hours each day.")],
  ["Progestogen-only pill (drospirenone)", ["Slynd"], "tablet", ["contraception"], D()],
  ["Vaginal contraceptive ring", ["NuvaRing"], "ring", ["contraception"], { pattern: "cycle", on: 21, off: 7, note: "Usually in for three weeks, then a week out, unless your prescriber says otherwise." }],
  ["Contraceptive implant", ["Implanon NXT"], "implant", ["contraception"], DEVICE(36, "Lasts up to three years.")],
  ["Hormonal IUD (52 mg)", ["Mirena"], "iud", ["contraception", "periods", "menopause"], DEVICE(60, "Lasts five years or more, depending on why you have it. Your doctor will confirm.")],
  ["Hormonal IUD (19.5 mg)", ["Kyleena"], "iud", ["contraception"], DEVICE(60, "Lasts up to five years.")],
  ["Copper IUD", ["Load 375", "TT380", "Copper T"], "iud", ["contraception"], DEVICE(60, "Lasts five to ten years, depending on the type.")],
  ["Contraceptive injection", ["Depo-Provera", "Depo-Ralovera"], "injection", ["contraception"], { pattern: "everyN", every: 84, times: ["09:00"], note: "Usually every 12 weeks." }],
  ["Emergency contraception (levonorgestrel)", ["Postinor-1", "Levonelle", "morning-after pill"], "tablet", ["contraception"], AS("As soon as possible after unprotected sex.")],
  ["Emergency contraception (ulipristal)", ["EllaOne"], "tablet", ["contraception"], AS("As soon as possible after unprotected sex.")],
  // Periods
  ["Tranexamic acid", ["Cyklokapron"], "tablet", ["periods"], AS("Usually only on heavy days of your period.")],
  ["Mefenamic acid", ["Ponstan"], "capsule", ["periods", "pain"], AS("Usually only during your period, with food.")],
  ["Naproxen", ["Naprogesic", "Naprosyn", "Anaprox"], "tablet", ["periods", "pain"], AS("With food.")],
  ["Dienogest", ["Visanne"], "tablet", ["periods"], D(["08:00"], "Often used for endometriosis.")],
  // Thyroid
  ["Levothyroxine", ["Eutroxsig", "Oroxine", "Eltroxin", "thyroxine"], "tablet", ["thyroid"], D(["06:30"], "Usually first thing in the morning on an empty stomach, 30 to 60 minutes before breakfast.")],
  ["Liothyronine", ["Tertroxin", "T3"], "tablet", ["thyroid"], D()],
  ["Carbimazole", ["Neo-Mercazole"], "tablet", ["thyroid"], D()],
  // Mood, anxiety, depression
  ["Sertraline", ["Zoloft", "Setrona", "Eleva"], "tablet", ["mood"], D()],
  ["Escitalopram", ["Lexapro", "Esipram", "Loxalate"], "tablet", ["mood"], D()],
  ["Citalopram", ["Cipramil", "Celapram"], "tablet", ["mood"], D()],
  ["Fluoxetine", ["Prozac", "Lovan", "Zactin"], "capsule", ["mood"], D()],
  ["Paroxetine", ["Aropax", "Paxtine"], "tablet", ["mood"], D()],
  ["Venlafaxine", ["Efexor-XR", "Enlafax"], "capsule", ["mood", "menopause"], D()],
  ["Desvenlafaxine", ["Pristiq", "Desfax"], "tablet", ["mood", "menopause"], D()],
  ["Duloxetine", ["Cymbalta", "Coperin"], "capsule", ["mood", "pain"], D()],
  ["Mirtazapine", ["Avanza", "Remeron", "Mirtazon"], "tablet", ["mood", "sleep"], NIGHT("Usually at night.")],
  ["Agomelatine", ["Valdoxan"], "tablet", ["mood", "sleep"], NIGHT()],
  ["Vortioxetine", ["Brintellix"], "tablet", ["mood"], D()],
  ["Amitriptyline", ["Endep"], "tablet", ["pain", "sleep", "migraine"], NIGHT("Often taken at night.")],
  ["Quetiapine", ["Seroquel"], "tablet", ["mood", "sleep"], NIGHT()],
  ["Lamotrigine", ["Lamictal"], "tablet", ["mood"], D()],
  ["Lithium", ["Lithicarb", "Quilonum SR"], "tablet", ["mood"], D(["08:00", "20:00"])],
  ["Diazepam", ["Valium", "Antenex"], "tablet", ["mood"], AS()],
  ["Propranolol", ["Inderal", "Deralin"], "tablet", ["mood", "migraine", "heart"], D()],
  ["Pregabalin", ["Lyrica"], "capsule", ["pain"], D(["08:00", "20:00"])],
  ["Gabapentin", ["Neurontin"], "capsule", ["pain", "menopause"], NIGHT()],
  ["Clonidine", ["Catapres"], "tablet", ["menopause", "heart"], D(["08:00", "20:00"])],
  // ADHD
  ["Lisdexamfetamine", ["Vyvanse"], "capsule", ["adhd"], D(["07:30"], "Usually in the morning.")],
  ["Methylphenidate", ["Ritalin", "Concerta"], "tablet", ["adhd"], D(["07:30"], "Usually in the morning.")],
  ["Dexamfetamine", ["Aspen Dexamfetamine"], "tablet", ["adhd"], D(["07:30"])],
  ["Atomoxetine", ["Strattera"], "capsule", ["adhd"], D()],
  // Sleep
  ["Melatonin", ["Circadin"], "tablet", ["sleep"], NIGHT("Usually one to two hours before bed.")],
  ["Doxylamine", ["Restavit", "Dozile"], "tablet", ["sleep", "pregnancy"], AS("Short-term use, at bedtime.")],
  ["Temazepam", ["Normison", "Temaze"], "tablet", ["sleep"], AS("At bedtime, short-term.")],
  ["Zolpidem", ["Stilnox"], "tablet", ["sleep"], AS("At bedtime, short-term.")],
  // Pain and migraine
  ["Paracetamol", ["Panadol", "Panamax", "Herron"], "tablet", ["pain"], AS("Check the label for the most you can take in a day.")],
  ["Ibuprofen", ["Nurofen", "Advil", "Brufen"], "tablet", ["pain", "periods"], AS("With food. Check the label for the most you can take in a day.")],
  ["Diclofenac", ["Voltaren", "Fenac"], "tablet", ["pain"], AS("With food.")],
  ["Celecoxib", ["Celebrex"], "capsule", ["pain"], D()],
  ["Paracetamol with codeine", ["Panadeine Forte", "Mersyndol"], "tablet", ["pain"], AS()],
  ["Tramadol", ["Tramal", "Zydol"], "capsule", ["pain"], AS()],
  ["Sumatriptan", ["Imigran"], "tablet", ["migraine"], AS("At the start of a migraine.")],
  ["Rizatriptan", ["Maxalt"], "tablet", ["migraine"], AS("At the start of a migraine.")],
  ["Zolmitriptan", ["Zomig"], "tablet", ["migraine"], AS()],
  ["Pizotifen", ["Sandomigran"], "tablet", ["migraine"], NIGHT()],
  ["Erenumab", ["Aimovig"], "injection", ["migraine"], { pattern: "everyN", every: 28, times: ["09:00"], note: "Usually once a month." }],
  ["Galcanezumab", ["Emgality"], "injection", ["migraine"], { pattern: "everyN", every: 28, times: ["09:00"], note: "Usually once a month." }],
  ["Metoclopramide", ["Maxolon", "Pramin"], "tablet", ["migraine", "stomach", "pregnancy"], AS()],
  ["Ondansetron", ["Zofran", "Ondaz"], "tablet", ["stomach", "pregnancy"], AS()],
  // Iron, vitamins and supplements
  ["Ferrous sulfate", ["Ferro-Gradumet", "Ferro-grad C", "Fefol"], "tablet", ["iron", "pregnancy"], D(["08:00"], "Some people take iron every second day. Best away from tea, coffee and calcium.")],
  ["Ferrous fumarate", ["FAB", "Ferro-tab"], "tablet", ["iron"], D()],
  ["Iron polymaltose", ["Maltofer"], "tablet", ["iron"], D()],
  ["Iron infusion (ferric carboxymaltose)", ["Ferinject"], "injection", ["iron"], AS("Given by your GP or clinic when needed.")],
  ["Vitamin D", ["Ostelin", "Ostevit-D", "cholecalciferol"], "capsule", ["vitamins", "bones"], D()],
  ["Calcium", ["Caltrate", "Cal-Sup"], "tablet", ["vitamins", "bones"], D(["08:00"], "Some split it across the day.")],
  ["Calcium with vitamin D", ["Caltrate Bone & Muscle", "Ostelin Calcium & Vitamin D3"], "tablet", ["vitamins", "bones"], D()],
  ["Folic acid", ["Megafol", "Blackmores Folate"], "tablet", ["pregnancy", "fertility", "vitamins"], D(["08:00"], "Usually from at least a month before pregnancy and through the first trimester.")],
  ["Pregnancy multivitamin", ["Elevit", "Blackmores Pregnancy Gold", "Swisse Women's Ultivite Pre-conception", "Menevit (for partners)"], "tablet", ["pregnancy", "fertility", "vitamins"], D()],
  ["Iodine", ["Blackmores I-Folic", "Neurogen"], "tablet", ["pregnancy", "vitamins"], D()],
  ["Vitamin B12", ["cyanocobalamin", "Neo-B12 injection"], "tablet", ["vitamins"], D()],
  ["Magnesium", ["Blackmores Bio Magnesium", "Swisse Ultiboost Magnesium"], "tablet", ["vitamins", "sleep"], NIGHT()],
  ["Fish oil (omega-3)", ["Blackmores Fish Oil", "Nature's Way", "krill oil"], "capsule", ["vitamins", "heart"], D()],
  ["Multivitamin for women", ["Swisse Women's Multi", "Centrum Women"], "tablet", ["vitamins"], D()],
  ["Probiotic", ["Inner Health", "Life-Space"], "capsule", ["vitamins", "stomach"], D()],
  ["Evening primrose oil", ["Blackmores Evening Primrose"], "capsule", ["vitamins", "menopause"], D()],
  ["Black cohosh", ["Remifemin"], "tablet", ["menopause", "vitamins"], D(["08:00"], "Herbal medicines can interact with other medicines. Tell your GP or pharmacist you take it.")],
  ["Zinc", ["Zinvit"], "tablet", ["vitamins"], D()],
  ["Vitamin C", ["Redoxon"], "tablet", ["vitamins"], D()],
  ["Collagen supplement", ["collagen powder"], "liquid", ["vitamins", "skin"], D()],
  ["Cranberry", ["Ural Cranberry", "Blackmores Cranberry"], "capsule", ["bladder", "vitamins"], D()],
  // Bones
  ["Alendronate", ["Fosamax", "Alendro", "Fosamax Plus"], "tablet", ["bones"], WEEKLY("Mon", "Usually once a week, first thing in the morning with a full glass of water, staying upright for 30 minutes.")],
  ["Risedronate", ["Actonel", "Atelvia"], "tablet", ["bones"], WEEKLY("Mon", "Usually once a week, first thing in the morning.")],
  ["Denosumab", ["Prolia"], "injection", ["bones"], { pattern: "everyN", every: 182, times: ["09:00"], note: "Usually every six months. Don't delay a dose without talking to your GP." }],
  ["Zoledronic acid", ["Aclasta"], "injection", ["bones"], DEVICE(12, "Usually a yearly infusion.")],
  ["Raloxifene", ["Evista"], "tablet", ["bones", "menopause"], D()],
  ["Romosozumab", ["Evenity"], "injection", ["bones"], { pattern: "everyN", every: 28, times: ["09:00"], note: "Usually monthly for 12 months." }],
  // Fertility and pregnancy
  ["Clomifene", ["Clomid", "Serophene"], "tablet", ["fertility"], { pattern: "cycle", on: 5, off: 23, times: ["08:00"], note: "Usually five days early in your cycle. Your fertility specialist will tell you which days." }],
  ["Letrozole", ["Femara"], "tablet", ["fertility"], { pattern: "cycle", on: 5, off: 23, times: ["08:00"], note: "When used for fertility, usually five days early in your cycle." }],
  ["Metformin", ["Diabex", "Diaformin", "Glucophage"], "tablet", ["diabetes", "fertility"], D(["08:00", "18:00"], "Usually with meals.")],
  ["Progesterone pessaries", ["Utrogestan", "Crinone gel", "Endometrin"], "pessary", ["fertility", "pregnancy"], D(["08:00", "20:00"])],
  ["Low-dose aspirin", ["Cartia", "Astrix"], "tablet", ["pregnancy", "heart"], NIGHT("In pregnancy, often taken at night. Only if your doctor recommends it.")],
  ["Doxylamine with pyridoxine", ["Diclectin"], "tablet", ["pregnancy", "stomach"], NIGHT()],
  ["Prenatal DHA", ["Blackmores Pregnancy & Breastfeeding Gold"], "capsule", ["pregnancy", "vitamins"], D()],
  // Bladder
  ["Mirabegron", ["Betmiga"], "tablet", ["bladder"], D()],
  ["Solifenacin", ["Vesicare"], "tablet", ["bladder"], D()],
  ["Oxybutynin", ["Ditropan", "Oxytrol patch"], "tablet", ["bladder"], D(["08:00", "20:00"])],
  ["Trimethoprim", ["Alprim", "Triprim"], "tablet", ["infection", "bladder"], COURSE(3, ["20:00"], "A short course for a urine infection.")],
  ["Nitrofurantoin", ["Macrodantin"], "capsule", ["infection", "bladder"], COURSE(5, ["08:00", "14:00", "20:00", "23:00"])],
  ["Cefalexin", ["Keflex", "Ialex"], "capsule", ["infection"], COURSE(5, ["08:00", "20:00"])],
  // Infections and thrush
  ["Amoxicillin", ["Amoxil", "Moxacin"], "capsule", ["infection"], COURSE(5, ["08:00", "16:00", "23:00"])],
  ["Amoxicillin with clavulanic acid", ["Augmentin", "Clavulin"], "tablet", ["infection"], COURSE(5)],
  ["Doxycycline", ["Doryx", "Vibramycin"], "tablet", ["infection", "skin"], D(["08:00"], "With food and a full glass of water, staying upright afterwards.")],
  ["Clotrimazole vaginal cream", ["Canesten"], "cream", ["infection", "vaginal"], COURSE(6, ["21:00"], "Usually at bedtime for several nights.")],
  ["Fluconazole", ["Diflucan", "Canesten Oral"], "capsule", ["infection", "vaginal"], AS("Often a single dose for thrush.")],
  ["Metronidazole", ["Flagyl"], "tablet", ["infection", "vaginal"], COURSE(7)],
  ["Valaciclovir", ["Valtrex"], "tablet", ["infection"], AS()],
  // Skin
  ["Isotretinoin", ["Roaccutane", "Oratane"], "capsule", ["skin"], D(["08:00"], "With food. Not to be taken in pregnancy.")],
  ["Spironolactone", ["Aldactone"], "tablet", ["skin", "heart"], D()],
  ["Adapalene gel", ["Differin", "Epiduo"], "gel", ["skin"], NIGHT()],
  ["Tretinoin cream", ["ReTrieve"], "cream", ["skin"], NIGHT()],
  ["Azelaic acid", ["Finacea", "Skinoren"], "cream", ["skin"], D(["08:00", "20:00"])],
  // Allergy and asthma
  ["Cetirizine", ["Zyrtec", "Zilarex"], "tablet", ["allergy"], D()],
  ["Loratadine", ["Claratyne"], "tablet", ["allergy"], D()],
  ["Fexofenadine", ["Telfast"], "tablet", ["allergy"], D()],
  ["Steroid nasal spray", ["Nasonex", "Flixonase", "Rhinocort"], "spray", ["allergy"], D()],
  ["Salbutamol inhaler", ["Ventolin", "Asmol"], "inhaler", ["asthma"], AS("Reliever: when you need it.")],
  ["Budesonide with formoterol", ["Symbicort", "DuoResp"], "inhaler", ["asthma"], D(["08:00", "20:00"])],
  ["Fluticasone with salmeterol", ["Seretide"], "inhaler", ["asthma"], D(["08:00", "20:00"])],
  ["Fluticasone with vilanterol", ["Breo Ellipta"], "inhaler", ["asthma"], D()],
  ["Montelukast", ["Singulair"], "tablet", ["asthma", "allergy"], NIGHT()],
  // Heart, blood pressure, cholesterol
  ["Atorvastatin", ["Lipitor", "Lorstat"], "tablet", ["heart"], D()],
  ["Rosuvastatin", ["Crestor", "Cavstat"], "tablet", ["heart"], D()],
  ["Ezetimibe", ["Ezetrol"], "tablet", ["heart"], D()],
  ["Amlodipine", ["Norvasc"], "tablet", ["heart"], D()],
  ["Perindopril", ["Coversyl"], "tablet", ["heart"], D()],
  ["Ramipril", ["Tritace"], "capsule", ["heart"], D()],
  ["Irbesartan", ["Avapro", "Karvea"], "tablet", ["heart"], D()],
  ["Candesartan", ["Atacand"], "tablet", ["heart"], D()],
  ["Telmisartan", ["Micardis"], "tablet", ["heart"], D()],
  ["Metoprolol", ["Betaloc", "Toprol-XL"], "tablet", ["heart"], D(["08:00", "20:00"])],
  ["Hydrochlorothiazide", ["Dithiazide"], "tablet", ["heart"], D()],
  ["Methyldopa", ["Aldomet"], "tablet", ["heart", "pregnancy"], D(["08:00", "20:00"])],
  ["Labetalol", ["Trandate"], "tablet", ["heart", "pregnancy"], D(["08:00", "20:00"])],
  ["Apixaban", ["Eliquis"], "tablet", ["heart"], D(["08:00", "20:00"])],
  ["Rivaroxaban", ["Xarelto"], "tablet", ["heart"], D()],
  ["Warfarin", ["Coumadin", "Marevan"], "tablet", ["heart"], D(["17:00"], "Usually the same time each day. Your dose may change with blood tests.")],
  // Diabetes and weight
  ["Semaglutide", ["Ozempic", "Wegovy"], "injection", ["diabetes", "weight"], WEEKLY("Mon", "Usually once a week on the same day.")],
  ["Tirzepatide", ["Mounjaro"], "injection", ["diabetes", "weight"], WEEKLY("Mon", "Usually once a week on the same day.")],
  ["Dulaglutide", ["Trulicity"], "injection", ["diabetes"], WEEKLY("Mon")],
  ["Empagliflozin", ["Jardiance"], "tablet", ["diabetes", "heart"], D()],
  ["Dapagliflozin", ["Forxiga"], "tablet", ["diabetes", "heart"], D()],
  ["Gliclazide", ["Diamicron"], "tablet", ["diabetes"], D(["08:00"], "Usually with breakfast.")],
  ["Insulin (long-acting)", ["Lantus", "Optisulin", "Toujeo", "Levemir", "Tresiba"], "injection", ["diabetes"], D(["21:00"])],
  ["Insulin (meal-time)", ["NovoRapid", "Humalog", "Apidra", "Fiasp"], "injection", ["diabetes"], D(["07:30", "12:30", "18:30"], "With meals, as your diabetes team advises.")],
  ["Phentermine", ["Duromine", "Metermine"], "capsule", ["weight"], D(["07:30"])],
  // Stomach
  ["Esomeprazole", ["Nexium"], "tablet", ["stomach"], D(["07:30"], EMPTY)],
  ["Omeprazole", ["Losec", "Acimax"], "tablet", ["stomach"], D(["07:30"], EMPTY)],
  ["Pantoprazole", ["Somac"], "tablet", ["stomach"], D(["07:30"], EMPTY)],
  ["Rabeprazole", ["Pariet"], "tablet", ["stomach"], D(["07:30"], EMPTY)],
  ["Famotidine", ["Pepcidine", "Pepzan"], "tablet", ["stomach"], AS()],
  ["Antacid", ["Gaviscon", "Mylanta", "Quick-Eze"], "liquid", ["stomach", "pregnancy"], AS()],
  ["Psyllium fibre", ["Metamucil"], "liquid", ["stomach"], D()],
  ["Macrogol", ["Movicol", "OsmoLax"], "liquid", ["stomach"], AS()],
  ["Loperamide", ["Imodium", "Gastro-Stop"], "capsule", ["stomach"], AS()],
  ["Hyoscine butylbromide", ["Buscopan"], "tablet", ["stomach", "periods", "pain"], AS()],
  // Eyes and other
  ["Lubricating eye drops", ["Systane", "Optive", "Hylo-Fresh"], "drops", ["menopause"], D(["08:00", "20:00"], "Dry eyes are common in perimenopause.")],
  ["Hydroxychloroquine", ["Plaquenil"], "tablet", ["pain"], D()],
  ["Prednisolone", ["Panafcortelone", "Predsone"], "tablet", ["pain", "asthma"], D(["08:00"], "Usually in the morning with food.")],
];

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const MEDICINES: Medicine[] = ROWS.map(([name, alsoCalled, form, tags, schedule]) => ({ id: slug(name), name, alsoCalled, form, tags, schedule }));

/** Search by any part of a name or brand, first letters weighted highest. */
export function searchMedicines(list: Medicine[], q: string, filters: { tags?: MedTag[]; form?: Form | null } = {}): Medicine[] {
  const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const scored: [Medicine, number][] = [];
  for (const m of list) {
    if (filters.tags?.length && !filters.tags.some((t) => m.tags.includes(t))) continue;
    if (filters.form && m.form !== filters.form) continue;
    const names = [m.name, ...m.alsoCalled].map((n) => n.toLowerCase());
    let score = 0;
    let all = true;
    for (const w of words) {
      const best = Math.max(...names.map((n) => (n.startsWith(w) ? 3 : n.split(/[\s(),-]+/).some((p) => p.startsWith(w)) ? 2 : n.includes(w) ? 1 : 0)));
      if (!best) { all = false; break; }
      score += best;
    }
    if (all) scored.push([m, score]);
  }
  return scored.sort((a, b) => b[1] - a[1] || a[0].name.localeCompare(b[0].name)).map(([m]) => m);
}
