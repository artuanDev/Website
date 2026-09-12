// Quick-contact form: a short note (subject + message) delivered as an email
// through Web3Forms (https://web3forms.com). The site is fully static, so the
// submission goes straight from the browser to their API — there is no backend
// of our own. The access key is a public, per-inbox token; it is safe to ship in
// the bundle, but it lives in .env so it is easy to rotate.
//
// This form is deliberately kept to a quick message with no file uploads —
// anyone who needs to send attachments or write at length is pointed at the
// plain email address instead.

import { el } from "../lib/dom.js";
import { t } from "../lib/i18n.js";
import { CONTACT, WEB3FORMS } from "../config.js";

const ENDPOINT = "https://api.web3forms.com/submit";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Renders the "not configured yet" placeholder shown when no access key is set,
// so a missing key surfaces as an honest note rather than a form that silently
// fails for every visitor.
function renderUnconfigured() {
  return el("div", { class: "quick-contact quick-contact-unconfigured" }, [
    el("p", { class: "quick-contact-label" }, t("contact.quick.heading")),
    el("p", { class: "quick-contact-note" }, t("contact.quick.unconfigured")),
    el("a", { class: "btn btn-secondary", href: `mailto:${CONTACT.email}` }, CONTACT.email),
  ]);
}

export function renderQuickContact() {
  if (!WEB3FORMS.accessKey) return renderUnconfigured();

  let isSending = false;

  const status = el("p", { class: "quick-contact-status", role: "status", "aria-live": "polite" });
  const submitButton = el("button", { type: "submit", class: "btn btn-primary" }, t("contact.quick.send"));

  function setStatus(message, tone) {
    status.textContent = message || "";
    status.className = `quick-contact-status${tone ? ` is-${tone}` : ""}`;
  }

  const nameInput = el("input", {
    type: "text",
    id: "quick-name",
    name: "name",
    required: true,
    autocomplete: "name",
    placeholder: t("contact.quick.namePlaceholder"),
  });

  const emailInput = el("input", {
    type: "email",
    id: "quick-email",
    name: "email",
    required: true,
    autocomplete: "email",
    placeholder: t("contact.quick.emailPlaceholder"),
  });

  const subjectInput = el("input", {
    type: "text",
    id: "quick-subject",
    name: "subject",
    required: true,
    maxlength: "120",
    placeholder: t("contact.quick.subjectPlaceholder"),
  });

  const messageInput = el("textarea", {
    id: "quick-message",
    name: "message",
    required: true,
    rows: "6",
    placeholder: t("contact.quick.messagePlaceholder"),
  });

  // Web3Forms' honeypot: humans never see it, bots fill it in and the submission
  // is dropped.
  const botcheck = el("input", {
    type: "checkbox",
    name: "botcheck",
    class: "quick-contact-botcheck",
    tabindex: "-1",
    autocomplete: "off",
    "aria-hidden": "true",
    style: "display: none;",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSending) return;
    if (botcheck.checked) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !email || !subject || !message) {
      setStatus(t("contact.quick.errorRequired"), "error");
      return;
    }
    if (!isValidEmail(email)) {
      setStatus(t("contact.quick.errorEmail"), "error");
      return;
    }

    isSending = true;
    submitButton.disabled = true;
    submitButton.textContent = t("contact.quick.sending");
    setStatus(t("contact.quick.sending"));

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS.accessKey,
          subject: `[Portfolio] ${subject}`,
          from_name: WEB3FORMS.fromName,
          name,
          email,
          // So replying to the notification goes straight back to the sender.
          replyto: email,
          message,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success !== false) {
        setStatus(t("contact.quick.success"), "success");
        nameInput.value = "";
        emailInput.value = "";
        subjectInput.value = "";
        messageInput.value = "";
      } else {
        setStatus(t("contact.quick.error"), "error");
      }
    } catch (error) {
      console.error("[quick-contact] submission failed", error);
      setStatus(t("contact.quick.error"), "error");
    } finally {
      isSending = false;
      submitButton.disabled = false;
      submitButton.textContent = t("contact.quick.send");
    }
  }

  function field(labelKey, control, inputId) {
    return el("div", { class: "quick-contact-field" }, [
      el("label", { for: inputId }, t(labelKey)),
      control,
    ]);
  }

  return el("form", { class: "quick-contact", novalidate: true, onSubmit: handleSubmit }, [
    el("div", { class: "quick-contact-header" }, [
      el("p", { class: "quick-contact-label" }, t("contact.quick.heading")),
      el("p", { class: "quick-contact-note" }, t("contact.quick.note")),
    ]),
    el("div", { class: "quick-contact-row" }, [
      field("contact.quick.name", nameInput, "quick-name"),
      field("contact.quick.email", emailInput, "quick-email"),
    ]),
    field("contact.quick.subject", subjectInput, "quick-subject"),
    field("contact.quick.message", messageInput, "quick-message"),
    botcheck,
    el("div", { class: "quick-contact-actions" }, [submitButton, status]),
    el("p", { class: "quick-contact-detailed" }, [
      el("span", {}, t("contact.quick.detailed")),
      el("a", { href: `mailto:${CONTACT.email}` }, CONTACT.email),
    ]),
  ]);
}
