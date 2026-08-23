/* Agent Decision Guard — views: Command Center, Executive mode,
 * Agent Directory, Agent Detail and the Trust surfaces.
 * Built by Puneet Arora.
 */
(function (global) {
  'use strict';
  const ADG = global.ADG, D = global.ADG_DATA, S = ADG.sel, C = ADG.C, fmt = ADG.fmt, esc = ADG.esc;
  const V = ADG.routes;

  /* ---------------------------------------------------------- input plumbing */
  ADG.ui.tbl = { q: '', filter: 'all', dept: 'all', sort: 'trust', dir: 'asc', page: 1, per: 12 };
  ADG.ui.focusId = null;
  document.addEventListener('input', function (e) {
    const el = e.target.closest('[data-input]');
    if (!el) return;
    const fn = ADG.actions[el.dataset.input];
    if (!fn) return;
    ADG.ui.focusId = el.id;
    ADG.ui.focusPos = el.selectionStart;
    fn(Object.assign({}, el.dataset, { value: el.value }), el);
  });
  document.addEventListener('change', function (e) {
    const el = e.target.closest('[data-change]');
    if (!el) return;
    const fn = ADG.actions[el.dataset.change];
    if (fn) fn(Object.assign({}, el.dataset, { value: el.value, checked: el.checked }), el);
  });
  ADG.afterRender = function () {
    if (ADG.ui.focusId) {
      const el = document.getElementById(ADG.ui.focusId);
      if (el) { el.focus(); if (el.setSelectionRange && ADG.ui.focusPos != null) try { el.setSelectionRange(ADG.ui.focusPos, ADG.ui.focusPos); } catch (x) {} }
      ADG.ui.focusId = null;
    }
  };

  /* ---------------------------------------------------------- shared pieces */
  function pageHead(title, sub, right) {
    return '<div class="page-head" style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:260px"><h1>' + title + '</h1>' +
      (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' +
      (right ? '<div class="btn-row">' + right + '</div>' : '') + '</div>';
  }
  ADG.pageHead = pageHead;

  function attentionCard(it) {
    return '<article class="att-item sev-' + it.sev + '">' +
      '<span class="att-rail" aria-hidden="true"></span>' +
      '<div class="att-body"><div class="top"><b>' + esc(it.title) + '</b>' +
        C.badge(it.kind, it.sev === 'critical' ? 'red' : it.sev === 'high' ? 'red' : 'amber',
          { glyph: it.sev === 'critical' ? '!' : '△' }) + '</div>' +
      '<div class="desc">' + esc(it.desc) + '</div>' +
      (it.why ? '<div class="why">' + esc(it.why) + '</div>' : '') + '</div>' +
      '<div class="att-act">' + it.actions.map((a) =>
        '<button class="btn sm ' + (a.primary ? 'primary' : '') + '" data-act="' + a.act + '"' +
        (a.id ? ' data-id="' + esc(a.id) + '"' : '') + (a.route ? ' data-route="' + esc(a.route) + '"' : '') + '>' +
        esc(a.label) + '</button>').join('') + '</div></article>';
  }
  ADG.attentionCard = attentionCard;

  function recCard(r, opts) {
    const a = S.agent(r.agentId);
    const o = opts || {};
    const applied = r.status !== 'open';
    return '<article class="card"><div class="card-head">' +
      '<span class="badge b-purple sq">' + esc((o.index != null ? 'Recommendation ' + String(o.index + 1).padStart(2, '0') : r.type.toUpperCase())) + '</span>' +
      '<div class="right">' + C.status(r.status) + '</div></div>' +
      '<div class="card-pad">' +
      '<h3 style="font-size:14px;line-height:1.35">' + esc(r.title) + '</h3>' +
      '<button class="btn xs ghost" data-act="open-agent" data-id="' + a.id + '" style="padding-left:0;margin-top:2px">' + esc(a.name) + ' · Trust ' + S.trust(a) + '</button>' +
      '<p style="font-size:12.5px;color:var(--ink-2);line-height:1.6;margin-top:8px">' + esc(r.description) + '</p>' +
      '<div class="rule" style="margin:12px 0"></div>' +
      '<div class="ai-ev">' +
        '<div class="row"><span class="k">Evidence</span><span>' + esc(r.evidence) + '</span></div>' +
        '<div class="row"><span class="k">Expected impact</span><span>' +
          (r.estimatedRiskReduction ? '<span class="delta ' + (r.estimatedRiskReduction > 0 ? 'up' : 'down') + '">Risk ' + (r.estimatedRiskReduction > 0 ? '↓' : '↑') + ' ' + Math.abs(r.estimatedRiskReduction) + '%</span> · ' : '') +
          (r.estimatedCostReduction ? '<span class="delta ' + (r.estimatedCostReduction > 0 ? 'up' : 'down') + '">Cost ' + (r.estimatedCostReduction > 0 ? '↓' : '↑') + ' ' + Math.abs(r.estimatedCostReduction) + '%</span> · ' : '') +
          '<span class="delta ' + (r.estimatedPerformanceImpact >= 0 ? 'up' : 'down') + '">Success ' + fmt.signed(r.estimatedPerformanceImpact, 1) + '%</span></span></div>' +
        '<div class="row"><span class="k">Confidence</span><span>' + Math.round(r.confidence * 100) + '%</span></div>' +
      '</div></div>' +
      '<div class="card-foot"><div class="btn-row">' +
        (applied ? '<span class="tiny muted">' + (r.status === 'applied' ? 'Applied ' + fmt.ago(r.appliedAt) + ' — visible in the audit trail.' : 'Dismissed. Reset the demo to restore it.') + '</span>' :
          '<button class="btn sm" data-act="rec-simulate" data-id="' + r.id + '">Simulate</button>' +
          '<button class="btn sm blue" data-act="rec-apply" data-id="' + r.id + '">Apply</button>' +
          '<div style="flex:1"></div><button class="btn sm ghost" data-act="rec-dismiss" data-id="' + r.id + '">Dismiss</button>') +
      '</div></div></article>';
  }
  ADG.recCard = recCard;

  /* ---------------------------------------------------------- command center */
  V['command-center'] = function () {
    const k = S.kpis(), s = ADG.state;
    const attAll = S.attention();
    const att = attAll.slice(0, 7);
    const fleet = s.fleet;
    const hour = new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' });
    const greet = Number(hour) < 12 ? 'Good morning' : Number(hour) < 17 ? 'Good afternoon' : 'Good evening';
    const trustSeries = fleet.map((f) => f.trust);
    const openRecs = s.recommendations.filter((r) => r.status === 'open').sort((a, b) => a.priority - b.priority);

    const riskCounts = ['low', 'moderate', 'high', 'critical'].map((key) => ({
      key, label: key[0].toUpperCase() + key.slice(1),
      value: s.agents.filter((a) => S.riskBand(a).key === key).length,
      tone: key === 'low' ? 'green' : key === 'moderate' ? 'amber' : 'red'
    }));

    return pageHead(greet + ', ' + ADG.SESSION.name.split(' ')[0],
      'Here’s what needs your attention across your AI workforce. ' + attAll.length + ' items are open, ' +
      k.critical + ' of them critical.',
      '<button class="btn" data-act="demo-panel">Demo controls</button>' +
      '<button class="btn primary" data-act="guard" data-id="' + (S.decision('DEC-84120') && S.decision('DEC-84120').approvalStatus === 'pending' ? 'DEC-84120' : (S.pending()[0] || {}).id || 'DEC-84120') + '">Review the top decision</button>') +

    '<div class="grid g-6">' +
      C.kpi({ label: 'Active agents', value: k.active, act: 'goto', route: '#/agents',
        foot: '<span class="muted">' + s.agents.filter((a) => a.status === 'active').length + ' healthy · ' + k.atRisk + ' at risk</span>' }) +
      C.kpi({ label: 'Enterprise trust', value: k.trust, unit: '/100', act: 'goto', route: '#/trust/overview',
        foot: '<span class="delta ' + (k.trust >= 88 ? 'up' : 'down') + '">' + (k.trust >= 88 ? '▲' : '▼') + ' ' + Math.abs(k.trust - 84) + ' vs 30d</span><span class="muted">volume-weighted</span>' }) +
      C.kpi({ label: 'Policy compliance', value: k.compliance.toFixed(1), unit: '%', act: 'goto', route: '#/governance/policies',
        foot: '<span class="muted">' + fmt.int(k.violations) + ' violations across ' + s.policies.length + ' policies</span>' }) +
      C.kpi({ label: 'AI spend', value: fmt.usd(k.spend, { compact: true }), act: 'goto', route: '#/economics/spend',
        foot: '<span class="delta ' + (k.projected > k.budget ? 'down' : 'up') + '">' + (k.projected > k.budget ? '▲' : '▼') + ' ' + fmt.usd(k.projected, { compact: true }) + ' projected</span>' }) +
      C.kpi({ label: 'Critical issues', value: k.critical, cls: k.critical ? 'is-alert' : '', act: 'goto', route: '#/operations/incidents',
        foot: '<span class="muted">' + S.openIncidents().length + ' incidents open in total</span>' }) +
      C.kpi({ label: 'Human reviews', value: k.reviews, cls: k.reviews ? 'is-warn' : '', act: 'goto', route: '#/decisions/approvals',
        foot: '<span class="muted">' + S.attention().filter((x) => x.key.indexOf('dec-') === 0).length + ' need a decision now</span>' }) +
    '</div>' +

    '<div class="sec"><div class="sec-head"><h2>Needs your attention</h2>' +
      '<span class="sub">Ranked by consequence, not recency</span>' +
      '<div class="right"><button class="btn sm" data-act="goto" data-route="#/decisions/attention">Open the full queue</button></div></div>' +
      (att.length ? '<div class="att">' + att.map(attentionCard).join('') + '</div>'
        : C.empty({ title: 'Nothing needs you right now', body: 'Every agent is inside its guardrails and no decision is waiting on a human.',
            actions: '<button class="btn sm" data-act="demo-panel">Simulate a scenario</button>' })) +
    '</div>' +

    '<div class="sec grid g-side">' +
      '<div class="card"><div class="card-head"><h3>Enterprise trust, 30 days</h3>' +
        '<span class="sub">Weighted by decision volume</span>' +
        '<div class="right">' + C.badge(D.trustBand(k.trust).label, ADG.toneForTrust(k.trust)) + '</div></div>' +
        '<div class="card-pad">' + C.lineChart([{ values: trustSeries, tone: 'blue' }], {
          h: 210, yMin: 78, yMax: 94, yFmt: (v) => Math.round(v), band: [86, 94],
          xLabels: fleet.map((f, i) => (i % 7 === 0 ? (f.day === 0 ? 'today' : f.day + 'd') : '')),
          aria: 'Enterprise trust over 30 days, currently ' + k.trust
        }) +
        '<div class="legend" style="margin-top:10px"><span><i style="background:var(--blue)"></i>Enterprise trust</span>' +
        '<span><i style="background:var(--green);opacity:.25"></i>Target band 86–94</span></div></div></div>' +

      '<div class="grid" style="gap:14px;align-content:start">' +
        '<div class="card"><div class="card-head"><h3>Risk distribution</h3></div>' +
          '<div class="card-pad" style="display:flex;gap:16px;align-items:center">' +
            C.donut(riskCounts.filter((r) => r.value), { size: 128, stroke: 18, center: String(k.atRisk), centerSub: 'at risk' }) +
            '<div style="flex:1;display:grid;gap:7px">' + riskCounts.map((r) =>
              '<button class="btn xs ghost" data-act="goto" data-route="#/trust/matrix" style="justify-content:flex-start;padding-left:0;width:100%">' +
              '<span class="dot" style="color:var(--' + r.tone + ')"></span>' + esc(r.label) +
              '<span class="num" style="margin-left:auto;font-weight:640">' + r.value + '</span></button>').join('') +
            '</div></div></div>' +

        C.ai({ kicker: 'Fleet assessment', confidence: 0.93,
          body: 'Enterprise trust is holding at <b>' + k.trust + '</b>, but the distribution is what matters: ' + k.atRisk +
            ' of ' + k.agents + ' agents carry high or critical risk, and they concentrate in <b>Procurement</b> and <b>Finance</b>. ' +
            'Both are permission-envelope problems rather than model-quality problems — the agents are working around boundaries instead of escalating at them.',
          rows: [['Biggest lever', 'Applying the top three guardrails removes an estimated 43% of fleet risk exposure.'],
                 ['Cost signal', fmt.usd(k.projected - k.spend) + ' of month-over-month growth, ' + Math.round(((k.projected / k.spend) - 1) * 100) + '% of it from retries and frontier-tier over-routing.'],
                 ['Watch', 'Data Quality Agent integrity at 61 is the lowest single dimension in the fleet.']],
          actions: '<button class="btn sm" data-act="goto" data-route="#/insights/recommendations">See recommendations</button>' +
                   '<button class="btn sm" data-act="goto" data-route="#/insights/reports">Executive report</button>'
        }) +
      '</div>' +
    '</div>' +

    '<div class="sec"><div class="sec-head"><h2>Top AI recommendations</h2>' +
      '<span class="sub">Each one is simulated before it is applied</span>' +
      '<div class="right"><button class="btn sm" data-act="goto" data-route="#/insights/recommendations">All ' + openRecs.length + '</button></div></div>' +
      '<div class="grid g-3">' + openRecs.slice(0, 3).map((r, i) => recCard(r, { index: i })).join('') + '</div>' +
    '</div>';
  };

  /* ---------------------------------------------------------- executive mode */
  V['executive'] = function () {
    const k = S.kpis(), s = ADG.state;
    const humanDecisions = 1842 + s.audit.filter((a) => a.actorType === 'human').length;
    const top = S.attention().slice(0, 3);
    const trustSeries = s.fleet.map((f) => f.trust);
    const byDept = {};
    s.agents.forEach((a) => {
      byDept[a.department] = byDept[a.department] || { n: 0, trust: 0, cost: 0, risk: 0 };
      const d = byDept[a.department];
      d.n++; d.trust += S.trust(a); d.cost += a.currentCost; d.risk += S.risk(a);
    });
    const depts = Object.keys(byDept).map((k2) => ({
      label: k2, value: Math.round(byDept[k2].trust / byDept[k2].n),
      cost: byDept[k2].cost, risk: Math.round(byDept[k2].risk / byDept[k2].n), n: byDept[k2].n
    })).sort((a, b) => a.value - b.value);

    return pageHead('AI workforce', 'A single view of whether this organisation can confidently delegate work to its AI agents.',
      '<button class="btn" data-act="goto" data-route="#/insights/reports">Full report</button>' +
      '<button class="btn primary" data-act="set-mode" data-mode="operator">Switch to Operator</button>') +

    '<div class="stat-strip">' +
      '<div><div class="l">AI workforce</div><div class="v">' + k.agents + '</div><div class="s">agents in production</div></div>' +
      '<div><div class="l">Enterprise trust</div><div class="v" style="color:var(--' + ADG.toneForTrust(k.trust) + ')">' + k.trust + '<span style="font-size:13px;color:var(--ink-4)">/100</span></div><div class="s">' + D.trustBand(k.trust).label + '</div></div>' +
      '<div><div class="l">Policy compliance</div><div class="v">' + k.compliance.toFixed(1) + '%</div><div class="s">across ' + s.policies.length + ' policies</div></div>' +
      '<div><div class="l">Monthly spend</div><div class="v">' + fmt.usd(k.spend, { compact: true }) + '</div><div class="s">' + fmt.usd(k.projected, { compact: true }) + ' projected</div></div>' +
      '<div><div class="l">Critical issues</div><div class="v" style="color:var(--' + (k.critical ? 'red' : 'green') + ')">' + k.critical + '</div><div class="s">need a decision this week</div></div>' +
      '<div><div class="l">Human decisions</div><div class="v">' + fmt.int(humanDecisions) + '</div><div class="s">this quarter</div></div>' +
    '</div>' +

    '<div class="sec">' + C.ai({ kicker: 'Executive summary', confidence: 0.94,
      body: 'The AI workforce is <b>safe to keep operating</b> and is not safe to expand without two specific fixes. ' +
        k.agents + ' agents handled ' + fmt.int(s.agents.reduce((x, a) => x + a.taskCount, 0)) + ' tasks at ' + k.compliance.toFixed(1) +
        '% policy compliance, and enterprise trust is up ' + (k.trust - 84) + ' points over 30 days. ' +
        'The risk is concentrated, not diffuse: two agents — Procurement and Finance Operations — account for both critical issues and most of the open policy exposure. ' +
        'Neither is a model-capability problem. Both are cases of an agent granted more autonomous authority than its behaviour justifies, which is a governance decision rather than an engineering one.',
      rows: [['Recommend', 'Approve the three guardrail changes below. Estimated 43% reduction in fleet risk exposure at a 0.4-point cost to throughput.'],
             ['Do not', 'Expand agent autonomy in Procurement until the permission envelope is corrected.'],
             ['Financial', fmt.usd(k.projected - k.spend) + ' of projected month-over-month growth; roughly 31% of current spend is recoverable from retries and model over-routing.']]
    }) + '</div>' +

    '<div class="sec grid g-side">' +
      '<div class="card"><div class="card-head"><h3>Enterprise trust</h3><span class="sub">30 days, weighted by decision volume</span></div>' +
        '<div class="card-pad">' + C.lineChart([{ values: trustSeries, tone: 'blue' }],
          { h: 220, yMin: 78, yMax: 94, yFmt: (v) => Math.round(v), band: [86, 94],
            xLabels: s.fleet.map((f, i) => (i % 7 === 0 ? (f.day === 0 ? 'today' : f.day + 'd') : '')) }) + '</div></div>' +
      '<div class="card"><div class="card-head"><h3>Trust by department</h3></div><div class="card-pad">' +
        C.barChart(depts.slice(0, 8).map((d) => ({
          id: d.label, label: d.label, value: d.value, note: d.n + ' agents',
          tone: d.value >= 88 ? 'green' : d.value >= 80 ? 'blue' : d.value >= 70 ? 'amber' : 'red'
        })), { fmt: (v) => v + '/100', max: 100 }) + '</div></div>' +
    '</div>' +

    '<div class="sec"><div class="sec-head"><h2>Leadership attention</h2><span class="sub">Three decisions only you can make</span></div>' +
      '<div class="grid" style="gap:10px">' + top.map((it, i) =>
        '<article class="card"><div class="card-pad" style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">' +
        '<div style="width:30px;height:30px;border-radius:8px;background:var(--ink);color:#fff;display:grid;place-items:center;font-weight:650;font-size:13px;flex:none">' + (i + 1) + '</div>' +
        '<div style="flex:1;min-width:220px"><b style="font-size:14px">' + esc(it.title) + ' — ' + esc(it.kind.toLowerCase()) + '</b>' +
        '<p style="font-size:12.5px;color:var(--ink-2);margin-top:4px;line-height:1.55">' + esc(it.desc) + ' ' + esc(it.why || '') + '</p></div>' +
        '<div class="btn-row">' + it.actions.map((a) => '<button class="btn sm ' + (a.primary ? 'primary' : '') + '" data-act="' + a.act + '"' +
          (a.id ? ' data-id="' + esc(a.id) + '"' : '') + (a.route ? ' data-route="' + esc(a.route) + '"' : '') + '>' + esc(a.label) + '</button>').join('') +
        '</div></div></article>').join('') + '</div></div>';
  };

  /* ---------------------------------------------------------- agent directory */
  const FILTERS = [
    { id: 'all', label: 'All', fn: () => true },
    { id: 'healthy', label: 'Healthy', fn: (a) => S.health(a) >= 92 && S.riskBand(a).key === 'low' },
    { id: 'atrisk', label: 'At risk', fn: (a) => S.riskBand(a).key === 'high' },
    { id: 'critical', label: 'Critical', fn: (a) => a.status === 'critical' || S.riskBand(a).key === 'critical' },
    { id: 'lowtrust', label: 'Low trust', fn: (a) => S.trust(a) < 80 },
    { id: 'highcost', label: 'High cost', fn: (a) => a.monthlyProjectedCost > a.budget },
    { id: 'violation', label: 'Policy violation', fn: (a) => (a.openViolations || 0) > 0 },
    { id: 'approval', label: 'Approval required', fn: (a) => S.pending().some((d) => d.agentId === a.id) }
  ];
  const VIEW_MAP = { 'at-risk': 'atrisk', 'critical': 'critical', 'changed': 'changed' };

  ADG.actions['tbl-q'] = (d) => { ADG.ui.tbl.q = d.value; ADG.ui.tbl.page = 1; ADG.render(); };
  ADG.actions['tbl-filter'] = (d) => { ADG.ui.tbl.filter = d.id; ADG.ui.tbl.page = 1; ADG.render(); };
  ADG.actions['tbl-dept'] = (d) => { ADG.ui.tbl.dept = d.value; ADG.ui.tbl.page = 1; ADG.render(); };
  ADG.actions['tbl-sort'] = (d) => {
    const t = ADG.ui.tbl;
    if (t.sort === d.key) t.dir = t.dir === 'asc' ? 'desc' : 'asc';
    else { t.sort = d.key; t.dir = d.key === 'name' ? 'asc' : 'desc'; }
    ADG.render();
  };
  ADG.actions['tbl-page'] = (d) => { ADG.ui.tbl.page = Number(d.p); ADG.render(); };
  ADG.actions['tbl-col'] = (d) => { ADG.state.cols[d.key] = !ADG.state.cols[d.key]; ADG.refreshOverlay(); ADG.render(); };
  ADG.actions['tbl-view'] = (d) => {
    const v = ADG.state.savedViews.find((x) => x.id === d.id);
    Object.assign(ADG.ui.tbl, { filter: v.filter, q: v.q, dept: v.dept, page: 1 });
    ADG.go('#/agents'); ADG.render();
    ADG.toast('info', 'View applied', '“' + v.name + '” — ' + filtered().length + ' agents match.');
  };
  ADG.actions['tbl-save-view'] = function () {
    const t = ADG.ui.tbl;
    const name = 'View ' + (ADG.state.savedViews.length + 1) + ' · ' +
      (FILTERS.find((f) => f.id === t.filter) || {}).label + (t.dept !== 'all' ? ' · ' + t.dept : '');
    ADG.commit({
      mutate(s) { s.savedViews.push({ id: 'sv-' + Date.now(), name, filter: t.filter, q: t.q, dept: t.dept }); },
      toast: { type: 'success', title: 'View saved', body: '“' + name + '” is now in your saved views.' }
    });
  };
  ADG.actions['tbl-cols'] = function () {
    const COLS = [['status', 'Status'], ['trust', 'Trust'], ['health', 'Health'], ['risk', 'Risk'],
                  ['success', 'Success'], ['cost', 'Cost'], ['tasks', 'Tasks'], ['last', 'Last active']];
    ADG.openModal({
      title: 'Column visibility', sub: 'Agent and its owner always stay visible.',
      body: '<div class="grid" style="gap:2px">' + COLS.map(([k, l]) =>
        '<button class="sb-item" data-act="tbl-col" data-key="' + k + '" role="switch" aria-checked="' + !!ADG.state.cols[k] + '">' +
        '<span>' + esc(l) + '</span><span class="switch" aria-hidden="true" ' + (ADG.state.cols[k] ? 'aria-checked="true"' : '') +
        ' style="margin-left:auto;pointer-events:none"><i style="' + (ADG.state.cols[k] ? 'background:var(--blue)' : '') + '"></i></span></button>').join('') + '</div>',
      foot: '<div style="flex:1"></div><button class="btn primary" data-act="close-overlay">Done</button>'
    });
  };

  function filtered() {
    const t = ADG.ui.tbl;
    const f = FILTERS.find((x) => x.id === t.filter) || FILTERS[0];
    let list = ADG.state.agents.filter((a) => {
      if (t.filter === 'changed') { if (Math.abs(a.trustDelta7d || 0) < 3) return false; }
      else if (!f.fn(a)) return false;
      if (t.dept !== 'all' && a.department !== t.dept) return false;
      if (t.q) {
        const q = t.q.toLowerCase();
        if ((a.name + ' ' + a.department + ' ' + a.owner + ' ' + a.description).toLowerCase().indexOf(q) === -1) return false;
      }
      return true;
    });
    const key = t.sort, dir = t.dir === 'asc' ? 1 : -1;
    const val = (a) => ({
      name: a.name.toLowerCase(), status: a.status, trust: S.trust(a), health: S.health(a),
      risk: S.risk(a), success: a.successRate, cost: a.currentCost, tasks: a.taskCount, last: a.lastActive || ''
    })[key];
    list.sort((a, b) => { const x = val(a), y = val(b); return x < y ? -dir : x > y ? dir : 0; });
    return list;
  }

  V['agents'] = function (r) {
    if (r.parts[1]) return agentDetail(r);
    const t = ADG.ui.tbl;
    if (r.query.view && VIEW_MAP[r.query.view] && t.filter !== VIEW_MAP[r.query.view]) {
      t.filter = VIEW_MAP[r.query.view]; t.page = 1;
    }
    const list = filtered();
    const per = t.per, pages = Math.max(1, Math.ceil(list.length / per));
    if (t.page > pages) t.page = pages;
    const rows = list.slice((t.page - 1) * per, t.page * per);
    const depts = Array.from(new Set(ADG.state.agents.map((a) => a.department))).sort();
    const cols = ADG.state.cols;
    const th = (key, label, cls) => '<th class="' + (cls || '') + ' sortable ' + (t.sort === key ? 'is-sorted' : '') + '" data-act="tbl-sort" data-key="' + key +
      '" tabindex="0" role="button" aria-sort="' + (t.sort === key ? (t.dir === 'asc' ? 'ascending' : 'descending') : 'none') + '">' +
      esc(label) + '<span class="arrow" aria-hidden="true">' + (t.sort === key ? (t.dir === 'asc' ? '▲' : '▼') : '↕') + '</span></th>';

    const VIEW_TITLES = { 'at-risk': ['Agents at risk', 'High-risk agents — trusted or not, their permission envelope and open issues make them consequential.'],
      'critical': ['Critical agents', 'Agents needing intervention now.'],
      'changed': ['Recently changed', 'Agents whose trust moved by 3 points or more in the last 7 days.'] };
    const head = VIEW_TITLES[r.query.view] || ['All agents', 'Every registered agent, with the four numbers that decide whether you can leave it alone.'];

    return pageHead(head[0], head[1],
      '<button class="btn" data-act="tbl-cols">Columns</button>' +
      '<button class="btn" data-act="tbl-save-view">Save view</button>' +
      '<button class="btn primary" data-act="goto" data-route="#/trust/matrix">Risk matrix</button>') +

    '<div class="card">' +
      '<div class="toolbar">' +
        '<div class="searchfield" style="width:250px">' +
          '<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="9" r="6.5"/><path d="m14 14 4 4"/></svg>' +
          '<input class="input" id="agent-q" data-input="tbl-q" value="' + esc(t.q) + '" placeholder="Search agents, owners, departments" aria-label="Search agents">' +
        '</div>' +
        '<select class="select" style="width:170px" data-change="tbl-dept" aria-label="Filter by department">' +
          '<option value="all">All departments</option>' +
          depts.map((d) => '<option value="' + esc(d) + '"' + (t.dept === d ? ' selected' : '') + '>' + esc(d) + '</option>').join('') +
        '</select>' +
        '<div class="chipbar">' + FILTERS.map((f) => {
          const n = ADG.state.agents.filter(f.fn).length;
          return '<button class="chip ' + (t.filter === f.id ? 'is-on' : '') + '" data-act="tbl-filter" data-id="' + f.id + '" aria-pressed="' + (t.filter === f.id) + '">' +
            esc(f.label) + '<span class="n">' + n + '</span></button>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="toolbar" style="padding-top:8px;padding-bottom:8px">' +
        '<span class="tiny muted">Saved views</span>' +
        '<div class="chipbar">' + ADG.state.savedViews.map((v) =>
          '<button class="chip" data-act="tbl-view" data-id="' + v.id + '">' + esc(v.name) + '</button>').join('') + '</div>' +
        '<span class="tiny muted" style="margin-left:auto">' + list.length + ' of ' + ADG.state.agents.length + ' agents</span>' +
      '</div>' +
      (rows.length ? '<div class="tablewrap collapse"><table class="tbl"><thead><tr>' +
        th('name', 'Agent') +
        (cols.status ? th('status', 'Status') : '') +
        (cols.trust ? th('trust', 'Trust', 'num') : '') +
        (cols.health ? th('health', 'Health', 'num') : '') +
        (cols.risk ? th('risk', 'Risk') : '') +
        (cols.success ? th('success', 'Success', 'num') : '') +
        (cols.cost ? th('cost', 'Cost', 'num') : '') +
        (cols.tasks ? th('tasks', 'Tasks', 'num') : '') +
        (cols.last ? '<th>Last active</th>' : '') +
        '</tr></thead><tbody>' + rows.map((a) => {
          const hist = ADG.state.history[a.id].map((h) => h.value);
          return '<tr data-act="open-agent" data-id="' + a.id + '" tabindex="0">' +
            '<td><div class="cell-agent"><span class="ini" aria-hidden="true">' + esc(C.initials(a.name)) + '</span>' +
              '<span><b>' + esc(a.name) + '</b><span>' + esc(a.department) + ' · ' + esc(a.owner) + '</span></span></div></td>' +
            (cols.status ? '<td>' + C.status(a.status) + '</td>' : '') +
            (cols.trust ? '<td class="num"><div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">' +
              C.spark(hist.slice(-14), { w: 52, h: 18, tone: ADG.toneForTrust(S.trust(a)) }) + C.trustCell(a) + '</div></td>' : '') +
            (cols.health ? '<td class="num">' + C.healthCell(a) + '</td>' : '') +
            (cols.risk ? '<td>' + C.riskBadge(a) + '</td>' : '') +
            (cols.success ? '<td class="num">' + a.successRate.toFixed(1) + '%</td>' : '') +
            (cols.cost ? '<td class="num">' + fmt.usd(a.currentCost) +
              (a.monthlyProjectedCost > a.budget ? ' <span class="delta down" title="Projected over budget">▲</span>' : '') + '</td>' : '') +
            (cols.tasks ? '<td class="num">' + fmt.int(a.taskCount) + '</td>' : '') +
            (cols.last ? '<td class="muted tiny nowrap">' + esc(a.lastActive ? fmt.ago(a.lastActive) : (a.status === 'active' ? 'now' : fmt.ago(ADG.state.decisions.filter((d) => d.agentId === a.id).map((d) => d.timestamp).sort().pop() || new Date().toISOString()))) + '</td>' : '') +
            '</tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="cardlist">' + rows.map((a) =>
          '<button class="minicard" data-act="open-agent" data-id="' + a.id + '" style="text-align:left">' +
          '<div class="mc-top"><span class="ini" style="width:22px;height:22px;border-radius:5px;display:grid;place-items:center;font-size:9px;font-weight:660;background:var(--surface-3);border:1px solid var(--border)">' + esc(C.initials(a.name)) + '</span>' +
          '<b style="font-size:12.5px">' + esc(a.name) + '</b>' + '</div>' +
          '<div style="margin-bottom:8px">' + C.status(a.status) + ' ' + C.riskBadge(a) + '</div>' +
          '<div class="mc-grid"><div><div class="l">Trust</div><div class="v">' + S.trust(a) + '</div></div>' +
          '<div><div class="l">Health</div><div class="v">' + S.health(a) + '</div></div>' +
          '<div><div class="l">Cost</div><div class="v">' + fmt.usd(a.currentCost, { compact: true }) + '</div></div></div></button>').join('') + '</div>' +
        '<div class="pager"><span>Showing ' + ((t.page - 1) * per + 1) + '–' + Math.min(t.page * per, list.length) + ' of ' + list.length + '</span>' +
          '<div class="right">' +
          '<button class="btn xs" data-act="tbl-page" data-p="' + Math.max(1, t.page - 1) + '"' + (t.page === 1 ? ' disabled' : '') + '>Previous</button>' +
          Array.from({ length: pages }, (_, i) => i + 1).filter((p) => pages <= 7 || Math.abs(p - t.page) < 3 || p === 1 || p === pages)
            .map((p) => '<button class="btn xs ' + (p === t.page ? 'primary' : '') + '" data-act="tbl-page" data-p="' + p + '">' + p + '</button>').join('') +
          '<button class="btn xs" data-act="tbl-page" data-p="' + Math.min(pages, t.page + 1) + '"' + (t.page === pages ? ' disabled' : '') + '>Next</button>' +
          '</div></div>'
        : C.empty({ title: 'No agents match these filters',
            body: 'Try clearing the search, or widening the filter to All.',
            actions: '<button class="btn sm" data-act="tbl-filter" data-id="all">Clear filters</button>' })) +
    '</div>';
  };

  /* ---------------------------------------------------------- agent detail */
  ADG.ui.tab = 'overview';
  ADG.actions['agent-tab'] = (d) => { ADG.ui.tab = d.tab; ADG.render(); };

  function agentDetail(r) {
    const a = S.agent(r.parts[1]);
    if (!a) return C.empty({ title: 'Agent not found', body: 'This agent is not registered in the fleet.',
      actions: '<button class="btn sm" data-act="goto" data-route="#/agents">Back to all agents</button>' });
    const tab = ADG.ui.tab;
    const t = S.trust(a), h = S.health(a), risk = S.riskBand(a);
    const TABS = [['overview', 'Overview'], ['activity', 'Activity'], ['trust', 'Trust'],
                  ['permissions', 'Permissions'], ['cost', 'Cost'], ['policies', 'Policies'], ['audit', 'Audit']];
    const recs = S.recsFor(a.id);

    return '<div class="page-head">' +
      '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">' +
        '<div style="flex:1;min-width:280px">' +
          '<div class="eyebrow">' + esc(a.department) + ' · owned by ' + esc(a.owner) + '</div>' +
          '<h1>' + esc(a.name) + '</h1>' +
          '<p class="sub">' + esc(a.description) + '</p>' +
          '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px">' + C.status(a.status) + C.riskBadge(a) +
            C.badge(D.MODELS[a.model].name, 'blue', { sq: true }) + C.badge('v' + a.version, null, { sq: true }) +
            (a.openViolations ? C.badge(a.openViolations + ' open violations', 'red', { glyph: '!' }) : '') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:16px;align-items:center">' +
          '<button style="border:0;background:none;cursor:pointer;padding:0" data-act="trust-panel" data-id="' + a.id + '" aria-label="Open the trust breakdown">' +
            C.ring(t, { size: 92, stroke: 8, cap: 'Trust', cls: 'sm' }) + '</button>' +
          C.ring(h, { size: 92, stroke: 8, cap: 'Health', cls: 'sm', tone: ADG.toneForHealth(h) }) +
        '</div>' +
        '<div class="btn-row"><button class="btn" data-act="sim-agent" data-id="' + a.id + '">Simulate change</button>' +
          (recs.length ? '<button class="btn primary" data-act="rec-simulate" data-id="' + recs[0].id + '">Apply guardrail</button>' : '') + '</div>' +
      '</div></div>' +

      '<div class="tabs" role="tablist">' + TABS.map(([k, l]) =>
        '<button role="tab" aria-selected="' + (tab === k) + '" class="' + (tab === k ? 'is-on' : '') + '" data-act="agent-tab" data-tab="' + k + '">' + esc(l) + '</button>').join('') + '</div>' +
      '<div class="sec" style="margin-top:18px">' + (TAB_RENDER[tab] || TAB_RENDER.overview)(a) + '</div>';
  }

  ADG.actions['sim-agent'] = (d) => { ADG.state.simSeed = { agentId: d.id }; ADG.go('#/decisions/simulator'); };

  const TAB_RENDER = {};

  TAB_RENDER.overview = function (a) {
    const recs = S.recsFor(a.id);
    const inc = S.incidentsFor(a).length ? [] : [];
    const openInc = ADG.state.incidents.filter((i) => i.agentId === a.id && i.status !== 'resolved');
    const pending = S.pending().filter((d) => d.agentId === a.id);
    return '<div class="grid g-side">' +
      '<div class="grid" style="gap:14px;align-content:start">' +
        '<div class="card"><div class="card-head"><h3>Current mission</h3>' +
          '<div class="right">' + C.status(a.status) + '</div></div><div class="card-pad">' +
          '<p style="font-size:14px;line-height:1.5">' + esc(a.mission) + '</p>' +
          '<div class="rule"></div>' +
          '<div class="kv-list">' +
            '<div class="kv-row"><span class="k">Current action</span><span class="v">' + esc(a.currentAction) + '</span></div>' +
            '<div class="kv-row"><span class="k">Next action</span><span class="v">' + esc(a.nextAction) + '</span></div>' +
          '</div></div></div>' +

        '<div class="card"><div class="card-head"><h3>Authority</h3><span class="sub">What this agent may do without asking</span>' +
          '<div class="right"><button class="btn xs" data-act="agent-tab" data-tab="permissions">Edit permissions</button></div></div>' +
          '<div class="card-pad grid g-3" style="gap:18px">' +
            '<div><div class="eyebrow" style="color:var(--green)">Can</div><ul class="auth-list can">' +
              a.can.map((x) => '<li><span class="m">✓</span><span>' + esc(x) + '</span></li>').join('') + '</ul></div>' +
            '<div><div class="eyebrow" style="color:var(--amber)">Requires approval</div><ul class="auth-list appr">' +
              a.needsApproval.map((x) => '<li><span class="m">⏸</span><span>' + esc(x) + '</span></li>').join('') + '</ul></div>' +
            '<div><div class="eyebrow" style="color:var(--red)">Cannot</div><ul class="auth-list cannot">' +
              a.cannot.map((x) => '<li><span class="m">✕</span><span>' + esc(x) + '</span></li>').join('') + '</ul></div>' +
          '</div></div>' +

        (pending.length ? '<div class="card" style="border-color:var(--amber-br)"><div class="card-head" style="background:var(--amber-bg)">' +
          '<h3>Paused at the human boundary</h3><div class="right">' + C.badge(pending.length + ' waiting', 'amber', { glyph: '⏸' }) + '</div></div>' +
          '<div class="card-pad grid" style="gap:8px">' + pending.map((d) =>
            '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
            '<div style="flex:1;min-width:200px"><b style="font-size:12.5px">' + esc(d.action) + '</b>' +
            '<div class="tiny muted">' + esc(d.id) + ' · ' + fmt.ago(d.timestamp) + ' · ' + esc(d.policyLabel) + '</div></div>' +
            '<button class="btn sm primary" data-act="guard" data-id="' + d.id + '">Review</button></div>').join('') + '</div></div>' : '') +

        (openInc.length ? '<div class="card"><div class="card-head"><h3>Open incidents</h3></div><div class="card-pad grid" style="gap:8px">' +
          openInc.map((i) => '<button class="minicard" data-act="open-incident" data-id="' + i.id + '" style="text-align:left">' +
            '<div class="mc-top">' + C.badge(i.severity === 'critical' ? 'Critical' : 'High', 'red', { glyph: '△' }) +
            C.status(i.status) + '<span class="tiny muted" style="margin-left:auto">' + fmt.ago(i.timestamp) + '</span></div>' +
            '<b style="font-size:12.5px">' + esc(i.title) + '</b>' +
            '<p class="tiny muted" style="margin-top:3px">' + esc(i.impact) + '</p></button>').join('') + '</div></div>' : '') +
      '</div>' +

      '<div class="grid" style="gap:14px;align-content:start">' +
        '<div class="card"><div class="card-head"><h3>Trust dimensions</h3>' +
          '<div class="right"><button class="btn xs" data-act="trust-panel" data-id="' + a.id + '">Explain</button></div></div>' +
          '<div class="card-pad">' + C.radar(a.dims, { size: 250 }) + '</div></div>' +
        '<div class="card"><div class="card-head"><h3>At a glance</h3></div><div class="card-pad"><div class="kv-list">' +
          '<div class="kv-row"><span class="k">Model</span><span class="v">' + esc(D.MODELS[a.model].name) + '</span></div>' +
          '<div class="kv-row"><span class="k">Version</span><span class="v">' + esc(a.version) + '</span></div>' +
          '<div class="kv-row"><span class="k">In production</span><span class="v">since ' + esc(fmt.date(a.createdDate)) + '</span></div>' +
          '<div class="kv-row"><span class="k">Lifetime tasks</span><span class="v num">' + fmt.int(a.taskCount) + '</span></div>' +
          '<div class="kv-row"><span class="k">Success rate</span><span class="v num">' + a.successRate.toFixed(1) + '%</span></div>' +
          '<div class="kv-row"><span class="k">Autonomous limit</span><span class="v num">' + (a.autonomousLimit ? fmt.usd(a.autonomousLimit) : 'None') + '</span></div>' +
          '<div class="kv-row"><span class="k">Exposure index</span><span class="v num">' + D.exposureOf(a) + '/100</span></div>' +
          '<div class="kv-row"><span class="k">Spend / budget</span><span class="v num">' + fmt.usd(a.currentCost) + ' / ' + fmt.usd(a.budget) + '</span></div>' +
        '</div></div></div>' +
        (recs.length ? recCard(recs[0]) : '') +
      '</div></div>';
  };

  TAB_RENDER.activity = function (a) {
    const decs = S.decisionsFor(a.id).sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp));
    const live = decs.find((d) => d.timeline) || decs[0];
    return '<div class="grid g-side">' +
      '<div class="card"><div class="card-head"><h3>' + (live && live.timeline ? 'Live decision timeline' : 'Recent decisions') + '</h3>' +
        '<span class="sub">' + (live && live.timeline ? 'Observable execution events — tool calls, results and policy evaluations' : 'Most recent first') + '</span>' +
        (live && live.timeline ? '<div class="right">' + C.status(live.status) + '</div>' : '') + '</div>' +
        '<div class="card-pad">' +
        (live && live.timeline ?
          '<div style="margin-bottom:12px"><b style="font-size:13px">' + esc(live.action) + '</b>' +
          '<div class="tiny muted">' + esc(live.id) + ' · ' + fmt.dateTime(live.timestamp) + '</div></div>' +
          C.timeline(live.timeline, 'ag-' + a.id) +
          '<p class="tiny muted" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">' +
          'This trace shows what the agent did, not what it thought. Every row is an observable event with its tool, result and the policy evaluated against it.</p>'
          : C.empty({ title: 'No step-level trace retained', body: 'This agent has not crossed a policy boundary recently, so only summary records are kept.' })) +
        '</div></div>' +
      '<div class="card"><div class="card-head"><h3>Decision history</h3><span class="sub">' + decs.length + ' records</span></div>' +
        '<div class="scroll-y" style="max-height:640px">' + decs.slice(0, 30).map((d) =>
          '<button class="notif" data-act="open-decision" data-id="' + d.id + '" style="border-bottom:1px solid var(--border)">' +
          '<span class="nd" style="background:var(--' + (d.status === 'blocked' || d.status === 'rejected' ? 'red' : d.status === 'awaiting-approval' ? 'amber' : 'green') + ')"></span>' +
          '<span><b>' + esc(d.action) + '</b>' +
          '<p>' + esc(d.id) + (d.amount ? ' · ' + fmt.usd(d.amount) : '') + ' · ' + esc(d.policyLabel) + '</p>' +
          '<time>' + esc(ADG.STATUS[d.status] ? ADG.STATUS[d.status].label : d.status) + ' · ' + fmt.ago(d.timestamp) + '</time></span></button>').join('') +
        '</div></div></div>';
  };

  TAB_RENDER.trust = function (a) {
    const t = S.trust(a);
    const rows = ADG.contributions(a);
    const hist = ADG.state.history[a.id];
    return '<div class="grid g-side">' +
      '<div class="grid" style="gap:14px;align-content:start">' +
        '<div class="card"><div class="card-head"><h3>Trust radar</h3><span class="sub">Select a dimension for its evidence</span>' +
          '<div class="right">' + C.badge(D.trustBand(t).label, ADG.toneForTrust(t)) + '</div></div>' +
          '<div class="card-pad" style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">' +
            '<div style="flex:1;min-width:250px">' + C.radar(a.dims, { size: 280 }) + '</div>' +
            '<div style="flex:1;min-width:230px;display:grid;gap:10px">' + D.TRUST_DIMS.map((k) =>
              '<button style="border:0;background:none;padding:0;cursor:pointer;text-align:left;width:100%" data-act="trust-dim" data-id="' + a.id + '" data-dim="' + k + '">' +
              C.meterRow(D.TRUST_WEIGHTS[k].label, a.dims[k],
                a.dims[k] >= 88 ? 'green' : a.dims[k] >= 75 ? 'blue' : a.dims[k] >= 60 ? 'amber' : 'red', a.dims[k]) + '</button>').join('') +
            '</div></div></div>' +
        '<div class="card"><div class="card-head"><h3>Trust history, 30 days</h3>' +
          '<div class="right"><button class="btn xs" data-act="goto" data-route="#/trust/history">Open trust history</button></div></div>' +
          '<div class="card-pad">' + C.lineChart([{ values: hist.map((h) => h.value), tone: ADG.toneForTrust(t),
            marks: hist.map((h) => h.events && h.events.length) }], {
            h: 200, yFmt: (v) => Math.round(v), xLabels: hist.map((h, i) => (i % 7 === 0 ? (h.day <= 0 ? 'today' : h.day + 'd') : '')) }) +
          '<p class="tiny muted" style="margin-top:8px">Red markers are days where a causal event moved the score. Open Trust History to inspect them.</p>' +
          '</div></div>' +
      '</div>' +
      '<div class="grid" style="gap:14px;align-content:start">' +
        '<div class="card"><div class="card-head"><h3>Why ' + t + '?</h3></div><div class="card-pad">' +
          rows.map((r) => '<div class="contrib ' + (r.delta > 0 ? 'pos' : 'neg') + '">' +
            '<span class="amt">' + (r.delta > 0 ? '+' : '−') + Math.abs(r.delta).toFixed(1) + '</span>' +
            '<span class="txt">' + esc(r.text) + '</span></div>').join('') +
          '<div class="btn-row" style="margin-top:12px"><button class="btn sm" data-act="trust-panel" data-id="' + a.id + '">Full breakdown</button></div>' +
        '</div></div>' +
        (S.recsFor(a.id).length ? recCard(S.recsFor(a.id)[0]) : '') +
      '</div></div>';
  };

  TAB_RENDER.permissions = function (a) {
    const draft = ADG.ui.permDraft && ADG.ui.permDraft.agentId === a.id ? ADG.ui.permDraft.perms : null;
    const dirty = !!draft;
    const sim = dirty ? ADG.simulate(a, { perm: diffPerms(a.permissions, draft) }) : null;
    return '<div class="grid g-side">' +
      '<div class="card"><div class="card-head"><h3>Permission manager</h3>' +
        '<span class="sub">Every capability carries an impact weight — granting it widens the exposure index</span>' +
        '<div class="right">' + (dirty ? C.badge('Unsaved changes', 'purple', { glyph: '◇' }) : C.badge('Live configuration', 'green', { glyph: '✓' })) + '</div></div>' +
        '<div class="card-pad">' +
          '<div class="legend" style="margin-bottom:6px">' +
            '<span><i style="background:var(--green)"></i>Allowed — the agent acts alone</span>' +
            '<span><i style="background:var(--amber)"></i>Approval required — pauses for a human</span>' +
            '<span><i style="background:var(--red)"></i>Blocked — refused at the permission layer</span></div>' +
          C.permMatrix(a, { editable: true, draft, act: 'perm-draft' }) +
        '</div>' +
        (dirty ? '<div class="card-foot" style="display:flex;gap:8px;align-items:center">' +
          '<span class="tiny">Trust <b>' + sim.before.trust + '</b> → <b style="color:var(--' + ADG.toneForTrust(sim.after.trust) + ')">' + sim.after.trust + '</b>' +
          ' · Exposure <b>' + sim.before.exposure + '</b> → <b>' + sim.after.exposure + '</b></span>' +
          '<div style="flex:1"></div>' +
          '<button class="btn sm" data-act="perm-reset" data-id="' + a.id + '">Discard</button>' +
          '<button class="btn sm blue" data-act="perm-save" data-id="' + a.id + '">Apply permission changes</button></div>' : '') +
      '</div>' +
      '<div class="grid" style="gap:14px;align-content:start">' +
        '<div class="card"><div class="card-head"><h3>Exposure</h3></div><div class="card-pad" style="text-align:center">' +
          C.ring(dirty ? sim.after.exposure : D.exposureOf(a), { size: 128, stroke: 11, cap: 'Exposure',
            tone: (dirty ? sim.after.exposure : D.exposureOf(a)) < 35 ? 'green' : (dirty ? sim.after.exposure : D.exposureOf(a)) < 60 ? 'amber' : 'red' }) +
          '<p class="tiny muted" style="margin-top:12px;text-align:left">The share of total possible capability impact this agent currently holds, blended with its autonomous value limit of <b>' +
          (a.autonomousLimit ? fmt.usd(a.autonomousLimit) : 'zero') + '</b>. Exposure feeds directly into the risk index.</p>' +
        '</div></div>' +
        '<div class="card"><div class="card-head"><h3>Autonomous limit</h3></div><div class="card-pad">' +
          '<div class="kpi-val" style="font-size:24px">' + (a.autonomousLimit ? fmt.usd(a.autonomousLimit) : 'None') + '</div>' +
          '<p class="tiny muted" style="margin-top:6px">The largest value this agent may commit without a named human approver.</p>' +
          '<div class="btn-row" style="margin-top:10px"><button class="btn sm" data-act="sim-agent" data-id="' + a.id + '">Change in simulator</button></div>' +
        '</div></div>' +
      '</div></div>';
  };

  function diffPerms(base, draft) {
    const out = {};
    ['data', 'tools', 'actions'].forEach((g) => Object.keys(base[g]).forEach((k) => {
      if (draft[g][k] !== base[g][k]) out[g + '::' + k] = draft[g][k];
    }));
    return out;
  }
  ADG.actions['perm-draft'] = function (d) {
    const a = S.agent(d.agent);
    if (!ADG.ui.permDraft || ADG.ui.permDraft.agentId !== a.id) {
      ADG.ui.permDraft = { agentId: a.id, perms: JSON.parse(JSON.stringify(a.permissions)) };
    }
    const [g, k] = d.path.split('::');
    ADG.ui.permDraft.perms[g][k] = d.level;
    if (!Object.keys(diffPerms(a.permissions, ADG.ui.permDraft.perms)).length) ADG.ui.permDraft = null;
    ADG.render();
  };
  ADG.actions['perm-reset'] = () => { ADG.ui.permDraft = null; ADG.render(); ADG.toast('info', 'Changes discarded', 'The live permission configuration is unchanged.'); };
  ADG.actions['perm-save'] = function (d) {
    const a = S.agent(d.id);
    const draft = ADG.ui.permDraft.perms;
    const diff = diffPerms(a.permissions, draft);
    const sim = ADG.simulate(a, { perm: diff });
    ADG.confirm({
      title: 'Apply ' + Object.keys(diff).length + ' permission change' + (Object.keys(diff).length > 1 ? 's' : '') + '?',
      tone: 'blue', confirmLabel: 'Apply changes',
      body: Object.keys(diff).map((p) => '<b>' + esc(p.split('::')[1]) + '</b> → ' + esc(ADG.PERM_LABEL[diff[p]])).join('<br>') +
        '<br><br>Trust moves <b>' + sim.before.trust + ' → ' + sim.after.trust + '</b> and exposure <b>' + sim.before.exposure + ' → ' + sim.after.exposure + '</b>.',
      onConfirm() {
        ADG.commit({
          mutate(s) {
            const ag = s.agents.find((x) => x.id === a.id);
            ag.permissions = JSON.parse(JSON.stringify(draft));
            ag.dims = Object.assign({}, sim.after.dims);
            ag.successRate = sim.after.success; ag.health.completion = sim.after.success;
            ag.tools = Object.keys(ag.permissions.tools).filter((t) => ag.permissions.tools[t] !== 'block');
            ag.trustDelta7d = sim.after.trust - sim.before.trust;
          },
          audit: { agentId: a.id, event: 'Permissions changed', target: a.name, category: 'permission',
            detail: Object.keys(diff).map((p) => p.split('::')[1] + ' → ' + ADG.PERM_LABEL[diff[p]]).join('; ') +
              '. Trust ' + sim.before.trust + ' → ' + sim.after.trust + '.' },
          toast: { type: 'success', title: 'Permissions updated',
            body: a.name + ': trust ' + sim.before.trust + ' → ' + sim.after.trust + ', exposure ' + sim.before.exposure + ' → ' + sim.after.exposure + '.' }
        });
        ADG.ui.permDraft = null;
        ADG.render();
      }
    });
  };

  TAB_RENDER.cost = function (a) {
    const days = ADG.state.fleet.slice(-14);
    const share = a.currentCost / ADG.state.agents.reduce((s, x) => s + x.currentCost, 0);
    const series = days.map((d, i) => Math.round(a.currentCost / 30 * (0.78 + ((i * 7) % 11) / 20)));
    const over = a.monthlyProjectedCost > a.budget;
    return '<div class="grid g-side">' +
      '<div class="card"><div class="card-head"><h3>Daily spend, 14 days</h3>' +
        '<div class="right">' + C.badge(over ? 'Projected over budget' : 'Inside budget', over ? 'red' : 'green', { glyph: over ? '▲' : '✓' }) + '</div></div>' +
        '<div class="card-pad">' + C.lineChart([{ values: series, tone: over ? 'red' : 'blue' }],
          { h: 200, yFmt: (v) => '$' + Math.round(v), xLabels: days.map((d, i) => (i % 4 === 0 ? d.day + 'd' : '')) }) + '</div></div>' +
      '<div class="grid" style="gap:14px;align-content:start">' +
        '<div class="card card-pad"><div class="kpi-label">Month to date</div>' +
          '<div class="kpi-val" style="margin:5px 0">' + fmt.usd(a.currentCost) + '</div>' +
          C.meterRow('Against budget of ' + fmt.usd(a.budget), Math.min(100, (a.currentCost / a.budget) * 100),
            a.currentCost > a.budget ? 'red' : 'green', Math.round((a.currentCost / a.budget) * 100) + '%') +
          '<div class="rule"></div>' +
          '<div class="kv-list">' +
          '<div class="kv-row"><span class="k">Projected</span><span class="v num" style="color:var(--' + (over ? 'red' : 'ink') + ')">' + fmt.usd(a.monthlyProjectedCost) + '</span></div>' +
          '<div class="kv-row"><span class="k">Cost per 1k tasks</span><span class="v num">' + fmt.usd(a.currentCost / Math.max(a.taskCount / 1000, 1)) + '</span></div>' +
          '<div class="kv-row"><span class="k">Share of fleet</span><span class="v num">' + (share * 100).toFixed(1) + '%</span></div>' +
          '<div class="kv-row"><span class="k">Model tier</span><span class="v">' + esc(D.MODELS[a.model].tier) + '</span></div>' +
          '<div class="kv-row"><span class="k">Cost efficiency</span><span class="v num">' + a.dims.costEfficiency + '/100</span></div>' +
          '</div></div>' +
        C.ai({ kicker: 'Cost assessment', confidence: 0.88,
          body: over
            ? '<b>' + esc(a.name) + '</b> is projected to overrun by <b>' + fmt.usd(a.monthlyProjectedCost - a.budget) + '</b> this month. At a ' +
              a.health.retryRate + '% retry rate, roughly ' + fmt.usd(Math.round(a.currentCost * a.health.retryRate / 100)) + ' of current spend is repeated work rather than new work.'
            : '<b>' + esc(a.name) + '</b> is inside budget with ' + fmt.usd(a.budget - a.monthlyProjectedCost) + ' of projected headroom. Cost efficiency is ' + a.dims.costEfficiency + '/100.',
          rows: [['Driver', D.MODELS[a.model].tier + ' tier at ' + fmt.int(a.taskCount) + ' lifetime tasks'],
                 ['Retry waste', a.health.retryRate + '% of runs are retries']],
          actions: '<button class="btn sm" data-act="goto" data-route="#/economics/optimization">Optimise</button>' +
                   '<button class="btn sm" data-act="sim-agent" data-id="' + a.id + '">Model the change</button>' }) +
      '</div></div>';
  };

  TAB_RENDER.policies = function (a) {
    const decs = S.decisionsFor(a.id);
    return '<div class="grid g-2">' + ADG.state.policies.map((p) => {
      const evaluated = decs.filter((d) => d.policy === p.id).length;
      const breached = decs.filter((d) => d.policy === p.id && (d.status === 'blocked' || d.status === 'rejected')).length;
      return '<div class="card"><div class="card-head"><h3>' + esc(p.name) + '</h3>' +
        '<div class="right">' + C.badge('v' + p.version, null, { sq: true }) +
        C.badge(breached ? breached + ' breached' : 'Clean', breached ? 'red' : 'green', { glyph: breached ? '!' : '✓' }) + '</div></div>' +
        '<div class="card-pad"><p class="tiny muted" style="line-height:1.55">' + esc(p.description) + '</p>' +
        '<div class="rule" style="margin:10px 0"></div>' +
        '<ul class="auth-list ' + (breached ? 'appr' : 'can') + '">' + p.rules.map((r) =>
          '<li><span class="m">' + (breached ? '!' : '✓') + '</span><span>' + esc(r) + '</span></li>').join('') + '</ul>' +
        '<div class="rule" style="margin:10px 0"></div>' +
        '<div style="display:flex;gap:16px" class="tiny muted"><span>Evaluated <b>' + evaluated + '</b></span>' +
        '<span>Breached <b>' + breached + '</b></span><span>Updated ' + esc(fmt.date(p.lastUpdated)) + '</span></div>' +
        '</div></div>';
    }).join('') + '</div>';
  };

  TAB_RENDER.audit = function (a) {
    const rows = ADG.state.audit.filter((x) => x.agentId === a.id);
    return '<div class="card"><div class="card-head"><h3>Audit trail</h3><span class="sub">' + rows.length + ' events for this agent</span>' +
      '<div class="right"><button class="btn xs" data-act="goto" data-route="#/governance/audit">Full audit trail</button></div></div>' +
      (rows.length ? '<div class="tablewrap"><table class="tbl"><thead><tr><th>Time</th><th>Event</th><th>Actor</th><th>Target</th><th>Detail</th></tr></thead><tbody>' +
        rows.map((e) => '<tr><td class="mono nowrap">' + esc(fmt.dateTime(e.time)) + '</td>' +
          '<td><b>' + esc(e.event) + '</b></td>' +
          '<td>' + esc(e.actor) + ' ' + C.badge(e.actorType, e.actorType === 'human' ? 'blue' : e.actorType === 'agent' ? 'purple' : null, { sq: true }) + '</td>' +
          '<td class="mono">' + esc(e.target) + '</td>' +
          '<td class="muted">' + esc(e.detail) + '</td></tr>').join('') + '</tbody></table></div>'
        : C.empty({ title: 'No audit events yet', body: 'Approvals, permission changes and guardrail applications will appear here.' })) + '</div>';
  };

  /* ---------------------------------------------------------- trust overview */
  V['trust/overview'] = function () {
    const s = ADG.state, k = S.kpis();
    const ag = s.agents.slice().sort((a, b) => S.trust(a) - S.trust(b));
    const dimAvg = {};
    D.TRUST_DIMS.forEach((d) => { dimAvg[d] = Math.round(s.agents.reduce((x, a) => x + a.dims[d], 0) / s.agents.length); });
    const bands = ['trusted', 'reliable', 'monitored', 'limited', 'untrusted'].map((key) => ({
      key, label: key[0].toUpperCase() + key.slice(1),
      value: s.agents.filter((a) => D.trustBand(S.trust(a)).key === key).length,
      tone: key === 'trusted' ? 'green' : key === 'reliable' ? 'blue' : key === 'monitored' ? 'amber' : 'red'
    })).filter((b) => b.value);

    return pageHead('Trust overview', 'One score per agent, derived from six weighted dimensions. Nothing here is hand-set — change a dimension and every figure moves.',
      '<button class="btn" data-act="goto" data-route="#/trust/matrix">Risk matrix</button>' +
      '<button class="btn primary" data-act="goto" data-route="#/trust/compare">Compare agents</button>') +

    '<div class="grid g-side">' +
      '<div class="card"><div class="card-head"><h3>Fleet trust distribution</h3><span class="sub">' + s.agents.length + ' agents</span></div>' +
        '<div class="card-pad" style="display:flex;gap:26px;align-items:center;flex-wrap:wrap">' +
          '<div style="text-align:center">' + C.ring(k.trust, { size: 160, stroke: 13, cap: D.trustBand(k.trust).label }) +
            '<p class="tiny muted" style="margin-top:8px;max-width:170px">Weighted by decision volume, so the agents doing the most work count the most.</p></div>' +
          '<div style="flex:1;min-width:250px;display:grid;gap:9px">' + bands.map((b) =>
            '<div><div style="display:flex;gap:8px;align-items:baseline;margin-bottom:4px">' +
            '<span class="dot" style="color:var(--' + b.tone + ')"></span>' +
            '<span style="font-size:12.5px">' + esc(b.label) + '</span>' +
            '<span class="num" style="margin-left:auto;font-weight:600">' + b.value + '</span></div>' +
            '<div class="meter m-' + b.tone + '"><i style="width:' + ((b.value / s.agents.length) * 100) + '%"></i></div></div>').join('') +
          '</div></div></div>' +
      '<div class="card"><div class="card-head"><h3>Fleet dimension profile</h3></div>' +
        '<div class="card-pad">' + C.radar(dimAvg, { size: 250, interactive: false }) +
        '<p class="tiny muted" style="margin-top:8px">Fleet average per dimension. Cost Efficiency is the weakest at ' + dimAvg.costEfficiency + '.</p></div></div>' +
    '</div>' +

    '<div class="sec"><div class="sec-head"><h2>Lowest trust</h2><span class="sub">Where the score is telling you something</span>' +
      '<div class="right"><button class="btn sm" data-act="goto" data-route="#/agents?view=at-risk">All at-risk agents</button></div></div>' +
      '<div class="grid g-3">' + ag.slice(0, 6).map((a) => {
        const t = S.trust(a);
        const weakest = D.TRUST_DIMS.slice().sort((x, y) => a.dims[x] - a.dims[y])[0];
        return '<button class="card is-click card-pad" data-act="trust-panel" data-id="' + a.id + '" style="text-align:left">' +
          '<div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">' +
          C.ring(t, { size: 62, stroke: 6, cls: 'sm' }) +
          '<div style="min-width:0"><b style="font-size:13px;display:block">' + esc(a.name) + '</b>' +
          '<span class="tiny muted">' + esc(a.department) + '</span></div></div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px">' + C.riskBadge(a) +
          C.badge(D.trustBand(t).label, ADG.toneForTrust(t)) + '</div>' +
          C.meterRow('Weakest · ' + D.TRUST_WEIGHTS[weakest].label, a.dims[weakest],
            a.dims[weakest] >= 75 ? 'amber' : 'red', a.dims[weakest]) + '</button>';
      }).join('') + '</div></div>';
  };

  /* ---------------------------------------------------------- risk matrix */
  ADG.ui.matrix = { dept: 'all', risk: 'all', trustMin: 0, costMin: 0 };
  ADG.actions['mx-set'] = (d) => { ADG.ui.matrix[d.key] = d.value != null ? d.value : d.v; ADG.render(); };

  V['trust/matrix'] = function () {
    const m = ADG.ui.matrix, s = ADG.state;
    const depts = Array.from(new Set(s.agents.map((a) => a.department))).sort();
    const maxCost = Math.max.apply(null, s.agents.map((a) => a.currentCost));
    const shown = s.agents.filter((a) =>
      (m.dept === 'all' || a.department === m.dept) &&
      (m.risk === 'all' || S.riskBand(a).key === m.risk) &&
      S.trust(a) >= Number(m.trustMin) && a.currentCost >= Number(m.costMin));
    const W = 760, H = 520, P = { t: 26, r: 26, b: 44, l: 52 };
    const X = (risk) => P.l + (risk / 100) * (W - P.l - P.r);
    const Y = (trust) => P.t + (1 - trust / 100) * (H - P.t - P.b);
    const midX = X(45), midY = Y(80);

    let bubbles = '';
    s.agents.forEach((a) => {
      const inSet = shown.indexOf(a) !== -1;
      const t = S.trust(a), rk = S.risk(a);
      const rad = 5 + Math.sqrt(a.currentCost / maxCost) * 13;
      const tone = rk >= 45 ? (t < 80 ? 'red' : 'amber') : (t >= 88 ? 'green' : 'blue');
      bubbles += '<g class="bubble ' + (inSet ? '' : 'is-dim') + '" data-act="open-agent" data-id="' + a.id + '" tabindex="0" role="button" aria-label="' +
        esc(a.name + ', trust ' + t + ', risk ' + rk + ', cost ' + fmt.usd(a.currentCost) + ', health ' + S.health(a)) + '">' +
        '<circle cx="' + X(rk).toFixed(1) + '" cy="' + Y(t).toFixed(1) + '" r="' + rad.toFixed(1) + '" fill="var(--' + tone + ')" fill-opacity=".18" stroke="var(--' + tone + ')" stroke-width="1.6"/>' +
        '<title>' + esc(a.name + ' — trust ' + t + ' · risk ' + rk + ' · cost ' + fmt.usd(a.currentCost) + ' · health ' + S.health(a)) + '</title></g>';
    });

    /* Quadrant captions are painted over the bubbles with a surface-coloured
       halo, so a dense cluster can never make them unreadable. */
    const halo = ' stroke="var(--surface)" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round"';
    const quadLabels =
      '<text x="' + (P.l + 12) + '" y="' + (P.t + 20) + '" font-size="11" font-weight="700" letter-spacing="1.4" fill="var(--green)"' + halo + '>TRUST</text>' +
      '<text x="' + (P.l + 12) + '" y="' + (P.t + 34) + '" font-size="10" fill="var(--ink-3)"' + halo + '>High trust · low risk — leave it alone</text>' +
      '<text x="' + (W - P.r - 12) + '" y="' + (P.t + 20) + '" text-anchor="end" font-size="11" font-weight="700" letter-spacing="1.4" fill="var(--amber)"' + halo + '>WATCH</text>' +
      '<text x="' + (W - P.r - 12) + '" y="' + (P.t + 34) + '" text-anchor="end" font-size="10" fill="var(--ink-3)"' + halo + '>High trust · high risk — narrow the envelope</text>' +
      '<text x="' + (P.l + 12) + '" y="' + (H - P.b - 22) + '" font-size="11" font-weight="700" letter-spacing="1.4" fill="var(--blue)"' + halo + '>OPTIMIZE</text>' +
      '<text x="' + (P.l + 12) + '" y="' + (H - P.b - 8) + '" font-size="10" fill="var(--ink-3)"' + halo + '>Low trust · low risk — improve at leisure</text>' +
      '<text x="' + (W - P.r - 12) + '" y="' + (H - P.b - 22) + '" text-anchor="end" font-size="11" font-weight="700" letter-spacing="1.4" fill="var(--red)"' + halo + '>DANGER</text>' +
      '<text x="' + (W - P.r - 12) + '" y="' + (H - P.b - 8) + '" text-anchor="end" font-size="10" fill="var(--ink-3)"' + halo + '>Low trust · high risk — act now</text>';

    return pageHead('Risk matrix', 'Trust against risk. A trusted agent can still be risky — the two axes are computed independently, and the top-right quadrant is where that shows.',
      '<button class="btn" data-act="goto" data-route="#/trust/overview">Trust overview</button>') +

    '<div class="grid g-side">' +
      '<div class="card"><div class="card-head"><h3>Trust × risk</h3>' +
        '<span class="sub">Bubble size is monthly spend · ' + shown.length + ' of ' + s.agents.length + ' agents in view</span></div>' +
        '<div class="card-pad matrix-wrap">' +
        '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Scatter plot of agent trust against risk. ' +
          shown.length + ' agents shown. Use the agent table for a screen-reader-friendly list.">' +
          '<rect x="' + P.l + '" y="' + P.t + '" width="' + (midX - P.l) + '" height="' + (midY - P.t) + '" fill="var(--green)" opacity=".045"/>' +
          '<rect x="' + midX + '" y="' + P.t + '" width="' + (W - P.r - midX) + '" height="' + (midY - P.t) + '" fill="var(--amber)" opacity=".05"/>' +
          '<rect x="' + P.l + '" y="' + midY + '" width="' + (midX - P.l) + '" height="' + (H - P.b - midY) + '" fill="var(--blue)" opacity=".04"/>' +
          '<rect x="' + midX + '" y="' + midY + '" width="' + (W - P.r - midX) + '" height="' + (H - P.b - midY) + '" fill="var(--red)" opacity=".06"/>' +
          '<line x1="' + midX + '" y1="' + P.t + '" x2="' + midX + '" y2="' + (H - P.b) + '" stroke="var(--border-2)" stroke-dasharray="4 4"/>' +
          '<line x1="' + P.l + '" y1="' + midY + '" x2="' + (W - P.r) + '" y2="' + midY + '" stroke="var(--border-2)" stroke-dasharray="4 4"/>' +
          '<rect x="' + P.l + '" y="' + P.t + '" width="' + (W - P.l - P.r) + '" height="' + (H - P.t - P.b) + '" fill="none" stroke="var(--border)"/>' +
          bubbles + quadLabels +
          '<text x="' + (W / 2) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="11" fill="var(--ink-3)">Risk index →</text>' +
          '<text transform="translate(14,' + (H / 2) + ') rotate(-90)" text-anchor="middle" font-size="11" fill="var(--ink-3)">Trust score →</text>' +
          '<text x="' + P.l + '" y="' + (H - P.b + 16) + '" font-size="10" fill="var(--ink-4)">0</text>' +
          '<text x="' + (W - P.r) + '" y="' + (H - P.b + 16) + '" text-anchor="end" font-size="10" fill="var(--ink-4)">100</text>' +
          '<text x="' + (P.l - 8) + '" y="' + (H - P.b) + '" text-anchor="end" font-size="10" fill="var(--ink-4)">0</text>' +
          '<text x="' + (P.l - 8) + '" y="' + (P.t + 8) + '" text-anchor="end" font-size="10" fill="var(--ink-4)">100</text>' +
        '</svg></div></div>' +

      '<div class="grid" style="gap:14px;align-content:start">' +
        '<div class="card"><div class="card-head"><h3>Filters</h3></div><div class="card-pad grid" style="gap:14px">' +
          '<div class="field"><label for="mx-dept">Department</label>' +
            '<select class="select" id="mx-dept" data-change="mx-set" data-key="dept">' +
            '<option value="all">All departments</option>' + depts.map((d) => '<option value="' + esc(d) + '"' + (m.dept === d ? ' selected' : '') + '>' + esc(d) + '</option>').join('') + '</select></div>' +
          '<div class="field"><label for="mx-risk">Risk band</label>' +
            '<select class="select" id="mx-risk" data-change="mx-set" data-key="risk">' +
            ['all', 'low', 'moderate', 'high', 'critical'].map((v) => '<option value="' + v + '"' + (m.risk === v ? ' selected' : '') + '>' +
              (v === 'all' ? 'All risk levels' : v[0].toUpperCase() + v.slice(1)) + '</option>').join('') + '</select></div>' +
          '<div class="field"><label for="mx-trust">Minimum trust · ' + m.trustMin + '</label>' +
            '<input type="range" id="mx-trust" min="0" max="100" step="5" value="' + m.trustMin + '" data-change="mx-set" data-key="trustMin"></div>' +
          '<div class="field"><label for="mx-cost">Minimum monthly cost · ' + fmt.usd(m.costMin) + '</label>' +
            '<input type="range" id="mx-cost" min="0" max="' + maxCost + '" step="200" value="' + m.costMin + '" data-change="mx-set" data-key="costMin"></div>' +
          '<div class="legend"><span><i style="background:var(--green)"></i>Trusted, contained</span><span><i style="background:var(--amber)"></i>Trusted, exposed</span>' +
            '<span><i style="background:var(--blue)"></i>Improving</span><span><i style="background:var(--red)"></i>Act now</span></div>' +
        '</div></div>' +
        '<div class="card"><div class="card-head"><h3>Danger quadrant</h3></div>' +
          (function () {
            const danger = shown.filter((a) => S.risk(a) >= 45 && S.trust(a) < 80);
            return danger.length ? '<div class="card-pad grid" style="gap:8px">' + danger.map((a) =>
              '<button class="minicard" data-act="open-agent" data-id="' + a.id + '" style="text-align:left">' +
              '<div class="mc-top"><b style="font-size:12.5px">' + esc(a.name) + '</b>' + '</div>' +
              '<div class="mc-grid"><div><div class="l">Trust</div><div class="v">' + S.trust(a) + '</div></div>' +
              '<div><div class="l">Risk</div><div class="v">' + S.risk(a) + '</div></div>' +
              '<div><div class="l">Cost</div><div class="v">' + fmt.usd(a.currentCost, { compact: true }) + '</div></div></div></button>').join('') + '</div>'
              : '<div class="card-pad">' + C.empty({ title: 'Danger quadrant is empty', body: 'No agent in this filter combines low trust with high risk.' }) + '</div>';
          })() +
        '</div>' +
      '</div></div>';
  };

  /* ---------------------------------------------------------- trust history */
  ADG.ui.hist = { agentId: 'ag-procurement', point: null };
  ADG.actions['hist-agent'] = (d) => { ADG.ui.hist.agentId = d.value; ADG.ui.hist.point = null; ADG.render(); };
  ADG.actions['hist-point'] = (d) => { ADG.ui.hist.point = Number(d.i); ADG.render(); };

  V['trust/history'] = function () {
    const a = S.agent(ADG.ui.hist.agentId) || ADG.state.agents[1];
    const hist = ADG.state.history[a.id];
    const marks = hist.map((h) => h.events && h.events.length);
    const sel = ADG.ui.hist.point;
    const point = sel != null ? hist[sel] : null;
    const eventDays = hist.map((h, i) => ({ i, h })).filter((x) => x.h.events && x.h.events.length);

    return pageHead('Trust history', 'Every movement in the score has a cause. Select a point on the line to see what happened and how it resolved.',
      '<select class="select" style="width:230px" data-change="hist-agent" aria-label="Choose an agent">' +
      ADG.state.agents.map((x) => '<option value="' + x.id + '"' + (x.id === a.id ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select>') +

    '<div class="grid g-side">' +
      '<div class="card"><div class="card-head"><h3>' + esc(a.name) + '</h3>' +
        '<span class="sub">30 days · currently ' + S.trust(a) + '</span>' +
        '<div class="right">' + C.badge(D.trustBand(S.trust(a)).label, ADG.toneForTrust(S.trust(a))) + '</div></div>' +
        '<div class="card-pad">' + C.lineChart([{ values: hist.map((h) => h.value), tone: ADG.toneForTrust(S.trust(a)), marks }],
          { h: 260, yFmt: (v) => Math.round(v), clickable: true, clickAct: 'hist-point',
            xLabels: hist.map((h, i) => (i % 5 === 0 ? (h.day <= 0 ? 'today' : h.day + 'd') : '')) }) +
          '<p class="tiny muted" style="margin-top:8px">' + eventDays.length + ' causal events recorded in this window. Red markers are clickable.</p>' +
        '</div></div>' +
      '<div class="grid" style="gap:14px;align-content:start">' +
        (point ? '<div class="card"><div class="card-head"><h3>' + (point.day <= 0 ? 'Today' : point.day + ' days ago') + '</h3>' +
          '<div class="right">' + C.badge('Trust ' + point.value, ADG.toneForTrust(point.value)) + '</div></div>' +
          '<div class="card-pad">' + (point.events && point.events.length ? point.events.map((ev) =>
            '<div style="margin-bottom:12px"><div style="display:flex;gap:8px;align-items:baseline;margin-bottom:6px">' +
            '<span class="delta ' + (ev.delta < 0 ? 'down' : 'up') + '" style="font-size:15px">' + (ev.delta > 0 ? '▲ +' : '▼ −') + Math.abs(ev.delta) + ' points</span></div>' +
            '<b style="font-size:13px">' + esc(ev.title) + '</b>' +
            '<div class="kv-list" style="margin-top:8px">' +
            '<div class="kv-row"><span class="k">Cause</span><span class="v">' + esc(ev.cause) + '</span></div>' +
            '<div class="kv-row"><span class="k">Resolution</span><span class="v">' + esc(ev.resolution) + '</span></div>' +
            '</div></div>').join('')
            : '<p class="tiny muted">No causal event was recorded on this day. Trust moved ' +
              (sel > 0 ? fmt.signed(point.value - hist[sel - 1].value) : '0') + ' points from ordinary variance in task mix.</p>') +
          '</div></div>' : '') +
        '<div class="card"><div class="card-head"><h3>Causal events</h3></div>' +
          (eventDays.length ? '<div class="card-pad grid" style="gap:8px">' + eventDays.reverse().map((x) =>
            '<button class="minicard" data-act="hist-point" data-i="' + x.i + '" style="text-align:left">' +
            '<div class="mc-top"><span class="delta ' + (x.h.events[0].delta < 0 ? 'down' : 'up') + '">' +
            (x.h.events[0].delta > 0 ? '+' : '−') + Math.abs(x.h.events[0].delta) + '</span>' +
            '<b style="font-size:12px">' + esc(x.h.events[0].title) + '</b>' +
            '<span class="tiny muted" style="margin-left:auto">' + (x.h.day <= 0 ? 'today' : x.h.day + 'd') + '</span></div>' +
            '<p class="tiny muted">' + esc(x.h.events[0].cause) + '</p></button>').join('') + '</div>'
            : '<div class="card-pad">' + C.empty({ title: 'No causal events', body: 'This agent’s trust has moved only with ordinary variance in the last 30 days.' }) + '</div>') +
        '</div>' +
      '</div></div>';
  };

  /* ---------------------------------------------------------- comparison */
  ADG.actions['cmp-toggle'] = function (d) {
    const list = ADG.state.compare;
    const i = list.indexOf(d.id);
    if (i !== -1) list.splice(i, 1);
    else if (list.length < 4) list.push(d.id);
    else { ADG.toast('info', 'Four agents maximum', 'Remove one before adding another.'); return; }
    ADG.render();
  };
  ADG.actions['cmp-add'] = (d) => { if (d.value && ADG.state.compare.indexOf(d.value) === -1) ADG.actions['cmp-toggle']({ id: d.value }); };

  V['trust/compare'] = function () {
    const ids = ADG.state.compare;
    const list = ids.map((id) => S.agent(id)).filter(Boolean);
    const METRICS = [
      ['Trust', (a) => S.trust(a), (v) => v, 'up'],
      ['Health', (a) => S.health(a), (v) => v, 'up'],
      ['Risk index', (a) => S.risk(a), (v) => v, 'down'],
      ['Reliability', (a) => a.dims.reliability, (v) => v, 'up'],
      ['Policy compliance', (a) => a.dims.policy, (v) => v, 'up'],
      ['Permission safety', (a) => a.dims.permission, (v) => v, 'up'],
      ['Data integrity', (a) => a.dims.dataIntegrity, (v) => v, 'up'],
      ['Human escalation', (a) => a.dims.escalation, (v) => v, 'up'],
      ['Cost efficiency', (a) => a.dims.costEfficiency, (v) => v, 'up'],
      ['Success rate', (a) => a.successRate, (v) => v.toFixed(1) + '%', 'up'],
      ['Monthly cost', (a) => a.currentCost, (v) => fmt.usd(v), 'down'],
      ['Exposure index', (a) => D.exposureOf(a), (v) => v, 'down']
    ];

    let summary = 'Select two or more agents to generate a comparison.';
    if (list.length >= 2) {
      const sorted = list.slice().sort((a, b) => S.trust(b) - S.trust(a));
      const top = sorted[0], bottom = sorted[sorted.length - 1];
      const gap = S.trust(top) - S.trust(bottom);
      const drivers = D.TRUST_DIMS.map((k) => ({ k, d: (top.dims[k] - bottom.dims[k]) * D.TRUST_WEIGHTS[k].w }))
        .sort((a, b) => b.d - a.d).slice(0, 2);
      summary = gap === 0
        ? '<b>' + esc(top.name) + '</b> and <b>' + esc(bottom.name) + '</b> score identically on trust, but they get there differently — ' +
          esc(D.TRUST_WEIGHTS[drivers[0].k].label.toLowerCase()) + ' separates them most.'
        : '<b>' + esc(bottom.name) + '</b> has <b>' + gap + ' points lower trust</b> than ' + esc(top.name) + ', primarily due to ' +
          drivers.map((x) => esc(D.TRUST_WEIGHTS[x.k].label.toLowerCase()) + ' (' + bottom.dims[x.k] + ' against ' + top.dims[x.k] + ')').join(' and ') + '. ' +
          (bottom.currentCost > top.currentCost
            ? 'It also costs ' + fmt.usd(bottom.currentCost - top.currentCost) + ' more a month while doing ' +
              (bottom.taskCount < top.taskCount ? 'less' : 'more') + ' work.'
            : 'It runs ' + fmt.usd(top.currentCost - bottom.currentCost) + ' a month cheaper, so the gap is a governance problem rather than a budget one.');
    }

    return pageHead('Agent comparison', 'Put two to four agents side by side across every dimension the trust score is built from.',
      '<select class="select" style="width:230px" data-change="cmp-add" aria-label="Add an agent to the comparison">' +
      '<option value="">Add an agent…</option>' +
      ADG.state.agents.filter((a) => ids.indexOf(a.id) === -1).map((a) => '<option value="' + a.id + '">' + esc(a.name) + '</option>').join('') + '</select>') +

    '<div class="chipbar" style="margin-bottom:14px">' + ADG.state.agents.slice(0, 14).map((a) =>
      '<button class="chip ' + (ids.indexOf(a.id) !== -1 ? 'is-on' : '') + '" data-act="cmp-toggle" data-id="' + a.id + '" aria-pressed="' + (ids.indexOf(a.id) !== -1) + '">' +
      esc(a.name.replace(' Agent', '')) + '</button>').join('') + '</div>' +

    (list.length < 2 ? C.empty({ title: 'Choose at least two agents', body: 'Pick from the list above, or add one from the dropdown.' }) :
    '<div class="grid g-side">' +
      '<div class="card"><div class="card-head"><h3>Side by side</h3><span class="sub">Best value in each row is highlighted</span></div>' +
        '<div class="tablewrap"><table class="tbl"><thead><tr><th>Metric</th>' +
          list.map((a) => '<th class="num">' + esc(a.name) + '</th>').join('') + '</tr></thead><tbody>' +
          METRICS.map(([label, get, format, good]) => {
            const vals = list.map(get);
            const best = good === 'up' ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
            return '<tr style="cursor:default"><td><b style="font-weight:530">' + esc(label) + '</b></td>' +
              list.map((a, i) => '<td class="num"' + (vals[i] === best ? ' style="font-weight:660;color:var(--green)"' : '') + '>' +
                esc(String(format(vals[i]))) + (vals[i] === best ? ' <span class="tiny" aria-label="best">★</span>' : '') + '</td>').join('') + '</tr>';
          }).join('') + '</tbody></table></div></div>' +
      '<div class="grid" style="gap:14px;align-content:start">' +
        '<div class="card"><div class="card-head"><h3>Overlaid profile</h3></div><div class="card-pad">' +
          C.radar(list[0].dims, { size: 250, interactive: false, compare: list[1].dims }) +
          '<div class="legend" style="margin-top:8px"><span><i style="background:var(--blue)"></i>' + esc(list[0].name) + '</span>' +
          '<span><i style="background:var(--purple)"></i>' + esc(list[1].name) + '</span></div>' +
          (list.length > 2 ? '<p class="tiny muted" style="margin-top:6px">The radar overlays the first two selections; the table covers all ' + list.length + '.</p>' : '') +
        '</div></div>' +
        C.ai({ kicker: 'Comparison summary', confidence: 0.9, body: summary,
          actions: list.length >= 2 && S.recsFor(list.slice().sort((a, b) => S.trust(a) - S.trust(b))[0].id).length
            ? '<button class="btn sm blue" data-act="rec-simulate" data-id="' + S.recsFor(list.slice().sort((a, b) => S.trust(a) - S.trust(b))[0].id)[0].id + '">Simulate the fix</button>' : '' }) +
      '</div></div>');
  };
})(window);
