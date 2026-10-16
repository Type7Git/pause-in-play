/** Garden copy: flowers, weather, tending and badge messages. Kind-to-self metaphors, never medical claims. */

export type FlowerKey = "rose" | "peony" | "dahlia" | "sunflower" | "daffodil" | "tulip" | "lavender" | "waratah" | "daisy";

export type FlowerInfo = { key: FlowerKey; name: string; colour: string; meaning: string; messages: string[] };

export const FLOWERS: FlowerInfo[] = [
  { key: "rose", name: "Rose", colour: "#c8364a", meaning: "Softness and strength together", messages: [
    "Roses have thorns and soft petals at the same time. You're allowed to be both.",
    "A rose doesn't apologise for taking up space. Neither should you.",
    "Saying no to something is how a rose protects its bloom. Boundaries are a kind of care.",
  ] },
  { key: "peony", name: "Peony", colour: "#e98aa8", meaning: "Opening in its own time", messages: [
    "Peonies take their time to open, then they're glorious. There's no rush on you either.",
    "A peony bud looks tight for ages before anything happens. Quiet progress still counts.",
    "Peonies come back year after year from the same roots. So do you.",
  ] },
  { key: "dahlia", name: "Dahlia", colour: "#d9467a", meaning: "Many layers, all of them you", messages: [
    "A dahlia is layer after layer. You're more than the one thing that's hard right now.",
    "Dahlias bloom late in the season and keep going until the frost. Late bloomers are still bloomers.",
    "Every layer of a dahlia grew one at a time. Small steps add up.",
  ] },
  { key: "sunflower", name: "Sunflower", colour: "#f2b01e", meaning: "Turning towards the light", messages: [
    "Sunflowers turn towards the light. What's one small bright thing you can turn towards today?",
    "On cloudy days young sunflowers face each other. It's okay to lean on your people.",
    "A sunflower grows tall one ordinary day at a time.",
  ] },
  { key: "daffodil", name: "Daffodil", colour: "#f6d24a", meaning: "New beginnings after winter", messages: [
    "Daffodils are the first to bloom after winter. Every season ends, even the hard ones.",
    "You can begin again whenever you need to. No catching up required.",
    "A daffodil pushes up through cold ground. That's not weakness, that's grit.",
  ] },
  { key: "tulip", name: "Tulip", colour: "#e3506b", meaning: "Still growing, still changing", messages: [
    "Tulips keep growing even after they're cut. Change doesn't mean you've stopped.",
    "Tulips lean towards what they need. Notice what you need today, and lean a little.",
    "A tulip closes at night and opens in the morning. Rest is part of blooming.",
  ] },
  { key: "lavender", name: "Lavender", colour: "#9b7fd1", meaning: "Calm, and a slow breath", messages: [
    "Lavender is for calm. Try one slow breath out, longer than the breath in.",
    "Lavender thrives without fuss. You don't have to do everything to be doing enough.",
    "Brush past lavender and the whole garden smells sweeter. Small kindnesses spread.",
  ] },
  { key: "waratah", name: "Waratah", colour: "#c8202f", meaning: "Resilience, the Aussie way", messages: [
    "Waratahs regrow from their roots after bushfire. What's been through the fire can bloom again.",
    "A waratah stands bold and red in the bush. You're allowed to be seen.",
    "Waratahs need good drainage, not perfect conditions. You don't need perfect to grow.",
  ] },
  { key: "daisy", name: "Daisy", colour: "#f4f1ea", meaning: "Simple joys", messages: [
    "Daisies close at night and open with the sun. A fresh start, every single day.",
    "Daisies grow almost anywhere. Joy can be small and ordinary and still count.",
    "There is room for joy alongside the everyday things.",
  ] },
];

export const DEFAULT_FLOWERS: FlowerKey[] = ["rose", "lavender", "sunflower"];
export const MAX_FLOWERS = 7;
export const flowerInfo = (k: string) => FLOWERS.find((f) => f.key === k) ?? FLOWERS[0]!;

export type WeatherKey = "sunny" | "cloudy" | "windy" | "rainy" | "stormy";
export const WEATHER: { key: WeatherKey; name: string; message: string }[] = [
  { key: "sunny", name: "Sunny", message: "Lovely. Soak it up, and notice one good thing about today." },
  { key: "cloudy", name: "Cloudy", message: "Grey days are part of every season. Your garden is still growing underneath." },
  { key: "windy", name: "Windy", message: "Lots blowing around? Plants bend so they don't break. Your roots are holding more than you think." },
  { key: "rainy", name: "Rainy", message: "Rain feels heavy, and it's also how things grow. Be extra gentle with yourself today." },
  { key: "stormy", name: "Stormy", message: "Storms pass. You don't have to fix the weather, just shelter what matters. If this storm isn't passing, talking to your GP or someone you trust is a strong thing to do." },
];

export const WATER_MESSAGES = [
  "Ahh, that's better. While your garden drinks, have a sip of water yourself.",
  "Water is the small, ordinary care. A glass of water, a breath, a pause. It all counts.",
  "Watered. Gardens don't hold grudges about the days you were busy, and neither should you.",
  "Fresh water, fresh start. What would refresh you in the next ten minutes?",
];

export const SUN_MESSAGES = [
  "Here's some warmth: you're doing better than you think.",
  "Speak to yourself the way you'd speak to a friend you love. She'd tell you to rest.",
  "Being gentle with yourself is a strength, not a shortcut.",
  "You matter just as you are, not only for what you get done.",
  "A little care today matters, even when no one else sees it.",
];

export const WEED_MESSAGES = [
  "Pulled! Let go of one 'should' today.",
  "That harsh thought about yourself? Out by the roots.",
  "Comparison is a weed. Your garden grows at its own pace.",
  "Gone. You don't have to carry every worry at once.",
  "Out it comes. Perfect was never the goal.",
];

export const SPOTS = {
  soil: { title: "Rich soil", message: "Good soil is made of everything that came before, even the hard bits. Your experience feeds what grows next." },
  seed: { title: "A seed", message: "Even the smallest beginning counts. A kind moment for yourself is a lovely place to start." },
  sprout: { title: "New growth", message: "Something's growing. You don't need to see the flower yet to know it's coming." },
  bud: { title: "A bud", message: "Nearly there. Quiet progress still counts." },
  butterfly: { title: "A visitor", message: "Butterflies come to gardens that are cared for. Look what your care is bringing in." },
  bee: { title: "A busy bee", message: "Even bees rest between flowers. Busy isn't the same as worthy." },
  cloud: { title: "Passing cloud", message: "Clouds move on. So do hard moments." },
  thirsty: { title: "A little thirsty", message: "Your garden has been waiting quietly. It doesn't hold it against you. Tap Water and it'll perk right up." },
} as const;

/** Why each badge matters, how to earn it, and a line of encouragement. Keys match BADGES in rewards. */
export const BADGE_COPY: Record<string, { why: string; how: string; cheer: string }> = {
  first_seedling: {
    why: "Starting is often the hardest part. Opening this app was a small act of looking after yourself.",
    how: "Start your garden. Everyone gets this one.",
    cheer: "Every garden starts with one seed. Yours is in the ground.",
  },
  side_quest_saver: {
    why: "Parking a side quest instead of losing the main one protects your focus, and saves you the frustration of starting over.",
    how: "Use Side Quest Saver to park a side quest, so you can come back to what you were doing.",
    cheer: "Your brain isn't broken. It just works better with a parking spot.",
  },
  tab_closer: {
    why: "Closing mental tabs frees up space. Fewer open loops means a little less noise in your head.",
    how: "Use 37 tabs open to close your mental tabs down to one.",
    cheer: "One tab at a time is plenty.",
  },
  small_victories: {
    why: "Noticing small wins trains your attention towards what's working, not just what's hard.",
    how: "Log a little win, any size, in A little win.",
    cheer: "Small wins are still wins. Keep collecting them.",
  },
  glasses_detective: {
    why: "Laughing at the everyday chaos takes the sting out of it. Humour is a real coping skill.",
    how: "Find the missing glasses in I need a laugh.",
    cheer: "They were on your head the whole time. Of course they were.",
  },
  vit_head: {
    why: "Putting important things in one place takes the load off your memory, so you're not carrying it all in your head.",
    how: "File six things in the Very Important Thing Department.",
    cheer: "The department is running beautifully under your leadership.",
  },
  calm_colourist: {
    why: "Slow, absorbing activities like colouring give your nervous system a break from the rush.",
    how: "Finish a page in Colour me calm.",
    cheer: "Calm is a skill, and you're practising it.",
  },
  decisive_queen: {
    why: "Quick, playful choices are a low-stakes way to trust your own judgement again.",
    how: "Play a round of Would you rather?",
    cheer: "You know what you like. That's worth trusting.",
  },
  moving_gently: {
    why: "Gentle movement supports your body without needing to push. Showing up is the whole point.",
    how: "Tick off your first session in Move today.",
    cheer: "Your body is on your side. Keep moving gently.",
  },
  peripal: {
    why: "Connection is protective. Sharing the load with someone you trust makes the hard days lighter.",
    how: "Invite someone into My people, or accept an invite.",
    cheer: "You don't have to do this on your own.",
  },
};
