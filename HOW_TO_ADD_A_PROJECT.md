# How to Add a New Project

You don't need to know how the website is built to add a new project — you're editing one data
file and dropping in some images. This guide walks through it step by step.

## Step 1 — Pick a slug

Choose a short, URL-safe name for your project, lowercase with hyphens instead of spaces. This is
called the **slug**. Examples: `decal-dresser`, `gas-shader`, `my-new-tool`.

The slug is used as:
- the folder name for your images/video
- the unique `id` in the project data
- the web address of the project's page (e.g. `yoursite.com/#/project/my-new-tool`)

## Step 2 — Add your media files

Create a new folder inside `public/assets/projects/` named exactly after your slug:

```
public/assets/projects/my-new-tool/
```

Put your files in it, following this naming pattern (the website looks for these exact names):

| File | Purpose | Required? |
|---|---|---|
| `thumb.png` (or `.jpg`) | Small image shown on the Portfolio grid card | Recommended — if missing, a generic placeholder tile is shown instead |
| `gallery-01.png`, `gallery-02.png`, ... | Full-size images shown on the project's detail page | Optional, add as many as you like |
| `video.mp4` | Demo video shown on the project's detail page | Optional |

Tips:
- Keep the file extension consistent with what you actually have (`.png` or `.jpg` both work — just
  make sure the path you type in Step 3 matches the real file extension exactly).
- Large screenshots (multiple MB each) will slow the site down — if you can, resize images to around
  1600-1920px wide before adding them (any image editor, or a free online resizer, works).
- Videos should ideally be under ~25MB so the project page loads quickly. The video only downloads
  when someone actually opens that project's page (not when browsing the grid), so this matters less
  than image weight, but still keep it reasonable.

## Step 3 — Add the project entry

Open `src/data/projects.js` in a text editor. You'll see a list of project objects that looks like
this one:

```js
{
  id: "decal-dresser",
  category: "work",
  year: "2023 - 2026",
  tech: ["Unreal Engine", "C++", "Editor Tooling"],
  thumb: "/assets/projects/decal-dresser/thumb.png",
  gallery: [
    "/assets/projects/decal-dresser/gallery-01.png",
    "/assets/projects/decal-dresser/gallery-02.png",
  ],
  video: "/assets/projects/decal-dresser/video.mp4",
  links: { artstation: null, repo: null },
  i18n: {
    en: {
      title: "Decal Dresser",
      summary: "Unreal Engine editor extension for quickly dressing scenes with procedural decals.",
      description: "A longer description here.\n\nYou can split it into multiple paragraphs by leaving a blank line, like this.",
      role: "Designed and built the editor extension end-to-end.",
    },
    es: {
      title: "Decal Dresser",
      summary: "...",
      description: "...",
      role: "...",
    },
  },
},
```

Copy one of these blocks (a `{ ... },` entry), paste it just before the closing `];` at the bottom
of the file, and edit it for your new project:

1. `id` — your slug from Step 1, exactly as the folder name (e.g. `"my-new-tool"`).
2. `category` — either `"work"` (CARLA / professional work) or `"personal"` (personal project). This
   controls which filter button shows it on the Portfolio page.
3. `year` — any free-form text, e.g. `"2026"` or `"2025 - 2026"`.
4. `tech` — a list of short tags shown as pills on the card (e.g. `["Unity", "HLSL"]`). Not
   translated, so the same list is used for both languages.
5. `thumb`, `gallery`, `video` — paths matching the files you added in Step 2, always starting with
   `/assets/projects/<your-slug>/`. If you have no video, set `video: null`. If you have no gallery
   images, set `gallery: []`.
6. `links` — optional external links (e.g. an Artstation post). Leave as `null` if you don't have
   one for either.
7. `i18n.en` and `i18n.es` — write the English and Spanish text:
   - `title` — project name shown as the heading.
   - `summary` — one short sentence shown on the grid card.
   - `description` — the longer text shown on the project's detail page. Leave a blank line
     (`\n\n`) between paragraphs.
   - `role` — a one-line description of your role/context on the project.

### No images yet?

If you want to list a project before you have any media for it (like the Raymarching SDF project on
this site), set `thumb: null`, `gallery: []`, and `video: null`. The site will show a small
placeholder tile on the grid and a friendly "no media yet" note on the detail page instead of a
broken image.

## Step 4 — Check it locally

With the dev server running (`npm run dev`), save the file — the browser should update automatically.
Go to the Portfolio section and confirm your new card appears, click into it, and check both the
English and Spanish versions (use the language toggle in the top-right of the nav bar).

## Step 5 — Done

That's it — no other files need to change. The Portfolio grid and the project detail page both read
from this same list automatically.

### Removing a project

Delete its object from `src/data/projects.js` and (optionally) delete its folder under
`public/assets/projects/`.
