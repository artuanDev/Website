import { el, clear } from "../lib/dom.js";
import { t, getProjectText } from "../lib/i18n.js";
import projects from "../data/projects.js";
import { navigateToProject } from "../lib/router.js";

const FILTERS = [
  { id: "all", key: "portfolio.filterAll" },
  { id: "work", key: "portfolio.filterWork" },
  { id: "personal", key: "portfolio.filterPersonal" },
];

let activeFilter = "all";

function getPreviewText(project) {
  return getProjectText(project, "summary")
    .replace(/\s+/g, " ")
    .trim();
}

function renderCard(project) {
  const thumbNode = project.thumb
    ? el("img", { class: "card-thumb", src: project.thumb, alt: getProjectText(project, "title"), loading: "lazy" })
    : el("div", { class: "card-thumb card-thumb-placeholder" }, "AM");

  return el(
    "article",
    {
      class: "project-card",
      onClick: () => navigateToProject(project.id),
      role: "button",
      tabindex: "0",
      onKeydown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateToProject(project.id);
        }
      },
    },
    [
      el("div", { class: "card-media" }, [
        thumbNode,
        el("div", { class: "card-media-meta" }, [
          el("span", { class: "card-category" }, project.category === "work" ? t("portfolio.workLabel") : t("portfolio.personalLabel")),
          el("span", { class: "card-year" }, project.year),
        ]),
      ]),
      el("div", { class: "card-body" }, [
        el("h3", {}, getProjectText(project, "title")),
        el("p", { class: "card-summary" }, getPreviewText(project)),
        el(
          "ul",
          { class: "card-tags" },
          project.tech.slice(0, 3).map((tag) => el("li", {}, tag))
        ),
        el("span", { class: "card-link" }, t("portfolio.viewProject")),
      ]),
    ]
  );
}

export function renderPortfolio() {
  const grid = el("div", { class: "portfolio-grid" });

  function renderGrid() {
    clear(grid);
    const filtered = activeFilter === "all" ? projects : projects.filter((p) => p.category === activeFilter);
    filtered.forEach((project) => grid.appendChild(renderCard(project)));
  }

  const filterButtons = FILTERS.map((filter) =>
    el(
      "button",
      {
        class: `filter-btn${filter.id === activeFilter ? " active" : ""}`,
        onClick: (e) => {
          activeFilter = filter.id;
          filterButtons.forEach((btn) => btn.classList.remove("active"));
          e.currentTarget.classList.add("active");
          renderGrid();
        },
      },
      t(filter.key)
    )
  );

  renderGrid();

  return el("section", { class: "section portfolio", id: "portfolio" }, [
    el("div", { class: "section-inner" }, [
      el("h2", { class: "section-heading" }, t("portfolio.heading")),
      el("p", { class: "section-subheading" }, t("portfolio.subheading")),
      el("div", { class: "filter-bar" }, filterButtons),
      grid,
    ]),
  ]);
}
