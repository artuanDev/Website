-- Run after schema.sql and after creating the website's Auth user.
-- This authorizes the requested email; it does not create an account or password.
begin;
do $owner$
declare
  owner_user_id uuid;
begin
  select id into strict owner_user_id
  from auth.users
  where lower(email) = lower('OWNER_EMAIL_HERE');

  insert into public.site_owners (user_id)
  values (owner_user_id)
  on conflict (user_id) do nothing;
exception
  when no_data_found then
    raise exception 'Create the website Auth user before activating owner access.';
  when too_many_rows then
    raise exception 'Multiple Auth users match the supplied email. Resolve the duplicate accounts before activating owner access.';
end;
$owner$;
commit;
