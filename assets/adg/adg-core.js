/* Agent Decision Guard — core runtime.
 * State store, router, derived selectors, SVG chart primitives, component
 * library and the overlay system (drawer / modal / toast / command palette).
 * Built by Puneet Arora.
 */
(function (global) {
  'use strict';
  const D = global.ADG_DATA;
  const R = global.ADG_RECORDS;

  const ADG = global.ADG = {};
  const esc = ADG.esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ------------------------------------------------------------- formatting */
  const fmt = ADG.fmt = {
    usd(v, opts) {
      const o = opts || {};
      const n = Math.abs(v);
      if (o.compact && n >= 1000) {
        return (v < 0 ? '-$' : '$') + (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
             : (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'K');
      }
      return (v < 0 ? '-$' : '$') + Math.round(n).toLocaleString('en-US');
    },
    int(v) { return Math.round(v).toLocaleString('en-US'); },
    pct(v, dp) { return (v == null ? '—' : Number(v).toFixed(dp == null ? 1 : dp) + '%'); },
    signed(v, dp) { const n = Number(v); return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(dp || 0); },
    time(iso) {
      return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    },
    dateTime(iso) {
      return new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
      }) + ' IST';
    },
    date(iso) {
      return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
    },
    ago(iso) {
      const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return mins + 'm ago';
      const h = Math.round(mins / 60);
      if (h < 24) return h + 'h ago';
      const d = Math.round(h / 24);
      return d + 'd ago';
    }
  };

  /* ------------------------------------------------------------- state */
  const SESSION = { name: 'Alex Mehta', initials: 'AM', role: 'AI Operations Manager', city: 'Bengaluru' };
  ADG.SESSION = SESSION;

  function freshState() {
    return {
      mode: 'operator',
      agents: clone(D.AGENTS),
      decisions: clone(R.DECISIONS),
      incidents: clone(R.INCIDENTS),
      policies: clone(R.POLICIES),
      recommendations: clone(R.RECOMMENDATIONS),
      notifications: clone(R.NOTIFICATIONS),
      audit: clone(R.AUDIT_SEED),
      history: R.buildHistory(),
      fleet: R.fleetSeries(),
      simulations: {},
      compare: ['ag-support', 'ag-procurement'],
      savedViews: [
        { id: 'sv-1', name: 'My department', filter: 'all', q: '', dept: 'Procurement' },
        { id: 'sv-2', name: 'Needs a decision', filter: 'approval', q: '', dept: 'all' },
        { id: 'sv-3', name: 'Trust below 80', filter: 'lowtrust', q: '', dept: 'all' }
      ],
      cols: { status: true, trust: true, health: true, risk: true, success: true, cost: true, tasks: true, last: true },
      appliedChanges: [], auditSeq: 9412, loading: false
    };
  }
  ADG.state = freshState();

  const listeners = [];
  ADG.subscribe = (fn) => listeners.push(fn);
  ADG.notifyAll = () => listeners.forEach((f) => f());

  /* commit(): the single mutation path. Every commit can write an audit event,
     raise a toast and re-render. Nothing else mutates state. */
  ADG.commit = function (opts) {
    const s = ADG.state;
    if (opts.mutate) opts.mutate(s);
    if (opts.audit) {
      s.auditSeq += 1;
      s.audit.unshift(Object.assign({
        id: 'AUD-' + s.auditSeq, time: new Date().toISOString(),
        actor: SESSION.name, actorType: 'human', category: 'change'
      }, opts.audit));
    }
    if (opts.notify) {
      s.notifications.unshift(Object.assign({
        id: 'ntf-' + Date.now(), time: new Date().toISOString(), read: false, route: location.hash
      }, opts.notify));
    }
    ADG.notifyAll();
    if (opts.toast) ADG.toast(opts.toast.type || 'success', opts.toast.title, opts.toast.body);
  };

  ADG.resetDemo = function () {
    const mode = ADG.state.mode;
    ADG.state = freshState();
    ADG.state.mode = mode;
    ADG.notifyAll();
    ADG.toast('info', 'Demo reset', 'The fleet, incidents, approvals and audit trail are back to their seed state.');
  };

  /* ------------------------------------------------------------- selectors */
  const S = ADG.sel = {
    agent: (id) => ADG.state.agents.find((a) => a.id === id),
    trust: (a) => D.trustOf(a.dims),
    band: (a) => D.trustBand(D.trustOf(a.dims)),
    health: (a) => D.healthOf(a.health),
    healthBand: (a) => D.healthBand(D.healthOf(a.health)),
    risk: (a) => D.riskOf(a, { incidents: ADG.state.incidents }),
    riskBand: (a) => D.riskBand(D.riskOf(a, { incidents: ADG.state.incidents })),
    exposure: (a) => D.exposureOf(a),
    decisionsFor: (id) => ADG.state.decisions.filter((d) => d.agentId === id),
    incidentsFor: (id) => ADG.state.incidents.filter((i) => i.agentId === id),
    recsFor: (id) => ADG.state.recommendations.filter((r) => r.agentId === id && r.status === 'open'),
    openIncidents: () => ADG.state.incidents.filter((i) => i.status !== 'resolved'),
    pending: () => ADG.state.decisions.filter((d) => d.approvalStatus === 'pending'),
    decision: (id) => ADG.state.decisions.find((d) => d.id === id),
    unread: () => ADG.state.notifications.filter((n) => !n.read).length,
    kpis() {
      const s = ADG.state, ag = s.agents;
      const tw = ag.reduce((x, a) => x + S.trust(a) * a.taskCount, 0) / ag.reduce((x, a) => x + a.taskCount, 0);
      const evals = s.policies.reduce((x, p) => x + p.evaluations, 0);
      const viol = s.policies.reduce((x, p) => x + p.violations, 0);
      return {
        agents: ag.length,
        active: ag.filter((a) => a.status !== 'offline').length,
        trust: Math.round(tw),
        compliance: 100 - (viol / evals) * 100,
        spend: ag.reduce((x, a) => x + a.currentCost, 0),
        projected: ag.reduce((x, a) => x + a.monthlyProjectedCost, 0),
        budget: ag.reduce((x, a) => x + a.budget, 0),
        critical: s.incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length,
        reviews: S.pending().length,
        atRisk: ag.filter((a) => ['high', 'critical'].indexOf(S.riskBand(a).key) !== -1).length,
        decisions: s.decisions.length,
        violations: viol
      };
    },
    /* Attention queue: one ranked list feeding the Command Center and the queue view. */
    attention() {
      const out = [];
      ADG.state.decisions.filter((d) => d.approvalStatus === 'pending' && d.guard).forEach((d) => {
        const a = S.agent(d.agentId);
        out.push({
          key: 'dec-' + d.id, rank: d.riskLevel === 'high' ? 96 : 70, sev: d.riskLevel === 'high' ? 'critical' : 'medium',
          agentId: a.id, title: a.name, kind: 'Approval required',
          desc: d.action + (d.amount ? '' : ''),
          why: d.flags && d.flags.length ? d.flags[0].detail : d.recommendation,
          actions: [{ label: 'Review decision', act: 'guard', id: d.id, primary: true },
                    { label: 'Investigate', act: 'open-decision', id: d.id }]
        });
      });
      S.openIncidents().forEach((i) => {
        const a = S.agent(i.agentId); if (!a) return;
        const t = S.trust(a);
        out.push({
          key: 'inc-' + i.id, rank: i.severity === 'critical' ? 92 : i.severity === 'high' ? 74 : 46,
          sev: i.severity === 'critical' ? 'critical' : i.severity === 'high' ? 'high' : 'medium',
          agentId: a.id, title: a.name, kind: i.title,
          desc: i.agentId === 'ag-procurement'
            ? 'Trust dropped from 89 to ' + t + '. ' + i.title + '.'
            : i.title + '.',
          why: i.impact,
          actions: [{ label: 'Investigate', act: 'open-incident', id: i.id, primary: true },
                    { label: 'View agent', act: 'open-agent', id: a.id }]
        });
      });
      ADG.state.agents.forEach((a) => {
        const over = a.monthlyProjectedCost / a.budget;
        if (over > 1.3 && !out.some((o) => o.agentId === a.id && /cost|spend/i.test(o.kind))) {
          out.push({
            key: 'cost-' + a.id, rank: 60 + Math.round((over - 1) * 20), sev: 'medium', agentId: a.id,
            title: a.name, kind: 'Cost trajectory',
            desc: 'Projected monthly cost increased ' + Math.round((over - 1) * 100) + '%.',
            why: 'Projected ' + fmt.usd(a.monthlyProjectedCost) + ' against a ' + fmt.usd(a.budget) + ' budget.',
            actions: [{ label: 'Optimise', act: 'goto', route: '#/economics/optimization', primary: true },
                      { label: 'View agent', act: 'open-agent', id: a.id }]
          });
        }
      });
      return out.sort((x, y) => y.rank - x.rank);
    }
  };

  /* ------------------------------------------------------------- trust explanation */
  ADG.contributions = function (agent) {
    const base = 84; /* fleet reference point the narrative is written against */
    const rows = [];
    D.TRUST_DIMS.forEach((k) => {
      const meta = D.TRUST_WEIGHTS[k];
      const delta = (agent.dims[k] - base) * meta.w;
      if (Math.abs(delta) < 0.35) return;
      rows.push({ dim: k, label: meta.label, value: agent.dims[k], delta: Math.round(delta * 10) / 10, text: EVID(agent, k) });
    });
    return rows.sort((a, b) => b.delta - a.delta);
  };
  function EVID(a, k) {
    const v = a.dims[k];
    const T = {
      reliability: [v + '% of tasks completed without human rework', 'Retry rate at ' + a.health.retryRate + '% against a 6% fleet median'],
      policy: ['Policy evaluations clean at ' + v + '%', (a.openViolations || 0) + ' open policy violations'],
      permission: [(a.openViolations ? a.openViolations + ' blocked permission attempts in 7 days' : 'Zero unauthorised tool calls'),
                   'Exposure index ' + D.exposureOf(a) + '/100 across granted capabilities'],
      dataIntegrity: ['Outputs traced to verified source records at ' + v + '%', 'Source contract failures logged this week'],
      escalation: [v >= 88 ? 'Escalated correctly at every boundary crossing' : 'Absorbed blocks without escalating to the owner'],
      costEfficiency: [fmt.usd(a.currentCost) + ' spent against a ' + fmt.usd(a.budget) + ' budget',
                       'Projected ' + fmt.usd(a.monthlyProjectedCost) + ' at current run rate']
    };
    const list = T[k] || [''];
    return (v >= 84 ? list[0] : (list[1] || list[0]));
  }

  /* ------------------------------------------------------------- simulation engine */
  /* A proposed change is a set of control values. Controls map to dimension
     deltas, cost multipliers and success-rate effects — the same function the
     Decision Simulator, the recommendation cards and Decision Guard all use. */
  ADG.simulate = function (agent, controls) {
    const before = {
      dims: Object.assign({}, agent.dims), trust: S.trust(agent), risk: S.risk(agent),
      cost: agent.monthlyProjectedCost, success: agent.successRate, exposure: D.exposureOf(agent),
      health: S.health(agent), limit: agent.autonomousLimit, model: agent.model
    };
    const dims = Object.assign({}, agent.dims);
    const perms = clone(agent.permissions);
    let cost = agent.monthlyProjectedCost, success = agent.successRate, limit = agent.autonomousLimit;
    let model = agent.model;
    const notes = [];

    if (controls.autonomousLimit != null && controls.autonomousLimit !== agent.autonomousLimit) {
      const lower = controls.autonomousLimit < agent.autonomousLimit;
      const ratio = agent.autonomousLimit === 0 ? 1
        : Math.abs(controls.autonomousLimit - agent.autonomousLimit) / Math.max(agent.autonomousLimit, 1);
      const mag = Math.min(34, Math.round(ratio * 46));
      dims.permission += lower ? mag : -Math.round(mag * 0.8);
      dims.escalation += lower ? Math.round(mag * 0.7) : -Math.round(mag * 0.6);
      dims.policy += lower ? Math.round(mag * 0.6) : -Math.round(mag * 0.5);
      success += lower ? -0.2 : 0.3;
      cost = Math.round(cost * (lower ? 0.98 : 1.01));
      limit = controls.autonomousLimit;
      notes.push((lower ? 'Lowering' : 'Raising') + ' the autonomous limit to ' + fmt.usd(controls.autonomousLimit) +
        (lower ? ' moves more value across the human boundary — permission safety and escalation both improve, throughput dips slightly.'
               : ' widens autonomous authority — throughput improves but permission safety falls.'));
    }
    if (controls.perm) {
      Object.keys(controls.perm).forEach((path) => {
        const [group, key] = path.split('::');
        const from = perms[group][key], to = controls.perm[path];
        if (from === to) return;
        perms[group][key] = to;
        const w = D.PERM_WEIGHTS[group][key] || 0;
        const dExp = (D.GRANT_FACTOR[from] - D.GRANT_FACTOR[to]) * w;
        dims.permission += Math.round(dExp * 1.5);
        dims.policy += Math.round(dExp * 0.8);
        if (to === 'block') { success -= 0.5; cost = Math.round(cost * 0.985); }
        else if (to === 'approval') { success -= 0.2; }
        else { success += 0.3; }
        notes.push(key + ' moved from ' + LBL[from] + ' to ' + LBL[to] + '.');
      });
    }
    if (controls.model && controls.model !== agent.model) {
      const from = D.MODELS[agent.model], to = D.MODELS[controls.model];
      cost = Math.round(cost * (to.costPerKTask / from.costPerKTask));
      const q = (to.quality - from.quality) * 100;
      dims.costEfficiency += Math.round((from.costPerKTask - to.costPerKTask) * 62);
      dims.reliability += Math.round(q * 0.7);
      success += q * 0.5;
      model = controls.model;
      notes.push('Model tier moved to ' + to.tier + ' — unit cost ' +
        (to.costPerKTask < from.costPerKTask ? 'falls ' : 'rises ') +
        Math.abs(Math.round((1 - to.costPerKTask / from.costPerKTask) * 100)) + '%.');
    }
    if (controls.maxRetries != null && controls.maxRetries !== 6) {
      const d = 6 - controls.maxRetries;
      dims.costEfficiency += d * 3;
      dims.reliability += d * 1.6;
      cost = Math.round(cost * (1 - d * 0.045));
      success -= d * 0.22;
      notes.push('Capping retries at ' + controls.maxRetries + ' stops failed work compounding into spend.');
    }
    if (controls.budget != null && controls.budget !== agent.budget) {
      const head = controls.budget / Math.max(agent.monthlyProjectedCost, 1);
      dims.costEfficiency += head >= 1 ? 4 : -6;
      notes.push('Budget set to ' + fmt.usd(controls.budget) + ' — ' +
        (head >= 1 ? 'projection now fits inside the cap.' : 'projection still overruns the cap.'));
    }
    if (controls.escalateOnBlock) { dims.escalation += 14; dims.policy += 6; notes.push('Every blocked action now raises an owner escalation.'); }
    if (controls.dualApproval)   { dims.policy += 9; dims.permission += 6; success -= 0.4; notes.push('New-supplier orders now need two named approvers.'); }
    if (controls.minConfidence)  { dims.dataIntegrity += 11; dims.policy += 8; success -= 2.4; notes.push('Low-confidence proposals are withheld rather than escalated.'); }
    if (controls.contractTest)   { dims.dataIntegrity += 24; dims.reliability += 7; notes.push('Upstream contract tests catch drift before it reaches the agent.'); }
    if (controls.preIndex)       { dims.reliability += 5; dims.costEfficiency += 9; success += 1.2; notes.push('Pre-indexing removes the per-contract re-parse.'); }
    if (controls.cacheExtract)   { dims.costEfficiency += 11; cost = Math.round(cost * 0.86); notes.push('Warehouse extract is cached across report sections.'); }

    D.TRUST_DIMS.forEach((k) => { dims[k] = Math.round(D.clamp(dims[k], 0, 100)); });
    success = Number(D.clamp(success, 0, 100).toFixed(1));

    const proposed = Object.assign({}, agent, {
      dims, permissions: perms, autonomousLimit: limit, monthlyProjectedCost: cost, successRate: success, model
    });
    const after = {
      dims, trust: D.trustOf(dims), risk: D.riskOf(proposed, { incidents: ADG.state.incidents.filter((i) => i.status !== 'resolved') }),
      cost, success, exposure: D.exposureOf(proposed), health: S.health(agent), limit, model
    };
    return { before, after, notes, proposed, controls };
  };
  const LBL = { allow: 'Allowed', approval: 'Approval required', block: 'Blocked' };
  ADG.PERM_LABEL = LBL;

  /* ------------------------------------------------------------- svg charts */
  const C = ADG.C = {};
  const TONE = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)', blue: 'var(--blue)', purple: 'var(--purple)', slate: 'var(--slate)' };
  const toneForTrust = ADG.toneForTrust = (t) => t >= 90 ? 'green' : t >= 80 ? 'blue' : t >= 70 ? 'amber' : 'red';
  const toneForRisk = ADG.toneForRisk = (k) => k === 'low' ? 'green' : k === 'moderate' ? 'amber' : 'red';
  const toneForHealth = ADG.toneForHealth = (v) => v >= 92 ? 'green' : v >= 80 ? 'blue' : v >= 65 ? 'amber' : 'red';

  C.ring = function (value, opts) {
    const o = Object.assign({ size: 130, stroke: 10, cap: '', tone: toneForTrust(value), cls: '' }, opts || {});
    const r = (o.size - o.stroke) / 2, c = 2 * Math.PI * r;
    const off = c * (1 - D.clamp(value, 0, 100) / 100);
    return '<div class="ring ' + o.cls + '" role="img" aria-label="' + esc(o.aria || (o.cap + ' ' + value + ' out of 100')) + '">' +
      '<svg width="' + o.size + '" height="' + o.size + '" viewBox="0 0 ' + o.size + ' ' + o.size + '" aria-hidden="true">' +
        '<circle cx="' + o.size / 2 + '" cy="' + o.size / 2 + '" r="' + r + '" fill="none" stroke="var(--surface-3)" stroke-width="' + o.stroke + '"/>' +
        '<circle cx="' + o.size / 2 + '" cy="' + o.size / 2 + '" r="' + r + '" fill="none" stroke="' + TONE[o.tone] + '" stroke-width="' + o.stroke +
          '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" style="transition:stroke-dashoffset .6s var(--ease)"/>' +
      '</svg>' +
      '<div class="ring-inner"><div class="ring-val">' + value + '</div>' +
        (o.cap ? '<div class="ring-cap">' + esc(o.cap) + '</div>' : '') + '</div></div>';
  };

  C.radar = function (dims, opts) {
    const o = Object.assign({ size: 260, interactive: true, compare: null }, opts || {});
    /* The viewBox is wider than it is tall so the axis labels have room to sit
       outside the polygon without being clipped at the edges. */
    const W = o.size + 130, H = o.size;
    const cx = W / 2, cy = H / 2, rad = o.size / 2 - 46;
    const keys = D.TRUST_DIMS, n = keys.length;
    const pt = (i, v) => {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + Math.cos(ang) * rad * (v / 100), cy + Math.sin(ang) * rad * (v / 100)];
    };
    let g = '';
    [25, 50, 75, 100].forEach((lv) => {
      const p = keys.map((_, i) => pt(i, lv).join(',')).join(' ');
      g += '<polygon points="' + p + '" fill="none" stroke="var(--border)" stroke-width="1"/>';
    });
    keys.forEach((_, i) => {
      const [x, y] = pt(i, 100);
      g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '" stroke="var(--border)" stroke-width="1"/>';
    });
    if (o.compare) {
      const p2 = keys.map((k, i) => pt(i, o.compare[k]).join(',')).join(' ');
      g += '<polygon points="' + p2 + '" fill="rgba(98,68,196,.10)" stroke="var(--purple)" stroke-width="1.6" stroke-dasharray="4 3"/>';
    }
    const p = keys.map((k, i) => pt(i, dims[k]).join(',')).join(' ');
    g += '<polygon points="' + p + '" fill="rgba(42,92,224,.13)" stroke="var(--blue)" stroke-width="2"/>';
    keys.forEach((k, i) => {
      const [x, y] = pt(i, dims[k]);
      g += '<circle cx="' + x + '" cy="' + y + '" r="3.4" fill="var(--surface)" stroke="var(--blue)" stroke-width="2"/>';
    });
    keys.forEach((k, i) => {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      const lx = cx + Math.cos(ang) * (rad + 24), ly = cy + Math.sin(ang) * (rad + 20);
      const anchor = Math.abs(Math.cos(ang)) < 0.3 ? 'middle' : (Math.cos(ang) > 0 ? 'start' : 'end');
      const short = D.TRUST_WEIGHTS[k].label.split(' ')[D.TRUST_WEIGHTS[k].label.split(' ').length - 1];
      g += '<g class="radar-axis" ' + (o.interactive ? 'style="cursor:pointer" data-act="trust-dim" data-dim="' + k + '"' : '') + '>' +
        '<text x="' + lx + '" y="' + (ly - 4) + '" text-anchor="' + anchor + '" font-size="10" fill="var(--ink-3)">' + esc(short) + '</text>' +
        '<text x="' + lx + '" y="' + (ly + 8) + '" text-anchor="' + anchor + '" font-size="11.5" font-weight="640" fill="var(--ink)">' + dims[k] + '</text></g>';
    });
    return '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Trust dimensions: ' +
      keys.map((k) => D.TRUST_WEIGHTS[k].label + ' ' + dims[k]).join(', ') + '">' + g + '</svg>';
  };

  C.spark = function (values, opts) {
    const o = Object.assign({ w: 96, h: 26, tone: 'slate', fill: true }, opts || {});
    if (!values.length) return '';
    const min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    const span = max - min || 1;
    const pts = values.map((v, i) => [
      (i / (values.length - 1)) * o.w,
      o.h - 2 - ((v - min) / span) * (o.h - 5)
    ]);
    const dline = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = dline + ' L' + o.w + ' ' + o.h + ' L0 ' + o.h + ' Z';
    return '<svg class="spark" width="' + o.w + '" height="' + o.h + '" viewBox="0 0 ' + o.w + ' ' + o.h + '" aria-hidden="true">' +
      (o.fill ? '<path d="' + area + '" fill="' + TONE[o.tone] + '" opacity=".10"/>' : '') +
      '<path d="' + dline + '" fill="none" stroke="' + TONE[o.tone] + '" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + pts[pts.length - 1][0].toFixed(1) + '" cy="' + pts[pts.length - 1][1].toFixed(1) + '" r="2.2" fill="' + TONE[o.tone] + '"/></svg>';
  };

  C.lineChart = function (series, opts) {
    const o = Object.assign({ h: 220, yMin: null, yMax: null, yFmt: (v) => v, xLabels: [], clickable: false, band: null }, opts || {});
    const W = 1000, H = o.h, P = { t: 14, r: 16, b: 26, l: 40 };
    const all = series.reduce((a, s) => a.concat(s.values), []);
    const lo = o.yMin != null ? o.yMin : Math.min.apply(null, all) - 2;
    const hi = o.yMax != null ? o.yMax : Math.max.apply(null, all) + 2;
    const n = series[0].values.length;
    const X = (i) => P.l + (i / (n - 1)) * (W - P.l - P.r);
    const Y = (v) => P.t + (1 - (v - lo) / (hi - lo || 1)) * (H - P.t - P.b);
    let g = '';
    for (let i = 0; i <= 4; i++) {
      const v = lo + ((hi - lo) * i) / 4, y = Y(v);
      g += '<line x1="' + P.l + '" y1="' + y.toFixed(1) + '" x2="' + (W - P.r) + '" y2="' + y.toFixed(1) + '" stroke="var(--border)" stroke-width="1" stroke-dasharray="' + (i ? '3 4' : '0') + '"/>' +
           '<text x="' + (P.l - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" font-size="10" fill="var(--ink-4)">' + esc(o.yFmt(v)) + '</text>';
    }
    if (o.band) {
      g += '<rect x="' + P.l + '" y="' + Y(o.band[1]) + '" width="' + (W - P.l - P.r) + '" height="' + (Y(o.band[0]) - Y(o.band[1])) + '" fill="var(--green)" opacity=".05"/>';
    }
    series.forEach((s) => {
      const pts = s.values.map((v, i) => [X(i), Y(v)]);
      const dl = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      if (s.fill !== false) g += '<path d="' + dl + ' L' + X(n - 1) + ' ' + (H - P.b) + ' L' + P.l + ' ' + (H - P.b) + ' Z" fill="' + TONE[s.tone || 'blue'] + '" opacity=".08"/>';
      g += '<path d="' + dl + '" fill="none" stroke="' + TONE[s.tone || 'blue'] + '" stroke-width="2" stroke-linejoin="round" ' + (s.dash ? 'stroke-dasharray="5 4"' : '') + '/>';
      s.values.forEach((v, i) => {
        const marked = s.marks && s.marks[i];
        g += '<g ' + (o.clickable ? 'style="cursor:pointer" data-act="' + o.clickAct + '" data-i="' + i + '"' : '') + '>' +
          '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="' + (marked ? 4.6 : 2.6) + '" fill="' + (marked ? TONE.red : 'var(--surface)') + '" stroke="' + (marked ? TONE.red : TONE[s.tone || 'blue']) + '" stroke-width="1.8"/>' +
          (o.clickable ? '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="11" fill="transparent"><title>' + esc((o.xLabels[i] || '') + ': ' + v) + '</title></circle>' : '') +
          '</g>';
      });
    });
    o.xLabels.forEach((lb, i) => {
      if (!lb) return;
      g += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="10" fill="var(--ink-4)">' + esc(lb) + '</text>';
    });
    return '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="height:' + H + 'px" role="img" aria-label="' + esc(o.aria || 'Line chart') + '">' + g + '</svg>';
  };

  C.barChart = function (rows, opts) {
    const o = Object.assign({ fmt: (v) => v, tone: 'blue', act: null, max: null }, opts || {});
    const max = o.max || Math.max.apply(null, rows.map((r) => r.value)) || 1;
    return '<div class="grid" style="gap:9px">' + rows.map((r) =>
      '<div ' + (o.act ? 'data-act="' + o.act + '" data-id="' + esc(r.id) + '" style="cursor:pointer"' : '') + '>' +
        '<div style="display:flex;gap:10px;align-items:baseline;margin-bottom:4px">' +
          '<span style="font-size:12.5px;color:var(--ink-2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(r.label) + '</span>' +
          '<span class="num" style="margin-left:auto;font-size:12.5px;font-weight:590">' + esc(o.fmt(r.value)) + '</span>' +
          (r.note ? '<span class="tiny muted nowrap">' + esc(r.note) + '</span>' : '') +
        '</div>' +
        '<div class="meter m-' + (r.tone || o.tone) + '"><i style="width:' + ((r.value / max) * 100).toFixed(1) + '%"></i></div>' +
      '</div>').join('') + '</div>';
  };

  C.donut = function (slices, opts) {
    const o = Object.assign({ size: 168, stroke: 22, center: '', centerSub: '' }, opts || {});
    const total = slices.reduce((s, x) => s + x.value, 0) || 1;
    const r = (o.size - o.stroke) / 2, c = 2 * Math.PI * r;
    let acc = 0, g = '';
    slices.forEach((s) => {
      const frac = s.value / total;
      g += '<circle cx="' + o.size / 2 + '" cy="' + o.size / 2 + '" r="' + r + '" fill="none" stroke="' + (TONE[s.tone] || s.tone) +
        '" stroke-width="' + o.stroke + '" stroke-dasharray="' + (c * frac - 2).toFixed(1) + ' ' + (c - c * frac + 2).toFixed(1) +
        '" stroke-dashoffset="' + (-c * acc).toFixed(1) + '"><title>' + esc(s.label + ': ' + s.value) + '</title></circle>';
      acc += frac;
    });
    return '<div class="ring"><svg width="' + o.size + '" height="' + o.size + '" viewBox="0 0 ' + o.size + ' ' + o.size + '" aria-hidden="true">' + g + '</svg>' +
      (o.center ? '<div class="ring-inner"><div class="ring-val" style="font-size:20px">' + esc(o.center) + '</div>' +
        (o.centerSub ? '<div class="ring-cap">' + esc(o.centerSub) + '</div>' : '') + '</div>' : '') + '</div>';
  };

  /* ------------------------------------------------------------- components */
  C.badge = (label, tone, opts) => {
    const o = opts || {};
    return '<span class="badge ' + (tone ? 'b-' + tone : '') + (o.sq ? ' sq' : '') + (o.lg ? ' lg' : '') + '"' +
      (o.title ? ' title="' + esc(o.title) + '"' : '') + '>' +
      (o.dot ? '<span class="dot' + (o.pulse ? ' pulse' : '') + '"></span>' : '') +
      (o.glyph ? '<span class="glyph" aria-hidden="true">' + o.glyph + '</span>' : '') + esc(label) + '</span>';
  };

  const STATUS = {
    active:              { label: 'Active',            tone: 'green',  glyph: '●', pulse: true },
    warning:             { label: 'Warning',           tone: 'amber',  glyph: '▲' },
    critical:            { label: 'Critical',          tone: 'red',    glyph: '■' },
    'awaiting-approval': { label: 'Awaiting approval', tone: 'amber',  glyph: '⏸' },
    blocked:             { label: 'Blocked',           tone: 'red',    glyph: '⊘' },
    investigating:       { label: 'Investigating',     tone: 'blue',   glyph: '◎' },
    resolved:            { label: 'Resolved',          tone: 'green',  glyph: '✓' },
    completed:           { label: 'Completed',         tone: 'green',  glyph: '✓' },
    approved:            { label: 'Approved',          tone: 'green',  glyph: '✓' },
    rejected:            { label: 'Rejected',          tone: 'red',    glyph: '✕' },
    simulated:           { label: 'Simulated',         tone: 'purple', glyph: '◇' },
    open:                { label: 'Open',              tone: 'amber',  glyph: '○' },
    offline:             { label: 'Offline',           tone: null,     glyph: '○' },
    pending:             { label: 'Pending review',    tone: 'amber',  glyph: '⏸' },
    applied:             { label: 'Applied',           tone: 'green',  glyph: '✓' },
    dismissed:           { label: 'Dismissed',         tone: null,     glyph: '–' }
  };
  ADG.STATUS = STATUS;
  C.status = (key, opts) => {
    const m = STATUS[key] || { label: key, tone: null, glyph: '•' };
    return C.badge(m.label, m.tone, Object.assign({ glyph: m.glyph }, opts || {}));
  };
  C.riskBadge = (a) => { const b = S.riskBand(a); return C.badge(b.label, toneForRisk(b.key), { glyph: b.key === 'low' ? '▽' : b.key === 'moderate' ? '◇' : '△', title: 'Risk index ' + S.risk(a) + '/100' }); };
  C.trustCell = (a) => {
    const t = S.trust(a), b = D.trustBand(t);
    return '<button class="trust-pill" data-act="trust-panel" data-id="' + a.id + '" title="' + esc(b.label + ' — open the trust breakdown') + '">' +
      '<b style="color:' + TONE[toneForTrust(t)] + '">' + t + '</b><span class="out">/100</span></button>';
  };
  C.healthCell = (a) => {
    const v = S.health(a);
    return '<span class="num" style="font-weight:570;color:' + TONE[toneForHealth(v)] + '" title="' + esc(S.healthBand(a).label) + '">' + v + '</span>';
  };
  C.initials = (name) => name.split(' ').filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');

  C.kpi = function (o) {
    return '<button class="kpi ' + (o.cls || '') + '" data-act="' + (o.act || 'noop') + '"' +
      (o.route ? ' data-route="' + esc(o.route) + '"' : '') + (o.id ? ' data-id="' + esc(o.id) + '"' : '') + '>' +
      '<div class="kpi-top"><span class="kpi-label">' + esc(o.label) + '</span>' +
        (o.badge || '') + '</div>' +
      '<div class="kpi-val">' + o.value + (o.unit ? '<span class="unit">' + esc(o.unit) + '</span>' : '') + '</div>' +
      '<div class="kpi-foot">' + (o.foot || '') + '</div></button>';
  };

  C.meterRow = (label, value, tone, valText) =>
    '<div class="meter-row"><span class="lbl">' + esc(label) + '</span>' +
    '<span class="val">' + esc(valText != null ? valText : value) + '</span>' +
    '<span class="meter m-' + tone + '"><i style="width:' + D.clamp(value, 0, 100) + '%"></i></span></div>';

  C.ai = function (o) {
    return '<div class="ai"><div class="ai-head">' +
      '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--purple)"><path d="M8 1.5 9.6 5.9 14 7.5 9.6 9.1 8 13.5 6.4 9.1 2 7.5 6.4 5.9Z" stroke-linejoin="round"/></svg>' +
      '<span class="t">' + esc(o.kicker || 'AI assessment') + '</span>' +
      (o.confidence != null ? '<span class="conf">Confidence ' + Math.round(o.confidence * 100) + '%</span>' : '') +
      '</div><div class="ai-body">' + o.body + '</div>' +
      (o.rows ? '<div class="ai-ev">' + o.rows.map((r) => '<div class="row"><span class="k">' + esc(r[0]) + '</span><span>' + r[1] + '</span></div>').join('') + '</div>' : '') +
      (o.actions ? '<div class="btn-row" style="margin-top:11px">' + o.actions + '</div>' : '') + '</div>';
  };

  C.empty = (o) => '<div class="empty"><div class="ei">' +
    (o.glyph || '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="6.5"/><path d="m14 14 4 4"/></svg>') +
    '</div><h3>' + esc(o.title) + '</h3><p>' + esc(o.body) + '</p>' + (o.actions ? '<div class="btn-row">' + o.actions + '</div>' : '') + '</div>';

  C.skeleton = (rows) => '<div class="card card-pad">' +
    Array.from({ length: rows || 4 }, (_, i) => '<div class="skel skel-line" style="width:' + (100 - i * 9) + '%"></div>').join('') + '</div>';

  C.timeline = function (events, prefix) {
    return '<div class="tl">' + events.map((e, i) => {
      const id = prefix + '-' + i;
      const open = ADG.ui.openTl[id];
      return '<div class="tl-item st-' + e.status + '"><span class="tl-node"></span>' +
        '<button class="tl-btn" data-act="toggle-tl" data-id="' + id + '" aria-expanded="' + !!open + '">' +
          '<span class="tl-time">' + esc(e.time) + '</span>' +
          '<span class="tl-label">' + esc(e.label) + '</span>' +
          '<span class="tl-right">' +
            (e.risk && e.risk !== 'low' ? C.badge(e.risk === 'critical' ? 'Critical' : e.risk === 'high' ? 'High risk' : 'Watch',
              e.risk === 'moderate' ? 'amber' : 'red', { glyph: '△' }) : '') +
            (e.status === 'blocked' ? C.badge('Blocked', 'red', { glyph: '⊘' }) : '') +
            (e.status === 'paused' ? C.badge('Approval required', 'amber', { glyph: '⏸' }) : '') +
            '<span class="muted tiny" aria-hidden="true">' + (open ? '▴' : '▾') + '</span>' +
          '</span></button>' +
        (open ? '<div class="tl-detail">' + esc(e.detail) +
          '<div class="kv">' + C.badge('Tool · ' + e.tool, 'blue', { sq: true }) +
            C.badge('Result · ' + e.result, null, { sq: true }) +
            (e.policy ? C.badge('Policy · ' + (ADG.state.policies.find((p) => p.id === e.policy) || {}).name, 'purple', { sq: true }) : '') +
          '</div></div>' : '') + '</div>';
    }).join('') + '</div>';
  };

  C.permMatrix = function (agent, opts) {
    const o = Object.assign({ editable: true, draft: null }, opts || {});
    const src = o.draft || agent.permissions;
    const groups = [['data', 'Data', D.P_DATA], ['tools', 'Tools', D.P_TOOLS], ['actions', 'Actions', D.P_ACTIONS]];
    return groups.map(([g, title, keys]) =>
      '<div class="sec" style="margin-top:14px"><div class="sec-head"><h2 style="font-size:12.5px">' + title + '</h2>' +
      '<span class="sub">Impact weight shown per capability</span></div>' +
      '<div class="perm-grid">' +
      '<div class="perm-row"><div class="perm-cell head">Capability</div><div class="perm-cell head">Permission level</div></div>' +
      keys.map((k) => {
        const cur = src[g][k];
        return '<div class="perm-row"><div class="perm-cell">' + esc(k) +
          '<span class="perm-weight">impact ' + D.PERM_WEIGHTS[g][k] + '</span></div>' +
          '<div class="perm-cell"><div class="perm-seg" role="group" aria-label="' + esc(k + ' permission') + '">' +
            ['allow', 'approval', 'block'].map((lv) =>
              '<button ' + (o.editable ? 'data-act="' + (o.act || 'perm-set') + '" data-agent="' + agent.id + '" data-path="' + g + '::' + k + '" data-level="' + lv + '"' : 'disabled') +
              ' class="' + (cur === lv ? 'on-' + lv : '') + '" aria-pressed="' + (cur === lv) + '">' +
              (lv === 'allow' ? 'Allowed' : lv === 'approval' ? 'Approval' : 'Blocked') + '</button>').join('') +
          '</div></div></div>';
      }).join('') + '</div></div>').join('');
  };

  /* ------------------------------------------------------------- overlays */
  ADG.ui = { overlay: null, palette: false, notif: false, openTl: {}, demo: false };

  function overlayHost() { return document.getElementById('adg-overlay'); }

  ADG.closeOverlay = function () {
    ADG.ui.overlay = null; ADG.ui.palette = false; ADG.ui.notif = false;
    renderOverlay();
    if (ADG._lastFocus && document.body.contains(ADG._lastFocus)) ADG._lastFocus.focus();
  };
  ADG.openDrawer = function (cfg) { ADG._lastFocus = document.activeElement; ADG.ui.overlay = { kind: 'drawer', cfg }; renderOverlay(); };
  ADG.openModal = function (cfg) { ADG._lastFocus = document.activeElement; ADG.ui.overlay = { kind: 'modal', cfg }; renderOverlay(); };
  ADG.refreshOverlay = function () { if (ADG.ui.overlay) renderOverlay(); };

  ADG.confirm = function (cfg) {
    ADG.openModal({
      title: cfg.title, sub: cfg.sub, small: true,
      body: '<p style="font-size:13px;color:var(--ink-2);line-height:1.6">' + cfg.body + '</p>',
      foot: '<button class="btn" data-act="close-overlay">Cancel</button>' +
            '<div style="flex:1"></div><button class="btn ' + (cfg.tone || 'primary') + '" data-act="confirm-yes">' + esc(cfg.confirmLabel || 'Confirm') + '</button>'
    });
    ADG._confirmFn = cfg.onConfirm;
  };

  function renderOverlay() {
    const host = overlayHost();
    const o = ADG.ui.overlay;
    let html = '';
    if (ADG.ui.palette) html += paletteHtml();
    else if (ADG.ui.notif) html += notifHtml();
    else if (o && o.kind === 'drawer') {
      const c = o.cfg;
      html += '<div class="scrim" data-act="close-overlay"></div>' +
        '<aside class="drawer" role="dialog" aria-modal="true" aria-label="' + esc(c.title) + '">' +
          '<div class="drawer-head"><div style="min-width:0"><h2>' + c.title + '</h2>' +
            (c.sub ? '<div class="sub">' + c.sub + '</div>' : '') + '</div>' +
            '<button class="iconbtn" data-act="close-overlay" aria-label="Close" style="margin-left:auto">✕</button></div>' +
          '<div class="drawer-body">' + c.body + '</div>' +
          (c.foot ? '<div class="drawer-foot">' + c.foot + '</div>' : '') + '</aside>';
    } else if (o && o.kind === 'modal') {
      const c = o.cfg;
      html += '<div class="scrim" data-act="close-overlay"></div>' +
        '<div class="modal-wrap"><div class="modal ' + (c.wide ? 'wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(c.ariaLabel || c.title || 'Dialog') + '">' +
          (c.banner ? c.banner :
            '<div class="modal-head"><div style="display:flex;gap:12px;align-items:flex-start">' +
            '<div style="min-width:0"><h2 style="font-size:16px">' + c.title + '</h2>' +
            (c.sub ? '<div class="sub" style="font-size:12.5px;color:var(--ink-3);margin-top:3px">' + c.sub + '</div>' : '') + '</div>' +
            '<button class="iconbtn" data-act="close-overlay" aria-label="Close" style="margin-left:auto">✕</button></div></div>') +
          '<div class="modal-body">' + c.body + '</div>' +
          (c.foot ? '<div class="modal-foot">' + c.foot + '</div>' : '') + '</div></div>';
    }
    host.innerHTML = html;
    const f = host.querySelector('input, button:not([data-act="close-overlay"]), [tabindex]');
    if (f) setTimeout(() => f.focus(), 30);
  }

  /* toasts */
  ADG.toast = function (type, title, body) {
    const host = document.getElementById('adg-toasts');
    const el = document.createElement('div');
    el.className = 'toast t-' + type;
    el.setAttribute('role', 'status');
    el.innerHTML = '<span class="ti">' + (type === 'success' ? '✓' : type === 'error' ? '!' : 'i') + '</span>' +
      '<div><b>' + esc(title) + '</b>' + (body ? '<p>' + esc(body) + '</p>' : '') + '</div>' +
      '<button class="x" aria-label="Dismiss">✕</button>';
    el.querySelector('.x').addEventListener('click', () => remove());
    host.appendChild(el);
    const timer = setTimeout(remove, 5200);
    function remove() { clearTimeout(timer); el.classList.add('is-out'); setTimeout(() => el.remove(), 220); }
  };

  /* ------------------------------------------------------------- command palette */
  ADG.paletteState = { q: '', sel: 0, results: [] };
  ADG.openPalette = function () {
    ADG._lastFocus = document.activeElement;
    ADG.ui.palette = true; ADG.ui.overlay = null; ADG.paletteState.q = ''; ADG.paletteState.sel = 0;
    renderOverlay();
  };

  const NAV_INDEX = [];
  ADG.registerNav = (groups) => {
    groups.forEach((g) => g.items.forEach((i) => NAV_INDEX.push({ label: i.label, route: i.route, group: g.label })));
  };

  function paletteResults(q) {
    const s = ADG.state, out = [];
    const ql = q.trim().toLowerCase();
    const SMART = [
      { m: /below\s*(\d+)\s*trust|trust\s*(?:below|under)\s*(\d+)/, run: (mm) => {
          const n = Number(mm[1] || mm[2]);
          return { title: 'Agents below ' + n + ' trust',
            items: s.agents.filter((a) => S.trust(a) < n).sort((a, b) => S.trust(a) - S.trust(b))
              .map((a) => ({ label: a.name, meta: 'Trust ' + S.trust(a), act: 'open-agent', id: a.id, icon: '◆' })) };
        } },
      { m: /high\s*cost|expensive|over\s*budget/, run: () => ({ title: 'Agents over budget',
          items: s.agents.filter((a) => a.monthlyProjectedCost > a.budget)
            .sort((a, b) => (b.monthlyProjectedCost - b.budget) - (a.monthlyProjectedCost - a.budget)).slice(0, 8)
            .map((a) => ({ label: a.name, meta: fmt.usd(a.monthlyProjectedCost) + ' projected', act: 'open-agent', id: a.id, icon: '$' })) }) },
      { m: /critical|at\s*risk|danger/, run: () => ({ title: 'Critical and high-risk agents',
          items: s.agents.filter((a) => ['high', 'critical'].indexOf(S.riskBand(a).key) !== -1)
            .map((a) => ({ label: a.name, meta: S.riskBand(a).label + ' risk', act: 'open-agent', id: a.id, icon: '△' })) }) },
      { m: /policy\s*violation|violation|recent\s*polic/, run: () => ({ title: 'Recent policy violations',
          items: s.decisions.filter((d) => d.status === 'blocked').slice(0, 8)
            .map((d) => ({ label: d.action, meta: (S.agent(d.agentId) || {}).name, act: 'open-decision', id: d.id, icon: '⊘' })) }) },
      { m: /approval|requiring\s*approval|awaiting/, run: () => ({ title: 'Decisions requiring approval',
          items: S.pending().slice(0, 8)
            .map((d) => ({ label: d.action, meta: (S.agent(d.agentId) || {}).name, act: d.guard ? 'guard' : 'open-decision', id: d.id, icon: '⏸' })) }) }
    ];
    if (ql) {
      for (const sm of SMART) { const mm = ql.match(sm.m); if (mm) { const r = sm.run(mm); if (r.items.length) out.push(r); } }
    }
    const agents = s.agents.filter((a) => !ql || a.name.toLowerCase().indexOf(ql) !== -1 || a.department.toLowerCase().indexOf(ql) !== -1)
      .slice(0, ql ? 6 : 4);
    if (agents.length) out.push({ title: 'Agents', items: agents.map((a) => ({ label: a.name, meta: a.department + ' · Trust ' + S.trust(a), act: 'open-agent', id: a.id, icon: '◆' })) });
    const nav = NAV_INDEX.filter((n) => !ql || n.label.toLowerCase().indexOf(ql) !== -1 || n.group.toLowerCase().indexOf(ql) !== -1).slice(0, ql ? 6 : 6);
    if (nav.length) out.push({ title: 'Go to', items: nav.map((n) => ({ label: n.label, meta: n.group, act: 'goto', route: n.route, icon: '→' })) });
    const acts = [
      { label: 'Run the guarded decision scenario', meta: 'Demo', act: 'guard', id: 'DEC-84120', icon: '⚡', kw: 'demo scenario guard procurement' },
      { label: 'Switch to Executive mode', meta: 'View', act: 'set-mode', mode: 'executive', icon: '◱', kw: 'executive mode leadership' },
      { label: 'Switch to Operator mode', meta: 'View', act: 'set-mode', mode: 'operator', icon: '◰', kw: 'operator mode' },
      { label: 'Open demo controls', meta: 'Demo', act: 'demo-panel', icon: '⚙', kw: 'demo reset simulate incident' },
      { label: 'Reset the demo', meta: 'Demo', act: 'reset-demo', icon: '↺', kw: 'reset restore seed' }
    ].filter((a) => !ql || a.label.toLowerCase().indexOf(ql) !== -1 || a.kw.indexOf(ql) !== -1);
    if (acts.length) out.push({ title: 'Actions', items: acts.slice(0, 5) });
    return out;
  }

  function paletteHtml() {
    const groups = paletteResults(ADG.paletteState.q);
    const flat = [];
    groups.forEach((g) => g.items.forEach((i) => flat.push(i)));
    ADG.paletteState.results = flat;
    if (ADG.paletteState.sel >= flat.length) ADG.paletteState.sel = 0;
    let n = -1;
    return '<div class="scrim" data-act="close-overlay"></div><div class="palette-wrap"><div class="palette" role="dialog" aria-modal="true" aria-label="Command menu">' +
      '<div class="palette-input"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--ink-4)" stroke-width="1.6"><circle cx="9" cy="9" r="6.5"/><path d="m14 14 4 4"/></svg>' +
      '<input id="adg-pal-input" placeholder="Search agents, decisions, or try “agents below 80 trust”" value="' + esc(ADG.paletteState.q) + '" autocomplete="off" aria-label="Command menu search"></div>' +
      '<div class="palette-list" role="listbox">' +
      (flat.length ? groups.map((g) => '<div class="palette-sec">' + esc(g.title) + '</div>' + g.items.map((i) => {
        n++;
        return '<button class="palette-item ' + (n === ADG.paletteState.sel ? 'is-sel' : '') + '" role="option" aria-selected="' + (n === ADG.paletteState.sel) + '"' +
          ' data-act="' + i.act + '"' + (i.id ? ' data-id="' + esc(i.id) + '"' : '') + (i.route ? ' data-route="' + esc(i.route) + '"' : '') +
          (i.mode ? ' data-mode="' + i.mode + '"' : '') + ' data-pal="1">' +
          '<span class="pi">' + i.icon + '</span><span>' + esc(i.label) + '</span>' +
          (i.meta ? '<span class="meta">' + esc(i.meta) + '</span>' : '') + '</button>';
      }).join('')).join('') : '<div class="empty" style="padding:30px"><h3>No matches</h3><p>Try an agent name, a department, or “decisions requiring approval”.</p></div>') +
      '</div><div class="palette-foot"><span><span class="kbd">↑↓</span> navigate</span><span><span class="kbd">↵</span> open</span><span><span class="kbd">esc</span> close</span></div>' +
      '</div></div>';
  }

  function notifHtml() {
    const list = ADG.state.notifications;
    const TONE_N = { critical: 'var(--red)', warning: 'var(--amber)', info: 'var(--blue)', resolved: 'var(--green)' };
    const LBL_N = { critical: 'Critical', warning: 'Warning', info: 'Information', resolved: 'Resolved' };
    return '<div class="scrim" data-act="close-overlay" style="background:transparent;backdrop-filter:none"></div>' +
      '<div class="notif-panel" role="dialog" aria-label="Notifications">' +
      '<div class="card-head" style="border-radius:0"><h3>Notifications</h3>' +
        '<div class="right"><button class="btn xs ghost" data-act="mark-read">Mark all read</button></div></div>' +
      '<div class="notif-list">' + (list.length ? list.map((n) =>
        '<button class="notif ' + (n.read ? '' : 'is-unread') + '" data-act="open-notif" data-id="' + n.id + '">' +
        '<span class="nd" style="background:' + TONE_N[n.level] + '"></span><span>' +
        '<b>' + esc(n.title) + '</b><p>' + esc(n.body) + '</p>' +
        '<time>' + esc(LBL_N[n.level]) + ' · ' + fmt.ago(n.time) + '</time></span></button>').join('')
        : C.empty({ title: 'Nothing new', body: 'Notifications about trust, cost and policy will appear here.' })) +
      '</div></div>';
  }

  /* ------------------------------------------------------------- router */
  ADG.routes = {};
  ADG.parseRoute = function () {
    const raw = (location.hash || '#/command-center').replace(/^#/, '');
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const query = {};
    (qs || '').split('&').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); query[k] = decodeURIComponent(v || ''); });
    return { path, parts, query };
  };
  ADG.go = function (route) { if (location.hash === route) ADG.render(); else location.hash = route; };

  ADG.render = function () {
    const r = ADG.parseRoute();
    ADG.route = r;
    const host = document.getElementById('adg-view');
    let view = ADG.routes[r.parts.join('/')] || ADG.routes[r.parts[0] + '/*'] || ADG.routes[r.parts[0]];
    if (ADG.state.mode === 'executive' && r.parts[0] === 'command-center') view = ADG.routes['executive'];
    if (!view) { location.hash = '#/command-center'; return; }
    host.innerHTML = '<div class="view">' + view(r) + '</div>';
    host.scrollTop = 0;
    document.getElementById('adg-crumbs').innerHTML = ADG.crumbs(r);
    ADG.renderSidebar();
    ADG.renderTopbarMeta();
    if (ADG.afterRender) ADG.afterRender(r);
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  };

  /* ------------------------------------------------------------- action dispatch */
  ADG.actions = {};
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    const fn = ADG.actions[act];
    if (!fn) return;
    e.preventDefault();
    fn(el.dataset, el, e);
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ADG.openPalette(); return; }
    if (e.key === 'Escape') {
      if (ADG.ui.overlay || ADG.ui.palette || ADG.ui.notif) { e.preventDefault(); ADG.closeOverlay(); }
      else if (document.body.classList.contains('nav-open')) document.body.classList.remove('nav-open');
      return;
    }
    if (ADG.ui.palette) {
      const n = ADG.paletteState.results.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); ADG.paletteState.sel = (ADG.paletteState.sel + 1) % n; renderOverlay(); refocusPalette(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); ADG.paletteState.sel = (ADG.paletteState.sel - 1 + n) % n; renderOverlay(); refocusPalette(); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = ADG.paletteState.results[ADG.paletteState.sel];
        if (item) { ADG.ui.palette = false; renderOverlay(); (ADG.actions[item.act] || (() => {}))(item); }
      }
      return;
    }
    if (e.target.matches('input, textarea, select')) return;
    const map = { g: null, '/': () => ADG.openPalette(), '?': () => ADG.actions['shortcuts']() };
    if (map[e.key]) { e.preventDefault(); map[e.key](); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'adg-pal-input') {
      ADG.paletteState.q = e.target.value; ADG.paletteState.sel = 0; renderOverlay(); refocusPalette();
    }
  });
  function refocusPalette() {
    const i = document.getElementById('adg-pal-input');
    if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  }

  ADG.actions['noop'] = () => {};
  ADG.actions['close-overlay'] = () => ADG.closeOverlay();
  ADG.actions['goto'] = (d) => { ADG.closeOverlay(); ADG.go(d.route); };
  ADG.actions['open-agent'] = (d) => { ADG.closeOverlay(); ADG.go('#/agents/' + d.id); };
  ADG.actions['confirm-yes'] = () => { const f = ADG._confirmFn; ADG.closeOverlay(); if (f) f(); };
  ADG.actions['open-palette'] = () => ADG.openPalette();
  ADG.actions['toggle-notif'] = () => { ADG.ui.notif = !ADG.ui.notif; ADG.ui.overlay = null; ADG.ui.palette = false; renderOverlay(); };
  ADG.actions['mark-read'] = () => { ADG.state.notifications.forEach((n) => { n.read = true; }); renderOverlay(); ADG.renderTopbarMeta(); };
  ADG.actions['open-notif'] = (d) => {
    const n = ADG.state.notifications.find((x) => x.id === d.id);
    if (!n) return;
    n.read = true; ADG.closeOverlay();
    if (n.decisionId) ADG.actions['guard']({ id: n.decisionId });
    else ADG.go(n.route || '#/command-center');
    ADG.renderTopbarMeta();
  };
  ADG.actions['toggle-tl'] = (d) => { ADG.ui.openTl[d.id] = !ADG.ui.openTl[d.id]; ADG.refreshOverlay(); ADG.render(); };
  ADG.actions['set-mode'] = (d) => {
    ADG.state.mode = d.mode;
    ADG.go(d.mode === 'executive' ? '#/command-center' : '#/command-center');
    ADG.closeOverlay(); ADG.render();
    ADG.toast('info', d.mode === 'executive' ? 'Executive mode' : 'Operator mode',
      d.mode === 'executive' ? 'Simplified to fleet health, risk, spend and the three things leadership must decide.'
                             : 'Full operational surface restored.');
  };
  ADG.actions['toggle-nav'] = () => document.body.classList.toggle('nav-open');
  ADG.actions['reset-demo'] = () => ADG.resetDemo();
  ADG.actions['shortcuts'] = () => ADG.openModal({
    title: 'Keyboard shortcuts', sub: 'The product is fully operable from the keyboard.',
    body: '<div class="kv-list">' + [
      ['⌘K / Ctrl+K', 'Open the command menu'], ['/', 'Open the command menu'],
      ['↑ ↓', 'Move through results'], ['↵', 'Open the selected result'],
      ['Esc', 'Close any dialog, drawer or panel'], ['?', 'This list'], ['Tab', 'Move through every control in order']
    ].map((r) => '<div class="kv-row"><span class="k"><span class="kbd">' + esc(r[0]) + '</span></span><span class="v">' + esc(r[1]) + '</span></div>').join('') + '</div>',
    foot: '<div style="flex:1"></div><button class="btn primary" data-act="close-overlay">Close</button>'
  });

  window.addEventListener('hashchange', () => { ADG.closeOverlay(); ADG.render(); });
  ADG.subscribe(() => { ADG.render(); ADG.refreshOverlay(); });
})(window);
