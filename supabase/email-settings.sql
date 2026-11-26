-- =====================================================================
-- Email settings: lets admins enter SMTP details in the website
-- (Admin -> Settings) instead of Vercel. Run once in Supabase: SQL Editor.
-- The app password is stored encrypted in Supabase Vault and can only be
-- read by the website's server (service role), never by browsers.
-- =====================================================================

-- Plain (non-secret) settings: host, port, username, sender name
create table if not exists public.app_settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles(id)
);
alter table public.app_settings enable row level security;
drop policy if exists "admin manages settings" on public.app_settings;
create policy "admin manages settings" on public.app_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Secret storage (Vault). Only the server's service role may call these.
create or replace function public.set_app_secret(secret_name text, secret_value text)
returns void language plpgsql security definer set search_path = public, vault as $$
declare existing uuid;
begin
  select id into existing from vault.secrets where name = secret_name;
  if existing is null then
    perform vault.create_secret(secret_value, secret_name);
  else
    perform vault.update_secret(existing, secret_value, secret_name);
  end if;
end $$;

create or replace function public.get_app_secret(secret_name text)
returns text language sql security definer set search_path = public, vault as $$
  select decrypted_secret from vault.decrypted_secrets where name = secret_name limit 1;
$$;

create or replace function public.has_app_secret(secret_name text)
returns boolean language sql security definer set search_path = public, vault as $$
  select exists (select 1 from vault.secrets where name = secret_name);
$$;

revoke all on function public.set_app_secret(text, text) from public, anon, authenticated;
revoke all on function public.get_app_secret(text)       from public, anon, authenticated;
revoke all on function public.has_app_secret(text)       from public, anon, authenticated;
grant execute on function public.set_app_secret(text, text) to service_role;
grant execute on function public.get_app_secret(text)       to service_role;
grant execute on function public.has_app_secret(text)       to service_role;
