# Antonio Mata Marín — Portfolio

A bilingual (EN/ES) portfolio site built with Vite + vanilla JavaScript + Three.js.

## Requirements

- [Node.js](https://nodejs.org) 18+ (LTS recommended) and npm.

## Running locally

```bash
npm install
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it in your browser.

- `npm run build` — produces a production build in `dist/`.
- `npm run preview` — serves the production build locally so you can sanity-check it before deploying.

## Project structure

```
public/
  assets/projects/<slug>/   project media (thumb, gallery images, video)
  cv/                       downloadable CV PDFs (EN/ES)
  profile.jpg               About section portrait
src/
  data/                     all editable content (projects, experience, education, skills, i18n strings)
  lib/                      i18n + router + small DOM helpers
  sections/                 one render function per page section
  three/                    the 3D background scene
```

See **HOW_TO_ADD_A_PROJECT.md** for a step-by-step guide to adding a new portfolio project.

## Contact form setup (Formspree)

The Contact section's form is wired to [Formspree](https://formspree.io). Until it's configured it
shows a "not configured yet" message instead of a broken form.

To enable it:
1. Create a free account at formspree.io and create a new form.
2. Copy the form ID from the endpoint Formspree gives you (the part after `/f/`).
3. Copy `.env.example` to `.env` and set `VITE_FORMSPREE_ID=your-id-here`, **or** edit the
   placeholder directly in `src/config.js`.
4. Restart `npm run dev` if it was already running (Vite needs a restart to pick up new env vars).

## Editing content

All text content lives in `src/data/`:
- `projects.js` — portfolio projects (see HOW_TO_ADD_A_PROJECT.md)
- `experience.js` — work experience entries
- `education.js` — education entries
- `skills.js` — technical skills, soft skills, languages
- `i18n/en.js` / `i18n/es.js` — UI text (nav labels, headings, form labels, etc.)

Editing any of these and saving will hot-reload instantly while `npm run dev` is running.

## Deploying

This is a static site (no backend) — after `npm run build`, the `dist/` folder can be deployed to
any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.). Because routing uses hash
fragments (`#/project/<slug>`), no server-side rewrite rules are needed.
