import { el } from "../lib/dom.js";
import { t } from "../lib/i18n.js";
import { navigateToRecommendation } from "../lib/router.js";
import recommendations from "../data/recommendations.js";

function previewText(recommendation) {
  const firstParagraph = recommendation.body[0];
  return firstParagraph.length > 220 ? `${firstParagraph.slice(0, 217).trimEnd()}…` : firstParagraph;
}

function renderRecommendationCard(recommendation, index) {
  const openRecommendation = () => navigateToRecommendation(recommendation.id);

  return el("article", {
    class: "recommendation-card",
    role: "button",
    tabindex: "0",
    onClick: openRecommendation,
    onKeydown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openRecommendation();
      }
    },
  }, [
    el("div", { class: "recommendation-card-visual", "aria-hidden": "true" }, [
      el("span", { class: "recommendation-card-number" }, String(index + 1).padStart(2, "0")),
      el("span", { class: "recommendation-card-initials" }, recommendation.initials),
      el("span", { class: "recommendation-card-mark" }, "“"),
    ]),
    el("div", { class: "recommendation-card-body" }, [
      el("div", { class: "recommendation-card-meta" }, [
        el("span", {}, recommendation.source === "letter" ? t("recommendations.formalLetter") : t("recommendations.linkedin")),
        el("time", {}, recommendation.date),
      ]),
      el("h3", {}, recommendation.author),
      el("p", { class: "recommendation-card-role" }, recommendation.role),
      el("p", { class: "recommendation-card-preview" }, previewText(recommendation)),
      el("span", { class: "recommendation-card-link" }, t("recommendations.readRecommendation")),
    ]),
  ]);
}

export function renderRecommendations() {
  return el("section", { class: "section recommendations", id: "recommendations" }, [
    el("div", { class: "section-inner" }, [
      el("header", { class: "recommendations-heading" }, [
        el("p", { class: "recommendations-kicker" }, t("recommendations.kicker")),
        el("h2", { class: "section-heading" }, t("recommendations.heading")),
        el("p", { class: "section-subheading" }, t("recommendations.subheading")),
      ]),
      el("div", { class: "recommendations-grid" }, recommendations.map(renderRecommendationCard)),
    ]),
  ]);
}
