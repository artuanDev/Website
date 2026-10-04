import { el, clear } from "../lib/dom.js";
import { getLang, t } from "../lib/i18n.js";
import blogPosts from "../data/blog.js";
import { renderWritingCollection } from "./articles.js";
import { renderWritingDetail } from "./articleDetail.js";
import { isBlogConfigured, listPublishedPosts, getPublishedPost } from "../lib/blogApi.js";

export function renderBlog() {
  const mount = el("div");
  const status = el("p", { class: "blog-load-status", role: "status" });
  function show(posts) {
    clear(mount);
    const section = renderWritingCollection(posts, "blog");
    section.querySelector(".section-inner").prepend(
      el("a", { class: "back-link blog-owner-link", href: "#/write" }, t("blog.write"))
    );
    section.querySelector(".section-inner").appendChild(status);
    mount.appendChild(section);
  }
  show(isBlogConfigured ? [] : blogPosts);
  if (isBlogConfigured) {
    status.textContent = t("blog.loading");
    listPublishedPosts().then((posts) => {
      if (!mount.isConnected) return;
      status.textContent = "";
      show(posts);
    }).catch(() => { status.textContent = t("blog.loadError"); });
  }
  return mount;
}

export function renderBlogPost(slug) {
  if (isBlogConfigured) {
    const mount = el("div", { class: "section" }, el("p", { class: "section-inner", role: "status" }, t("blog.loading")));
    getPublishedPost(slug).then((post) => {
      if (!mount.isConnected) return;
      clear(mount);
      mount.className = "";
      mount.appendChild(renderWritingDetail(post, post?.story?.[getLang()] || post?.story?.en, "blog"));
    }).catch(() => {
      clear(mount);
      mount.appendChild(el("p", { class: "section-inner", role: "status" }, t("blog.loadError")));
    });
    return mount;
  }
  const post = blogPosts.find((entry) => entry.id === slug);
  return renderWritingDetail(post, post?.story?.[getLang()] || post?.story?.en, "blog");
}
