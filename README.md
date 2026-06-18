# Puneet Arora — Portfolio

Public portfolio for Puneet Arora — Principal Product Designer & AI Design Leader.

**Live:** https://puneetindeelhi940.github.io/portfolio/ (GitHub Pages, `main` branch).

## Stack

Plain static HTML + CSS + a small vanilla JS file. No build step, no dependencies, no tracking. Hostable as-is on **GitHub Pages** or any static host. The site is open and search-indexable (no access gate).

```
portfolio/
├─ index.html                ← forwards straight to home.html
├─ home.html                 ← hero, executive snapshot, signature work, how I lead, principles
├─ bio.html                  ← leadership story, patents, journey, certifications
├─ work.html                 ← case-study index (dossiers)
├─ case-dell-chatbot.html    ← canonical Dell GenAI Virtual Assistant case
├─ case-boeing-taam.html     ← Boeing TAAM case
├─ experiments.html          ← live tools, custom GPTs, Vigyan Setu, Skills directories
├─ skills-for-india.html     ← Skills directory (India)
├─ skills-for-global-builders.html ← Skills directory (global)
├─ contact.html              ← channels, role brief
├─ robots.txt · sitemap.xml  ← SEO
└─ assets/
   ├─ site.css               ← shared design system (sea-green, Roboto)
   ├─ site.js                ← theme toggle + year stamp
   └─ portrait.png
```

`case-dell-genai.html`, `ai-lab.html`, and `vibe-magic.html` are kept as lightweight redirect
stubs to their canonical replacements. `30day-agentic-ux-plan.html` remains in the repo, unlinked.

## Navigation

Single source of nav is the topbar: **WORK · ABOUT · CONTACT** plus a secondary **EXPERIMENTS**
link. Footers carry only the copyright line.

## Deploying to GitHub Pages

1. Push to the **root** of the repo.
2. **Settings → Pages → Source:** `Deploy from a branch`. **Branch:** `main`. **Folder:** `/ (root)`.
3. Save. The site is live at `https://<user>.github.io/<repo>/`.

### Custom domain (optional)

1. **Settings → Pages**, add your domain.
2. Add a `CNAME` file at the repo root with that domain.
3. Point DNS at GitHub Pages (`A` records to `185.199.108.153/109/110/111`, or a `CNAME` to `<user>.github.io`).
4. Update the absolute URLs in `robots.txt`, `sitemap.xml`, and the `og:`/`canonical` tags to the new domain.

## Editing content

All content is inline HTML — no CMS. To update a stat or rewrite a paragraph, open the relevant
page and edit the text. Design tokens (colours, type, spacing) live in `assets/site.css` under
`:root { --... }` — edit there to retune the system across all pages. The accent is sea-green
(`--signal`); a light theme is available via the topbar DARK/LIGHT toggle.

## Accessibility

- Minimum body font-size of 12px; all animations are disabled under `prefers-reduced-motion`.
- Colour tokens are tuned to keep WCAG AA contrast on text/background pairs in both themes.

## Browser support

Modern evergreen browsers. Uses `oklch()` colours, `color-mix()`, and `:has()`.

---

© 2026 Puneet Arora · Bangalore.
