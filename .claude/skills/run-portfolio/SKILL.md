---
name: run-portfolio
description: Run, serve, screenshot, or smoke-test the portfolio static site. Use when asked to run the site, preview a page, screenshot index/home/work pages, or verify the landing-gate ENTER flow end-to-end.
---

# Run: portfolio (static site)

Plain static HTML/CSS/JS — no build step, no dependencies. Serve the repo
root with any file server and drive it with the Playwright driver at
`.claude/skills/run-portfolio/driver.cjs`. All paths below are relative to
the repo root.

## Prerequisites

Node 22 and Python 3 are preinstalled in the Claude Code cloud container.
Playwright is installed globally; the Chromium binary may need fetching once:

```bash
npx playwright install chromium
```

Do NOT use `--with-deps` — it runs apt-get, which fails in this container
on an unsigned PPA (`ppa.launchpadcontent.net/ondrej/php`). Plain
`install chromium` works; binaries land in `/opt/pw-browsers`.

## Build

None. It's a static site.

## Run (agent path)

The driver serves the repo on port 8731 (override with `PORT=`), drives
headless Chromium, writes a screenshot, and exits non-zero on failure.

```bash
# Landing page (the soft gate) → /tmp/portfolio-index.png
NODE_PATH=$(npm root -g) node .claude/skills/run-portfolio/driver.cjs

# Full ENTER flow: click the gate button, verify fade + redirect to home.html
NODE_PATH=$(npm root -g) node .claude/skills/run-portfolio/driver.cjs --enter-flow

# Any inner page, full-page screenshot (gate auto-bypassed)
NODE_PATH=$(npm root -g) node .claude/skills/run-portfolio/driver.cjs work.html
NODE_PATH=$(npm root -g) node .claude/skills/run-portfolio/driver.cjs home.html /tmp/home.png
```

Success prints `OK url=... screenshot=...`. **Look at the screenshot** —
a dark page with no globe usually means WebGL failed, not an empty site.

## Run (human path)

```bash
python3 -m http.server 8400
# open http://127.0.0.1:8400/index.html
```

Headless containers: useless without the driver.

## Test

No test suite. The `--enter-flow` driver run is the smoke test.

## Gotchas

- **Soft gate bounces inner pages.** Every page except `index.html` checks
  `pa-gate-2026` in session/localStorage and redirects to
  `index.html?to=<page>` if absent (`assets/site.js`). The driver seeds the
  key via `addInitScript` before navigation; without that you'll screenshot
  the gate instead of the page you asked for.
- **The driver is CommonJS on purpose.** Global playwright is resolved via
  `NODE_PATH`, and ESM `import` ignores `NODE_PATH` entirely. A `.mjs`
  driver fails with `Cannot find package 'playwright'`.
- **Clicking ENTER is not instant.** The gate plays a 500ms opacity fade
  before `location.replace('home.html')` — wait for the URL, not the click.
- **Give the globe ~1s.** The landing page's WebGL globe (`globe-fx.js`)
  renders after load; screenshot too early and the background is flat.
- **Stale servers are fine.** If a previous run leaked
  `python3 -m http.server` on the port, the new spawn dies but the old
  server serves the same directory — runs still succeed.

## Troubleshooting

- `Cannot find module 'playwright'` → you dropped the `NODE_PATH=$(npm root -g)`
  prefix (global modules live at `/opt/node22/lib/node_modules`).
- `Executable doesn't exist .../chrome-linux/...` → run
  `npx playwright install chromium` (without `--with-deps`, see Prerequisites).
- `--with-deps` exits 100 with `ppa.launchpadcontent.net ... no longer signed`
  → expected in this container; the browser install itself doesn't need it.
