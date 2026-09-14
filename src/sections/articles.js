import { el } from "../lib/dom.js";
import { t, getEntryText } from "../lib/i18n.js";
import { navigateToArticle } from "../lib/router.js";
import articles from "../data/articles.js";

// Newest first, so the grid keeps itself ordered as articles are added.
function orderArticles(list) {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function renderCard(article, index) {
  const openArticle = () => navigateToArticle(article.id);

  const thumbNode = article.thumb
    ? el("img", {
        class: "article-card-thumb",
        src: article.thumb,
        alt: getEntryText(article, "title"),
        loading: "lazy",
      })
    : el("div", { class: "article-card-thumb article-card-thumb-placeholder" }, "AM");

  return el(
    "article",
    {
      class: `article-card article-card-${article.id}`,
      role: "button",
      tabindex: "0",
      onClick: openArticle,
      onKeydown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openArticle();
        }
      },
    },
    [
      el("div", { class: "article-card-media" }, [
        thumbNode,
        el("span", { class: "article-card-number", "aria-hidden": "true" }, String(index + 1).padStart(2, "0")),
        el("div", { class: "article-card-media-meta" }, [
          el("span", {}, t("articles.label")),
          el("span", {}, `${article.readingMinutes} ${t("articles.readingUnit")}`),
        ]),
      ]),
      el("div", { class: "article-card-body" }, [
        el("div", { class: "article-card-meta" }, [
          el("span", {}, getEntryText(article, "kicker")),
          el("time", { datetime: article.date }, getEntryText(article, "displayDate")),
        ]),
        el("h3", {}, getEntryText(article, "title")),
        el("p", { class: "article-card-summary" }, getEntryText(article, "summary")),
        el("ul", { class: "article-card-tags" }, article.tags.slice(0, 3).map((tag) => el("li", {}, tag))),
        el("span", { class: "article-card-link" }, t("articles.readArticle")),
      ]),
    ]
  );
}

export function renderArticles() {
  const ordered = orderArticles(articles);

  return el("section", { class: "section articles", id: "articles" }, [
    el("div", { class: "section-inner" }, [
      el("header", { class: "articles-heading" }, [
        el("p", { class: "articles-kicker" }, t("articles.kicker")),
        el("h2", { class: "section-heading" }, t("articles.heading")),
        el("p", { class: "section-subheading" }, t("articles.subheading")),
      ]),
      el("div", { class: "articles-grid" }, ordered.map(renderCard)),
    ]),
  ]);
}
