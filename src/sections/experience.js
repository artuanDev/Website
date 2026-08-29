import { el } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";
import experience from "../data/experience.js";

export function renderExperience() {
  const items = experience.map((entry, entryIndex) => {
    const localized = entry.i18n[getLang()] || entry.i18n.en;
    return el("article", { class: "experience-item" }, [
      el("header", { class: "experience-card-header" }, [
        el("span", { class: "experience-index", "aria-hidden": "true" }, String(entryIndex + 1).padStart(2, "0")),
        el("div", { class: "experience-title-group" }, [
          el("p", { class: "experience-company" }, entry.company),
          el("h3", {}, localized.title),
          el("p", { class: "experience-summary" }, localized.summary),
        ]),
        el("div", { class: "experience-card-meta" }, [
          el("span", { class: "experience-dates" }, entry.dateRange),
          el("ul", { class: "experience-tech" }, entry.tech.map((item) => el("li", {}, item))),
        ]),
      ]),
      el("div", { class: "experience-impact" }, [
        el("p", { class: "experience-impact-label" }, t("experience.impact")),
        el("ol", { class: "experience-bullets" }, localized.bullets.map((bullet, bulletIndex) =>
          el("li", {}, [
            el("span", { "aria-hidden": "true" }, String(bulletIndex + 1).padStart(2, "0")),
            el("p", {}, bullet),
          ])
        )),
      ]),
    ]);
  });

  return el("section", { class: "section experience", id: "experience" }, [
    el("div", { class: "section-inner" }, [
      el("div", { class: "experience-page-heading" }, [
        el("p", { class: "experience-kicker" }, t("experience.kicker")),
        el("h2", { class: "section-heading" }, t("experience.heading")),
        el("p", {}, t("experience.intro")),
      ]),
      el("div", { class: "experience-list" }, items),
    ]),
  ]);
}
