import { el } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";
import { navigateToSection } from "../lib/router.js";
import recommendations from "../data/recommendations.js";

function renderNotFound() {
  return el("section", { class: "section recommendation-not-found" }, [
    el("div", { class: "section-inner" }, [
      el("h2", { class: "section-heading" }, t("recommendationDetail.notFound")),
      el("button", {
        class: "btn btn-secondary",
        type: "button",
        onClick: () => navigateToSection("recommendations"),
      }, `← ${t("recommendationDetail.back")}`),
    ]),
  ]);
}

function renderSourceLink(recommendation) {
  return el("a", {
    class: "btn btn-secondary recommendation-source-link",
    href: recommendation.sourceUrl,
    target: "_blank",
    rel: "noopener noreferrer",
  }, recommendation.source === "letter" ? t("recommendationDetail.openPdf") : t("recommendationDetail.openLinkedIn"));
}

export function renderRecommendationDetail(slug) {
  const recommendation = recommendations.find((entry) => entry.id === slug);
  if (!recommendation) return renderNotFound();

  const index = recommendations.indexOf(recommendation) + 1;
  const localized = { ...recommendation, ...(recommendation.i18n?.[getLang()] || {}) };

  return el("section", { class: "recommendation-detail" }, [
    el("div", { class: "recommendation-detail-shell" }, [
      el("a", {
        class: "back-link recommendation-back-link",
        href: "#/recommendations",
        onClick: (event) => {
          event.preventDefault();
          navigateToSection("recommendations");
        },
      }, `← ${t("recommendationDetail.back")}`),
      el("header", { class: "recommendation-detail-hero" }, [
        el("div", { class: "recommendation-detail-index", "aria-hidden": "true" }, String(index).padStart(2, "0")),
        el("div", { class: "recommendation-detail-title" }, [
          el("p", { class: "recommendation-detail-kicker" }, recommendation.source === "letter" ? t("recommendations.formalLetter") : t("recommendations.linkedin")),
          el("h1", {}, recommendation.author),
          el("p", { class: "recommendation-detail-role" }, localized.role),
        ]),
        el("dl", { class: "recommendation-detail-meta" }, [
          el("div", {}, [el("dt", {}, t("recommendationDetail.date")), el("dd", {}, localized.date)]),
          el("div", {}, [el("dt", {}, t("recommendationDetail.context")), el("dd", {}, localized.relationship)]),
          el("div", {}, [el("dt", {}, t("recommendationDetail.language")), el("dd", {}, localized.language)]),
        ]),
      ]),
      el("article", { class: "recommendation-letter" }, [
        el("aside", { class: "recommendation-letter-aside" }, [
          el("span", { class: "recommendation-letter-initials", "aria-hidden": "true" }, recommendation.initials),
        ]),
        el("div", { class: "recommendation-letter-copy" }, [
          el("span", { class: "recommendation-quote-mark", "aria-hidden": "true" }, "“"),
          localized.salutation ? el("p", { class: "recommendation-salutation" }, localized.salutation) : null,
          ...localized.body.map((paragraph) => el("p", {}, paragraph)),
          localized.signature
            ? el("div", { class: "recommendation-signature" }, localized.signature.map((line) => el("span", {}, line)))
            : el("div", { class: "recommendation-signature" }, [
                el("span", {}, recommendation.author),
                el("span", {}, localized.role),
              ]),
        ]),
      ]),
      el("footer", { class: "recommendation-detail-footer" }, [
        el("div", {}, [
          el("p", { class: "recommendation-detail-kicker" }, t("recommendationDetail.source")),
          el("p", {}, recommendation.source === "letter" ? t("recommendationDetail.sourcePdf") : t("recommendationDetail.sourceLinkedIn")),
        ]),
        renderSourceLink(recommendation),
      ]),
    ]),
  ]);
}
