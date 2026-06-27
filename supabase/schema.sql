create table if not exists public.wedding_rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null,
  attendance_status text not null check (attendance_status in ('attending', 'not_attending')),
  guest_count integer not null default 1 check (guest_count between 0 and 20),
  message text,
  category text not null default 'umum',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists wedding_rsvps_name_category_idx
on public.wedding_rsvps (name_key, category);

alter table public.wedding_rsvps enable row level security;
