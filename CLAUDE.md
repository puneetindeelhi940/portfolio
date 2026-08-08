# Portfolio — working agreement

## Headlines & text layout (IMPORTANT — standing instruction from the owner)

- **Never artificially split a sentence across 2, 3, or 4 lines.** Let text expand to fill the available horizontal width; a line should only wrap when it genuinely runs out of room (or on smaller viewports where wrapping is unavoidable).
- Do **not** use tight `max-width` caps in `ch` units on headings, and avoid `text-wrap: balance` that forces short, stacked lines with big empty gutters. Prefer **full-width, left-aligned** headlines that use the whole column.
- Watch for layout bugs that strand text: e.g. a flex column (`display:flex`) with `margin:0 auto` children can shrink-wrap a block to its content and float it off-center — headings must align to the same left edge as the sections around them.
- **Only** break a line deliberately (via `<br>` or a fixed arrangement) when the owner **explicitly** asks for a specific line grouping. Absent that instruction, expand the sentence as much as possible.
- This applies to all pages, projects, and products built for the owner.

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

## Always provide a clickable URL (IMPORTANT — standing instruction from the owner)

- **Every time the owner asks you to build something — whether for preview or to commit — you MUST provide a clickable URL so they can open and visit the page(s) or app you designed.** This applies all the time, with no exceptions.
- This session runs in a remote cloud container, so `localhost` / `127.0.0.1` links are **not** reachable from the owner's browser. The only reliably clickable URL is a **GitHub Pages** link served from `main`. So the URL rule is satisfied by pushing the page to the repo, never by handing over a localhost link.
- **The `not-live-yet/` staging folder** is the mechanism for this:
  - Any page that is **designed or developed for experimentation / preview but not yet meant to go live** on the real site goes in `not-live-yet/` at the repo root.
  - Commit and push that folder to `main` so each page gets a live, clickable GitHub Pages URL of the form `https://puneetindeelhi940.github.io/portfolio/not-live-yet/<page>.html` — this is how preview links are shared with the owner.
  - Pages in `not-live-yet/` are **not** wired into the topbar nav and are **not** part of the live site — the folder is a staging area, "pushed but not live." Promoting a page to live means moving it to the repo root and linking it in the nav, as a separate explicit step the owner approves.
  - Because these pages live in a subfolder, add `<base href="../">` in their `<head>` so `assets/…` and nav links resolve to the repo root.
- For **committed live** builds (root pages): provide the live GitHub Pages URL for the exact page (e.g. `https://puneetindeelhi940.github.io/portfolio/<page>.html`) once it has deployed from `main`.
- Screenshots are not a substitute for the URL — always give the link in addition to any screenshot. Put the URL where it's easy to find (top or bottom of your reply), not buried mid-paragraph.

## Site overview

- Static HTML/CSS/JS, no build step. Entry: `index.html` (soft landing gate) → `home.html`.
- Two front-door experiences:
  - `home.html` — the "Intelligence Terminal" aesthetic (primary).
  - `alt-site.html` — a premium, cinematic executive design, surfaced as the **ALT SITE** tab (last item) in the topbar nav.
- Shared styles: `assets/site.css`. Soft gate + chrome helpers: `assets/site.js`.
- Topbar nav is the single source of navigation; page footers show only the copyright line.
- Run / preview / screenshot the site with the `run-portfolio` skill (`.claude/skills/run-portfolio`).

## PPTX deck quality gate (IMPORTANT — standing instruction from the owner)

- **Before sharing any generated PPTX deck, validate and fix alignment and text overlapping issues.**
- Use `python-pptx` to programmatically check that text boxes, bullet cards, stat cards, and table rows have sufficient height, spacing, and font sizing so content never clips or overlaps adjacent elements.
- Common fixes: increase text box height, increase vertical spacing between rows/items, reduce font size by 1–2pt, push elements downward to create clearance.
- After fixing, regenerate the deck and visually spot-check at least 3–4 slides (title, a content-heavy slide, and the closing slide) before sharing.
- If alignment issues persist after one round of fixes, stop and inform the user rather than iterating further.
