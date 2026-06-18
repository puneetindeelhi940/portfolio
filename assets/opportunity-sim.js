/* AI Opportunity Simulator — interactive concept prototype.
 *
 * A fully client-side demonstration of a "living digital twin of the global
 * economy" for executives. ALL DATA IS SIMULATED / ILLUSTRATIVE — there are no
 * live feeds or model calls. The goal is to make the product vision tangible:
 * every module from the spec (A–U) is navigable and reactive to the global
 * context controls (time horizon · industry lens · company).
 *
 * Built on the portfolio's shared Intelligence-Terminal design tokens.
 */
(function () {
  'use strict';

  /* ───────────────────────── tiny DOM helpers ───────────────────────── */
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function meter(label, val, opts) {
    opts = opts || {};
    const cls = opts.risk ? 'fill risk' : 'fill';
    return `<div class="meter"><span class="ml">${esc(label)}</span>
      <span class="track"><span class="${cls}" style="width:${val}%"></span></span>
      <span class="mv">${val}</span></div>`;
  }
  function conf(level) { // level 1..5
    let dots = '';
    for (let i = 1; i <= 5; i++) dots += `<i class="${i <= level ? 'on' : ''}"></i>`;
    const words = ['', 'very low', 'low', 'moderate', 'high', 'very high'];
    return `<span class="conf">confidence <span class="dots">${dots}</span> ${words[level]}</span>`;
  }
  function why(text) {
    return `<details class="why"><summary>why this — trace the causal chain</summary><div class="body">${text}</div></details>`;
  }

  /* ───────────────────────── simulated data ───────────────────────── */
  const D = {};

  // C. Country opportunity scorecards (12 dimensions each)
  D.countries = [
    { name: 'Singapore', flag: '🇸🇬', s: { Opportunity: 96, Risk: 9, Growth: 71, 'Political Stability': 95, 'Talent Availability': 99, 'Manufacturing Readiness': 75, 'Energy Security': 70, 'Supply-Chain Resilience': 92, 'AI Regulation Friendliness': 90, 'Startup Ecosystem': 88, 'Investment Momentum': 91, 'Infrastructure Readiness': 97 }, note: 'The APJC control tower — neutral, liquid, and the default HQ for pan-Asia capital.' },
    { name: 'India', flag: '🇮🇳', s: { Opportunity: 93, Risk: 34, Growth: 96, 'Political Stability': 68, 'Talent Availability': 95, 'Manufacturing Readiness': 72, 'Energy Security': 55, 'Supply-Chain Resilience': 64, 'AI Regulation Friendliness': 74, 'Startup Ecosystem': 90, 'Investment Momentum': 94, 'Infrastructure Readiness': 66 }, note: 'Talent depth + PLI incentives + a domestic market that finally has scale.' },
    { name: 'Vietnam', flag: '🇻🇳', s: { Opportunity: 91, Risk: 31, Growth: 90, 'Political Stability': 72, 'Talent Availability': 70, 'Manufacturing Readiness': 84, 'Energy Security': 52, 'Supply-Chain Resilience': 66, 'AI Regulation Friendliness': 60, 'Startup Ecosystem': 64, 'Investment Momentum': 92, 'Infrastructure Readiness': 63 }, note: 'The China+1 winner for electronics assembly; power grid is the binding constraint.' },
    { name: 'Indonesia', flag: '🇮🇩', s: { Opportunity: 88, Risk: 36, Growth: 89, 'Political Stability': 64, 'Talent Availability': 66, 'Manufacturing Readiness': 70, 'Energy Security': 60, 'Supply-Chain Resilience': 58, 'AI Regulation Friendliness': 55, 'Startup Ecosystem': 72, 'Investment Momentum': 90, 'Infrastructure Readiness': 58 }, note: 'Nickel + battery downstreaming policy is rewriting the EV supply map.' },
    { name: 'Saudi Arabia', flag: '🇸🇦', s: { Opportunity: 87, Risk: 38, Growth: 85, 'Political Stability': 66, 'Talent Availability': 52, 'Manufacturing Readiness': 58, 'Energy Security': 98, 'Supply-Chain Resilience': 60, 'AI Regulation Friendliness': 68, 'Startup Ecosystem': 62, 'Investment Momentum': 95, 'Infrastructure Readiness': 74 }, note: 'Vision-2030 capex firehose — giga-projects, AI compute, and cheap energy.' },
    { name: 'Mexico', flag: '🇲🇽', s: { Opportunity: 86, Risk: 40, Growth: 79, 'Political Stability': 58, 'Talent Availability': 71, 'Manufacturing Readiness': 82, 'Energy Security': 63, 'Supply-Chain Resilience': 70, 'AI Regulation Friendliness': 57, 'Startup Ecosystem': 60, 'Investment Momentum': 88, 'Infrastructure Readiness': 64 }, note: 'Nearshoring to the US is structural, not a cycle — USMCA is the moat.' },
    { name: 'United States', flag: '🇺🇸', s: { Opportunity: 90, Risk: 28, Growth: 74, 'Political Stability': 62, 'Talent Availability': 92, 'Manufacturing Readiness': 76, 'Energy Security': 88, 'Supply-Chain Resilience': 78, 'AI Regulation Friendliness': 72, 'Startup Ecosystem': 99, 'Investment Momentum': 89, 'Infrastructure Readiness': 82 }, note: 'IRA + CHIPS reshoring subsidies; capital deep, but policy whips with elections.' },
    { name: 'Taiwan', flag: '🇹🇼', s: { Opportunity: 82, Risk: 62, Growth: 70, 'Political Stability': 48, 'Talent Availability': 90, 'Manufacturing Readiness': 96, 'Energy Security': 44, 'Supply-Chain Resilience': 50, 'AI Regulation Friendliness': 70, 'Startup Ecosystem': 74, 'Investment Momentum': 80, 'Infrastructure Readiness': 86 }, note: 'Irreplaceable at the leading edge — and the single largest concentration risk on Earth.' },
    { name: 'Germany', flag: '🇩🇪', s: { Opportunity: 71, Risk: 33, Growth: 48, 'Political Stability': 80, 'Talent Availability': 84, 'Manufacturing Readiness': 88, 'Energy Security': 50, 'Supply-Chain Resilience': 72, 'AI Regulation Friendliness': 58, 'Startup Ecosystem': 70, 'Investment Momentum': 60, 'Infrastructure Readiness': 85 }, note: 'World-class engineering carrying a high energy-cost base post-2022.' },
    { name: 'UAE', flag: '🇦🇪', s: { Opportunity: 89, Risk: 24, Growth: 83, 'Political Stability': 82, 'Talent Availability': 70, 'Manufacturing Readiness': 60, 'Energy Security': 95, 'Supply-Chain Resilience': 76, 'AI Regulation Friendliness': 80, 'Startup Ecosystem': 78, 'Investment Momentum': 93, 'Infrastructure Readiness': 90 }, note: 'The re-export + capital hub of the Gulf; aggressive on AI and logistics.' },
    { name: 'Brazil', flag: '🇧🇷', s: { Opportunity: 80, Risk: 42, Growth: 72, 'Political Stability': 60, 'Talent Availability': 68, 'Manufacturing Readiness': 66, 'Energy Security': 84, 'Supply-Chain Resilience': 62, 'AI Regulation Friendliness': 58, 'Startup Ecosystem': 73, 'Investment Momentum': 79, 'Infrastructure Readiness': 60 }, note: 'Agri-supercycle + green hydrogen + critical minerals beneath the surface.' },
    { name: 'Poland', flag: '🇵🇱', s: { Opportunity: 83, Risk: 35, Growth: 76, 'Political Stability': 70, 'Talent Availability': 82, 'Manufacturing Readiness': 80, 'Energy Security': 56, 'Supply-Chain Resilience': 74, 'AI Regulation Friendliness': 62, 'Startup Ecosystem': 71, 'Investment Momentum': 84, 'Infrastructure Readiness': 78 }, note: 'Europe\'s nearshoring + defense-spend beneficiary on NATO\'s eastern flank.' },
  ];

  // B. Opportunity radar
  D.radar = [
    { t: 'Vietnam electronics manufacturing', up: 89, d: 'China+1 reshoring + 14 new EMS lines announced; assembly capacity window opening before grid limits bite.', c: 4, why: 'Three contract-manufacturers signed Bac Ninh leases (signal class: filings), tariff-driver on Chinese assembly (policy), and 11% QoQ rise in component import licences (customs). Constraint: power availability caps 2026 throughput.' },
    { t: 'India AI & engineering hiring', up: 64, d: 'GCC build-out continues; senior AI talent ~40% cheaper than US with rising depth.', c: 5, why: 'GCC headcount postings +28% QoQ (job-board), three hyperscaler campus announcements (filings), and stable wage inflation vs talent depth.' },
    { t: 'Mexico nearshoring score', up: 57, d: 'USMCA-anchored relocation of auto & appliance supply chains from Asia to the US border.', c: 4, why: 'Industrial-park occupancy at record highs near Monterrey (real-estate), rail-corridor capex (infrastructure), and customs reclassification toward US imports.' },
    { t: 'Saudi infrastructure & compute', up: 52, d: 'Vision-2030 giga-projects + sovereign AI compute build-out; cheap energy underwrites it.', c: 4, why: 'PIF allocation increases (filings), data-centre power agreements (energy), giga-project tender volume up (procurement).' },
    { t: 'Indonesia battery & nickel downstream', up: 49, d: 'Export-ban-driven downstreaming pulls cell & precursor plants onshore.', c: 3, why: 'Ore export restrictions (policy) forcing local processing; JV announcements with Korean/Chinese cell makers (filings). Risk: ESG scrutiny on nickel.' },
    { t: 'Copper — structural deficit', up: 41, d: 'Electrification demand outruns mine supply; favours producers & holders, pressures buyers.', c: 4, why: 'Grid + EV demand curves vs thin project pipeline (commodity models); inventory drawdowns at LME (markets).' },
    { t: 'Poland defense-industrial', up: 38, d: 'NATO eastern-flank spending + EU nearshoring; dual-use manufacturing demand rising.', c: 3, why: 'Multi-year defense budgets legislated (policy), MRO & ammunition contracts (procurement).' },
    { t: 'Brazil agriculture export', up: 33, d: 'Weather-favourable cycle + currency tailwind lift soy, beef & coffee export margins.', c: 3, why: 'Harvest forecasts (satellite/agronomy), FX depreciation improving export economics (markets).' },
  ];

  // A. Global layers
  D.layers = [
    { n: 'Wars & conflict', on: true, sev: 'ELEVATED', sevc: 'down', m: '3 active theatres · 1 frozen', help: 'defense, cyber-sec, energy', hurt: 'shipping, tourism, insurance' },
    { n: 'Elections', on: true, sev: 'WATCH', sevc: 'hold', m: '6 votes in 90d (IN states, EU)', help: 'pollsters, infra (pre-vote spend)', hurt: 'FX, FDI timing' },
    { n: 'Tariffs', on: true, sev: 'RISING', sevc: 'down', m: 'New China-import duties signalled', help: 'Vietnam, Mexico, India EMS', hurt: 'import-reliant manufacturers' },
    { n: 'Trade routes', on: true, sev: 'STRAINED', sevc: 'down', m: 'Red Sea reroute persists', help: 'longer-haul carriers, Cape ports', hurt: 'EU importers, lead-times' },
    { n: 'Sanctions', on: false, sev: 'STABLE', sevc: 'hold', m: 'No new tier-1 listings', help: 'compliance, alt-suppliers', hurt: 'exposed financiers' },
    { n: 'Inflation', on: true, sev: 'COOLING', sevc: 'up', m: 'Disinflation broadening', help: 'rate-sensitive capex', hurt: 'cash-yield holders' },
    { n: 'Currency volatility', on: true, sev: 'WATCH', sevc: 'hold', m: 'JPY + EM FX choppy', help: 'exporters in weak-FX states', hurt: 'unhedged importers' },
    { n: 'Ports', on: false, sev: 'AMBER', sevc: 'hold', m: 'Shanghai + LA dwell up', help: 'inland depots, rail', hurt: 'JIT inventories' },
    { n: 'Shipping congestion', on: true, sev: 'AMBER', sevc: 'hold', m: 'Container rates +18% MoM', help: 'forwarders, 3PLs', hurt: 'thin-margin importers' },
    { n: 'Cyber attacks', on: false, sev: 'ELEVATED', sevc: 'down', m: 'OT/ransomware uptick', help: 'security vendors', hurt: 'manufacturing uptime' },
    { n: 'Natural disasters', on: true, sev: 'SEASONAL', sevc: 'hold', m: 'Typhoon season, W-Pacific', help: 'reconstruction, insurers (re-rate)', hurt: 'coastal ports, agri' },
    { n: 'AI regulations', on: true, sev: 'TIGHTENING', sevc: 'hold', m: 'EU AI-Act enforcement nears', help: 'compliance tooling, audits', hurt: 'high-risk AI deployers' },
    { n: 'Energy prices', on: true, sev: 'STABLE', sevc: 'up', m: 'Brent range-bound ~$78', help: 'energy-intensive reshoring', hurt: 'gas-exposed EU industry' },
    { n: 'Local turbulence', on: false, sev: 'WATCH', sevc: 'hold', m: 'Sporadic strikes / blackouts', help: 'resilience services', hurt: 'single-site operations' },
    { n: 'Semiconductor supply', on: true, sev: 'TIGHT', sevc: 'down', m: 'Leading-edge + HBM constrained', help: 'fab-tool makers, 2nd-source', hurt: 'AI hardware, autos' },
    { n: 'Critical minerals', on: true, sev: 'CONTESTED', sevc: 'down', m: 'Rare-earth + Ga/Ge export curbs', help: 'non-China processors, recyclers', hurt: 'magnets, optoelectronics' },
  ];

  // H/L. Live world monitor + event detection feed
  D.feed = [
    { ago: '7m ago', b: '<b>Pattern detected:</b> 31 vessel reroutes + commodity-future spike + naval movement → conflict-probability estimate rising in a maritime chokepoint.', tone: 'down', t: 'SIGNAL · PRE-WIRE' },
    { ago: '22m ago', b: '<b>Factory opening:</b> Korean cell-maker breaks ground on a 20GWh plant in Indonesia.', tone: 'up', t: 'CAPEX' },
    { ago: '40m ago', b: '<b>Incentive:</b> India notifies expanded PLI tranche for electronics components.', tone: 'up', t: 'POLICY' },
    { ago: '1h ago', b: '<b>Congestion:</b> Container dwell time at a major Asian port up 23% week-on-week.', tone: 'hold', t: 'LOGISTICS' },
    { ago: '2h ago', b: '<b>M&A:</b> Mid-cap automation OEM acquired by a US strategic — consolidation in robotics accelerating.', tone: 'up', t: 'M&A' },
    { ago: '3h ago', b: '<b>Layoffs:</b> European auto supplier cuts 4,000 roles citing energy + EV-transition costs.', tone: 'down', t: 'LABOR' },
    { ago: '5h ago', b: '<b>Currency:</b> JPY breaches a multi-decade band; exporters gain, importers squeezed.', tone: 'hold', t: 'FX' },
  ];

  // E. Scenarios with N-order cascades
  D.scenarios = [
    { id: 'taiwan', label: 'China–Taiwan crisis', c: 2, orders: [
      ['Leading-edge & advanced-packaging chip supply seizes globally', 'Naval/insurance disruption across the Strait & South China Sea', 'Equity risk-off; semis, autos, electronics gap down'],
      ['Auto & electronics lines idle within weeks on chip starvation', 'Shipping & war-risk insurance premiums spike; reroute to longer lanes', 'Capital flees the region toward US, India, Gulf safe-havens'],
      ['Multi-year reshoring of fabs accelerates (US, Japan, EU) at higher cost', 'Critical-mineral & rare-earth weaponisation in retaliation', 'Inflation re-accelerates on goods scarcity; rate-cut path stalls'],
      ['A permanently bifurcated tech stack (US-bloc vs China-bloc)', 'Defense & resilience capex becomes a decade-long structural theme', 'New manufacturing geographies (India, Mexico, Poland) durably re-rated'],
    ] },
    { id: 'recession', label: 'US recession', c: 3, orders: [
      ['US consumer demand contracts; discretionary spend falls first', 'Fed pivots to cutting; the dollar softens', 'Equity multiples compress, credit spreads widen'],
      ['Export demand to the US weakens across Asia & Mexico', 'EM currencies and capital flows stabilise as the dollar eases', 'Layoffs concentrate in tech, retail, and freight'],
      ['Cheaper capital eventually revives rate-sensitive capex', 'Commodity demand dips, relieving input-cost pressure', 'Nearshoring pauses, then resumes on a lower cost base'],
      ['Survivors consolidate share; M&A wave in weakened sectors', 'A leaner, lower-rate expansion sets up the next cycle', 'Supply chains rebuilt with resilience priced in'],
    ] },
    { id: 'oil150', label: 'Oil reaches $150', c: 3, orders: [
      ['Energy-import bills surge for Asia & Europe', 'Headline inflation re-accelerates immediately', 'Petro-states (Gulf, Brazil) see windfall revenue'],
      ['Central banks delay or reverse rate cuts', 'Energy-intensive manufacturing margins compress', 'Gulf capex (Vision-2030, UAE) accelerates further'],
      ['Demand destruction + EV/renewables adoption speeds up', 'Trade balances shift toward energy exporters', 'Shipping & logistics surcharges ripple into goods prices'],
      ['Structural acceleration of the energy transition', 'Energy-security reshoring becomes policy orthodoxy', 'A durable re-rating of clean-energy supply chains'],
    ] },
    { id: 'fta', label: 'India–EU FTA signed', c: 4, orders: [
      ['Tariff lines fall on autos, pharma, textiles, machinery', 'EU market access opens for Indian exporters', 'India becomes a more attractive EU-facing manufacturing base'],
      ['FDI into Indian export hubs accelerates', 'EU firms relocate India-facing supply into India', 'Services & data-flow provisions lift IT/GCC demand'],
      ['India deepens as a China+1 anchor for EU supply chains', 'Standards harmonisation raises Indian manufacturing quality bar', 'Logistics corridors (ports, rail) see fresh capex'],
      ['A durable EU–India industrial axis emerges', 'India\'s strategic optionality between blocs increases', 'Competitor hubs (Vietnam, Mexico) face margin pressure on EU trade'],
    ] },
    { id: 'rareearth', label: 'Rare-earth export ban', c: 3, orders: [
      ['Magnet & optoelectronic input prices spike', 'EV, wind, defense, robotics supply chains hit first', 'Non-China processors & recyclers re-rate sharply'],
      ['Stockpiling + frantic qualification of alt-suppliers', 'Substitution R&D (magnet-free motors) gets funded', 'Prices of finished goods using magnets rise'],
      ['Western mineral projects (Australia, US, Brazil) accelerate', 'Recycling & urban-mining scale as a structural industry', 'Allied mineral alliances & strategic reserves form'],
      ['A parallel non-China critical-mineral supply chain matures', 'Mineral security becomes permanent industrial policy', 'A decade-long capex theme in processing & recycling'],
    ] },
  ];

  // F. Supply-chain twin columns
  D.twin = {
    cols: [
      { cl: 'Suppliers', nodes: [{ t: 'Rare-earth magnets', m: 'CN · single-source', risk: true }, { t: 'LFP cathode', m: 'CN' }, { t: 'Power electronics', m: 'TW' }] },
      { cl: 'Factories', nodes: [{ t: 'Cell assembly', m: 'Vietnam' }, { t: 'Module pack', m: 'India' }] },
      { cl: 'Ports', nodes: [{ t: 'Shanghai', m: 'congested', risk: true }, { t: 'Singapore', m: 'clear' }, { t: 'Mundra', m: 'clear' }] },
      { cl: 'Routes', nodes: [{ t: 'Red Sea lane', m: 'rerouted', risk: true }, { t: 'Trans-Pacific', m: 'normal' }] },
      { cl: 'Warehouses', nodes: [{ t: 'Rotterdam DC', m: 'EU' }, { t: 'Dallas DC', m: 'US' }] },
      { cl: 'Customers', nodes: [{ t: 'EU OEMs', m: '46% rev' }, { t: 'US grid', m: '31% rev' }] },
    ],
    qa: [
      { q: 'Which supplier is most dangerous?', a: 'Rare-earth magnets — single-sourced in China, no qualified second source, and exposed to the active export-curbs layer. It is your highest concentration × highest geopolitical-exposure node.' },
      { q: 'What if Shanghai port closes?', a: 'Cell-assembly inbound stalls within ~12 days of buffer. Mitigation: pre-route through Ningbo/Singapore and air-freight magnet sub-assemblies — adds ~9% landed cost for the affected SKUs.' },
      { q: 'What if Hormuz closes?', a: 'Energy-cost shock first (oil layer), then a freight-rate spike. Direct cargo impact is low for this network, but input-cost and insurance pass-through hit margins by an estimated 3–5%.' },
      { q: 'What if the Red Sea stays unsafe?', a: 'Already priced in — the lane is rerouted via the Cape, adding ~10–14 days and ~18% freight on EU-bound flows. Structural mitigation: hold +2 weeks EU safety stock.' },
    ],
  };

  // T. Agent council
  D.council = [
    { role: 'CEO', stance: 'yes', text: 'Strategic fit is strong — this is where our customers and talent are heading. Enter, but stage capital against milestones.' },
    { role: 'CFO', stance: 'hold', text: 'ROI is attractive but FX and incentive-claw-back risk need hedging. Approve a capped first tranche, not the full commitment.' },
    { role: 'COO', stance: 'yes', text: 'Operationally feasible within 9–12 months given existing partner relationships and available industrial space.' },
    { role: 'Chief Risk Officer', stance: 'hold', text: 'Political-stability and policy-continuity risk are the swing factors. Insist on insurance + a dual-site structure.' },
    { role: 'Supply-Chain Head', stance: 'yes', text: 'This diversifies our China concentration meaningfully — a resilience win independent of the growth case.' },
    { role: 'Economist', stance: 'yes', text: 'Macro tailwinds (demand, demographics, investment momentum) are durable over our horizon, not cyclical.' },
    { role: 'Political Analyst', stance: 'hold', text: 'An election cycle adds 6–9 months of policy uncertainty. Time the announcement for after the vote.' },
    { role: 'Legal', stance: 'yes', text: 'Treaty protections and a workable JV structure exist; IP enforcement is adequate with the right contracts.' },
    { role: 'ESG', stance: 'yes', text: 'Labour and energy-mix profiles are acceptable and improving; reputationally net-positive versus the incumbent base.' },
  ];

  // S. Predictive heatmap (12-month outlook)
  D.heat = [
    { n: 'India', v: 93, k: 'boom' }, { n: 'Vietnam', v: 90, k: 'boom' }, { n: 'UAE', v: 89, k: 'boom' },
    { n: 'Saudi Arabia', v: 87, k: 'boom' }, { n: 'Mexico', v: 85, k: 'boom' }, { n: 'Indonesia', v: 82, k: 'emerging' },
    { n: 'Poland', v: 81, k: 'emerging' }, { n: 'Brazil', v: 78, k: 'emerging' }, { n: 'USA', v: 84, k: 'boom' },
    { n: 'Japan', v: 70, k: 'emerging' }, { n: 'Germany', v: 58, k: 'emerging' }, { n: 'Taiwan', v: 48, k: 'risk' },
    { n: 'Egypt', v: 44, k: 'risk' }, { n: 'Argentina', v: 55, k: 'emerging' }, { n: 'Nigeria', v: 41, k: 'risk' },
    { n: 'Turkey', v: 52, k: 'emerging' }, { n: 'Thailand', v: 72, k: 'emerging' }, { n: 'Philippines', v: 74, k: 'emerging' },
  ];

  // Q. Recommendation engine
  D.recs = [
    { a: 'EXPAND', t: 'Stand up a second manufacturing node in India', d: 'Talent + incentives + domestic demand justify it; also de-risks China concentration.', c: 4 },
    { a: 'REDUCE', t: 'Cut Taiwan single-source dependence to <40%', d: 'Qualify a second source for power electronics before the next horizon — concentration risk is the network\'s tail risk.', c: 5 },
    { a: 'INCREASE', t: 'Shift 20% of sourcing to Mexico for US-bound SKUs', d: 'USMCA + nearshoring lowers landed cost and lead-time variance to the US market.', c: 4 },
    { a: 'HEDGE', t: 'Hedge JPY and EM-FX exposure for 2 quarters', d: 'Currency-volatility layer is elevated; protect unhedged import margins.', c: 3 },
    { a: 'BUY', t: 'Forward-buy copper & qualify recycled rare-earth', d: 'Structural deficit + export curbs; lock input cost and a non-China magnet path.', c: 4 },
    { a: 'DELAY', t: 'Pause the Germany capacity decision one cycle', d: 'Energy-cost base + soft growth; revisit after the EU energy picture clarifies.', c: 3 },
  ];

  // P. Corporate exposure
  D.exposure = [
    { l: 'China dependence', v: 58, risk: true }, { l: 'Taiwan chip risk', v: 71, risk: true },
    { l: 'Single-supplier concentration', v: 44, risk: true }, { l: 'Oil / energy dependency', v: 33, risk: true },
    { l: 'Currency (unhedged)', v: 39, risk: true }, { l: 'Top-3 customer concentration', v: 62, risk: true },
  ];

  // O. Timeline beats
  D.timeline = {
    2001: ['China joins the WTO — the great offshoring wave begins', 'Manufacturing gravity shifts decisively to East Asia'],
    2008: ['Global financial crisis resets capital flows', 'EM demand becomes the marginal growth engine'],
    2016: ['Trade-tension era opens; "China+1" enters the lexicon', 'Supply-chain diversification begins quietly'],
    2020: ['Pandemic exposes single-source fragility', 'Resilience overtakes pure cost in sourcing decisions'],
    2022: ['Energy & inflation shock; sanctions reshape trade', 'Friend-shoring & reshoring become policy'],
    2026: ['AI + critical-minerals + nearshoring define the map', 'India, Gulf, Mexico, Vietnam re-rate structurally'],
    2030: ['Bifurcated tech stacks mature (projected)', 'Critical-mineral alliances harden into blocs'],
    2036: ['A multi-polar industrial world (projected)', 'Resilience-priced supply chains are the norm'],
  };

  // D. Business impact — per company × event
  D.companies = {
    solar: { name: 'Solar-panel manufacturer', event: 'New China tariff on imported cells & modules' },
    battery: { name: 'EV-battery maker (LFP)', event: 'Indonesia nickel-export downstreaming rules tighten' },
    robotics: { name: 'Industrial-robotics OEM', event: 'Rare-earth magnet export curbs expand' },
    apparel: { name: 'Apparel brand (Asia sourcing)', event: 'Red Sea reroute + Asian port congestion persist' },
    chips: { name: 'Fabless semiconductor designer', event: 'Leading-edge fab capacity tightens further' },
  };
  D.impactByCompany = {
    solar: {
      rows: [
        ['Margins', 'down', 'Input cost +9–14% on tariffed cells until supply re-routes'],
        ['Supply chain', 'down', 'Re-qualify non-China cell suppliers (India, Vietnam, Malaysia)'],
        ['Revenue', 'up', 'Domestic-content demand rises as imports get pricier'],
        ['Imports', 'down', 'Tariffed BOM; shift to domestic / FTA-origin sourcing'],
        ['Manufacturing', 'up', 'Case strengthens for local module assembly + PLI capture'],
      ],
      plays: ['Alt-suppliers: India (Mundra), Vietnam, Malaysia', 'Relocate assembly to capture domestic-content premium', 'Forward-buy 1 quarter of cells before duties bite'],
      window: '60–90 days to re-source', c: 4,
      why: 'Tariff layer + China-dependence in your BOM drive the cost shock; the Opportunity Radar shows domestic-content demand rising, which offsets via pricing power and PLI eligibility.'
    },
    battery: {
      rows: [
        ['Supply chain', 'down', 'Nickel/precursor pricing power shifts to Indonesia'],
        ['Manufacturing', 'up', 'Incentive to co-locate cell capacity in Indonesia'],
        ['Margins', 'down', 'Near-term input volatility on cathode chemistry'],
        ['Exports', 'up', 'Onshore-processed output gains preferential access'],
        ['Customers', 'up', 'OEMs seeking ESG-clean, traceable supply favour you'],
      ],
      plays: ['Lock multi-year nickel offtake', 'Evaluate Indonesia cell JV for downstream access', 'Dual-chemistry (LFP + Na-ion) to de-risk minerals'],
      window: '2 quarters', c: 3,
      why: 'Critical-minerals layer + Indonesia downstreaming policy concentrate pricing power upstream; co-location converts a cost risk into preferential access.'
    },
    robotics: {
      rows: [
        ['Margins', 'down', 'Magnet input cost spike on export curbs'],
        ['Supply chain', 'down', 'Single-source magnet node is the binding risk'],
        ['Revenue', 'up', 'Labour shortages lift automation demand structurally'],
        ['Manufacturing', 'hold', 'Substitution R&D (magnet-free motors) takes time'],
        ['Customers', 'up', '3 regions announced automation incentives'],
      ],
      plays: ['Diversify magnet suppliers + qualify recyclers', 'Prioritise sales into incentive markets', 'Fund magnet-free motor line as a hedge'],
      window: '6 months', c: 4,
      why: 'Critical-minerals layer hits your magnet node directly, while the labour + incentive signals on the radar lift demand — net strategic positive if you secure inputs.'
    },
    apparel: {
      rows: [
        ['Shipping', 'down', 'Freight +18% and +10–14 days on EU lanes'],
        ['Margins', 'down', 'Landed cost up; markdown risk on late seasons'],
        ['Supply chain', 'hold', 'Hold +2 weeks EU safety stock'],
        ['Customers', 'hold', 'On-time delivery risk on fast-fashion drops'],
        ['Imports', 'down', 'Lead-time variance complicates planning'],
      ],
      plays: ['Near-shore a share to Türkiye/N-Africa for EU', 'Pre-position EU inventory ahead of peak', 'Lock freight capacity contracts'],
      window: '30–60 days', c: 4,
      why: 'Trade-routes + shipping-congestion layers raise EU landed cost and variance; near-shoring a portion structurally shortens the EU lane.'
    },
    chips: {
      rows: [
        ['Supply chain', 'down', 'Leading-edge + packaging allocation tightens'],
        ['Revenue', 'up', 'AI-demand pull remains strong for your designs'],
        ['Margins', 'hold', 'Wafer-price pass-through partly protects you'],
        ['Manufacturing', 'down', 'Tape-out slots scarce; plan capacity early'],
        ['Customers', 'up', 'Design-win pipeline robust on AI/edge'],
      ],
      plays: ['Lock long-term wafer + packaging capacity now', 'Dual-foundry strategy for resilience', 'Prioritise high-margin AI SKUs for scarce slots'],
      window: 'plan 2–4 quarters ahead', c: 4,
      why: 'Semiconductor-supply layer constrains capacity while AI demand (radar) stays strong — scarcity favours those who lock capacity early.'
    },
  };

  /* ───────────────────────── state ───────────────────────── */
  const state = { horizon: '30d', industry: 'Semiconductors', company: 'solar', module: 'brief', country: 'Singapore', scenario: 'taiwan' };
  const horizonLabel = { '30d': '30 days', '6m': '6 months', '2y': '2 years', '10y': '10 years' };

  /* ───────────────────────── modules ───────────────────────── */
  const MODULES = [
    { id: 'brief', k: 'I', label: 'Daily Brief', grp: 'Brief', render: renderBrief },
    { id: 'radar', k: 'B', label: 'Opportunity Radar', grp: 'Find opportunity', render: renderRadar },
    { id: 'heatmap', k: 'S', label: 'Predictive Heatmap', grp: 'Find opportunity', render: renderHeatmap },
    { id: 'finder', k: 'G', label: 'Opportunity Finder', grp: 'Find opportunity', render: renderFinder },
    { id: 'scores', k: 'C', label: 'Country Scores', grp: 'Assess', render: renderScores },
    { id: 'layers', k: 'A', label: 'Global Layers', grp: 'Assess', render: renderLayers },
    { id: 'monitor', k: 'L', label: 'World Monitor', grp: 'Assess', render: renderMonitor },
    { id: 'impact', k: 'D', label: 'Business Impact', grp: 'My business', render: renderImpact },
    { id: 'twin', k: 'F', label: 'Supply-Chain Twin', grp: 'My business', render: renderTwin },
    { id: 'exposure', k: 'P', label: 'Exposure Analyzer', grp: 'My business', render: renderExposure },
    { id: 'scenario', k: 'E', label: 'Scenario Simulator', grp: 'Decide', render: renderScenario },
    { id: 'debate', k: 'T', label: 'Agent Council', grp: 'Decide', render: renderDebate },
    { id: 'recs', k: 'Q', label: 'Recommendations', grp: 'Decide', render: renderRecs },
    { id: 'timeline', k: 'O', label: 'Geo Timeline', grp: 'Decide', render: renderTimeline },
    { id: 'copilot', k: 'U', label: 'Strategic Copilot', grp: 'Copilot', render: renderCopilot },
  ];

  function modHead(title, tag, sub) {
    return `<div class="mod-head"><h2>${esc(title)}</h2><span class="tag">${esc(tag)}</span></div><p class="mod-sub">${sub}</p>`;
  }

  /* I. Executive Daily Brief */
  function renderBrief() {
    const topOps = D.radar.slice(0, 5);
    const m = $('#sim-main');
    m.innerHTML = modHead('Executive Daily Brief', 'Module I · Live',
      `Tuned to <b>${esc(D.companies[state.company].name)}</b> · <b>${esc(state.industry)}</b> lens · <b>${horizonLabel[state.horizon]}</b> horizon.`) +
      `<div class="card pad-lg" style="margin-bottom:16px;border-color:var(--signal)">
        <div class="ct" style="color:var(--signal)">Today matters because…</div>
        <p style="font-size:16px;color:var(--ink);line-height:1.65">The opportunity map is tilting toward <b>${esc(topOps[0].t.split(' ').slice(0,2).join(' '))}</b> and India talent, while your network's
        <b>Taiwan and rare-earth concentration</b> is the risk that would hurt most if a shock lands. On a ${esc(horizonLabel[state.horizon])} horizon, the highest-value
        move is to <b>secure inputs and a second manufacturing node</b> before pricing power shifts further upstream.</p>
        ${conf(4)}</div>
      <div class="cards c2">
        <div class="card"><div class="ct" style="color:var(--signal)">▲ Top opportunities</div>
          ${topOps.map(o => `<div style="padding:9px 0;border-bottom:1px solid var(--rule)"><span class="up mono" style="font-weight:700">↑${o.up}%</span> &nbsp;<span style="color:var(--ink)">${esc(o.t)}</span></div>`).join('')}
        </div>
        <div class="card"><div class="ct" style="color:var(--warn)">▼ Top risks</div>
          ${['Typhoon season pressuring W-Pacific shipping','Currency instability in EM + JPY','Election-cycle policy uncertainty (6 votes / 90d)','Rare-earth & semiconductor supply tightening','Red Sea reroute keeping EU lead-times long'].map(r => `<div style="padding:9px 0;border-bottom:1px solid var(--rule)"><span class="down mono">●</span> &nbsp;<span style="color:var(--ink)">${esc(r)}</span></div>`).join('')}
        </div>
      </div>
      <div style="margin-top:16px">${why('The brief is assembled by the agent council: the radar ranks momentum signals, the impact engine maps them onto your footprint, and the risk model surfaces your network\'s tail concentrations. Confidence is "high" because the top drivers are corroborated across filings, customs, and market data — it would drop if the election outcomes diverge from current polling.')}</div>`;
  }

  /* B. Opportunity Radar */
  function renderRadar() {
    $('#sim-main').innerHTML = modHead('Opportunity Radar', 'Module B',
      `The AI constantly asks <em>“where is money about to flow?”</em> — momentum-ranked for the <b>${esc(state.industry)}</b> lens over <b>${horizonLabel[state.horizon]}</b>.`) +
      `<div class="cards">${D.radar.map(o => `
        <div class="radar-item">
          <span class="ri-t">${esc(o.t)}</span>
          <span class="ri-v up">↑${o.up}%</span>
          <span class="ri-d">${esc(o.d)} &nbsp;·&nbsp; ${conf(o.c)}</span>
          <div style="grid-column:1/-1">${why(esc(o.why))}</div>
        </div>`).join('')}</div>`;
  }

  /* S. Predictive heatmap */
  function renderHeatmap() {
    const color = { boom: 'var(--signal)', emerging: 'oklch(80% 0.13 95)', risk: 'var(--warn)' };
    const bg = { boom: 'color-mix(in oklch, var(--signal) 16%, var(--surface))', emerging: 'color-mix(in oklch, oklch(80% 0.13 95) 14%, var(--surface))', risk: 'color-mix(in oklch, var(--warn) 14%, var(--surface))' };
    $('#sim-main').innerHTML = modHead('Predictive Heatmap', 'Module S',
      `Not current risk — <em>future opportunity</em>. Outlook over <b>${horizonLabel[state.horizon]}</b> · green = boom, amber = emerging, red = high-risk.`) +
      `<div class="heat">${D.heat.slice().sort((a,b)=>b.v-a.v).map(c => `
        <div class="cell" style="background:${bg[c.k]}">
          <div class="hc">${esc(c.n)}</div>
          <div class="hs">${c.v} · ${c.k}</div>
          <div class="hbar" style="width:${c.v}%;background:${color[c.k]}"></div>
        </div>`).join('')}</div>
      <p class="mod-sub" style="margin-top:18px">${conf(3)} — projections widen at longer horizons; the 10-year view is directional, not a forecast.</p>`;
  }

  /* G. Opportunity Finder */
  function renderFinder() {
    $('#sim-main').innerHTML = modHead('Opportunity Finder', 'Module G + K',
      'Describe what you build (or how much you have to deploy). The strategist returns where to go, why, and with what confidence.') +
      `<input class="input-lg" id="finder-in" placeholder='e.g. "I manufacture batteries" or "We have $500M to invest"' style="margin-bottom:12px">
       <div class="chip-row" id="finder-chips">
         ${['I manufacture batteries','I assemble electronics','We have $500M to invest','I run a robotics OEM'].map(c=>`<button data-q="${esc(c)}">${esc(c)}</button>`).join('')}
       </div>
       <div id="finder-out"></div>`;
    const run = (q) => finderResult(q);
    $('#finder-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') run(e.target.value); });
    $('#finder-chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { $('#finder-in').value = b.dataset.q; run(b.dataset.q); } });
    finderResult('I manufacture batteries');
  }
  function finderResult(q) {
    const capital = /\$|invest|deploy|million|billion|\bm\b/i.test(q);
    const out = $('#finder-out'); if (!out) return;
    if (capital) {
      const rows = [
        ['India', 'AI infra, electronics, pharma', 'PLI + GCC + domestic demand', 16.5, 4],
        ['Saudi Arabia', 'Compute, infrastructure, energy', 'PIF co-invest, cheap power', 15.0, 4],
        ['Vietnam', 'Electronics manufacturing', 'EMS cluster, China+1', 14.0, 3],
        ['Mexico', 'Auto & appliance nearshoring', 'USMCA, US-border logistics', 13.2, 4],
        ['Indonesia', 'Battery / nickel downstream', 'Downstreaming policy, demand', 12.8, 3],
      ];
      out.innerHTML = `<div class="card pad-lg"><div class="ct">Allocation board · $500M · ${horizonLabel[state.horizon]} · ${esc(state.industry)} lens</div>
        <div class="mon" style="margin-top:6px">
          <div class="row" style="background:var(--bg-2)"><span class="typ">Country</span><span class="geo">Sector</span><span class="desc">Top incentive</span><span class="amt">Est. ROI</span></div>
          ${rows.map(r=>`<div class="row"><span class="typ" style="color:var(--ink);font-family:var(--f-sans);font-size:14px">${esc(r[0])}</span><span class="geo">${esc(r[1])}</span><span class="desc" style="font-size:13px;color:var(--dim)">${esc(r[2])}</span><span class="amt up">↑ ~${r[3]}%</span></div>`).join('')}
        </div>
        <div class="pill-list"><span>Top risk: policy/FX whipsaw</span><span>Top hedge: stage tranches</span><span>${conf(4).replace(/<[^>]+>/g,m=>m)}</span></div>
        ${why('Rankings blend the country opportunity scores, the radar momentum, and incentive density, then discount by the risk score and your horizon. ROI bands are illustrative — they widen at longer horizons.')}</div>`;
    } else {
      const sectorWord = /robot/i.test(q) ? 'industrial robotics' : /electronic|assembl/i.test(q) ? 'electronics' : /batter/i.test(q) ? 'batteries' : 'your product';
      out.innerHTML = `<div class="card pad-lg"><div class="ct">Strategist read · "${esc(q)}" · ${esc(state.industry)} lens</div>
        <p style="color:var(--ink);font-size:15px;margin:0 0 14px">For <b>${esc(sectorWord)}</b>, the windows opening fastest right now:</p>
        <div class="cards c2">
          ${[
            ['Rising-demand markets','India, Indonesia, US (IRA), Saudi'],
            ['Government subsidies','PLI (India), IRA (US), downstreaming (Indonesia)'],
            ['Labor availability','India, Vietnam, Mexico — depth + cost'],
            ['Competitor exits','EU players retrenching on energy cost'],
            ['Upcoming regulations','EU AI-Act, carbon-border (CBAM) — plan ahead'],
            ['Land & energy cost','Lowest in Gulf + India SEZs'],
            ['Tax incentives','SEZ holidays, accelerated depreciation'],
            ['Demand forecast','structurally up on electrification + AI'],
          ].map(c=>`<div class="card"><div class="ct">${esc(c[0])}</div><p style="color:var(--ink)">${esc(c[1])}</p></div>`).join('')}
        </div>
        <div style="margin-top:14px">${conf(4)} ${why('The finder cross-references the radar (demand momentum), country scores (talent, energy, stability), and the policy layer (incentives, upcoming regulation) for your industry lens, then ranks by opportunity ÷ risk over the selected horizon.')}</div></div>`;
    }
  }

  /* C. Country scores */
  function renderScores() {
    const c = D.countries.find(x => x.name === state.country) || D.countries[0];
    $('#sim-main').innerHTML = modHead('Country Opportunity Score', 'Module C',
      'Every country, scored across twelve dimensions — opportunity-first, with risk in context.') +
      `<div class="country-grid">
        <div class="country-list" id="country-list">
          ${D.countries.slice().sort((a,b)=>b.s.Opportunity-a.s.Opportunity).map(x=>`<button data-c="${esc(x.name)}" class="${x.name===c.name?'is-active':''}">${x.flag} ${esc(x.name)}<span class="sc">${x.s.Opportunity}</span></button>`).join('')}
        </div>
        <div>
          <div class="card pad-lg" style="margin-bottom:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
              <h3 style="font-size:22px;margin:0">${c.flag} ${esc(c.name)}</h3>
              <div style="display:flex;gap:22px">
                <div style="text-align:right"><div class="metricbig up">${c.s.Opportunity}</div><div class="ct" style="margin:0">Opportunity</div></div>
                <div style="text-align:right"><div class="metricbig" style="color:var(--warn)">${c.s.Risk}</div><div class="ct" style="margin:0">Risk</div></div>
              </div>
            </div>
            <p style="margin-top:12px">${esc(c.note)}</p>
          </div>
          <div class="card pad-lg">
            <div class="ct">All dimensions · ${esc(state.industry)} lens</div>
            ${Object.keys(c.s).filter(k=>k!=='Opportunity'&&k!=='Risk').map(k=>meter(k, c.s[k])).join('')}
            ${meter('Risk', c.s.Risk, {risk:true})}
            <div style="margin-top:10px">${conf(4)}</div>
          </div>
        </div>
      </div>`;
    $('#country-list').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.country = b.dataset.c; renderScores(); } });
  }

  /* A. Global layers */
  function renderLayers() {
    $('#sim-main').innerHTML = modHead('Global Layers', 'Module A',
      'Sixteen analytical layers over the world model. Toggle a layer to fold its signal into every other module.') +
      `<div class="cards c2" id="layer-grid">${D.layers.map((l,i)=>`
        <div class="layer ${l.on?'on':''}" data-i="${i}" role="switch" aria-checked="${l.on}" tabindex="0">
          <span class="sw"></span>
          <span><span class="ln">${esc(l.n)}</span><div class="lmeta">${esc(l.m)} · helps ${esc(l.help)}</div></span>
          <span class="sev ${l.sevc}">${esc(l.sev)}</span>
        </div>`).join('')}</div>
      <div class="card pad-lg" style="margin-top:18px"><div class="ct">Detected signal feed · pre-wire pattern detection (Module H)</div>
        <div class="feed">${D.feed.map(f=>`<div class="fi"><span class="ft">${esc(f.ago)}</span><span class="fb">${f.b}<div class="tagline ${f.tone}">${esc(f.t)}</div></span></div>`).join('')}</div></div>`;
    const grid = $('#layer-grid');
    const toggle = (el) => { const i = +el.dataset.i; D.layers[i].on = !D.layers[i].on; el.classList.toggle('on', D.layers[i].on); el.setAttribute('aria-checked', D.layers[i].on); };
    grid.addEventListener('click', (e) => { const l = e.target.closest('.layer'); if (l) toggle(l); });
    grid.addEventListener('keydown', (e) => { if ((e.key===' '||e.key==='Enter')) { const l = e.target.closest('.layer'); if (l) { e.preventDefault(); toggle(l); } } });
  }

  /* L/M/N + H. World monitor */
  function renderMonitor() {
    const rows = [
      ['CAPEX','Indonesia','Korean cell-maker breaks ground on 20GWh battery plant','$1.4B'],
      ['FUNDING','India','AI-infra startup raises mega-round; GCC hiring to follow','$300M'],
      ['M&A','USA','Strategic acquires mid-cap automation OEM','$2.1B'],
      ['INCENTIVE','India','Expanded PLI tranche for electronics components','policy'],
      ['CONGESTION','China','Port dwell time +23% WoW at a major hub','logistics'],
      ['LAYOFFS','Germany','Auto supplier cuts 4,000 on energy + EV costs','−4,000'],
      ['CAPITAL','Saudi','PIF increases AI-compute & infrastructure allocation','+$5B'],
      ['CORRIDOR','Mexico','New cross-border rail capacity for nearshoring','infra'],
      ['IPO','UAE','Logistics group files for listing on re-export boom','IPO'],
      ['SHUTDOWN','EU','Energy-intensive chemical line idled','plant'],
    ];
    $('#sim-main').innerHTML = modHead('World Business Monitor', 'Modules L · M · N · H',
      'FlightRadar24 for business — capex, M&A, funding, incentives, congestion, and capital flows in one live stream, with pre-wire pattern detection on top.') +
      `<div class="mon">
        <div class="row" style="background:var(--bg-2)"><span class="typ">Type</span><span class="geo">Geo</span><span class="desc">Event</span><span class="amt">Value</span></div>
        ${rows.map(r=>`<div class="row"><span class="typ">${esc(r[0])}</span><span class="geo">${esc(r[1])}</span><span class="desc">${esc(r[2])}</span><span class="amt">${esc(r[3])}</span></div>`).join('')}
      </div>
      <div class="cards c3" style="margin-top:16px">
        <div class="card"><div class="ct">Capital-flow leaders (Module M)</div><p style="color:var(--ink)">India · Gulf · US · Mexico attracting VC, PE, sovereign & infra capital fastest.</p></div>
        <div class="card"><div class="ct">Trade-route watch (Module N)</div><p style="color:var(--ink)">Red Sea rerouted · Hormuz monitored · Trans-Pacific normal · new MX rail corridor.</p></div>
        <div class="card"><div class="ct">Pre-wire detection (Module H)</div><p style="color:var(--ink)">Reroutes + futures + naval movement → maritime-disruption probability rising.</p></div>
      </div>`;
  }

  /* D. Business impact engine */
  function renderImpact() {
    const co = D.companies[state.company]; const dat = D.impactByCompany[state.company];
    const dirc = { up: 'up', down: 'down', hold: '' }; const dirsym = { up: '▲', down: '▼', hold: '＝' };
    $('#sim-main').innerHTML = modHead('Business Impact Engine', 'Module D',
      `For <b>${esc(co.name)}</b>, the AI translates a live event into a P&L and operations read — automatically.`) +
      `<div class="card pad-lg" style="margin-bottom:16px;border-color:var(--warn)">
        <div class="ct" style="color:var(--warn)">Triggering event</div>
        <h3 style="margin:0">${esc(co.event)}</h3>
        <div style="margin-top:8px">Window to act: <b class="mono">${esc(dat.window)}</b> &nbsp;·&nbsp; ${conf(dat.c)}</div></div>
      <div class="cards c2">${dat.rows.map(r=>`
        <div class="card"><div style="display:flex;justify-content:space-between;align-items:center">
          <h3 style="margin:0;font-size:15px">${esc(r[0])}</h3><span class="${dirc[r[1]]} mono" style="font-weight:700">${dirsym[r[1]]}</span></div>
          <p style="margin-top:6px">${esc(r[2])}</p></div>`).join('')}</div>
      <div class="card pad-lg" style="margin-top:16px"><div class="ct">Recommended plays</div>
        <ul style="margin:0;padding-left:18px;color:var(--ink);line-height:1.8">${dat.plays.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
        <div style="margin-top:10px">${why(esc(dat.why))}</div></div>`;
  }

  /* F. Supply-chain twin */
  function renderTwin() {
    $('#sim-main').innerHTML = modHead('Supply-Chain Digital Twin', 'Module F',
      'An interactive twin of your network — suppliers to customers. Click a node to take it offline and watch the model react; ask the what-ifs below.') +
      `<div class="twin-board"><div class="twin-row" id="twin-row">${D.twin.cols.map((c,ci)=>`
        <div class="twin-col"><div class="cl">${esc(c.cl)}</div>
          ${c.nodes.map((n,ni)=>`<div class="node ${n.risk?'risk':''}" data-ci="${ci}" data-ni="${ni}" tabindex="0">${esc(n.t)}<div class="nm">${esc(n.m)}</div></div>`).join('')}
        </div>`).join('')}</div></div>
      <div class="card pad-lg" style="margin-top:16px"><div class="ct">Ask the twin</div>
        <div class="chip-row" id="twin-q">${D.twin.qa.map((q,i)=>`<button data-i="${i}">${esc(q.q)}</button>`).join('')}</div>
        <div id="twin-a" style="color:var(--ink);font-size:14px;line-height:1.6"></div></div>`;
    const row = $('#twin-row');
    row.addEventListener('click', (e) => { const n = e.target.closest('.node'); if (n) n.classList.toggle('down'); });
    row.addEventListener('keydown', (e) => { if (e.key===' '||e.key==='Enter') { const n = e.target.closest('.node'); if (n) { e.preventDefault(); n.classList.toggle('down'); } } });
    const a = $('#twin-a');
    $('#twin-q').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { const qa = D.twin.qa[+b.dataset.i]; a.innerHTML = `<p style="margin:0 0 8px"><b>${esc(qa.q)}</b></p><p style="margin:0;color:var(--dim)">${esc(qa.a)}</p>`; } });
    a.innerHTML = `<p style="margin:0;color:var(--dim)">Pick a question, or take a node offline to stress-test the network.</p>`;
  }

  /* P. Exposure analyzer */
  function renderExposure() {
    $('#sim-main').innerHTML = modHead('Corporate Exposure Analyzer', 'Module P',
      'Upload a supplier / factory / customer list and the AI computes your hidden concentrations. (Prototype: a representative profile.)') +
      `<div class="card pad-lg" style="margin-bottom:14px;border-style:dashed">
        <div style="text-align:center;color:var(--dim);font-family:var(--f-mono);font-size:12px">⤓ &nbsp;Drop suppliers.csv / factories.csv / customers.csv &nbsp;— or use the sample profile below</div></div>
      <div class="card pad-lg"><div class="ct">Concentration & dependency profile</div>
        ${D.exposure.map(x=>meter(x.l, x.v, {risk:x.v>=50})).join('')}
        <div style="margin-top:10px">${conf(4)} ${why('Each bar is a Herfindahl-style concentration on the relevant axis, weighted by the geopolitical exposure of the underlying geographies. Red ≥ 50 flags a tail risk worth a mitigation plan — here, Taiwan chip risk and top-customer concentration lead.')}</div></div>
      <div class="cards c3" style="margin-top:14px">
        <div class="card"><div class="ct">Biggest single risk</div><p style="color:var(--ink)">Taiwan chip dependence (71) — qualify a second source.</p></div>
        <div class="card"><div class="ct">Quick win</div><p style="color:var(--ink)">Diversify the single-source magnet node to cut concentration ~15 pts.</p></div>
        <div class="card"><div class="ct">Watch</div><p style="color:var(--ink)">Top-3 customers are 62% of revenue — broaden the base.</p></div>
      </div>`;
  }

  /* E. Scenario simulator */
  function renderScenario() {
    const sc = D.scenarios.find(s => s.id === state.scenario) || D.scenarios[0];
    const labels = ['First-order effects','Second-order effects','Third-order effects','Fourth-order effects'];
    $('#sim-main').innerHTML = modHead('AI Scenario Simulator', 'Module E · Killer feature',
      'Pick a shock. The systems-thinking engine propagates it four orders deep — immediate, then the consequences of the consequences.') +
      `<div class="scn-pick" id="scn-pick">${D.scenarios.map(s=>`<button data-s="${s.id}" class="${s.id===sc.id?'is-active':''}">${esc(s.label)}</button>`).join('')}</div>
       <div class="card pad-lg" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center">
         <h3 style="margin:0">Simulating: ${esc(sc.label)}</h3><span>${conf(sc.c)} · ${esc(horizonLabel[state.horizon])} horizon</span></div></div>
       <div class="order" id="scn-order">${sc.orders.map((ord,i)=>`
         <div class="ob"><div class="oh">${labels[i]}</div><ul>${ord.map(x=>{
            const dir = /down|fall|contract|weaken|stall|seiz|idle|flee|spike|compress|squeez|hit|cut|risk|scarcit/i.test(x)?'down':/up|rise|accel|revive|gain|boom|grow|wind|re-rate|matur|favour|open|relief|stabilis/i.test(x)?'up':'';
            const sym = dir==='down'?'▼':dir==='up'?'▲':'•';
            return `<li><span class="dir ${dir}">${sym}</span><span>${esc(x)}</span></li>`;}).join('')}</ul></div>`).join('')}</div>
       <div style="margin-top:16px">${why('The simulator propagates the shock through the entity graph — countries, sectors, routes, minerals — applying first-order impacts, then re-running on the new state to derive second-, third-, and fourth-order effects. Confidence falls with each order as the branching widens; later orders are scenario directions, not point forecasts.')}</div>`;
    $('#scn-pick').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.scenario = b.dataset.s; renderScenario(); } });
  }

  /* T. Agent council / debate */
  function renderDebate() {
    const yes = D.council.filter(a=>a.stance==='yes').length;
    $('#sim-main').innerHTML = modHead('AI Agent Council', 'Module T · Multi-agent',
      'Ask a strategic question. Nine specialist agents reason independently, then the model synthesises one decision — disagreement and all.') +
      `<div class="card pad-lg" style="margin-bottom:16px"><div class="ct">Question on the table</div>
        <h3 style="margin:0">“Should we enter Vietnam for electronics assembly?”</h3>
        <div style="margin-top:8px" class="mono" style="color:var(--dim)">${yes}/9 lean YES · ${9-yes} counsel CONDITIONS · 0 oppose</div></div>
      <div class="cards c3">${D.council.map(a=>`
        <div class="agent"><div class="ah"><span class="role">${esc(a.role)}</span><span class="stance ${a.stance}">${a.stance==='yes'?'ENTER':a.stance==='no'?'AVOID':'CONDITIONS'}</span></div>
          <p>${esc(a.text)}</p></div>`).join('')}</div>
      <div class="synthesis"><div class="ct">Synthesised decision</div>
        <h3 style="margin:0 0 8px">Enter — staged, hedged, and timed after the election.</h3>
        <p style="color:var(--dim);font-size:14px;line-height:1.6">The council converges on entry: the resilience and growth case is strong and the supply-chain diversification is valuable on its own. Dissent is about <em>timing and structure</em>, not direction — so commit a capped first tranche, insist on political-risk insurance and a dual-site structure, hedge FX, and announce after the vote.</p>
        <div style="margin-top:10px">${conf(4)}</div></div>`;
  }

  /* Q. Recommendation engine */
  function renderRecs() {
    const ac = { EXPAND:'up', INCREASE:'up', BUY:'up', HEDGE:'', REDUCE:'down', DELAY:'down' };
    $('#sim-main').innerHTML = modHead('AI Recommendation Engine', 'Module Q',
      `Not “here’s the news” — <em>“here’s what you should do”</em>. Prioritised for <b>${esc(D.companies[state.company].name)}</b> over <b>${horizonLabel[state.horizon]}</b>.`) +
      `<div class="cards c2">${D.recs.map(r=>`
        <div class="card pad-lg"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span class="mono ${ac[r.a]}" style="font-weight:700;letter-spacing:0.1em">${esc(r.a)}</span>${conf(r.c)}</div>
          <h3>${esc(r.t)}</h3><p>${esc(r.d)}</p></div>`).join('')}</div>
      <p class="mod-sub" style="margin-top:18px">Each recommendation is the council's net call after weighing opportunity, risk, and your exposure. Open any in the Copilot to trace its full causal chain.</p>`;
  }

  /* O. Geopolitical timeline */
  function renderTimeline() {
    const years = Object.keys(D.timeline).map(Number);
    const idx = years.indexOf(2026) >= 0 ? years.indexOf(2026) : 0;
    $('#sim-main').innerHTML = modHead('Geopolitical Timeline', 'Module O',
      'Slide through three decades of the global economy — past, present, and projected future. Watch the manufacturing map move.') +
      `<div class="card pad-lg">
        <input type="range" class="tl-slider" id="tl" min="0" max="${years.length-1}" value="${idx}" step="1">
        <div style="display:flex;justify-content:space-between" class="mono" style="font-size:10px;color:var(--faint)">${years.map(y=>`<span>${y}</span>`).join('')}</div>
        <div id="tl-out" style="margin-top:18px"></div></div>`;
    const out = $('#tl-out');
    const draw = (i) => { const y = years[i]; const beats = D.timeline[y]; const future = y > 2026;
      out.innerHTML = `<div class="tl-year">${y}${future?' <span class="mono" style="font-size:13px;color:var(--faint)">· projected</span>':''}</div>
        <ul style="margin:14px 0 0;padding-left:18px;color:var(--ink);line-height:1.9;font-family:var(--f-sans);font-size:15px">${beats.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`; };
    $('#tl').addEventListener('input', (e) => draw(+e.target.value)); draw(idx);
  }

  /* U. Strategic copilot */
  const copilotScript = {
    intro: "I'm tracking the world against your business context. Ask me anything — or try a prompt below. I'll always show you the reasoning behind a call.",
    answers: [
      { match: /robot|automation/i, html: "<p>For an industrial-robotics OEM, three things just moved in your favour and one against:</p><ul><li>Three countries announced <b>automation incentives</b> this quarter.</li><li><b>Rare-earth magnet prices</b> are expected to rise on export curbs — your key input risk.</li><li><b>Labour shortages</b> in two regions are structurally lifting automation demand.</li><li>A competitor is <b>expanding into Eastern Europe</b> (Poland).</li></ul><p><b>Recommended:</b> diversify magnet suppliers + qualify recyclers, prioritise sales into the incentive markets, and evaluate a manufacturing node in India.</p>" },
    { match: /vietnam/i, html: "<p>Vietnam screens as a strong <b>enter</b> for electronics assembly — the radar has it at ↑89% momentum. The council leans 6/9 YES; dissent is about timing and FX, not direction.</p><p><b>Do:</b> stage a capped first tranche, hedge FX, secure power-supply contracts early (the grid is the binding constraint), and announce after the election cycle.</p>" },
      { match: /taiwan|chip|semic/i, html: "<p>Your Taiwan/chip concentration is the single largest tail risk in your network (exposure 71). On any China–Taiwan shock the Scenario Simulator shows leading-edge supply seizing within weeks.</p><p><b>Do:</b> qualify a second source for power electronics, lock long-term wafer + packaging capacity, and target Taiwan dependence below 40% within the horizon.</p>" },
      { match: /china|tariff/i, html: "<p>The tariff layer is rising on Chinese imports. For your BOM that's a near-term cost shock, partly offset by domestic-content demand rising on the radar.</p><p><b>Do:</b> re-source to India/Vietnam/Malaysia over 60–90 days, forward-buy one quarter, and evaluate local assembly to capture the domestic-content premium.</p>" },
      { match: /invest|\$|expand|where/i, html: "<p>Over your selected horizon, capital is flowing fastest into <b>India, the Gulf, the US, and Mexico</b>. Best risk-adjusted entries for your profile: India (talent + incentives), Mexico (US-facing nearshoring), and Indonesia (battery downstream).</p><p>Open the <b>Opportunity Finder</b> for a ranked allocation board.</p>" },
    ],
    fallback: "<p>Here's how I'd think about that: I'd weigh the relevant <b>opportunity-radar</b> momentum and <b>country scores</b> against your <b>exposure</b>, run it through the <b>agent council</b>, and return a staged recommendation with a confidence band. Try asking about a specific country, your supply chain, or where to invest — and use the <b>Why</b> drill on any answer to see the causal chain.",
    prompts: ["We manufacture industrial robotics.", "Should we enter Vietnam?", "Reduce our Taiwan dependence?", "A new China tariff just appeared.", "Where should we invest next?"],
  };
  function renderCopilot() {
    $('#sim-main').innerHTML = modHead('Strategic Copilot', 'Module U · Most valuable',
      'A conversational strategist that holds your business context and continuously turns world events into action. (Prototype: scripted, illustrative replies.)') +
      `<div class="chip-row" id="cp-chips">${copilotScript.prompts.map(p=>`<button data-q="${esc(p)}">${esc(p)}</button>`).join('')}</div>
       <div class="chat"><div class="stream" id="cp-stream"></div>
         <form class="composer" id="cp-form"><input id="cp-in" placeholder="Ask the strategist…" autocomplete="off"><button class="btn btn--primary" type="submit">SEND</button></form></div>`;
    const stream = $('#cp-stream');
    const add = (who, html, cls) => { const d = document.createElement('div'); d.className = 'msg ' + (cls||''); d.innerHTML = `<div class="who">${esc(who)}</div><div class="bub">${html}</div>`; stream.appendChild(d); stream.scrollTop = stream.scrollHeight; return d; };
    add('Strategic Copilot', `<p>${copilotScript.intro}</p>`);
    const respond = (q) => {
      add('You', `<p>${esc(q)}</p>`, 'user');
      const hit = copilotScript.answers.find(a => a.match.test(q));
      const html = (hit ? hit.html : copilotScript.fallback) + `<div style="margin-top:8px">${why('I rank the relevant radar signals and country scores, map them onto your exposure profile, run the multi-agent council, and return a staged call with a confidence band. Replies here are illustrative.')}</div>`;
      const t = add('Strategic Copilot', '<p style="color:var(--faint)">thinking…</p>');
      setTimeout(() => { t.querySelector('.bub').innerHTML = html; stream.scrollTop = stream.scrollHeight; }, 420);
    };
    $('#cp-form').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#cp-in').value.trim(); if (v) { respond(v); $('#cp-in').value = ''; } });
    $('#cp-chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) respond(b.dataset.q); });
  }

  /* ───────────────────────── nav + routing ───────────────────────── */
  function buildNav() {
    const nav = $('#sim-nav'); let html = ''; let lastGrp = null;
    MODULES.forEach(m => {
      if (m.grp !== lastGrp) { html += `<div class="grp">${esc(m.grp)}</div>`; lastGrp = m.grp; }
      html += `<button data-m="${m.id}" class="${m.id===state.module?'is-active':''}"><span class="k">${m.k}</span>${esc(m.label)}</button>`;
    });
    nav.innerHTML = html;
    nav.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) go(b.dataset.m); });
  }
  function go(id) {
    state.module = id;
    document.querySelectorAll('#sim-nav button').forEach(b => b.classList.toggle('is-active', b.dataset.m === id));
    const mod = MODULES.find(m => m.id === id) || MODULES[0];
    mod.render();
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  }

  /* ───────────────────────── controls ───────────────────────── */
  function wireControls() {
    const hz = $('#ctrl-horizon');
    hz.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return;
      state.horizon = b.dataset.h;
      hz.querySelectorAll('button').forEach(x => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-checked', on); });
      rerender();
    });
    $('#ctrl-industry').addEventListener('change', (e) => { state.industry = e.target.value; rerender(); });
    $('#ctrl-company').addEventListener('change', (e) => { state.company = e.target.value; rerender(); });
  }
  function rerender() { (MODULES.find(m => m.id === state.module) || MODULES[0]).render(); }

  /* ───────────────────────── init ───────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    buildNav();
    wireControls();
    const hash = (location.hash || '').replace('#', '');
    go(MODULES.some(m => m.id === hash) ? hash : 'brief');
  });
})();
