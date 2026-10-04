import { el, clear } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";
import { isBlogConfigured, getOwner, signInOwner, signOutOwner, listOwnerPosts, savePost, deletePost, uploadPostImage } from "../lib/blogApi.js";
import { parseBlogBody, serializeBlogBody } from "../lib/blogMarkdown.js";
import { renderUpdate } from "./updatePost.js";

const ERROR_KEYS = new Set(["blogNotConfigured", "blogSessionExpired", "blogNotOwner", "blogRequestFailed", "blogInvalidImage"]);
const errorText = (error) => t(`writer.errors.${ERROR_KEYS.has(error.message) ? error.message : "generic"}`);
const copy = (value) => JSON.parse(JSON.stringify(value));
const today = () => new Date().toLocaleDateString("sv-SE");

function field(key, node) {
  const id = `writer-${key}`;
  node.id = id;
  return el("div", { class: "writer-field" }, [el("label", { for: id }, t(`writer.${key}`)), node]);
}

export function renderBlogWriter({ postId = null, onChange = () => {} } = {}) {
  const content = el("div");
  const heading = el("h2", {}, t("writer.heading"));
  const section = el("div", { class: "blog-writer update-composer" }, [
    el("div", { class: "update-composer-heading" }, [heading,
      el("a", { href: "#/updates", class: "update-composer-close" }, t("writer.close"))]),
    content,
  ]);

  if (!isBlogConfigured) {
    content.appendChild(el("p", { class: "article-note", role: "status" }, t("writer.setup")));
    return section;
  }

  function login(message = "") {
    clear(content);
    const email = el("input", { type: "email", autocomplete: "username", required: "" });
    const password = el("input", { type: "password", autocomplete: "current-password", required: "" });
    const status = el("p", { class: "writer-status", role: "status", "aria-live": "polite" }, message);
    const button = el("button", { type: "submit", class: "btn btn-primary" }, t("writer.signIn"));
    content.appendChild(el("form", { class: "writer-login", onSubmit: async (event) => {
      event.preventDefault(); button.disabled = true;
      status.textContent = t("writer.checking");
      try { await openDesk(await signInOwner(email.value.trim(), password.value)); }
      catch (error) { status.textContent = errorText(error); }
      finally { button.disabled = false; password.value = ""; }
    } }, [field("email", email), field("password", password), button, status]));
  }

  async function openDesk(owner) {
    const posts = await listOwnerPosts();
    if (!content.isConnected) return;
    clear(content);
    const known = new Map(posts.map((post) => [post.id, post]));
    const backupKey = `portfolio:post-backups:${owner.id}`;
    let backups;
    try { backups = JSON.parse(localStorage.getItem(backupKey)) || {}; } catch { backups = {}; }
    let current, writingLang = "en", originalId = null, busy = false;
    const selector = el("select");
    const status = el("p", { class: "writer-status", role: "status", "aria-live": "polite" });
    const form = el("form", { class: "writer-form", onSubmit: (event) => event.preventDefault() });
    const preview = el("div", { class: "writer-preview", hidden: "" });
    const title = el("input", { type: "text", maxlength: "160" });
    const summary = el("textarea", { rows: "3", maxlength: "600" });
    const body = el("textarea", { rows: "6", placeholder: t("writer.bodyPlaceholder"), "aria-describedby": "writer-body-help" });
    const slug = el("input", { type: "text", pattern: "[a-z0-9]+(-[a-z0-9]+)*", maxlength: "100" });
    const date = el("input", { type: "date" });
    const tags = el("input", { type: "text", placeholder: "Unity, Shaders, Water" });
    const cover = el("input", { type: "text" });
    const source = el("input", { type: "url" });
    const language = el("select", {}, [el("option", { value: "en" }, "English"), el("option", { value: "es" }, "Español")]);
    const image = el("input", { type: "file", accept: "image/png,image/jpeg,image/webp,image/gif", "aria-label": t("writer.upload") });
    const imageAlt = el("input", { type: "text", maxlength: "300" });
    const actions = [];

    function capture() {
      current.id = slug.value.trim(); current.date = date.value;
      current.tags = [...new Set(tags.value.split(",").map((tag) => tag.trim()).filter(Boolean))];
      current.thumb = cover.value.trim();
      current.links = { ...current.links, linkedin: source.value.trim() };
      const blocks = parseBlogBody(body.value);
      const note = blocks.filter(block => block.text).map(block => block.text).join(" ").replace(/\s+/g, " ").trim();
      current.autoTitle = !title.value.trim();
      current.i18n[writingLang] = { title: title.value.trim() || note.slice(0, 90) || t("blog.label"), summary: summary.value.trim() || note.slice(0, 180), kicker: t("blog.label"),
        displayDate: date.value ? new Date(`${date.value}T12:00:00`).toLocaleDateString(writingLang, { year: "numeric", month: "long", day: "numeric" }) : "" };
      current.story[writingLang] = { eyebrow: t("blog.label"), blocks };
      current.readingMinutes = Math.max(1, Math.ceil(serializeBlogBody(current.story.en?.blocks).split(/\s+/).filter(Boolean).length / 200));
      return current;
    }

    function checkpoint() {
      capture();
      backups[originalId || "__new"] = { ...copy(current), _writingLang: writingLang };
      try { localStorage.setItem(backupKey, JSON.stringify(backups)); } catch { /* Saving to the database remains available. */ }
    }

    function populateLanguage() {
      language.value = writingLang;
      const text = current.i18n[writingLang] || {};
      title.value = current.autoTitle ? "" : text.title || ""; summary.value = text.summary || "";
      body.value = serializeBlogBody(current.story[writingLang]?.blocks);
    }

    function selectPost(id) {
      originalId = id || null;
      const restored = backups[id || "__new"];
      current = copy(restored || known.get(id) || {
        id: "", published: false, date: today(), tags: [], thumb: "", links: {}, readingMinutes: 1,
        i18n: { en: {}, es: {} }, story: { en: { blocks: [] }, es: { blocks: [] } },
      });
      writingLang = restored?._writingLang || (id && !current.story[getLang()]?.blocks.length ? "en" : getLang());
      slug.value = current.id; slug.disabled = posts.some((post) => post.id === id);
      date.value = current.date; tags.value = current.tags.join(", ");
      cover.value = current.thumb || ""; source.value = current.links?.linkedin || "";
      populateLanguage();
      updateSaveActions();
      heading.textContent = t(id ? "writer.editHeading" : "writer.heading");
      status.textContent = restored ? t("writer.restored") : "";
      form.hidden = false; preview.hidden = true;
    }

    function updateSelector(selected = "") {
      clear(selector);
      selector.appendChild(el("option", { value: "" }, t("writer.newPost")));
      known.forEach((post) => selector.appendChild(el("option", { value: post.id }, `${post.i18n.en.title} · ${t(post.published ? "writer.published" : "writer.draft")}`)));
      selector.value = selected;
    }

    function setBusy(value) {
      busy = value;
      actions.forEach((button) => { button.disabled = value; });
      // Prevent switching entries or editing while an upload/save captures this post.
      form.querySelectorAll("input, textarea, select, button").forEach((control) => { control.disabled = value; });
      if (!value) slug.disabled = posts.some((post) => post.id === originalId);
      selector.disabled = value;
      if (!value) updateSaveActions();
    }

    function validate(post) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.id) || !/^\d{4}-\d{2}-\d{2}$/.test(post.date) ||
        !post.story.en?.blocks.length) throw new Error("validation");
      if ((post.thumb && !/^(?:https:\/\/|\/(?!\/))/.test(post.thumb)) ||
        (post.links?.linkedin && !/^https:\/\//.test(post.links.linkedin))) throw new Error("unsafeUrl");
    }

    async function save(published) {
      if (busy) return;
      checkpoint();
      const post = copy(current);
      delete post._writingLang;
      if (!post.id) post.id = `update-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
      if (writingLang !== "en" && (!post.story.en?.blocks.length || post.englishFallback) && post.story[writingLang]?.blocks.length) {
        post.i18n.en = copy(post.i18n[writingLang]); post.story.en = copy(post.story[writingLang]);
        post.englishFallback = true;
      }
      if (writingLang === "en") delete post.englishFallback;
      // An unfinished Spanish translation falls back to the English post as a whole.
      if (!post.story.es?.blocks.length) {
        delete post.i18n.es; delete post.story.es;
      }
      try { validate(post); } catch (error) { status.textContent = t(`writer.${error.message}`); return; }
      post.published = published;
      setBusy(true); status.textContent = t("writer.busy");
      try {
        await savePost(post);
        known.set(post.id, post);
        if (!posts.some((entry) => entry.id === post.id)) posts.push(post);
        delete backups[originalId || "__new"];
        try { localStorage.setItem(backupKey, JSON.stringify(backups)); } catch { /* The database save succeeded. */ }
        current = copy(post); originalId = post.id;
        slug.value = post.id;
        updateSelector(post.id);
        updateSaveActions();
        status.textContent = t(published ? "writer.live" : "writer.saved");
        onChange();
      } catch (error) {
        status.textContent = errorText(error);
        if (error.message === "blogSessionExpired") login(errorText(error));
      } finally { setBusy(false); }
    }

    const upload = el("button", { type: "button", class: "btn btn-secondary", onClick: async () => {
      if (!image.files[0] || !imageAlt.value.trim()) { status.textContent = t("writer.imageRequired"); return; }
      checkpoint(); setBusy(true); status.textContent = t("writer.uploading");
      try {
        const url = await uploadPostImage(image.files[0]);
        const alt = imageAlt.value.trim().replace(/[\[\]\r\n]/g, " ");
        body.value += `\n\n![${alt}](${url})`;
        if (!cover.value) cover.value = url;
        image.value = ""; imageAlt.value = "";
        checkpoint(); status.textContent = t("writer.localSave");
      } catch (error) { status.textContent = errorText(error); }
      finally { setBusy(false); }
    } }, t("writer.upload"));
    const previewButton = el("button", { type: "button", class: "btn btn-secondary", onClick: () => {
      checkpoint(); clear(preview);
      const post = copy(current);
      post.i18n[getLang()] = post.i18n[writingLang];
      post.story[getLang()] = post.story[writingLang];
      preview.appendChild(el("button", { type: "button", class: "btn btn-secondary", onClick: () => { form.hidden = false; preview.hidden = true; } }, t("writer.editing")));
      preview.appendChild(renderUpdate(post, { preview: true }));
      form.hidden = true; preview.hidden = false;
    } }, t("writer.preview"));
    const saveButton = el("button", { type: "button", class: "btn btn-secondary", onClick: () => save(current.published) }, t("writer.save"));
    const publishButton = el("button", { type: "button", class: "btn btn-primary", onClick: () => save(true) }, t("writer.publish"));
    const unpublishButton = el("button", { type: "button", class: "btn btn-secondary", onClick: () => save(false) }, t("writer.unpublish"));
    const deleteMessage = el("p");
    const deleteDialog = el("dialog", { class: "writer-delete-dialog", "aria-labelledby": "writer-delete-heading", "aria-describedby": "writer-delete-message" });
    deleteMessage.id = "writer-delete-message";
    const deleteCancel = el("button", { type: "button", class: "btn btn-secondary", onClick: () => deleteDialog.close() }, t("writer.cancel"));
    const deleteConfirm = el("button", { type: "button", class: "btn btn-danger", onClick: async () => {
      if (busy || !originalId) return;
      const id = originalId;
      setBusy(true); status.textContent = t("writer.deleting");
      try {
        await deletePost(id);
        known.delete(id);
        const index = posts.findIndex((post) => post.id === id);
        if (index !== -1) posts.splice(index, 1);
        delete backups[id];
        try { localStorage.setItem(backupKey, JSON.stringify(backups)); } catch { /* The database deletion succeeded. */ }
        deleteDialog.close();
        updateSelector(); selectPost("");
        status.textContent = t("writer.deleted");
        onChange();
      } catch (error) {
        deleteDialog.close();
        status.textContent = errorText(error);
        if (error.message === "blogSessionExpired") login(errorText(error));
      } finally { setBusy(false); }
    } }, t("writer.deleteConfirm"));
    deleteDialog.append(el("h2", { id: "writer-delete-heading" }, t("writer.delete")), deleteMessage,
      el("div", { class: "writer-actions" }, [deleteCancel, deleteConfirm]));
    deleteDialog.addEventListener("cancel", (event) => { if (busy) event.preventDefault(); });
    const deleteButton = el("button", { type: "button", class: "btn btn-danger", onClick: () => {
      if (busy || !originalId) return;
      deleteMessage.textContent = t("writer.deleteQuestion").replace("{title}", known.get(originalId)?.i18n.en.title || originalId);
      deleteDialog.showModal();
      deleteCancel.focus();
    } }, t("writer.delete"));
    const newPostButton = el("button", { type: "button", class: "btn btn-primary writer-new-post", onClick: () => {
      if (busy) return;
      checkpoint(); selector.value = ""; selectPost(""); body.focus();
    } }, t("writer.newPost"));
    actions.push(upload, previewButton, saveButton, publishButton, unpublishButton, deleteButton, deleteCancel, deleteConfirm, newPostButton);

    function updateSaveActions() {
      saveButton.textContent = t(current.published ? "writer.saveChanges" : "writer.save");
      publishButton.hidden = current.published;
      unpublishButton.hidden = !current.published;
      deleteButton.hidden = !posts.some((post) => post.id === originalId);
      newPostButton.hidden = !originalId;
      saveButton.className = `btn ${current.published ? "btn-primary" : "btn-secondary"}`;
    }

    language.addEventListener("change", () => { checkpoint(); writingLang = language.value; populateLanguage(); });
    selector.addEventListener("change", () => selectPost(selector.value));
    [title, summary, body, slug, date, tags, cover, source].forEach((control) => control.addEventListener("input", checkpoint));
    form.append(
      field("body", body),
      el("p", { id: "writer-body-help", class: "writer-help" }, t("writer.bodyHelp")),
      el("details", { class: "writer-upload" }, [el("summary", {}, t("writer.addPhoto")), image, field("imageAlt", imageAlt), upload]),
      el("details", { class: "update-options" }, [el("summary", {}, t("writer.options")),
        field("language", language), field("title", title), field("tags", tags),
        el("div", { class: "writer-field-row" }, [field("slug", slug), field("date", date)]),
        field("summary", summary), field("cover", cover), field("source", source)]),
      el("div", { class: "writer-actions" }, [publishButton, saveButton, previewButton, unpublishButton, deleteButton]),
    );
    content.append(
      el("div", { class: "writer-account" }, [el("p", {}, t("writer.signedIn")), el("button", {
        type: "button", class: "btn btn-secondary", onClick: async () => { if (busy) return; await signOutOwner(); login(); onChange(); },
      }, t("writer.signOut"))]),
      newPostButton, status, form, preview,
      el("details", { class: "update-manage" }, [el("summary", {}, t("writer.choose")), field("choose", selector)]), deleteDialog,
    );
    updateSelector(postId || ""); selectPost(known.has(postId) ? postId : "");
    onChange();
  }

  content.appendChild(el("p", { role: "status" }, t("writer.checking")));
  getOwner().then((owner) => owner ? openDesk(owner) : login()).catch((error) => login(errorText(error)));
  return section;
}
