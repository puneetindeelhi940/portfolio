/* Agent Decision Guard — views: Decisions, Simulator, Operations,
 * Governance, Economics and Insights.
 * Built by Puneet Arora.
 */
(function (global) {
  'use strict';
  const ADG = global.ADG, D = global.ADG_DATA, S = ADG.sel, C = ADG.C, fmt = ADG.fmt, esc = ADG.esc;
  const V = ADG.routes, pageHead = ADG.pageHead, recCard = ADG.recCard;

  /* ---------------------------------------------------------- live decisions */
  ADG.ui.dec = { q: '', status: 'all', page: 1 };
  ADG.actions['dec-q'] = (d) => { ADG.ui.dec.q = d.value; ADG.ui.dec.page = 1; ADG.render(); };
  ADG.actions['dec-status'] = (d) => { ADG.ui.dec.status = d.id; ADG.ui.dec.page = 1; ADG.render(); };
  ADG.actions['dec-page'] = (d) => { ADG.ui.dec.page = Number(d.p); ADG.render(); };

  function decisionRows() {
    const u = ADG.ui.dec;
    return ADG.state.decisions.filter((d) => {
      if (u.status !== 'all' && d.status !== u.status) return false;
      if (u.q) {
        const q = u.q.toLowerCase();
        const a = S.agent(d.agentId) || {};
        if ((d.action + ' ' + d.id + ' ' + (a.name || '') + ' ' + d.policyLabel).toLowerCase().indexOf(q) === -1) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  V['decisions/live'] = function () {
    const u = ADG.ui.dec;
    const all = decisionRows();
    const per = 16, pages = Math.max(1, Math.ceil(all.length / per));
    if (u.page > pages) u.page = pages;
    const rows = all.slice((u.page - 1) * per, u.page * per);
    const STAT = ['all', 'awaiting-approval', 'blocked', 'investigating', 'approved', 'completed', 'rejected'];
    const counts = {};
    ADG.state.decisions.forEach((d) => { counts[d.status] = (counts[d.status] || 0) + 1; });
    const live = ADG.state.decisions.filter((d) => d.timeline && d.approvalStatus === 'pending')[0]
      || ADG.state.decisions.filter((d) => d.timeline)[0];

    return pageHead('Live decisions', 'Every action the fleet has taken, what it was evaluated against, and where a human stepped in.',
      '<button class="btn primary" data-act="goto" data-route="#/decisions/approvals">' + S.pending().length + ' awaiting approval</button>') +

    (live ? '<div class="card" style="margin-bottom:16px;border-color:' + (live.approvalStatus === 'pending' ? 'var(--amber-br)' : 'var(--border)') + '">' +
      '<div class="card-head"' + (live.approvalStatus === 'pending' ? ' style="background:var(--amber-bg)"' : '') + '>' +
      '<h3>Executing now · ' + esc((S.agent(live.agentId) || {}).name) + '</h3>' +
      '<span class="sub">' + esc(live.id) + '</span><div class="right">' + C.status(live.status) +
      (live.approvalStatus === 'pending' ? '<button class="btn sm primary" data-act="guard" data-id="' + live.id + '">Open Decision Guard</button>' : '') + '</div></div>' +
      '<div class="card-pad grid g-side">' +
        '<div><div style="margin-bottom:10px"><b style="font-size:13.5px">' + esc(live.action) + '</b>' +
        '<p class="tiny muted" style="margin-top:3px">' + esc(live.objective) + '</p></div>' +
        C.timeline(live.timeline, 'live-' + live.id) + '</div>' +
        '<div class="grid" style="gap:12px;align-content:start">' +
          '<div class="stat-strip" style="flex-direction:column">' +
            '<div><div class="l">Value at stake</div><div class="v">' + (live.amount ? fmt.usd(live.amount) : '—') + '</div></div>' +
            '<div><div class="l">Agent confidence</div><div class="v">' + Math.round(live.confidence * 100) + '%</div></div>' +
            '<div><div class="l">Policy</div><div class="v" style="font-size:13px;font-weight:560">' + esc(live.policyLabel) + '</div></div>' +
          '</div>' +
          '<p class="tiny muted">Timelines record observable execution events — the tool called, what it returned, and which policy was evaluated. They do not expose model reasoning.</p>' +
        '</div></div></div>' : '') +

    '<div class="card">' +
      '<div class="toolbar">' +
        '<div class="searchfield" style="width:260px">' +
          '<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="9" r="6.5"/><path d="m14 14 4 4"/></svg>' +
          '<input class="input" id="dec-q" data-input="dec-q" value="' + esc(u.q) + '" placeholder="Search decisions, agents, policies" aria-label="Search decisions"></div>' +
        '<div class="chipbar">' + STAT.map((s) =>
          '<button class="chip ' + (u.status === s ? 'is-on' : '') + '" data-act="dec-status" data-id="' + s + '" aria-pressed="' + (u.status === s) + '">' +
          esc(s === 'all' ? 'All' : (ADG.STATUS[s] || {}).label || s) +
          '<span class="n">' + (s === 'all' ? ADG.state.decisions.length : (counts[s] || 0)) + '</span></button>').join('') + '</div>' +
      '</div>' +
      (rows.length ? '<div class="tablewrap collapse"><table class="tbl"><thead><tr>' +
        '<th>Decision</th><th>Agent</th><th>Status</th><th>Risk</th><th class="num">Value</th><th>Policy</th><th class="num">Confidence</th><th>When</th></tr></thead><tbody>' +
        rows.map((d) => {
          const a = S.agent(d.agentId) || {};
          return '<tr data-act="' + (d.approvalStatus === 'pending' && d.guard ? 'guard' : 'open-decision') + '" data-id="' + d.id + '" tabindex="0">' +
            '<td><b style="font-weight:550">' + esc(d.action) + '</b><div class="mono muted">' + esc(d.id) + '</div></td>' +
            '<td class="nowrap">' + esc(a.name) + '</td>' +
            '<td>' + C.status(d.status) + '</td>' +
            '<td>' + C.badge(d.riskLevel === 'high' ? 'High' : d.riskLevel === 'moderate' ? 'Moderate' : 'Low',
              d.riskLevel === 'high' ? 'red' : d.riskLevel === 'moderate' ? 'amber' : 'green', { glyph: '△' }) + '</td>' +
            '<td class="num">' + (d.amount ? fmt.usd(d.amount) : '—') + '</td>' +
            '<td class="tiny muted">' + esc(d.policyLabel) + '</td>' +
            '<td class="num">' + Math.round(d.confidence * 100) + '%</td>' +
            '<td class="tiny muted nowrap">' + esc(fmt.ago(d.timestamp)) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="cardlist">' + rows.map((d) => {
          const a = S.agent(d.agentId) || {};
          return '<button class="minicard" data-act="open-decision" data-id="' + d.id + '" style="text-align:left">' +
            '<div class="mc-top">' + C.status(d.status) + '<span class="tiny muted" style="margin-left:auto">' + fmt.ago(d.timestamp) + '</span></div>' +
            '<b style="font-size:12.5px">' + esc(d.action) + '</b>' +
            '<p class="tiny muted" style="margin-top:3px">' + esc(a.name) + (d.amount ? ' · ' + fmt.usd(d.amount) : '') + '</p></button>';
        }).join('') + '</div>' +
        '<div class="pager"><span>Showing ' + ((u.page - 1) * per + 1) + '–' + Math.min(u.page * per, all.length) + ' of ' + all.length + '</span>' +
        '<div class="right">' +
        '<button class="btn xs" data-act="dec-page" data-p="' + Math.max(1, u.page - 1) + '"' + (u.page === 1 ? ' disabled' : '') + '>Previous</button>' +
        '<span class="tiny">Page ' + u.page + ' of ' + pages + '</span>' +
        '<button class="btn xs" data-act="dec-page" data-p="' + Math.min(pages, u.page + 1) + '"' + (u.page === pages ? ' disabled' : '') + '>Next</button>' +
        '</div></div>'
        : C.empty({ title: 'No decisions match', body: 'Try a different status filter or clear the search.',
            actions: '<button class="btn sm" data-act="dec-status" data-id="all">Show all</button>' })) +
    '</div>';
  };

  /* ---------------------------------------------------------- attention queue */
  V['decisions/attention'] = function () {
    const items = S.attention();
    const groups = [
      ['critical', 'Act now', 'Consequential decisions and critical failures.'],
      ['high', 'This week', 'Degradation that will become critical if left alone.'],
      ['medium', 'Keep an eye on', 'Trends worth a look, not an intervention.']
    ];
    return pageHead('Attention queue', 'The full ranked queue behind the Command Center. Ordered by consequence — value at stake, blast radius and how fast it is getting worse.',
      '<button class="btn" data-act="demo-panel">Demo controls</button>') +
      (items.length ? groups.map(([sev, title, sub]) => {
        const g = items.filter((i) => i.sev === sev);
        if (!g.length) return '';
        return '<div class="sec"><div class="sec-head"><h2>' + esc(title) + '</h2><span class="sub">' + esc(sub) + '</span>' +
          '<div class="right">' + C.badge(g.length + ' item' + (g.length > 1 ? 's' : ''),
            sev === 'critical' ? 'red' : sev === 'high' ? 'amber' : null) + '</div></div>' +
          '<div class="att">' + g.map(ADG.attentionCard).join('') + '</div></div>';
      }).join('')
      : C.empty({ title: 'The queue is empty', body: 'No agent needs a human right now. Every guardrail is holding and no decision is paused.',
          actions: '<button class="btn sm" data-act="demo-panel">Simulate a scenario</button>' }));
  };

  /* ---------------------------------------------------------- approvals */
  V['decisions/approvals'] = function () {
    const pending = S.pending().sort((a, b) => (b.amount || 0) - (a.amount || 0));
    const resolved = ADG.state.decisions.filter((d) => ['approved', 'rejected'].indexOf(d.approvalStatus) !== -1)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 12);
    const totalValue = pending.reduce((s, d) => s + (d.amount || 0), 0);

    return pageHead('Approvals', 'Decisions paused at the human boundary. Each one holds its agent until you resolve it.',
      '<button class="btn" data-act="goto" data-route="#/governance/policies">Approval policy</button>') +

    '<div class="grid g-4" style="margin-bottom:18px">' +
      C.kpi({ label: 'Awaiting your decision', value: pending.length, cls: pending.length ? 'is-warn' : '', act: 'noop',
        foot: '<span class="muted">agents paused until resolved</span>' }) +
      C.kpi({ label: 'Value held', value: fmt.usd(totalValue, { compact: true }), act: 'noop',
        foot: '<span class="muted">across ' + pending.filter((d) => d.amount).length + ' financial decisions</span>' }) +
      C.kpi({ label: 'Oldest request', value: pending.length ? fmt.ago(pending.map((d) => d.timestamp).sort()[0]).replace(' ago', '') : '—', act: 'noop',
        foot: '<span class="muted">approvals expire after 24 hours</span>' }) +
      C.kpi({ label: 'Resolved this period', value: resolved.length, act: 'noop',
        foot: '<span class="muted">' + resolved.filter((d) => d.approvalStatus === 'approved').length + ' approved · ' +
          resolved.filter((d) => d.approvalStatus === 'rejected').length + ' rejected</span>' }) +
    '</div>' +

    '<div class="sec-head"><h2>Waiting on a human</h2><span class="sub">Highest value first</span></div>' +
    (pending.length ? '<div class="grid g-2">' + pending.map((d) => {
      const a = S.agent(d.agentId) || {};
      const t = S.trust(a);
      return '<article class="card"><div class="card-head">' +
        '<h3 style="font-size:13px">' + esc(a.name) + '</h3>' +
        '<div class="right">' + C.badge('Trust ' + t, ADG.toneForTrust(t)) + C.status('awaiting-approval') + '</div></div>' +
        '<div class="card-pad">' +
        '<b style="font-size:13.5px;line-height:1.4;display:block">' + esc(d.action) + '</b>' +
        '<div class="tiny muted" style="margin-top:4px">' + esc(d.id) + ' · ' + esc(d.policyLabel) + ' · ' + fmt.ago(d.timestamp) + '</div>' +
        (d.amount ? '<div class="kpi-val" style="font-size:22px;margin-top:10px">' + fmt.usd(d.amount) + '</div>' : '') +
        (d.flags && d.flags.length ? '<div class="flaglist" style="margin-top:10px">' + d.flags.slice(0, 2).map((f) =>
          '<div class="flag sev-' + f.severity + '"><span class="fi" aria-hidden="true">' + (f.severity === 'critical' ? '!' : '△') + '</span>' +
          '<div><b>' + esc(f.label) + '</b></div></div>').join('') + '</div>'
          : '<p class="tiny muted" style="margin-top:8px">Exceeds the agent’s autonomous limit. No other risk signal is active.</p>') +
        '</div>' +
        '<div class="card-foot"><div class="btn-row">' +
          (d.guard ? '<button class="btn sm primary" data-act="guard" data-id="' + d.id + '">Open Decision Guard</button>'
                   : '<button class="btn sm" data-act="open-decision" data-id="' + d.id + '">Review</button>') +
          '<div style="flex:1"></div>' +
          '<button class="btn sm danger" data-act="guard-reject" data-id="' + d.id + '">Reject</button>' +
          '<button class="btn sm green" data-act="guard-approve" data-id="' + d.id + '">Approve</button>' +
        '</div></div></article>';
    }).join('') + '</div>'
      : C.empty({ title: 'No approvals waiting', body: 'Every agent is operating inside its autonomous limits.',
          actions: '<button class="btn sm" data-act="demo-approval">Simulate an approval request</button>' })) +

    (resolved.length ? '<div class="sec"><div class="sec-head"><h2>Recently resolved</h2></div>' +
      '<div class="card"><div class="tablewrap"><table class="tbl"><thead><tr><th>Decision</th><th>Agent</th><th class="num">Value</th><th>Outcome</th><th>Approver</th><th>When</th></tr></thead><tbody>' +
      resolved.map((d) => '<tr data-act="open-decision" data-id="' + d.id + '" tabindex="0">' +
        '<td><b style="font-weight:550">' + esc(d.action) + '</b><div class="mono muted">' + esc(d.id) + '</div></td>' +
        '<td>' + esc((S.agent(d.agentId) || {}).name) + '</td>' +
        '<td class="num">' + (d.amount ? fmt.usd(d.amount) : '—') + '</td>' +
        '<td>' + C.status(d.approvalStatus) + '</td>' +
        '<td>' + esc(d.approver || '—') + '</td>' +
        '<td class="tiny muted nowrap">' + esc(fmt.ago(d.timestamp)) + '</td></tr>').join('') +
      '</tbody></table></div></div></div>' : '');
  };

  /* ---------------------------------------------------------- simulator */
  ADG.ui.sim = null;
  function simState() {
    const seed = ADG.state.simSeed;
    if (seed && (!ADG.ui.sim || ADG.ui.sim.agentId !== seed.agentId || seed.recId !== ADG.ui.sim.seededRec)) {
      const a = S.agent(seed.agentId);
      const rec = seed.recId ? ADG.state.recommendations.find((r) => r.id === seed.recId) : null;
      ADG.ui.sim = { agentId: a.id, controls: rec ? ADG.controlsFor(rec, a) : {}, seededRec: seed.recId, from: seed.from };
      ADG.state.simSeed = null;
    }
    if (!ADG.ui.sim) ADG.ui.sim = { agentId: 'ag-procurement', controls: {} };
    if (!S.agent(ADG.ui.sim.agentId)) ADG.ui.sim = { agentId: ADG.state.agents[0].id, controls: {} };
    return ADG.ui.sim;
  }
  ADG.actions['sim-agent-pick'] = (d) => { ADG.ui.sim = { agentId: d.value, controls: {} }; ADG.render(); };
  ADG.actions['sim-set'] = (d) => {
    const st = simState();
    const v = d.type === 'num' ? Number(d.value) : d.value;
    if (v === '' || v == null) delete st.controls[d.key]; else st.controls[d.key] = v;
    ADG.render();
  };
  ADG.actions['sim-toggle'] = (d) => {
    const st = simState();
    if (st.controls[d.key]) delete st.controls[d.key]; else st.controls[d.key] = d.key === 'minConfidence' ? 0.8 : true;
    ADG.render();
  };
  ADG.actions['sim-perm'] = (d) => {
    const st = simState();
    st.controls.perm = st.controls.perm || {};
    const a = S.agent(st.agentId);
    const [g, k] = d.path.split('::');
    if (a.permissions[g][k] === d.level) delete st.controls.perm[d.path];
    else st.controls.perm[d.path] = d.level;
    if (!Object.keys(st.controls.perm).length) delete st.controls.perm;
    ADG.render();
  };
  ADG.actions['sim-reset'] = () => { ADG.ui.sim.controls = {}; ADG.render(); ADG.toast('info', 'Simulation reset', 'All controls are back to the agent’s live configuration.'); };
  ADG.actions['sim-apply'] = function () {
    const st = simState();
    const a = S.agent(st.agentId);
    const sim = ADG.simulate(a, st.controls);
    if (!sim.notes.length) { ADG.toast('info', 'Nothing to apply', 'Change a control first.'); return; }
    ADG.confirm({
      title: 'Apply these changes to ' + esc(a.name) + '?', tone: 'blue', confirmLabel: 'Apply changes',
      body: sim.notes.length + ' change' + (sim.notes.length > 1 ? 's' : '') + ' will go live immediately. Trust moves <b>' +
        sim.before.trust + ' → ' + sim.after.trust + '</b>, risk <b>' + D.riskBand(sim.before.risk).label + ' → ' +
        D.riskBand(sim.after.risk).label + '</b>, and projected cost <b>' + fmt.usd(sim.before.cost) + ' → ' + fmt.usd(sim.after.cost) + '</b>.',
      onConfirm() {
        ADG.commit({
          mutate(s) {
            const ag = s.agents.find((x) => x.id === a.id);
            ag.dims = Object.assign({}, sim.after.dims);
            ag.permissions = JSON.parse(JSON.stringify(sim.proposed.permissions));
            ag.autonomousLimit = sim.after.limit;
            ag.model = sim.after.model;
            ag.monthlyProjectedCost = sim.after.cost;
            ag.successRate = sim.after.success;
            ag.health.completion = sim.after.success;
            ag.tools = Object.keys(ag.permissions.tools).filter((t) => ag.permissions.tools[t] !== 'block');
            ag.trustDelta7d = sim.after.trust - sim.before.trust;
            if (st.controls.budget != null) ag.budget = st.controls.budget;
            if (sim.after.trust >= 80 && ag.status !== 'awaiting-approval') ag.status = 'active';
            const h = s.history[ag.id];
            h.push({ day: -1, value: sim.after.trust, events: [{ delta: sim.after.trust - sim.before.trust,
              title: 'Configuration changed in the simulator', cause: sim.notes.join(' '), resolution: 'Applied by ' + ADG.SESSION.name + '.' }] });
          },
          audit: { agentId: a.id, event: 'Configuration changed', target: a.name, category: 'change',
            detail: sim.notes.join(' ') + ' Trust ' + sim.before.trust + ' → ' + sim.after.trust + '.' },
          notify: { level: 'resolved', title: 'Change applied to ' + a.name,
            body: sim.notes.length + ' control change' + (sim.notes.length > 1 ? 's' : '') + '. Trust ' + sim.before.trust + ' → ' + sim.after.trust + '.',
            route: '#/agents/' + a.id },
          toast: { type: 'success', title: 'Changes applied',
            body: a.name + ': trust ' + sim.before.trust + ' → ' + sim.after.trust + '. Audit event written.' }
        });
        ADG.ui.sim.controls = {};
        ADG.render();
      }
    });
  };

  V['decisions/simulator'] = function () {
    const st = simState();
    const a = S.agent(st.agentId);
    const c = st.controls;
    const sim = ADG.simulate(a, c);
    const limit = c.autonomousLimit != null ? c.autonomousLimit : a.autonomousLimit;
    const budget = c.budget != null ? c.budget : a.budget;
    const retries = c.maxRetries != null ? c.maxRetries : 6;
    const draftPerms = (function () {
      const p = JSON.parse(JSON.stringify(a.permissions));
      Object.keys(c.perm || {}).forEach((path) => { const [g, k] = path.split('::'); p[g][k] = c.perm[path]; });
      return p;
    })();
    const TOGGLES = [
      ['escalateOnBlock', 'Escalate to the owner on every block', 'Stops the agent absorbing a refusal silently.'],
      ['dualApproval', 'Two named approvers for new suppliers', 'Applies to any counterparty created in the last 90 days.'],
      ['minConfidence', 'Withhold proposals below 80% confidence', 'The agent stays silent rather than escalating low-confidence work.'],
      ['contractTest', 'Enforce upstream data contract tests', 'Catches schema drift before it reaches the agent.'],
      ['preIndex', 'Pre-index reference corpora', 'Removes the per-task re-parse.'],
      ['cacheExtract', 'Cache warehouse extracts between runs', 'Stops the same slice being pulled repeatedly.']
    ];

    return pageHead('Decision simulator', 'Change the guardrails, see the consequences before they are real. Nothing here is live until you apply it.',
      '<select class="select" style="width:230px" data-change="sim-agent-pick" aria-label="Choose an agent to simulate">' +
      ADG.state.agents.map((x) => '<option value="' + x.id + '"' + (x.id === a.id ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select>' +
      '<button class="btn" data-act="sim-reset">Reset</button>' +
      '<button class="btn blue" data-act="sim-apply">Apply changes</button>') +

    (st.from ? '<div class="card card-pad" style="margin-bottom:14px;background:var(--amber-bg);border-color:var(--amber-br);display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
      '<span style="font-size:12.5px">You came here from <b>' + esc(st.from) + '</b>, which is still paused at the human boundary.</span>' +
      '<div style="flex:1"></div><button class="btn sm" data-act="guard" data-id="' + st.from + '">Back to the decision</button></div>' : '') +

    '<div class="grid g-side-l">' +
      '<div class="card" style="align-self:start"><div class="card-head"><h3>Controls</h3>' +
        '<div class="right">' + (sim.notes.length ? C.badge(sim.notes.length + ' changed', 'purple', { glyph: '◇' }) : C.badge('Unchanged', null)) + '</div></div>' +
        '<div class="card-pad grid" style="gap:16px">' +
          '<div class="field"><label for="sim-model">Model tier</label>' +
            '<select class="select" id="sim-model" data-change="sim-set" data-key="model">' +
            Object.keys(D.MODELS).map((k) => '<option value="' + k + '"' + ((c.model || a.model) === k ? ' selected' : '') + '>' +
              esc(D.MODELS[k].tier + ' — ' + D.MODELS[k].name) + '</option>').join('') + '</select>' +
            '<span class="hint">Relative unit cost ' + D.MODELS[c.model || a.model].costPerKTask.toFixed(2) + '×</span></div>' +

          '<div class="field"><label for="sim-limit">Autonomous value limit · <b>' + (limit ? fmt.usd(limit) : 'none') + '</b></label>' +
            '<input type="range" id="sim-limit" min="0" max="200000" step="5000" value="' + limit + '" data-change="sim-set" data-key="autonomousLimit" data-type="num">' +
            '<span class="hint">Live value ' + (a.autonomousLimit ? fmt.usd(a.autonomousLimit) : 'none') + '. Anything above this pauses for a human.</span></div>' +

          '<div class="field"><label for="sim-budget">Monthly budget · <b>' + fmt.usd(budget) + '</b></label>' +
            '<input type="range" id="sim-budget" min="500" max="' + Math.max(20000, a.budget * 2) + '" step="100" value="' + budget + '" data-change="sim-set" data-key="budget" data-type="num">' +
            '<span class="hint">Projected spend ' + fmt.usd(sim.after.cost) + '.</span></div>' +

          '<div class="field"><label for="sim-retries">Maximum retries · <b>' + retries + '</b></label>' +
            '<input type="range" id="sim-retries" min="1" max="6" step="1" value="' + retries + '" data-change="sim-set" data-key="maxRetries" data-type="num">' +
            '<span class="hint">Current retry rate ' + a.health.retryRate + '%.</span></div>' +

          '<div><div class="eyebrow" style="margin-bottom:6px">Policy and routing rules</div>' +
            '<div class="grid" style="gap:2px">' + TOGGLES.map(([k, label, hint]) =>
              '<button class="sb-item" data-act="sim-toggle" data-key="' + k + '" role="switch" aria-checked="' + !!c[k] + '" style="align-items:flex-start">' +
              '<span style="flex:1;text-align:left"><span style="display:block;font-size:12.5px">' + esc(label) + '</span>' +
              '<span class="tiny muted" style="display:block;margin-top:1px">' + esc(hint) + '</span></span>' +
              '<span class="switch" aria-hidden="true" style="margin-top:2px;pointer-events:none"><i style="' + (c[k] ? 'background:var(--blue)' : '') + '"></i></span></button>').join('') +
          '</div></div>' +
        '</div>' +
        '<div class="card-foot"><div class="btn-row"><button class="btn sm" data-act="sim-reset">Reset</button>' +
          '<div style="flex:1"></div><button class="btn sm blue" data-act="sim-apply">Apply changes</button></div></div>' +
      '</div>' +

      '<div>' + ADG.simulationBody(a, sim, null) +
        '<div class="sec"><div class="sec-head"><h2>Permission envelope</h2>' +
          '<span class="sub">Changes here feed straight into exposure, risk and permission safety</span></div>' +
          '<div class="card"><div class="card-pad">' +
          C.permMatrix(a, { editable: true, draft: draftPerms, act: 'sim-perm' }) + '</div></div></div>' +
      '</div>' +
    '</div>';
  };

  /* ---------------------------------------------------------- operations */
  V['operations/activity'] = function () {
    const s = ADG.state;
    const byHour = Array.from({ length: 24 }, (_, i) => {
      const n = s.decisions.filter((d) => new Date(d.timestamp).getUTCHours() === ((i + 18) % 24)).length;
      return n;
    });
    const byAgent = s.agents.slice().sort((a, b) => b.taskCount - a.taskCount).slice(0, 10)
      .map((a) => ({ id: a.id, label: a.name, value: a.taskCount, note: a.successRate.toFixed(1) + '% success',
        tone: a.successRate >= 95 ? 'green' : a.successRate >= 90 ? 'blue' : 'amber' }));
    const recent = s.audit.slice(0, 14);
    const totalTasks = s.agents.reduce((x, a) => x + a.taskCount, 0);

    return pageHead('Activity', 'What the fleet is actually doing — volume, throughput and the events worth reading.') +
      '<div class="grid g-4" style="margin-bottom:18px">' +
        C.kpi({ label: 'Lifetime tasks', value: fmt.int(totalTasks), act: 'noop', foot: '<span class="muted">across ' + s.agents.length + ' agents</span>' }) +
        C.kpi({ label: 'Decisions recorded', value: fmt.int(s.decisions.length), act: 'goto', route: '#/decisions/live', foot: '<span class="muted">last 7 days</span>' }) +
        C.kpi({ label: 'Blocked by policy', value: s.decisions.filter((d) => d.status === 'blocked').length, act: 'goto', route: '#/governance/policies',
          foot: '<span class="muted">guardrails doing their job</span>' }) +
        C.kpi({ label: 'Escalated to a human', value: s.decisions.filter((d) => d.approvalRequired).length, act: 'goto', route: '#/decisions/approvals',
          foot: '<span class="muted">' + S.pending().length + ' still open</span>' }) +
      '</div>' +
      '<div class="grid g-side">' +
        '<div class="card"><div class="card-head"><h3>Decision volume by hour</h3><span class="sub">IST, last 7 days</span></div>' +
          '<div class="card-pad">' + C.lineChart([{ values: byHour, tone: 'blue' }],
            { h: 200, yFmt: (v) => Math.round(v), yMin: 0, xLabels: byHour.map((_, i) => (i % 4 === 0 ? String(i).padStart(2, '0') + ':00' : '')) }) + '</div></div>' +
        '<div class="card"><div class="card-head"><h3>Busiest agents</h3></div><div class="card-pad">' +
          C.barChart(byAgent, { fmt: (v) => fmt.int(v), act: 'open-agent' }) + '</div></div>' +
      '</div>' +
      '<div class="sec"><div class="sec-head"><h2>Recent events</h2><div class="right">' +
        '<button class="btn sm" data-act="goto" data-route="#/governance/audit">Full audit trail</button></div></div>' +
        '<div class="card"><div class="tablewrap"><table class="tbl"><thead><tr><th>When</th><th>Event</th><th>Agent</th><th>Actor</th><th>Detail</th></tr></thead><tbody>' +
        recent.map((e) => '<tr' + (e.agentId ? ' data-act="open-agent" data-id="' + e.agentId + '" tabindex="0"' : ' style="cursor:default"') + '>' +
          '<td class="tiny muted nowrap">' + esc(fmt.ago(e.time)) + '</td>' +
          '<td><b style="font-weight:550">' + esc(e.event) + '</b></td>' +
          '<td class="nowrap">' + esc(e.agentId ? (S.agent(e.agentId) || {}).name || '—' : '—') + '</td>' +
          '<td>' + esc(e.actor) + '</td>' +
          '<td class="muted">' + esc(e.detail) + '</td></tr>').join('') + '</tbody></table></div></div></div>';
  };

  V['operations/health'] = function () {
    const s = ADG.state;
    const sorted = s.agents.slice().sort((a, b) => S.health(a) - S.health(b));
    const avg = Math.round(s.agents.reduce((x, a) => x + S.health(a), 0) / s.agents.length);
    const worst = sorted[0];
    const partAvg = D.HEALTH_PARTS.map((p) => ({
      label: p.label, value: Number((s.agents.reduce((x, a) => x + a.health[p.key], 0) / s.agents.length).toFixed(1)), unit: p.unit, invert: p.invert
    }));
    return pageHead('Health', 'Operational health is deliberately independent of trust. An agent can be perfectly healthy and completely untrustworthy — and the reverse.',
      '<button class="btn" data-act="goto" data-route="#/trust/overview">Compare with trust</button>') +
      '<div class="grid g-side">' +
        '<div class="card"><div class="card-head"><h3>Fleet health</h3><span class="sub">Weighted from six operational metrics</span></div>' +
          '<div class="card-pad" style="display:flex;gap:26px;align-items:center;flex-wrap:wrap">' +
            '<div style="text-align:center">' + C.ring(avg, { size: 150, stroke: 12, cap: D.healthBand(avg).label, tone: ADG.toneForHealth(avg) }) + '</div>' +
            '<div style="flex:1;min-width:260px;display:grid;gap:10px">' + partAvg.map((p) =>
              '<div style="display:flex;gap:10px;align-items:baseline"><span style="font-size:12.5px;color:var(--ink-2);flex:1">' + esc(p.label) + '</span>' +
              '<span class="num" style="font-weight:600">' + p.value + p.unit + '</span>' +
              '<span class="tiny muted">' + (p.invert ? 'lower is better' : 'higher is better') + '</span></div>').join('') +
            '</div></div>' +
          '<div class="card-foot"><span class="tiny">Fleet health is <b>' + D.healthBand(avg).label.toLowerCase() + '</b>. ' +
            'The retry rate at ' + partAvg[3].value + '% is the metric to watch — it converts data problems into cost.</span></div></div>' +
        C.ai({ kicker: 'Health assessment', confidence: 0.91,
          body: '<b>' + esc(worst.name) + '</b> is the weakest agent in the fleet at <b>' + S.health(worst) + '/100</b>. Its ' +
            worst.health.retryRate + '% retry rate and ' + worst.health.toolErrors + ' daily tool errors point at an integration fault, not a model fault — ' +
            'the agent is being handed bad responses and dutifully trying again.',
          rows: [['Healthy', s.agents.filter((a) => S.health(a) >= 92).length + ' of ' + s.agents.length + ' agents'],
                 ['Degraded or worse', s.agents.filter((a) => S.health(a) < 80).length + ' agents'],
                 ['Note', 'Health does not feed the trust score. A failing agent that escalates correctly can still be trustworthy.']],
          actions: '<button class="btn sm" data-act="open-agent" data-id="' + worst.id + '">Open ' + esc(worst.name) + '</button>' }) +
      '</div>' +
      '<div class="sec"><div class="sec-head"><h2>Health by agent</h2><span class="sub">Lowest first</span></div>' +
        '<div class="card"><div class="tablewrap"><table class="tbl"><thead><tr><th>Agent</th><th class="num">Health</th><th>Band</th>' +
        D.HEALTH_PARTS.map((p) => '<th class="num">' + esc(p.label) + '</th>').join('') + '<th class="num">Trust</th></tr></thead><tbody>' +
        sorted.slice(0, 16).map((a) => {
          const h = S.health(a);
          return '<tr data-act="open-agent" data-id="' + a.id + '" tabindex="0">' +
            '<td><div class="cell-agent"><span class="ini">' + esc(C.initials(a.name)) + '</span>' +
            '<span><b>' + esc(a.name) + '</b><span>' + esc(a.department) + '</span></span></div></td>' +
            '<td class="num" style="font-weight:640;color:var(--' + ADG.toneForHealth(h) + ')">' + h + '</td>' +
            '<td>' + C.badge(D.healthBand(h).label, ADG.toneForHealth(h), { glyph: h >= 92 ? '✓' : '△' }) + '</td>' +
            D.HEALTH_PARTS.map((p) => '<td class="num">' + a.health[p.key] + (p.unit === '/day' ? '' : p.unit) + '</td>').join('') +
            '<td class="num">' + C.trustCell(a) + '</td></tr>';
        }).join('') + '</tbody></table></div></div></div>';
  };

  ADG.ui.inc = 'open';
  ADG.actions['inc-filter'] = (d) => { ADG.ui.inc = d.id; ADG.render(); };

  V['operations/incidents'] = function () {
    const f = ADG.ui.inc;
    const all = ADG.state.incidents;
    const list = all.filter((i) => f === 'all' || (f === 'open' ? i.status !== 'resolved' : i.status === f))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const FILTERS = [['open', 'Open'], ['investigating', 'Investigating'], ['resolved', 'Resolved'], ['all', 'All']];
    const sevCount = (s) => all.filter((i) => i.severity === s && i.status !== 'resolved').length;

    return pageHead('Incidents', 'Every failure, violation and degradation with a named impact and a recommended fix.',
      '<button class="btn" data-act="demo-incident">Simulate an incident</button>') +
      '<div class="grid g-4" style="margin-bottom:18px">' +
        C.kpi({ label: 'Critical', value: sevCount('critical'), cls: sevCount('critical') ? 'is-alert' : '', act: 'inc-filter', id: 'open', foot: '<span class="muted">need intervention now</span>' }) +
        C.kpi({ label: 'High', value: sevCount('high'), cls: sevCount('high') ? 'is-warn' : '', act: 'inc-filter', id: 'open', foot: '<span class="muted">degrading</span>' }) +
        C.kpi({ label: 'Open in total', value: S.openIncidents().length, act: 'inc-filter', id: 'open', foot: '<span class="muted">across ' + new Set(S.openIncidents().map((i) => i.agentId)).size + ' agents</span>' }) +
        C.kpi({ label: 'Resolved', value: all.filter((i) => i.status === 'resolved').length, act: 'inc-filter', id: 'resolved', foot: '<span class="muted">this period</span>' }) +
      '</div>' +
      '<div class="chipbar" style="margin-bottom:14px">' + FILTERS.map(([id, label]) =>
        '<button class="chip ' + (f === id ? 'is-on' : '') + '" data-act="inc-filter" data-id="' + id + '" aria-pressed="' + (f === id) + '">' + esc(label) +
        '<span class="n">' + all.filter((i) => id === 'all' || (id === 'open' ? i.status !== 'resolved' : i.status === id)).length + '</span></button>').join('') + '</div>' +
      (list.length ? '<div class="grid g-2">' + list.map((i) => {
        const a = S.agent(i.agentId) || {};
        return '<article class="card is-click" data-act="open-incident" data-id="' + i.id + '" tabindex="0" role="button">' +
          '<div class="card-head">' +
          C.badge(i.severity[0].toUpperCase() + i.severity.slice(1),
            i.severity === 'critical' || i.severity === 'high' ? 'red' : i.severity === 'medium' ? 'amber' : 'blue', { glyph: '△' }) +
          C.status(i.status) + '<div class="right tiny muted">' + esc(i.id) + ' · ' + fmt.ago(i.timestamp) + '</div></div>' +
          '<div class="card-pad"><b style="font-size:13.5px;line-height:1.4;display:block">' + esc(i.title) + '</b>' +
          '<button class="btn xs ghost" data-act="open-agent" data-id="' + a.id + '" style="padding-left:0;margin-top:2px">' + esc(a.name) + ' · Trust ' + S.trust(a) + '</button>' +
          '<p style="font-size:12.5px;color:var(--ink-2);line-height:1.55;margin-top:8px">' + esc(i.description) + '</p>' +
          '<div class="rule" style="margin:10px 0"></div>' +
          '<div class="ai-ev"><div class="row"><span class="k">Impact</span><span>' + esc(i.impact) + '</span></div>' +
          (i.resolution ? '<div class="row"><span class="k">Resolution</span><span>' + esc(i.resolution) + '</span></div>' : '') + '</div></div></article>';
      }).join('') + '</div>'
        : C.empty({ title: 'No incidents in this view', body: 'Nothing matches the current filter.',
            actions: '<button class="btn sm" data-act="inc-filter" data-id="all">Show all</button>' }));
  };

  /* ---------------------------------------------------------- governance */
  V['governance/permissions'] = function () {
    const s = ADG.state;
    const groups = [['data', 'Data', D.P_DATA], ['tools', 'Tools', D.P_TOOLS], ['actions', 'Actions', D.P_ACTIONS]];
    const core = s.agents.slice(0, 14);
    const riskiest = s.agents.slice().sort((a, b) => D.exposureOf(b) - D.exposureOf(a)).slice(0, 6);

    return pageHead('Permissions', 'The authority envelope for the whole fleet. Every grant carries an impact weight, and weight is what turns into risk.',
      '<button class="btn" data-act="goto" data-route="#/trust/matrix">See the risk it creates</button>') +
      '<div class="grid g-4" style="margin-bottom:18px">' +
        C.kpi({ label: 'Mean exposure', value: Math.round(s.agents.reduce((x, a) => x + D.exposureOf(a), 0) / s.agents.length), unit: '/100', act: 'noop',
          foot: '<span class="muted">share of total capability impact held</span>' }) +
        C.kpi({ label: 'Highest exposure', value: D.exposureOf(riskiest[0]), unit: '/100', act: 'open-agent', id: riskiest[0].id,
          foot: '<span class="muted">' + esc(riskiest[0].name) + '</span>' }) +
        C.kpi({ label: 'Payment system access', value: s.agents.filter((a) => a.permissions.tools['Payment system'] !== 'block').length, act: 'noop',
          foot: '<span class="muted">agents · none can release funds</span>' }) +
        C.kpi({ label: 'Delete permission', value: s.agents.filter((a) => a.permissions.actions['Delete'] === 'allow').length, act: 'noop',
          foot: '<span class="muted">agents allowed outright</span>' }) +
      '</div>' +
      '<div class="sec-head"><h2>Fleet grant profile</h2><span class="sub">How the ' + s.agents.length + ' agents are configured across every capability</span></div>' +
      '<div class="grid g-3">' + groups.map(([g, title, keys]) =>
        '<div class="card"><div class="card-head"><h3>' + esc(title) + '</h3></div><div class="card-pad grid" style="gap:12px">' +
        keys.map((k) => {
          const allow = s.agents.filter((a) => a.permissions[g][k] === 'allow').length;
          const appr = s.agents.filter((a) => a.permissions[g][k] === 'approval').length;
          const block = s.agents.length - allow - appr;
          return '<div><div style="display:flex;gap:8px;align-items:baseline;margin-bottom:5px">' +
            '<span style="font-size:12.5px">' + esc(k) + '</span>' +
            '<span class="tiny muted" style="margin-left:auto">impact ' + D.PERM_WEIGHTS[g][k] + '</span></div>' +
            '<div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:var(--surface-3)" role="img" aria-label="' +
              esc(allow + ' allowed, ' + appr + ' approval required, ' + block + ' blocked') + '">' +
            '<span style="width:' + (allow / s.agents.length * 100) + '%;background:var(--green)"></span>' +
            '<span style="width:' + (appr / s.agents.length * 100) + '%;background:var(--amber)"></span>' +
            '<span style="width:' + (block / s.agents.length * 100) + '%;background:var(--red);opacity:.45"></span></div>' +
            '<div class="tiny muted" style="margin-top:4px">' + allow + ' allowed · ' + appr + ' approval · ' + block + ' blocked</div></div>';
        }).join('') + '</div></div>').join('') + '</div>' +

      '<div class="sec"><div class="sec-head"><h2>Highest exposure</h2><span class="sub">Open an agent to change its envelope</span></div>' +
        '<div class="card"><div class="tablewrap"><table class="tbl"><thead><tr><th>Agent</th><th class="num">Exposure</th><th class="num">Autonomous limit</th>' +
        '<th class="num">Trust</th><th>Risk</th><th class="num">Allowed tools</th><th>Highest grant</th></tr></thead><tbody>' +
        riskiest.map((a) => {
          const top = Object.keys(D.PERM_WEIGHTS.tools).concat(Object.keys(D.PERM_WEIGHTS.actions))
            .map((k) => ({ k, g: D.PERM_WEIGHTS.tools[k] ? 'tools' : 'actions' }))
            .filter((x) => a.permissions[x.g][x.k] === 'allow')
            .sort((x, y) => D.PERM_WEIGHTS[y.g][y.k] - D.PERM_WEIGHTS[x.g][x.k])[0];
          return '<tr data-act="open-agent" data-id="' + a.id + '" tabindex="0">' +
            '<td><div class="cell-agent"><span class="ini">' + esc(C.initials(a.name)) + '</span><span><b>' + esc(a.name) + '</b><span>' + esc(a.department) + '</span></span></div></td>' +
            '<td class="num" style="font-weight:640">' + D.exposureOf(a) + '</td>' +
            '<td class="num">' + (a.autonomousLimit ? fmt.usd(a.autonomousLimit) : 'None') + '</td>' +
            '<td class="num">' + C.trustCell(a) + '</td><td>' + C.riskBadge(a) + '</td>' +
            '<td class="num">' + a.tools.length + '</td>' +
            '<td>' + (top ? C.badge(top.k, 'amber', { sq: true, title: 'Impact weight ' + D.PERM_WEIGHTS[top.g][top.k] }) : '—') + '</td></tr>';
        }).join('') + '</tbody></table></div></div></div>' +

      '<div class="sec"><div class="sec-head"><h2>' + esc(core[1].name) + ' — full matrix</h2>' +
        '<span class="sub">Editable. Changes recompute trust and risk immediately.</span>' +
        '<div class="right"><button class="btn sm" data-act="open-agent" data-id="' + core[1].id + '">Open agent</button></div></div>' +
        '<div class="card"><div class="card-pad">' + C.permMatrix(core[1], { editable: false }) +
        '<p class="tiny muted" style="margin-top:12px">Editing happens on the agent’s own Permissions tab, where the trust and exposure impact is shown before you commit.</p>' +
        '</div></div></div>';
  };

  V['governance/policies'] = function () {
    const s = ADG.state, k = S.kpis();
    const compliant = s.agents.filter((a) => (a.openViolations || 0) === 0).length;
    return pageHead('Policies', 'Six policies evaluated against every action the fleet takes. Coverage, breaches and exceptions per policy.',
      '<button class="btn" data-act="goto" data-route="#/governance/audit">Audit trail</button>') +
      '<div class="stat-strip" style="margin-bottom:18px">' +
        '<div><div class="l">Agents registered</div><div class="v">' + s.agents.length + '</div><div class="s">all under policy control</div></div>' +
        '<div><div class="l">Policy compliant</div><div class="v" style="color:var(--green)">' + compliant + '</div><div class="s">no open violations</div></div>' +
        '<div><div class="l">Exceptions</div><div class="v" style="color:var(--amber)">' + s.policies.reduce((x, p) => x + p.exceptions, 0) + '</div><div class="s">granted and time-boxed</div></div>' +
        '<div><div class="l">Compliance rate</div><div class="v">' + k.compliance.toFixed(1) + '%</div><div class="s">' + fmt.int(k.violations) + ' of ' + fmt.int(s.policies.reduce((x, p) => x + p.evaluations, 0)) + ' evaluations</div></div>' +
      '</div>' +
      '<div class="grid g-2">' + s.policies.map((p) => {
        const rate = 100 - (p.violations / p.evaluations) * 100;
        return '<article class="card"><div class="card-head"><h3>' + esc(p.name) + '</h3>' +
          '<div class="right">' + C.badge('v' + p.version, null, { sq: true }) +
          C.badge(p.severity[0].toUpperCase() + p.severity.slice(1),
            p.severity === 'critical' ? 'red' : p.severity === 'high' ? 'amber' : 'blue', { glyph: '△' }) + '</div></div>' +
          '<div class="card-pad">' +
          '<p style="font-size:12.5px;color:var(--ink-2);line-height:1.55">' + esc(p.description) + '</p>' +
          '<div style="margin:12px 0">' + C.meterRow('Clean evaluation rate', rate, rate >= 98 ? 'green' : rate >= 96 ? 'amber' : 'red', rate.toFixed(1) + '%') + '</div>' +
          '<ul class="auth-list can" style="margin-bottom:12px">' + p.rules.map((r) => '<li><span class="m">§</span><span>' + esc(r) + '</span></li>').join('') + '</ul>' +
          '<div class="grid g-4" style="gap:8px">' +
            '<div><div class="l tiny muted">Coverage</div><div class="num" style="font-weight:620">' + p.coverage + '/' + s.agents.length + '</div></div>' +
            '<div><div class="l tiny muted">Evaluations</div><div class="num" style="font-weight:620">' + fmt.int(p.evaluations) + '</div></div>' +
            '<div><div class="l tiny muted">Violations</div><div class="num" style="font-weight:620;color:var(--red)">' + fmt.int(p.violations) + '</div></div>' +
            '<div><div class="l tiny muted">Exceptions</div><div class="num" style="font-weight:620;color:var(--amber)">' + p.exceptions + '</div></div>' +
          '</div></div>' +
          '<div class="card-foot"><span class="tiny muted">Last updated ' + esc(fmt.date(p.lastUpdated)) + '</span></div></article>';
      }).join('') + '</div>';
  };

  ADG.ui.audit = { q: '', cat: 'all' };
  ADG.actions['aud-q'] = (d) => { ADG.ui.audit.q = d.value; ADG.render(); };
  ADG.actions['aud-cat'] = (d) => { ADG.ui.audit.cat = d.id; ADG.render(); };

  V['governance/audit'] = function () {
    const u = ADG.ui.audit;
    const CATS = ['all', 'approval', 'permission', 'policy', 'incident', 'change', 'guardrail', 'lifecycle'];
    const rows = ADG.state.audit.filter((e) => {
      if (u.cat !== 'all' && e.category !== u.cat) return false;
      if (u.q) {
        const q = u.q.toLowerCase();
        const an = e.agentId ? (S.agent(e.agentId) || {}).name || '' : '';
        if ((e.event + ' ' + e.actor + ' ' + e.target + ' ' + e.detail + ' ' + an + ' ' + e.id).toLowerCase().indexOf(q) === -1) return false;
      }
      return true;
    });
    const featured = S.decision('DEC-82941');

    return pageHead('Audit trail', 'Every consequential event, who caused it, what it touched and what happened as a result. This is the record a regulator would ask for.',
      '<button class="btn" data-act="goto" data-route="#/governance/policies">Policies</button>') +

      (featured ? '<div class="card" style="margin-bottom:18px"><div class="card-head"><h3>Decision ' + esc(featured.id.replace('DEC-', '#')) + '</h3>' +
        '<span class="sub">A worked example of a complete audit record</span>' +
        '<div class="right">' + C.status(featured.approvalStatus === 'pending' ? 'pending' : featured.approvalStatus) + '</div></div>' +
        '<div class="card-pad grid g-2" style="gap:18px">' +
          '<div class="kv-list">' +
            '<div class="kv-row"><span class="k">Agent</span><span class="v">' + esc((S.agent(featured.agentId) || {}).name) + '</span></div>' +
            '<div class="kv-row"><span class="k">Time</span><span class="v mono">' + esc(fmt.dateTime(featured.timestamp)) + '</span></div>' +
            '<div class="kv-row"><span class="k">Action</span><span class="v">' + esc(featured.action) + '</span></div>' +
            '<div class="kv-row"><span class="k">Amount</span><span class="v num">' + (featured.amount ? fmt.usd(featured.amount) : '—') + '</span></div>' +
            '<div class="kv-row"><span class="k">Policy</span><span class="v">' + esc(featured.policyLabel) + '</span></div>' +
            '<div class="kv-row"><span class="k">Approval</span><span class="v">' + (featured.approvalRequired ? 'Human required' : 'Not required') + '</span></div>' +
            '<div class="kv-row"><span class="k">Approver</span><span class="v">' + esc(featured.approver || 'Pending — no approver assigned') + '</span></div>' +
            '<div class="kv-row"><span class="k">Outcome</span><span class="v">' + esc(featured.outcome || 'Agent paused, awaiting a human decision') + '</span></div>' +
          '</div>' +
          '<div><div class="eyebrow" style="margin-bottom:6px">Evidence retained</div>' +
            '<div class="kv-list">' + featured.evidence.map((e) =>
              '<div class="kv-row" style="grid-template-columns:112px 1fr"><span class="k">' + esc(e.label) + '</span><span class="v">' + esc(e.value) + '</span></div>').join('') + '</div>' +
            '<div style="margin-top:10px">' + C.badge('Tools · ' + featured.toolsUsed.join(', '), 'blue', { sq: true }) + '</div>' +
            '<div class="btn-row" style="margin-top:10px"><button class="btn sm" data-act="open-decision" data-id="' + featured.id + '">Full timeline</button>' +
            (featured.approvalStatus === 'pending' ? '<button class="btn sm primary" data-act="guard" data-id="' + featured.id + '">Decide</button>' : '') + '</div>' +
          '</div></div></div>' : '') +

      '<div class="card"><div class="toolbar">' +
        '<div class="searchfield" style="width:280px">' +
        '<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="9" r="6.5"/><path d="m14 14 4 4"/></svg>' +
        '<input class="input" id="aud-q" data-input="aud-q" value="' + esc(u.q) + '" placeholder="Search events, actors, targets" aria-label="Search the audit trail"></div>' +
        '<div class="chipbar">' + CATS.map((c) =>
          '<button class="chip ' + (u.cat === c ? 'is-on' : '') + '" data-act="aud-cat" data-id="' + c + '" aria-pressed="' + (u.cat === c) + '">' +
          esc(c === 'all' ? 'All' : c[0].toUpperCase() + c.slice(1)) + '</button>').join('') + '</div>' +
        '<span class="tiny muted" style="margin-left:auto">' + rows.length + ' events</span></div>' +
        (rows.length ? '<div class="tablewrap"><table class="tbl"><thead><tr><th>ID</th><th>Time</th><th>Event</th><th>Actor</th><th>Agent</th><th>Target</th><th>Detail</th></tr></thead><tbody>' +
          rows.map((e) => '<tr' + (e.agentId ? ' data-act="open-agent" data-id="' + e.agentId + '" tabindex="0"' : ' style="cursor:default"') + '>' +
            '<td class="mono muted nowrap">' + esc(e.id) + '</td>' +
            '<td class="tiny muted nowrap">' + esc(fmt.dateTime(e.time)) + '</td>' +
            '<td><b style="font-weight:550">' + esc(e.event) + '</b><div>' + C.badge(e.category, null, { sq: true }) + '</div></td>' +
            '<td class="nowrap">' + esc(e.actor) + '<div>' + C.badge(e.actorType, e.actorType === 'human' ? 'blue' : e.actorType === 'agent' ? 'purple' : null, { sq: true }) + '</div></td>' +
            '<td class="nowrap">' + esc(e.agentId ? (S.agent(e.agentId) || {}).name || '—' : '—') + '</td>' +
            '<td class="mono">' + esc(e.target) + '</td>' +
            '<td class="muted">' + esc(e.detail) + '</td></tr>').join('') + '</tbody></table></div>'
          : C.empty({ title: 'No matching events', body: 'Try a different category or clear the search.',
              actions: '<button class="btn sm" data-act="aud-cat" data-id="all">Show all</button>' })) +
      '</div>';
  };

  /* ---------------------------------------------------------- economics */
  V['economics/spend'] = function () {
    const s = ADG.state, k = S.kpis();
    const retryWaste = Math.round(s.agents.reduce((x, a) => x + a.currentCost * (a.health.retryRate / 100), 0));
    const wastePct = Math.round((retryWaste / k.spend) * 100);
    const byDept = {}, byModel = {}, byDeptRisk = {};
    s.agents.forEach((a) => {
      byDept[a.department] = (byDept[a.department] || 0) + a.currentCost;
      byModel[D.MODELS[a.model].tier] = (byModel[D.MODELS[a.model].tier] || 0) + a.currentCost;
      byDeptRisk[a.department] = 1;
    });
    const deptRows = Object.keys(byDept).map((d) => ({ id: d, label: d, value: byDept[d] })).sort((a, b) => b.value - a.value);
    const modelSlices = Object.keys(byModel).map((t, i) => ({ label: t, value: byModel[t], tone: ['blue', 'purple', 'green'][i] || 'slate' }));
    const spendSeries = s.fleet.map((f) => f.spend);

    return pageHead('AI spend', 'Where the money goes, what it buys, and how much of it is repeated work.',
      '<button class="btn primary" data-act="goto" data-route="#/economics/optimization">Optimise</button>') +
      '<div class="grid g-4" style="margin-bottom:18px">' +
        C.kpi({ label: 'Month to date', value: fmt.usd(k.spend), act: 'noop', foot: '<span class="muted">across ' + k.agents + ' agents</span>' }) +
        C.kpi({ label: 'Projected', value: fmt.usd(k.projected), cls: k.projected > k.budget ? 'is-warn' : '', act: 'noop',
          foot: '<span class="delta ' + (k.projected > k.budget ? 'down' : 'up') + '">' + (k.projected > k.budget ? '▲ over' : '▼ under') + ' budget by ' + fmt.usd(Math.abs(k.projected - k.budget)) + '</span>' }) +
        C.kpi({ label: 'Total budget', value: fmt.usd(k.budget), act: 'noop', foot: '<span class="muted">approved for the month</span>' }) +
        C.kpi({ label: 'Recoverable waste', value: fmt.usd(retryWaste), cls: 'is-warn', act: 'goto', route: '#/economics/optimization',
          foot: '<span class="muted">' + wastePct + '% of spend is retries</span>' }) +
      '</div>' +
      '<div class="grid g-side">' +
        '<div class="card"><div class="card-head"><h3>Daily spend, 30 days</h3><span class="sub">Fleet total</span></div>' +
          '<div class="card-pad">' + C.lineChart([{ values: spendSeries, tone: 'blue' }],
            { h: 220, yFmt: (v) => '$' + (v / 1000).toFixed(1) + 'K', xLabels: s.fleet.map((f, i) => (i % 7 === 0 ? (f.day === 0 ? 'today' : f.day + 'd') : '')) }) + '</div></div>' +
        '<div class="card"><div class="card-head"><h3>By model tier</h3></div>' +
          '<div class="card-pad" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">' +
            C.donut(modelSlices, { size: 140, stroke: 20, center: fmt.usd(k.spend, { compact: true }), centerSub: 'total' }) +
            '<div style="flex:1;min-width:150px;display:grid;gap:8px">' + modelSlices.map((m) =>
              '<div style="display:flex;gap:8px;align-items:center"><span class="dot" style="color:var(--' + m.tone + ')"></span>' +
              '<span style="font-size:12.5px">' + esc(m.label) + '</span>' +
              '<span class="num" style="margin-left:auto;font-weight:600">' + fmt.usd(m.value, { compact: true }) + '</span></div>').join('') +
            '</div></div></div>' +
      '</div>' +
      '<div class="sec grid g-2">' +
        '<div class="card"><div class="card-head"><h3>By department</h3></div><div class="card-pad">' +
          C.barChart(deptRows, { fmt: (v) => fmt.usd(v) }) + '</div></div>' +
        '<div class="card"><div class="card-head"><h3>By task type</h3><span class="sub">Modelled from decision mix</span></div><div class="card-pad">' +
          C.barChart([
            { label: 'Retrieval and synthesis', value: Math.round(k.spend * 0.31), tone: 'blue' },
            { label: 'Reconciliation and matching', value: Math.round(k.spend * 0.22), tone: 'blue' },
            { label: 'Classification and triage', value: Math.round(k.spend * 0.18), tone: 'green' },
            { label: 'Drafting and generation', value: Math.round(k.spend * 0.15), tone: 'purple' },
            { label: 'Retries and reruns', value: retryWaste, tone: 'red', note: 'recoverable' },
            { label: 'Everything else', value: Math.max(0, k.spend - Math.round(k.spend * 0.86) - retryWaste), tone: 'slate' }
          ], { fmt: (v) => fmt.usd(v) }) + '</div></div>' +
      '</div>';
  };

  V['economics/by-agent'] = function () {
    const s = ADG.state;
    const rows = s.agents.slice().sort((a, b) => b.currentCost - a.currentCost);
    const total = rows.reduce((x, a) => x + a.currentCost, 0);
    return pageHead('Cost by agent', 'What each agent costs, what it delivers for it, and whether it is going to stay inside its budget.') +
      '<div class="card"><div class="tablewrap"><table class="tbl"><thead><tr>' +
        '<th>Agent</th><th class="num">Month to date</th><th class="num">Budget</th><th class="num">Projected</th>' +
        '<th>Budget position</th><th class="num">Cost / 1k tasks</th><th class="num">Efficiency</th><th class="num">Share</th></tr></thead><tbody>' +
        rows.map((a) => {
          const over = a.monthlyProjectedCost > a.budget;
          const pct = Math.min(140, (a.monthlyProjectedCost / a.budget) * 100);
          return '<tr data-act="open-agent" data-id="' + a.id + '" tabindex="0">' +
            '<td><div class="cell-agent"><span class="ini">' + esc(C.initials(a.name)) + '</span>' +
            '<span><b>' + esc(a.name) + '</b><span>' + esc(D.MODELS[a.model].tier) + ' tier</span></span></div></td>' +
            '<td class="num">' + fmt.usd(a.currentCost) + '</td>' +
            '<td class="num muted">' + fmt.usd(a.budget) + '</td>' +
            '<td class="num" style="' + (over ? 'color:var(--red);font-weight:620' : '') + '">' + fmt.usd(a.monthlyProjectedCost) + '</td>' +
            '<td style="min-width:130px"><div class="meter m-' + (over ? 'red' : pct > 85 ? 'amber' : 'green') + '"><i style="width:' + Math.min(100, pct) + '%"></i></div>' +
            '<span class="tiny muted">' + Math.round(pct) + '% of budget</span></td>' +
            '<td class="num">' + fmt.usd(a.currentCost / Math.max(a.taskCount / 1000, 0.1)) + '</td>' +
            '<td class="num" style="color:var(--' + (a.dims.costEfficiency >= 85 ? 'green' : a.dims.costEfficiency >= 70 ? 'amber' : 'red') + ')">' + a.dims.costEfficiency + '</td>' +
            '<td class="num">' + ((a.currentCost / total) * 100).toFixed(1) + '%</td></tr>';
        }).join('') + '</tbody></table></div></div>';
  };

  V['economics/optimization'] = function () {
    const s = ADG.state, k = S.kpis();
    const retryWaste = Math.round(s.agents.reduce((x, a) => x + a.currentCost * (a.health.retryRate / 100), 0));
    const tierWaste = Math.round(s.agents.filter((a) => a.model === 'frontier').reduce((x, a) => x + a.currentCost * 0.34, 0));
    const overRuns = s.agents.filter((a) => a.monthlyProjectedCost > a.budget).sort((a, b) => (b.monthlyProjectedCost - b.budget) - (a.monthlyProjectedCost - a.budget));
    const costRecs = s.recommendations.filter((r) => r.status === 'open' && (r.estimatedCostReduction || 0) > 0)
      .sort((a, b) => b.estimatedCostReduction - a.estimatedCostReduction);
    const totalSaving = costRecs.reduce((x, r) => {
      const a = S.agent(r.agentId); return x + Math.round(a.monthlyProjectedCost * r.estimatedCostReduction / 100);
    }, 0);

    return pageHead('Optimization', 'Where the fleet is spending money without buying anything — and exactly what to do about it.',
      '<button class="btn primary" data-act="goto" data-route="#/insights/recommendations">All recommendations</button>') +
      '<div class="grid g-4" style="margin-bottom:18px">' +
        C.kpi({ label: 'Identified waste', value: fmt.usd(retryWaste + tierWaste), cls: 'is-warn', act: 'noop',
          foot: '<span class="muted">' + Math.round(((retryWaste + tierWaste) / k.spend) * 100) + '% of current spend</span>' }) +
        C.kpi({ label: 'From retries', value: fmt.usd(retryWaste), act: 'goto', route: '#/operations/health',
          foot: '<span class="muted">work redone, not new work</span>' }) +
        C.kpi({ label: 'From tier over-routing', value: fmt.usd(tierWaste), act: 'noop',
          foot: '<span class="muted">frontier tier on simple tasks</span>' }) +
        C.kpi({ label: 'Recoverable this month', value: fmt.usd(totalSaving), act: 'noop',
          foot: '<span class="muted">across ' + costRecs.length + ' applied recommendations</span>' }) +
      '</div>' +
      '<div class="sec">' + C.ai({ kicker: 'Cost anomaly analysis', confidence: 0.9,
        body: 'Roughly <b>' + Math.round(((retryWaste + tierWaste) / k.spend) * 100) + '% of current spend buys nothing</b>. ' +
          'The larger half is retries: ' + fmt.usd(retryWaste) + ' of work that has already been done once and failed. ' +
          'The rest is model over-routing — low-complexity extraction and classification being served by the frontier tier because nothing ever told the router otherwise. ' +
          'Neither is a volume problem, so buying less capacity will not fix it.',
        rows: [['Worst offender', overRuns.length ? esc(overRuns[0].name) + ' at ' + fmt.usd(overRuns[0].monthlyProjectedCost) + ' against a ' + fmt.usd(overRuns[0].budget) + ' budget' : 'None'],
               ['Fastest fix', costRecs.length ? esc(costRecs[0].title) + ' — ' + costRecs[0].estimatedCostReduction + '% on that agent' : 'None'],
               ['Risk note', 'Moving tiers costs a small amount of reliability. Every recommendation below shows exactly how much.']]
      }) + '</div>' +
      '<div class="sec"><div class="sec-head"><h2>Agents over budget</h2><span class="sub">' + overRuns.length + ' of ' + s.agents.length + '</span></div>' +
        (overRuns.length ? '<div class="card"><div class="tablewrap"><table class="tbl"><thead><tr><th>Agent</th><th class="num">Projected</th><th class="num">Budget</th>' +
          '<th class="num">Overrun</th><th class="num">Retry rate</th><th>Tier</th><th>Fix available</th></tr></thead><tbody>' +
          overRuns.slice(0, 12).map((a) => {
            const rec = S.recsFor(a.id).filter((r) => r.estimatedCostReduction > 0)[0];
            return '<tr data-act="open-agent" data-id="' + a.id + '" tabindex="0">' +
              '<td><b style="font-weight:550">' + esc(a.name) + '</b></td>' +
              '<td class="num">' + fmt.usd(a.monthlyProjectedCost) + '</td>' +
              '<td class="num muted">' + fmt.usd(a.budget) + '</td>' +
              '<td class="num" style="color:var(--red);font-weight:620">+' + fmt.usd(a.monthlyProjectedCost - a.budget) + '</td>' +
              '<td class="num">' + a.health.retryRate + '%</td>' +
              '<td>' + C.badge(D.MODELS[a.model].tier, a.model === 'frontier' ? 'amber' : null, { sq: true }) + '</td>' +
              '<td>' + (rec ? '<button class="btn xs blue" data-act="rec-simulate" data-id="' + rec.id + '">Simulate −' + rec.estimatedCostReduction + '%</button>'
                : '<span class="tiny muted">No automated fix</span>') + '</td></tr>';
          }).join('') + '</tbody></table></div></div>'
          : C.empty({ title: 'Every agent is inside its budget', body: 'Nothing is projected to overrun this month.' })) + '</div>' +
      (costRecs.length ? '<div class="sec"><div class="sec-head"><h2>Cost recommendations</h2></div>' +
        '<div class="grid g-3">' + costRecs.map((r) => recCard(r)).join('') + '</div></div>' : '');
  };

  /* ---------------------------------------------------------- insights */
  ADG.ui.recFilter = 'open';
  ADG.actions['rec-filter'] = (d) => { ADG.ui.recFilter = d.id; ADG.render(); };

  V['insights/recommendations'] = function () {
    const f = ADG.ui.recFilter;
    const all = ADG.state.recommendations;
    const list = all.filter((r) => f === 'all' || r.status === f).sort((a, b) => a.priority - b.priority);
    const FILTERS = [['open', 'Open'], ['applied', 'Applied'], ['dismissed', 'Dismissed'], ['all', 'All']];
    const open = all.filter((r) => r.status === 'open');
    const riskSum = open.reduce((x, r) => x + r.estimatedRiskReduction, 0);

    return pageHead('AI recommendations', 'Every recommendation carries its evidence, its predicted impact and a confidence. Simulate before you apply — nothing changes until you say so.',
      '<button class="btn" data-act="goto" data-route="#/decisions/simulator">Open the simulator</button>') +
      '<div class="grid g-4" style="margin-bottom:18px">' +
        C.kpi({ label: 'Open recommendations', value: open.length, act: 'rec-filter', id: 'open', foot: '<span class="muted">ranked by consequence</span>' }) +
        C.kpi({ label: 'Combined risk reduction', value: riskSum, unit: '%', act: 'noop', foot: '<span class="muted">if every one were applied</span>' }) +
        C.kpi({ label: 'Applied', value: all.filter((r) => r.status === 'applied').length, act: 'rec-filter', id: 'applied',
          foot: '<span class="muted">recorded in the audit trail</span>' }) +
        C.kpi({ label: 'Mean confidence', value: open.length ? Math.round(open.reduce((x, r) => x + r.confidence, 0) / open.length * 100) : 0, unit: '%', act: 'noop',
          foot: '<span class="muted">across open recommendations</span>' }) +
      '</div>' +
      '<div class="chipbar" style="margin-bottom:14px">' + FILTERS.map(([id, label]) =>
        '<button class="chip ' + (f === id ? 'is-on' : '') + '" data-act="rec-filter" data-id="' + id + '" aria-pressed="' + (f === id) + '">' +
        esc(label) + '<span class="n">' + all.filter((r) => id === 'all' || r.status === id).length + '</span></button>').join('') + '</div>' +
      (list.length ? '<div class="grid g-3">' + list.map((r, i) => recCard(r, { index: f === 'open' ? i : null })).join('') + '</div>'
        : C.empty({ title: 'Nothing in this view', body: f === 'open' ? 'Every recommendation has been applied or dismissed.' : 'No recommendations have this status yet.',
            actions: '<button class="btn sm" data-act="rec-filter" data-id="all">Show all</button>' }));
  };

  V['insights/reports'] = function () {
    const s = ADG.state, k = S.kpis();
    const open = s.recommendations.filter((r) => r.status === 'open').sort((a, b) => a.priority - b.priority);
    const applied = s.recommendations.filter((r) => r.status === 'applied');
    const worst = s.agents.slice().sort((a, b) => S.trust(a) - S.trust(b)).slice(0, 3);
    const best = s.agents.slice().sort((a, b) => S.trust(b) - S.trust(a)).slice(0, 3);
    const humanEvents = s.audit.filter((a) => a.actorType === 'human').length;

    return pageHead('Executive reports', 'The weekly operating review for the AI workforce, assembled from the same data every other screen uses.',
      '<button class="btn" data-act="set-mode" data-mode="executive">Executive mode</button>' +
      '<button class="btn primary" data-act="print-report">Print / save as PDF</button>') +

      '<div class="card"><div class="card-head"><h3>Week 34 · AI workforce operating review</h3>' +
        '<span class="sub">Bengaluru · ' + esc(fmt.date(new Date().toISOString())) + '</span>' +
        '<div class="right">' + C.badge('Prepared by Executive Reporting Agent', 'purple', { glyph: '◆' }) + '</div></div>' +
        '<div class="card-pad">' +
        '<div class="stat-strip" style="margin-bottom:18px">' +
          '<div><div class="l">Agents</div><div class="v">' + k.agents + '</div></div>' +
          '<div><div class="l">Enterprise trust</div><div class="v">' + k.trust + '</div></div>' +
          '<div><div class="l">Compliance</div><div class="v">' + k.compliance.toFixed(1) + '%</div></div>' +
          '<div><div class="l">Spend</div><div class="v">' + fmt.usd(k.spend, { compact: true }) + '</div></div>' +
          '<div><div class="l">Critical</div><div class="v">' + k.critical + '</div></div>' +
          '<div><div class="l">Human decisions</div><div class="v">' + fmt.int(1842 + humanEvents) + '</div></div>' +
        '</div>' +

        '<h3 style="font-size:14px;margin-bottom:8px">Summary</h3>' +
        '<p style="font-size:13.5px;line-height:1.7;color:var(--ink-2);margin-bottom:16px">' +
        'The AI workforce processed ' + fmt.int(s.agents.reduce((x, a) => x + a.taskCount, 0)) + ' tasks at ' + k.compliance.toFixed(1) +
        '% policy compliance. Enterprise trust stands at <b>' + k.trust + '</b>, ' + (k.trust >= 88 ? 'inside' : 'below') +
        ' the 86–94 target band. ' + k.critical + ' critical issues remain open and ' + k.reviews + ' decisions are paused awaiting a human. ' +
        'The material finding this week is that risk is concentrated rather than distributed: ' + worst[0].name + ' and ' + worst[1].name +
        ' account for both critical incidents and the majority of open policy exposure, and in both cases the cause is an authority envelope wider than the agent’s demonstrated behaviour justifies.' +
        '</p>' +

        '<h3 style="font-size:14px;margin-bottom:8px">Decisions required from leadership</h3>' +
        '<ol style="display:grid;gap:10px;margin-bottom:16px;counter-reset:n">' + open.slice(0, 3).map((r, i) => {
          const a = S.agent(r.agentId);
          return '<li style="display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start">' +
            '<span style="width:22px;height:22px;border-radius:6px;background:var(--ink);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:650">' + (i + 1) + '</span>' +
            '<span><b style="font-size:13px">' + esc(r.title) + '</b> — ' + esc(a.name) + '<br>' +
            '<span class="tiny muted">' + esc(r.evidence) + ' Expected: risk ↓ ' + r.estimatedRiskReduction + '%, cost ↓ ' + r.estimatedCostReduction +
            '%, throughput ' + fmt.signed(r.estimatedPerformanceImpact, 1) + '%.</span></span></li>';
        }).join('') + '</ol>' +

        '<div class="grid g-2" style="gap:18px;margin-bottom:16px">' +
          '<div><h3 style="font-size:13px;margin-bottom:8px">Most trusted</h3>' +
            best.map((a) => '<div style="display:flex;gap:10px;align-items:center;padding:6px 0;border-bottom:1px dashed var(--border)">' +
              '<span style="font-size:12.5px;flex:1">' + esc(a.name) + '</span>' +
              '<span class="num" style="font-weight:620;color:var(--green)">' + S.trust(a) + '</span></div>').join('') + '</div>' +
          '<div><h3 style="font-size:13px;margin-bottom:8px">Needs attention</h3>' +
            worst.map((a) => '<div style="display:flex;gap:10px;align-items:center;padding:6px 0;border-bottom:1px dashed var(--border)">' +
              '<span style="font-size:12.5px;flex:1">' + esc(a.name) + '</span>' +
              '<span class="num" style="font-weight:620;color:var(--' + ADG.toneForTrust(S.trust(a)) + ')">' + S.trust(a) + '</span></div>').join('') + '</div>' +
        '</div>' +

        (applied.length ? '<h3 style="font-size:14px;margin-bottom:8px">Changes made this period</h3>' +
          '<ul class="auth-list can" style="margin-bottom:16px">' + applied.map((r) => {
            const ch = s.appliedChanges.filter((c) => c.recId === r.id)[0];
            return '<li><span class="m">✓</span><span>' + esc(r.title) + ' — ' + esc((S.agent(r.agentId) || {}).name) +
              (ch ? '. Trust ' + ch.from + ' → ' + ch.to + '.' : '.') + '</span></li>';
          }).join('') + '</ul>' : '') +

        '<h3 style="font-size:14px;margin-bottom:8px">Outlook</h3>' +
        '<p style="font-size:13.5px;line-height:1.7;color:var(--ink-2)">' +
        'Spend is projected at ' + fmt.usd(k.projected) + ' against ' + fmt.usd(k.budget) + ' of approved budget. ' +
        'Roughly ' + Math.round(s.agents.reduce((x, a) => x + a.currentCost * (a.health.retryRate / 100), 0) / k.spend * 100) +
        '% of current spend is repeated work rather than new work, which is recoverable without reducing capacity. ' +
        'Recommendation to the committee: approve the three guardrail changes above, and hold any expansion of agent autonomy in ' +
        esc(worst[0].department) + ' until its permission envelope has been corrected and trust has held above 85 for two consecutive weeks.' +
        '</p></div>' +
        '<div class="card-foot"><span class="tiny muted">Generated from live platform state. Every figure in this report is the same number shown on its source screen — nothing here is transcribed by hand.</span></div>' +
      '</div>';
  };

  ADG.actions['print-report'] = () => { ADG.toast('info', 'Opening the print dialog', 'Sidebar and chrome are hidden in the printed output.'); setTimeout(() => window.print(), 320); };
})(window);
