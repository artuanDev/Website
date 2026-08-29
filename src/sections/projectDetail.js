import { el } from "../lib/dom.js";
import { t } from "../lib/i18n.js";
import projects from "../data/projects.js";
import { navigateToSection } from "../lib/router.js";
import { renderSdfCaseStudy } from "./sdfCaseStudy.js";
import { renderEditorialProject } from "./editorialProject.js";

function renderNotFound() {
  return el("section", { class: "section project-detail" }, [
    el("div", { class: "section-inner" }, [
      el("h2", { class: "section-heading" }, t("projectDetail.notFound")),
      el("p", {}, t("projectDetail.notFoundBody")),
      el(
        "a",
        {
          href: "#/portfolio",
          class: "btn btn-secondary",
          onClick: (e) => {
            e.preventDefault();
            navigateToSection("portfolio");
          },
        },
        `← ${t("projectDetail.back")}`
      ),
    ]),
  ]);
}

export function renderProjectDetail(slug) {
  const project = projects.find((p) => p.id === slug);
  if (!project) return renderNotFound();

  if (project.detailRenderer === "sdf-case-study") {
    return renderSdfCaseStudy(project);
  }

  return renderEditorialProject(project);
}
