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
  assets/articles/<slug>/   article media (thumb, figures)
  cv/                       downloadable CV PDFs (EN/ES)
  profile.jpg               About section portrait
src/
  data/                     all editable content (projects, experience, education, skills, i18n strings)
  lib/                      i18n + router + small DOM helpers
  sections/                 one render function per page section
  three/                    the 3D background scene
```

See **HOW_TO_ADD_A_PROJECT.md** for a step-by-step guide to adding a new portfolio project.

See **[BLOG_SETUP.md](BLOG_SETUP.md)** to activate owner sign-in and share casual Updates directly on the website with Supabase. Click the **+** on Updates to write your English and Spanish versions together; add a photo or select **Pin to top** if you like. The editor opens on that page, and Updates starts empty. Updates, Portfolio and Articles support tag filtering. Articles remain the place for longer professional write-ups.

## Editing content

All text content lives in `src/data/`:
- `projects.js` — portfolio projects (see HOW_TO_ADD_A_PROJECT.md)
- `articles.js` — written articles: metadata and the copy shown on the Articles grid card
- `articleStories.js` — the body of each article, as an ordered list of blocks (paragraphs,
  figures, code, notes...) in both languages
- `experience.js` — work experience entries
- `education.js` — education entries
- `skills.js` — technical skills, soft skills, languages
- `i18n/en.js` / `i18n/es.js` — UI text (nav labels, headings, form labels, etc.)

Editing any of these and saving will hot-reload instantly while `npm run dev` is running.

## Quick-contact form

The Contact section includes a "Quick contact" form (name, email, subject, message) that emails
submissions straight to you. It is intentionally limited to a short note with no file uploads —
visitors who need to attach files or write at length are pointed at the plain email address
underneath the form. Because the site is static, delivery goes through
[Web3Forms](https://web3forms.com):

1. Enter your inbox on web3forms.com — they email you an **access key**.
2. Copy `.env.example` to `.env` and set `VITE_WEB3FORMS_KEY=<your key>`.
3. Restart `npm run dev`.

The key is public by design (it ships inside the built bundle) and only ever delivers mail to the
inbox it was issued for. Without it, the form renders a short "not configured yet" note with a
mailto link rather than a form that fails on submit.

### Environment configuration

Vite reads environment values at **build time**. All `.env*` files are local and gitignored,
except `.env.example`, which contains empty placeholders.

For GitHub Pages, configure `VITE_WEB3FORMS_KEY`, `VITE_SUPABASE_URL`, and
`VITE_SUPABASE_PUBLISHABLE_KEY` as repository Actions variables. The deployment workflow reads
these values when building. For another host, configure the same variables in that
host's environment settings, then rebuild. Update the local configuration and host settings
when rotating a key.

Because there are no file uploads, the free Web3Forms plan covers this form. Submissions are sent
as JSON with the sender's address set as `replyto`, so replying to the notification goes straight
back to them. A hidden `botcheck` honeypot field filters out bots; see
`src/sections/quickContact.js`.

## Deploying

GitHub Pages is the active deployment target: https://artuandev.github.io/Website/.
The existing Vercel site at https://portfoliowebsite-ecru-six.vercel.app is retained as a legacy
deployment. Its Git repository connection is disabled, so future pushes do not update it.

This is a static site (no backend) — after `npm run build`, the `dist/` folder can be deployed to
any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.). Because routing uses hash
fragments (`#/project/<slug>`), no server-side rewrite rules are needed.
