import { el } from "../lib/dom.js";
import { t, getLang, getEntryText } from "../lib/i18n.js";
import { navigateToSection } from "../lib/router.js";
import articles from "../data/articles.js";
import articleStories from "../data/articleStories.js";

// Very small inline formatter for the article body: **bold**, `code` and
// *italic*. Returns DOM nodes rather than HTML so nothing has to be escaped.
const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;

function inline(text) {
  return text.split(INLINE_PATTERN).filter(Boolean).map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) return el("strong", {}, part.slice(2, -2));
    if (part.startsWith("`") && part.endsWith("`")) return el("code", {}, part.slice(1, -1));
    if (part.startsWith("*") && part.endsWith("*")) return el("em", {}, part.slice(1, -1));
    return document.createTextNode(part);
  });
}

function renderChapter(block) {
  return el("header", { class: "article-chapter" }, [
    el("span", { class: "article-chapter-number", "aria-hidden": "true" }, block.number),
    el("div", {}, [
      el("p", { class: "article-eyebrow" }, block.eyebrow),
      el("h2", {}, block.title),
    ]),
  ]);
}

function renderFigure(figure, className = "article-figure") {
  return el("figure", { class: className }, [
    el("img", { src: figure.src, alt: figure.alt, loading: "lazy" }),
    figure.caption ? el("figcaption", {}, figure.caption) : null,
  ]);
}

function renderVideo(video) {
  return el("figure", { class: "article-figure article-video" }, [
    el("video", {
      src: video.src,
      poster: video.poster,
      controls: "",
      playsinline: "",
      preload: "metadata",
    }),
    video.caption ? el("figcaption", {}, video.caption) : null,
  ]);
}

function renderBlock(block) {
  switch (block.type) {
    case "lead":
      return el("p", { class: "article-lead" }, inline(block.text));
    case "p":
      return el("p", { class: "article-paragraph" }, inline(block.text));
    case "statement":
      return el("p", { class: "article-statement" }, inline(block.text));
    case "chapter":
      return renderChapter(block);
    case "formula":
      return el("figure", { class: "article-formula" }, [
        el("p", {}, block.text),
        block.caption ? el("figcaption", {}, block.caption) : null,
      ]);
    case "code":
      return el("figure", { class: "article-code" }, [
        block.label ? el("figcaption", {}, block.label) : null,
        el("pre", {}, el("code", {}, block.code)),
      ]);
    case "note":
      return el("aside", { class: "article-note" }, [
        el("p", { class: "article-note-label" }, block.label),
        el("p", {}, inline(block.text)),
      ]);
    case "values":
      return el("div", { class: "article-values" }, block.items.map(([value, label, text]) =>
        el("div", { class: "article-value" }, [
          el("span", { class: "article-value-number" }, value),
          el("p", { class: "article-value-label" }, label),
          el("p", { class: "article-value-text" }, text),
        ])
      ));
    case "figure":
      return renderFigure(block);
    case "figures":
      return el("div", { class: "article-figure-pair" }, block.items.map((item) =>
        renderFigure(item, "article-figure article-figure-compact")
      ));
    case "video":
      return renderVideo(block);
    default:
      return null;
  }
}

function renderNotFound() {
  return el("section", { class: "section article-not-found" }, [
    el("div", { class: "section-inner" }, [
      el("h2", { class: "section-heading" }, t("articleDetail.notFound")),
      el("button", {
        class: "btn btn-secondary",
        type: "button",
        onClick: () => navigateToSection("articles"),
      }, `← ${t("articleDetail.back")}`),
    ]),
  ]);
}

export function renderArticleDetail(slug) {
  const article = articles.find((entry) => entry.id === slug);
  if (!article) return renderNotFound();

  const language = getLang() === "es" ? "es" : "en";
  const story = articleStories[article.id]?.[language] || articleStories[article.id]?.en;

  if (!story) {
    throw new Error(`Missing article body for "${article.id}"`);
  }

  return el("section", { class: `article-detail article-detail-${article.id}` }, [
    el("div", { class: "article-shell" }, [
      el("a", {
        class: "back-link article-back-link",
        href: "#/articles",
        onClick: (event) => {
          event.preventDefault();
          navigateToSection("articles");
        },
      }, `← ${t("articleDetail.back")}`),

      el("header", { class: "article-hero" }, [
        el("p", { class: "article-eyebrow" }, story.eyebrow),
        el("h1", {}, getEntryText(article, "title")),
        el("p", { class: "article-hero-deck" }, getEntryText(article, "summary")),
        el("div", { class: "article-hero-meta" }, [
          el("time", { datetime: article.date }, getEntryText(article, "displayDate")),
          el("span", { class: "article-hero-dot", "aria-hidden": "true" }, "·"),
          el("span", {}, `${article.readingMinutes} ${t("articles.readingUnit")}`),
          el("span", { class: "article-hero-dot", "aria-hidden": "true" }, "·"),
          el("span", {}, article.tags.join(" · ")),
        ]),
      ]),

      el("article", { class: "article-body" }, story.blocks.map(renderBlock)),

      el("footer", { class: "article-footer" }, [
        el("div", {}, [
          el("p", { class: "article-eyebrow" }, t("articleDetail.source")),
          el("p", {}, t("articleDetail.sourceNote")),
        ]),
        article.links?.repo
          ? el("a", {
              class: "btn btn-secondary",
              href: article.links.repo,
              target: "_blank",
              rel: "noopener noreferrer",
            }, t("articleDetail.openRepo"))
          : null,
      ]),

      el("div", { class: "article-closing" }, [
        el("button", {
          class: "btn btn-secondary",
          type: "button",
          onClick: () => navigateToSection("articles"),
        }, `← ${t("articleDetail.back")}`),
      ]),
    ]),
  ]);
}
