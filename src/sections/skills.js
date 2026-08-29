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

  const softItems = softSkills.map((skill, index) => {
    const localized = skill.i18n[lang] || skill.i18n.en;
    return el("article", { class: "soft-skill" }, [
      el("span", { class: "soft-skill-index", "aria-hidden": "true" }, String(index + 1).padStart(2, "0")),
      el("div", {}, [
        el("h4", {}, localized.title),
        el("p", {}, localized.description),
      ]),
    ]);
  });

  const languageItems = languages.map((entry) => {
    const localized = entry.i18n[lang] || entry.i18n.en;
    return el("li", { class: "language-item" }, [
      el("span", { class: "language-code", "aria-hidden": "true" }, entry.id === "spanish" ? "ES" : "EN"),
      el("div", {}, [
        el("span", { class: "language-name" }, localized.name),
        el("span", { class: "language-level" }, localized.level),
      ]),
    ]);
  });

  return el("section", { class: "section skills", id: "skills" }, [
    el("div", { class: "section-inner" }, [
      el("div", { class: "skills-header" }, [
        el("p", { class: "skills-kicker" }, t("skills.kicker")),
        el("h2", { class: "section-heading" }, t("skills.heading")),
        el("p", { class: "skills-intro" }, t("skills.intro")),
      ]),
      el("div", { class: "skills-subsection technical-skills-section" }, [
        el("div", { class: "skills-subsection-heading" }, [
          el("span", {}, "01"),
          el("h3", {}, t("skills.technicalHeading")),
        ]),
        el("div", { class: "skill-groups" }, technicalGroups),
      ]),
      el("div", { class: "skills-subsection soft-skills-section" }, [
        el("div", { class: "skills-subsection-heading" }, [
          el("span", {}, "02"),
          el("div", {}, [el("h3", {}, t("skills.softHeading")), el("p", {}, t("skills.softIntro"))]),
        ]),
        el("div", { class: "soft-skills-grid" }, softItems),
      ]),
      el("div", { class: "skills-subsection language-section" }, [
        el("div", { class: "skills-subsection-heading" }, [
          el("span", {}, "03"),
          el("div", {}, [el("h3", {}, t("skills.languagesHeading")), el("p", {}, t("skills.languagesIntro"))]),
        ]),
        el("ul", { class: "language-list" }, languageItems),
      ]),
    ]),
  ]);
}
