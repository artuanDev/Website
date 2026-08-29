import { el } from "../lib/dom.js";
import { t } from "../lib/i18n.js";

export function renderHero({ onCtaClick }) {
  return el("section", { class: "hero", id: "hero" }, [
    el("div", { class: "hero-inner" }, [
      el("div", { class: "hero-layout" }, [
        el("div", { class: "hero-copy" }, [
          el("p", { class: "hero-kicker" }, t("hero.kicker")),
          el("h1", { class: "hero-name" }, t("hero.name")),
          el("p", { class: "hero-tagline" }, t("hero.tagline")),
          el("div", { class: "hero-actions" }, [
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
            el("span", { class: "hero-location" }, t("hero.location")),
          ]),
        ]),
        el("aside", { class: "hero-focus", "aria-label": t("hero.focusLabel") }, [
          el("p", { class: "hero-focus-label" }, t("hero.focusLabel")),
          el("ol", { class: "hero-focus-list" }, t("hero.focusAreas").map((area, index) =>
            el("li", {}, [el("span", {}, String(index + 1).padStart(2, "0")), el("strong", {}, area)])
          )),
        ]),
      ]),
    ]),
  ]);
}
