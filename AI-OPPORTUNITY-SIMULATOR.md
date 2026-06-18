# AI Opportunity Simulator — Product Specification & Build Prompt

> A living digital twin of the global economy for executives. It shifts the user
> from *monitoring events* to *receiving strategic recommendations* — answering
> "where should we expand next?", "what will this election do to our margins?",
> and "which supplier is becoming a hidden risk?".
>
> Authored as an EY-style managing-director vision for the APJC region, and
> written so it can be handed to Claude Code as a single build prompt.

---

## 0. North-star vision

The platform should feel like interacting with a **living digital twin of the
global economy**. Instead of forcing leaders to interpret hundreds of
indicators, it continuously answers:

- Where should we expand next?
- What will this election mean for our margins?
- Which supplier is becoming a hidden risk?
- Which markets are about to become unusually attractive?
- What decisions should we make this week, this quarter, and this year?

That shift — **from monitoring events to recommending strategic actions** — is
the product's core differentiation versus traditional BI and geopolitical
monitoring tools.

**Design tenets**

1. *Opportunity-first.* Most tools surface risk. We lead with "where money is
   about to flow," then contextualise risk against it.
2. *Always answer "so what for me."* Every signal is translated into the user's
   own business context (company, industry, footprint, capital).
3. *Show the causal chain.* Every recommendation is drillable to its reasoning;
   nothing is a black box.
4. *Confidence is a first-class citizen.* Every number ships with a confidence
   band and a "what would change our mind" note.
5. *Ever-updating, ever-evolving.* The model, layers, and agents improve
   continuously; the UI never feels "done."

---

## 1. Feature set (one shot, no staging)

### A. Global Layers (the world model)
Toggleable analytical layers over a world view, each with its own live signal
feed, severity, trend, and affected geographies:

Wars · Elections · Tariffs · Trade routes · Sanctions · Inflation · Currency
volatility · Ports · Shipping congestion · Cyber attacks · Natural disasters ·
AI regulations · Energy prices · Local turbulence (riots, blackouts, internet
crackdowns) · Semiconductor supply · Critical minerals.

Each layer: on/off, intensity, time-decay, and a feed of detected events with
source-class, confidence, and "who this helps / who this hurts."

### B. Opportunity Radar
Inverts the risk lens — surfaces **opportunities** with momentum scores, e.g.:
- Vietnam electronics manufacturing opportunity ↑ 89%
- India AI hiring opportunity ↑
- Mexico nearshoring score ↑
- Saudi infrastructure projects ↑
- Indonesia battery manufacturing ↑

The AI constantly asks: **"Where is money about to flow?"** Each item shows
driver signals, time-to-window, est. size, and confidence.

### C. Country Opportunity Score
Every country gets a scorecard across:
Opportunity · Risk · Growth · Political Stability · Talent Availability ·
Manufacturing Readiness · Energy Security · Supply-Chain Resilience · AI
Regulation Friendliness · Startup Ecosystem · Investment Momentum ·
Infrastructure Readiness.

Example — **Singapore**: Opportunity 96 · Risk 9 · Manufacturing 75 · AI 98 ·
Talent 99.

### D. Business Impact Engine
User selects **"My company."** The AI shows how each global event hits:
Revenue · Hiring · Supply chain · Customers · Imports · Exports · Manufacturing
· Margins · Hiring costs · Shipping · Insurance · Taxes.

*Example:* Solar-panel company + new China tariff → expected cost increase,
alternative suppliers, demand shift, relocation candidates, time estimate,
confidence.

### E. AI Scenario Simulator *(killer feature)*
"What happens if…" — e.g. China invades Taiwan · US recession · India–EU FTA ·
Oil at $150 · Rate cuts · Pakistan instability · EU AI-Act enforcement ·
Semiconductor shortage · Pandemic · Rare-earth export bans.

The AI generates **first-, second-, third-, and fourth-order effects** — a
systems-thinking cascade — each with affected sectors, geographies, direction,
magnitude, and confidence.

### F. Global Supply-Chain Digital Twin
Interactive visualization of Factory · Supplier · Shipping · Ports · Warehouses
· Customers · Routes · Weak links · Replacement suppliers. The AI answers:
- Which supplier is most dangerous?
- What if Shanghai port closes? Hormuz? The Red Sea?

### G. Opportunity Finder *(strategist mode)*
User types a business (e.g. "I manufacture batteries.") → AI returns countries
with rising demand, subsidies, labor availability, competitor exits, upcoming
regulations, land/energy costs, talent, tax incentives, political stability, and
a demand forecast.

### H. Live Event Detection
Detects **patterns** ahead of the wire: 30 shipping delays + political speeches
+ satellite activity + currency moves + commodity futures → "conflict
probability increasing." Surfaces nascent signals with rationale + confidence.

### I. Executive Daily Brief
Each morning the AI writes **"Today matters because…"** with Top Opportunities
and Top Risks, tuned to the user's business context.

### J. Company Watchlists
Track competitors, countries, industries, companies, ports, leaders, trade
routes, critical minerals. Alerts: "Your watched supplier is now affected."

### K. AI Opportunity Finder (capital allocation)
User: "We have $500M to invest." → AI returns top countries, sectors,
incentives, risks, expected ROI, and confidence — a rankable allocation board.

### L. World Business Monitor
"FlightRadar24 for business" — factory openings/closures, layoffs, hiring,
CapEx, M&A, IPO, funding, government incentives, plant shutdowns, port
congestion, new logistics corridors, as a live event stream.

### M. Global Capital Flow Map
Visualise money moving — which countries attract VC, PE, government investment,
infrastructure, manufacturing, defense, AI, and energy capital.

### N. AI Trade-Route Monitor
Interactive map of sea, rail, air, road, pipelines, fiber cables, and critical
chokepoints — with congestion, threats, insurance, piracy, weather, military.

### O. Geopolitical Timeline
A past↔present↔future slider over ~30 years showing trade, wars, economy,
currency, supply chains, companies, and migrations.

### P. Corporate Exposure Analyzer
Upload supplier list / factories / customers → AI computes country dependence,
China exposure, Taiwan risk, oil dependency, currency risk, supplier
concentration.

### Q. AI Recommendation Engine
Not "here's the news" but **"you should…"**: expand in India, delay Germany,
increase Mexico sourcing, reduce Taiwan dependence, hedge JPY, buy copper, build
inventory, diversify suppliers.

### R. Industry-Specific Intelligence
Switchable industry lenses — Automotive · Healthcare · Defense · AI ·
Agriculture · Energy · Mining · Retail · Semiconductors · Luxury — each
reshaping every module's intelligence.

### S. Predictive Heatmap
Not current risk but **future opportunity**: next-12-months green (boom) /
yellow (emerging) / red (high risk) per country, with horizon controls.

### T. AI Debate Mode (Agent Council)
Ask "Should we enter Vietnam?" → CEO, CFO, COO, Chief Risk Officer, Supply-Chain
Head, Economist, Political Analyst, Legal, ESG each give an independent
recommendation, then a **synthesized decision**.

### U. Strategic Copilot *(most valuable)*
A conversational AI that holds the user's business context and continuously
turns world events into actionable strategy — drilling into the "why" behind any
recommendation on demand.

---

## 2. Cross-cutting capabilities

- **Multi-agent reasoning (LLM Agent Council):** economists, geopolitical
  analysts, supply-chain experts, legal, and industry experts analyze the same
  event before producing one unified recommendation.
- **Confidence scoring:** explains *why* the AI is confident or uncertain and
  names the missing information.
- **Time-horizon controls (30 days · 6 months · 2 years · 10 years):** separate
  tactical from strategic.
- **Portfolio simulation:** estimates how strategic choices move revenue,
  operating cost, supply-chain resilience, and risk across multiple futures.
- **Natural-language "why" exploration:** drill into any recommendation to see
  the causal chain.

---

## 3. Premium experience principles

- **Calm command-center, not a dashboard dump.** One primary question answered
  per view; depth on demand. Generous negative space; a single accent.
- **Editorial intelligence.** The Daily Brief reads like a sharp human analyst,
  not a metrics readout.
- **Direct manipulation.** Toggle a layer, drag a horizon, close a port — the
  model responds instantly and visibly.
- **Explainability as delight.** "Why?" is everywhere and always answerable down
  to source-class and confidence.
- **Motion with meaning.** Cascades animate causally (order 1 → 4); transitions
  carry state, never decorate.
- **Trust signals.** Confidence bands, "last updated," source-class, and
  "what would change our mind" are visible, not buried.
- **Accessible & responsive.** Keyboard-navigable, WCAG-AA contrast, graceful
  from 4K command wall to phone.

---

## 4. Reference architecture (for a production build)

- **Ingestion:** news/wire, filings, trade & customs, AIS shipping, satellite,
  commodity & FX markets, sanctions lists, election calendars, regulatory
  trackers → normalized event bus.
- **World model:** entity graph (countries, companies, ports, routes, minerals,
  sectors) + the 17 layers as time-decayed signal fields.
- **Reasoning:** retrieval + a multi-agent council (Claude) producing
  structured, cited, confidence-scored outputs; a simulator that propagates
  shocks through the graph for N-order effects.
- **Personalization:** per-tenant business context (footprint, suppliers,
  customers, capital) drives the Business Impact Engine and Copilot.
- **Delivery:** streaming API + web app; daily brief via email/push;
  watchlist alerts.

> Recommended model: latest Claude (Opus-class for council/scenario reasoning,
> a faster Claude for streaming chat) with tool use for retrieval and the graph
> simulator, and prompt-cached system context per tenant.

---

## 5. Prototype in this repo

`opportunity-simulator.html` (+ `assets/opportunity-sim.js`) is a fully
client-side, **simulated-data** prototype of the experience — every module A–U
is navigable and interactive so the vision can be felt, not just read. It is a
front-end demonstration; no live data or model calls are wired. It reuses the
portfolio's "Intelligence Terminal" design system and is linked from
`experiments.html`.
