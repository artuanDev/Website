import { el, clear } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";
import { isBlogConfigured, getOwner, signInOwner, signOutOwner, changeOwnerPassword, listOwnerPosts, savePost, deletePost, uploadPostImage } from "../lib/blogApi.js";
import { parseBlogBody, serializeBlogBody } from "../lib/blogMarkdown.js";
import { renderUpdate } from "./updatePost.js";
import { localUpdateDate, normalizeUpdateUrlName, updateValidationError } from "../lib/updates.js";

const ERROR_KEYS = new Set(["blogNotConfigured", "blogSessionExpired", "blogNotOwner", "blogRequestFailed", "blogInvalidImage", "blogWeakPassword", "blogSamePassword", "blogPasswordReauth"]);
const errorText = error => t(`writer.errors.${ERROR_KEYS.has(error.message) ? error.message : "generic"}`);
const copy = value => JSON.parse(JSON.stringify(value));
const today = localUpdateDate;
const LANGUAGES = ["en", "es"];
const VALIDATION_KEYS = new Set(["emptyUpdate", "invalidSlug", "duplicateSlug", "invalidDate", "unsafeUrl"]);

function field(key, node, label = t(`writer.${key}`)) {
  node.id = `writer-${key}`;
  return el("div", { class: "writer-field" }, [el("label", { for: node.id }, label), node]);
}

function postLabel(post) {
  const language = post.story[getLang()]?.blocks.length ? getLang() : getLang() === "en" ? "es" : "en";
  return post.i18n[language]?.title || `${t("blog.label")} · ${post.date}`;
}

export function renderBlogWriter({ postId = null, onChange = () => {} } = {}) {
  const content = el("div");
  const heading = el("h2", {}, t("writer.heading"));
  const section = el("div", { class: "blog-writer update-composer" }, [
    el("div", { class: "update-composer-heading" }, [heading,
      el("a", { href: "#/updates", class: "update-composer-close" }, t("writer.close"))]), content,
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
    content.appendChild(el("form", { class: "writer-login", onSubmit: async event => {
      event.preventDefault(); button.disabled = true; status.textContent = t("writer.checking");
      try { await openDesk(await signInOwner(email.value.trim(), password.value)); }
      catch (error) { status.textContent = errorText(error); }
      finally { button.disabled = false; password.value = ""; }
    } }, [field("email", email), field("password", password), button, status]));
  }

  async function openDesk(owner) {
    const posts = await listOwnerPosts();
    if (!content.isConnected) return;
    clear(content);
    const known = new Map(posts.map(post => [post.id, post]));
    const backupKey = `portfolio:post-backups:${owner.id}`;
    let backups;
    try { backups = JSON.parse(localStorage.getItem(backupKey)) || {}; } catch { backups = {}; }
    let current, originalId = null, busy = false, uploadLanguage = "en";
    const selector = el("select");
    const status = el("p", { id: "writer-save-status", class: "writer-status", role: "status", "aria-live": "polite", tabindex: "-1" });
    const publicationState = el("p", { class: "writer-publication-state" });
    const form = el("form", { class: "writer-form", onSubmit: event => event.preventDefault() });
    const preview = el("div", { class: "writer-preview", hidden: "" });
    const bodies = Object.fromEntries(LANGUAGES.map(language => [language, el("textarea", {
      rows: "5", lang: language, placeholder: t(`writer.placeholder${language === "en" ? "En" : "Es"}`),
    })]));
    const titles = Object.fromEntries(LANGUAGES.map(language => [language, el("input", { type: "text", lang: language, maxlength: "160" })]));
    const pinned = el("input", { type: "checkbox", id: "writer-pinned" });
    const slug = el("input", { type: "text", maxlength: "100", placeholder: t("writer.slugPlaceholder") });
    const date = el("input", { type: "date" });
    const tags = el("input", { type: "text", placeholder: "Unity, Shaders, Water" });
    const source = el("input", { type: "url" });
    const actions = [];
    const validationFields = { emptyUpdate: bodies[getLang()], invalidSlug: slug, duplicateSlug: slug, invalidDate: date, unsafeUrl: source };
    function clearValidation(control) {
      control.removeAttribute("aria-invalid"); control.removeAttribute("aria-describedby");
    }

    function showStatus(message, state = "info") {
      status.textContent = message; status.dataset.state = state;
      status.setAttribute("role", state === "error" ? "alert" : "status");
      if (state === "error") { status.scrollIntoView({ block: "center", behavior: "smooth" }); status.focus({ preventScroll: true }); }
    }

    function storeBackups() {
      try { localStorage.setItem(backupKey, JSON.stringify(backups)); } catch { /* Database saves remain available. */ }
    }
    function capture() {
      current.id = slug.value.trim(); current.date = date.value || today(); current.pinned = pinned.checked;
      current.tags = [...new Set(tags.value.split(",").map(tag => tag.trim()).filter(Boolean))];
      current.links = { ...current.links, linkedin: source.value.trim() };
      current.autoTitles = {};
      LANGUAGES.forEach(language => {
        const blocks = parseBlogBody(bodies[language].value);
        const note = blocks.filter(block => block.text).map(block => block.text).join(" ").replace(/\s+/g, " ").trim();
        current.autoTitles[language] = !titles[language].value.trim();
        current.i18n[language] = { title: titles[language].value.trim() || note.slice(0, 90), summary: note.slice(0, 180),
          displayDate: new Date(`${current.date}T12:00:00`).toLocaleDateString(language, { day: "numeric", month: "long", year: "numeric" }) };
        current.story[language] = { blocks };
      });
      current.autoTitle = LANGUAGES.every(language => current.autoTitles[language]);
      delete current.englishFallback; delete current._writingLang;
      return current;
    }
    function checkpoint() { capture(); backups[originalId || "__new"] = copy(current); storeBackups(); }
    function selectPost(id) {
      originalId = id || null;
      const restored = backups[id || "__new"];
      current = copy(restored || known.get(id) || {
        id: "", published: false, pinned: false, date: today(), tags: [], thumb: "", links: {},
        i18n: { en: {}, es: {} }, story: { en: { blocks: [] }, es: { blocks: [] } },
      });
      // Old Spanish-only notes stored a fallback copy; show the original in Spanish only.
      if (current.englishFallback) { current.i18n.en = {}; current.story.en = { blocks: [] }; }
      LANGUAGES.forEach(language => {
        bodies[language].value = serializeBlogBody(current.story[language]?.blocks);
        titles[language].value = (current.autoTitles?.[language] ?? current.autoTitle) ? "" : current.i18n[language]?.title || "";
      });
      slug.value = current.id; date.value = current.date || today(); tags.value = current.tags.join(", ");
      source.value = current.links?.linkedin || ""; pinned.checked = current.pinned === true;
      slug.disabled = posts.some(post => post.id === id);
      heading.textContent = t(id ? "writer.editHeading" : "writer.heading");
      showStatus(restored ? t("writer.restored") : "");
      Object.values(validationFields).forEach(clearValidation);
      form.hidden = false; preview.hidden = true; updateActions();
    }
    function updateSelector(selected = "") {
      clear(selector); selector.appendChild(el("option", { value: "" }, t("writer.newPost")));
      known.forEach(post => selector.appendChild(el("option", { value: post.id }, `${postLabel(post)} · ${t(post.published ? "writer.published" : "writer.draft")}`)));
      selector.value = selected;
    }
    function setBusy(value) {
      busy = value; actions.forEach(button => { button.disabled = value; }); selector.disabled = value;
      form.querySelectorAll("input, textarea, button").forEach(control => { control.disabled = value; });
      if (!value) { slug.disabled = posts.some(post => post.id === originalId); updateActions(); }
    }
    async function save(published) {
      if (busy) return;
      try {
        Object.values(validationFields).forEach(clearValidation);
        checkpoint();
        if (date.validity.badInput) throw new Error("invalidDate");
        if (!date.value) date.value = today();
        if (!posts.some(post => post.id === originalId)) slug.value = normalizeUpdateUrlName(slug.value);
        checkpoint();
        if (!current.id) {
          slug.value = `update-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
          checkpoint(); // Reuse this ID if a timed-out request needs to be retried.
        }
        const post = copy(current);
        const validationError = updateValidationError(post);
        if (validationError) throw new Error(validationError);
        if (post.id !== originalId && known.has(post.id)) throw new Error("duplicateSlug");
        post.published = published;
        setBusy(true); showStatus(t(published ? "writer.publishing" : "writer.busy"), "busy");
        if (published) (current.published ? saveButton : publishButton).textContent = t("writer.publishing");
        else saveButton.textContent = t("writer.busy");
        const saved = await savePost(post); known.set(saved.id, saved);
        if (!posts.some(entry => entry.id === post.id)) posts.push(post);
        delete backups[originalId || "__new"]; storeBackups();
        current = copy(saved); originalId = saved.id; slug.value = saved.id;
        updateSelector(post.id); heading.textContent = t("writer.editHeading");
        if (published) window.location.hash = `#/updates?published=${encodeURIComponent(saved.id)}`;
        else { showStatus(t("writer.saved"), "success"); onChange(); }
      } catch (error) {
        showStatus(VALIDATION_KEYS.has(error.message) ? t(`writer.${error.message}`) : errorText(error), "error");
        const control = validationFields[error.message];
        if (control) {
          if (options.contains(control)) options.open = true;
          control.setAttribute("aria-invalid", "true"); control.setAttribute("aria-describedby", status.id);
          control.focus(); control.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        if (error.message === "blogSessionExpired") login(errorText(error));
      } finally { setBusy(false); }
    }

    const image = el("input", { type: "file", hidden: "", accept: "image/png,image/jpeg,image/webp,image/gif", onChange: async () => {
      const file = image.files[0]; if (!file || busy) return;
      checkpoint(); setBusy(true); showStatus(t("writer.uploading"), "busy");
      try {
        const url = await uploadPostImage(file);
        const alt = file.name.replace(/[\[\]\r\n]/g, " ");
        bodies[uploadLanguage].value += `\n\n![${alt}](${url})`;
        if (!current.thumb) current.thumb = url;
        checkpoint(); showStatus(t("writer.photoAdded"), "success");
      } catch (error) { showStatus(errorText(error), "error"); }
      finally { image.value = ""; setBusy(false); }
    } });
    const photoButtons = Object.fromEntries(LANGUAGES.map(language => [language, el("button", {
      type: "button", class: "update-photo-button", "data-language": language,
      onClick: () => { if (!busy) { uploadLanguage = language; image.click(); } },
    }, t("writer.addPhoto"))]));
    const saveButton = el("button", { type: "button", class: "btn btn-secondary", onClick: () => save(current.published) }, t("writer.save"));
    const publishButton = el("button", { type: "button", class: "btn btn-primary", onClick: () => save(true) }, t("writer.publish"));
    const unpublishButton = el("button", { type: "button", class: "btn btn-secondary", onClick: () => save(false) }, t("writer.unpublish"));
    const previewButton = el("button", { type: "button", class: "btn btn-secondary", onClick: () => {
      checkpoint(); clear(preview);
      preview.appendChild(el("button", { type: "button", class: "btn btn-secondary", onClick: () => { form.hidden = false; preview.hidden = true; } }, t("writer.editing")));
      preview.appendChild(renderUpdate(copy(current), { preview: true })); form.hidden = true; preview.hidden = false;
    } }, t("writer.preview"));
    const deleteDialog = el("dialog", { class: "writer-delete-dialog", "aria-labelledby": "writer-delete-heading", "aria-describedby": "writer-delete-message" });
    const deleteMessage = el("p", { id: "writer-delete-message" });
    const deleteCancel = el("button", { type: "button", class: "btn btn-secondary", onClick: () => deleteDialog.close() }, t("writer.cancel"));
    const deleteConfirm = el("button", { type: "button", class: "btn btn-danger", onClick: async () => {
      if (busy || !originalId) return;
      const id = originalId; setBusy(true); showStatus(t("writer.deleting"), "busy");
      try {
        await deletePost(id); known.delete(id);
        const index = posts.findIndex(post => post.id === id); if (index !== -1) posts.splice(index, 1);
        delete backups[id]; storeBackups(); deleteDialog.close(); updateSelector(); selectPost("");
        showStatus(t("writer.deleted"), "success"); onChange();
      } catch (error) {
        deleteDialog.close(); showStatus(errorText(error), "error");
        if (error.message === "blogSessionExpired") login(errorText(error));
      } finally { setBusy(false); }
    } }, t("writer.deleteConfirm"));
    deleteDialog.append(el("h2", { id: "writer-delete-heading" }, t("writer.delete")), deleteMessage, el("div", { class: "writer-actions" }, [deleteCancel, deleteConfirm]));
    deleteDialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); });
    const deleteButton = el("button", { type: "button", class: "btn btn-danger", onClick: () => {
      if (busy || !originalId) return;
      deleteMessage.textContent = t("writer.deleteQuestion").replace("{title}", postLabel(known.get(originalId)));
      deleteDialog.showModal(); deleteCancel.focus();
    } }, t("writer.delete"));
    const newButton = el("button", { type: "button", class: "btn btn-secondary writer-new-post", onClick: () => {
      if (busy) return;
      checkpoint(); updateSelector(); selectPost(""); bodies[getLang()].focus();
    } }, t("writer.newPost"));
    const passwordDialog = el("dialog", { class: "writer-delete-dialog writer-password-dialog", "aria-labelledby": "writer-password-heading" });
    const newPassword = el("input", { type: "password", autocomplete: "new-password", required: "", minlength: "8" });
    const confirmPassword = el("input", { type: "password", autocomplete: "new-password", required: "", minlength: "8" });
    const passwordStatus = el("p", { class: "writer-status", role: "status", "aria-live": "polite" });
    const passwordCancel = el("button", { type: "button", class: "btn btn-secondary", onClick: () => passwordDialog.close() }, t("writer.cancel"));
    const passwordSave = el("button", { type: "submit", class: "btn btn-primary" }, t("writer.savePassword"));
    const passwordForm = el("form", { onSubmit: async event => {
      event.preventDefault();
      if (busy) return;
      if (newPassword.value !== confirmPassword.value) { passwordStatus.textContent = t("writer.passwordMismatch"); confirmPassword.focus(); return; }
      setBusy(true); passwordSave.disabled = passwordCancel.disabled = newPassword.disabled = confirmPassword.disabled = true;
      passwordStatus.textContent = t("writer.passwordSaving");
      try {
        await changeOwnerPassword(newPassword.value);
        passwordDialog.close(); showStatus(t("writer.passwordChanged"), "success");
      } catch (error) {
        passwordStatus.textContent = errorText(error);
        if (error.message === "blogSessionExpired") { passwordDialog.close(); login(errorText(error)); }
      } finally {
        passwordSave.disabled = passwordCancel.disabled = newPassword.disabled = confirmPassword.disabled = false; setBusy(false);
      }
    } }, [field("new-password", newPassword, t("writer.newPassword")),
      field("confirm-password", confirmPassword, t("writer.confirmPassword")),
      el("p", { class: "writer-help" }, t("writer.passwordHelp")), passwordStatus,
      el("div", { class: "writer-actions" }, [passwordCancel, passwordSave])]);
    passwordDialog.append(el("h2", { id: "writer-password-heading" }, t("writer.changePassword")), passwordForm);
    passwordDialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); });
    passwordDialog.addEventListener("close", () => { newPassword.value = confirmPassword.value = ""; passwordStatus.textContent = ""; });
    const changePassword = el("button", { type: "button", class: "update-account-button", onClick: () => {
      if (busy) return;
      checkpoint(); passwordDialog.showModal(); newPassword.focus();
    } }, t("writer.changePassword"));
    const signOut = el("button", { type: "button", class: "update-account-button", onClick: async () => {
      if (busy) return;
      await signOutOwner(); login(); onChange();
    } }, t("writer.signOut"));
    actions.push(...Object.values(photoButtons), saveButton, publishButton, unpublishButton, previewButton, deleteButton, deleteCancel, deleteConfirm, newButton, changePassword, signOut);
    function updateActions() {
      publicationState.textContent = t(current.published ? "writer.publicStatus" : "writer.privateStatus");
      publicationState.dataset.published = String(current.published);
      saveButton.textContent = t(current.published ? "writer.saveChanges" : "writer.save");
      saveButton.className = `btn ${current.published ? "btn-primary" : "btn-secondary"}`;
      publishButton.textContent = t("writer.publish");
      publishButton.hidden = current.published; unpublishButton.hidden = !current.published;
      deleteButton.hidden = !posts.some(post => post.id === originalId); newButton.hidden = !originalId;
    }
    selector.addEventListener("change", () => { checkpoint(); selectPost(selector.value); });
    [...Object.values(bodies), ...Object.values(titles), slug, date, tags, source].forEach(control => control.addEventListener("input", () => { clearValidation(control); checkpoint(); }));
    pinned.addEventListener("change", checkpoint);
    form.addEventListener("keydown", event => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); save(true); }
    });
    const options = el("details", { class: "update-options" }, [el("summary", {}, t("writer.options")),
      el("div", { class: "writer-field-row" }, [field("title-en", titles.en, t("writer.titleEn")), field("title-es", titles.es, t("writer.titleEs"))]),
      field("tags", tags), el("div", { class: "writer-field-row" }, [field("slug", slug), field("date", date)]),
      el("p", { class: "writer-help" }, t("writer.metadataHelp")), field("source", source)]);
    form.append(
      el("div", { class: "update-language-panes" }, LANGUAGES.map(language => el("div", { class: "update-language-pane" }, [
        field(`body-${language}`, bodies[language], language === "en" ? "English" : "Español"), photoButtons[language],
      ]))), image,
      el("p", { class: "writer-help" }, t("writer.bilingualHelp")),
      el("label", { class: "update-pin-control", for: "writer-pinned" }, [pinned, el("span", {}, t("writer.pin"))]),
      status,
      el("div", { class: "writer-actions" }, [publishButton, saveButton, previewButton, unpublishButton, deleteButton,
        el("a", { class: "btn btn-secondary", href: "#/updates" }, t("writer.backToUpdates"))]),
      options,
    );
    content.append(el("div", { class: "writer-account" }, [newButton,
      el("div", { class: "update-account-actions" }, [changePassword, signOut])]), publicationState, form, preview,
      el("details", { class: "update-manage" }, [el("summary", {}, t("writer.choose")), field("choose", selector)]), deleteDialog, passwordDialog);
    updateSelector(postId || ""); selectPost(known.has(postId) ? postId : ""); onChange();
  }
  content.appendChild(el("p", { role: "status" }, t("writer.checking")));
  getOwner().then(owner => owner ? openDesk(owner) : login()).catch(error => login(errorText(error)));
  return section;
}
