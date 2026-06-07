// Direction B — SYSTEMS DIAGRAM
// Systems thinking made visual: nodes, edges, maps. Sea green ground,
// warm copper accent. Mix of Roboto display + Roboto Mono for labels.

const sysC = {
  bg: 'oklch(24% 0.035 170)',
  bgDeep: 'oklch(20% 0.03 170)',
  bgRaise: 'oklch(28% 0.038 170)',
  ink: 'oklch(96% 0.012 95)',
  dim: 'oklch(78% 0.02 165)',
  faint: 'oklch(55% 0.025 165)',
  rule: 'oklch(34% 0.025 168)',
  accent: 'oklch(75% 0.13 58)',     // copper
  accent2: 'oklch(86% 0.09 130)',    // soft luminescent
};

const sysStyles = {
  root: {
    width: '100%',
    minHeight: '100%',
    background: sysC.bg,
    color: sysC.ink,
    fontFamily: "'Roboto', system-ui, sans-serif",
    fontSize: 14,
    lineHeight: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  mono: {
    fontFamily: "'Roboto Mono', ui-monospace, monospace",
  },
};

function SysNav() {
  const links = ['Home', 'Bio', 'Journey', 'Work', 'AI Lab', 'Writing', 'Leadership', 'Recruiter', 'Contact'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '24px 56px',
      borderBottom: `1px solid ${sysC.rule}`,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* logo: two connected nodes */}
        <svg width="34" height="22" viewBox="0 0 34 22">
          <circle cx="6" cy="11" r="4.5" fill="none" stroke={sysC.accent} strokeWidth="1.5" />
          <circle cx="28" cy="11" r="4.5" fill={sysC.ink} />
          <line x1="10.5" y1="11" x2="23.5" y2="11" stroke={sysC.dim} strokeWidth="1" />
        </svg>
        <div>
          <div style={{ fontWeight: 500, letterSpacing: 0.2, color: sysC.ink }}>Puneet Arora</div>
          <div style={{ ...sysStyles.mono, fontSize: 10, color: sysC.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>
            Design Director · UX × AI × Systems
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 28, fontSize: 13 }}>
        {links.map((l, i) => (
          <a key={l} href="#" style={{
            color: i === 0 ? sysC.ink : sysC.dim,
            textDecoration: 'none',
            paddingBottom: 4,
            borderBottom: i === 0 ? `1px solid ${sysC.accent}` : '1px solid transparent',
          }}>{l}</a>
        ))}
      </div>
      <a href="#" style={{
        ...sysStyles.mono,
        fontSize: 11,
        letterSpacing: 1.4,
        color: sysC.ink,
        border: `1px solid ${sysC.accent}`,
        padding: '8px 16px',
        textDecoration: 'none',
        borderRadius: 999,
      }}>BOOK INTRO →</a>
    </div>
  );
}

// The hero diagram — node-graph of the operating system Puneet runs
function SysHero() {
  // Place nodes on an SVG canvas (700w x 540h zone)
  const center = { x: 350, y: 270, r: 60, label: 'P.A.', sub: 'operator' };
  const orbit = [
    { x: 350, y: 90, r: 32, label: 'Vision', kind: 'strategy', tag: 'where to play' },
    { x: 590, y: 170, r: 30, label: 'AI Systems', kind: 'practice', tag: 'agents · models · UX' },
    { x: 640, y: 380, r: 26, label: 'Org Design', kind: 'leverage', tag: 'team as product' },
    { x: 440, y: 490, r: 28, label: 'Customer', kind: 'truth', tag: 'enterprise users' },
    { x: 200, y: 480, r: 26, label: 'Outcome', kind: 'proof', tag: '$ · speed · trust' },
    { x: 80, y: 350, r: 30, label: 'Stakeholder', kind: 'leverage', tag: 'exec · eng · biz' },
    { x: 110, y: 150, r: 28, label: 'Research', kind: 'truth', tag: 'data · signal' },
  ];
  const edges = orbit.map(n => [center.x, center.y, n.x, n.y]);
  // a few non-center edges for "system" feel
  const cross = [
    [orbit[0].x, orbit[0].y, orbit[1].x, orbit[1].y],
    [orbit[1].x, orbit[1].y, orbit[2].x, orbit[2].y],
    [orbit[6].x, orbit[6].y, orbit[0].x, orbit[0].y],
    [orbit[5].x, orbit[5].y, orbit[4].x, orbit[4].y],
    [orbit[4].x, orbit[4].y, orbit[3].x, orbit[3].y],
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 760px',
      padding: '72px 56px 56px',
      gap: 56,
      position: 'relative',
    }}>
      <div style={{ alignSelf: 'center' }}>
        <div style={{
          ...sysStyles.mono,
          fontSize: 11, letterSpacing: 2, color: sysC.accent, marginBottom: 24,
        }}>FIG.01 — OPERATING MODEL</div>
        <h1 style={{
          fontSize: 76, lineHeight: 0.98, letterSpacing: -2.2,
          fontWeight: 500, color: sysC.ink, margin: 0,
        }}>
          I design the<br/>
          <em style={{ fontWeight: 300, color: sysC.accent2, fontFamily: "'Roboto Serif', serif" }}>connective tissue</em><br/>
          of enterprise<br/>product orgs.
        </h1>
        <p style={{
          marginTop: 28, fontSize: 16, lineHeight: 1.65,
          color: sysC.dim, maxWidth: 480,
        }}>
          Two decades helping leaders see the system behind the surface —
          from Dell&apos;s storefront to Boeing&apos;s ground ops to India&apos;s
          public-AI showcase. UX as strategy. Systems as leverage.
          Agents as colleagues.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          <a href="#" style={{
            padding: '14px 22px', background: sysC.accent, color: 'oklch(20% 0.03 60)',
            textDecoration: 'none', fontWeight: 500, fontSize: 14, borderRadius: 6,
          }}>View Case Studies →</a>
          <a href="#" style={{
            padding: '14px 22px', background: 'transparent', color: sysC.ink,
            textDecoration: 'none', fontWeight: 500, fontSize: 14,
            border: `1px solid ${sysC.rule}`, borderRadius: 6,
          }}>Leadership &amp; Philosophy</a>
        </div>
        <div style={{ marginTop: 44, display: 'flex', gap: 28, ...sysStyles.mono, fontSize: 11, letterSpacing: 1.4, color: sysC.faint, textTransform: 'uppercase' }}>
          <span>Trusted by</span>
          <span style={{ color: sysC.dim }}>Dell</span>
          <span style={{ color: sysC.dim }}>Boeing</span>
          <span style={{ color: sysC.dim }}>GoI · MeitY</span>
          <span style={{ color: sysC.dim }}>Big-4 + MAANG</span>
        </div>
      </div>

      <div style={{
        background: sysC.bgDeep,
        border: `1px solid ${sysC.rule}`,
        borderRadius: 10,
        padding: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* subtle grid */}
        <svg width="100%" height="100%" viewBox="0 0 700 580" style={{ display: 'block' }}>
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0 L0 0 0 32" fill="none" stroke={sysC.rule} strokeWidth="0.5" />
            </pattern>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={sysC.accent} stopOpacity="0.25" />
              <stop offset="100%" stopColor={sysC.accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="700" height="580" fill="url(#grid)" />
          <circle cx={center.x} cy={center.y} r="140" fill="url(#centerGlow)" />

          {/* edges from center */}
          {edges.map(([x1,y1,x2,y2], i) => (
            <line key={'e'+i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={sysC.accent} strokeWidth="0.8" strokeDasharray="2 4" opacity="0.7" />
          ))}
          {cross.map(([x1,y1,x2,y2], i) => (
            <line key={'c'+i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={sysC.dim} strokeWidth="0.5" strokeDasharray="1 3" opacity="0.5" />
          ))}

          {/* orbit nodes */}
          {orbit.map((n, i) => (
            <g key={'n'+i}>
              <circle cx={n.x} cy={n.y} r={n.r} fill={sysC.bgRaise} stroke={sysC.dim} strokeWidth="1" />
              <circle cx={n.x} cy={n.y} r="3" fill={sysC.accent2} />
              <text x={n.x} y={n.y - 6} textAnchor="middle" fill={sysC.ink} fontFamily="Roboto" fontSize="12" fontWeight="500">{n.label}</text>
              <text x={n.x} y={n.y + 9} textAnchor="middle" fill={sysC.faint} fontFamily="Roboto Mono" fontSize="8" letterSpacing="1">{n.tag.toUpperCase()}</text>
            </g>
          ))}

          {/* center node */}
          <circle cx={center.x} cy={center.y} r={center.r} fill={sysC.bg} stroke={sysC.accent} strokeWidth="1.5" />
          <circle cx={center.x} cy={center.y} r={center.r - 8} fill="none" stroke={sysC.accent} strokeWidth="0.5" strokeDasharray="2 3" />
          <text x={center.x} y={center.y - 2} textAnchor="middle" fill={sysC.ink} fontFamily="Roboto Serif" fontStyle="italic" fontSize="28" fontWeight="400">{center.label}</text>
          <text x={center.x} y={center.y + 18} textAnchor="middle" fill={sysC.accent} fontFamily="Roboto Mono" fontSize="9" letterSpacing="2">{center.sub.toUpperCase()}</text>
        </svg>

        <div style={{
          position: 'absolute', bottom: 24, left: 28, right: 28,
          display: 'flex', justifyContent: 'space-between',
          ...sysStyles.mono, fontSize: 10, color: sysC.faint, letterSpacing: 1.4, textTransform: 'uppercase',
        }}>
          <span>Fig.01 · How I lead product design</span>
          <span>v.2026</span>
        </div>
      </div>
    </div>
  );
}

function SysSectionHead({ n, eyebrow, title, kicker }) {
  return (
    <div style={{
      padding: '64px 56px 24px',
      display: 'grid', gridTemplateColumns: '120px 1fr 360px',
      gap: 32, alignItems: 'end',
      borderTop: `1px solid ${sysC.rule}`,
    }}>
      <div style={{ ...sysStyles.mono, fontSize: 11, letterSpacing: 2, color: sysC.accent }}>{n}</div>
      <div>
        <div style={{ ...sysStyles.mono, fontSize: 11, color: sysC.faint, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 12 }}>{eyebrow}</div>
        <div style={{ fontSize: 40, fontWeight: 500, color: sysC.ink, letterSpacing: -1, lineHeight: 1.05 }}>{title}</div>
      </div>
      <div style={{ color: sysC.dim, fontSize: 14, lineHeight: 1.6 }}>{kicker}</div>
    </div>
  );
}

function Summary() {
  const stats = [
    ['21', 'years', 'in product / platform / agentic UX'],
    ['$2.1B', 'influenced', 'across revenue, cost, efficiency'],
    ['38', 'shipped', 'enterprise products at scale'],
    ['120+', 'mentored', 'designers across 4 design orgs'],
  ];
  return (
    <div style={{ padding: '0 56px 64px' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        background: sysC.bgDeep, border: `1px solid ${sysC.rule}`, borderRadius: 10,
        overflow: 'hidden',
      }}>
        {stats.map(([n, k, sub], i) => (
          <div key={k} style={{
            padding: '30px 28px',
            borderLeft: i === 0 ? 'none' : `1px solid ${sysC.rule}`,
            position: 'relative',
          }}>
            <div style={{ fontSize: 56, fontWeight: 400, color: sysC.ink, letterSpacing: -2, lineHeight: 1, marginBottom: 8 }}>{n}</div>
            <div style={{ ...sysStyles.mono, fontSize: 11, color: sysC.accent, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }}>{k}</div>
            <div style={{ color: sysC.dim, fontSize: 13 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// A small node-graph thumbnail used in case study cards
function CaseGraph({ kind }) {
  // kind: 'agent' | 'ops' | 'gov'
  if (kind === 'agent') {
    return (
      <svg viewBox="0 0 220 140" width="100%" height="100%">
        <g stroke={sysC.dim} strokeWidth="0.6" fill="none" opacity="0.55">
          <line x1="40" y1="70" x2="110" y2="40" />
          <line x1="40" y1="70" x2="110" y2="70" />
          <line x1="40" y1="70" x2="110" y2="100" />
          <line x1="110" y1="40" x2="180" y2="70" />
          <line x1="110" y1="70" x2="180" y2="70" />
          <line x1="110" y1="100" x2="180" y2="70" />
        </g>
        <circle cx="40" cy="70" r="10" fill="none" stroke={sysC.accent} strokeWidth="1.3" />
        <text x="40" y="73" textAnchor="middle" fontSize="9" fill={sysC.ink} fontFamily="Roboto Mono">U</text>
        {[40, 70, 100].map((y, i) => (
          <g key={i}>
            <rect x="98" y={y-10} width="24" height="20" rx="3" fill={sysC.bgRaise} stroke={sysC.dim} strokeWidth="0.8" />
            <text x="110" y={y+3} textAnchor="middle" fontSize="8" fill={sysC.dim} fontFamily="Roboto Mono">A{i+1}</text>
          </g>
        ))}
        <circle cx="180" cy="70" r="12" fill={sysC.accent} fillOpacity="0.25" stroke={sysC.accent} strokeWidth="1" />
        <text x="180" y="73" textAnchor="middle" fontSize="9" fill={sysC.ink} fontFamily="Roboto Mono">$</text>
      </svg>
    );
  }
  if (kind === 'ops') {
    return (
      <svg viewBox="0 0 220 140" width="100%" height="100%">
        <g stroke={sysC.dim} strokeWidth="0.6" opacity="0.5">
          {[30, 60, 90, 120].map(y => <line key={'h'+y} x1="20" y1={y} x2="200" y2={y} />)}
          {[40, 80, 120, 160, 200].map(x => <line key={'v'+x} x1={x} y1="20" x2={x} y2="120" />)}
        </g>
        {[
          [40, 30], [80, 60], [120, 90], [160, 60], [200, 30],
          [40, 90], [80, 120], [120, 30], [160, 120], [200, 90],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3} fill={i % 4 === 0 ? sysC.accent : sysC.dim} />
        ))}
        <path d="M 40 30 Q 80 60 120 30 T 200 30" stroke={sysC.accent} strokeWidth="1.2" fill="none" />
        <path d="M 40 90 Q 80 120 120 90 T 200 90" stroke={sysC.accent2} strokeWidth="1" fill="none" strokeDasharray="2 2" />
      </svg>
    );
  }
  // gov
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%">
      <circle cx="110" cy="70" r="50" fill="none" stroke={sysC.rule} strokeWidth="0.8" />
      <circle cx="110" cy="70" r="32" fill="none" stroke={sysC.rule} strokeWidth="0.8" />
      <circle cx="110" cy="70" r="14" fill={sysC.accent} fillOpacity="0.25" stroke={sysC.accent} strokeWidth="1" />
      {Array.from({length: 11}, (_, i) => {
        const a = (i / 11) * Math.PI * 2;
        const x = 110 + Math.cos(a) * 50;
        const y = 70 + Math.sin(a) * 50;
        return (
          <g key={i}>
            <line x1="110" y1="70" x2={x} y2={y} stroke={sysC.dim} strokeWidth="0.4" opacity="0.6" />
            <circle cx={x} cy={y} r="3.5" fill={sysC.bgRaise} stroke={sysC.dim} strokeWidth="0.8" />
          </g>
        );
      })}
      <text x="110" y="74" textAnchor="middle" fontSize="10" fontFamily="Roboto Serif" fontStyle="italic" fill={sysC.ink}>India</text>
    </svg>
  );
}

function Studies() {
  const studies = [
    {
      tag: 'Enterprise × Generative',
      title: 'Dell.com — the conversational storefront',
      client: 'Dell Technologies',
      year: '2024–26',
      blurb: 'Re-architected discovery and configuration around an embedded GenAI agent. A 14-step configurator became a guided dialogue without losing power-user fidelity.',
      stats: [['AOV', '+38%'], ['Time-to-config', '−41%'], ['Markets', '7']],
      graph: 'agent',
    },
    {
      tag: 'Platform · Ops',
      title: 'TAAM — tail-asset assignment at Boeing',
      client: 'Boeing Commercial',
      year: '2022–24',
      blurb: 'Operations workspace for tail-assignment planners. A high-stakes environment where one wrong assignment cascades across hubs and crews.',
      stats: [['Routing', '$220M/y'], ['Planner load', '−2.4h/day'], ['Roles', '6']],
      graph: 'ops',
    },
    {
      tag: 'Public AI · Government',
      title: 'India AI Impact — Vigyan Setu',
      client: 'GoI / MeitY',
      year: '2025–26',
      blurb: 'Design partner for India\'s flagship public-AI convening (Feb 2026). On-stage product showcase, identity system, citizen-facing demos.',
      stats: [['Ministries', '11'], ['Reach', '1.4B'], ['Stage demos', '24']],
      graph: 'gov',
    },
  ];

  return (
    <div>
      <SysSectionHead n="§02" eyebrow="Case Studies · 03 of 08" title="Three systems, three scales." kicker="Selected engagements where the work moved a metric and the org changed how it worked. The remaining five sit behind NDA — happy to walk through them." />
      <div style={{ padding: '12px 56px 64px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {studies.map(s => (
          <a key={s.title} href="#" style={{
            display: 'block', textDecoration: 'none', color: 'inherit',
            background: sysC.bgDeep, border: `1px solid ${sysC.rule}`, borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{ height: 220, background: sysC.bg, borderBottom: `1px solid ${sysC.rule}`, padding: 24 }}>
              <CaseGraph kind={s.graph} />
            </div>
            <div style={{ padding: '24px 24px 26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', ...sysStyles.mono, fontSize: 11, color: sysC.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 16 }}>
                <span style={{ color: sysC.accent }}>{s.tag}</span>
                <span>{s.year}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.15, letterSpacing: -0.4, marginBottom: 8 }}>{s.title}</div>
              <div style={{ ...sysStyles.mono, fontSize: 11, color: sysC.dim, letterSpacing: 1.2, marginBottom: 14 }}>{s.client}</div>
              <div style={{ color: sysC.dim, fontSize: 13.5, lineHeight: 1.6, marginBottom: 20, minHeight: 88 }}>{s.blurb}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: `1px solid ${sysC.rule}`, paddingTop: 14, gap: 8 }}>
                {s.stats.map(([k, v]) => (
                  <div key={k}>
                    <div style={{ ...sysStyles.mono, fontSize: 9, color: sysC.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 16, color: sysC.ink, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function AILabBlock() {
  const items = [
    { name: 'Agent Mesh', why: 'A planner that schedules eight specialist agents against one OKR doc.', state: 'live' },
    { name: 'Rubric OS', why: 'Generative critiques for design teams, against a house rubric.', state: 'beta' },
    { name: 'Interview Loop', why: 'Voice-first UXR copilot. 40 interviews → defensible insight map.', state: 'live' },
    { name: 'Atlas Sketch', why: 'Vibe-coded enterprise wireframer. Figma + tokens + React in one pass.', state: 'internal' },
  ];
  return (
    <div style={{ background: sysC.bgDeep }}>
      <SysSectionHead n="§03" eyebrow="AI Lab · Workbench" title="Prototypes I run on myself before I run them on teams." kicker="Each note ships with a Why-this-matters paragraph. The lab is how I keep my reps up — not a portfolio of side projects." />
      <div style={{ padding: '8px 56px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {items.map((it, i) => (
            <div key={it.name} style={{
              padding: 24, background: sysC.bg, border: `1px solid ${sysC.rule}`, borderRadius: 10,
              minHeight: 210, display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
                <span style={{ ...sysStyles.mono, fontSize: 11, color: sysC.accent, letterSpacing: 1.4 }}>X.0{7-i}</span>
                <span style={{ ...sysStyles.mono, fontSize: 10, color: sysC.dim, letterSpacing: 1.4, textTransform: 'uppercase' }}>● {it.state}</span>
              </div>
              <div style={{ fontSize: 19, fontWeight: 500, color: sysC.ink, letterSpacing: -0.3, marginBottom: 10 }}>{it.name}</div>
              <div style={{ color: sysC.dim, fontSize: 13, lineHeight: 1.55, flex: 1 }}>{it.why}</div>
              <a href="#" style={{ ...sysStyles.mono, fontSize: 11, color: sysC.ink, letterSpacing: 1.4, textDecoration: 'none', marginTop: 18 }}>READ NOTE →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Writing() {
  const items = [
    { kind: 'Framework', title: 'The Five-Lens model for stakeholder alignment at scale' },
    { kind: 'Essay', title: 'The org chart is the product. Or it should be.' },
    { kind: 'Talk', title: 'Designing agents that earn institutional trust — IndiaAI 2026' },
    { kind: 'Note', title: 'Three rituals enterprise design teams should steal from ops' },
  ];
  return (
    <div>
      <SysSectionHead n="§04" eyebrow="Thought Leadership" title="Frameworks, essays, talks." kicker="Most of these started as memos to a team. I keep them out here so the next team can skip the arguments I've already had." />
      <div style={{ padding: '12px 56px 72px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {items.map((it) => (
          <a key={it.title} href="#" style={{
            display: 'grid', gridTemplateColumns: '110px 1fr 32px', gap: 20, alignItems: 'center',
            textDecoration: 'none', color: 'inherit',
            padding: '22px 24px',
            background: sysC.bgDeep, border: `1px solid ${sysC.rule}`, borderRadius: 8,
          }}>
            <div style={{ ...sysStyles.mono, fontSize: 11, color: sysC.accent, letterSpacing: 1.4, textTransform: 'uppercase' }}>{it.kind}</div>
            <div style={{ fontSize: 17, color: sysC.ink, fontWeight: 400, letterSpacing: -0.2, lineHeight: 1.35 }}>{it.title}</div>
            <div style={{ color: sysC.dim, textAlign: 'right' }}>→</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function SysFoot() {
  return (
    <div style={{ borderTop: `1px solid ${sysC.rule}`, padding: '56px 56px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
      <div>
        <div style={{ ...sysStyles.mono, fontSize: 11, color: sysC.accent, letterSpacing: 2, marginBottom: 18 }}>§05 — CONTACT</div>
        <div style={{ fontSize: 44, fontWeight: 500, color: sysC.ink, letterSpacing: -1.2, lineHeight: 1.05 }}>
          Let&apos;s build meaningful<br/>products and experiences.
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <a href="#" style={{ padding: '14px 22px', background: sysC.accent, color: 'oklch(20% 0.03 60)', textDecoration: 'none', fontWeight: 500, fontSize: 14, borderRadius: 6 }}>Book a 30-min intro →</a>
          <a href="#" style={{ padding: '14px 22px', background: 'transparent', color: sysC.ink, textDecoration: 'none', fontWeight: 500, fontSize: 14, border: `1px solid ${sysC.rule}`, borderRadius: 6 }}>Download CV</a>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignSelf: 'end' }}>
        {[
          ['LinkedIn', '/in/puneetarora'],
          ['Email', 'p@arora.studio'],
          ['Based', 'Bengaluru ↔ San Francisco'],
          ['Availability', 'Q3 2026 onward'],
        ].map(([k, v]) => (
          <div key={k} style={{ borderTop: `1px solid ${sysC.rule}`, paddingTop: 12 }}>
            <div style={{ ...sysStyles.mono, fontSize: 10, color: sysC.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>{k}</div>
            <div style={{ color: sysC.ink, fontSize: 14 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemsHome() {
  return (
    <div style={sysStyles.root}>
      <SysNav />
      <SysHero />
      <Summary />
      <Studies />
      <AILabBlock />
      <Writing />
      <SysFoot />
    </div>
  );
}

Object.assign(window, { SystemsHome });
