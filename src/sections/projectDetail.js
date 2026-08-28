import { el, clear, paragraphs } from "../lib/dom.js";
import { t, getProjectText } from "../lib/i18n.js";
import projects from "../data/projects.js";
import { navigateToSection } from "../lib/router.js";
import { renderSdfCaseStudy } from "./sdfCaseStudy.js";

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

function renderGallery(project) {
  if (!project.gallery.length) return null;

  const mainImage = el("img", {
    class: "gallery-main",
    src: project.gallery[0],
    alt: getProjectText(project, "title"),
  });

  const thumbs = el(
    "div",
    { class: "gallery-thumbs" },
    project.gallery.map((src) =>
      el("button", {
        class: "gallery-thumb-btn",
        onClick: () => {
          mainImage.src = src;
        },
      }, [el("img", { src, alt: "" })])
    )
  );

  return el("div", { class: "project-gallery" }, [
    el("h3", { class: "section-subheading" }, t("projectDetail.gallery")),
    mainImage,
    project.gallery.length > 1 ? thumbs : null,
  ]);
}

function renderVideo(project) {
  if (!project.video) return null;
  return el("div", { class: "project-video" }, [
    el("h3", { class: "section-subheading" }, t("projectDetail.demoVideo")),
    el("video", {
      src: project.video,
      controls: "true",
      preload: "metadata",
      playsinline: "true",
    }),
  ]);
}

export function renderProjectDetail(slug) {
  const project = projects.find((p) => p.id === slug);
  if (!project) return renderNotFound();

  if (project.detailRenderer === "sdf-case-study") {
    return renderSdfCaseStudy(project);
  }

  const noMedia = !project.thumb && !project.gallery.length && !project.video;

  return el("section", { class: "section project-detail" }, [
    el("div", { class: "section-inner" }, [
      el(
        "a",
        {
          href: "#/portfolio",
          class: "back-link",
          onClick: (e) => {
            e.preventDefault();
            navigateToSection("portfolio");
          },
        },
        `← ${t("projectDetail.back")}`
      ),
      el("h2", { class: "section-heading" }, getProjectText(project, "title")),
      el("p", { class: "project-role" }, `${t("projectDetail.role")}: ${getProjectText(project, "role")}`),
      el(
        "ul",
        { class: "card-tags project-tags" },
        project.tech.map((tag) => el("li", {}, tag))
      ),
      el("div", { class: "project-description" }, paragraphs(getProjectText(project, "description"))),
      noMedia ? el("p", { class: "no-media-note" }, t("portfolio.noMedia")) : null,
      renderVideo(project),
      renderGallery(project),
    ]),
  ]);
}
