import { el } from "../lib/dom.js";
import { t } from "../lib/i18n.js";

export function renderHero({ onCtaClick }) {
  return el("section", { class: "hero", id: "hero" }, [
    el("div", { class: "hero-inner" }, [
      el("p", { class: "hero-kicker" }, t("hero.kicker")),
      el("h1", { class: "hero-name" }, t("hero.name")),
      el("p", { class: "hero-tagline" }, t("hero.tagline")),
      el("p", { class: "hero-location" }, t("hero.location")),
      el(
        "button",
        {
          class: "btn btn-primary",
          onClick: (e) => {
            e.preventDefault();
            onCtaClick();
          },
        },
        t("hero.cta")
      ),
    ]),
  ]);
}
