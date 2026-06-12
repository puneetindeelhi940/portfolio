#!/usr/bin/env node
/* Drive the static portfolio site headlessly: serve it, screenshot any page,
   or exercise the landing-gate ENTER flow end-to-end.

   Usage (from repo root):
     NODE_PATH=$(npm root -g) node .claude/skills/run-portfolio/driver.cjs [page.html] [out.png]
     NODE_PATH=$(npm root -g) node .claude/skills/run-portfolio/driver.cjs --enter-flow

   NODE_PATH is required: playwright is installed globally, and this file is
   CommonJS specifically because ESM import ignores NODE_PATH.
*/
const { spawn } = require('node:child_process');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../../..');
const PORT = process.env.PORT || 8731;
const args = process.argv.slice(2);
const enterFlow = args.includes('--enter-flow');
const positional = args.filter(a => !a.startsWith('--'));
const target = positional[0] || 'index.html';
const out = positional[1] ||
  `/tmp/portfolio-${enterFlow ? 'enter-flow' : path.basename(target, '.html')}.png`;

(async () => {
  // Static site: any file server works. Reusing a stale server on this port
  // is harmless — it serves the same directory.
  const server = spawn('python3', ['-m', 'http.server', String(PORT)],
    { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));

  let failed = false;
  try {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    if (!enterFlow && target !== 'index.html') {
      // Inner pages bounce to the gate unless the soft-gate access key is set
      await ctx.addInitScript(() => {
        try {
          localStorage.setItem('pa-gate-2026', '1');
          sessionStorage.setItem('pa-gate-2026', '1');
        } catch (e) {}
      });
    }
    const pg = await ctx.newPage();
    if (enterFlow) {
      await pg.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });
      await pg.waitForTimeout(1000); // let the WebGL globe render
      await pg.click('.gate__submit');
      // submit fades the gate for 500ms, then redirects
      await pg.waitForURL('**/home.html', { timeout: 5000 });
      await pg.waitForTimeout(600);
    } else {
      await pg.goto(`http://127.0.0.1:${PORT}/${target}`, { waitUntil: 'networkidle' });
      await pg.waitForTimeout(1000);
    }
    await pg.screenshot({ path: out, fullPage: !enterFlow && target !== 'index.html' });
    console.log(`OK url=${pg.url()} screenshot=${out}`);
    await browser.close();
  } catch (e) {
    console.error('FAIL:', e.message);
    failed = true;
  } finally {
    server.kill();
  }
  process.exit(failed ? 1 : 0);
})();
