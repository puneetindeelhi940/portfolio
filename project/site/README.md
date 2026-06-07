# Puneet Arora — Portfolio

Private, invite-only working portfolio for Puneet Arora — Principal UX Designer / Sr. Design Manager (Strategist).

**Live (when deployed):** see GitHub Pages settings.
**Default passcode:** `growthecore` (rotate before sharing — see below).

## Stack

Plain static HTML + CSS + a small vanilla JS file. No build step, no dependencies, no tracking. Designed to be hostable as-is on **GitHub Pages** or any static host.

```
site/
├─ index.html                ← entry passcode gate
├─ home.html                 ← hero, dossiers, AI lab teaser
├─ bio.html                  ← leadership story, patents, journey
├─ work.html                 ← case study index
├─ case-dell-genai.html      ← Dell.com GenAI deep case
├─ ai-lab.html               ← Design Intelligence Portal + Vigyan Setu
├─ contact.html              ← channels, role brief, etc.
└─ assets/
   ├─ site.css               ← shared styles (Intelligence Terminal system)
   ├─ site.js                ← gate + chrome helpers
   └─ portrait.png
```

## Soft passcode gate

Every page checks `sessionStorage` for a key set by `index.html`. No backend, no real auth — this is a polite "have you been sent the link?" filter, not security. Source of the page is still visible to anyone determined.

### How to rotate the passcode

1. Open the deployed site in a browser.
2. Open the JS console and run:
   ```js
   await __hashGatePass('your-new-passcode')
   ```
   Copy the returned hex string.
3. Open `assets/site.js`, replace the value of `PASS_HASH` with the new hash.
4. Commit and push.

The passcode is normalised before hashing: lowercased + whitespace stripped. So `Hello World` and `helloworld` are equivalent.

The default ships as `growthecore` (from the quote "Grow the core, while adding some more").

## Deploying to GitHub Pages

1. Create a new GitHub repo (public or private — Pages works for both on paid plans).
2. Push the contents of the `site/` folder to the **root** of that repo.
3. In the repo, go to **Settings → Pages**.
4. Source: `Deploy from a branch`. Branch: `main`. Folder: `/ (root)`.
5. Save. Wait ~30s. The site is live at `https://<your-username>.github.io/<repo-name>/`.

### Alternative: keep `site/` as a subfolder

If you'd rather push this whole project (including the dev artefacts at the root), point Pages at the `/site` folder:

1. **Settings → Pages → Source:** `Deploy from a branch`.
2. **Branch:** `main`. **Folder:** `/site`.
3. The site is then live at `https://<user>.github.io/<repo>/`.

### Custom domain (optional)

1. In the repo's **Settings → Pages**, add your domain (e.g. `puneetarora.design`).
2. Add a `CNAME` file at the repo root containing just that domain.
3. Point your DNS at GitHub Pages (`A` records to `185.199.108.153` / `109` / `110` / `111`, or a `CNAME` for `<user>.github.io`).

## Visiting the site (for invitees)

Share the URL and the passcode privately (separate channels are safer — URL via email, passcode via WhatsApp/SMS, etc.). Recipients enter the passcode once, and "Remember on this device" persists access via `localStorage` for return visits.

## Editing the persona / content

All content is inline HTML — no CMS, no Markdown. To update a stat or rewrite a paragraph, open the relevant page and edit the text.

Common edits:

| Want to change | File | Where to look |
|---|---|---|
| Personal facts (role, leads, location) | `home.html` | the `<aside>` operator profile card |
| The "How I Think" lenses | `bio.html` | `<div class="how">` |
| Career timeline rows | `bio.html` | `<div class="timeline">` |
| Patents list | `bio.html` | `<div class="patents">` |
| Dell case study | `case-dell-genai.html` | `<section class="case-section">` blocks |
| AI Lab projects | `ai-lab.html` | `featured-card` + `on the bench` cards |
| Contact channels | `contact.html` | `<a class="channel">` rows |

The design tokens (colours, type sizes, spacing) live in `assets/site.css` under `:root { --... }`. Edit there if you want to retune the system across all pages.

## Browser support

Modern evergreen browsers. Uses `oklch()` colours, `color-mix()`, and `:has()`. If you need to support older browsers, swap colours to hex via the CSS variables in `:root`.

## Privacy

- `robots` meta tags are set to `noindex,nofollow` on every page.
- No analytics, no fonts beyond Google Fonts (Roboto / Roboto Mono).
- The gate is **client-side only**. For real auth, deploy behind Cloudflare Access, Vercel Password Protection, or a similar gate.

---

© 2026 Puneet Arora · Bangalore.
