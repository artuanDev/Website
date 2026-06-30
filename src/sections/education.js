import { el } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";
import education from "../data/education.js";

export function renderEducation() {
  const items = education.map((entry) => {
    const localized = entry.i18n[getLang()] || entry.i18n.en;
    return el("article", { class: "education-item" }, [
      el("div", {}, [
        el("h3", {}, localized.institution),
        el("p", { class: "education-program" }, localized.program),
      ]),
      el("span", { class: "education-dates" }, entry.dateRange),
    ]);
  });

  return el("section", { class: "section education", id: "education" }, [
    el("div", { class: "section-inner" }, [
      el("h2", { class: "section-heading" }, t("education.heading")),
      el("div", { class: "education-list" }, items),
    ]),
  ]);
}
