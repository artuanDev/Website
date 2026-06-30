import { el, clear } from "../lib/dom.js";
import { t, getLang } from "../lib/i18n.js";
import { CONTACT, CV_PATHS, FORMSPREE_ENDPOINT, isFormspreeConfigured } from "../config.js";

function renderDirectLinks() {
  return el("div", { class: "contact-links" }, [
    el("a", { class: "contact-link", href: `mailto:${CONTACT.email}` }, [
      el("strong", {}, t("contact.email")),
      el("span", {}, CONTACT.email),
    ]),
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
      [el("strong", {}, "Artstation"), el("span", {}, "antonio_mata")]
    ),
  ]);
}

function renderCvDownload() {
  const lang = getLang();
  return el("div", { class: "cv-download" }, [
    el("h3", { class: "section-subheading" }, t("contact.cvHeading")),
    el(
      "a",
      { class: "btn btn-secondary", href: CV_PATHS[lang], download: "" },
      t("contact.downloadCv")
    ),
  ]);
}

function renderForm() {
  const status = el("p", { class: "form-status", "aria-live": "polite" });

  if (!isFormspreeConfigured) {
    status.textContent = t("contact.formNotConfigured");
    status.classList.add("form-status-info");
    return el("div", { class: "contact-form" }, [status]);
  }

  const nameInput = el("input", { type: "text", name: "name", id: "cf-name", required: "true" });
  const emailInput = el("input", { type: "email", name: "email", id: "cf-email", required: "true" });
  const messageInput = el("textarea", { name: "message", id: "cf-message", rows: "5", required: "true" });
  const submitBtn = el("button", { type: "submit", class: "btn btn-primary" }, t("contact.formSubmit"));

  const form = el(
    "form",
    {
      class: "contact-form-fields",
      onSubmit: async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = t("contact.formSending");
        status.textContent = "";
        status.className = "form-status";

        try {
          const response = await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" },
          });
          if (response.ok) {
            status.textContent = t("contact.formSuccess");
            status.classList.add("form-status-success");
            form.reset();
          } else {
            throw new Error("Formspree request failed");
          }
        } catch {
          status.textContent = t("contact.formError");
          status.classList.add("form-status-error");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = t("contact.formSubmit");
        }
      },
    },
    [
      el("label", { for: "cf-name" }, t("contact.formName")),
      nameInput,
      el("label", { for: "cf-email" }, t("contact.formEmail")),
      emailInput,
      el("label", { for: "cf-message" }, t("contact.formMessage")),
      messageInput,
      submitBtn,
      status,
    ]
  );

  return el("div", { class: "contact-form" }, [form]);
}

export function renderContact() {
  return el("section", { class: "section contact", id: "contact" }, [
    el("div", { class: "section-inner" }, [
      el("h2", { class: "section-heading" }, t("contact.heading")),
      el("p", { class: "section-subheading" }, t("contact.subheading")),
      el("div", { class: "contact-grid" }, [renderDirectLinks(), renderForm()]),
      renderCvDownload(),
    ]),
  ]);
}
