import { el, clear } from "../lib/dom.js";
import { t, getProjectText } from "../lib/i18n.js";
import projects from "../data/projects.js";
import { navigateToProject } from "../lib/router.js";
import { matchesTag } from "../lib/tags.js";
import { renderTagFilter } from "./tagFilter.js";

const FILTERS = [
  { id: "all", key: "portfolio.filterAll" },
  { id: "featured", key: "portfolio.filterFeatured" },
  { id: "work", key: "portfolio.filterWork" },
  { id: "personal", key: "portfolio.filterPersonal" },
];

let activeFilter = "all";

function orderProjects(projectList) {
  return [...projectList].sort((a, b) => {
    const aRank = a.featuredRank ?? Number.POSITIVE_INFINITY;
    const bRank = b.featuredRank ?? Number.POSITIVE_INFINITY;
    return aRank - bRank;
  });
}

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
      el("div", { class: "card-media" }, [thumbNode]),
      el("div", { class: "card-body" }, [
        el("div", { class: "card-body-meta" }, [
          el("span", { class: "card-category" }, project.category === "work" ? t("portfolio.workLabel") : t("portfolio.personalLabel")),
          el("span", { class: "card-year" }, project.year),
        ]),
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
  const count = el("p", { class: "collection-count", role: "status", "aria-live": "polite" });
  const tagFilter = renderTagFilter(projects, "portfolio", (tag) => {
    selectedTag = tag;
    renderGrid();
  });
  let selectedTag = tagFilter.selected;

  function renderGrid() {
    clear(grid);
    const categorized = activeFilter === "all"
      ? orderProjects(projects)
      : activeFilter === "featured"
        ? orderProjects(projects.filter((project) => project.featuredRank != null))
        : projects.filter((project) => project.category === activeFilter);
    const filtered = categorized.filter((project) => matchesTag(project, selectedTag));
    count.textContent = `${filtered.length} / ${projects.length} ${t("filters.projects")}`;
    filtered.forEach((project) => grid.appendChild(renderCard(project)));
    if (!filtered.length) grid.appendChild(el("p", { class: "collection-empty" }, t("filters.empty")));
  }

  const filterButtons = FILTERS.map((filter) =>
    el(
      "button",
      {
        class: `filter-btn${filter.id === activeFilter ? " active" : ""}`,
        type: "button",
        "aria-pressed": filter.id === activeFilter ? "true" : "false",
        onClick: (e) => {
          activeFilter = filter.id;
          filterButtons.forEach((btn) => {
            btn.classList.remove("active");
            btn.setAttribute("aria-pressed", "false");
          });
          e.currentTarget.classList.add("active");
          e.currentTarget.setAttribute("aria-pressed", "true");
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
      el("div", { class: "filter-bar", role: "group", "aria-label": t("filters.projectType") }, filterButtons),
      tagFilter.node,
      count,
      grid,
    ]),
  ]);
}
