-- Carson Portfolio Monthly Focus Board
-- Run this in the Supabase SQL Editor for project bobujirqspjsbfkyxhcj
-- (the same project used by Ben's health app and Business Ops app).
--
-- These tables are namespaced with a carson_ prefix and have RLS enabled
-- with NO policies. That means the anon/authenticated keys cannot read or
-- write them at all -- only the service role key (used server-side by this
-- app's API routes) can touch them. Ben's other apps' tables are untouched
-- and this app cannot read them either, since it only ever queries its own
-- carson_ tables.

create table if not exists carson_focus_state (
  id int primary key default 1,
  company text not null check (company in ('sdc', 'wec', 'smb')),
  month text not null default '',
  goals text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists carson_company_info (
  key text primary key check (key in ('sdc', 'wec', 'smb')),
  label text not null,
  sub text not null default '',
  baseline text[] not null default '{}',
  focus text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists carson_ideas (
  id uuid primary key default gen_random_uuid(),
  name text,
  company text not null check (company in ('sdc', 'wec', 'smb', 'general')),
  text text not null,
  created_at timestamptz not null default now()
);

alter table carson_focus_state enable row level security;
alter table carson_company_info enable row level security;
alter table carson_ideas enable row level security;

-- Seed the three companies with the current baseline/focus reference text.
insert into carson_company_info (key, label, sub, baseline, focus)
values
  (
    'sdc',
    'Swingin Dance Co',
    'Tucker manages day to day · Dalton films and posts',
    array[
      'Dalton keeps posting on his own, alternating weekly between Mon/Thu and Tue/Fri',
      'Occasional third post in a week when a specific event is coming up',
      'Tucker stays the point of contact and oversees day to day'
    ],
    array[
      'Ben adds one extra video per week promoting the bigger event or specialized content',
      'Event promotion runs whisper, speak, shout: leak it, then release details, then push hard',
      'Flyers and story posts sprinkled in before and during event week',
      'Flagship event (like a country prom) targeted at least once a quarter'
    ]
  ),
  (
    'wec',
    'Western Events Center',
    'Taft manages, minority stake, largely runs it himself',
    array[
      'One post a week of venue and event photos, plus one flyer for one large event a month',
      'Taft creates most content himself with guidelines from Ben',
      'Neither Ben nor Dalton has account access; Ben sends Taft a monthly content bundle to post'
    ],
    array[
      'Mirrors the Dance Co approach with more weight on events',
      'Adds an SEO push aimed at increasing lead form submissions through Google',
      'Direction: more concerts, a learn-to-rope night, hangout nights, indoor pickleball, a year-round western events calendar',
      'Dance Co''s Instagram can promote WEC events, only when they''re on-brand for that audience'
    ]
  ),
  (
    'smb',
    'Swingin Mechanical Bulls',
    'Sam is the point of contact, no dedicated manager yet',
    array[
      'Whichever ads were still winning at the end of the last focus month keep running untouched',
      'No new ads started, nothing requires a person day to day',
      'Automated lead and quote system keeps working in the background'
    ],
    array[
      'Ben builds 25 new ads for the month, then prunes only the underperformers',
      'Occasional event photography and filming to build future ad content and social posts',
      'Dedicated page stays light on posting since people follow for experiences, not services',
      'Ad goal: $10k/month, roughly 12 rentals (about 3 a week)'
    ]
  )
on conflict (key) do nothing;
