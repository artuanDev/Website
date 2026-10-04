import { el } from "../lib/dom.js";
import { getLang, t } from "../lib/i18n.js";

function inline(text = "") {
  return text.split(/(https?:\/\/[^\s<>]+|\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).flatMap((part) => {
    if (/^https?:\/\//.test(part)) {
      const url = part.replace(/[.,!?;:]+$/, "");
      return [el("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, url), part.slice(url.length)];
    }
    if (part.startsWith("**") && part.endsWith("**")) return el("strong", {}, part.slice(2, -2));
    if (part.startsWith("`") && part.endsWith("`")) return el("code", {}, part.slice(1, -1));
    return part;
  });
}

function blockNode(block) {
  if (block.type === "chapter") return el("h3", {}, block.title);
  if (block.type === "code") return el("pre", {}, el("code", {}, block.code));
  if (block.type === "figure") return el("figure", {}, [
    el("a", { href: block.src, target: "_blank", rel: "noopener noreferrer" },
      el("img", { src: block.src, alt: block.alt || "", loading: "lazy" })),
    block.caption ? el("figcaption", {}, block.caption) : null,
  ]);
  if (block.type === "figures") return el("div", { class: "update-images" }, block.items.map(item => blockNode({ ...item, type: "figure" })));
  if (block.type === "note") return el("aside", {}, [block.label ? el("strong", {}, block.label) : null, el("p", {}, inline(block.text))]);
  if (block.text) return el("p", {}, inline(block.text));
  return null;
}

export function renderUpdate(post, { owner = false, preview = false } = {}) {
  const text = post.i18n[getLang()] || post.i18n.en;
  const story = post.story[getLang()] || post.story.en;
  const date = post.date ? new Date(`${post.date}T12:00:00`).toLocaleDateString(getLang(), { day: "numeric", month: "short", year: "numeric" }) : "";
  return el("article", { class: "update-post", "data-update-id": post.id }, [
    el("header", { class: "update-meta" }, [
      preview ? el("time", { datetime: post.date }, date) : el("a", { href: `#/updates/${encodeURIComponent(post.id)}`, class: "update-permalink", "aria-label": `${t("blog.permalink")} ${date}` }, el("time", { datetime: post.date }, date)),
      owner ? el("a", { class: "update-edit", href: `#/updates?edit=${encodeURIComponent(post.id)}` }, t("blog.edit")) : null,
    ]),
    !post.autoTitle && text.title ? el("h2", { class: "update-title" }, text.title) : null,
    el("div", { class: "update-body" }, story.blocks.map(blockNode)),
    (post.tags?.length || post.links?.linkedin) ? el("footer", { class: "update-footer" }, [
      el("ul", { class: "update-tags" }, (post.tags || []).map(tag => el("li", {}, tag))),
      post.links?.linkedin ? el("a", { href: post.links.linkedin, target: "_blank", rel: "noopener noreferrer" }, t("blog.link")) : null,
    ]) : null,
  ]);
}
