import dictionaries from "../data/i18n/index.js";

const STORAGE_KEY = "portfolio:lang";
const SUPPORTED = ["en", "es"];

let currentLang = "en";
const listeners = new Set();

function detectInitialLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  const browserLang = (navigator.language || "en").slice(0, 2);
  return SUPPORTED.includes(browserLang) ? browserLang : "en";
}

export function getLang() {
  return currentLang;
}

export function setLanguage(lang) {
  if (!SUPPORTED.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  for (const listener of listeners) listener(lang);
}

export function onLanguageChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initI18n() {
  currentLang = detectInitialLang();
  document.documentElement.lang = currentLang;
}

// Dotted-path lookup, e.g. t('contact.heading')
export function t(key) {
  const dict = dictionaries[currentLang] || dictionaries.en;
  const value = key.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), dict);
  if (value == null) {
    console.warn(`[i18n] Missing key "${key}" for language "${currentLang}"`);
    return key;
  }
  return value;
}

// Reads project.i18n[currentLang][field], falling back to English.
export function getProjectText(project, field) {
  const localized = project.i18n[currentLang] || project.i18n.en;
  return localized[field];
}

export function getEntryText(entry, field) {
  const localized = entry.i18n[currentLang] || entry.i18n.en;
  return localized[field];
}
