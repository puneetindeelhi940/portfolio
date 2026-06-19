# Portfolio — working agreement

## Deployment / branching (IMPORTANT — standing instruction from the owner)

- **All changes to this portfolio site must be committed and pushed directly to the `main` branch.**
- `main` is the branch GitHub Pages deploys from, so landing changes on `main` is what makes them live.
- Do **not** develop portfolio changes on a separate feature branch and leave them there. The owner does not want their changes isolated on any branch other than `main`.
- If a session is started on a different working branch (the managed remote environment may assign one), integrate the work into `main` and push `main`. The owner has given standing authorization to push portfolio changes to `main`.
- Pull/rebase onto the latest `origin/main` before pushing so you never clobber other commits already on `main`.

## Quality gate before pushing (IMPORTANT — standing instruction from the owner)

- **Every modification, change, or update must be visually tested before pushing.** Take a screenshot, review the output, and confirm it matches the user's instructions.
- If the output has issues or does not match what was asked for, **do not push** and **do not keep iterating**. Stop, inform the user of the issue, and wait for further direction.
- Do not burn tokens on repeated failed attempts — if a change isn't working after testing, surface the problem immediately instead of trying more fixes.

## Site overview

- Static HTML/CSS/JS, no build step. Entry: `index.html` (soft landing gate) → `home.html`.
- Two front-door experiences:
  - `home.html` — the "Intelligence Terminal" aesthetic (primary).
  - `alt-site.html` — a premium, cinematic executive design, surfaced as the **ALT SITE** tab (last item) in the topbar nav.
- Shared styles: `assets/site.css`. Soft gate + chrome helpers: `assets/site.js`.
- Topbar nav is the single source of navigation; page footers show only the copyright line.
- Run / preview / screenshot the site with the `run-portfolio` skill (`.claude/skills/run-portfolio`).
