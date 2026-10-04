-- Run against a Supabase test database after schema.sql (supabase test db).
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(15);

insert into auth.users (id, email) values
('11111111-1111-4111-8111-111111111111', 'blog-owner-policy-test@example.invalid'),
('22222222-2222-4222-8222-222222222222', 'blog-reader-policy-test@example.invalid');
insert into public.site_owners values ('11111111-1111-4111-8111-111111111111');
insert into public.blog_posts (id, published, payload) values
('policy-test-public', true, '{"id":"policy-test-public","published":true,"tags":[],"i18n":{"en":{}},"story":{"en":{"blocks":[]}}}'),
('policy-test-draft', false, '{"id":"policy-test-draft","published":false,"tags":[],"i18n":{"en":{}},"story":{"en":{"blocks":[]}}}');

set local role anon;
select extensions.is((select count(*)::integer from public.blog_posts where id like 'policy-test-%'), 1, 'anonymous visitors see only published posts');
select extensions.ok(not has_table_privilege('anon', 'public.blog_posts', 'INSERT'), 'anonymous visitors cannot insert');
select extensions.ok(not has_table_privilege('anon', 'public.site_owners', 'SELECT'), 'anonymous visitors cannot read owner accounts');
select extensions.ok(not has_table_privilege('anon', 'public.site_owners', 'INSERT'), 'anonymous visitors cannot promote accounts');

reset role;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
set local role authenticated;
select extensions.is((select count(*)::integer from public.blog_posts where id = 'policy-test-draft'), 0, 'signed-in non-owner cannot read drafts');
select extensions.is((select count(*)::integer from public.site_owners), 0, 'signed-in non-owner has no owner membership');
select extensions.throws_ok($q$insert into public.blog_posts (id,published,payload) values ('policy-test-forbidden',false,'{"id":"policy-test-forbidden","published":false,"tags":[],"i18n":{"en":{}},"story":{"en":{"blocks":[]}}}')$q$, '42501', null, 'signed-in non-owner cannot create a post');
with changed as (update public.blog_posts set updated_at = now() where id='policy-test-public' returning id)
select extensions.is((select count(*)::integer from changed), 0, 'signed-in non-owner cannot update a post');
select extensions.throws_ok($q$insert into storage.objects (bucket_id,name) values ('blog-images','policy-tests/forbidden.png')$q$, '42501', null, 'signed-in non-owner cannot upload images');

reset role;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
set local role authenticated;
select extensions.is((select count(*)::integer from public.blog_posts where id like 'policy-test-%'), 2, 'owner can read drafts and published posts');
select extensions.is((select count(*)::integer from public.site_owners), 1, 'owner recognizes their membership');
select extensions.lives_ok($q$insert into public.blog_posts (id,published,payload) values ('policy-test-new',false,'{"id":"policy-test-new","published":false,"tags":[],"i18n":{"en":{}},"story":{"en":{"blocks":[]}}}')$q$, 'owner can save a draft');
select extensions.lives_ok($q$update public.blog_posts set published=true, payload=jsonb_set(payload,'{published}','true') where id='policy-test-draft'$q$, 'owner can publish a draft');
select extensions.lives_ok($q$insert into storage.objects (bucket_id,name) values ('blog-images','policy-tests/allowed.png')$q$, 'owner can upload images');

reset role;
select set_config('request.jwt.claims', '{}', true);
set local role anon;
select extensions.is((select count(*)::integer from public.blog_posts where id like 'policy-test-%'), 2, 'newly published post is visible to visitors and unsaved draft stays private');
reset role;
select * from extensions.finish();
rollback;
