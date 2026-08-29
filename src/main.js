import { el, clear } from "./lib/dom.js";
import { initI18n, getLang, setLanguage, onLanguageChange, t } from "./lib/i18n.js";
import { initRouter, navigateHome, navigateToSection } from "./lib/router.js";
import { initThreeBackground, observeHeroElement } from "./three/background.js";

import { renderNav } from "./sections/nav.js";
import { renderHero } from "./sections/hero.js";
import { renderAbout } from "./sections/about.js";
import { renderExperience } from "./sections/experience.js";
import { renderEducation } from "./sections/education.js";
import { renderPortfolio } from "./sections/portfolio.js";
import { renderProjectDetail } from "./sections/projectDetail.js";
import { renderRecommendations } from "./sections/recommendations.js";
import { renderRecommendationDetail } from "./sections/recommendationDetail.js";
import { renderSkills } from "./sections/skills.js";
import { renderContact } from "./sections/contact.js";
import { renderFooter } from "./sections/footer.js";

let currentRoute = { name: "home" };

// One renderer per section tab. Each returns a standalone section view.
const SECTION_RENDERERS = {
  about: renderAbout,
  experience: renderExperience,
  education: renderEducation,
  portfolio: renderPortfolio,
  recommendations: renderRecommendations,
  skills: renderSkills,
  contact: renderContact,
};

function handleNavClick(sectionId) {
  navigateToSection(sectionId);
}

function handleBrandClick() {
  navigateHome();
}

function handleLangSelect(lang) {
  if (lang !== getLang()) setLanguage(lang);
}

// The section that should be highlighted in the nav for the current route.
function activeSectionFor(route) {
  if (route.name === "section") return route.section;
  if (route.name === "recommendation") return "recommendations";
  return null;
}

function renderApp() {
  document.title = t("meta.title");

  const root = document.getElementById("app-root");
  clear(root);

  root.appendChild(
    renderNav({
      activeSection: activeSectionFor(currentRoute),
      isHome: currentRoute.name === "home",
      onNavClick: handleNavClick,
      onLangSelect: handleLangSelect,
      onBrandClick: handleBrandClick,
    })
  );

  const main = el("main", { id: "content" });

  if (currentRoute.name === "project") {
    main.appendChild(renderProjectDetail(currentRoute.slug));
    observeHeroElement(null);
  } else if (currentRoute.name === "recommendation") {
    main.appendChild(renderRecommendationDetail(currentRoute.slug));
    observeHeroElement(null);
  } else if (currentRoute.name === "section") {
    const renderer = SECTION_RENDERERS[currentRoute.section];
    main.appendChild(renderer());
    observeHeroElement(null);
  } else {
    // Home: hero landing only.
    main.appendChild(renderHero({ onCtaClick: () => navigateToSection("portfolio") }));
  }

  root.appendChild(main);
  root.appendChild(renderFooter());

  if (currentRoute.name === "home") {
    observeHeroElement(document.getElementById("hero"));
  }

  // Each route is its own view, so always start at the top.
  window.scrollTo({ top: 0 });
}

onLanguageChange(renderApp);

initI18n();
initThreeBackground();
initRouter((route) => {
  currentRoute = route;
  renderApp();
});
