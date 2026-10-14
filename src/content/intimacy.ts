/** Intimacy & relationships copy from pause-and-play-v5-content.xlsx. All DRAFT until the panel's psychosexual therapist (and GP for medical lines) approves. */
export const CONVERSATION_DECKS: Record<string, string[]> = {
 "Connection": [
  "When do you feel closest to me these days?",
  "What's one small thing I do that makes you feel loved?",
  "What's something about us you never want to lose?",
  "When did we last laugh until we cried?",
  "What would make this week feel a bit easier for you?",
  "What's a favourite memory of us that still makes you smile?"
 ],
 "Touch": [
  "What kind of touch feels good right now, without it having to lead anywhere?",
  "Is there a time of day you'd rather be close?",
  "Would you like more hugs, more hand-holding, or more space at the moment?",
  "How can I tell when you'd like a cuddle and when you'd like a break?",
  "Would a massage night with no expectations sound nice?"
 ],
 "Desire": [
  "What helps you get in the mood these days?",
  "Is there anything that used to work that doesn't right now?",
  "What's something you've been wanting to say about our sex life but haven't?",
  "How can we make it easier to say \"not tonight\" without anyone feeling rejected?",
  "Would you like to try something new, or slow things right down?",
  "What does a great night together look like for you now?"
 ],
 "Practical": [
  "Would it help to plan time for us, rather than wait for it to happen?",
  "Is there anything about comfort, like lube or positions, we should talk about?",
  "Should we look into this together, or would you rather I read up first?",
  "Would you like me to come along to an appointment?",
  "What's one thing at home I could take off your plate this week?"
 ],
 "Play": [
  "If our bedroom had a weather report this week, what would it say?",
  "What song would be the soundtrack to us right now?",
  "Where would you go if we had a night away with no kids and no phones?",
  "What was our best date ever, and could we do it again?",
  "What's something silly we used to do that we should bring back?",
  "Rate our last kiss out of ten, and be honest."
 ]
};
export const KINDLY_PARTS: [string, string[]][] = [
 [
  "I've noticed…",
  [
   "I don't feel like sex as often as I used to",
   "I need more time to warm up these days",
   "sex has been uncomfortable lately",
   "I'm exhausted by bedtime",
   "I feel touched-out by the end of the day",
   "we've stopped talking about this"
  ]
 ],
 [
  "It's not about…",
  [
   "how much I love you",
   "how attractive I find you",
   "anything you've done wrong"
  ]
 ],
 [
  "Could we…",
  [
   "try that this week?",
   "talk about it on the weekend?",
   "read something about it together?",
   "go to the GP together?"
  ]
 ],
 [
  "What would help me is…",
  [
   "more cuddles that don't have to lead anywhere",
   "taking things slower",
   "planning time for us",
   "using lube without it being a big deal",
   "talking about this away from the bedroom",
   "a bit of time to myself first"
  ]
 ]
];
export type Statement = { group: string; key: string; statement: string; result_key: string };
export const CHECKIN_STATEMENTS: Statement[] = [
 {
  "group": "Desire",
  "key": "less",
  "statement": "I want sex less often than I used to",
  "result_key": "desire"
 },
 {
  "group": "Desire",
  "key": "resp",
  "statement": "Desire shows up once things get going, not out of the blue",
  "result_key": "resp"
 },
 {
  "group": "Desire",
  "key": "miss",
  "statement": "I miss wanting it",
  "result_key": "desire"
 },
 {
  "group": "Desire",
  "key": "fine",
  "statement": "Honestly, I'm fine wanting it less",
  "result_key": "fine"
 },
 {
  "group": "Body",
  "key": "dry",
  "statement": "Dryness or discomfort",
  "result_key": "comfort"
 },
 {
  "group": "Body",
  "key": "pain",
  "statement": "Sex hurts sometimes",
  "result_key": "comfort"
 },
 {
  "group": "Body",
  "key": "blad",
  "statement": "I worry about bladder leaks",
  "result_key": "blad"
 },
 {
  "group": "Body",
  "key": "tired",
  "statement": "I'm too tired by bedtime",
  "result_key": "tired"
 },
 {
  "group": "Body",
  "key": "conf",
  "statement": "My body confidence has dipped",
  "result_key": "conf"
 },
 {
  "group": "Heart and head",
  "key": "touched",
  "statement": "I feel touched-out",
  "result_key": "touch"
 },
 {
  "group": "Heart and head",
  "key": "close",
  "statement": "I want closeness without it leading to sex",
  "result_key": "touch"
 },
 {
  "group": "Heart and head",
  "key": "worry",
  "statement": "I worry about how my partner feels",
  "result_key": "talk"
 },
 {
  "group": "Heart and head",
  "key": "quiet",
  "statement": "We've stopped talking about it",
  "result_key": "talk"
 },
 {
  "group": "Heart and head",
  "key": "disc",
  "statement": "I feel less connected",
  "result_key": "talk"
 }
];
/** Result buttons point to section activity keys; mapped to routes in the check-in screen. */
export const CHECKIN_RESULTS: Record<string, { title: string; text: string; to: string; label: string }> = {
 "desire": {
  "title": "Desire changes are common",
  "text": "Lower desire is one of the most common changes women describe at midlife. Sleep, stress, hormones, comfort and how connected you feel all feed into it. It isn't a flaw, and if it bothers you, it's worth raising with your GP.",
  "to": "ilearn",
  "label": "Read about desire"
 },
 "resp": {
  "title": "That's responsive desire, and it's normal",
  "text": "For many women, desire follows closeness and arousal rather than arriving first. Starting with touch that has no pressure attached, and letting interest build, is a completely normal way to work.",
  "to": "ilearn",
  "label": "Read about responsive desire"
 },
 "fine": {
  "title": "Wanting it less is okay too",
  "text": "There is no right amount. If you and your partner are both content, that's what matters. If you're not on the same page, a calm conversation helps more than guessing.",
  "to": "talk",
  "label": "Try conversation cards"
 },
 "comfort": {
  "title": "Discomfort is common, and very treatable",
  "text": "Dryness and pain often come from tissue changes as oestrogen falls. These usually don't settle on their own, but lubricants, moisturisers and vaginal oestrogen work well. Pain is never something to push through. Your GP is the place to start.",
  "to": "ilearn",
  "label": "Read about comfort"
 },
 "blad": {
  "title": "Your pelvic floor can help",
  "text": "Leaks are common and treatable. A pelvic health physiotherapist can check what's going on and give you exercises that suit you. Your GP can refer you, or you can book directly.",
  "to": "ilearn",
  "label": "Read about the pelvic floor"
 },
 "tired": {
  "title": "It might be the timing",
  "text": "If bedtime is when you're most exhausted, no wonder. Some couples find mornings, weekends or a planned evening takes the pressure off.",
  "to": "talk",
  "label": "Try conversation cards"
 },
 "conf": {
  "title": "Your body has changed, and so have you",
  "text": "It's hard to feel desire while you're busy feeling self-conscious. Noticing what your body does for you, and telling your partner what helps you feel good, can shift things.",
  "to": "ilearn",
  "label": "Read about body confidence"
 },
 "touch": {
  "title": "Touched-out is real",
  "text": "When you've been giving all day, touch can feel like one more demand. Saying what kind of touch you'd like, and when, protects closeness instead of avoiding it.",
  "to": "kindly",
  "label": "Find the words"
 },
 "talk": {
  "title": "Closeness starts with talking",
  "text": "Many couples stop talking about sex because it feels awkward or hurtful. A low-pressure way in, away from the bedroom, makes it easier for both of you.",
  "to": "kindly",
  "label": "Find the words"
 }
};
export const GP_KEYS = ["dry", "pain", "blad"];
