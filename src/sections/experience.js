import { el } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";
import experience from "../data/experience.js";

export function renderExperience() {
  const items = experience.map((entry) => {
    const localized = entry.i18n[getLang()] || entry.i18n.en;
    return el("article", { class: "experience-item" }, [
      el("div", { class: "experience-meta" }, [
        el("h3", {}, localized.title),
        el("span", { class: "experience-company" }, entry.company),
        el("span", { class: "experience-dates" }, entry.dateRange),
      ]),
      el(
        "ul",
        { class: "experience-bullets" },
        localized.bullets.map((bullet) => el("li", {}, bullet))
      ),
    ]);
  });

  return el("section", { class: "section experience", id: "experience" }, [
    el("div", { class: "section-inner" }, [
      el("h2", { class: "section-heading" }, t("experience.heading")),
      el("div", { class: "experience-list" }, items),
    ]),
  ]);
}
