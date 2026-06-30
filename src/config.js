// Formspree contact form setup:
// 1. Go to https://formspree.io and create a free account + new form.
// 2. Copy the form ID from the endpoint Formspree gives you (the part after /f/).
// 3. Either paste it below in place of the placeholder, or set VITE_FORMSPREE_ID
//    in a local .env file (copy .env.example) — the env var takes priority.
const PLACEHOLDER_ID = "YOUR_FORMSPREE_ID_HERE";

export const FORMSPREE_FORM_ID = import.meta.env.VITE_FORMSPREE_ID || PLACEHOLDER_ID;
export const isFormspreeConfigured = FORMSPREE_FORM_ID !== PLACEHOLDER_ID && FORMSPREE_FORM_ID !== "";
export const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

export const CV_PATHS = {
  en: "/cv/antonio-mata-marin-cv-en.pdf",
  es: "/cv/antonio-mata-marin-cv-es.pdf",
};

export const CONTACT = {
  email: "artoniodev@gmail.com",
  phone: "+34 640 60 48 14",
  phoneHref: "+34640604814",
  linkedin: "https://www.linkedin.com/in/antonio-mata-marín-7a936a1aa/",
  artstation: "https://antonio_mata.artstation.com/",
};
