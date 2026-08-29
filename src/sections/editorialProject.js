import { el, paragraphs } from "../lib/dom.js";
import { getLang, getProjectText, t } from "../lib/i18n.js";
import projectStories from "../data/projectStories.js";
import { navigateToSection } from "../lib/router.js";

function renderPills(project, className = "") {
  return el("ul", { class: `editorial-pill-row ${className}`.trim() }, project.tech.map((tag) => el("li", {}, tag)));
}

function renderHeroMedia(project) {
  if (project.video) {
    return el("video", {
      class: "editorial-hero-media",
      src: project.video,
      poster: project.thumb,
      autoplay: "",
      muted: "",
      loop: "",
      playsinline: "",
      preload: "metadata",
      "aria-hidden": "true",
    });
  }

  return el("img", {
    class: "editorial-hero-media",
    src: project.thumb || project.gallery[0],
    alt: "",
    "aria-hidden": "true",
  });
}

function renderStoryCard(number, title, body, modifier) {
  return el("article", { class: `editorial-story-card editorial-story-card-${modifier}` }, [
    el("span", { class: "editorial-story-number", "aria-hidden": "true" }, number),
    el("p", { class: "editorial-story-label" }, title),
    el("p", { class: "editorial-story-copy" }, body),
  ]);
}

function renderHighlights(story) {
  return el("section", { class: "editorial-panel editorial-highlights" }, [
    el("div", { class: "editorial-section-heading" }, [
      el("p", { class: "editorial-eyebrow" }, t("caseStudy.detailsEyebrow")),
      el("h2", {}, t("caseStudy.highlights")),
    ]),
    el("div", { class: "editorial-highlight-grid" }, story.highlights.map(([title, body], index) =>
      el("article", { class: "editorial-highlight-card" }, [
        el("span", { class: "editorial-highlight-index" }, String(index + 1).padStart(2, "0")),
        el("h3", {}, title),
        el("p", {}, body),
      ])
    )),
  ]);
}

function renderDemo(project) {
  if (!project.video) return null;

  const language = getLang() === "es" ? "es" : "en";
  const videos = project.demoVideos || [{ src: project.video }];

  return el("section", { class: "editorial-panel editorial-media-panel", id: "project-media" }, [
    el("div", { class: "editorial-section-heading editorial-heading-row" }, [
      el("div", {}, [
        el("p", { class: "editorial-eyebrow" }, t("caseStudy.inMotion")),
        el("h2", {}, t("caseStudy.demo")),
      ]),
      el("p", { class: "editorial-section-intro" }, t("caseStudy.demoIntro")),
    ]),
    el("div", { class: videos.length > 1 ? "editorial-video-grid editorial-video-grid-multiple" : "editorial-video-grid" },
      videos.map((video) => el("figure", { class: "editorial-video-item" }, [
        video.i18n ? el("figcaption", { class: "editorial-video-label" }, video.i18n[language] || video.i18n.en) : null,
        el("div", { class: "editorial-video-frame" }, [
          el("video", {
            src: video.src,
            poster: project.thumb,
            controls: "",
            preload: "metadata",
            playsinline: "",
          }),
        ]),
      ]))
    ),
  ]);
}

function renderGallery(project) {
  if (!project.gallery.length) return null;
  const title = getProjectText(project, "title");

  return el("section", { class: "editorial-panel editorial-gallery-panel", id: project.video ? null : "project-media" }, [
    el("div", { class: "editorial-section-heading editorial-heading-row" }, [
      el("div", {}, [
        el("p", { class: "editorial-eyebrow" }, t("caseStudy.visualRecord")),
        el("h2", {}, t("caseStudy.gallery")),
      ]),
      el("p", { class: "editorial-section-intro" }, t("caseStudy.galleryIntro")),
    ]),
    el("div", { class: `editorial-gallery editorial-gallery-${Math.min(project.gallery.length, 4)}` }, project.gallery.map((src, index) =>
      el("figure", { class: index === 0 ? "editorial-gallery-item editorial-gallery-featured" : "editorial-gallery-item" }, [
        el("img", { src, alt: `${title} — ${t("caseStudy.image")} ${index + 1}`, loading: "lazy" }),
        el("figcaption", {}, `${String(index + 1).padStart(2, "0")} · ${title}`),
      ])
    )),
  ]);
}

function renderOverview(project, story) {
  return el("section", { class: "editorial-panel editorial-overview" }, [
    el("div", { class: "editorial-overview-copy" }, [
      el("p", { class: "editorial-eyebrow" }, t("caseStudy.overviewEyebrow")),
      el("h2", {}, t("caseStudy.overview")),
      el("p", { class: "editorial-lead" }, story.lead),
      el("div", { class: "editorial-description" }, paragraphs(getProjectText(project, "description"))),
    ]),
    el("aside", { class: "editorial-meta-card", "aria-label": t("caseStudy.projectFacts") }, [
      el("div", {}, [el("span", {}, t("projectDetail.role")), el("p", {}, getProjectText(project, "role"))]),
      el("div", {}, [el("span", {}, t("caseStudy.timeline")), el("p", {}, project.year)]),
      el("div", {}, [el("span", {}, t("caseStudy.focus")), el("p", {}, story.focus)]),
      el("div", {}, [el("span", {}, t("projectDetail.techUsed")), renderPills(project, "editorial-meta-pills")]),
    ]),
  ]);
}

export function renderEditorialProject(project) {
  const language = getLang() === "es" ? "es" : "en";
  const story = projectStories[project.id]?.[language] || projectStories[project.id]?.en;

  if (!story) {
    throw new Error(`Missing editorial story for project "${project.id}"`);
  }

  const hasMedia = Boolean(project.video || project.gallery.length);

  return el("section", { class: `project-detail editorial-project editorial-project-${project.id}` }, [
    el("div", { class: "editorial-shell" }, [
      el("a", {
        href: "#/portfolio",
        class: "back-link editorial-back-link",
        onClick: (event) => {
          event.preventDefault();
          navigateToSection("portfolio");
        },
      }, `← ${t("projectDetail.back")}`),
      el("header", { class: "editorial-hero" }, [
        renderHeroMedia(project),
        el("div", { class: "editorial-hero-shade" }),
        el("div", { class: "editorial-hero-copy" }, [
          el("p", { class: "editorial-eyebrow" }, story.eyebrow),
          el("h1", {}, getProjectText(project, "title")),
          el("p", { class: "editorial-hero-summary" }, getProjectText(project, "summary")),
          renderPills(project),
        ]),
        el("div", { class: "editorial-hero-footer" }, [
          el("span", {}, project.year),
          el("span", {}, project.category === "work" ? t("caseStudy.professional") : t("caseStudy.personal")),
        ]),
        hasMedia ? el("button", {
          class: "editorial-media-jump",
          type: "button",
          onClick: () => document.getElementById("project-media")?.scrollIntoView({ behavior: "smooth", block: "start" }),
        }, [t("caseStudy.viewMedia"), el("span", { "aria-hidden": "true" }, "↓")]) : null,
      ]),
      el("article", { class: "editorial-article" }, [
        renderOverview(project, story),
        el("section", { class: "editorial-story-grid", "aria-label": t("caseStudy.process") }, [
          renderStoryCard("01", t("caseStudy.challenge"), story.challenge, "challenge"),
          renderStoryCard("02", t("caseStudy.approach"), story.approach, "approach"),
          renderStoryCard("03", t("caseStudy.outcome"), story.outcome, "outcome"),
        ]),
        renderDemo(project),
        renderHighlights(story),
        renderGallery(project),
        el("section", { class: "editorial-closing" }, [
          el("p", { class: "editorial-eyebrow" }, t("caseStudy.takeaway")),
          el("blockquote", {}, story.closing),
          el("button", {
            class: "btn btn-secondary",
            type: "button",
            onClick: () => navigateToSection("portfolio"),
          }, `← ${t("projectDetail.back")}`),
        ]),
      ]),
    ]),
  ]);
}
