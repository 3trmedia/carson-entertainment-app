-- Dalton's admin-only page: a posting schedule + notes list, plus a
-- filming calendar across the three SDC venues (Grove Station, Sparks
-- Museum, The Barn). Same isolation pattern as the other carson_ tables:
-- RLS enabled, no policies, service-role-only access.

create table if not exists carson_dalton_page (
  id int primary key default 1,
  posting_schedule text[] not null default '{}',
  notes text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists carson_dalton_filming (
  id uuid primary key default gen_random_uuid(),
  venue text not null check (venue in ('grove', 'sparks', 'barn')),
  filming_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table carson_dalton_page enable row level security;
alter table carson_dalton_filming enable row level security;

insert into carson_dalton_page (id, posting_schedule, notes)
values (
  1,
  array[
    'Alternate weekly: Mon/Thu one week, Tue/Fri the next.',
    'Leave room in that schedule for events and larger, fun items when they come up.',
    'Use Stories specifically to share participants'' experiences — that''s what builds FOMO.'
  ],
  '{}'
)
on conflict (id) do nothing;
