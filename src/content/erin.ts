import erinPhoto from "@/assets/erin-photo.jpg";
import erinAvatar from "@/assets/erin-avatar.png";

/**
 * Dr Erin Kelly — the clinician Midlife Mind is built with.
 *
 * `photo`  : the full portrait. Used ONLY on the /erin profile card.
 * `avatar` : the small circular crop. Used everywhere Erin appears small
 *            (home "Created by" card, "Why this helps" notes, wind-down labels).
 */
export const erin = {
  name: "Dr Erin Kelly",
  role: "Clinical Psychologist",
  photo: erinPhoto,
  photoAlt: "Dr Erin Kelly, Clinical Psychologist",
  avatar: erinAvatar,
  avatarAlt: "Dr Erin Kelly",
} as const;

/** Short note shown on the /erin profile card. */
export const erinBio = [
  "I'm a clinical psychologist, and Midlife Mind came out of the things women in perimenopause kept telling me they needed: somewhere to put a thought down, one small thing to finish, and a way to switch off at the end of the day.",
  "Everything here is education and skills. It isn't assessment, diagnosis or treatment, and it doesn't replace your doctor — think of it as the pocket-sized version of good advice, in my voice.",
] as const;

/** The "why this helps" line under each tool, in Erin's voice. */
export const whyThisHelps = {
  sideQuest: "Putting the next step in writing means your brain can stop rehearsing it.",
  tabs: "One breath first, then one tab. Fewer things open is fewer things to hold.",
  littleWin: "A small finished thing is easier to start than a big one, and it still counts.",
  laugh: "A laugh loosens the moment. Nothing here is scored except the petals you choose to collect.",
  remember: "A thing written down once is a thing you no longer have to carry around.",
} as const;
