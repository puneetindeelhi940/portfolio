/* Agent Decision Guard — the guarded-decision interaction.
 * Decision Guard modal, trust explanation panel, dimension evidence,
 * incident and decision drawers, and the apply-a-guardrail state machine.
 * Built by Puneet Arora.
 */
(function (global) {
  'use strict';
  const ADG = global.ADG, D = global.ADG_DATA, S = ADG.sel, C = ADG.C, fmt = ADG.fmt, esc = ADG.esc;

  /* ------------------------------------------------------------- Decision Guard */
  ADG.actions['guard'] = function (d) {
    const dec = S.decision(d.id);
    if (!dec) return;
    const a = S.agent(dec.agentId);
    const trust = S.trust(a), risk = S.riskBand(a), riskV = S.risk(a);
    const rec = S.recsFor(a.id)[0];
    const resolved = dec.approvalStatus !== 'pending';

    const banner =
      '<div class="guard-banner">' +
        '<div style="display:flex;align-items:flex-start;gap:12px">' +
        '<div style="min-width:0">' +
        '<span class="kicker"><span aria-hidden="true">⚠</span> ' + (resolved ? 'Decision resolved' : 'Decision requires review') + '</span>' +
        '<h2>' + esc(dec.action) + '</h2>' +
        '<div class="who"><b>' + esc(a.name) + '</b> · ' + esc(a.department) + ' · paused ' + fmt.ago(dec.timestamp) +
          ' · ' + esc(dec.id) + '</div></div>' +
        '<button class="iconbtn" data-act="close-overlay" aria-label="Close" style="margin-left:auto;flex:none">✕</button>' +
        '</div></div>';

    const body =
      '<div class="guard-stats" style="margin-bottom:16px">' +
        '<div><div class="l">Trust</div><div class="v" style="color:var(--' + ADG.toneForTrust(trust) + ')">' + trust + '<span style="font-size:12px;color:var(--ink-4);font-weight:500">/100</span></div>' +
          '<div class="tiny muted">' + esc(D.trustBand(trust).label) + '</div></div>' +
        '<div><div class="l">Risk</div><div class="v" style="color:var(--' + ADG.toneForRisk(risk.key) + ')">' + esc(risk.label.toUpperCase()) + '</div>' +
          '<div class="tiny muted">Index ' + riskV + '/100</div></div>' +
        '<div><div class="l">' + (dec.amount ? 'Value at stake' : 'Exposure') + '</div><div class="v">' + (dec.amount ? fmt.usd(dec.amount) : '—') + '</div>' +
          '<div class="tiny muted">' + (a.autonomousLimit ? 'Autonomous limit ' + fmt.usd(a.autonomousLimit) : 'No autonomous authority') + '</div></div>' +
      '</div>' +
      '<h3 style="font-size:13px;margin-bottom:8px">Why was this flagged?</h3>' +
      '<div class="flaglist">' + (dec.flags || []).map((f) =>
        '<div class="flag sev-' + f.severity + '"><span class="fi" aria-hidden="true">' +
        (f.severity === 'critical' ? '!' : f.severity === 'high' ? '▲' : '◇') + '</span>' +
        '<div><b>' + esc(f.label) + '</b><p>' + esc(f.detail) + '</p>' +
        '<span class="sr-only">Severity: ' + esc(f.severity) + '</span></div></div>').join('') + '</div>' +
      '<div class="rule"></div>' +
      '<div class="grid g-2" style="gap:16px">' +
        '<div><h3 style="font-size:13px;margin-bottom:8px">Evidence</h3><div class="kv-list">' +
          (dec.evidence || []).map((e) => '<div class="kv-row" style="grid-template-columns:112px 1fr"><span class="k">' + esc(e.label) + '</span><span class="v">' + esc(e.value) + '</span></div>').join('') +
        '</div></div>' +
        '<div><h3 style="font-size:13px;margin-bottom:8px">Governing policy</h3>' +
          '<div class="card card-pad" style="background:var(--surface-2)">' +
            '<b style="font-size:12.5px">' + esc(dec.policyLabel) + '</b>' +
            '<p class="tiny muted" style="margin-top:5px;line-height:1.55">' + esc((ADG.state.policies.find((p) => p.id === dec.policy) || {}).description || '') + '</p>' +
            '<div class="btn-row" style="margin-top:9px"><button class="btn xs" data-act="goto" data-route="#/governance/policies">Open policy</button>' +
            '<button class="btn xs" data-act="open-decision" data-id="' + dec.id + '">Full timeline</button></div>' +
          '</div>' +
          '<div style="margin-top:10px">' +
            C.badge('Tools used · ' + (dec.toolsUsed || []).join(', '), 'blue', { sq: true }) +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="rule"></div>' +
      C.ai({
        kicker: 'Recommended action', confidence: dec.confidence,
        body: esc(dec.recommendation || ''),
        rows: rec ? [['Guardrail', esc(rec.title)],
                     ['Evidence', esc(rec.evidence)],
                     ['Expected impact', 'Risk ↓ ' + rec.estimatedRiskReduction + '% · Cost ' + (rec.estimatedCostReduction >= 0 ? '↓ ' : '↑ ') + Math.abs(rec.estimatedCostReduction) + '% · Success ' + fmt.signed(rec.estimatedPerformanceImpact, 1) + '%']] : null,
        actions: rec ? '<button class="btn sm" data-act="rec-simulate" data-id="' + rec.id +
          '" data-back="' + dec.id + '">Simulate this guardrail</button>' : ''
      }) +
      (resolved ? '<div class="rule"></div><div class="card card-pad" style="background:var(--surface-2)">' +
        C.status(dec.approvalStatus) + ' <span style="font-size:12.5px;margin-left:6px">' + esc(dec.outcome || '') + '</span></div>' : '');

    const foot = resolved
      ? '<div style="flex:1"></div><button class="btn primary" data-act="close-overlay">Close</button>'
      : '<button class="btn danger" data-act="guard-reject" data-id="' + dec.id + '">Reject</button>' +
        '<button class="btn" data-act="guard-modify" data-id="' + dec.id + '">Modify guardrail</button>' +
        '<button class="btn" data-act="guard-simulate" data-id="' + dec.id + '">Simulate</button>' +
        '<div style="flex:1"></div>' +
        '<button class="btn green" data-act="guard-approve" data-id="' + dec.id + '">Approve</button>';

    ADG.openModal({ wide: true, banner, body, foot, ariaLabel: 'Decision Guard — ' + dec.action });
  };

  ADG.actions['guard-approve'] = function (d) {
    const dec = S.decision(d.id);
    ADG.confirm({
      title: 'Approve this decision?', tone: 'green', confirmLabel: 'Approve',
      body: 'You are approving <b>' + esc(dec.action) + '</b>' + (dec.amount ? ' with a value of <b>' + fmt.usd(dec.amount) + '</b>' : '') +
        '. The agent resumes immediately and the approval is recorded against your name in the audit trail.',
      onConfirm() {
        ADG.commit({
          mutate(s) {
            const x = s.decisions.find((y) => y.id === d.id);
            x.status = 'approved'; x.approvalStatus = 'approved'; x.approver = ADG.SESSION.name;
            x.outcome = 'Approved by ' + ADG.SESSION.name + '. The agent resumed and completed the action.';
            const ag = s.agents.find((y) => y.id === x.agentId);
            if (ag && ag.status === 'awaiting-approval') ag.status = 'active';
          },
          audit: { agentId: dec.agentId, event: 'Decision approved', target: dec.id, category: 'approval',
            detail: dec.action + (dec.amount ? ' · ' + fmt.usd(dec.amount) : '') + '. Approved under ' + dec.policyLabel + '.' },
          toast: { type: 'success', title: 'Decision approved', body: dec.id + ' resumed. The approval is recorded in the audit trail.' }
        });
      }
    });
  };

  ADG.actions['guard-reject'] = function (d) {
    const dec = S.decision(d.id);
    ADG.confirm({
      title: 'Reject this decision?', tone: 'danger', confirmLabel: 'Reject and return',
      body: 'The agent will not execute <b>' + esc(dec.action) + '</b>. It is returned to the agent with your rejection recorded, and the owning team is notified.',
      onConfirm() {
        ADG.commit({
          mutate(s) {
            const x = s.decisions.find((y) => y.id === d.id);
            x.status = 'rejected'; x.approvalStatus = 'rejected'; x.approver = ADG.SESSION.name;
            x.outcome = 'Rejected by ' + ADG.SESSION.name + '. Returned to the agent; no action was taken.';
            const ag = s.agents.find((y) => y.id === x.agentId);
            if (ag) { ag.dims.escalation = Math.min(100, ag.dims.escalation + 2); if (ag.status === 'awaiting-approval') ag.status = 'active'; }
          },
          audit: { agentId: dec.agentId, event: 'Decision rejected', target: dec.id, category: 'approval',
            detail: dec.action + '. Rejected — returned to the agent with no action taken.' },
          toast: { type: 'info', title: 'Decision rejected', body: dec.id + ' was returned to the agent. Nothing was executed.' }
        });
      }
    });
  };

  ADG.actions['guard-modify'] = function (d) {
    const dec = S.decision(d.id);
    const rec = S.recsFor(dec.agentId)[0];
    ADG.closeOverlay();
    ADG.state.simSeed = { agentId: dec.agentId, from: dec.id, recId: rec ? rec.id : null };
    ADG.go('#/decisions/simulator');
  };

  ADG.actions['guard-simulate'] = function (d) {
    const dec = S.decision(d.id);
    const rec = S.recsFor(dec.agentId)[0];
    if (rec) ADG.actions['rec-simulate']({ id: rec.id, back: dec.id });
    else ADG.actions['guard-modify'](d);
  };

  /* ------------------------------------------------------------- simulate + apply a recommendation */
  ADG.actions['rec-simulate'] = function (d) {
    const rec = ADG.state.recommendations.find((r) => r.id === d.id);
    const a = S.agent(rec.agentId);
    const controls = controlsFor(rec, a);
    const sim = ADG.simulate(a, controls);
    ADG.openModal({
      wide: true, title: 'Simulation · ' + esc(rec.title),
      sub: esc(a.name) + ' · proposed change has not been applied ' + C.badge('Simulated', 'purple', { glyph: '◇' }),
      body: simulationBody(a, sim, rec),
      foot: '<button class="btn" data-act="' + (d.back ? 'guard' : 'close-overlay') + '"' + (d.back ? ' data-id="' + d.back + '"' : '') + '>Back</button>' +
        '<button class="btn" data-act="sim-open" data-id="' + rec.id + '">Open in simulator</button>' +
        '<div style="flex:1"></div>' +
        '<button class="btn blue" data-act="rec-apply" data-id="' + rec.id + '"' + (d.back ? ' data-back="' + d.back + '"' : '') + '>Apply changes</button>'
    });
  };

  ADG.actions['sim-open'] = function (d) {
    const rec = ADG.state.recommendations.find((r) => r.id === d.id);
    ADG.closeOverlay();
    ADG.state.simSeed = { agentId: rec.agentId, recId: rec.id };
    ADG.go('#/decisions/simulator');
  };

  function controlsFor(rec, a) {
    const c = {};
    const ch = rec.changes || {};
    if (ch.autonomousLimit != null) c.autonomousLimit = ch.autonomousLimit;
    if (ch.model) c.model = ch.model;
    if (ch.maxRetries != null) c.maxRetries = ch.maxRetries;
    if (ch.permissions) {
      c.perm = {};
      Object.keys(ch.permissions).forEach((g) => Object.keys(ch.permissions[g]).forEach((k) => { c.perm[g + '::' + k] = ch.permissions[g][k]; }));
    }
    ['escalateOnBlock', 'dualApproval', 'minConfidence', 'contractTest', 'preIndex', 'cacheExtract'].forEach((k) => {
      if (ch[k]) c[k] = ch[k];
    });
    c.__rec = rec.id;
    return c;
  }
  ADG.controlsFor = controlsFor;

  /* The one renderer for a before/after comparison — used by the modal and the
     Decision Simulator page so both always agree. */
  function simulationBody(a, sim, rec) {
    const b = sim.before, af = sim.after;
    const rows = [
      { label: 'Trust score', was: b.trust, now: af.trust, fmt: (v) => v, good: 'up' },
      { label: 'Risk index', was: b.risk, now: af.risk, fmt: (v) => v, good: 'down' },
      { label: 'Permission exposure', was: b.exposure, now: af.exposure, fmt: (v) => v, good: 'down' },
      { label: 'Projected monthly cost', was: b.cost, now: af.cost, fmt: (v) => fmt.usd(v, { compact: true }), good: 'down' },
      { label: 'Success rate', was: b.success, now: af.success, fmt: (v) => Number(v).toFixed(1) + '%', good: 'up' }
    ];
    const riskB = D.riskBand(b.risk), riskA = D.riskBand(af.risk);
    return '<div class="grid g-2" style="gap:16px;align-items:start">' +
      '<div class="card"><div class="card-head"><h3>Current</h3><div class="right">' + C.badge('Live', null, { dot: true }) + '</div></div>' +
        '<div class="card-pad" style="display:flex;gap:16px;align-items:center">' +
          C.ring(b.trust, { size: 96, stroke: 9, cap: 'Trust', cls: 'sm' }) +
          '<div style="flex:1"><div class="kv-list">' +
          '<div class="kv-row" style="grid-template-columns:1fr auto"><span class="k">Risk</span><span class="v">' + C.badge(riskB.label, ADG.toneForRisk(riskB.key)) + '</span></div>' +
          '<div class="kv-row" style="grid-template-columns:1fr auto"><span class="k">Cost / month</span><span class="v num">' + fmt.usd(b.cost) + '</span></div>' +
          '<div class="kv-row" style="grid-template-columns:1fr auto"><span class="k">Success</span><span class="v num">' + b.success.toFixed(1) + '%</span></div>' +
          '</div></div></div></div>' +
      '<div class="card" style="border-color:var(--purple-br)"><div class="card-head" style="background:var(--purple-bg)"><h3>Proposed</h3>' +
        '<div class="right">' + C.badge('Simulated', 'purple', { glyph: '◇' }) + '</div></div>' +
        '<div class="card-pad" style="display:flex;gap:16px;align-items:center">' +
          C.ring(af.trust, { size: 96, stroke: 9, cap: 'Trust', cls: 'sm', tone: ADG.toneForTrust(af.trust) }) +
          '<div style="flex:1"><div class="kv-list">' +
          '<div class="kv-row" style="grid-template-columns:1fr auto"><span class="k">Risk</span><span class="v">' + C.badge(riskA.label, ADG.toneForRisk(riskA.key)) + '</span></div>' +
          '<div class="kv-row" style="grid-template-columns:1fr auto"><span class="k">Cost / month</span><span class="v num">' + fmt.usd(af.cost) + '</span></div>' +
          '<div class="kv-row" style="grid-template-columns:1fr auto"><span class="k">Success</span><span class="v num">' + af.success.toFixed(1) + '%</span></div>' +
          '</div></div></div></div>' +
      '</div>' +
      '<div class="sec"><div class="sec-head"><h2>Predicted impact</h2><span class="sub">Every figure recomputed by the same scoring function the live product uses</span></div>' +
      '<div class="card card-pad">' + rows.map((r) => {
        const delta = r.now - r.was;
        const good = (r.good === 'up' && delta > 0) || (r.good === 'down' && delta < 0);
        const cls = Math.abs(delta) < 0.05 ? 'flat' : good ? 'up' : 'down';
        return '<div class="diffrow"><span class="dl">' + esc(r.label) + '</span>' +
          '<span class="dv was">' + esc(r.fmt(r.was)) + '</span>' +
          '<span class="ar" aria-hidden="true">→</span>' +
          '<span class="dv">' + esc(r.fmt(r.now)) + '</span>' +
          '<span class="dd delta ' + cls + '">' + (Math.abs(delta) < 0.05 ? 'no change' :
            (delta > 0 ? '▲ ' : '▼ ') + esc(String(r.fmt(Math.abs(delta))))) + '</span></div>';
      }).join('') + '</div></div>' +
      '<div class="sec"><div class="sec-head"><h2>Dimension movement</h2></div><div class="card card-pad"><div class="grid g-3" style="gap:12px">' +
        D.TRUST_DIMS.map((k) => {
          const dd = af.dims[k] - b.dims[k];
          return '<div><div style="display:flex;gap:6px;align-items:baseline"><span class="tiny muted" style="flex:1">' + esc(D.TRUST_WEIGHTS[k].label) + '</span>' +
            '<span class="num" style="font-weight:600">' + af.dims[k] + '</span>' +
            (dd ? '<span class="delta ' + (dd > 0 ? 'up' : 'down') + '">' + (dd > 0 ? '+' : '−') + Math.abs(dd) + '</span>' : '<span class="tiny muted">—</span>') + '</div>' +
            '<div class="meter m-' + (af.dims[k] >= 88 ? 'green' : af.dims[k] >= 75 ? 'blue' : af.dims[k] >= 60 ? 'amber' : 'red') + '" style="margin-top:5px"><i style="width:' + af.dims[k] + '%"></i></div></div>';
        }).join('') + '</div></div></div>' +
      '<div class="sec">' + C.ai({
        kicker: 'What changes and why', confidence: rec ? rec.confidence : 0.87,
        body: sim.notes.length ? '<ul style="display:grid;gap:6px">' + sim.notes.map((n) => '<li style="display:grid;grid-template-columns:auto 1fr;gap:7px"><span style="color:var(--purple)">•</span><span>' + esc(n) + '</span></li>').join('') + '</ul>'
          : 'No controls have been changed yet. Adjust a control to see its predicted effect.',
        rows: [['Security', af.exposure < b.exposure ? 'Exposure narrows by ' + (b.exposure - af.exposure) + ' points — fewer capabilities available without a human in the loop.' : af.exposure > b.exposure ? 'Exposure widens by ' + (af.exposure - b.exposure) + ' points.' : 'Unchanged.'],
                ['Policy', af.dims.policy > b.dims.policy ? 'Compliance strengthens ' + (af.dims.policy - b.dims.policy) + ' points.' : af.dims.policy < b.dims.policy ? 'Compliance weakens ' + (b.dims.policy - af.dims.policy) + ' points.' : 'Unchanged.'],
                ['Performance', Math.abs(af.success - b.success) < 0.05 ? 'No measurable change to throughput.' : (af.success < b.success ? 'Throughput costs ' + (b.success - af.success).toFixed(1) + ' points of success rate — the price of the extra boundary.' : 'Throughput improves ' + (af.success - b.success).toFixed(1) + ' points.')],
                ['Cost', af.cost === b.cost ? 'No change.' : (af.cost < b.cost ? fmt.usd(b.cost - af.cost) + ' a month recovered.' : fmt.usd(af.cost - b.cost) + ' a month added.')]]
      }) + '</div>';
  }
  ADG.simulationBody = simulationBody;

  ADG.actions['rec-apply'] = function (d) {
    const rec = ADG.state.recommendations.find((r) => r.id === d.id);
    const a = S.agent(rec.agentId);
    const before = S.trust(a), beforeRisk = S.riskBand(a);
    ADG.confirm({
      title: 'Apply this guardrail?', tone: 'blue', confirmLabel: 'Apply changes',
      body: '<b>' + esc(rec.title) + '</b> will be applied to <b>' + esc(a.name) + '</b> immediately. Permissions, trust, risk and the recommendation queue all update, and an audit event is written against your name.',
      onConfirm() {
        ADG.commit({
          mutate(s) {
            const ag = s.agents.find((x) => x.id === rec.agentId);
            const ch = rec.changes || {};
            if (ch.autonomousLimit != null) ag.autonomousLimit = ch.autonomousLimit;
            if (ch.model) ag.model = ch.model;
            if (ch.permissions) Object.keys(ch.permissions).forEach((g) =>
              Object.keys(ch.permissions[g]).forEach((k) => { ag.permissions[g][k] = ch.permissions[g][k]; }));
            Object.keys(rec.dimDelta || {}).forEach((k) => {
              ag.dims[k] = Math.round(D.clamp(ag.dims[k] + rec.dimDelta[k], 0, 100));
            });
            if (rec.estimatedCostReduction) ag.monthlyProjectedCost = Math.round(ag.monthlyProjectedCost * (1 - rec.estimatedCostReduction / 100));
            ag.successRate = Number(D.clamp(ag.successRate + rec.estimatedPerformanceImpact, 0, 100).toFixed(1));
            ag.health.completion = ag.successRate;
            ag.openViolations = 0;
            ag.trustDelta7d = D.trustOf(ag.dims) - before;
            ag.tools = Object.keys(ag.permissions.tools).filter((t2) => ag.permissions.tools[t2] !== 'block');
            if (ag.status === 'critical' || ag.status === 'warning') ag.status = 'active';
            s.incidents.forEach((i) => {
              if (i.recommendation === rec.id && i.status !== 'resolved') {
                i.status = 'resolved';
                i.resolution = 'Resolved by applying the guardrail “' + rec.title + '”. ' +
                  'Trust moved ' + before + ' → ' + D.trustOf(ag.dims) + '.';
              }
            });
            const r2 = s.recommendations.find((x) => x.id === rec.id);
            r2.status = 'applied'; r2.appliedAt = new Date().toISOString();
            const h = s.history[ag.id];
            h.push({ day: -1, value: D.trustOf(ag.dims), events: [{
              delta: D.trustOf(ag.dims) - before, title: 'Guardrail applied — ' + rec.title,
              cause: rec.description, resolution: 'Applied by ' + ADG.SESSION.name + '.' }] });
            s.appliedChanges.push({ recId: rec.id, agentId: ag.id, at: new Date().toISOString(), from: before, to: D.trustOf(ag.dims) });
          },
          audit: { agentId: rec.agentId, event: 'Guardrail applied', target: rec.id, category: 'change',
            detail: rec.title + '. ' + rec.description },
          notify: { level: 'resolved', title: 'Guardrail applied to ' + a.name,
            body: rec.title + '. Trust ' + before + ' → ' + D.trustOf(S.agent(rec.agentId).dims) + '.',
            route: '#/agents/' + rec.agentId },
          toast: { type: 'success', title: 'Guardrail applied',
            body: a.name + ': trust ' + before + ' → ' + D.trustOf(S.agent(rec.agentId).dims) +
              ', risk ' + beforeRisk.label + ' → ' + S.riskBand(S.agent(rec.agentId)).label + '. Audit event written.' }
        });
        if (d.back) setTimeout(() => ADG.actions['guard']({ id: d.back }), 320);
      }
    });
  };

  ADG.actions['rec-dismiss'] = function (d) {
    const rec = ADG.state.recommendations.find((r) => r.id === d.id);
    ADG.commit({
      mutate(s) { s.recommendations.find((r) => r.id === d.id).status = 'dismissed'; },
      audit: { agentId: rec.agentId, event: 'Recommendation dismissed', target: rec.id, category: 'change',
        detail: rec.title + ' — dismissed without applying.' },
      toast: { type: 'info', title: 'Recommendation dismissed', body: 'It stays in the audit trail and can be restored by resetting the demo.' }
    });
  };

  /* ------------------------------------------------------------- trust explanation */
  ADG.actions['trust-panel'] = function (d) {
    const a = S.agent(d.id);
    const t = S.trust(a), band = D.trustBand(t);
    const rows = ADG.contributions(a);
    const pos = rows.filter((r) => r.delta > 0), neg = rows.filter((r) => r.delta < 0);
    const hist = ADG.state.history[a.id].map((h) => h.value);
    const weakest = D.TRUST_DIMS.slice().sort((x, y) => a.dims[x] - a.dims[y])[0];
    ADG.openDrawer({
      title: 'Why is this agent at ' + t + '?',
      sub: esc(a.name) + ' · ' + esc(band.label) + ' · ' + esc(a.department),
      body:
        '<div style="display:flex;gap:18px;align-items:center;margin-bottom:16px">' +
          C.ring(t, { size: 118, stroke: 10, cap: band.label }) +
          '<div style="flex:1">' +
            '<p class="tiny muted" style="margin-bottom:8px">30-day trend</p>' +
            C.spark(hist, { w: 200, h: 46, tone: ADG.toneForTrust(t) }) +
            '<div class="tiny muted" style="margin-top:6px">' +
              (a.trustDelta7d === 0 ? 'Flat over 7 days' : (a.trustDelta7d > 0 ? '▲ +' : '▼ −') + Math.abs(a.trustDelta7d) + ' over 7 days') +
            '</div>' +
          '</div></div>' +
        '<div class="card card-pad" style="margin-bottom:14px">' +
          '<p class="tiny muted" style="margin-bottom:8px">Contribution against the 84-point fleet reference. Each dimension is weighted, so a weak dimension with a heavy weight moves the score most.</p>' +
          (pos.length ? pos.map(cRow).join('') : '') + (neg.length ? neg.map(cRow).join('') : '') +
        '</div>' +
        C.ai({
          kicker: 'AI assessment', confidence: 0.92,
          body: assessment(a, t, weakest),
          rows: [['Weakest', D.TRUST_WEIGHTS[weakest].label + ' at ' + a.dims[weakest] + ' (weight ' + Math.round(D.TRUST_WEIGHTS[weakest].w * 100) + '%)'],
                 ['Strongest', (function () { const k = D.TRUST_DIMS.slice().sort((x, y) => a.dims[y] - a.dims[x])[0]; return D.TRUST_WEIGHTS[k].label + ' at ' + a.dims[k]; })()],
                 ['Headroom', 'Bringing ' + D.TRUST_WEIGHTS[weakest].label + ' to the fleet median would add ' +
                   Math.max(1, Math.round((84 - a.dims[weakest]) * D.TRUST_WEIGHTS[weakest].w)) + ' points of trust']]
        }) +
        '<div class="sec"><div class="sec-head"><h2>Dimensions</h2><span class="sub">Select one for its evidence</span></div>' +
        '<div class="grid" style="gap:10px">' + D.TRUST_DIMS.map((k) =>
          '<button class="minicard" data-act="trust-dim" data-id="' + a.id + '" data-dim="' + k + '" style="text-align:left;width:100%">' +
          '<div class="mc-top"><b style="font-size:12.5px">' + esc(D.TRUST_WEIGHTS[k].label) + '</b>' +
          '<span class="num" style="margin-left:auto;font-weight:640;color:var(--' +
            (a.dims[k] >= 88 ? 'green' : a.dims[k] >= 75 ? 'blue' : a.dims[k] >= 60 ? 'amber' : 'red') + ')">' + a.dims[k] + '</span></div>' +
          '<div class="meter m-' + (a.dims[k] >= 88 ? 'green' : a.dims[k] >= 75 ? 'blue' : a.dims[k] >= 60 ? 'amber' : 'red') + '"><i style="width:' + a.dims[k] + '%"></i></div>' +
          '<p class="tiny muted" style="margin-top:6px">' + esc(D.TRUST_WEIGHTS[k].hint) + '</p></button>').join('') +
        '</div></div>',
      foot: '<button class="btn" data-act="open-agent" data-id="' + a.id + '">Investigate</button>' +
            '<button class="btn" data-act="goto" data-route="#/economics/optimization">Optimise</button>' +
            '<div style="flex:1"></div>' +
            (S.recsFor(a.id).length ? '<button class="btn blue" data-act="rec-simulate" data-id="' + S.recsFor(a.id)[0].id + '">Simulate fix</button>' : '')
    });
  };
  function cRow(r) {
    return '<div class="contrib ' + (r.delta > 0 ? 'pos' : 'neg') + '">' +
      '<span class="amt">' + (r.delta > 0 ? '+' : '−') + Math.abs(r.delta).toFixed(1) + '</span>' +
      '<span class="txt"><b style="font-weight:570">' + esc(D.TRUST_WEIGHTS[r.dim].label) + ' ' + r.value + '</b> — ' + esc(r.text) + '</span></div>';
  }
  function assessment(a, t, weakest) {
    if (t >= 90) return 'Trust is high and stable. ' + esc(D.TRUST_WEIGHTS[weakest].label) + ' at ' + a.dims[weakest] + ' is the only dimension below the fleet reference — worth watching, not acting on.';
    if (t >= 80) return 'Trust remains solid, but ' + esc(D.TRUST_WEIGHTS[weakest].label.toLowerCase()) + ' is deteriorating at ' + a.dims[weakest] + '. This is a single-dimension problem, not a systemic one.';
    if (t >= 70) return 'Trust has fallen into the monitored band. ' + esc(D.TRUST_WEIGHTS[weakest].label) + ' at ' + a.dims[weakest] +
      ' is the dominant cause — the agent is working around a boundary rather than escalating at it. A guardrail change addresses this directly; more monitoring will not.';
    return 'Trust is below the threshold at which autonomous action is defensible. ' + esc(D.TRUST_WEIGHTS[weakest].label) + ' at ' + a.dims[weakest] +
      ' should be treated as a containment problem: narrow the permission envelope first, then rebuild the score with evidence.';
  }

  ADG.actions['trust-dim'] = function (d) {
    const a = S.agent(d.id) || S.agent((ADG.route.parts || [])[1]);
    if (!a) return;
    const k = d.dim, meta = D.TRUST_WEIGHTS[k], v = a.dims[k];
    const ev = dimEvidence(a, k);
    ADG.openDrawer({
      title: esc(meta.label) + ' — ' + v,
      sub: esc(a.name) + ' · weight ' + Math.round(meta.w * 100) + '% of the trust score',
      body:
        '<div class="card card-pad" style="margin-bottom:14px">' +
          C.meterRow(meta.label, v, v >= 88 ? 'green' : v >= 75 ? 'blue' : v >= 60 ? 'amber' : 'red', v + '/100') +
          '<p class="tiny muted" style="margin-top:10px">' + esc(meta.hint) + '</p>' +
          '<p class="tiny" style="margin-top:8px">Contribution to the overall score: <b>' + (v * meta.w).toFixed(1) + ' of ' + S.trust(a) + ' points</b>.</p>' +
        '</div>' +
        '<div class="sec-head"><h2>Evidence</h2></div>' +
        '<div class="card card-pad"><ul class="auth-list ' + (v >= 80 ? 'can' : 'appr') + '">' +
        ev.map((e) => '<li><span class="m">' + (e.good ? '✓' : '!') + '</span><span>' + esc(e.text) + '</span></li>').join('') +
        '</ul></div>' +
        (S.recsFor(a.id).filter((r) => (r.dimDelta || {})[k]).length ?
          '<div class="sec">' + C.ai({ kicker: 'Available fix', confidence: 0.9,
            body: esc(S.recsFor(a.id).filter((r) => (r.dimDelta || {})[k])[0].title) + ' would move this dimension to ' +
              Math.min(100, v + S.recsFor(a.id).filter((r) => (r.dimDelta || {})[k])[0].dimDelta[k]) + '.',
            actions: '<button class="btn sm blue" data-act="rec-simulate" data-id="' + S.recsFor(a.id).filter((r) => (r.dimDelta || {})[k])[0].id + '">Simulate</button>'
          }) + '</div>' : ''),
      foot: '<button class="btn" data-act="trust-panel" data-id="' + a.id + '">Back to trust</button><div style="flex:1"></div>' +
            '<button class="btn primary" data-act="close-overlay">Close</button>'
    });
  };

  function dimEvidence(a, k) {
    const v = a.dims[k], viol = a.openViolations || 0;
    const allowed = Object.keys(a.permissions.tools).filter((t) => a.permissions.tools[t] === 'allow').length;
    const restricted = Object.keys(a.permissions.tools).filter((t) => a.permissions.tools[t] !== 'allow').length;
    const pending = Object.keys(a.permissions.data).filter((t) => a.permissions.data[t] === 'approval').length;
    const map = {
      reliability: [
        { good: a.successRate >= 95, text: a.successRate.toFixed(1) + '% of tasks completed successfully across ' + fmt.int(a.taskCount) + ' lifetime tasks' },
        { good: a.health.retryRate < 8, text: 'Retry rate ' + a.health.retryRate + '% against a 6% fleet median' },
        { good: a.health.failureRate < 3, text: 'Failure rate ' + a.health.failureRate + '% over the last 7 days' },
        { good: a.health.toolErrors < 10, text: a.health.toolErrors + ' tool errors per day' }
      ],
      policy: [
        { good: viol === 0, text: viol === 0 ? 'No open policy violations' : viol + ' open policy violations' },
        { good: true, text: ADG.state.policies.length + ' policies evaluated against every action' },
        { good: v >= 88, text: 'Clean evaluation rate ' + v + '% across the active policy set' }
      ],
      permission: [
        { good: viol === 0, text: viol === 0 ? '0 unauthorised actions in the last 7 days' : viol + ' blocked permission attempts in the last 7 days' },
        { good: true, text: allowed + ' tools allowed outright, ' + restricted + ' restricted or blocked' },
        { good: pending === 0, text: pending + ' data capabilities held behind approval' },
        { good: a.autonomousLimit <= 25000, text: a.autonomousLimit ? 'Autonomous value limit ' + fmt.usd(a.autonomousLimit) : 'No autonomous transaction authority' },
        { good: D.exposureOf(a) < 50, text: 'Exposure index ' + D.exposureOf(a) + '/100 across all granted capabilities' }
      ],
      dataIntegrity: [
        { good: v >= 85, text: v + '% of outputs traced to a verified source record' },
        { good: v >= 85, text: v >= 85 ? 'No source-contract failures this week' : 'Source-contract failures detected — records quarantined' },
        { good: true, text: 'Provenance recorded for every retrieval' }
      ],
      escalation: [
        { good: v >= 88, text: v >= 88 ? 'Escalated correctly at every boundary crossing' : 'Absorbed blocked actions without notifying the owner' },
        { good: true, text: S.decisionsFor(a.id).filter((d2) => d2.approvalRequired).length + ' decisions routed to a human this period' },
        { good: v >= 88, text: 'Median time to escalate: ' + (v >= 88 ? 'under 2 seconds' : 'over 4 minutes') }
      ],
      costEfficiency: [
        { good: a.currentCost <= a.budget, text: fmt.usd(a.currentCost) + ' spent against a ' + fmt.usd(a.budget) + ' budget' },
        { good: a.monthlyProjectedCost <= a.budget, text: 'Projected ' + fmt.usd(a.monthlyProjectedCost) + ' at the current run rate' },
        { good: true, text: 'Running on the ' + D.MODELS[a.model].tier.toLowerCase() + ' model tier (' + D.MODELS[a.model].name + ')' }
      ]
    };
    return map[k] || [];
  }

  /* ------------------------------------------------------------- drawers */
  ADG.actions['open-incident'] = function (d) {
    const i = ADG.state.incidents.find((x) => x.id === d.id);
    const a = S.agent(i.agentId);
    const rec = i.recommendation ? ADG.state.recommendations.find((r) => r.id === i.recommendation) : null;
    ADG.openDrawer({
      title: esc(i.title),
      sub: esc(a.name) + ' · ' + esc(i.id) + ' · ' + fmt.ago(i.timestamp),
      body:
        '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
          C.badge(i.severity === 'critical' ? 'Critical' : i.severity === 'high' ? 'High' : i.severity === 'medium' ? 'Medium' : 'Low',
            i.severity === 'critical' || i.severity === 'high' ? 'red' : i.severity === 'medium' ? 'amber' : 'blue', { glyph: '△' }) +
          C.status(i.status) + C.badge('Trust ' + S.trust(a), null, { sq: true }) + C.riskBadge(a) + '</div>' +
        '<div class="card card-pad" style="margin-bottom:12px"><h3 style="font-size:12.5px;margin-bottom:6px">What happened</h3>' +
          '<p style="font-size:12.5px;line-height:1.6;color:var(--ink-2)">' + esc(i.description) + '</p></div>' +
        '<div class="card card-pad" style="margin-bottom:12px"><h3 style="font-size:12.5px;margin-bottom:6px">Impact</h3>' +
          '<p style="font-size:12.5px;line-height:1.6;color:var(--ink-2)">' + esc(i.impact) + '</p></div>' +
        (i.resolution ? '<div class="card card-pad" style="margin-bottom:12px;background:var(--green-bg);border-color:var(--green-br)">' +
          '<h3 style="font-size:12.5px;margin-bottom:6px">Resolution</h3><p style="font-size:12.5px;line-height:1.6">' + esc(i.resolution) + '</p></div>' : '') +
        (rec ? C.ai({ kicker: 'Recommended fix', confidence: rec.confidence, body: '<b>' + esc(rec.title) + '</b><br>' + esc(rec.description),
          rows: [['Evidence', esc(rec.evidence)], ['Expected impact', 'Risk ↓ ' + rec.estimatedRiskReduction + '% · Cost ↓ ' + rec.estimatedCostReduction + '%']],
          actions: '<button class="btn sm" data-act="rec-simulate" data-id="' + rec.id + '">Simulate</button>' +
                   '<button class="btn sm blue" data-act="rec-apply" data-id="' + rec.id + '">Apply</button>' }) : ''),
      foot: '<button class="btn" data-act="open-agent" data-id="' + a.id + '">Open agent</button>' +
        '<div style="flex:1"></div>' +
        (i.status !== 'resolved' ? '<button class="btn" data-act="incident-investigate" data-id="' + i.id + '">Mark investigating</button>' +
          '<button class="btn green" data-act="incident-resolve" data-id="' + i.id + '">Resolve</button>' : '')
    });
  };
  ADG.actions['incident-investigate'] = (d) => ADG.commit({
    mutate(s) { s.incidents.find((i) => i.id === d.id).status = 'investigating'; },
    audit: { agentId: (ADG.state.incidents.find((i) => i.id === d.id) || {}).agentId, event: 'Incident status changed',
      target: d.id, detail: 'Moved to investigating.', category: 'incident' },
    toast: { type: 'info', title: 'Marked as investigating', body: d.id + ' is now assigned to you.' }
  });
  ADG.actions['incident-resolve'] = function (d) {
    const i = ADG.state.incidents.find((x) => x.id === d.id);
    ADG.confirm({
      title: 'Resolve ' + d.id + '?', confirmLabel: 'Resolve', tone: 'green',
      body: 'Resolving records the incident as closed and removes it from the attention queue. Risk is recalculated for <b>' + esc((S.agent(i.agentId) || {}).name) + '</b>.',
      onConfirm() {
        ADG.commit({
          mutate(s) {
            const x = s.incidents.find((y) => y.id === d.id);
            x.status = 'resolved';
            x.resolution = x.resolution || 'Resolved by ' + ADG.SESSION.name + ' after review.';
          },
          audit: { agentId: i.agentId, event: 'Incident resolved', target: d.id, detail: i.title, category: 'incident' },
          toast: { type: 'success', title: 'Incident resolved', body: d.id + ' closed. Risk recalculated across the fleet.' }
        });
      }
    });
  };

  ADG.actions['open-decision'] = function (d) {
    const dec = S.decision(d.id);
    const a = S.agent(dec.agentId);
    ADG.openDrawer({
      title: esc(dec.action),
      sub: esc(a.name) + ' · ' + esc(dec.id) + ' · ' + fmt.dateTime(dec.timestamp),
      body:
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">' + C.status(dec.status) +
          C.badge(dec.riskLevel === 'high' ? 'High risk' : dec.riskLevel === 'moderate' ? 'Moderate risk' : 'Low risk',
            dec.riskLevel === 'high' ? 'red' : dec.riskLevel === 'moderate' ? 'amber' : 'green', { glyph: '△' }) +
          (dec.amount ? C.badge(fmt.usd(dec.amount), null, { sq: true }) : '') +
          C.badge('Confidence ' + Math.round(dec.confidence * 100) + '%', 'blue', { sq: true }) + '</div>' +
        '<div class="kv-list" style="margin-bottom:14px">' +
          '<div class="kv-row"><span class="k">Objective</span><span class="v">' + esc(dec.objective) + '</span></div>' +
          '<div class="kv-row"><span class="k">Policy evaluated</span><span class="v">' + esc(dec.policyLabel) + '</span></div>' +
          '<div class="kv-row"><span class="k">Tools used</span><span class="v">' + esc((dec.toolsUsed || []).join(', ')) + '</span></div>' +
          (dec.approver ? '<div class="kv-row"><span class="k">Approver</span><span class="v">' + esc(dec.approver) + '</span></div>' : '') +
          (dec.outcome ? '<div class="kv-row"><span class="k">Outcome</span><span class="v">' + esc(dec.outcome) + '</span></div>' : '') +
        '</div>' +
        (dec.timeline ?
          '<div class="sec-head"><h2>Execution timeline</h2><span class="sub">Observable events and evidence — not model reasoning</span></div>' +
          C.timeline(dec.timeline, 'dw-' + dec.id) :
          '<div class="card card-pad"><p class="tiny muted">No step-level trace was retained for this decision. Retention is 7 days for routine low-risk actions and 400 days for anything that crossed a policy boundary.</p></div>'),
      foot: '<button class="btn" data-act="open-agent" data-id="' + a.id + '">Open agent</button><div style="flex:1"></div>' +
        (dec.approvalStatus === 'pending' ? '<button class="btn blue" data-act="guard" data-id="' + dec.id + '">Open Decision Guard</button>' : '')
    });
  };
})(window);
