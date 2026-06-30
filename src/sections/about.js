import { el, paragraphs } from "../lib/dom.js";
import { t } from "../lib/i18n.js";

export function renderAbout() {
  return el("section", { class: "section about", id: "about" }, [
    el("div", { class: "section-inner about-inner" }, [
      el("img", {
        class: "about-portrait",
        src: "/profile.jpg",
        alt: t("hero.name"),
        loading: "lazy",
      }),
      el("div", { class: "about-text" }, [
        el("h2", { class: "section-heading" }, t("about.heading")),
        ...paragraphs(t("about.body")),
      ]),
    ]),
  ]);
}
