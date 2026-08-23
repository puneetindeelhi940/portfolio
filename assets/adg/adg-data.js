/* Agent Decision Guard — data layer.
 * Deterministic seeded mock fleet. Every score on every screen is derived
 * from these primitives by the scoring functions below; no screen invents
 * its own numbers.
 * Built by Puneet Arora.
 */
(function (global) {
  'use strict';

  /* ---------------------------------------------------------------- seeded RNG */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rnd = mulberry32(20260823);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const between = (lo, hi, dp) => { const v = lo + rnd() * (hi - lo); const m = Math.pow(10, dp || 0); return Math.round(v * m) / m; };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ---------------------------------------------------------------- scoring */
  const TRUST_WEIGHTS = {
    reliability:    { w: 0.22, label: 'Task Reliability',  hint: 'Tasks completed correctly without human rework.' },
    policy:         { w: 0.20, label: 'Policy Compliance', hint: 'Actions evaluated clean against active policies.' },
    permission:     { w: 0.20, label: 'Permission Safety', hint: 'Actions stayed inside the granted authority envelope.' },
    dataIntegrity:  { w: 0.15, label: 'Data Integrity',    hint: 'Outputs traceable to verified source records.' },
    escalation:     { w: 0.11, label: 'Human Escalation',  hint: 'Agent handed off when it should have.' },
    costEfficiency: { w: 0.12, label: 'Cost Efficiency',   hint: 'Token and tool spend per completed task.' }
  };
  const TRUST_DIMS = Object.keys(TRUST_WEIGHTS);

  function trustOf(dims) {
    let t = 0;
    for (const k of TRUST_DIMS) t += (dims[k] || 0) * TRUST_WEIGHTS[k].w;
    return Math.round(t);
  }
  function trustBand(t) {
    if (t >= 90) return { key: 'trusted',    label: 'Trusted' };
    if (t >= 80) return { key: 'reliable',   label: 'Reliable' };
    if (t >= 70) return { key: 'monitored',  label: 'Monitored' };
    if (t >= 55) return { key: 'limited',    label: 'Limited' };
    return { key: 'untrusted', label: 'Untrusted' };
  }

  const HEALTH_PARTS = [
    { key: 'availability', label: 'Availability',    w: 0.25, unit: '%',  norm: (v) => v },
    { key: 'completion',   label: 'Task completion', w: 0.25, unit: '%',  norm: (v) => v },
    { key: 'failureRate',  label: 'Failure rate',    w: 0.20, unit: '%',  norm: (v) => clamp(100 - v * 8, 0, 100), invert: true },
    { key: 'retryRate',    label: 'Retry rate',      w: 0.15, unit: '%',  norm: (v) => clamp(100 - v * 3.4, 0, 100), invert: true },
    { key: 'latencyP95',   label: 'Latency p95',     w: 0.10, unit: 's',  norm: (v) => clamp(100 - (v - 0.8) * 14, 0, 100), invert: true },
    { key: 'toolErrors',   label: 'Tool errors',     w: 0.05, unit: '/day', norm: (v) => clamp(100 - v * 1.2, 0, 100), invert: true }
  ];
  function healthOf(h) {
    let s = 0;
    for (const p of HEALTH_PARTS) s += p.norm(h[p.key]) * p.w;
    return Math.round(s);
  }
  function healthBand(v) {
    if (v >= 92) return { key: 'healthy',  label: 'Healthy' };
    if (v >= 80) return { key: 'fair',     label: 'Fair' };
    if (v >= 65) return { key: 'degraded', label: 'Degraded' };
    return { key: 'failing', label: 'Failing' };
  }

  /* Permission impact weights — how much damage a granted capability could do. */
  const PERM_WEIGHTS = {
    data:    { 'Customer profile': 6, 'Financial data': 14, 'Employee data': 10, 'PII': 12 },
    tools:   { 'CRM': 4, 'ERP': 10, 'Payment system': 16, 'Email': 6, 'Database': 10, 'Web search': 2 },
    actions: { 'Read': 2, 'Create': 5, 'Modify': 10, 'Delete': 14, 'Approve': 14, 'Execute': 11 }
  };
  const PERM_TOTAL = Object.values(PERM_WEIGHTS)
    .reduce((s, g) => s + Object.values(g).reduce((a, b) => a + b, 0), 0);
  const GRANT_FACTOR = { allow: 1, approval: 0.35, block: 0 };

  function exposureOf(agent) {
    let granted = 0;
    for (const group of ['data', 'tools', 'actions']) {
      const perms = agent.permissions[group] || {};
      for (const key in perms) granted += (PERM_WEIGHTS[group][key] || 0) * (GRANT_FACTOR[perms[key]] || 0);
    }
    const breadth = (granted / PERM_TOTAL) * 100;
    const autonomy = clamp(agent.autonomousLimit / 2000, 0, 100);
    return Math.round(0.65 * breadth + 0.35 * autonomy);
  }

  function riskOf(agent, ctx) {
    const trust = trustOf(agent.dims);
    const exposure = exposureOf(agent);
    /* Volatility is a deterioration signal: only a falling trust score counts.
       A deliberate, applied improvement is the opposite of instability. */
    const volatility = clamp(Math.max(0, -(agent.trustDelta7d || 0)) * 4, 0, 100);
    const budget = clamp((agent.monthlyProjectedCost / Math.max(agent.budget, 1)) * 62, 0, 100);
    let score = 0.45 * (100 - trust) + 0.25 * exposure + 0.15 * (100 - agent.dims.policy)
              + 0.10 * volatility + 0.05 * budget;
    const open = (ctx && ctx.incidents ? ctx.incidents : []).filter(
      (i) => i.agentId === agent.id && i.status !== 'resolved');
    score += open.filter((i) => i.severity === 'critical').length * 10;
    score += open.filter((i) => i.severity === 'high').length * 5;
    score += Math.min(agent.openViolations || 0, 6) * 2.5;
    return Math.round(clamp(score, 0, 100));
  }
  function riskBand(v) {
    if (v >= 65) return { key: 'critical', label: 'Critical' };
    if (v >= 45) return { key: 'high',     label: 'High' };
    if (v >= 25) return { key: 'moderate', label: 'Moderate' };
    return { key: 'low', label: 'Low' };
  }

  /* ---------------------------------------------------------------- permission presets */
  const P_DATA = ['Customer profile', 'Financial data', 'Employee data', 'PII'];
  const P_TOOLS = ['CRM', 'ERP', 'Payment system', 'Email', 'Database', 'Web search'];
  const P_ACTIONS = ['Read', 'Create', 'Modify', 'Delete', 'Approve', 'Execute'];
  function perms(data, tools, actions) {
    const build = (keys, spec) => {
      const out = {};
      keys.forEach((k, i) => { out[k] = spec[i]; });
      return out;
    };
    return { data: build(P_DATA, data), tools: build(P_TOOLS, tools), actions: build(P_ACTIONS, actions) };
  }
  const A = 'allow', R = 'approval', B = 'block';

  /* ---------------------------------------------------------------- models */
  const MODELS = {
    frontier: { id: 'frontier', name: 'Orion Reasoning v4',  tier: 'Frontier', costPerKTask: 1.00, quality: 1.00 },
    balanced: { id: 'balanced', name: 'Orion Balanced v4',   tier: 'Balanced', costPerKTask: 0.46, quality: 0.965 },
    economy:  { id: 'economy',  name: 'Orion Economy v3.5',  tier: 'Economy',  costPerKTask: 0.19, quality: 0.905 }
  };

  /* ---------------------------------------------------------------- hand-authored fleet */
  const NOW = '2026-08-23T09:52:00+05:30';

  const CORE_AGENTS = [
    {
      id: 'ag-support', name: 'Customer Support Agent', department: 'Customer Experience', owner: 'Meera Raghavan',
      description: 'Resolves tier-1 and tier-2 support tickets end to end — warranty checks, replacements and refund recommendations.',
      status: 'awaiting-approval', model: 'frontier', version: '4.2.6', createdDate: '2025-11-04',
      dims: { reliability: 96, policy: 94, permission: 91, dataIntegrity: 89, escalation: 95, costEfficiency: 87 },
      health: { availability: 99.8, completion: 97.4, failureRate: 1.1, retryRate: 3.2, latencyP95: 1.9, toolErrors: 3 },
      currentCost: 5840, budget: 6800, monthlyProjectedCost: 6120, taskCount: 24180, successRate: 97.4,
      trustDelta7d: -1, openViolations: 0, autonomousLimit: 10000,
      permissions: perms([A, R, B, R], [A, B, B, A, A, A], [A, A, R, B, R, A]),
      mission: 'Resolve customer ticket #82941 — display failure inside warranty window.',
      currentAction: 'Checking warranty eligibility against the service registry.',
      nextAction: 'Recommend a like-for-like replacement unit.',
      can: ['Read customer profile', 'Check warranty status', 'Create support ticket', 'Recommend replacement', 'Issue store credit under $250'],
      needsApproval: ['Refunds above $10,000', 'Replacements above $50,000', 'Goodwill credits above $1,000'],
      cannot: ['Modify payment information', 'Delete customer records', 'Change published pricing', 'Contact customers outside the ticket thread']
    },
    {
      id: 'ag-procurement', name: 'Procurement Agent', department: 'Procurement', owner: 'Ravi Menon',
      description: 'Sources suppliers, negotiates line items and raises purchase orders against approved category budgets.',
      status: 'critical', model: 'frontier', version: '4.1.9', createdDate: '2026-02-11',
      dims: { reliability: 88, policy: 74, permission: 63, dataIntegrity: 82, escalation: 69, costEfficiency: 79 },
      health: { availability: 98.4, completion: 93.1, failureRate: 3.4, retryRate: 11.4, latencyP95: 3.1, toolErrors: 14 },
      currentCost: 6420, budget: 7000, monthlyProjectedCost: 7810, taskCount: 8420, successRate: 93.1,
      trustDelta7d: -13, openViolations: 4, autonomousLimit: 150000,
      permissions: perms([B, A, B, R], [A, A, R, A, A, A], [A, A, A, B, A, A]),
      mission: 'Close Q3 sourcing for the Bengaluru datacentre refresh.',
      currentAction: 'Paused — purchase order PO-44821 held at the approval boundary.',
      nextAction: 'Awaiting human decision on a $104,000 order to an unverified supplier.',
      can: ['Read supplier catalogue', 'Request quotes', 'Compare bids', 'Raise purchase orders', 'Update contract metadata'],
      needsApproval: ['Purchases above $150,000', 'Contract term changes'],
      cannot: ['Delete supplier records', 'Release payment', 'Alter approved budgets']
    },
    {
      id: 'ag-finance', name: 'Finance Operations Agent', department: 'Finance', owner: 'Anjali Desai',
      description: 'Reconciles ledgers, matches invoices to receipts and prepares month-end close packages.',
      status: 'critical', model: 'frontier', version: '4.0.4', createdDate: '2025-09-19',
      dims: { reliability: 71, policy: 81, permission: 74, dataIntegrity: 68, escalation: 84, costEfficiency: 72 },
      health: { availability: 96.1, completion: 88.2, failureRate: 6.8, retryRate: 17.9, latencyP95: 4.6, toolErrors: 27 },
      currentCost: 7910, budget: 8200, monthlyProjectedCost: 9240, taskCount: 15960, successRate: 88.2,
      trustDelta7d: -6, openViolations: 2, autonomousLimit: 75000,
      permissions: perms([R, A, R, R], [A, A, R, A, A, B], [A, A, A, B, R, A]),
      mission: 'Close the August ledger for the APAC entity set.',
      currentAction: 'Re-running 214 unmatched invoice lines after a source-system timeout.',
      nextAction: 'Escalate 38 lines that failed reconciliation twice.',
      can: ['Read general ledger', 'Match invoices', 'Draft journal entries', 'Generate close reports'],
      needsApproval: ['Journal entries above $75,000', 'Write-offs of any value', 'Employee expense adjustments'],
      cannot: ['Release payments', 'Modify chart of accounts', 'Delete ledger history']
    },
    {
      id: 'ag-research', name: 'Research Intelligence Agent', department: 'Research & Strategy', owner: 'Kabir Shah',
      description: 'Synthesises market, competitor and regulatory signal into briefing packs for the strategy office.',
      status: 'warning', model: 'frontier', version: '4.2.2', createdDate: '2026-01-27',
      dims: { reliability: 91, policy: 90, permission: 88, dataIntegrity: 79, escalation: 87, costEfficiency: 54 },
      health: { availability: 99.1, completion: 95.8, failureRate: 2.1, retryRate: 9.6, latencyP95: 5.8, toolErrors: 8 },
      currentCost: 9480, budget: 7500, monthlyProjectedCost: 13460, taskCount: 6240, successRate: 95.8,
      trustDelta7d: -4, openViolations: 0, autonomousLimit: 5000,
      permissions: perms([B, R, B, B], [R, B, B, A, A, A], [A, A, R, B, B, A]),
      mission: 'Assemble the Q4 competitive landscape pack for the board offsite.',
      currentAction: 'Summarising 1,840 retrieved documents on the frontier model tier.',
      nextAction: 'Draft the executive brief and cite provenance for every claim.',
      can: ['Search the public web', 'Read licensed research feeds', 'Draft briefing documents', 'Cite and link sources'],
      needsApproval: ['Accessing paid data sources above $500 per query'],
      cannot: ['Read customer data', 'Publish externally', 'Contact analysts directly']
    },
    {
      id: 'ag-sales', name: 'Sales Qualification Agent', department: 'Sales', owner: 'Tanvi Kulkarni',
      description: 'Scores inbound leads, enriches account records and books discovery calls for the field team.',
      status: 'active', model: 'balanced', version: '3.9.7', createdDate: '2025-08-02',
      dims: { reliability: 93, policy: 92, permission: 90, dataIntegrity: 86, escalation: 88, costEfficiency: 94 },
      health: { availability: 99.6, completion: 96.1, failureRate: 1.8, retryRate: 4.4, latencyP95: 1.6, toolErrors: 5 },
      currentCost: 3120, budget: 4000, monthlyProjectedCost: 3280, taskCount: 31450, successRate: 96.1,
      trustDelta7d: 2, openViolations: 0, autonomousLimit: 2500,
      permissions: perms([A, B, B, R], [A, B, B, A, A, A], [A, A, R, B, B, A]),
      mission: 'Qualify the 412 leads that arrived from the APAC webinar.',
      currentAction: 'Enriching account firmographics from the CRM.',
      nextAction: 'Route 38 qualified leads to named reps.',
      can: ['Read CRM records', 'Score leads', 'Send templated outreach', 'Book calendar slots'],
      needsApproval: ['Bulk email above 500 recipients', 'Discount mentions of any kind'],
      cannot: ['Modify pricing', 'Delete CRM records', 'Access financial data']
    },
    {
      id: 'ag-itdesk', name: 'IT Helpdesk Agent', department: 'IT', owner: 'Nikhil Bose',
      description: 'Handles password resets, access requests, device provisioning and tier-1 infrastructure triage.',
      status: 'active', model: 'balanced', version: '4.1.1', createdDate: '2025-06-14',
      dims: { reliability: 94, policy: 96, permission: 93, dataIntegrity: 91, escalation: 92, costEfficiency: 96 },
      health: { availability: 99.9, completion: 98.1, failureRate: 0.9, retryRate: 2.4, latencyP95: 1.2, toolErrors: 2 },
      currentCost: 2140, budget: 3200, monthlyProjectedCost: 2210, taskCount: 42800, successRate: 98.1,
      trustDelta7d: 1, openViolations: 0, autonomousLimit: 1000,
      permissions: perms([B, B, R, B], [B, B, B, A, A, A], [A, A, R, B, R, A]),
      mission: 'Clear the overnight access-request queue.',
      currentAction: 'Provisioning 22 laptop images for the Pune onboarding cohort.',
      nextAction: 'Close resolved tickets and publish the shift summary.',
      can: ['Reset passwords', 'Provision standard devices', 'Grant standard-tier access', 'Create incident tickets'],
      needsApproval: ['Admin or root access grants', 'Production system changes'],
      cannot: ['Access payroll data', 'Delete audit logs', 'Modify security groups']
    },
    {
      id: 'ag-hr', name: 'HR Assistant Agent', department: 'People Ops', owner: 'Sneha Iyer',
      description: 'Answers policy questions, manages leave workflows and guides new joiners through onboarding.',
      status: 'active', model: 'balanced', version: '3.8.3', createdDate: '2025-10-08',
      dims: { reliability: 92, policy: 95, permission: 89, dataIntegrity: 93, escalation: 94, costEfficiency: 91 },
      health: { availability: 99.4, completion: 96.7, failureRate: 1.4, retryRate: 3.8, latencyP95: 1.7, toolErrors: 4 },
      currentCost: 1980, budget: 2600, monthlyProjectedCost: 2040, taskCount: 18720, successRate: 96.7,
      trustDelta7d: 0, openViolations: 0, autonomousLimit: 2000,
      permissions: perms([B, B, A, R], [B, R, B, A, A, A], [A, A, R, B, R, A]),
      mission: 'Support the September onboarding cohort of 84 joiners.',
      currentAction: 'Answering benefits-eligibility questions from the policy corpus.',
      nextAction: 'Trigger day-one checklists for tomorrow’s starters.',
      can: ['Read HR policy corpus', 'Read employee records', 'Process leave requests', 'Send onboarding communications'],
      needsApproval: ['Compensation disclosures', 'Records access outside the requester’s own file'],
      cannot: ['Modify payroll', 'Access performance reviews', 'Delete employee records']
    },
    {
      id: 'ag-contract', name: 'Contract Review Agent', department: 'Legal', owner: 'Farhan Qureshi',
      description: 'Reviews inbound contracts against the clause playbook and flags deviations for counsel.',
      status: 'warning', model: 'frontier', version: '4.2.0', createdDate: '2026-03-22',
      dims: { reliability: 89, policy: 87, permission: 84, dataIntegrity: 76, escalation: 91, costEfficiency: 68 },
      health: { availability: 98.9, completion: 94.2, failureRate: 2.9, retryRate: 8.1, latencyP95: 6.4, toolErrors: 9 },
      currentCost: 4260, budget: 4400, monthlyProjectedCost: 5010, taskCount: 3180, successRate: 94.2,
      trustDelta7d: -3, openViolations: 1, autonomousLimit: 0,
      permissions: perms([R, R, B, R], [A, R, B, A, A, A], [A, A, R, B, B, A]),
      mission: 'Clear the 61-contract backlog ahead of quarter end.',
      currentAction: 'Comparing indemnity clauses against playbook v6.',
      nextAction: 'Escalate 9 contracts with non-standard liability caps.',
      can: ['Read contract repository', 'Compare against clause playbook', 'Draft redlines', 'Flag deviations'],
      needsApproval: ['Any outbound redline to a counterparty', 'Clause playbook edits'],
      cannot: ['Sign or execute contracts', 'Delete contract history', 'Change governing law terms']
    },
    {
      id: 'ag-fraud', name: 'Fraud Detection Agent', department: 'Risk & Fraud', owner: 'Deepa Nair',
      description: 'Scores transactions in real time, freezes suspicious activity and assembles investigation packets.',
      status: 'active', model: 'frontier', version: '4.3.1', createdDate: '2025-05-30',
      dims: { reliability: 97, policy: 93, permission: 86, dataIntegrity: 95, escalation: 96, costEfficiency: 82 },
      health: { availability: 99.9, completion: 98.6, failureRate: 0.6, retryRate: 1.9, latencyP95: 0.9, toolErrors: 1 },
      currentCost: 6740, budget: 7200, monthlyProjectedCost: 6980, taskCount: 184200, successRate: 98.6,
      trustDelta7d: 1, openViolations: 0, autonomousLimit: 25000,
      permissions: perms([A, A, B, R], [A, A, R, A, A, A], [A, A, R, B, R, A]),
      mission: 'Monitor the live payments stream across all channels.',
      currentAction: 'Scoring 1,240 transactions per minute against the risk model.',
      nextAction: 'Freeze and package the 3 flagged high-value transfers.',
      can: ['Read transaction stream', 'Score risk', 'Freeze suspicious transactions', 'Open investigation cases'],
      needsApproval: ['Account-level freezes above $25,000', 'Customer-facing notifications'],
      cannot: ['Reverse settled payments', 'Modify customer balances', 'Close cases unilaterally']
    },
    {
      id: 'ag-marketing', name: 'Marketing Intelligence Agent', department: 'Marketing', owner: 'Aditya Rao',
      description: 'Tracks campaign performance, generates creative variants and reallocates spend across channels.',
      status: 'warning', model: 'balanced', version: '3.9.2', createdDate: '2026-04-16',
      dims: { reliability: 85, policy: 79, permission: 81, dataIntegrity: 74, escalation: 76, costEfficiency: 88 },
      health: { availability: 98.2, completion: 91.4, failureRate: 4.2, retryRate: 12.8, latencyP95: 2.8, toolErrors: 16 },
      currentCost: 3890, budget: 4200, monthlyProjectedCost: 4460, taskCount: 12640, successRate: 91.4,
      trustDelta7d: -5, openViolations: 2, autonomousLimit: 15000,
      permissions: perms([A, R, B, A], [A, B, B, A, A, A], [A, A, A, B, R, A]),
      mission: 'Optimise the Q3 always-on demand campaign.',
      currentAction: 'Reallocating $18,400 of channel spend based on 7-day ROAS.',
      nextAction: 'Publish 12 creative variants to the review queue.',
      can: ['Read campaign analytics', 'Generate creative variants', 'Shift budget within a channel', 'Schedule sends'],
      needsApproval: ['Budget shifts above $15,000', 'Any external publication'],
      cannot: ['Publish paid media without review', 'Access customer payment data', 'Change brand guidelines']
    },
    {
      id: 'ag-supply', name: 'Supply Chain Agent', department: 'Supply Chain', owner: 'Vikram Chandra',
      description: 'Forecasts demand, rebalances inventory across nodes and reroutes shipments around disruption.',
      status: 'active', model: 'balanced', version: '4.0.8', createdDate: '2025-07-21',
      dims: { reliability: 90, policy: 91, permission: 87, dataIntegrity: 88, escalation: 85, costEfficiency: 90 },
      health: { availability: 99.3, completion: 95.2, failureRate: 2.3, retryRate: 6.1, latencyP95: 2.2, toolErrors: 6 },
      currentCost: 4520, budget: 5000, monthlyProjectedCost: 4710, taskCount: 22140, successRate: 95.2,
      trustDelta7d: 0, openViolations: 0, autonomousLimit: 40000,
      permissions: perms([B, R, B, B], [A, A, B, A, A, A], [A, A, A, B, R, A]),
      mission: 'Hold service levels through the monsoon disruption window.',
      currentAction: 'Rerouting 14 shipments away from the Chennai corridor.',
      nextAction: 'Rebalance safety stock across four western nodes.',
      can: ['Read inventory positions', 'Forecast demand', 'Create transfer orders', 'Reroute shipments'],
      needsApproval: ['Expedited freight above $40,000', 'Supplier substitutions'],
      cannot: ['Raise purchase orders', 'Change supplier contracts', 'Release payments']
    },
    {
      id: 'ag-exec', name: 'Executive Reporting Agent', department: 'Corporate', owner: 'Priya Balan',
      description: 'Assembles the weekly operating review and narrates variance against plan for the leadership team.',
      status: 'active', model: 'frontier', version: '4.2.4', createdDate: '2026-05-09',
      dims: { reliability: 94, policy: 97, permission: 95, dataIntegrity: 92, escalation: 93, costEfficiency: 85 },
      health: { availability: 99.7, completion: 97.8, failureRate: 1.2, retryRate: 3.1, latencyP95: 3.4, toolErrors: 3 },
      currentCost: 2680, budget: 3000, monthlyProjectedCost: 2790, taskCount: 1840, successRate: 97.8,
      trustDelta7d: 1, openViolations: 0, autonomousLimit: 0,
      permissions: perms([B, R, B, B], [R, R, B, A, A, A], [A, A, B, B, B, A]),
      mission: 'Prepare the week-34 operating review for the executive committee.',
      currentAction: 'Reconciling department variance against the approved plan.',
      nextAction: 'Draft the narrative and route to the CFO office for sign-off.',
      can: ['Read reporting warehouse', 'Assemble decks', 'Narrate variance', 'Distribute internally'],
      needsApproval: ['Any distribution outside the executive committee'],
      cannot: ['Modify source data', 'Access individual employee records', 'Publish externally']
    },
    {
      id: 'ag-dataqual', name: 'Data Quality Agent', department: 'Data Platform', owner: 'Rohan Mehta',
      description: 'Profiles pipelines, detects schema drift and quarantines records that fail contract validation.',
      status: 'warning', model: 'economy', version: '3.6.1', createdDate: '2025-12-03',
      dims: { reliability: 82, policy: 88, permission: 90, dataIntegrity: 61, escalation: 79, costEfficiency: 93 },
      health: { availability: 97.6, completion: 89.9, failureRate: 5.4, retryRate: 14.2, latencyP95: 2.1, toolErrors: 21 },
      currentCost: 1640, budget: 2200, monthlyProjectedCost: 1880, taskCount: 96400, successRate: 89.9,
      trustDelta7d: -7, openViolations: 1, autonomousLimit: 0,
      permissions: perms([R, R, R, R], [A, A, B, A, A, B], [A, A, A, R, B, A]),
      mission: 'Certify the customer-360 pipeline ahead of the quarterly refresh.',
      currentAction: 'Quarantining 4,180 records that failed the address contract.',
      nextAction: 'Raise a schema-drift ticket against the billing source.',
      can: ['Profile datasets', 'Run validation contracts', 'Quarantine failing records', 'Open data tickets'],
      needsApproval: ['Deleting quarantined records', 'Schema changes'],
      cannot: ['Modify production data', 'Grant data access', 'Bypass validation contracts']
    },
    {
      id: 'ag-compliance', name: 'Compliance Monitoring Agent', department: 'Risk & Fraud', owner: 'Deepa Nair',
      description: 'Watches agent and human activity for regulatory breach patterns and files evidence packets.',
      status: 'active', model: 'frontier', version: '4.2.9', createdDate: '2026-06-01',
      dims: { reliability: 95, policy: 98, permission: 94, dataIntegrity: 94, escalation: 97, costEfficiency: 80 },
      health: { availability: 99.8, completion: 98.3, failureRate: 0.8, retryRate: 2.1, latencyP95: 2.6, toolErrors: 2 },
      currentCost: 3410, budget: 3800, monthlyProjectedCost: 3520, taskCount: 58200, successRate: 98.3,
      trustDelta7d: 2, openViolations: 0, autonomousLimit: 0,
      permissions: perms([R, R, R, R], [A, A, B, A, A, A], [A, A, B, B, B, A]),
      mission: 'Maintain continuous control coverage across all 47 registered agents.',
      currentAction: 'Evaluating 12,400 actions against the active policy set.',
      nextAction: 'File the weekly control-attestation packet.',
      can: ['Read audit streams', 'Evaluate policies', 'Open compliance cases', 'File evidence packets'],
      needsApproval: ['Regulator-facing submissions'],
      cannot: ['Modify audit records', 'Close its own cases', 'Change policy definitions']
    }
  ];

  /* ---------------------------------------------------------------- generated fleet */
  const FILLER = [
    ['Invoice Matching Agent', 'Finance', 'Anjali Desai'], ['Expense Audit Agent', 'Finance', 'Anjali Desai'],
    ['Treasury Forecast Agent', 'Finance', 'Anjali Desai'], ['Payroll Query Agent', 'People Ops', 'Sneha Iyer'],
    ['Recruiting Screener Agent', 'People Ops', 'Sneha Iyer'], ['Learning Path Agent', 'People Ops', 'Sneha Iyer'],
    ['Ticket Triage Agent', 'Customer Experience', 'Meera Raghavan'], ['Voice-of-Customer Agent', 'Customer Experience', 'Meera Raghavan'],
    ['Warranty Claims Agent', 'Customer Experience', 'Meera Raghavan'], ['Returns Processing Agent', 'Customer Experience', 'Meera Raghavan'],
    ['Renewal Outreach Agent', 'Sales', 'Tanvi Kulkarni'], ['Quote Builder Agent', 'Sales', 'Tanvi Kulkarni'],
    ['Territory Planning Agent', 'Sales', 'Tanvi Kulkarni'], ['Competitor Watch Agent', 'Research & Strategy', 'Kabir Shah'],
    ['Patent Landscape Agent', 'Research & Strategy', 'Kabir Shah'], ['Regulatory Scan Agent', 'Legal', 'Farhan Qureshi'],
    ['NDA Fast-Track Agent', 'Legal', 'Farhan Qureshi'], ['Vendor Risk Agent', 'Procurement', 'Ravi Menon'],
    ['Spend Analytics Agent', 'Procurement', 'Ravi Menon'], ['Catalogue Hygiene Agent', 'Procurement', 'Ravi Menon'],
    ['Access Review Agent', 'IT', 'Nikhil Bose'], ['Patch Advisory Agent', 'IT', 'Nikhil Bose'],
    ['Endpoint Triage Agent', 'IT', 'Nikhil Bose'], ['Log Anomaly Agent', 'IT', 'Nikhil Bose'],
    ['Content Localisation Agent', 'Marketing', 'Aditya Rao'], ['SEO Signal Agent', 'Marketing', 'Aditya Rao'],
    ['Event Logistics Agent', 'Marketing', 'Aditya Rao'], ['Carrier Selection Agent', 'Supply Chain', 'Vikram Chandra'],
    ['Customs Documentation Agent', 'Supply Chain', 'Vikram Chandra'], ['Warehouse Slotting Agent', 'Supply Chain', 'Vikram Chandra'],
    ['Pipeline Lineage Agent', 'Data Platform', 'Rohan Mehta'], ['Metric Definition Agent', 'Data Platform', 'Rohan Mehta'],
    ['Board Pack Agent', 'Corporate', 'Priya Balan']
  ];

  function makeFiller(spec, i) {
    const [name, department, owner] = spec;
    const strong = rnd() > 0.28;
    const base = strong ? between(84, 97) : between(66, 84);
    const d = (spread) => Math.round(clamp(base + between(-spread, spread), 52, 99));
    const dims = {
      reliability: d(6), policy: d(7), permission: d(8),
      dataIntegrity: d(7), escalation: d(6), costEfficiency: d(11)
    };
    const tier = pick(['balanced', 'balanced', 'economy', 'frontier']);
    const tasks = Math.round(between(900, 48000));
    const budget = Math.round(between(700, 3400) / 10) * 10;
    const cost = Math.round(budget * between(0.52, 1.06, 2));
    const status = dims.policy < 72 || dims.permission < 70 ? 'warning' : 'active';
    return {
      id: 'ag-f' + String(i).padStart(2, '0'), name, department, owner,
      description: name.replace(' Agent', '') + ' workload running under standard ' + department.toLowerCase() + ' guardrails.',
      status, model: tier, version: '3.' + Math.floor(between(4, 9)) + '.' + Math.floor(between(0, 9)),
      createdDate: '2025-' + String(Math.floor(between(1, 12))).padStart(2, '0') + '-' + String(Math.floor(between(1, 28))).padStart(2, '0'),
      dims,
      health: {
        availability: between(96.4, 99.9, 1), completion: between(86, 98.4, 1), failureRate: between(0.6, 6.4, 1),
        retryRate: between(1.8, 15.2, 1), latencyP95: between(0.9, 5.4, 1), toolErrors: Math.round(between(1, 24))
      },
      currentCost: cost, budget, monthlyProjectedCost: Math.round(cost * between(1.01, 1.24, 2)),
      taskCount: tasks, successRate: 0, trustDelta7d: Math.round(between(-4, 4)),
      openViolations: dims.policy < 74 ? 1 : 0,
      autonomousLimit: pick([0, 1000, 2500, 5000, 10000, 25000]),
      permissions: perms(
        [pick([A, R, B]), pick([R, B, B]), pick([B, B, R]), pick([R, B])],
        [pick([A, R]), pick([R, B, A]), B, A, pick([A, R]), A],
        [A, pick([A, R]), pick([R, A, B]), B, pick([B, R]), A]
      ),
      mission: 'Standing ' + department.toLowerCase() + ' workload.',
      currentAction: 'Processing the active queue.',
      nextAction: 'Publish results to the owning team.',
      can: ['Read scoped records', 'Run its assigned workflow', 'Write results to the owning system'],
      needsApproval: ['Any action above its autonomous limit'],
      cannot: ['Delete records', 'Grant access', 'Transact externally']
    };
  }

  const AGENTS = CORE_AGENTS.concat(FILLER.map(makeFiller));
  AGENTS.forEach((a) => {
    a.successRate = a.health.completion;
    a.retryRate = a.health.retryRate;
    a.tools = Object.keys(a.permissions.tools).filter((t) => a.permissions.tools[t] !== 'block');
  });

  /* Normalise fleet spend so the enterprise KPI is the sum of its parts. */
  (function normaliseSpend() {
    const TARGET = 84291;
    const TARGET_PROJ = 102430;
    const core = CORE_AGENTS.reduce((s, a) => s + a.currentCost, 0);
    const fillers = AGENTS.slice(CORE_AGENTS.length);
    const fillerSum = fillers.reduce((s, a) => s + a.currentCost, 0);
    const k = (TARGET - core) / fillerSum;
    let running = core;
    fillers.forEach((a, i) => {
      const scaled = i === fillers.length - 1 ? TARGET - running : Math.round(a.currentCost * k);
      a.currentCost = scaled;
      running += scaled;
    });
    const coreProj = CORE_AGENTS.reduce((s2, a) => s2 + a.monthlyProjectedCost, 0);
    const fillProj = fillers.reduce((s2, a) => s2 + a.monthlyProjectedCost, 0);
    const kp = (TARGET_PROJ - coreProj) / fillProj;
    let runProj = coreProj;
    fillers.forEach((a, i) => {
      const v = i === fillers.length - 1 ? TARGET_PROJ - runProj : Math.round(a.monthlyProjectedCost * kp);
      a.monthlyProjectedCost = v; runProj += v;
      /* Budget headroom: a deterministic minority of the fleet runs hot. */
      const over = [2, 7, 11, 18, 24, 29].indexOf(i) !== -1;
      const f = over ? 0.86 + (i % 3) * 0.02 : 1.09 + (i % 5) * 0.04;
      a.budget = Math.max(240, Math.round((a.monthlyProjectedCost * f) / 10) * 10);
    });
  })();

  global.ADG_DATA = {
    NOW, AGENTS, MODELS, TRUST_WEIGHTS, TRUST_DIMS, HEALTH_PARTS,
    PERM_WEIGHTS, PERM_TOTAL, GRANT_FACTOR, P_DATA, P_TOOLS, P_ACTIONS,
    trustOf, trustBand, healthOf, healthBand, exposureOf, riskOf, riskBand, clamp, mulberry32
  };
})(window);
