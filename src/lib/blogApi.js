const baseUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const SESSION_KEY = "portfolio:owner-session";
export const isBlogConfigured = Boolean(baseUrl && publicKey);

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
  catch { return null; }
}

let session = readSession();
let refreshing = null;

function storeSession(value) {
  if (value && !value.expires_at) value.expires_at = Math.floor(Date.now() / 1000) + (value.expires_in || 3600);
  session = value;
  if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
  else localStorage.removeItem(SESSION_KEY);
}

async function request(path, { token, headers = {}, ...options } = {}) {
  if (!isBlogConfigured) throw new Error("blogNotConfigured");
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { apikey: publicKey, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.text();
  let result;
  try { result = body ? JSON.parse(body) : null; } catch { result = null; }
  if (!response.ok) {
    if (response.status === 401) { storeSession(null); throw new Error("blogSessionExpired"); }
    throw new Error(result?.msg || result?.message || result?.error_description || "blogRequestFailed");
  }
  return result;
}

async function accessToken() {
  if (!session) throw new Error("blogSessionExpired");
  if (session.expires_at * 1000 > Date.now() + 60000) return session.access_token;
  if (!refreshing) refreshing = request("/auth/v1/token?grant_type=refresh_token", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  }).then((value) => { storeSession(value); return value.access_token; })
    .catch((error) => { storeSession(null); throw error; })
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function signInOwner(email, password) {
  const value = await request("/auth/v1/token?grant_type=password", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  storeSession(value);
  try {
    const owner = await getOwner();
    if (!owner) throw new Error("blogNotOwner");
    return owner;
  } catch (error) { await signOutOwner(); throw error; }
}

export async function signOutOwner() {
  try {
    if (session) await request("/auth/v1/logout", { method: "POST", token: await accessToken() });
  } catch { /* Local sign-out must still succeed if the network is unavailable. */ }
  finally { storeSession(null); }
}

export async function getOwner() {
  if (!session || !isBlogConfigured) return null;
  const token = await accessToken();
  const owners = await request(`/rest/v1/site_owners?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`, { token });
  return owners.length ? session.user : null;
}

export async function listPublishedPosts() {
  const rows = await request("/rest/v1/blog_posts?select=payload&published=eq.true&order=updated_at.desc");
  return rows.map((row) => row.payload);
}

export async function getPublishedPost(id) {
  const rows = await request(`/rest/v1/blog_posts?select=payload&published=eq.true&id=eq.${encodeURIComponent(id)}`);
  return rows[0]?.payload || null;
}

export async function listOwnerPosts() {
  const rows = await request("/rest/v1/blog_posts?select=payload&order=updated_at.desc", { token: await accessToken() });
  return rows.map((row) => row.payload);
}

export async function savePost(post) {
  return request("/rest/v1/blog_posts?on_conflict=id", {
    token: await accessToken(), method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ id: post.id, published: post.published, payload: post, updated_at: new Date().toISOString() }),
  });
}

export async function deletePost(id) {
  const rows = await request(`/rest/v1/blog_posts?id=eq.${encodeURIComponent(id)}`, {
    token: await accessToken(), method: "DELETE", headers: { Prefer: "return=representation" },
  });
  if (!rows?.length) throw new Error("blogRequestFailed");
}

export async function uploadPostImage(file) {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 10 * 1024 * 1024) {
    throw new Error("blogInvalidImage");
  }
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[file.type];
  const path = `${crypto.randomUUID()}.${extension}`;
  await request(`/storage/v1/object/blog-images/${path}`, {
    method: "POST", token: await accessToken(), headers: { "Content-Type": file.type }, body: file,
  });
  return `${baseUrl}/storage/v1/object/public/blog-images/${path}`;
}
