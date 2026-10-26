# AANGAN Interiors — website (HTML · CSS · JS)

Static front end built from the Figma file "AANGAN Interiors — Website Design System".
No framework, no backend. 10 pages, responsive at ≥1024 / 768–1023 / <768.

## Open the site
Just double-click `index.html` — every page works directly from your disk, no server needed.
(A local server such as `npx serve .` also works.)

## Editing the header or footer
Edit `partials/header.html` or `partials/footer.html`, then run `node build.mjs`.
The script copies them into every page (between the `header:start` / `header:end` markers) and marks the current page in the nav.
Don't edit the header inside individual pages — it will be overwritten on the next build.

## Build for launch
```
node build.mjs
```
Syncs header/footer into all pages, regenerates `data/projects.js` from `data/projects.json`, and copies the site to `dist/`.
Deploy `dist/` to Netlify, Vercel, Cloudflare Pages or any static host.

## Pages
index · projects · project-detail (`?p=slug`) · services · about · contact · consultation · privacy · terms · 404

## Structure
- `css/tokens.css` – design tokens from Figma variables. Use variables only, never raw hex.
- `css/base.css` – reset, type, layout, focus, page transitions (View Transitions API), reduced motion.
- `css/components.css` – buttons, nav, drawer, cards, fields, choices, chips, accordion, alerts, progress, upload, lightbox, before/after, empty state, footer.
- `css/pages.css` – page layouts.
- `js/nav.js` – sticky header, accessible mobile drawer.
- `js/data.js` – project data + responsive image helpers.
- `js/filters.js` – Projects: category chips, filter sheet, Load more, empty state.
- `js/project.js` – Project Detail: renders from JSON, lightbox (keyboard + swipe), before/after slider.
- `js/accordion.js` – FAQ accordions.
- `js/forms.js` – validation, contact form, 4-step consultation (values saved between steps), file upload.
- `js/config.js` – **form settings**.
- `js/reveal.js` – one restrained scroll reveal.
- `data/projects.json` – projects (edit this). `data/projects.js` is generated from it by the build.

## Forms
Add a free Web3Forms access key in `js/config.js` (`FORM_ACCESS_KEY`).
Until then forms run in **demo mode**: they validate and show success without sending.
Add `?demo=fail` to a URL to preview the failure state.

## Adding a project
1. Export images to `assets/images/projects/` as `name.webp`, `name.jpg`, `name@2x.webp`, `name@2x.jpg` (cards 4:5, hero 16:9).
2. Add an entry to `data/projects.json` (copy an existing one). Set `"sample": false` for real projects.
3. Run `node build.mjs`.

## Before launch — content & licensing
- Replace bracketed placeholders: address, phone, email, hours, social links (`partials/footer.html`, `contact.html`, JSON-LD in `index.html`).
- Replace sample projects, sample testimonials and the sample team (fictional names, stock photos).
- **Courtyard photo** (`assets/images/site/courtyard.*`) is NOT licensed — get permission from Aryaman Design Box or replace.
- **AI-generated images** (`gallery/before`, `gallery/after`, `about/studio`) are illustrative — replace with real photos.
- Record the Shutterstock licence type for every stock image (see Figma page 06).
- Confirm service scope, timelines, fees and budget ranges (marked in the HTML).
- Privacy Policy and Terms need legal review.
