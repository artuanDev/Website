// No browser automation dependency: drive a local Chromium through its DevTools API.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer as netServer } from "node:net";
import { createServer as httpServer } from "node:http";
import { createServer as viteServer } from "vite";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1"));
const initial = JSON.parse(await readFile(join(root, "src/data/blog/faking-water-caustics.json"), "utf8"));
const artifacts = await mkdtemp(join(tmpdir(), "portfolio-blog-smoke-"));
const chrome = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
await access(chrome);
const freePort = () => new Promise((resolvePort) => {
  const server = netServer().listen(0, "127.0.0.1", () => {
    const port = server.address().port;
    server.close(() => resolvePort(port));
  });
});
const port = await freePort();
const browser = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  `--remote-debugging-port=${port}`, `--user-data-dir=${join(artifacts, "profile")}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket, vite, production;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  let target;
  for (let i = 0; i < 100 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((page) => page.type === "page"); }
    catch { await delay(100); }
  }
  assert.ok(target, "Chromium started");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, reject) => { socket.onopen = done; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map(), errors = [];
  socket.onmessage = (event) => {
    const result = JSON.parse(event.data);
    if (result.id) {
      const promise = pending.get(result.id); pending.delete(result.id);
      if (!promise) return;
      if (result.error) promise.reject(new Error(result.error.message)); else promise.resolve(result.result);
    } else if (result.method === "Runtime.exceptionThrown") errors.push(result.params.exceptionDetails.text + ": " + (result.params.exceptionDetails.exception?.description || ""));
  };
  function command(method, params = {}) {
    return new Promise((resolveCommand, reject) => {
      const id = ++sequence; pending.set(id, { resolve: resolveCommand, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || expression);
    return result.result.value;
  }
  async function wait(expression) {
    for (let i = 0; i < 120; i++) {
      if (await evaluate(expression)) return;
      await delay(50);
    }
    throw new Error(`Timed out: ${expression}`);
  }
  const click = (text, selector = "button") => evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find(el => el.textContent.trim() === ${JSON.stringify(text)}).click()`);
  const fill = (id, value) => evaluate(`{ const el=document.getElementById(${JSON.stringify(id)}); el.value=${JSON.stringify(value)}; el.dispatchEvent(new Event('input',{bubbles:true})); }`);
  const route = async (hash, selector) => { await evaluate(`location.hash=${JSON.stringify(hash)}`); await wait(`!!document.querySelector(${JSON.stringify(selector)})`); };
  await command("Page.enable"); await command("Runtime.enable");
  await command("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await command("Page.addScriptToEvaluateOnNewDocument", { source: `localStorage.setItem('portfolio:lang','en'); localStorage.setItem('portfolio:three-background','off');` });

  // First verify the built site with either the configured login or setup state.
  production = httpServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const path = resolve(root, "dist", pathname === "/" ? "index.html" : `.${pathname}`);
    if (!path.startsWith(join(root, "dist"))) { response.writeHead(403).end(); return; }
    try {
      const file = await readFile(path);
      const ext = path.split(".").pop();
      response.setHeader("Content-Type", ({ html: "text/html", js: "text/javascript", css: "text/css", png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml" })[ext] || "application/octet-stream");
      response.end(file);
    } catch { response.writeHead(404).end(); }
  }).listen(0, "127.0.0.1");
  await new Promise((done) => production.once("listening", done));
  await command("Page.navigate", { url: `http://127.0.0.1:${production.address().port}/#/blog` });
  await wait("document.querySelectorAll('.article-card').length === 1");
  await click("Unity", ".tag-filter button");
  assert.equal(await evaluate("document.querySelectorAll('.article-card').length"), 1);
  await click("Faking caustic highlights for water", ".article-card h3");
  await wait("!!document.querySelector('.article-body')");
  assert.equal(await evaluate("document.querySelectorAll('.article-body figure').length"), 2);
  await wait("document.querySelector('.article-body img').complete && document.querySelector('.article-body img').naturalWidth > 0");
  const screenshot = await command("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(join(artifacts, "blog-desktop.png"), Buffer.from(screenshot.data, "base64"));
  await route("#/write", ".blog-writer");
  assert.ok(await evaluate("!!document.querySelector('.writer-login') || document.querySelector('.blog-writer').textContent.includes('awaiting account setup')"), "writer shows sign-in when configured or setup instructions otherwise");
  await route("#/portfolio", ".portfolio-grid");
  await click("Unity", ".tag-filter button");
  assert.equal(await evaluate("document.querySelectorAll('.project-card').length"), 3);
  await click("Work", "#portfolio .filter-bar:first-of-type button");
  assert.equal(await evaluate("document.querySelectorAll('.project-card').length"), 0);
  assert.ok(await evaluate("!!document.querySelector('.collection-empty')"));
  await click("All", "#portfolio .filter-bar:first-of-type button");
  await route("#/articles", ".articles-grid");
  await click("Python", ".tag-filter button");
  assert.equal(await evaluate("document.querySelectorAll('.article-card').length"), 1);
  assert.ok((await evaluate("document.querySelector('.article-card h3').textContent")).includes("Cross"));
  await click("The Cross Product", ".article-card h3");
  await wait("!!document.querySelector('.article-body')");
  await click("ES", ".lang-option");
  await wait("document.querySelector('.article-hero h1')?.textContent === 'El Producto Vectorial'");
  await click("EN", ".lang-option");
  for (const width of [1280, 1024, 800, 721, 390]) {
    await command("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    await route("#/blog", ".articles-grid");
    assert.ok(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), `no horizontal overflow at ${width}px`);
    if (width > 900) assert.ok(await evaluate("document.querySelector('.nav-links').getBoundingClientRect().right <= document.querySelector('.nav-actions').getBoundingClientRect().left"), `navigation fits at ${width}px`);
  }
  await writeFile(join(artifacts, "blog-mobile.png"), Buffer.from((await command("Page.captureScreenshot", { format: "png" })).data, "base64"));
  console.log("PASS: production routes, post images, bilingual content, portfolio/article/blog filters and responsive navigation");

  // Next, exercise the owner workflow against a mock Supabase API, including session refresh.
  vite = await viteServer({ root, configFile: false, base: "/Website/", server: { host: "127.0.0.1", port: 0 },
    define: { "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://blog.test"), "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("sb_publishable_test") } });
  await vite.listen();
  await command("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.mockPosts = [${JSON.stringify(initial)}]; window.mockRefreshes = 0;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (url, options = {}) => {
      if (!String(url).startsWith('https://blog.test')) return originalFetch(url, options);
      const path = new URL(url), reply = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
      if(path.pathname==='/auth/v1/token') {
        const input = JSON.parse(options.body);
        if(input.password && input.password!=='correct') return reply({message:'Invalid login credentials'},400);
        if(input.refresh_token) window.mockRefreshes++;
        const isOwner = input.refresh_token || input.email==='owner@example.com';
        return reply({access_token:isOwner?'owner-token':'reader-token',refresh_token:'refresh',expires_at:Math.floor(Date.now()/1000)+(input.refresh_token?3600:30),user:{id:isOwner?'owner-id':'reader-id',email:input.email || 'owner@example.com'}});
      }
      if(path.pathname==='/auth/v1/logout') return reply({});
      if(path.pathname==='/rest/v1/site_owners') return reply(options.headers.Authorization==='Bearer owner-token'?[{user_id:'owner-id'}]:[]);
      if(path.pathname==='/rest/v1/blog_posts') {
        if(options.method==='DELETE') {
          if(options.headers.Authorization!=='Bearer owner-token') return reply({},403);
          if(window.mockDeleteFailure) return reply({},503);
          const id=path.searchParams.get('id')?.slice(3);
          const removed=window.mockPosts.filter(post=>post.id===id);
          window.mockPosts=window.mockPosts.filter(post=>post.id!==id);
          window.mockDeletes=(window.mockDeletes||0)+1;
          return reply(removed.map(payload=>({payload})));
        }
        if(options.method==='POST') {
          if(options.headers.Authorization!=='Bearer owner-token') return reply({},403);
          const post = JSON.parse(options.body).payload;
          window.mockPosts = window.mockPosts.filter(entry=>entry.id!==post.id).concat(post);
          return reply([{payload:post}]);
        }
        let posts = window.mockPosts;
        if(path.searchParams.get('published')) posts = posts.filter(post=>post.published);
        const id=path.searchParams.get('id'); if(id) posts=posts.filter(post=>post.id===id.slice(3));
        return reply(posts.map(payload=>({payload})));
      }
      if(path.pathname.startsWith('/storage/v1/object/public/')) return originalFetch(location.origin+'/Website/assets/blog/faking-water-caustics/water-result.png');
      if(path.pathname.startsWith('/storage/v1/object/')) { window.mockUploads=(window.mockUploads||0)+1; return reply({Key:'image.png'}); }
      return reply({},404);
    };
  ` });
  await command("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await command("Page.navigate", { url: `http://127.0.0.1:${vite.httpServer.address().port}/Website/#/write` });
  await wait("!!document.querySelector('.writer-login')");
  await fill("writer-email", "reader@example.com"); await fill("writer-password", "correct");
  // Give non-owner sessions a long expiry so the refresh mock doesn't change their identity.
  await evaluate("window.fetch = ((previous) => async (url,options) => { const response=await previous(url,options); if(String(url).includes('grant_type=password') && JSON.parse(options.body).email==='reader@example.com'){const body=await response.json(); body.expires_at=Math.floor(Date.now()/1000)+3600; return new Response(JSON.stringify(body),{status:200});} return response; })(window.fetch)");
  await click("Sign in as owner");
  await wait("document.querySelector('.writer-status')?.textContent.includes(\"isn't the website owner\")");
  await fill("writer-email", "owner@example.com"); await fill("writer-password", "correct");
  await click("Sign in as owner");
  await wait("!!document.querySelector('.writer-form')");
  assert.equal(await evaluate("window.mockRefreshes"), 1);
  assert.ok(await evaluate("!!document.querySelector('.nav-write-link[href=\"#/write\"]')"), "writing is accessible from navigation");
  await click("New post", ".writer-new-post");
  assert.equal(await evaluate("document.getElementById('writer-title').value"), "");
  assert.equal(await evaluate("Array.from(document.querySelectorAll('.writer-form button')).find(el=>el.textContent==='Delete post').hidden"), true, "unsaved new entries have no delete action");
  await fill("writer-title", "Test progress update"); await fill("writer-slug", "test-progress");
  await fill("writer-tags", "Unity, Python"); await fill("writer-summary", "A real shared post test.");
  await fill("writer-body", "First paragraph.\n\n## Progress\n\nA second paragraph.");
  await click("ES", ".lang-option");
  await wait("!!document.querySelector('.writer-form')");
  assert.equal(await evaluate("document.getElementById('writer-title').value"), "Test progress update");
  await click("EN", ".lang-option");
  await wait("!!document.querySelector('.writer-form')");
  const doc = await command("DOM.getDocument");
  const input = await command("DOM.querySelector", { nodeId: doc.root.nodeId, selector: '.writer-upload input[type="file"]' });
  await command("DOM.setFileInputFiles", { nodeId: input.nodeId, files: [join(root, "public/assets/blog/faking-water-caustics/water-result.png")] });
  await fill("writer-imageAlt", "Uploaded water experiment");
  await click("Add image");
  await wait("document.getElementById('writer-cover').value.startsWith('https://blog.test/')");
  assert.equal(await evaluate("window.mockUploads"), 1);
  await writeFile(join(artifacts, "writer-desktop.png"), Buffer.from((await command("Page.captureScreenshot", { format: "png" })).data, "base64"));
  await click("Preview"); await wait("!document.querySelector('.writer-preview').hidden");
  assert.equal(await evaluate("document.querySelector('.writer-preview h1').textContent"), "Test progress update");
  await click("Continue editing");
  await click("Save draft"); await wait("document.querySelector('.writer-status').textContent.startsWith('Draft saved')");
  await route("#/blog", ".articles-grid");
  await wait("document.querySelectorAll('.article-card').length===1");
  await route("#/write", ".writer-form");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='test-progress'; el.dispatchEvent(new Event('change')); }");
  await click("Publish post"); await wait("document.querySelector('.writer-status').textContent.startsWith('Published.')");
  await route("#/blog", ".articles-grid");
  await wait("document.querySelectorAll('.article-card').length===2");
  await route("#/blog/test-progress", ".article-body");
  assert.equal(await evaluate("document.querySelector('.article-hero h1').textContent"), "Test progress update");
  await route("#/write", ".writer-form");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='test-progress'; el.dispatchEvent(new Event('change')); }");
  await fill("writer-title", "Edited progress update");
  await click("Save changes"); await wait("document.querySelector('.writer-status').textContent.startsWith('Published.')");
  assert.equal(await evaluate("window.mockPosts.find(post=>post.id==='test-progress').published"), true);
  await click("Unpublish to draft"); await wait("document.querySelector('.writer-status').textContent.startsWith('Draft saved')");
  await route("#/blog/test-progress", ".article-not-found");
  await route("#/write", ".writer-form");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='test-progress'; el.dispatchEvent(new Event('change')); }");
  await click("Delete post");
  await wait("document.querySelector('.writer-delete-dialog').open");
  await click("Cancel");
  assert.equal(await evaluate("window.mockDeletes||0"), 0, "cancel does not delete");
  await evaluate("window.mockDeleteFailure=true");
  await click("Delete post"); await click("Delete permanently");
  await wait("!document.querySelector('.writer-delete-dialog').open");
  assert.ok(await evaluate("window.mockPosts.some(post=>post.id==='test-progress')"), "failed deletion preserves the post");
  await evaluate("window.mockDeleteFailure=false");
  await click("ES", ".lang-option"); await wait("!!document.querySelector('.writer-form')");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='test-progress'; el.dispatchEvent(new Event('change')); }");
  await click("Eliminar entrada"); await click("Eliminar permanentemente");
  await wait("document.querySelector('.writer-status').textContent==='Entrada eliminada.'");
  assert.equal(await evaluate("window.mockPosts.some(post=>post.id==='test-progress')"), false, "confirmed deletion removes the post");
  assert.equal(await evaluate("Array.from(document.getElementById('writer-choose').options).some(option=>option.value==='test-progress')"), false, "deleted post disappears from the selector");
  assert.equal(await evaluate("Object.values(JSON.parse(localStorage.getItem('portfolio:post-backups:owner-id'))).some(post=>post.id==='test-progress')"), false, "deleted post backup is removed");
  await click("EN", ".lang-option"); await wait("!!document.querySelector('.writer-form')");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='faking-water-caustics'; el.dispatchEvent(new Event('change')); }");
  await click("New post", ".writer-new-post");
  assert.equal(await evaluate("document.getElementById('writer-choose').value"), "", "new-post button opens a new draft from an existing post");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='faking-water-caustics'; el.dispatchEvent(new Event('change')); }");
  await click("Delete post"); await click("Delete permanently");
  await wait("document.querySelector('.writer-status').textContent==='Post deleted.'");
  await route("#/blog", ".collection-empty");
  await route("#/write", ".writer-form");
  assert.equal(await evaluate("document.getElementById('writer-choose').options.length"), 1, "deleted seed is not offered again");
  await click("Sign out"); await wait("!!document.querySelector('.writer-login')");
  assert.equal(await evaluate("localStorage.getItem('portfolio:owner-session')"), null);
  assert.deepEqual(errors, [], "no runtime errors");
  console.log("PASS: owner recognition, non-owner rejection, token refresh, unsaved edit recovery, image upload, preview, private draft, publish, public edit, unpublish, new-post button, deletion confirmation/cancel/error handling, Spanish controls, sign-out and /Website/ base paths (mock API)");
  console.log(`Screenshots: ${artifacts}`);
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ id: 999999, method: "Browser.close" }));
  socket?.close();
  browser.kill();
  await vite?.close();
  if (production) await new Promise((done) => production.close(done));
}
