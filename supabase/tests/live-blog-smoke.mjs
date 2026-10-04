// Run explicitly against the configured project: node supabase/tests/live-blog-smoke.mjs.
// Credentials stay in the gitignored .env; temporary post data is removed afterward.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const env = Object.fromEntries((await readFile(new URL('../../.env', import.meta.url), 'utf8'))
  .split(/\r?\n/).filter((line) => /^[A-Z_]+=/.test(line)).map((line) => {
    const index = line.indexOf('='); return [line.slice(0, index), line.slice(index + 1)];
  }));
const base = env.VITE_SUPABASE_URL;
const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
assert.ok(base && publicKey && env.BLOG_OWNER_EMAIL && env.BLOG_OWNER_INITIAL_PASSWORD,
  'Configure the project and owner credentials in .env before this explicit live check');
let session;
const id = `setup-check-${randomUUID()}`;

async function request(path, { owner = false, ...options } = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { apikey: publicKey, ...(owner ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Live check failed: ${options.method || 'GET'} ${path.split('?')[0]} (${response.status})`);
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}
async function save(post) {
  await request('/rest/v1/blog_posts?on_conflict=id', {
    owner: true, method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ id, published: post.published, payload: post }),
  });
}
async function visible() {
  return (await request(`/rest/v1/blog_posts?select=id&id=eq.${id}`)).length;
}

try {
  session = await request('/auth/v1/token?grant_type=password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.BLOG_OWNER_EMAIL, password: env.BLOG_OWNER_INITIAL_PASSWORD }),
  });
  assert.equal(session.user.email, env.BLOG_OWNER_EMAIL);
  const membership = await request(`/rest/v1/site_owners?select=user_id&user_id=eq.${session.user.id}`, { owner: true });
  assert.equal(membership.length, 1, 'the account has owner access');
  const post = { id, published: false, tags: ['Setup verification'],
    i18n: { en: { title: 'Temporary setup verification', summary: 'Removed after verification.' } },
    story: { en: { blocks: [{ type: 'p', text: 'Live draft and publishing check.' }] } } };
  await save(post);
  assert.equal(await visible(), 0, 'anonymous visitors cannot see the draft');
  const privateRows = await request(`/rest/v1/blog_posts?select=id&id=eq.${id}`, { owner: true });
  assert.equal(privateRows.length, 1, 'owner can read the draft');
  await save({ ...post, published: true });
  assert.equal(await visible(), 1, 'publishing makes the post visible');
  await save(post);
  assert.equal(await visible(), 0, 'unpublishing hides it again');
  session = await request('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  assert.equal(session.user.email, env.BLOG_OWNER_EMAIL, 'the session refreshes successfully');
  console.log('PASS: live owner login, membership, private draft, publish, unpublish, and token refresh');
} finally {
  if (session) {
    try {
      await request(`/rest/v1/blog_posts?id=eq.${id}`, { owner: true, method: 'DELETE' });
      assert.equal(await visible(), 0, 'temporary post was removed');
    } finally {
      await request('/auth/v1/logout', { owner: true, method: 'POST' });
    }
  }
}
