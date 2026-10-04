import { el, clear } from "../lib/dom.js";
import { t } from "../lib/i18n.js";
import blogPosts from "../data/blog.js";
import { isBlogConfigured, listPublishedPosts, getPublishedPost, getOwner } from "../lib/blogApi.js";
import { matchesTag } from "../lib/tags.js";
import { renderTagFilter } from "./tagFilter.js";
import { renderUpdate } from "./updatePost.js";
import { orderUpdates } from "../lib/updates.js";

function plusIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "24"); svg.setAttribute("height", "24");
  svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", "M12 5v14M5 12h14"); path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2"); path.setAttribute("stroke-linecap", "round");
  svg.appendChild(path); return svg;
}

export function renderBlog({ compose = false, postId = null, publishedId = null } = {}) {
  const status = el("p", { class: "blog-load-status", role: "status" });
  const notice = el("div", { class: "update-publish-notice", role: "status", "aria-live": "polite", tabindex: "-1", hidden: "" });
  const filters = el("div");
  const feed = el("div", { class: "updates-feed" });
  const composer = el("div", { class: "updates-composer-mount" });
  const section = el("section", { class: "section updates", id: "updates" },
    el("div", { class: "section-inner updates-inner" }, [
      el("header", { class: "updates-heading" }, [
        el("div", {}, [el("h1", { class: "section-heading" }, t("blog.heading")), el("p", { class: "section-subheading" }, t("blog.subheading"))]),
        el("a", { class: "updates-add", href: "#/updates?compose", "aria-label": t("blog.write"), title: t("blog.write") }, plusIcon()),
      ]),
      notice, composer, status, filters, feed,
    ]));
  let owner = null;
  let revision = 0;
  function show(posts, loaded = false) {
    clear(filters);
    if (publishedId && loaded) {
      const published = posts.some(post => post.id === publishedId && post.published);
      clear(notice);
      notice.dataset.state = published ? "success" : "error";
      notice.setAttribute("role", published ? "status" : "alert");
      notice.append(el("strong", {}, t(published ? "writer.live" : "writer.publishUnconfirmed")),
        el("div", { class: "update-publish-links" }, [
          published ? el("a", { href: `#/updates/${encodeURIComponent(publishedId)}` }, t("writer.viewUpdate")) : null,
          el("a", { href: `#/updates?edit=${encodeURIComponent(publishedId)}` }, t("blog.edit")),
        ]));
      notice.hidden = false;
      notice.focus({ preventScroll: true });
    } else notice.hidden = true;
    const ordered = orderUpdates(posts);
    function showFeed(tag) {
      clear(feed);
      const filtered = ordered.filter(post => matchesTag(post, tag));
      filtered.forEach(post => feed.appendChild(renderUpdate(post, { owner: Boolean(owner) })));
      if (!filtered.length) feed.appendChild(el("p", { class: "collection-empty" }, t(posts.length ? "filters.empty" : "blog.empty")));
    }
    const filter = renderTagFilter(posts, "blog", showFeed);
    if (posts.some(post => post.tags?.length)) filters.appendChild(filter.node);
    showFeed(filter.selected);
  }
  async function refresh() {
    const requestRevision = ++revision;
    if (!isBlogConfigured) { show(blogPosts); return; }
    try {
      const [posts, account] = await Promise.all([listPublishedPosts(), getOwner().catch(() => null)]);
      if (!section.isConnected || requestRevision !== revision) return;
      owner = account; status.textContent = ""; show(posts, true);
    } catch { if (requestRevision === revision) status.textContent = t("blog.loadError"); }
  }
  show(isBlogConfigured ? [] : blogPosts);
  if (isBlogConfigured) { status.textContent = t("blog.loading"); refresh(); }
  if (compose) {
    import("./blogWriter.js").then(({ renderBlogWriter }) => {
      if (section.isConnected) composer.appendChild(renderBlogWriter({ postId, onChange: refresh }));
    });
  }
  return section;
}

export function renderBlogPost(slug) {
  const content = el("div");
  const section = el("section", { class: "section updates" }, el("div", { class: "section-inner updates-inner" }, [
    el("a", { class: "back-link", href: "#/updates" }, `← ${t("blogDetail.back")}`), content,
  ]));
  function show(post) {
    clear(content);
    if (post) content.appendChild(renderUpdate(post));
    else content.appendChild(el("p", { class: "update-not-found", role: "status" }, t("blogDetail.notFound")));
  }
  if (isBlogConfigured) {
    content.appendChild(el("p", { role: "status" }, t("blog.loading")));
    getPublishedPost(slug).then(post => { if (section.isConnected) show(post); })
      .catch(() => { clear(content); content.appendChild(el("p", { role: "status" }, t("blog.loadError"))); });
  } else show(blogPosts.find(post => post.id === slug));
  return section;
}
