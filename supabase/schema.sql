-- Run once in the Supabase SQL Editor. Authorize the owner separately below.
create table if not exists public.site_owners (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.blog_posts (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  published boolean not null default false,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint blog_payload_matches_row check (
    coalesce(payload->>'id' = id, false)
    and coalesce((payload->>'published')::boolean = published, false)
    and coalesce(jsonb_typeof(payload->'i18n'->'en') = 'object', false)
    and coalesce(jsonb_typeof(payload->'story'->'en'->'blocks') = 'array', false)
    and coalesce(jsonb_typeof(payload->'tags') = 'array', false)
  )
);

alter table public.site_owners enable row level security;
alter table public.blog_posts enable row level security;

revoke all on public.site_owners from anon, authenticated;
revoke all on public.blog_posts from anon, authenticated;
grant select on public.site_owners to authenticated;
grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

drop policy if exists "Owners can recognize their account" on public.site_owners;
create policy "Owners can recognize their account"
on public.site_owners for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Visitors read published posts" on public.blog_posts;
create policy "Visitors read published posts"
on public.blog_posts for select to anon
using (published = true);

drop policy if exists "Owners manage posts" on public.blog_posts;
drop policy if exists "Signed-in readers and owners read posts" on public.blog_posts;
create policy "Signed-in readers and owners read posts"
on public.blog_posts for select to authenticated
using (published = true
  or exists (select 1 from public.site_owners where user_id = (select auth.uid())));

drop policy if exists "Owners insert posts" on public.blog_posts;
create policy "Owners insert posts"
on public.blog_posts for insert to authenticated
with check (exists (select 1 from public.site_owners where user_id = (select auth.uid())));

drop policy if exists "Owners update posts" on public.blog_posts;
create policy "Owners update posts"
on public.blog_posts for update to authenticated
using (exists (select 1 from public.site_owners where user_id = (select auth.uid())))
with check (exists (select 1 from public.site_owners where user_id = (select auth.uid())));

drop policy if exists "Owners delete posts" on public.blog_posts;
create policy "Owners delete posts"
on public.blog_posts for delete to authenticated
using (exists (select 1 from public.site_owners where user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owners upload blog images" on storage.objects;
create policy "Owners upload blog images"
on storage.objects for insert to authenticated
with check (bucket_id = 'blog-images'
  and exists (select 1 from public.site_owners where user_id = (select auth.uid())));

-- After creating your account in Authentication > Users, copy its UUID and run:
-- insert into public.site_owners (user_id) values ('YOUR-USER-UUID');
-- Never grant browser clients permission to insert into site_owners.
