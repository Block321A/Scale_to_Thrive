-- =====================================================================
-- RESET TEST DATA: removes ALL applicants and enrollees.
-- PERMANENT. Cannot be undone. Run in Supabase: SQL Editor.
--
-- Deletes:  applications, enrollees (and their milestones), job applications
--           (and status history), and the login accounts of enrollees.
-- Keeps:    admins, companies and their logins, jobs, tracks, handlers.
--
-- Run step 1 first and check the numbers, then step 2, then step 3.
-- Uploaded files (resumes, photos) are NOT removed by SQL; clear them in
-- Storage (see docs/deployment-guide.md or the steps given with this file).
-- =====================================================================

-- STEP 1: PREVIEW what will be deleted
select
  (select count(*) from public.applications)                         as applications,
  (select count(*) from public.enrollees)                            as enrollees,
  (select count(*) from public.job_applications)                     as job_applications,
  (select count(*) from public.profiles where role = 'enrollee')     as enrollee_logins;

-- STEP 2: DELETE (order matters because of links between tables)
begin;
delete from public.job_applications;          -- also clears job_application_events
delete from public.enrollee_milestones;
delete from public.enrollees;
delete from public.applications;
delete from auth.users where id in (select id from public.profiles where role = 'enrollee');
commit;

-- STEP 3: CHECK. Everything above should be 0; admins and companies remain.
select
  (select count(*) from public.applications)     as applications,
  (select count(*) from public.enrollees)        as enrollees,
  (select count(*) from public.job_applications) as job_applications;
select email, role from public.profiles order by role, email;
