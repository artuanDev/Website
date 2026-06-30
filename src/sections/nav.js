import { el } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";

const NAV_ITEMS = [
  { id: "about", key: "nav.about" },
  { id: "experience", key: "nav.experience" },
  { id: "education", key: "nav.education" },
  { id: "portfolio", key: "nav.portfolio" },
  { id: "skills", key: "nav.skills" },
  { id: "contact", key: "nav.contact" },
];

export function renderNav({ activeSection, isHome, onNavClick, onLangSelect, onBrandClick }) {
  const linksList = el(
    "ul",
    { class: "nav-links", id: "nav-links" },
    NAV_ITEMS.map((item) => {
      const isActive = item.id === activeSection;
      return el("li", {}, [
        el(
          "a",
          {
            class: isActive ? "nav-link active" : "nav-link",
            href: `#/${item.id}`,
            "aria-current": isActive ? "page" : null,
            onClick: (e) => {
              e.preventDefault();
              closeMobileMenu();
              onNavClick(item.id);
            },
          },
          t(item.key)
        ),
      ]);
    })
  );

  const toggleBtn = el(
    "button",
    {
      class: "nav-toggle",
      "aria-label": "Toggle navigation menu",
      "aria-expanded": "false",
      onClick: () => {
        const isOpen = nav.classList.toggle("nav-open");
        toggleBtn.setAttribute("aria-expanded", String(isOpen));
      },
    },
    [el("span"), el("span"), el("span")]
  );

  function closeMobileMenu() {
    nav.classList.remove("nav-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  // Segmented language switch: both languages are always visible, the active
  // one is highlighted, so it's obvious which language you're viewing and what
  // clicking will switch to.
  const currentLang = getLang();
  const langSwitch = el(
    "div",
    { class: "lang-switch", role: "group", "aria-label": t("nav.langLabel") },
    [
      langOption("en", "EN"),
      langOption("es", "ES"),
    ]
  );

  function langOption(lang, label) {
    const isActive = currentLang === lang;
    return el(
      "button",
      {
        class: isActive ? "lang-option active" : "lang-option",
        "aria-pressed": String(isActive),
        title: t(`nav.langTitle.${lang}`),
        onClick: () => onLangSelect(lang),
      },
      label
    );
  }

  const brand = el(
    "a",
    {
      class: isHome ? "nav-brand active" : "nav-brand",
      href: "#/",
      "aria-label": "Home",
      onClick: (e) => {
        e.preventDefault();
        closeMobileMenu();
        onBrandClick();
      },
    },
    "AM"
  );

  const nav = el("header", { class: "site-nav" }, [
    el("div", { class: "nav-inner" }, [brand, linksList, el("div", { class: "nav-actions" }, [langSwitch, toggleBtn])]),
  ]);

  return nav;
}
