// Minimal hash router. Route shapes:
//   #/                  -> home (hero landing)
//   #/<section>          -> a single section shown as its own page/tab
//                          (about, experience, education, portfolio, skills, contact)
//   #/project/<slug>     -> project detail view

const PROJECT_ROUTE = /^#\/project\/(.+)$/;
const SECTION_ROUTE = /^#\/([a-z]+)$/;

export const SECTION_IDS = [
  "about",
  "experience",
  "education",
  "portfolio",
  "skills",
  "contact",
];

let currentHandler = null;

export function parseRoute(hash) {
  const match = PROJECT_ROUTE.exec(hash);
  if (match) return { name: "project", slug: decodeURIComponent(match[1]) };

  const sectionMatch = SECTION_ROUTE.exec(hash);
  if (sectionMatch && SECTION_IDS.includes(sectionMatch[1])) {
    return { name: "section", section: sectionMatch[1] };
  }

  if (hash === "" || hash === "#" || hash === "#/") return { name: "home" };
  // Unknown hash -> treat as home rather than leaving a blank page.
  return { name: "home" };
}

export function initRouter(onRouteChange) {
  currentHandler = onRouteChange;
  const handle = () => currentHandler(parseRoute(window.location.hash));
  window.addEventListener("hashchange", handle);
  handle();
}

export function navigateToProject(slug) {
  window.location.hash = `#/project/${encodeURIComponent(slug)}`;
}

export function navigateToSection(section) {
  window.location.hash = `#/${section}`;
}

export function navigateHome() {
  window.location.hash = "#/";
}
