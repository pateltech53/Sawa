-- Sawa — schema + row-level security (Winning Plan §5B/§5C).
-- The prototype runs on the in-browser demo store (src/lib/store.tsx), which mirrors these
-- tables and visibility rules. Run this in Supabase to move the same model to Postgres.

create extension if not exists vector;

create type user_role as enum ('student', 'parent', 'teacher', 'staff');
create type age_tier as enum ('u15', '15plus');
create type request_status as enum ('submitted', 'in_review', 'done');

create table schools (
  id text primary key,
  name_en text not null, name_ar text,
  area text, lat double precision, lng double precision,
  curriculum text,
  source text not null,               -- e.g. 'KHDA via Dubai Pulse'
  source_updated date
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null,
  display_name text not null,
  school_id text references schools,
  grade text,
  birth_year int,
  age_tier age_tier generated always as (
    case when birth_year is not null and extract(year from now())::int - birth_year < 15 then 'u15'::age_tier else '15plus'::age_tier end
  ) stored,
  interests text[] default '{}',
  lang text default 'en'
);

create table guardian_links (
  guardian_id uuid references profiles on delete cascade,
  child_id uuid references profiles on delete cascade,
  verified_via text not null default 'uae_pass_sim',
  created_at timestamptz default now(),
  primary key (guardian_id, child_id)
);

create table services (
  id text primary key,
  name_en text not null, name_ar text not null,
  owner_system text not null,           -- 'Al Manhal', 'Student Portal', ...
  url text, description text,
  is_demo_flow boolean default false
);

create table service_field_map (service_id text references services, field text, primary key (service_id, field));

create table profile_facts (
  child_id uuid references profiles on delete cascade,
  field text not null,                  -- 'eid_expiry', 'address_area', ...
  value text not null,
  source_doc text,
  verified_by uuid references profiles,
  verified_at timestamptz default now(),
  primary key (child_id, field)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references profiles on delete cascade,
  storage_path text not null,           -- private bucket 'documents', 5 MB, png/jpg/pdf
  kind text, extracted_json jsonb, status text default 'pending',
  created_at timestamptz default now()
);

create table service_requests (
  id uuid primary key default gen_random_uuid(),
  service_id text references services,
  requester_id uuid references profiles,
  child_id uuid references profiles,
  payload jsonb not null,
  status request_status not null default 'submitted',
  fields_retyped int default 0,
  fields_prefilled int default 0,
  updated_at timestamptz default now()
);

create table tasks_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  source_system text not null,
  title_en text not null, title_ar text,
  body text, due_at timestamptz,
  priority int default 2,
  kind text default 'notice',           -- 'proactive' | 'notice' | 'assignment' | 'exam' | 'event'
  status text default 'open',
  reason text,
  dedupe_key text unique                -- nudge idempotency, e.g. 'eid:<child_id>'
);

create table nudge_rules (
  id text primary key,                  -- 'eid_expiry_lt_30d'
  service_id text references services,
  template_en text, template_ar text
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references profiles,
  school_id text references schools,
  grade text not null,
  include_parents boolean default true,
  title text not null, body text, kind text, starts_at timestamptz,
  created_at timestamptz default now()
);
create table announcement_audience (
  announcement_id uuid references announcements on delete cascade,
  user_id uuid references profiles on delete cascade,
  seen_at timestamptz,
  primary key (announcement_id, user_id)
);

create table opportunities (
  id text primary key, school_id text references schools,
  title_en text, title_ar text, type text, starts_at timestamptz,
  interests text[], min_age int, needs_consent boolean default false
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references profiles, guardian_id uuid references profiles,
  opportunity_id text references opportunities,
  status text default 'pending', created_at timestamptz default now(), decided_at timestamptz
);

create table communities (id text primary key, name text, scope text, min_age int, moderated boolean default true);
create table posts (
  id uuid primary key default gen_random_uuid(),
  community_id text references communities, author_id uuid references profiles,
  body text, status text default 'pending', created_at timestamptz default now()
);

create table kb_documents (
  id uuid primary key default gen_random_uuid(),
  title text, source_url text not null, lang text, chunk text not null, embedding vector(1024)
);
create table ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_role text, question text, answer text, sources text[], flagged boolean default false,
  created_at timestamptz default now()
);
create table stats (metric text, value numeric, year int, source_url text, source_updated date);

-- ───────────── Row-level security ─────────────
alter table profiles enable row level security;
alter table guardian_links enable row level security;
alter table profile_facts enable row level security;
alter table documents enable row level security;
alter table service_requests enable row level security;
alter table tasks_notifications enable row level security;
alter table announcements enable row level security;
alter table announcement_audience enable row level security;
alter table approvals enable row level security;
alter table posts enable row level security;

create or replace function is_guardian_of(child uuid) returns boolean language sql stable as $$
  select exists (select 1 from guardian_links where guardian_id = auth.uid() and child_id = child)
$$;
create or replace function my_role() returns user_role language sql stable as $$
  select role from profiles where id = auth.uid()
$$;
create or replace function my_tier() returns age_tier language sql stable as $$
  select age_tier from profiles where id = auth.uid()
$$;

-- Students see themselves; guardians see linked children; staff see their school.
create policy "profiles: self, children, school staff" on profiles for select using (
  id = auth.uid() or is_guardian_of(id)
  or (my_role() in ('teacher','staff') and school_id = (select school_id from profiles where id = auth.uid()))
);
create policy "links: own" on guardian_links for select using (guardian_id = auth.uid() or child_id = auth.uid());

create policy "facts: student or guardian read" on profile_facts for select using (child_id = auth.uid() or is_guardian_of(child_id));
create policy "facts: guardian writes" on profile_facts for all using (is_guardian_of(child_id)) with check (is_guardian_of(child_id));

create policy "documents: guardian only" on documents for all using (is_guardian_of(child_id)) with check (is_guardian_of(child_id));

create policy "notifications: own or children" on tasks_notifications for select using (user_id = auth.uid() or is_guardian_of(user_id));
create policy "notifications: mark own done" on tasks_notifications for update using (user_id = auth.uid() or is_guardian_of(user_id));

create policy "requests: requester reads" on service_requests for select using (requester_id = auth.uid() or my_role() = 'staff' or my_role() = 'teacher');
create policy "requests: guardian creates" on service_requests for insert with check (requester_id = auth.uid() and is_guardian_of(child_id));
-- Only staff change status.
create policy "requests: staff update status" on service_requests for update using (my_role() in ('staff','teacher'));

create policy "announcements: teacher writes own school" on announcements for insert with check (
  teacher_id = auth.uid() and my_role() = 'teacher' and school_id = (select school_id from profiles where id = auth.uid())
);
create policy "announcements: audience reads" on announcements for select using (
  teacher_id = auth.uid() or exists (select 1 from announcement_audience a where a.announcement_id = id and (a.user_id = auth.uid() or is_guardian_of(a.user_id)))
);
create policy "audience: own rows" on announcement_audience for select using (user_id = auth.uid() or is_guardian_of(user_id));

create policy "approvals: child or guardian" on approvals for select using (child_id = auth.uid() or guardian_id = auth.uid());
create policy "approvals: child requests" on approvals for insert with check (child_id = auth.uid());
create policy "approvals: guardian decides" on approvals for update using (guardian_id = auth.uid());

-- Under-15 accounts cannot post at all — blocked in the database, not only hidden in the UI.
create policy "posts: 15+ only" on posts for insert with check (author_id = auth.uid() and my_tier() = '15plus');
create policy "posts: approved are public to members" on posts for select using (status = 'approved' or author_id = auth.uid());
