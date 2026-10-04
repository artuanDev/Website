import { el } from "../lib/dom.js";
import { t } from "../lib/i18n.js";
import { collectTags } from "../lib/tags.js";

// Retain each collection's selection when returning from a detail or changing language.
const selections = new Map();

export function renderTagFilter(entries, collection, onChange) {
  const tags = collectTags(entries);
  let selected = selections.get(collection) ?? null;
  if (!tags.includes(selected)) selected = null;

  const buttons = [null, ...tags].map((tag) => el("button", {
    type: "button",
    class: `filter-btn${tag === selected ? " active" : ""}`,
    "aria-pressed": String(tag === selected),
    onClick: () => {
      selected = tag;
      selections.set(collection, tag);
      buttons.forEach((button, index) => {
        const active = [null, ...tags][index] === tag;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      onChange(tag);
    },
  }, tag ?? t("filters.allTags")));

  return {
    selected,
    node: el("div", { class: "tag-filter" }, [
      el("p", { class: "filter-label" }, t("filters.tags")),
      el("div", { class: "filter-bar", role: "group", "aria-label": t("filters.tags") }, buttons),
    ]),
  };
}
