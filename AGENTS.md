<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All user data (petals, badges, quests, VIT items) flows through the `useRewards()` store: localStorage when signed out, Lovable Cloud tables when signed in, with a one-time local→account migration on first sign-in; why: screens stay storage-agnostic.
- Petal totals are derived from summing `petal_events`, never stored as a counter; why: append-only history avoids lost updates across devices.
- Garden encouragement uses component-local SVG hotspots with keyboard access and live messages, without saving or awarding rewards; why: exploring kindness should not alter progress or user data.
- Account deletion runs in a server function that removes every user-owned row before deleting the auth user; why: app tables hold plain user_id UUIDs without auth FKs.
- Sprout chat runs through a public `askSprout` server function that applies crisis and clinical screens before any AI call and answers only from approved `library_entries`; why: safety rules must hold regardless of the model.
- Sprout admin (/admin) uses the browser client and relies on RLS via `has_role(..., 'admin')` in `user_roles`; why: access is enforced by the database, not by hiding links.
- Sprout chat uses custom bubbles rather than AI Elements because replies are guarded, non-streamed JSON results; why: fixed safety messages and source lines need their own layout.
- Offline support uses vite-plugin-pwa (generateSW, NetworkFirst for home + six tool pages) registered only from src/lib/pwa.ts, which refuses dev, preview and iframes; why: a stale service worker in preview would serve old code.
- "Tell Sprout" voice filing runs through public server functions (fileVoiceNote, transcribeVoice) that apply the Sprout crisis screen first, only sort text into fields, and never store audio; why: voice is error-prone and private, so nothing saves without the user confirming.
- Closed-app push nudges are sent by a 5-minute pg_cron job calling /api/public/hooks/send-nudges, authorised by a token stored only in the service-role-only `cron_tokens` table; why: public routes need a caller secret the browser can never read.
- Support and tracking examples use deterministic sample data and component-local interactions only, with no health persistence or transcription calls; why: personal tracking is blocked until Australian data residency and consent are established.
- Admin access is granted by a trigger that adds the admin role when an email in the service-role-only `admin_invites` table confirms; Learn content lives in `learn_content` (draft/approved, admin-only writes via RLS) and the admin Users list comes from a server function that checks has_role before any privileged read; why: roles stay database-enforced and never depend on the browser.
- Home sections and activities are defined in src/content/sections.ts and rendered by src/components/SectionWheel.tsx; activities without a route show as "Coming soon"; why: new sections need no component changes.
- Colouring scenes live in `colouring_scenes` (layered SVG paths); painting uses per-layer offscreen canvases with source-atop so paint never crosses a layer edge; finished PNGs go to the private `gallery` bucket under the user-id folder; why: lines stay clean and pictures stay private.
- Would you rather? reads live `wyr_questions` and `wyr_characters` (portrait SVGs stored per character); scoring lives in src/lib/wyr.ts; found characters go to `wyr_results` when signed in, localStorage when signed out; why: content is admin-published and results stay private.
- Intimacy & relationships lives under /intimacy (layout renders the privacy banner and an optional device-only WebAuthn lock from src/lib/intimacy-lock.ts); its copy is in src/content/intimacy.ts and library articles are learn_content rows with section=intimacy; check-ins are never saved while personal health saving is disabled; why: this is the most sensitive area of the app.
