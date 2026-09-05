# Carson Portfolio — Monthly Focus Board

Shared internal tool for Sam Carson's portfolio (Swingin Dance Co, Western
Events Center, Swingin Mechanical Bulls). Shows the current monthly focus
company + goals, reference cards for each company's baseline vs. focus-month
activity, and a shared idea board anyone can post to.

## Access

- **Shared passcode** (`CARSON_PASSCODE`) — gates the whole board for Sam and
  the managers. Anyone with it can view the board, edit the monthly focus,
  and post/remove idea-board notes.
- **Admin passcode** (`CARSON_ADMIN_PASSCODE`) — a second, separate passcode
  that unlocks editing the three companies' reference cards (baseline /
  focus-month text). Meant to stay with Ben; edited quarterly.

## Stack

- Next.js (App Router) on Vercel
- Supabase Postgres — shares the same project as Ben's other apps
  (`bobujirqspjsbfkyxhcj`), but its three tables (`carson_focus_state`,
  `carson_company_info`, `carson_ideas`) have RLS enabled with **no
  policies** and are only ever queried server-side with the service role
  key. The browser never receives Supabase credentials, so this app
  structurally cannot read or write any other app's tables, and nothing
  outside the service role can touch its own tables either.

## Setup

1. Run `supabase/migrations/20260904000000_carson_focus_board.sql` in the
   Supabase SQL Editor for the shared project. It creates the three tables
   and seeds the company reference cards.
2. Set env vars (see `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `CARSON_PASSCODE`, `CARSON_ADMIN_PASSCODE`.
3. `npm install && npm run dev`.

## Deploying

Vercel project Git-linked to this repo, same account as Ben's other apps.
Set the four env vars above in Vercel (Production + Preview) before the
first deploy.
