import { el } from "../lib/dom.js";
import { t } from "../lib/i18n.js";

export function renderFooter() {
  const year = new Date().getFullYear();
  return el("footer", { class: "site-footer" }, [
    el("p", {}, `© ${year} Antonio Mata Marín — ${t("footer.rights")}`),
  ]);
}
