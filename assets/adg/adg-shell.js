/* Agent Decision Guard — application shell.
 * Sidebar navigation, topbar, breadcrumbs and the demo control panel.
 * Built by Puneet Arora.
 */
(function (global) {
  'use strict';
  const ADG = global.ADG, D = global.ADG_DATA, S = ADG.sel, C = ADG.C, fmt = ADG.fmt, esc = ADG.esc;

  const I = {
    grid:   '<path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z"/>',
    agents: '<circle cx="8" cy="5.2" r="2.6"/><path d="M2.6 14c0-2.7 2.4-4.4 5.4-4.4s5.4 1.7 5.4 4.4"/>',
    alert:  '<path d="M8 2 14.5 13.5h-13z"/><path d="M8 6.4v3.2M8 11.4v.1"/>',
    fire:   '<path d="M8 1.8s3.4 2.8 3.4 6.1a3.4 3.4 0 0 1-6.8 0C4.6 6.6 6 5.4 6 5.4s.3 1.6 1.2 1.6c.8 0 .8-2.4.8-5.2Z"/>',
    clock:  '<circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.4 1.6"/>',
    shield: '<path d="M8 1.8 13.2 4v4.1c0 3.1-2.1 5.4-5.2 6.1-3.1-.7-5.2-3-5.2-6.1V4Z"/>',
    matrix: '<path d="M2.2 2.2v11.6h11.6"/><circle cx="5.5" cy="10.5" r="1.5"/><circle cx="10.5" cy="5.5" r="1.5"/>',
    trend:  '<path d="M2 11.5 6 7l3 2.6L14 4"/><path d="M10.6 4H14v3.4"/>',
    scale:  '<path d="M8 2v12M3 5h10M4.6 5 2.6 9.4h4zM11.4 5l-2 4.4h4z"/>',
    pulse:  '<path d="M1.6 8h3L6.2 4.4 9.4 12l1.6-4h3.4"/>',
    inbox:  '<path d="M2 8.6V13h12V8.6M2 8.6 4 3h8l2 5.6M2 8.6h3.4l1 2h3.2l1-2H14"/>',
    check:  '<path d="M3 8.4 6.4 12 13 4.4"/>',
    flask:  '<path d="M6.4 2v4.2L2.8 12.4A1 1 0 0 0 3.7 14h8.6a1 1 0 0 0 .9-1.6L9.6 6.2V2M5.4 2h5.2"/>',
    list:   '<path d="M5 4h9M5 8h9M5 12h9M2.2 4h.1M2.2 8h.1M2.2 12h.1"/>',
    heart:  '<path d="M8 13.4S2.4 10.1 2.4 6.4A2.9 2.9 0 0 1 8 5a2.9 2.9 0 0 1 5.6 1.4c0 3.7-5.6 7-5.6 7Z"/>',
    warn:   '<circle cx="8" cy="8" r="6.2"/><path d="M8 5v3.6M8 10.8v.1"/>',
    key:    '<circle cx="5.4" cy="5.4" r="3"/><path d="M7.6 7.6 14 14M11.4 11.4l1.4-1.4M9.6 9.6 11 8.2"/>',
    book:   '<path d="M3 2.6h6a2 2 0 0 1 2 2v9a1.6 1.6 0 0 0-1.6-1.6H3Z"/><path d="M13 2.6h-1.4a2 2 0 0 0-.6 1.4v9.6"/>',
    trail:  '<path d="M4 2.4h8v11.2H4z"/><path d="M6.2 5.4h3.6M6.2 8h3.6M6.2 10.6h2"/>',
    coin:   '<circle cx="8" cy="8" r="6.2"/><path d="M8 4.6v6.8M9.9 6.1a2 2 0 0 0-3.6 1.1c0 1.9 3.4 1 3.4 2.7a2 2 0 0 1-3.6 1"/>',
    layers: '<path d="M8 2 2 5.2l6 3.2 6-3.2Z"/><path d="m2 8.8 6 3.2 6-3.2"/>',
    spark:  '<path d="M8 1.6 9.6 6 14 7.6 9.6 9.2 8 13.6 6.4 9.2 2 7.6 6.4 6Z"/>',
    report: '<path d="M4 2.4h5.4L12 5v8.6H4z"/><path d="M6.2 8.6v2.6M8 7v4.2M9.8 9.4v1.8"/>',
    help:   '<circle cx="8" cy="8" r="6.2"/><path d="M6.3 6.2a1.8 1.8 0 1 1 2.4 1.7c-.5.2-.7.6-.7 1.1v.3M8 11.6v.1"/>',
    bell:   '<path d="M4.2 6.6a3.8 3.8 0 0 1 7.6 0c0 3.2 1.2 4.2 1.2 4.2H3s1.2-1 1.2-4.2Z"/><path d="M6.6 12.8a1.6 1.6 0 0 0 2.8 0"/>',
    cog:    '<circle cx="8" cy="8" r="2.2"/><path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.2 1.2M4.8 11.2l-1.2 1.2M12.4 12.4l-1.2-1.2M4.8 4.8 3.6 3.6"/>'
  };
  const ico = (k) => '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[k] || I.grid) + '</svg>';

  const NAV = [
    { label: 'Command centre', items: [{ label: 'Command Center', route: '#/command-center', icon: 'grid' }] },
    { label: 'Agents', items: [
      { label: 'All Agents', route: '#/agents', icon: 'agents', count: () => ADG.state.agents.length },
      { label: 'At Risk', route: '#/agents?view=at-risk', icon: 'alert', count: () => ADG.state.agents.filter((a) => S.riskBand(a).key === 'high').length, tone: 'amber' },
      { label: 'Critical', route: '#/agents?view=critical', icon: 'fire', count: () => ADG.state.agents.filter((a) => a.status === 'critical' || S.riskBand(a).key === 'critical').length, tone: 'red' },
      { label: 'Recently Changed', route: '#/agents?view=changed', icon: 'clock' }
    ] },
    { label: 'Trust', items: [
      { label: 'Trust Overview', route: '#/trust/overview', icon: 'shield' },
      { label: 'Risk Matrix', route: '#/trust/matrix', icon: 'matrix' },
      { label: 'Trust History', route: '#/trust/history', icon: 'trend' },
      { label: 'Agent Comparison', route: '#/trust/compare', icon: 'scale' }
    ] },
    { label: 'Decisions', items: [
      { label: 'Live Decisions', route: '#/decisions/live', icon: 'pulse' },
      { label: 'Attention Queue', route: '#/decisions/attention', icon: 'inbox', count: () => S.attention().length, tone: 'amber' },
      { label: 'Approvals', route: '#/decisions/approvals', icon: 'check', count: () => S.pending().length, tone: 'amber' },
      { label: 'Decision Simulator', route: '#/decisions/simulator', icon: 'flask' }
    ] },
    { label: 'Operations', items: [
      { label: 'Activity', route: '#/operations/activity', icon: 'list' },
      { label: 'Health', route: '#/operations/health', icon: 'heart' },
      { label: 'Incidents', route: '#/operations/incidents', icon: 'warn', count: () => S.openIncidents().length, tone: 'red' }
    ] },
    { label: 'Governance', items: [
      { label: 'Permissions', route: '#/governance/permissions', icon: 'key' },
      { label: 'Policies', route: '#/governance/policies', icon: 'book' },
      { label: 'Audit Trail', route: '#/governance/audit', icon: 'trail' }
    ] },
    { label: 'Economics', items: [
      { label: 'AI Spend', route: '#/economics/spend', icon: 'coin' },
      { label: 'Cost by Agent', route: '#/economics/by-agent', icon: 'layers' },
      { label: 'Optimization', route: '#/economics/optimization', icon: 'trend' }
    ] },
    { label: 'Insights', items: [
      { label: 'AI Recommendations', route: '#/insights/recommendations', icon: 'spark', count: () => ADG.state.recommendations.filter((r) => r.status === 'open').length, tone: 'purple' },
      { label: 'Executive Reports', route: '#/insights/reports', icon: 'report' }
    ] }
  ];
  ADG.registerNav(NAV);

  ADG.renderSidebar = function () {
    const cur = location.hash || '#/command-center';
    const host = document.getElementById('adg-nav');
    host.innerHTML = NAV.map((g) =>
      '<div class="sb-group"><div class="sb-label">' + esc(g.label) + '</div>' +
      g.items.map((i) => {
        const active = cur === i.route || (i.route === '#/agents' && /^#\/agents\/[^?]/.test(cur));
        const n = i.count ? i.count() : null;
        return '<button class="sb-item ' + (active ? 'is-active' : '') + '" data-act="goto" data-route="' + esc(i.route) + '"' +
          (active ? ' aria-current="page"' : '') + '>' + ico(i.icon) + '<span>' + esc(i.label) + '</span>' +
          (n ? '<span class="count ' + (i.tone === 'red' ? 'is-red' : i.tone === 'amber' ? 'is-amber' : '') + '">' + n + '</span>' : '') +
          '</button>';
      }).join('') + '</div>').join('');
  };

  ADG.renderTopbarMeta = function () {
    const unread = S.unread();
    const el = document.getElementById('adg-bell-badge');
    if (el) el.innerHTML = unread ? '<span class="dot-badge">' + unread + '</span>' : '';
    document.querySelectorAll('[data-mode-btn]').forEach((b) => {
      const on = b.dataset.modeBtn === ADG.state.mode;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  };

  const TITLES = {
    'command-center': ['Command Center'], 'agents': ['Agents', 'All Agents'],
    'trust/overview': ['Trust', 'Trust Overview'], 'trust/matrix': ['Trust', 'Risk Matrix'],
    'trust/history': ['Trust', 'Trust History'], 'trust/compare': ['Trust', 'Agent Comparison'],
    'decisions/live': ['Decisions', 'Live Decisions'], 'decisions/attention': ['Decisions', 'Attention Queue'],
    'decisions/approvals': ['Decisions', 'Approvals'], 'decisions/simulator': ['Decisions', 'Decision Simulator'],
    'operations/activity': ['Operations', 'Activity'], 'operations/health': ['Operations', 'Health'],
    'operations/incidents': ['Operations', 'Incidents'], 'governance/permissions': ['Governance', 'Permissions'],
    'governance/policies': ['Governance', 'Policies'], 'governance/audit': ['Governance', 'Audit Trail'],
    'economics/spend': ['Economics', 'AI Spend'], 'economics/by-agent': ['Economics', 'Cost by Agent'],
    'economics/optimization': ['Economics', 'Optimization'], 'insights/recommendations': ['Insights', 'AI Recommendations'],
    'insights/reports': ['Insights', 'Executive Reports']
  };
  const VIEW_TITLE = { 'at-risk': 'At Risk', 'critical': 'Critical', 'changed': 'Recently Changed' };

  ADG.crumbs = function (r) {
    let parts;
    if (r.parts[0] === 'agents' && r.parts[1]) {
      const a = S.agent(r.parts[1]);
      parts = ['Agents', a ? a.name : 'Unknown agent'];
    } else if (r.parts[0] === 'agents' && r.query.view) {
      parts = ['Agents', VIEW_TITLE[r.query.view] || 'All Agents'];
    } else {
      parts = TITLES[r.parts.join('/')] || ['Command Center'];
    }
    document.title = parts[parts.length - 1] + ' · Agent Decision Guard';
    return parts.map((p, i) => (i === parts.length - 1 ? '<b>' + esc(p) + '</b>' : '<span>' + esc(p) + '</span>'))
      .join('<span class="sep" aria-hidden="true">/</span>');
  };

  /* ------------------------------------------------------------- demo controls */
  ADG.actions['demo-panel'] = function () {
    ADG.openDrawer({
      title: 'Demo controls',
      sub: 'Trigger a scenario, then watch it propagate through trust, risk, incidents and the audit trail.',
      body:
        '<div class="grid" style="gap:10px">' +
        demoCard('Run the guarded decision', 'The signature journey: Procurement Agent is paused at a $104,000 purchase to an unverified supplier. Investigate, simulate a guardrail, apply it, and watch trust move 76 → 91.', 'demo-scenario', 'Start scenario', 'blue') +
        demoCard('Simulate an incident', 'Opens a fresh critical incident on a healthy agent and drops its reliability. Watch the Command Center and the sidebar counters react.', 'demo-incident', 'Simulate incident') +
        demoCard('Simulate a trust drop', 'Applies a permission violation to Sales Qualification Agent, cutting Permission Safety by 22 points.', 'demo-trust', 'Simulate trust drop') +
        demoCard('Simulate a cost spike', 'Pushes IT Helpdesk Agent onto the frontier tier and triples its projected spend.', 'demo-cost', 'Simulate cost spike') +
        demoCard('Simulate an approval request', 'Queues a new consequential decision that pauses at the human boundary.', 'demo-approval', 'Simulate approval') +
        '</div>' +
        '<div class="rule"></div>' +
        '<div class="card card-pad" style="background:var(--surface-2)">' +
          '<b style="font-size:12.5px">Reset the demo</b>' +
          '<p class="tiny muted" style="margin-top:4px">Restores the fleet, incidents, approvals, recommendations and audit trail to their seed state. Applied guardrails are rolled back.</p>' +
          '<div class="btn-row" style="margin-top:10px"><button class="btn sm" data-act="reset-demo">Reset demo</button></div>' +
        '</div>',
      foot: '<div style="flex:1"></div><button class="btn" data-act="close-overlay">Close</button>'
    });
  };
  function demoCard(title, body, act, label, tone) {
    return '<div class="card card-pad"><b style="font-size:12.5px">' + esc(title) + '</b>' +
      '<p class="tiny muted" style="margin-top:4px;line-height:1.5">' + esc(body) + '</p>' +
      '<div class="btn-row" style="margin-top:10px"><button class="btn sm ' + (tone || '') + '" data-act="' + act + '">' + esc(label) + '</button></div></div>';
  }

  ADG.actions['demo-scenario'] = () => { ADG.closeOverlay(); ADG.go('#/command-center'); setTimeout(() => ADG.actions['guard']({ id: 'DEC-84120' }), 260); };

  ADG.actions['demo-incident'] = function () {
    ADG.closeOverlay();
    const a = S.agent('ag-supply');
    ADG.commit({
      mutate(s) {
        const ag = s.agents.find((x) => x.id === 'ag-supply');
        ag.dims.reliability = Math.max(52, ag.dims.reliability - 24);
        ag.dims.dataIntegrity = Math.max(50, ag.dims.dataIntegrity - 14);
        ag.health.failureRate = 9.8; ag.health.retryRate = 21.4; ag.health.completion = 79.2;
        ag.successRate = 79.2; ag.status = 'critical'; ag.trustDelta7d = -18;
        s.incidents.unshift({
          id: 'INC-' + (2050 + s.incidents.length), agentId: 'ag-supply', severity: 'critical', status: 'open',
          timestamp: new Date().toISOString(), title: 'Carrier API returning malformed manifests',
          description: 'The primary carrier integration began returning malformed shipment manifests. 312 transfer orders failed validation in the last 40 minutes and the agent retried each of them four times.',
          impact: 'Reliability fell 24 points and 312 shipments are unrouted. Service levels on the western corridor are at risk within 6 hours.',
          recommendation: null
        });
      },
      audit: { agentId: 'ag-supply', event: 'Incident opened', target: 'Carrier API failure',
        detail: 'Simulated incident injected from demo controls.', category: 'incident', actor: 'Demo controls', actorType: 'system' },
      notify: { level: 'critical', title: 'Supply Chain Agent is failing', body: '312 transfer orders failed validation. Reliability fell 24 points.', route: '#/operations/incidents' },
      toast: { type: 'error', title: 'Critical incident opened', body: 'Supply Chain Agent reliability fell ' + 24 + ' points. Trust and risk recalculated across the fleet.' }
    });
  };

  ADG.actions['demo-trust'] = function () {
    ADG.closeOverlay();
    ADG.commit({
      mutate(s) {
        const ag = s.agents.find((x) => x.id === 'ag-sales');
        ag.dims.permission = Math.max(40, ag.dims.permission - 22);
        ag.dims.policy = Math.max(45, ag.dims.policy - 12);
        ag.dims.escalation = Math.max(45, ag.dims.escalation - 9);
        ag.openViolations = 3; ag.status = 'warning'; ag.trustDelta7d = -9;
        ag.permissions.data['PII'] = 'allow';
        const h = s.history['ag-sales'];
        h[h.length - 1].value = D.trustOf(ag.dims);
        h[h.length - 1].events = [{ delta: -9, title: 'Three unauthorised PII reads',
          cause: 'The agent read full PII records while enriching accounts, outside its granted scope.',
          resolution: 'Pending — no permission change applied yet.' }];
      },
      audit: { agentId: 'ag-sales', event: 'Permission violation detected', target: 'customer.pii',
        detail: '3 unauthorised PII reads during account enrichment. Permission Safety fell 22 points.', category: 'permission', actor: 'Permission layer', actorType: 'system' },
      notify: { level: 'critical', title: 'Sales Agent trust dropped 9 points', body: 'Three unauthorised PII reads detected during account enrichment.', route: '#/agents/ag-sales' },
      toast: { type: 'error', title: 'Trust drop detected', body: 'Sales Qualification Agent fell to ' + D.trustOf(S.agent('ag-sales').dims) + '. Permission Safety is now the weakest dimension.' }
    });
  };

  ADG.actions['demo-cost'] = function () {
    ADG.closeOverlay();
    ADG.commit({
      mutate(s) {
        const ag = s.agents.find((x) => x.id === 'ag-itdesk');
        ag.model = 'frontier';
        ag.currentCost = Math.round(ag.currentCost * 2.4);
        ag.monthlyProjectedCost = Math.round(ag.monthlyProjectedCost * 3.1);
        ag.dims.costEfficiency = 38; ag.status = 'warning'; ag.trustDelta7d = -7;
      },
      audit: { agentId: 'ag-itdesk', event: 'Model tier changed', target: 'Orion Reasoning v4',
        detail: 'Routing moved from Balanced to Frontier. Projected spend tripled.', category: 'change', actor: 'Demo controls', actorType: 'system' },
      notify: { level: 'warning', title: 'IT Helpdesk Agent spend tripled', body: 'Routing moved to the frontier tier. Cost efficiency fell to 38.', route: '#/economics/optimization' },
      toast: { type: 'error', title: 'Cost spike detected', body: 'IT Helpdesk Agent is now projected at ' + fmt.usd(S.agent('ag-itdesk').monthlyProjectedCost) + ' a month.' }
    });
  };

  ADG.actions['demo-approval'] = function () {
    ADG.closeOverlay();
    const id = 'DEC-' + (84200 + Math.floor(Math.random() * 90));
    ADG.commit({
      mutate(s) {
        s.decisions.unshift({
          id, agentId: 'ag-fraud', timestamp: new Date().toISOString(),
          action: 'Freeze 4 linked accounts holding $312,000 pending investigation',
          objective: 'Contain a coordinated account-takeover ring detected across four channels',
          riskLevel: 'high', amount: 312000, currency: 'USD', policy: 'pol-approval',
          policyLabel: 'Human Approval Policy v4.2', status: 'awaiting-approval', approvalRequired: true,
          approvalStatus: 'pending', confidence: 0.89, toolsUsed: ['Transaction stream', 'CRM', 'Database'],
          outcome: null, guard: true,
          flags: [
            { label: 'Value far exceeds the freeze limit', detail: '$312,000 across 4 accounts against a $25,000 autonomous freeze limit.', severity: 'critical' },
            { label: 'Four customers affected simultaneously', detail: 'A false positive would lock four enterprise customers out of their funds at once.', severity: 'high' },
            { label: 'Pattern confidence below the auto-freeze bar', detail: 'Model confidence 0.89 against a 0.95 bar for multi-account action.', severity: 'moderate' }
          ],
          evidence: [{ label: 'Accounts', value: '4 linked' }, { label: 'Exposure', value: '$312,000' },
                     { label: 'Detection window', value: '11 minutes' }, { label: 'Model confidence', value: '0.89' }],
          recommendation: 'Approve the freeze. The containment cost of a false positive is far below the loss exposure of a true positive.'
        });
      },
      audit: { agentId: 'ag-fraud', event: 'Approval requested', target: id,
        detail: 'Multi-account freeze of $312,000 exceeds the $25,000 autonomous limit.', category: 'approval', actor: 'Decision Guard', actorType: 'system' },
      notify: { level: 'critical', title: 'Fraud Agent needs a decision', body: 'A $312,000 four-account freeze is paused at the human boundary.', route: '#/decisions/approvals', decisionId: id },
      toast: { type: 'info', title: 'Approval request queued', body: 'Fraud Detection Agent paused before freezing 4 accounts.' }
    });
    setTimeout(() => ADG.actions['guard']({ id }), 400);
  };

  ADG.actions['help'] = () => ADG.openModal({
    title: 'About Agent Decision Guard', wide: true,
    sub: 'A working product prototype — every score, chart and state on every screen is derived from one shared model.',
    body:
      '<p style="font-size:13.5px;line-height:1.65;color:var(--ink-2)">AI agents can act autonomously. Your organisation shouldn’t have to trust them blindly. Agent Decision Guard gives every AI decision a context, a risk level, a policy boundary, and a human escape hatch.</p>' +
      '<div class="rule"></div>' +
      '<h3 style="font-size:13px;margin-bottom:8px">The product loop</h3>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' +
        ['See', 'Understand', 'Assess', 'Simulate', 'Decide', 'Guard', 'Audit'].map((s, i) =>
          C.badge(s, i === 5 ? 'red' : i === 3 ? 'purple' : 'blue', { sq: true })).join('<span class="muted" style="align-self:center">→</span>') +
      '</div>' +
      '<h3 style="font-size:13px;margin-bottom:8px">How the numbers work</h3>' +
      '<div class="kv-list">' +
        '<div class="kv-row"><span class="k">Trust score</span><span class="v">A weighted function of six dimensions — reliability 22%, policy 20%, permission 20%, data integrity 15%, cost efficiency 12%, escalation 11%. Change a dimension and every trust figure in the product moves with it.</span></div>' +
        '<div class="kv-row"><span class="k">Risk index</span><span class="v">Derived from trust, the exposure of granted permissions, autonomous value limits, open incidents and recent violations. It is independent of trust — a trusted agent can still be risky.</span></div>' +
        '<div class="kv-row"><span class="k">Health</span><span class="v">Availability, task completion, failure rate, retry rate, latency and tool errors. Deliberately independent of trust: an agent can be perfectly healthy and completely untrustworthy.</span></div>' +
        '<div class="kv-row"><span class="k">Permissions</span><span class="v">Every capability carries an impact weight. Granting it raises the exposure index, which raises risk. Changing a permission recomputes trust, risk and the recommendation set.</span></div>' +
      '</div>' +
      '<div class="rule"></div>' +
      '<p class="tiny muted">Timestamps render in IST (Bengaluru). Platform spend is shown in USD. This is a portfolio prototype with simulated data — no live systems are connected, and it does not expose model chain-of-thought, only observable execution events and their evidence.</p>',
    foot: '<button class="btn" data-act="shortcuts">Keyboard shortcuts</button><div style="flex:1"></div>' +
          '<button class="btn primary" data-act="close-overlay">Close</button>'
  });
})(window);
