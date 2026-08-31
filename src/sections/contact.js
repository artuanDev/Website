import { el } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";
import { CONTACT, CV_PATHS } from "../config.js";

function renderDirectLinks() {
  return el("div", { class: "contact-directory" }, [
    el("p", { class: "contact-directory-heading" }, t("contact.directHeading")),
    el("div", { class: "contact-links" }, [
      el("a", { class: "contact-link", href: `tel:${CONTACT.phoneHref}` }, [
        el("strong", {}, t("contact.phone")),
        el("span", {}, CONTACT.phone),
      ]),
      el(
        "a",
        { class: "contact-link", href: CONTACT.linkedin, target: "_blank", rel: "noopener noreferrer" },
        [el("strong", {}, "LinkedIn"), el("span", {}, "in/antonio-mata-marín")]
      ),
      el(
        "a",
        { class: "contact-link", href: CONTACT.artstation, target: "_blank", rel: "noopener noreferrer" },
        [el("strong", {}, "ArtStation"), el("span", {}, "antonio_mata")]
      ),
    ]),
  ]);
}

function renderCvDownload() {
  const lang = getLang();
  return el("div", { class: "cv-download" }, [
    el("div", {}, [
      el("p", { class: "cv-download-label" }, t("contact.cvHeading")),
      el("p", { class: "cv-download-note" }, t("contact.cvNote")),
    ]),
    el(
      "a",
      { class: "btn btn-secondary", href: CV_PATHS[lang], download: "" },
      t("contact.downloadCv")
    ),
  ]);
}

export function renderContact() {
  return el("section", { class: "section contact", id: "contact" }, [
    el("div", { class: "section-inner" }, [
      el("header", { class: "contact-header" }, [
        el("p", { class: "contact-kicker" }, t("contact.kicker")),
        el("h2", { class: "section-heading" }, t("contact.heading")),
        el("p", { class: "section-subheading" }, t("contact.subheading")),
      ]),
      el("div", { class: "contact-grid" }, [
        el("div", { class: "contact-primary" }, [
          el("p", { class: "contact-primary-label" }, t("contact.emailCta")),
          el("a", { class: "contact-email", href: `mailto:${CONTACT.email}` }, CONTACT.email),
          el("p", { class: "contact-note" }, t("contact.emailNote")),
        ]),
        renderDirectLinks(),
      ]),
      renderCvDownload(),
    ]),
  ]);
}
