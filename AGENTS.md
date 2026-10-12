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
- Account deletion runs in a server function that removes every user-owned row before deleting the auth user; why: app tables hold plain user_id UUIDs without auth FKs.
