import { el } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";
import { technicalSkills, softSkills, languages } from "../data/skills.js";

export function renderSkills() {
  const lang = getLang();

  const technicalGroups = technicalSkills.map((group) => {
    const localized = group.i18n[lang] || group.i18n.en;
    return el("div", { class: "skill-group" }, [
      el("h3", {}, localized.category),
      el(
        "ul",
        { class: "skill-tags" },
        group.items.map((item) => el("li", {}, item))
      ),
    ]);
  });

  const softItems = softSkills.map((skill) => {
    const localized = skill.i18n[lang] || skill.i18n.en;
    return el("article", { class: "soft-skill" }, [
      el("h4", {}, localized.title),
      el("p", {}, localized.description),
    ]);
  });

  const languageItems = languages.map((entry) => {
    const localized = entry.i18n[lang] || entry.i18n.en;
    return el("li", { class: "language-item" }, [
      el("span", { class: "language-name" }, localized.name),
      el("span", { class: "language-level" }, localized.level),
    ]);
  });

  return el("section", { class: "section skills", id: "skills" }, [
    el("div", { class: "section-inner" }, [
      el("h2", { class: "section-heading" }, t("skills.heading")),
      el("div", { class: "skill-groups" }, technicalGroups),

      el("h3", { class: "section-subheading" }, t("skills.softHeading")),
      el("div", { class: "soft-skills-grid" }, softItems),

      el("h3", { class: "section-subheading" }, t("skills.languagesHeading")),
      el("ul", { class: "language-list" }, languageItems),
    ]),
  ]);
}
