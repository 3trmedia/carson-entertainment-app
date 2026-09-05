-- Adds per-company "next focus start" dates and a company-colored events
-- calendar (up to 3 major events per company per month, enforced in the
-- app layer). Run this after 20260904000000_carson_focus_board.sql.

alter table carson_company_info
  add column if not exists next_focus_date date;

create table if not exists carson_events (
  id uuid primary key default gen_random_uuid(),
  company text not null check (company in ('sdc', 'wec', 'smb')),
  title text not null,
  event_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table carson_events enable row level security;
-- No policies, same as the other carson_ tables: only the service role
-- (used server-side by this app's API routes) can read or write this.
