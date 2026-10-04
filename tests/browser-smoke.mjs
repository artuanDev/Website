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
const initial = JSON.parse(await readFile(join(root, "tests/fixtures/faking-water-caustics.json"), "utf8"));
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
  await command("Page.navigate", { url: `http://127.0.0.1:${production.address().port}/#/updates` });
  await wait("document.querySelector('.blog-load-status')?.textContent === ''");
  assert.equal(await evaluate("document.querySelector('.updates-heading h1').textContent"), "Updates");
  assert.equal(await evaluate("document.querySelector('.nav-links a[href=\"#/updates\"]').textContent"), "Updates");
  assert.equal(await evaluate("document.querySelector('.nav-write-link')"), null);
  assert.equal(await evaluate("document.querySelector('.update-edit')"), null, "editing controls are owner-only");
  assert.equal(await evaluate("document.querySelector('[data-update-id=\"faking-water-caustics\"]')"), null, "removed starter post is absent");
  const screenshot = await command("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(join(artifacts, "blog-desktop.png"), Buffer.from(screenshot.data, "base64"));
  await route("#/updates?compose", ".blog-writer");
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
    await route("#/updates", ".updates-feed");
    assert.ok(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), `no horizontal overflow at ${width}px`);
    assert.ok(await evaluate("{ const b=document.querySelector('.updates-add').getBoundingClientRect(),s=document.querySelector('.updates-add svg').getBoundingClientRect(),h=document.querySelector('.updates-heading').getBoundingClientRect(); Math.abs(b.x+b.width/2-s.x-s.width/2)<0.5 && Math.abs(b.y+b.height/2-s.y-s.height/2)<0.5 && Math.abs(b.y+b.height/2-h.y-h.height/2)<0.5; }"), `plus is centered at ${width}px`);
    if (width > 900) assert.ok(await evaluate("document.querySelector('.nav-links').getBoundingClientRect().right <= document.querySelector('.nav-actions').getBoundingClientRect().left"), `navigation fits at ${width}px`);
  }
  await writeFile(join(artifacts, "blog-mobile.png"), Buffer.from((await command("Page.captureScreenshot", { format: "png" })).data, "base64"));
  console.log("PASS: Updates feed, plus button, existing post images, bilingual content, professional Articles, tag filters and responsive navigation");

  // Next, exercise the owner workflow against a mock Supabase API, including session refresh.
  vite = await viteServer({ root, configFile: false, base: "/Website/", server: { host: "127.0.0.1", port: 0 },
    define: { "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://blog.test"), "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("sb_publishable_test") } });
  await vite.listen();
  await command("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.mockPosts = [${JSON.stringify(initial)}]; window.mockRefreshes = 0; window.mockPasswordUpdates = 0;
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
      if(path.pathname==='/auth/v1/user' && options.method==='PUT') {
        if(options.headers.Authorization!=='Bearer owner-token') return reply({},403);
        const input=JSON.parse(options.body);
        if(Object.keys(input).join(',')!=='password' || input.password!=='test-new-password-123') return reply({},400);
        window.mockPasswordUpdates++;
        if(window.mockPasswordFailure) return reply({code:'weak_password',message:'Password is too weak'},422);
        return reply({id:'owner-id',email:'owner@example.com'});
      }
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
  await command("Page.navigate", { url: `http://127.0.0.1:${vite.httpServer.address().port}/Website/#/updates` });
  await wait("!!document.querySelector('.updates-add')");
  await evaluate("document.querySelector('.updates-add').click()");
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
  assert.ok(await evaluate("!!document.querySelector('#updates .update-composer .writer-form')"), "composer belongs to the Updates page");
  assert.equal(await evaluate("document.querySelector('.update-options').open"), false, "extra fields are optional and collapsed");
  assert.equal(await evaluate("document.querySelector('.nav-write-link')"), null, "there is no separate Write navigation item");
  assert.equal(await evaluate("document.getElementById('writer-title-en').value"), "");
  assert.ok(await evaluate("['writer-body-en','writer-body-es'].every(id=>document.getElementById(id).getBoundingClientRect().height>0)"), "both language versions are visible immediately");
  assert.equal(await evaluate("Array.from(document.querySelectorAll('.writer-form button')).find(el=>el.textContent==='Delete update').hidden"), true, "unsaved new entries have no delete action");
  await fill("writer-title-en", "Test progress update"); await fill("writer-slug", "test-progress");
  await fill("writer-tags", "Unity, Python");
  await fill("writer-body-en", "First paragraph.\n\n## Progress\n\nA second paragraph.");
  await fill("writer-body-es", "Estoy probando una cosa. Esta versión la escribí yo.");
  await fill("writer-title-es", "Avance de prueba");
  // Password changes stay separate from posts and their recovery storage.
  await click("Change password");
  await wait("document.querySelector('.writer-password-dialog').open");
  assert.equal(await evaluate("document.activeElement.id"), "writer-new-password");
  await fill("writer-new-password", "test-new-password-123");
  await fill("writer-confirm-password", "different-password-123");
  await click("Save password");
  await wait("document.querySelector('.writer-password-dialog .writer-status').textContent.includes(\"don't match\")");
  assert.equal(await evaluate("window.mockPasswordUpdates"), 0, "mismatched passwords are never sent");
  await click("Cancel", ".writer-password-dialog button");
  await wait("!document.querySelector('.writer-password-dialog').open");
  await wait("document.getElementById('writer-new-password').value === ''");
  assert.equal(await evaluate("document.getElementById('writer-confirm-password').value"), "");
  assert.equal(await evaluate("window.mockPasswordUpdates"), 0, "cancel does not change the password");
  await click("Change password");
  await fill("writer-new-password", "test-new-password-123");
  await fill("writer-confirm-password", "test-new-password-123");
  await evaluate("window.mockPasswordFailure=true");
  await click("Save password");
  await wait("document.querySelector('.writer-password-dialog .writer-status').textContent.includes('stronger password')");
  assert.equal(await evaluate("document.querySelector('.writer-password-dialog').open"), true, "failed changes remain editable");
  await evaluate("window.mockPasswordFailure=false");
  await click("Save password");
  await wait("document.querySelector('.writer-status').textContent.startsWith('Password changed.')");
  await wait("document.getElementById('writer-new-password').value === ''");
  assert.equal(await evaluate("document.querySelector('.writer-password-dialog').open"), false);
  assert.equal(await evaluate("Object.values(localStorage).some(value=>value.includes('test-new-password-123'))"), false, "new password is not persisted in local storage");
  assert.equal(await evaluate("document.getElementById('writer-body-en').value"), "First paragraph.\n\n## Progress\n\nA second paragraph.", "changing a password preserves the update");
  await click("ES", ".lang-option");
  await wait("!!document.querySelector('.writer-form')");
  assert.equal(await evaluate("document.getElementById('writer-title-en').value"), "Test progress update");
  await click("EN", ".lang-option");
  await wait("!!document.querySelector('.writer-form')");
  const doc = await command("DOM.getDocument");
  const input = await command("DOM.querySelector", { nodeId: doc.root.nodeId, selector: '.writer-form input[type="file"]' });
  await command("DOM.setFileInputFiles", { nodeId: input.nodeId, files: [join(root, "public/assets/blog/faking-water-caustics/water-result.png")] });
  await wait("document.getElementById('writer-body-en').value.includes('https://blog.test/')");
  assert.equal(await evaluate("document.getElementById('writer-body-es').value"), "Estoy probando una cosa. Esta versión la escribí yo.", "photo goes into the selected version only");
  assert.equal(await evaluate("window.mockUploads"), 1);
  await writeFile(join(artifacts, "writer-desktop.png"), Buffer.from((await command("Page.captureScreenshot", { format: "png" })).data, "base64"));
  await click("Preview"); await wait("!document.querySelector('.writer-preview').hidden");
  assert.equal(await evaluate("document.querySelector('.writer-preview .update-title').textContent"), "Test progress update");
  await click("Continue editing");
  await click("Save draft"); await wait("document.querySelector('.writer-status').textContent.startsWith('Draft saved')");
  await route("#/updates", ".updates-feed");
  await wait("document.querySelectorAll('.update-post').length===1");
  await route("#/updates?compose", ".writer-form");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='test-progress'; el.dispatchEvent(new Event('change')); }");
  await fill("writer-date", "2000-01-01");
  await evaluate("document.getElementById('writer-pinned').click()");
  await click("Post update"); await wait("document.querySelector('.writer-status').textContent.startsWith('Posted!')");
  await route("#/updates", ".updates-feed");
  await wait("document.querySelectorAll('.update-post').length===2");
  assert.equal(await evaluate("document.querySelector('.updates-feed .update-post').dataset.updateId"), "test-progress", "an older pinned post stays first");
  assert.equal(await evaluate("document.querySelector('.updates-feed .update-post .update-pin-badge').textContent"), "Pinned");
  await route("#/updates/test-progress", ".update-body");
  assert.equal(await evaluate("document.querySelector('.update-title').textContent"), "Test progress update");
  await click("ES", ".lang-option");
  await wait("document.querySelector('.update-body')?.textContent.includes('Esta versión la escribí yo.')");
  await click("EN", ".lang-option");
  await wait("document.querySelector('.update-body')?.textContent.includes('First paragraph.')");
  await route("#/updates", ".updates-feed");
  await wait("!!document.querySelector('[data-update-id=\"test-progress\"] .update-edit')");
  await evaluate("document.querySelector('[data-update-id=\"test-progress\"] .update-edit').click()");
  await wait("!!document.querySelector('.writer-form')");
  assert.equal(await evaluate("document.getElementById('writer-choose').value"), "test-progress", "Edit opens the matching update inside Updates");
  await fill("writer-title-en", "Edited progress update");
  assert.equal(await evaluate("document.getElementById('writer-pinned').checked"), true, "pin setting persists across navigation");
  await evaluate("document.getElementById('writer-pinned').click()");
  await click("Save changes"); await wait("document.querySelector('.writer-status').textContent.startsWith('Posted!')");
  await wait("document.querySelector('.updates-feed .update-post')?.dataset.updateId==='faking-water-caustics'");
  assert.equal(await evaluate("window.mockPosts.find(post=>post.id==='test-progress').story.es.blocks[0].text"), "Estoy probando una cosa. Esta versión la escribí yo.", "editing English preserves the independently written Spanish version");
  assert.equal(await evaluate("window.mockPosts.find(post=>post.id==='test-progress').published"), true);
  await click("Unpublish to draft"); await wait("document.querySelector('.writer-status').textContent.startsWith('Draft saved')");
  await route("#/updates/test-progress", ".update-not-found");
  await route("#/updates?compose", ".writer-form");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='test-progress'; el.dispatchEvent(new Event('change')); }");
  await click("Delete update");
  await wait("document.querySelector('.writer-delete-dialog').open");
  await click("Cancel");
  assert.equal(await evaluate("window.mockDeletes||0"), 0, "cancel does not delete");
  await evaluate("window.mockDeleteFailure=true");
  await click("Delete update"); await click("Delete permanently");
  await wait("!document.querySelector('.writer-delete-dialog').open");
  assert.ok(await evaluate("window.mockPosts.some(post=>post.id==='test-progress')"), "failed deletion preserves the post");
  await evaluate("window.mockDeleteFailure=false");
  await click("ES", ".lang-option"); await wait("!!document.querySelector('.writer-form')");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='test-progress'; el.dispatchEvent(new Event('change')); }");
  await click("Eliminar novedad"); await click("Eliminar permanentemente");
  await wait("document.querySelector('.writer-status').textContent==='Novedad eliminada.'");
  assert.equal(await evaluate("window.mockPosts.some(post=>post.id==='test-progress')"), false, "confirmed deletion removes the post");
  assert.equal(await evaluate("Array.from(document.getElementById('writer-choose').options).some(option=>option.value==='test-progress')"), false, "deleted post disappears from the selector");
  assert.equal(await evaluate("Object.values(JSON.parse(localStorage.getItem('portfolio:post-backups:owner-id'))).some(post=>post.id==='test-progress')"), false, "deleted post backup is removed");
  await click("EN", ".lang-option"); await wait("!!document.querySelector('.writer-form')");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='faking-water-caustics'; el.dispatchEvent(new Event('change')); }");
  await click("New update", ".writer-new-post");
  assert.equal(await evaluate("document.getElementById('writer-choose').value"), "", "new-post button opens a new draft from an existing post");
  await evaluate("{ const el=document.getElementById('writer-choose'); el.value='faking-water-caustics'; el.dispatchEvent(new Event('change')); }");
  await click("Delete update"); await click("Delete permanently");
  await wait("document.querySelector('.writer-status').textContent==='Update deleted.'");
  await route("#/updates", ".collection-empty");
  await route("#/updates?compose", ".writer-form");
  assert.equal(await evaluate("document.getElementById('writer-choose').options.length"), 1, "deleted seed is not offered again");
  await click("New update", ".writer-new-post");
  await fill("writer-body-en", "Working on this little thing lol. Check out https://example.com/study");
  await click("Post update");
  await wait("document.querySelector('.writer-status').textContent.startsWith('Posted!')");
  const casualId = await evaluate("document.getElementById('writer-choose').value");
  assert.ok(casualId.startsWith("update-"), "URL name is generated automatically");
  assert.equal(await evaluate("window.mockPosts.find(post=>post.id===document.getElementById('writer-choose').value).tags.length"), 0, "tags are optional");
  assert.equal(await evaluate("window.mockPosts.find(post=>post.id===document.getElementById('writer-choose').value).autoTitle"), true, "title is optional");
  await wait(`!!document.querySelector('.updates-feed [data-update-id="${casualId}"]')`);
  assert.equal(await evaluate(`document.querySelector('.updates-feed [data-update-id="${casualId}"] .update-title')`), null, "short notes have no generated heading in the feed");
  assert.equal(await evaluate(`document.querySelector('.updates-feed [data-update-id="${casualId}"] .update-body a').href`), "https://example.com/study", "pasted links become clickable");
  await click("Delete update"); await click("Delete permanently");
  await wait("document.querySelector('.writer-status').textContent==='Update deleted.'");
  await click("ES", ".lang-option"); await wait("!!document.querySelector('.writer-form')");
  await fill("writer-body-es", "Estoy estudiando esto jaja");
  await click("Publicar novedad");
  await wait("document.querySelector('.writer-status').textContent.startsWith('¡Publicado!')");
  assert.equal(await evaluate("window.mockPosts.find(post=>post.id===document.getElementById('writer-choose').value).story.en.blocks.length"), 0, "Spanish is not copied into the English version");
  await fill("writer-body-es", "Sigo estudiando esto jaja");
  await click("Guardar cambios");
  await wait("document.querySelector('.writer-status').textContent.startsWith('¡Publicado!')");
  assert.equal(await evaluate("window.mockPosts.find(post=>post.id===document.getElementById('writer-choose').value).story.es.blocks[0].text"), "Sigo estudiando esto jaja");
  assert.equal(await evaluate("window.mockPosts.find(post=>post.id===document.getElementById('writer-choose').value).story.en.blocks.length"), 0, "editing Spanish leaves English untouched");
  await click("Eliminar novedad"); await click("Eliminar permanentemente");
  await wait("document.querySelector('.writer-status').textContent==='Novedad eliminada.'");
  await click("EN", ".lang-option"); await wait("!!document.querySelector('.writer-form')");
  await click("Sign out"); await wait("!!document.querySelector('.writer-login')");
  assert.equal(await evaluate("localStorage.getItem('portfolio:owner-session')"), null);
  assert.deepEqual(errors, [], "no runtime errors");
  console.log("PASS: manual English/Spanish versions, photos, drafts, pinning, publishing, confirmed deletion, password confirmation/cancellation/retry without storing passwords, and sign-out (mock API)");
  console.log(`Screenshots: ${artifacts}`);
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ id: 999999, method: "Browser.close" }));
  socket?.close();
  browser.kill();
  await vite?.close();
  if (production) await new Promise((done) => production.close(done));
}
