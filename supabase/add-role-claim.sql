-- Run once in Supabase -> SQL Editor (safe to run again).
-- Keeps each account's role in its secure app_metadata so sign-in can send people to the right
-- area without an extra database lookup. app_metadata can only be changed by the server, never by the user.
-- The role is used only to choose where to send you after sign-in; every page still checks your role in the database.

create or replace function public.sync_role_claim()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role::text)
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists profiles_sync_role_claim on public.profiles;
create trigger profiles_sync_role_claim
  after insert or update of role on public.profiles
  for each row execute function public.sync_role_claim();

-- Fill in the role for accounts that already exist
update auth.users u
   set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role::text)
  from public.profiles p
 where p.id = u.id;

-- Check: every account should show its role
select p.email, p.role, u.raw_app_meta_data ->> 'role' as role_in_token_data
  from public.profiles p join auth.users u on u.id = p.id;
