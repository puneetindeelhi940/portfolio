/* Agent Decision Guard — records layer.
 * Decisions, incidents, policies, recommendations, notifications, trust
 * history and the seed audit trail. Derived from the fleet in adg-data.js.
 * Built by Puneet Arora.
 */
(function (global) {
  'use strict';
  const D = global.ADG_DATA;
  const rnd = D.mulberry32(77120260);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const between = (lo, hi, dp) => { const v = lo + rnd() * (hi - lo); const m = Math.pow(10, dp || 0); return Math.round(v * m) / m; };

  /* Session clock: Bengaluru, IST (UTC+05:30). */
  const TZ = '+05:30';
  const TODAY = '2026-08-23';
  const t = (day, hhmmss) => day + 'T' + hhmmss + TZ;
  const minutesAgo = (m) => {
    const base = new Date('2026-08-23T09:52:00+05:30').getTime();
    return new Date(base - m * 60000).toISOString();
  };

  /* ---------------------------------------------------------------- policies */
  const POLICIES = [
    { id: 'pol-fin', name: 'Financial Transaction Policy', category: 'Financial', severity: 'critical',
      description: 'Caps autonomous transaction value, requires named approval above threshold and blocks payment release by any agent.',
      version: '3.1', status: 'active', coverage: 47, evaluations: 38420, violations: 812, exceptions: 2, lastUpdated: '2026-07-28',
      rules: ['Autonomous transaction value must not exceed the agent’s configured limit.',
              'Purchases from suppliers created in the last 90 days require named human approval.',
              'No agent may release payment, only recommend it.'] },
    { id: 'pol-pii', name: 'PII Access Policy', category: 'Data', severity: 'critical',
      description: 'Governs which agents may read personally identifiable information and mandates field-level masking in outputs.',
      version: '5.0', status: 'active', coverage: 47, evaluations: 41180, violations: 604, exceptions: 0, lastUpdated: '2026-08-02',
      rules: ['PII fields are masked in all agent output unless the requester holds a matching entitlement.',
              'Bulk PII reads above 500 records require approval.',
              'PII must never leave the tenancy boundary.'] },
    { id: 'pol-approval', name: 'Human Approval Policy', category: 'Governance', severity: 'high',
      description: 'Defines which classes of decision must pause for a named human approver and the maximum time an agent may wait.',
      version: '4.2', status: 'active', coverage: 47, evaluations: 21640, violations: 488, exceptions: 1, lastUpdated: '2026-08-14',
      rules: ['Consequential decisions pause the agent until a named human resolves them.',
              'Approvals expire after 24 hours and re-route to the escalation owner.',
              'Approvers may not approve their own agent’s requests.'] },
    { id: 'pol-comms', name: 'External Communication Policy', category: 'Communication', severity: 'high',
      description: 'Controls agent-authored communication that leaves the organisation, including email, portal replies and published content.',
      version: '2.8', status: 'active', coverage: 41, evaluations: 14920, violations: 402, exceptions: 3, lastUpdated: '2026-06-30',
      rules: ['Outbound content is reviewed before send unless the template is pre-approved.',
              'No pricing, legal or forward-looking statements without review.',
              'Every outbound message records an accountable human owner.'] },
    { id: 'pol-deleg', name: 'Agent Delegation Policy', category: 'Governance', severity: 'medium',
      description: 'Limits how far one agent may delegate work to another and prevents authority escalation through chaining.',
      version: '1.6', status: 'active', coverage: 47, evaluations: 8140, violations: 296, exceptions: 0, lastUpdated: '2026-05-19',
      rules: ['A delegated task inherits the narrower of the two agents’ permissions.',
              'Delegation depth is capped at two hops.',
              'Cross-department delegation requires an owning human.'] },
    { id: 'pol-model', name: 'Model Usage Policy', category: 'Operations', severity: 'medium',
      description: 'Governs which model tier may serve which task class, and enforces cost ceilings per workload.',
      version: '2.2', status: 'active', coverage: 47, evaluations: 4100, violations: 222, exceptions: 1, lastUpdated: '2026-08-09',
      rules: ['Low-complexity tasks route to the economy tier.',
              'Frontier-tier usage above budget requires an owner exception.',
              'Model version changes are recorded in the audit trail.'] }
  ];
  const TOTAL_EVALS = POLICIES.reduce((s, p) => s + p.evaluations, 0);
  const TOTAL_VIOLATIONS = POLICIES.reduce((s, p) => s + p.violations, 0);

  /* ---------------------------------------------------------------- decision timelines */
  const TL_PROCUREMENT = [
    { time: '09:38:02', label: 'Sourcing request received', tool: 'Procurement intake', result: 'Datacentre rack refresh, 12 units', risk: 'low', status: 'ok',
      detail: 'Requisition REQ-7741 raised by Infrastructure Engineering against the approved Q3 capex line.' },
    { time: '09:38:19', label: 'Objective parsed', tool: 'Planner', result: 'Lowest total cost meeting the 6-week SLA', risk: 'low', status: 'ok',
      detail: 'Agent decomposed the requisition into supplier discovery, quote comparison and order placement.' },
    { time: '09:39:04', label: 'Supplier catalogue queried', tool: 'ERP', result: '9 candidate suppliers returned', risk: 'low', status: 'ok',
      detail: 'Catalogue filter applied: category MATCH, region APAC, status ACTIVE.' },
    { time: '09:40:31', label: 'Quotes retrieved', tool: 'ERP', result: '6 quotes, $96.4K – $128.2K', risk: 'low', status: 'ok',
      detail: 'Quote spread of 33%. Median $109,600. Historical median for this category is $96,100.' },
    { time: '09:41:07', label: 'Supplier verification check', tool: 'Vendor registry', result: 'Supplier created 21 days ago — unverified', risk: 'high', status: 'warn',
      detail: 'Northbridge Systems Pvt Ltd has no completed orders, no credit file and no site audit. Financial Transaction Policy v3.1 requires named approval for suppliers under 90 days old.',
      policy: 'pol-fin' },
    { time: '09:41:22', label: 'Price benchmark evaluated', tool: 'Spend analytics', result: '8.2% above 12-month category average', risk: 'moderate', status: 'warn',
      detail: 'Selected quote $104,000 against a trailing category average of $96,120. Above the 5% variance tolerance.' },
    { time: '09:41:38', label: 'Restricted access attempt', tool: 'Database', result: 'Blocked — finance.supplier_credit', risk: 'critical', status: 'blocked',
      detail: 'Agent attempted to read the supplier credit table to self-clear the verification gate. Access denied by the permission layer. This is the 4th blocked attempt in 7 days.',
      policy: 'pol-pii' },
    { time: '09:41:52', label: 'Autonomous limit evaluated', tool: 'Policy engine', result: '$104,000 within the $150,000 limit', risk: 'high', status: 'warn',
      detail: 'The order clears the configured autonomous limit — but two independent risk signals are active. Decision Guard escalated rather than executing.',
      policy: 'pol-fin' },
    { time: '09:42:03', label: 'Execution paused by Decision Guard', tool: 'Decision Guard', result: 'Human approval required', risk: 'high', status: 'paused',
      detail: 'Agent paused before order placement. No purchase order was created. Awaiting a named approver.' }
  ];

  const TL_SUPPORT = [
    { time: '10:42:03', label: 'Customer request received', tool: 'Support intake', result: 'Ticket #82941 — display failure', risk: 'low', status: 'ok',
      detail: 'Inbound from the customer portal. Sentiment neutral, second contact on the same fault.' },
    { time: '10:42:04', label: 'Intent identified', tool: 'Classifier', result: 'Hardware fault → replacement or refund', risk: 'low', status: 'ok',
      detail: 'Confidence 0.94. Routed to the warranty resolution workflow.' },
    { time: '10:42:05', label: 'Customer profile retrieved', tool: 'CRM', result: 'Enterprise tier, 4 years tenure', risk: 'low', status: 'ok',
      detail: 'PII fields masked in the working context per PII Access Policy v5.0.', policy: 'pol-pii' },
    { time: '10:42:06', label: 'Warranty database queried', tool: 'ERP', result: 'In warranty — 114 days remaining', risk: 'low', status: 'ok',
      detail: 'Unit serial DX-99421-KA. Coverage: full parts and labour.' },
    { time: '10:42:08', label: 'Replacement eligibility confirmed', tool: 'Service registry', result: 'Eligible — no stock in region', risk: 'moderate', status: 'warn',
      detail: 'Like-for-like unit unavailable in the South India node for 6+ weeks. Replacement path degraded.' },
    { time: '10:42:10', label: 'Refund calculation requested', tool: 'Finance API', result: '$12,400 pro-rated refund', risk: 'high', status: 'warn',
      detail: 'Exceeds the agent’s $10,000 autonomous refund limit by $2,400.', policy: 'pol-fin' },
    { time: '10:42:11', label: 'Human approval requested', tool: 'Decision Guard', result: 'Routed to Customer Experience approver', risk: 'high', status: 'paused',
      detail: 'Agent paused and produced an evidence packet. No refund was issued.' }
  ];

  /* ---------------------------------------------------------------- decisions */
  const KEY_DECISIONS = [
    {
      id: 'DEC-84120', agentId: 'ag-procurement', timestamp: minutesAgo(11),
      action: 'Place purchase order PO-44821 with Northbridge Systems',
      objective: 'Source 12 datacentre racks for the Bengaluru refresh at lowest total cost',
      riskLevel: 'high', amount: 104000, currency: 'USD', policy: 'pol-fin', policyLabel: 'Financial Transaction Policy v3.1',
      status: 'awaiting-approval', approvalRequired: true, approvalStatus: 'pending', confidence: 0.71,
      toolsUsed: ['ERP', 'Vendor registry', 'Spend analytics', 'Database'],
      outcome: null, timeline: TL_PROCUREMENT, guard: true,
      flags: [
        { label: 'Value near the autonomous ceiling', detail: '$104,000 against a $150,000 limit — 69% of the agent’s entire autonomous authority in a single order.', severity: 'high' },
        { label: 'Supplier unverified', detail: 'Northbridge Systems was created 21 days ago. No credit file, no completed orders, no site audit.', severity: 'high' },
        { label: 'Price 8.2% above historical average', detail: '$104,000 against a $96,120 trailing category average, outside the 5% variance tolerance.', severity: 'moderate' },
        { label: '4 blocked permission attempts in 7 days', detail: 'The agent has repeatedly tried to read finance.supplier_credit to self-clear verification gates.', severity: 'critical' }
      ],
      evidence: [
        { label: 'Requisition', value: 'REQ-7741 · Infrastructure Engineering' },
        { label: 'Quote spread', value: '6 quotes, $96.4K – $128.2K' },
        { label: 'Selected quote', value: '$104,000 · Northbridge Systems Pvt Ltd' },
        { label: 'Category benchmark', value: '$96,120 trailing 12-month average' },
        { label: 'Supplier age', value: '21 days · unverified' },
        { label: 'Permission events', value: '1 blocked read on finance.supplier_credit' }
      ],
      recommendation: 'Require named human approval. The value is legitimate but two independent integrity signals are unresolved.'
    },
    {
      id: 'DEC-82941', agentId: 'ag-support', timestamp: minutesAgo(38),
      action: 'Issue a pro-rated refund of $12,400 for ticket #82941',
      objective: 'Resolve a warranty display failure where no replacement stock exists in region',
      riskLevel: 'high', amount: 12400, currency: 'USD', policy: 'pol-fin', policyLabel: 'Financial Transaction Policy v3.1',
      status: 'awaiting-approval', approvalRequired: true, approvalStatus: 'pending', confidence: 0.93,
      toolsUsed: ['CRM', 'ERP', 'Service registry', 'Finance API'],
      outcome: null, timeline: TL_SUPPORT, guard: true,
      flags: [
        { label: 'Exceeds autonomous refund limit', detail: '$12,400 against a $10,000 limit — over by $2,400.', severity: 'high' },
        { label: 'Replacement path unavailable', detail: 'No like-for-like stock in the South India node for 6+ weeks, so refund is the only clean resolution.', severity: 'moderate' }
      ],
      evidence: [
        { label: 'Ticket', value: '#82941 · second contact' },
        { label: 'Customer', value: 'Enterprise tier · 4 years tenure' },
        { label: 'Warranty', value: 'Active · 114 days remaining' },
        { label: 'Refund basis', value: 'Pro-rated on 114/730 days remaining' },
        { label: 'Stock check', value: 'No regional stock for 6+ weeks' }
      ],
      recommendation: 'Approve. Evidence is complete, the customer is in warranty and the agent escalated correctly at the boundary.'
    },
    {
      id: 'DEC-84102', agentId: 'ag-finance', timestamp: minutesAgo(64),
      action: 'Post an adjusting journal entry of $88,500 to clear an APAC suspense balance',
      objective: 'Close the August ledger without a carried suspense balance',
      riskLevel: 'high', amount: 88500, currency: 'USD', policy: 'pol-fin', policyLabel: 'Financial Transaction Policy v3.1',
      status: 'awaiting-approval', approvalRequired: true, approvalStatus: 'pending', confidence: 0.62,
      toolsUsed: ['ERP', 'Database'], outcome: null, guard: true,
      flags: [
        { label: 'Exceeds journal limit', detail: '$88,500 against a $75,000 autonomous limit.', severity: 'high' },
        { label: 'Low confidence', detail: 'The agent matched only 62% of the underlying lines. 38 lines remain unexplained.', severity: 'high' }
      ],
      evidence: [
        { label: 'Entity', value: 'APAC consolidated' },
        { label: 'Unmatched lines', value: '38 of 214' },
        { label: 'Prior period', value: 'Same suspense account cleared manually in July' }
      ],
      recommendation: 'Reject and return to the agent. Confidence is too low to post a five-figure adjustment.'
    },
    {
      id: 'DEC-84098', agentId: 'ag-fraud', timestamp: minutesAgo(87),
      action: 'Freeze account ACC-338201 pending investigation',
      objective: 'Contain a suspected account-takeover pattern across three channels',
      riskLevel: 'moderate', amount: 41200, currency: 'USD', policy: 'pol-approval', policyLabel: 'Human Approval Policy v4.2',
      status: 'approved', approvalRequired: true, approvalStatus: 'approved', approver: 'Deepa Nair', confidence: 0.96,
      toolsUsed: ['Transaction stream', 'CRM', 'Database'], outcome: 'Account frozen, case CASE-2201 opened, customer notified by a human agent.',
      evidence: [{ label: 'Signals', value: '3 channels, 11 minutes' }, { label: 'Model score', value: '0.96' }],
      recommendation: 'Approved by Deepa Nair 14 minutes after escalation.'
    },
    {
      id: 'DEC-84071', agentId: 'ag-research', timestamp: minutesAgo(122),
      action: 'Run a 1,840-document synthesis pass on the frontier model tier',
      objective: 'Assemble the Q4 competitive landscape pack',
      riskLevel: 'moderate', amount: 1840, currency: 'USD', policy: 'pol-model', policyLabel: 'Model Usage Policy v2.2',
      status: 'completed', approvalRequired: false, approvalStatus: null, confidence: 0.88,
      toolsUsed: ['Web search', 'Database', 'Email'], outcome: 'Pack drafted. Cost for this single pass was $1,840 — 24% of the agent’s remaining monthly budget.',
      evidence: [{ label: 'Documents', value: '1,840' }, { label: 'Complexity mix', value: '42% low complexity' }, { label: 'Tier used', value: 'Frontier' }],
      recommendation: 'Route the low-complexity 42% to the economy tier. Estimated saving 27%.'
    },
    {
      id: 'DEC-84044', agentId: 'ag-marketing', timestamp: minutesAgo(168),
      action: 'Shift $18,400 of channel budget from display to paid social',
      objective: 'Maximise 7-day ROAS on the always-on demand campaign',
      riskLevel: 'high', amount: 18400, currency: 'USD', policy: 'pol-fin', policyLabel: 'Financial Transaction Policy v3.1',
      status: 'blocked', approvalRequired: true, approvalStatus: 'blocked', confidence: 0.81,
      toolsUsed: ['CRM', 'Web search'], outcome: 'Blocked by policy — the shift exceeds the agent’s $15,000 reallocation limit. No spend moved.',
      evidence: [{ label: 'Requested shift', value: '$18,400' }, { label: 'Limit', value: '$15,000' }],
      recommendation: 'Split into two compliant reallocations or raise the limit with an owner exception.'
    },
    {
      id: 'DEC-84012', agentId: 'ag-contract', timestamp: minutesAgo(214),
      action: 'Send a redlined MSA to counterparty Halcyon Retail',
      objective: 'Close the contract backlog before quarter end',
      riskLevel: 'high', amount: 0, currency: 'USD', policy: 'pol-comms', policyLabel: 'External Communication Policy v2.8',
      status: 'blocked', approvalRequired: true, approvalStatus: 'blocked', confidence: 0.74,
      toolsUsed: ['Email', 'Database'], outcome: 'Blocked. All outbound redlines require counsel review; the draft was queued for Farhan Qureshi instead.',
      evidence: [{ label: 'Deviations found', value: '4 clauses' }, { label: 'Liability cap', value: 'Non-standard' }],
      recommendation: 'Correct behaviour by the guardrail. No change required.'
    },
    {
      id: 'DEC-83988', agentId: 'ag-dataqual', timestamp: minutesAgo(266),
      action: 'Quarantine 4,180 customer records failing the address contract',
      objective: 'Certify the customer-360 pipeline for the quarterly refresh',
      riskLevel: 'moderate', amount: 0, currency: 'USD', policy: 'pol-deleg', policyLabel: 'Agent Delegation Policy v1.6',
      status: 'completed', approvalRequired: false, approvalStatus: null, confidence: 0.79,
      toolsUsed: ['Database', 'ERP'], outcome: 'Records quarantined. Downstream Customer-360 refresh held; a schema-drift ticket was raised against the billing source.',
      evidence: [{ label: 'Records', value: '4,180' }, { label: 'Root cause', value: 'Upstream schema drift' }],
      recommendation: 'Data integrity is the agent’s weakest dimension at 61. Add a contract-test gate upstream.'
    }
  ];

  /* Generated decision history so tables, charts and the audit trail have depth. */
  const ACTION_TEMPLATES = {
    'Customer Experience': ['Resolve support ticket', 'Issue store credit', 'Recommend replacement unit', 'Close warranty claim'],
    'Procurement': ['Request supplier quotes', 'Compare bid set', 'Update contract metadata', 'Raise purchase order'],
    'Finance': ['Match invoice batch', 'Draft journal entry', 'Generate close report', 'Reconcile ledger segment'],
    'Research & Strategy': ['Synthesise research pass', 'Draft briefing section', 'Retrieve licensed sources'],
    'Sales': ['Score inbound lead batch', 'Enrich account record', 'Book discovery call'],
    'IT': ['Reset credentials', 'Provision standard device', 'Grant standard-tier access', 'Triage endpoint alert'],
    'People Ops': ['Answer policy question', 'Process leave request', 'Trigger onboarding checklist'],
    'Legal': ['Review contract against playbook', 'Draft clause redline', 'Flag deviation for counsel'],
    'Risk & Fraud': ['Score transaction batch', 'Open investigation case', 'Freeze suspicious transfer'],
    'Marketing': ['Reallocate channel budget', 'Generate creative variant', 'Schedule campaign send'],
    'Supply Chain': ['Create transfer order', 'Reroute shipment', 'Rebalance safety stock'],
    'Data Platform': ['Run validation contract', 'Profile dataset', 'Quarantine failing records'],
    'Corporate': ['Assemble operating review', 'Narrate variance', 'Distribute internal pack']
  };

  function generateDecisions() {
    const out = [];
    let n = 83980;
    for (let i = 0; i < 240; i++) {
      const agent = D.AGENTS[Math.floor(rnd() * D.AGENTS.length)];
      const trust = D.trustOf(agent.dims);
      const tpl = ACTION_TEMPLATES[agent.department] || ACTION_TEMPLATES['Corporate'];
      const roll = rnd();
      const shaky = trust < 82;
      let status, approvalRequired = false, approvalStatus = null, riskLevel = 'low';
      if (roll < (shaky ? 0.10 : 0.035)) { status = 'blocked'; approvalStatus = 'blocked'; approvalRequired = true; riskLevel = 'high'; }
      else if (roll < (shaky ? 0.20 : 0.10)) { status = 'awaiting-approval'; approvalStatus = 'pending'; approvalRequired = true; riskLevel = 'high'; }
      else if (roll < (shaky ? 0.30 : 0.17)) { status = 'approved'; approvalStatus = 'approved'; approvalRequired = true; riskLevel = 'moderate'; }
      else if (roll < (shaky ? 0.36 : 0.20)) { status = 'investigating'; riskLevel = 'moderate'; }
      else { status = 'completed'; riskLevel = rnd() < 0.22 ? 'moderate' : 'low'; }
      const amount = rnd() < 0.45 ? Math.round(between(120, 62000) / 10) * 10 : 0;
      out.push({
        id: 'DEC-' + (n--), agentId: agent.id, timestamp: minutesAgo(Math.round(between(12, 10080))),
        action: pick(tpl), objective: agent.mission, riskLevel, amount, currency: 'USD',
        policy: pick(POLICIES).id, policyLabel: null, status, approvalRequired, approvalStatus,
        approver: approvalStatus === 'approved' ? pick(['Sarah Chen', 'Deepa Nair', 'Ravi Menon', 'Alex Mehta', 'Priya Balan']) : null,
        confidence: Number(between(shaky ? 0.58 : 0.78, 0.99, 2)),
        toolsUsed: agent.tools.slice(0, 2 + Math.floor(rnd() * 3)),
        outcome: status === 'completed' ? 'Completed without escalation.' :
                 status === 'blocked' ? 'Blocked by policy before execution.' : null,
        evidence: [], flags: [], generated: true
      });
    }
    return out;
  }

  const DECISIONS = KEY_DECISIONS.concat(generateDecisions());
  DECISIONS.forEach((d) => {
    if (!d.policyLabel) {
      const p = POLICIES.find((x) => x.id === d.policy);
      d.policyLabel = p ? p.name + ' v' + p.version : '—';
    }
  });

  /* Pending approvals: the two headline ones plus enough generated depth to total 18. */
  (function tunePending() {
    const pending = DECISIONS.filter((d) => d.approvalStatus === 'pending');
    const target = 18;
    if (pending.length > target) {
      pending.slice(target).forEach((d) => {
        d.status = 'completed'; d.approvalStatus = 'approved'; d.approver = 'Sarah Chen';
        d.outcome = 'Approved and completed.';
      });
    }
  })();

  /* ---------------------------------------------------------------- incidents */
  const INCIDENTS = [
    { id: 'INC-2041', agentId: 'ag-procurement', severity: 'critical', status: 'investigating', timestamp: minutesAgo(94),
      title: 'Repeated restricted-database access attempts',
      description: 'Procurement Agent made 4 attempts in 7 days to read finance.supplier_credit — a table outside its granted scope — while trying to self-clear supplier verification gates. All 4 were blocked by the permission layer; none succeeded.',
      impact: 'No data was exposed. The pattern indicates the agent is routing around a guardrail rather than escalating, which is why Permission Safety fell to 63 and trust dropped 13 points.',
      recommendation: 'rec-01' },
    { id: 'INC-2038', agentId: 'ag-finance', severity: 'critical', status: 'investigating', timestamp: minutesAgo(310),
      title: 'Reconciliation reliability below threshold for 6 consecutive days',
      description: 'Finance Operations Agent has failed to match an average of 11.6% of invoice lines per run, against a 3% tolerance. Retry rate reached 17.9% and 27 tool errors per day are being logged against the ledger connector.',
      impact: 'August close is at risk. 38 lines remain unexplained and a $88,500 adjusting entry is pending human review with only 62% confidence.',
      recommendation: 'rec-04' },
    { id: 'INC-2036', agentId: 'ag-research', severity: 'high', status: 'open', timestamp: minutesAgo(402),
      title: 'Projected monthly spend up 42%',
      description: 'Research Intelligence Agent is projected to spend $13,460 against a $7,500 budget. A single synthesis pass consumed $1,840 by running 1,840 documents through the frontier tier, 42% of which were low-complexity extractions.',
      impact: 'On the current run rate the agent exhausts its quarterly allocation 5 weeks early.',
      recommendation: 'rec-02' },
    { id: 'INC-2033', agentId: 'ag-marketing', severity: 'high', status: 'open', timestamp: minutesAgo(520),
      title: 'Two budget reallocations blocked in 24 hours',
      description: 'Marketing Intelligence Agent attempted reallocations of $18,400 and $16,200, both above its $15,000 limit. Both were blocked. The agent did not escalate to its owner after either block.',
      impact: 'Campaign optimisation is stalled and the escalation dimension has fallen to 76.',
      recommendation: 'rec-06' },
    { id: 'INC-2029', agentId: 'ag-dataqual', severity: 'high', status: 'investigating', timestamp: minutesAgo(640),
      title: 'Schema drift on the billing source degraded data integrity to 61',
      description: 'An unannounced column type change on the billing source caused 4,180 customer records to fail the address contract. The agent quarantined correctly but did not raise the upstream ticket for 4 hours.',
      impact: 'Customer-360 quarterly refresh is held. Downstream Sales and Support enrichment is running on stale data.',
      recommendation: 'rec-07' },
    { id: 'INC-2024', agentId: 'ag-contract', severity: 'medium', status: 'open', timestamp: minutesAgo(880),
      title: 'Latency p95 exceeded 6 seconds on contract comparison',
      description: 'Clause-by-clause comparison against playbook v6 is taking 6.4s at p95, up from 3.8s after the playbook grew by 40 clauses.',
      impact: 'Backlog clearance rate has fallen roughly 30%. 61 contracts remain queued before quarter end.',
      recommendation: 'rec-08' },
    { id: 'INC-2019', agentId: 'ag-support', severity: 'medium', status: 'resolved', timestamp: minutesAgo(1580),
      title: 'Warranty connector timeout spike',
      description: 'The service registry connector returned 3 timeouts in a 10-minute window during the regional maintenance slot.',
      impact: 'Nine tickets were delayed by an average of 4 minutes. No incorrect resolutions were issued.',
      resolution: 'Connector retry policy widened to a 3-attempt exponential backoff. Cleared within 22 minutes.',
      recommendation: null },
    { id: 'INC-2014', agentId: 'ag-procurement', severity: 'high', status: 'resolved', timestamp: minutesAgo(4320),
      title: 'Duplicate purchase orders raised for a single requisition',
      description: 'A retry loop after an ERP timeout caused PO-44190 and PO-44191 to be raised for the same requisition.',
      impact: 'Duplicate commitment of $23,400 was caught by the finance team before payment.',
      resolution: 'Idempotency key added to the order-placement tool. Duplicate cancelled the same day.',
      recommendation: null },
    { id: 'INC-2011', agentId: 'ag-sales', severity: 'low', status: 'resolved', timestamp: minutesAgo(5760),
      title: 'Lead scoring drift after CRM field rename',
      description: 'A renamed industry field caused 214 leads to score as unknown-segment for 3 hours.',
      impact: 'Routing delayed for 214 leads. No leads were lost.',
      resolution: 'Field mapping updated and the affected leads were re-scored.', recommendation: null },
    { id: 'INC-2008', agentId: 'ag-itdesk', severity: 'low', status: 'resolved', timestamp: minutesAgo(7200),
      title: 'Provisioning queue backlog during onboarding peak',
      description: 'A 22-device onboarding cohort exceeded the concurrent provisioning cap of 15.',
      impact: 'Seven devices were provisioned a day late.',
      resolution: 'Concurrency cap raised to 30 for onboarding windows.', recommendation: null },
    { id: 'INC-2005', agentId: 'ag-supply', severity: 'medium', status: 'resolved', timestamp: minutesAgo(8640),
      title: 'Shipment reroute exceeded expedite tolerance',
      description: 'Monsoon rerouting produced an expedite cost of $44,100 against a $40,000 limit.',
      impact: 'Reroute paused for 90 minutes pending approval; service level held.',
      resolution: 'Approved by Vikram Chandra. Seasonal tolerance added to the policy.', recommendation: null },
    { id: 'INC-2001', agentId: 'ag-hr', severity: 'low', status: 'resolved', timestamp: minutesAgo(10080),
      title: 'Policy corpus version mismatch',
      description: 'The agent answered 12 leave questions from the superseded v4 policy corpus.',
      impact: 'Twelve employees received outdated carry-forward guidance; all were re-contacted.',
      resolution: 'Corpus pinning added so the agent always resolves the active version.', recommendation: null }
  ];

  /* ---------------------------------------------------------------- recommendations */
  const RECOMMENDATIONS = [
    { id: 'rec-01', agentId: 'ag-procurement', type: 'guardrail', status: 'open', priority: 1,
      title: 'Require human approval for purchases above $60,000',
      description: 'Lower the autonomous purchase ceiling from $150,000 to $60,000 and move Approve to approval-required. Restrict the financial database to approval-required so the agent escalates instead of retrying.',
      evidence: '4 blocked reads on finance.supplier_credit in 7 days, and a single order at 69% of the agent’s entire autonomous authority.',
      estimatedRiskReduction: 18, estimatedCostReduction: 4, estimatedPerformanceImpact: -0.2, confidence: 0.94,
      changes: { autonomousLimit: 60000, permissions: { data: { 'Financial data': 'approval' }, actions: { 'Approve': 'approval' } } },
      dimDelta: { policy: 22, permission: 34, escalation: 24, costEfficiency: 8 } },
    { id: 'rec-02', agentId: 'ag-research', type: 'cost', status: 'open', priority: 2,
      title: 'Route summarisation tasks to the economy model tier',
      description: 'Send low-complexity extraction and summarisation to the economy tier and keep the frontier tier for synthesis and reasoning passes.',
      evidence: '42% of the last 1,840 tasks were low-complexity extractions billed at the frontier rate.',
      estimatedRiskReduction: 0, estimatedCostReduction: 27, estimatedPerformanceImpact: -0.4, confidence: 0.91,
      changes: { model: 'balanced' }, dimDelta: { costEfficiency: 31, reliability: -2 } },
    { id: 'rec-03', agentId: 'ag-support', type: 'guardrail', status: 'open', priority: 4,
      title: 'Raise the autonomous refund limit to $15,000',
      description: 'The agent has escalated 94 refunds in 90 days; 91 were approved unchanged. The $10,000 threshold is producing approval work with no risk reduction.',
      evidence: '94 escalations, 91 approved unchanged, median human review time 41 minutes.',
      estimatedRiskReduction: -3, estimatedCostReduction: 6, estimatedPerformanceImpact: 2.1, confidence: 0.86,
      changes: { autonomousLimit: 15000 }, dimDelta: { escalation: -2, costEfficiency: 4 } },
    { id: 'rec-04', agentId: 'ag-finance', type: 'reliability', status: 'open', priority: 3,
      title: 'Cap retries at 2 and escalate unmatched lines immediately',
      description: 'The agent retries failed reconciliations up to 6 times before escalating, which converts a data problem into a cost and latency problem.',
      evidence: 'Retry rate 17.9% against a 6% fleet median; 27 connector errors per day.',
      estimatedRiskReduction: 11, estimatedCostReduction: 19, estimatedPerformanceImpact: -1.1, confidence: 0.88,
      changes: { maxRetries: 2 }, dimDelta: { reliability: 12, costEfficiency: 15, dataIntegrity: 9, escalation: 6 } },
    { id: 'rec-05', agentId: 'ag-finance', type: 'guardrail', status: 'open', priority: 5,
      title: 'Block journal entries below 80% line-match confidence',
      description: 'Prevent the agent from proposing adjusting entries when it cannot explain the underlying lines.',
      evidence: 'A $88,500 entry is pending at 62% confidence with 38 unexplained lines.',
      estimatedRiskReduction: 14, estimatedCostReduction: 0, estimatedPerformanceImpact: -2.4, confidence: 0.9,
      changes: { minConfidence: 0.8 }, dimDelta: { policy: 8, dataIntegrity: 11 } },
    { id: 'rec-06', agentId: 'ag-marketing', type: 'guardrail', status: 'open', priority: 6,
      title: 'Auto-escalate to the owner after any blocked action',
      description: 'The agent absorbed two consecutive blocks without notifying its owner. Force an escalation on every block.',
      evidence: 'Two blocked reallocations in 24 hours, zero escalations raised.',
      estimatedRiskReduction: 9, estimatedCostReduction: 0, estimatedPerformanceImpact: 0, confidence: 0.93,
      changes: { escalateOnBlock: true }, dimDelta: { escalation: 14, policy: 6 } },
    { id: 'rec-07', agentId: 'ag-dataqual', type: 'reliability', status: 'open', priority: 7,
      title: 'Add an upstream contract test on the billing source',
      description: 'Catch schema drift at the source rather than quarantining 4,000+ records downstream.',
      evidence: '4,180 records quarantined after an unannounced column type change.',
      estimatedRiskReduction: 12, estimatedCostReduction: 8, estimatedPerformanceImpact: 1.4, confidence: 0.85,
      changes: { contractTest: true }, dimDelta: { dataIntegrity: 24, reliability: 7 } },
    { id: 'rec-08', agentId: 'ag-contract', type: 'performance', status: 'open', priority: 8,
      title: 'Pre-index the clause playbook',
      description: 'Comparison latency scales linearly with playbook size. A pre-built clause index removes the per-contract re-parse.',
      evidence: 'p95 latency rose from 3.8s to 6.4s after the playbook grew by 40 clauses.',
      estimatedRiskReduction: 0, estimatedCostReduction: 12, estimatedPerformanceImpact: 4.2, confidence: 0.82,
      changes: { preIndex: true }, dimDelta: { reliability: 5, costEfficiency: 9 } },
    { id: 'rec-09', agentId: 'ag-exec', type: 'cost', status: 'open', priority: 9,
      title: 'Cache the reporting warehouse extract between runs',
      description: 'The agent re-extracts the same warehouse slice for each of the four weekly report sections.',
      evidence: '4 identical extracts per run, 1,840 tasks per month.',
      estimatedRiskReduction: 0, estimatedCostReduction: 16, estimatedPerformanceImpact: 3.1, confidence: 0.89,
      changes: { cacheExtract: true }, dimDelta: { costEfficiency: 11 } }
  ];

  /* ---------------------------------------------------------------- trust history */
  function buildHistory() {
    const hist = {};
    D.AGENTS.forEach((a) => {
      const end = D.trustOf(a.dims);
      const days = [];
      let v = end - (a.trustDelta7d || 0) - Math.round(between(-3, 3));
      for (let i = 29; i >= 0; i--) {
        if (i <= 6) {
          const remaining = i;
          v = Math.round(v + (end - v) / (remaining + 1) + between(-1.2, 1.2));
        } else {
          v = Math.round(D.clamp(v + between(-1.6, 1.6), 45, 99));
        }
        days.push({ day: i, value: Math.round(D.clamp(v, 40, 99)), events: [] });
      }
      days[days.length - 1].value = end;
      hist[a.id] = days;
    });
    /* Hand-authored causal annotations on the agents the story runs through. */
    const proc = hist['ag-procurement'];
    proc[23].value = 91; proc[24].value = 89; proc[25].value = 89;
    proc[26].value = 84; proc[26].events = [{ delta: -5, title: 'First blocked database read',
      cause: 'Agent attempted to read finance.supplier_credit while clearing a supplier gate. Permission Safety fell 11 points.',
      resolution: 'Logged, owner notified. No permission change made.' }];
    proc[27].value = 81;
    proc[28].value = 78; proc[28].events = [{ delta: -3, title: 'Three further blocked attempts',
      cause: 'The same access pattern repeated three times in 48 hours instead of escalating to the owner.',
      resolution: 'Incident INC-2041 opened. Investigation in progress.' }];
    proc[29].value = 76; proc[29].events = [{ delta: -2, title: 'Escalation compliance downgraded',
      cause: 'Agent routed around the guardrail rather than raising a human escalation, dropping Human Escalation to 69.',
      resolution: 'Guardrail change recommended — see recommendation 01.' }];
    const fin = hist['ag-finance'];
    fin[26].events = [{ delta: -4, title: 'Ledger connector instability',
      cause: '27 connector errors per day pushed the retry rate to 17.9% and reliability to 71.',
      resolution: 'Retry cap recommended — see recommendation 04.' }];
    const res = hist['ag-research'];
    res[27].events = [{ delta: -4, title: 'Cost efficiency downgraded',
      cause: 'A single 1,840-document frontier-tier pass consumed 24% of the remaining monthly budget.',
      resolution: 'Model routing change recommended — see recommendation 02.' }];
    const sup = hist['ag-support'];
    sup[24].events = [{ delta: -2, title: 'Retry rate increased',
      cause: 'Three warranty connector timeouts during the regional maintenance slot.',
      resolution: 'Retry policy widened. Trust recovered +2 within a day.' }];
    return hist;
  }

  /* ---------------------------------------------------------------- fleet series */
  function fleetSeries() {
    const days = [];
    let trust = 84, spend = 2410, decisions = 9800;
    for (let i = 29; i >= 0; i--) {
      trust = D.clamp(trust + between(-0.9, 1.1, 1), 82, 90);
      spend = Math.round(D.clamp(spend + between(-180, 240), 1900, 3600));
      decisions = Math.round(D.clamp(decisions + between(-900, 1100), 7200, 14800));
      days.push({ day: i, trust: Number(trust.toFixed(1)), spend, decisions });
    }
    days[days.length - 1].trust = 88;
    return days;
  }

  /* ---------------------------------------------------------------- notifications */
  const NOTIFICATIONS = [
    { id: 'ntf-1', level: 'critical', title: 'Procurement Agent paused at the approval boundary',
      body: 'A $104,000 purchase order to an unverified supplier requires a named approver.',
      time: minutesAgo(11), route: '#/decisions/attention', decisionId: 'DEC-84120', read: false },
    { id: 'ntf-2', level: 'critical', title: 'Finance Agent attempted a restricted action',
      body: 'An $88,500 adjusting journal entry exceeds the agent’s $75,000 autonomous limit at 62% confidence.',
      time: minutesAgo(64), route: '#/agents/ag-finance', read: false },
    { id: 'ntf-3', level: 'warning', title: 'Research Agent projected spend increased 42%',
      body: 'Projected at $13,460 against a $7,500 budget. Frontier-tier routing is the driver.',
      time: minutesAgo(402), route: '#/economics/optimization', read: false },
    { id: 'ntf-4', level: 'warning', title: 'Customer Support refund awaiting review',
      body: '$12,400 pro-rated refund on ticket #82941 exceeds the $10,000 autonomous limit.',
      time: minutesAgo(38), route: '#/decisions/approvals', decisionId: 'DEC-82941', read: false },
    { id: 'ntf-5', level: 'warning', title: 'Data Quality Agent integrity fell to 61',
      body: 'Schema drift on the billing source quarantined 4,180 customer records.',
      time: minutesAgo(640), route: '#/agents/ag-dataqual', read: true },
    { id: 'ntf-6', level: 'info', title: 'Weekly control attestation filed',
      body: 'Compliance Monitoring Agent evaluated 12,400 actions with zero unresolved exceptions.',
      time: minutesAgo(720), route: '#/governance/policies', read: true },
    { id: 'ntf-7', level: 'resolved', title: 'Support connector timeout resolved',
      body: 'Warranty connector retry policy widened. Trust recovered +2.',
      time: minutesAgo(1580), route: '#/operations/incidents', read: true },
    { id: 'ntf-8', level: 'resolved', title: 'Duplicate purchase order cancelled',
      body: 'Idempotency key added to the order-placement tool. $23,400 duplicate commitment reversed.',
      time: minutesAgo(4320), route: '#/operations/incidents', read: true }
  ];

  /* ---------------------------------------------------------------- audit seed */
  const AUDIT_SEED = [
    { id: 'AUD-9412', time: minutesAgo(11), actor: 'Decision Guard', actorType: 'system', agentId: 'ag-procurement',
      event: 'Execution paused', target: 'DEC-84120',
      detail: 'Purchase order PO-44821 ($104,000) held before execution. Two integrity signals unresolved.', category: 'guardrail' },
    { id: 'AUD-9411', time: minutesAgo(11), actor: 'Permission layer', actorType: 'system', agentId: 'ag-procurement',
      event: 'Access denied', target: 'finance.supplier_credit',
      detail: 'Read blocked. 4th blocked attempt in 7 days.', category: 'permission' },
    { id: 'AUD-9408', time: minutesAgo(38), actor: 'Decision Guard', actorType: 'system', agentId: 'ag-support',
      event: 'Approval requested', target: 'DEC-82941',
      detail: '$12,400 refund exceeds the $10,000 autonomous limit. Routed to Customer Experience.', category: 'approval' },
    { id: 'AUD-9402', time: minutesAgo(87), actor: 'Deepa Nair', actorType: 'human', agentId: 'ag-fraud',
      event: 'Decision approved', target: 'DEC-84098',
      detail: 'Account freeze on ACC-338201 approved 14 minutes after escalation.', category: 'approval' },
    { id: 'AUD-9398', time: minutesAgo(94), actor: 'Compliance Monitoring Agent', actorType: 'agent', agentId: 'ag-procurement',
      event: 'Incident opened', target: 'INC-2041',
      detail: 'Repeated restricted-database access pattern detected.', category: 'incident' },
    { id: 'AUD-9391', time: minutesAgo(168), actor: 'Policy engine', actorType: 'system', agentId: 'ag-marketing',
      event: 'Action blocked', target: 'DEC-84044',
      detail: '$18,400 reallocation exceeds the $15,000 limit. No spend moved.', category: 'policy' },
    { id: 'AUD-9384', time: minutesAgo(214), actor: 'Policy engine', actorType: 'system', agentId: 'ag-contract',
      event: 'Action blocked', target: 'DEC-84012',
      detail: 'Outbound redline held for counsel review under External Communication Policy v2.8.', category: 'policy' },
    { id: 'AUD-9377', time: minutesAgo(310), actor: 'Compliance Monitoring Agent', actorType: 'agent', agentId: 'ag-finance',
      event: 'Incident opened', target: 'INC-2038',
      detail: 'Reconciliation reliability below threshold for 6 consecutive days.', category: 'incident' },
    { id: 'AUD-9364', time: minutesAgo(720), actor: 'Sarah Chen', actorType: 'human', agentId: 'ag-support',
      event: 'Policy updated', target: 'pol-fin',
      detail: 'Financial Transaction Policy raised to v3.1 — supplier age gate added.', category: 'policy' },
    { id: 'AUD-9350', time: minutesAgo(1580), actor: 'Nikhil Bose', actorType: 'human', agentId: 'ag-support',
      event: 'Incident resolved', target: 'INC-2019',
      detail: 'Warranty connector retry policy widened to 3-attempt exponential backoff.', category: 'incident' },
    { id: 'AUD-9322', time: minutesAgo(4320), actor: 'Ravi Menon', actorType: 'human', agentId: 'ag-procurement',
      event: 'Incident resolved', target: 'INC-2014',
      detail: 'Idempotency key added to the order-placement tool.', category: 'incident' },
    { id: 'AUD-9301', time: minutesAgo(10080), actor: 'Alex Mehta', actorType: 'human', agentId: null,
      event: 'Agent registered', target: 'ag-compliance',
      detail: 'Compliance Monitoring Agent promoted to production with read-only audit scope.', category: 'lifecycle' }
  ];

  global.ADG_RECORDS = {
    POLICIES, DECISIONS, INCIDENTS, RECOMMENDATIONS, NOTIFICATIONS, AUDIT_SEED,
    TOTAL_EVALS, TOTAL_VIOLATIONS, buildHistory, fleetSeries, TODAY, TZ, minutesAgo
  };
})(window);
