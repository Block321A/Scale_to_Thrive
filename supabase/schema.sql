-- =====================================================================
-- Scale to Thrive: Supabase schema
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to read top to bottom. See docs/deployment-guide.md for the steps.
-- =====================================================================

-- ---------- Types ----------------------------------------------------
create type public.user_role as enum ('admin', 'company', 'enrollee');
create type public.application_status as enum ('pending', 'shortlisted', 'finalized', 'rejected');
create type public.milestone_status as enum ('not_started', 'in_progress', 'completed');
create type public.job_status as enum ('open', 'closed');
create type public.job_stage as enum ('applied', 'shortlisted', 'interview', 'offered', 'selected', 'rejected');

-- ---------- Helper: keep updated_at fresh ----------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Profiles (one row per login: admin, company or enrollee) --
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null default 'enrollee',
  full_name   text,
  email       text not null,
  phone       text,
  photo_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role helpers (security definer so policies can call them without recursion)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Create a profile whenever an auth user is created.
-- The role comes from raw_app_meta_data, which only the server (service role)
-- can set. raw_user_meta_data is user-editable, so it is NOT trusted for roles.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, email, full_name)
  values (
    new.id,
    coalesce((new.raw_app_meta_data ->> 'role')::public.user_role, 'enrollee'),
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Tracks (IT, Non-IT) --------------------------------------
create table public.tracks (
  id                 text primary key,            -- 'it' | 'non-it'
  name               text not null,
  tagline            text,
  summary            text,
  hours_total        int  not null,
  hours_per_week     int  not null,
  opening_date       date,                         -- admin editable
  seats_total        int  not null default 0 check (seats_total >= 0),  -- admin editable
  applications_open  boolean not null default false,                    -- admin editable
  updated_at         timestamptz not null default now()
);
create trigger tracks_updated before update on public.tracks
  for each row execute function public.set_updated_at();

-- Workshop handlers shown per track (admin editable)
create table public.handlers (
  id           bigint generated always as identity primary key,
  track_id     text not null references public.tracks(id) on delete cascade,
  name         text not null,
  designation  text,
  org          text,
  photo_url    text,
  sort_order   int not null default 0
);
create index on public.handlers (track_id, sort_order);

-- The 12 weekly milestones of each track
create table public.track_milestones (
  track_id  text not null references public.tracks(id) on delete cascade,
  week      int  not null check (week between 1 and 12),
  title     text not null,
  details   text,
  primary key (track_id, week)
);

-- ---------- Applications (submitted from the public home page) -------
create table public.applications (
  id               uuid primary key default gen_random_uuid(),
  track_id         text not null references public.tracks(id),
  status           public.application_status not null default 'pending',
  full_name        text not null,
  email            text not null,
  phone            text not null,
  date_of_birth    date,
  gender           text,
  city_state       text,
  college          text not null,
  answers          jsonb not null default '{}'::jsonb,   -- track specific answers
  reason           text not null,
  career_goal      text,
  heard_from       text,
  resume_path      text,                                  -- storage path in 'resumes'
  photo_path       text,                                  -- storage path in 'photos'
  confirmed_eligibility  boolean not null check (confirmed_eligibility),
  confirmed_attendance   boolean not null check (confirmed_attendance),
  confirmed_no_guarantee boolean not null check (confirmed_no_guarantee),
  consent_data_sharing   boolean not null check (consent_data_sharing),
  user_id          uuid references public.profiles(id),   -- set when finalized
  reviewed_by      uuid references public.profiles(id),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger applications_updated before update on public.applications
  for each row execute function public.set_updated_at();
create index on public.applications (track_id, status);
-- One live application per email per track (rejected ones may re-apply)
create unique index applications_one_live_per_track
  on public.applications (lower(email), track_id)
  where status <> 'rejected';

-- ---------- Enrollees (finalized applicants) -------------------------
create table public.enrollees (
  id              uuid primary key references public.profiles(id) on delete cascade,
  application_id  uuid not null unique references public.applications(id),
  track_id        text not null references public.tracks(id),
  college         text not null,
  city_state      text,
  date_of_birth   date,
  gender          text,
  career_goal     text,
  github_url      text,
  resume_path     text,
  details         jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger enrollees_updated before update on public.enrollees
  for each row execute function public.set_updated_at();

create table public.enrollee_milestones (
  enrollee_id  uuid not null references public.enrollees(id) on delete cascade,
  track_id     text not null,
  week         int  not null,
  status       public.milestone_status not null default 'not_started',
  updated_by   uuid references public.profiles(id),
  updated_at   timestamptz not null default now(),
  primary key (enrollee_id, week),
  foreign key (track_id, week) references public.track_milestones (track_id, week)
);

-- ---------- Companies and jobs ---------------------------------------
create table public.companies (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.profiles(id) on delete cascade,  -- one login per company
  name         text not null,
  email        text not null unique,
  description  text,
  logo_path    text,                            -- storage path in 'logos'
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger companies_updated before update on public.companies
  for each row execute function public.set_updated_at();

create or replace function public.my_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.companies where user_id = auth.uid();
$$;

create table public.jobs (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references public.companies(id) on delete cascade,  -- null for admin "Special" jobs
  is_special    boolean not null default false,
  posted_by     uuid not null references public.profiles(id),
  title         text not null,
  description   text not null,
  location      text,
  track_id      text references public.tracks(id),   -- null = relevant to both tracks
  apply_by      date,
  external_url  text,
  status        public.job_status not null default 'open',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- company jobs have a company; admin special jobs do not
  check ((is_special and company_id is null) or (not is_special and company_id is not null))
);
create trigger jobs_updated before update on public.jobs
  for each row execute function public.set_updated_at();
create index on public.jobs (status, track_id);
create index on public.jobs (company_id);

create table public.job_applications (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references public.jobs(id) on delete cascade,
  enrollee_id  uuid not null references public.enrollees(id) on delete cascade,
  stage        public.job_stage not null default 'applied',
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (job_id, enrollee_id)
);
create trigger job_applications_updated before update on public.job_applications
  for each row execute function public.set_updated_at();
create index on public.job_applications (enrollee_id);

-- Every stage change is recorded. The app sends the applicant an email
-- for each new row here (server side).
create table public.job_application_events (
  id                  bigint generated always as identity primary key,
  job_application_id  uuid not null references public.job_applications(id) on delete cascade,
  stage               public.job_stage not null,
  changed_by          uuid references public.profiles(id),
  email_sent_at       timestamptz,
  created_at          timestamptz not null default now()
);

-- Log the first stage and every change; limit what companies may edit.
create or replace function public.job_application_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.job_application_events (job_application_id, stage, changed_by)
    values (new.id, new.stage, auth.uid());
    return new;
  end if;

  -- UPDATE: companies may only change the stage
  if not public.is_admin()
     and (new.job_id <> old.job_id or new.enrollee_id <> old.enrollee_id or new.note is distinct from old.note) then
    raise exception 'Only the stage can be changed';
  end if;
  if new.stage <> old.stage then
    insert into public.job_application_events (job_application_id, stage, changed_by)
    values (new.id, new.stage, auth.uid());
  end if;
  return new;
end $$;
create trigger job_application_guard_ins after insert on public.job_applications
  for each row execute function public.job_application_guard();
create trigger job_application_guard_upd before update on public.job_applications
  for each row execute function public.job_application_guard();

-- Can the signed-in company see this enrollee? (only people who applied to its jobs)
create or replace function public.company_can_view_enrollee(eid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.job_applications ja
    join public.jobs j on j.id = ja.job_id
    where ja.enrollee_id = eid and j.company_id = public.my_company_id()
  );
$$;

-- ---------- Seats: finalize an application (admin only) --------------
-- Blocks finalizing when the track has no seats left.
create or replace function public.seats_left(tid text)
returns int language sql stable security definer set search_path = public as $$
  select t.seats_total - (select count(*) from public.applications a
                          where a.track_id = t.id and a.status = 'finalized')
  from public.tracks t where t.id = tid;
$$;

-- Public (home page) view of intake numbers without exposing applicants.
create or replace function public.track_intake()
returns table (track_id text, seats_total int, seats_left int, applications_open boolean, opening_date date)
language sql stable security definer set search_path = public as $$
  select t.id, t.seats_total, public.seats_left(t.id), t.applications_open, t.opening_date from public.tracks t;
$$;

create or replace function public.finalize_application(app_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare a public.applications;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  select * into a from public.applications where id = app_id for update;
  if a.id is null then raise exception 'Application not found'; end if;
  if a.status = 'finalized' then return; end if;
  if public.seats_left(a.track_id) <= 0 then raise exception 'No seats left for this track'; end if;
  update public.applications
     set status = 'finalized', reviewed_by = auth.uid(), reviewed_at = now()
   where id = app_id;
end $$;

-- Called by the server after the invite user exists: builds the enrollee profile
-- and the 12 milestone rows. (Server uses the service role, which bypasses RLS.)
create or replace function public.create_enrollee(app_id uuid, uid uuid)
returns void language plpgsql security definer set search_path = public as $$
declare a public.applications;
begin
  select * into a from public.applications where id = app_id and status = 'finalized';
  if a.id is null then raise exception 'Application is not finalized'; end if;

  update public.profiles
     set full_name = a.full_name, phone = a.phone, role = 'enrollee'
   where id = uid;
  update public.applications set user_id = uid where id = app_id;

  insert into public.enrollees (id, application_id, track_id, college, city_state, date_of_birth,
                                gender, career_goal, github_url, resume_path, details)
  values (uid, a.id, a.track_id, a.college, a.city_state, a.date_of_birth, a.gender, a.career_goal,
          a.answers ->> 'github_url', a.resume_path, a.answers)
  on conflict (id) do nothing;

  insert into public.enrollee_milestones (enrollee_id, track_id, week)
  select uid, m.track_id, m.week from public.track_milestones m where m.track_id = a.track_id
  on conflict do nothing;
end $$;
revoke execute on function public.create_enrollee(uuid, uuid) from public, anon, authenticated;

-- ---------- Row level security ---------------------------------------
alter table public.profiles              enable row level security;
alter table public.tracks                enable row level security;
alter table public.handlers              enable row level security;
alter table public.track_milestones      enable row level security;
alter table public.applications          enable row level security;
alter table public.enrollees             enable row level security;
alter table public.enrollee_milestones   enable row level security;
alter table public.companies             enable row level security;
alter table public.jobs                  enable row level security;
alter table public.job_applications      enable row level security;
alter table public.job_application_events enable row level security;

-- Profiles
create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "admin reads profiles" on public.profiles for select to authenticated using (public.is_admin());
create policy "company reads applicants" on public.profiles for select to authenticated
  using (public.company_can_view_enrollee(id));
create policy "admin edits profiles" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
-- Users may edit their own name, phone and photo (never their role)
create policy "edit own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Tracks, handlers, milestones: public read, admin write
create policy "public reads tracks" on public.tracks for select to anon, authenticated using (true);
create policy "admin writes tracks" on public.tracks for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads handlers" on public.handlers for select to anon, authenticated using (true);
create policy "admin writes handlers" on public.handlers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads milestones" on public.track_milestones for select to anon, authenticated using (true);
create policy "admin writes milestones" on public.track_milestones for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Applications: anyone may submit while the track is open; only admins read or review
create policy "apply when open" on public.applications for insert to anon, authenticated
  with check (status = 'pending' and user_id is null and reviewed_by is null
              and exists (select 1 from public.tracks t where t.id = track_id and t.applications_open));
create policy "admin reads applications" on public.applications for select to authenticated using (public.is_admin());
create policy "admin updates applications" on public.applications for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "own application" on public.applications for select to authenticated using (user_id = auth.uid());

-- Enrollees and their milestones
create policy "own enrollee" on public.enrollees for select to authenticated using (id = auth.uid());
create policy "admin reads enrollees" on public.enrollees for select to authenticated using (public.is_admin());
create policy "company reads applicant enrollees" on public.enrollees for select to authenticated
  using (public.company_can_view_enrollee(id));
create policy "admin writes enrollees" on public.enrollees for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "own milestones" on public.enrollee_milestones for select to authenticated using (enrollee_id = auth.uid());
create policy "admin writes milestones rows" on public.enrollee_milestones for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Companies: signed-in users see company name/logo; admins manage; a company edits itself
create policy "signed in reads companies" on public.companies for select to authenticated using (true);
create policy "admin writes companies" on public.companies for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "company edits itself" on public.companies for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Jobs
create policy "signed in reads open jobs" on public.jobs for select to authenticated
  using (status = 'open' or company_id = public.my_company_id() or public.is_admin());
create policy "company posts jobs" on public.jobs for insert to authenticated
  with check (company_id = public.my_company_id() and not is_special and posted_by = auth.uid());
create policy "company edits own jobs" on public.jobs for update to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id() and not is_special);
create policy "company deletes own jobs" on public.jobs for delete to authenticated using (company_id = public.my_company_id());
create policy "admin writes jobs" on public.jobs for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Job applications
create policy "enrollee applies" on public.job_applications for insert to authenticated
  with check (enrollee_id = auth.uid() and stage = 'applied'
              and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'open'
                          and (j.apply_by is null or j.apply_by >= current_date)));
create policy "enrollee reads own" on public.job_applications for select to authenticated using (enrollee_id = auth.uid());
create policy "company reads its applicants" on public.job_applications for select to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.company_id = public.my_company_id()));
create policy "company moves stage" on public.job_applications for update to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.company_id = public.my_company_id()))
  with check (exists (select 1 from public.jobs j where j.id = job_id and j.company_id = public.my_company_id()));
create policy "admin all job applications" on public.job_applications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Events are read by the parties involved; written only by the trigger
create policy "admin reads events" on public.job_application_events for select to authenticated using (public.is_admin());
create policy "enrollee reads own events" on public.job_application_events for select to authenticated
  using (exists (select 1 from public.job_applications ja where ja.id = job_application_id and ja.enrollee_id = auth.uid()));

-- Callable by the browser
grant execute on function public.track_intake() to anon, authenticated;
grant execute on function public.finalize_application(uuid) to authenticated;

-- ---------- Storage buckets -----------------------------------------
-- logos and photos are public (shown on the site); resumes are private.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('logos',   'logos',   true,  2097152, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('photos',  'photos',  true,  2097152, array['image/png','image/jpeg','image/webp']),
  ('resumes', 'resumes', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

create policy "public reads logos"  on storage.objects for select to anon, authenticated using (bucket_id = 'logos');
create policy "public reads photos" on storage.objects for select to anon, authenticated using (bucket_id = 'photos');
create policy "admin writes logos"  on storage.objects for all to authenticated
  using (bucket_id = 'logos' and public.is_admin()) with check (bucket_id = 'logos' and public.is_admin());
-- Applicants are not signed in, so they may upload into applications/ only
create policy "applicants upload resume" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = 'applications');
create policy "applicants upload photo" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = 'applications');
create policy "admin reads resumes" on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and public.is_admin());
-- (Companies download applicant resumes through short-lived signed URLs created on the server.)

-- ---------- Seed data -------------------------------------------------
insert into public.tracks (id, name, tagline, summary, hours_total, hours_per_week, opening_date, seats_total, applications_open) values
  ('it', 'IT', 'Master the skills. Build your future.',
   'Linux administration, Python automation and junior Python development, with REST API, PostgreSQL, Git, AWS S3 and AI productivity skills.',
   96, 8, '2026-12-15', 60, true),
  ('non-it', 'Non-IT', 'Turn spreadsheet skills into career opportunities.',
   'Advanced Excel, MIS reporting and business data analysis, combined with a weekly communication module, for business and corporate roles.',
   60, 5, '2026-12-15', 60, false);

insert into public.handlers (track_id, name, designation, org, sort_order) values
  ('it',     'Dr. Arjun U', 'HOD of CE · Principal VGST Project Handler', 'PES ITM and PES Center of Excellence', 1),
  ('it',     'Prajwal A',   'VGST Project Assistant · SDE Research Analyst', 'PES Center of Excellence', 2),
  ('non-it', 'Dr. Arjun U', 'HOD of CE · Principal VGST Project Handler', 'PES ITM and PES Center of Excellence', 1),
  ('non-it', 'Prajwal A',   'VGST Project Assistant · SDE Research Analyst', 'PES Center of Excellence', 2);

insert into public.track_milestones (track_id, week, title, details) values
  ('it', 1,  'Linux Fundamentals', 'Distributions, lab setup, terminal, commands, file-system navigation.'),
  ('it', 2,  'Linux Administration', 'Users, groups, sudo, permissions, ownership, package management.'),
  ('it', 3,  'Advanced Linux Administration', 'Processes, services, systemd, SSH, networking, storage, logs.'),
  ('it', 4,  'Shell Scripting', 'Bash variables, input/output, conditions, loops, functions.'),
  ('it', 5,  'Shell Automation', 'grep, awk, sed, find, cron, backups, monitoring scripts.'),
  ('it', 6,  'Python Fundamentals', 'Data types, conditions, loops, functions, collections.'),
  ('it', 7,  'Intermediate Python', 'OOP, modules, exceptions, files, CSV, JSON, Git basics.'),
  ('it', 8,  'Python Automation', 'pathlib, shutil, subprocess, regex, logging, task automation.'),
  ('it', 9,  'PostgreSQL & REST API', 'SQL, CRUD, joins, HTTP methods, status codes, Postman, Requests.'),
  ('it', 10, 'Python Integration & Testing', 'Database connectivity, API integration, reusable code, testing.'),
  ('it', 11, 'AWS S3 & Integration Projects', 'S3, IAM basics, AWS CLI, Boto3, integrated project.'),
  ('it', 12, 'AI for IT Professionals', 'AI-assisted workflows, debugging, test generation, safe validation.'),
  ('non-it', 1,  'Excel Foundations', 'Workbooks, tables, references, formatting, shortcuts.'),
  ('non-it', 2,  'Data Entry & Cleaning', 'Sorting, filtering, duplicates, Text to Columns, Flash Fill.'),
  ('non-it', 3,  'Formula Fundamentals', 'References, IF, IFS, AND, OR, error handling.'),
  ('non-it', 4,  'Conditional & Summary Formulas', 'SUMIFS, COUNTIFS, AVERAGEIFS, SUBTOTAL.'),
  ('non-it', 5,  'Lookup Functions', 'VLOOKUP, HLOOKUP, XLOOKUP, INDEX, MATCH.'),
  ('non-it', 6,  'Text, Date & Logical Functions', 'LEFT, MID, TEXTJOIN, EOMONTH, NETWORKDAYS.'),
  ('non-it', 7,  'Data Validation & Conditional Formatting', 'Dropdowns, input rules, highlighting exceptions.'),
  ('non-it', 8,  'PivotTables & PivotCharts', 'Summaries, grouping, slicers, refreshable reports.'),
  ('non-it', 9,  'Dashboard Development', 'KPIs, charts, layouts, communicating findings.'),
  ('non-it', 10, 'Power Query', 'Import, clean, merge and append, refresh.'),
  ('non-it', 11, 'Macros & VBA Introduction', 'Record macros, the VBA editor, safe automation.'),
  ('non-it', 12, 'Integrated Projects & Assessment', 'Business reporting project, presentation, assessment.');

-- The first admin is NOT created here. See docs/deployment-guide.md, step 3.

-- The server (service role) calls this to build an enrollee after the invite is sent.
grant execute on function public.create_enrollee(uuid, uuid) to service_role;
