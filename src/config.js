export const CV_FILES = {
  en: {
    path: "/cv/Antonio_Mata_CV_en_2026.pdf",
    downloadName: "Antonio_Mata_CV_en_2026.pdf",
  },
  es: {
    path: "/cv/Antonio_Mata_CV_es_2026.pdf",
    downloadName: "Antonio_Mata_CV_es_2026.pdf",
  },
};

// Quick-contact form delivery. The access key is a public per-inbox token from
// https://web3forms.com — it is meant to ship in client-side code. Set it in
// `.env` as VITE_WEB3FORMS_KEY (see .env.example); without it the form renders
// a "not configured" note instead of silently failing.
export const WEB3FORMS = {
  accessKey: import.meta.env.VITE_WEB3FORMS_KEY || "",
  fromName: "Portfolio quick contact",
};

export const CONTACT = {
  email: "artoniodev@gmail.com",
  phone: "+34 640 60 48 14",
  phoneHref: "+34640604814",
  linkedin: "https://www.linkedin.com/in/antonio-mata-marín-7a936a1aa/",
  artstation: "https://antonio_mata.artstation.com/",
};
