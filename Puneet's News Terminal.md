# PROMPT: News Aggregator Page — "Puneet's News Terminal"

## 1. Goal
Build a new page in the `puneetindeelhi940/portfolio` repo (alongside `home.html` / `alt-site.html`) that aggregates trending headlines across ~12 topic categories from ~60 named outlets, with sub-second perceived load time, a chip-based filter UI, live search, and a playful/serious visual mode toggle. Reachable from the existing topbar nav.

## 2. Architecture (Recommended — confirm before building)
This repo is static HTML/CSS/JS deployed via GitHub Pages — there is no live backend, and GitHub Pages cannot hold API secrets. Calling 60 outlets' APIs/RSS feeds directly from the browser on every page load would be slow, fragile (CORS), and would leak any API keys client-side.

**Recommended approach:**
- A **scheduled GitHub Action** (e.g. every 15–30 min) runs a small script that:
  1. Calls a licensed news-aggregator API (e.g. NewsAPI.org / GNews / NewsData.io) for the outlets it covers (mostly the large global/business/tech names).
  2. Pulls direct RSS feeds for the outlets the aggregator doesn't cover (most Indian, regional, and niche UX/startup/culture sources — aggregators rarely index these).
  3. Normalizes everything into one JSON file per category (or one combined file), tags each item with source + category, and commits it as a static asset (e.g. `assets/news/latest.json`).
  4. The page itself just `fetch()`es this static JSON — no live API calls, no exposed keys, served from GitHub's CDN. This is what makes it fast.
- "Last refreshed" = the timestamp embedded in that JSON file by the Action, not a per-user live timestamp.
- API key (if an aggregator is used) lives in a GitHub Actions secret, never in client code.

This is the part most likely to need adjustment once you pick a specific API — flagged in Open Decisions below.

## 3. Topbar (single nav, nothing on the left)
Left-to-right or however fits responsively, all in the topbar:
- "Built by Puneet" wordmark/link
- Search box (filters headlines by title, live, debounced)
- Topic chips (horizontally scrollable on mobile): **Popular, Business, Technology, UX, Women, Weather, Gadgets, Regional, Culture, Startups, Travel, Sports** — multi-select or single-select (decide during build; single-select is simpler and faster to scan)
- Playful / Serious mode toggle
- Last refreshed timestamp (top right)

## 4. Category → Source mapping (deduped from original list)
| Category | Sources |
|---|---|
| Popular | BBC News, Reuters, AP, The Guardian, CNN, The Hindu, Indian Express, Times of India, Hindustan Times, NDTV, Google News, Microsoft Start |
| Business | Bloomberg, CNBC, Financial Times, The Economic Times, Mint/LiveMint Markets, Moneycontrol, Business Standard, Yahoo Finance, MarketWatch |
| Technology | TechCrunch, The Verge, Wired, Ars Technica, MIT Technology Review, MacRumors |
| UX | Nielsen Norman Group, UX Collective, Smashing Magazine, A List Apart, UX Magazine |
| Women | Women Love Tech, SheThePeople, Fortune (Most Powerful Women) |
| Weather | Weather.com, AccuWeather |
| Gadgets | GSMArena, Android Authority, Gadget 360, Gadgets Now |
| Regional (IP-geo) | Google News (localized), Microsoft Start (localized), + India outlets above when geo = India |
| Startups | ET Tech (GCC section), NASSCOM News, People Matters, YourStory |
| Travel | Condé Nast Traveler, Lonely Planet, National Geographic Travel |
| Sports | ESPN, Cricbuzz, ESPN Cricinfo, Olympics.com |
| Culture | National Geographic, Smithsonian Magazine, Scroll Culture, The Better India |

## 5. Card & interaction behavior
- Headline cards in a responsive grid (masonry or fixed grid — decide for visual rhythm).
- Each card: source logo/name, headline, optional thumbnail, relative timestamp ("2h ago").
- Click → `target="_blank" rel="noopener"` to the original article. Never proxy/embed the article itself.
- Empty/error states per category (e.g. "No headlines yet for Startups — check back soon") rather than a blank grid.
- Skeleton-loader cards while `latest.json` is fetching, so the page never shows a jarring blank state.

## 6. Playful vs. Serious mode
- **Serious**: muted palette, minimal motion, tighter density, editorial typography (this matches the existing "Intelligence Terminal" aesthetic in `home.html`).
- **Playful**: saturated accent colors per category chip, subtle card hover/entrance animation, looser spacing.
- Toggle persists via `localStorage`; affects color tokens + motion only, not layout structure or information density of content.

## 7. Regional filter (IP-based geolocation — confirmed)
- On load, call an IP-geolocation lookup (no permission prompt) to infer country/city.
- Use that to pick which localized Google News / Microsoft Start slice — and which India-specific outlets — populate the Regional chip.
- Fail gracefully (default to India, since that's the primary readership) if the lookup fails or is blocked.

## 8. SEO / meta tags
Add to `<head>`: `<title>`, meta description, and structured/OG tags built around: **"Puneet Arora", "Puneet Arora Dell Technologies", "Puneet Arora UX", "Puneet Arora New Delhi", "Puneet Arora Bangalore", "Puneet Kumar Arora"** — phrase these naturally in the description/OG copy, not just stuffed into a `keywords` tag (most engines ignore that tag anyway; description + structured data carry more weight).

## 9. Performance & UX bar
- Page interactive in <1s on a static JSON fetch (no live API calls blocking render).
- Chip filtering and search are instant client-side operations against the already-fetched JSON — no network round-trip per filter click.
- Fully keyboard-navigable chips/search; visible focus states; sufficient color contrast in both modes (WCAG AA minimum).
- Mobile-first responsive grid; chips horizontally scrollable with visible overflow affordance.

## 10. Out of scope for v1
- User accounts, saved articles, push notifications, comments.
- Full-text article rendering (always links out).

---

## Open decisions before anyone starts building
1. **Which aggregator API** (NewsAPI.org, GNews, NewsData.io, or other) — each has different pricing, rate limits, and outlet coverage; this determines exactly which sources come from the aggregator vs. direct RSS.
2. **GitHub Actions secret setup** for the chosen API key — needs explicit go-ahead since it's a repo configuration change.
3. **Refresh cadence** for the scheduled Action (every 15 min? 30 min? hourly?) — tradeoff between freshness and API rate-limit/Action-minutes budget.
4. **Single-select vs multi-select** chips — affects both UX and how many JSON slices get fetched/filtered at once.
