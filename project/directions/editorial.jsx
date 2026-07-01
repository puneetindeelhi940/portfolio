// Direction C — AI-FORWARD EDITORIAL
// Editorial restraint, generous whitespace, slow rhythm, generative
// motif used as a quiet background system. Deep moss-green ground,
// warm ivory accent, soft luminescent highlight.

const edC = {
  bg: 'oklch(21% 0.022 168)',
  bgRaise: 'oklch(24% 0.024 168)',
  bgDeep: 'oklch(18% 0.02 168)',
  ink: 'oklch(96% 0.012 90)',
  ivory: 'oklch(93% 0.04 92)',
  dim: 'oklch(78% 0.018 90)',
  faint: 'oklch(58% 0.018 165)',
  hair: 'oklch(32% 0.02 168)',
  glow: 'oklch(86% 0.08 130)',   // soft luminescent green
  accent: 'oklch(78% 0.10 88)',  // warm pale gold
};

const edStyles = {
  root: {
    width: '100%',
    minHeight: '100%',
    background: edC.bg,
    color: edC.ink,
    fontFamily: "'Roboto', system-ui, sans-serif",
    fontSize: 15,
    lineHeight: 1.55,
    overflow: 'hidden',
    position: 'relative',
  },
  mono: { fontFamily: "'Roboto Mono', ui-monospace, monospace" },
  serif: { fontFamily: "'Roboto Serif', Georgia, serif" },
};

// Generative motif — concentric flow lines, used as backdrop in hero
function FlowField({ height = 760 }) {
  const lines = [];
  const cx = 1200;
  const cy = 380;
  for (let i = 0; i < 36; i++) {
    const r = 80 + i * 22;
    const a0 = (i % 7) * 0.13;
    const a1 = a0 + Math.PI * 1.4;
    const steps = 80;
    let d = '';
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const a = a0 + (a1 - a0) * t;
      const rr = r + Math.sin(a * 3 + i) * 8;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr * 0.62;
      d += (s === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    lines.push(d);
  }
  return (
    <svg
      width="100%" height={height} viewBox={`0 0 1440 ${height}`}
      style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none' }}
      preserveAspectRatio="xMaxYMid slice"
    >
      <defs>
        <radialGradient id="flowfade" cx="83%" cy="48%" r="46%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="60%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flowglow" cx="83%" cy="48%" r="35%">
          <stop offset="0%" stopColor={edC.glow} stopOpacity="0.18" />
          <stop offset="100%" stopColor={edC.glow} stopOpacity="0" />
        </radialGradient>
        <mask id="flowmask">
          <rect width="1440" height={height} fill="url(#flowfade)" />
        </mask>
      </defs>
      <rect width="1440" height={height} fill="url(#flowglow)" />
      <g mask="url(#flowmask)" stroke={edC.glow} fill="none" strokeWidth="0.6" opacity="0.85">
        {lines.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

function EdNav() {
  const links = ['Home', 'Bio', 'Journey', 'Work', 'AI Lab', 'Writing', 'Leadership', 'Recruiter', 'Contact'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '28px 64px', position: 'relative', zIndex: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 10, height: 10, borderRadius: 999,
          background: edC.glow, boxShadow: `0 0 24px ${edC.glow}`,
        }} />
        <span style={{ ...edStyles.serif, fontStyle: 'italic', fontSize: 19, color: edC.ink, letterSpacing: -0.2 }}>
          Puneet Arora
        </span>
      </div>
      <nav style={{ display: 'flex', gap: 28 }}>
        {links.map((l, i) => (
          <a key={l} href="#" style={{
            color: i === 0 ? edC.ink : edC.dim, textDecoration: 'none',
            fontSize: 13, letterSpacing: 0.2,
          }}>{l}</a>
        ))}
      </nav>
      <a href="#" style={{
        ...edStyles.mono, fontSize: 11, letterSpacing: 1.6, color: edC.ink,
        textTransform: 'uppercase', textDecoration: 'none',
        padding: '10px 18px', border: `1px solid ${edC.hair}`, borderRadius: 999,
      }}>Available · Q3 2026</a>
    </div>
  );
}

function EdHero() {
  return (
    <div style={{ position: 'relative', padding: '96px 64px 120px' }}>
      <FlowField height={760} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1020 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56,
        }}>
          <span style={{ width: 24, height: 1, background: edC.accent }} />
          <span style={{ ...edStyles.mono, fontSize: 11, letterSpacing: 2.4, color: edC.accent, textTransform: 'uppercase' }}>
            Vol. 21 · 2026 · Design Leadership
          </span>
        </div>
        <h1 style={{
          ...edStyles.serif,
          fontSize: 132, lineHeight: 0.94, letterSpacing: -4.5,
          fontWeight: 300, color: edC.ink, margin: 0,
        }}>
          Designing<br/>
          for the<br/>
          <span style={{ fontStyle: 'italic', color: edC.glow }}>thinking</span> machine.
        </h1>
        <div style={{
          marginTop: 56,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, maxWidth: 1100,
        }}>
          <div>
            <div style={{ ...edStyles.mono, fontSize: 11, letterSpacing: 2, color: edC.faint, textTransform: 'uppercase', marginBottom: 14 }}>
              Note from the author
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: edC.dim, margin: 0 }}>
              For twenty-one years I&apos;ve sat at the seam between executives,
              engineers, and end users — designing the products and the
              organisations around them. The next decade belongs to those
              who can design with agents in the room as colleagues, not
              tools. That&apos;s the work I&apos;m here for.
            </p>
          </div>
          <div style={{ alignSelf: 'end' }}>
            <div style={{ ...edStyles.mono, fontSize: 11, letterSpacing: 2, color: edC.faint, textTransform: 'uppercase', marginBottom: 14 }}>
              Currently
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: edC.dim, margin: 0 }}>
              Design Director, leading the UX practice for an enterprise
              AI platform. Advising two Big-4 consultancies and the GoI
              programme on responsible AI in public services.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '16px 26px', background: edC.ivory, color: edC.bgDeep,
            textDecoration: 'none', fontSize: 14, fontWeight: 500, borderRadius: 999,
          }}>View case studies <span style={{ ...edStyles.mono }}>→</span></a>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '16px 26px', color: edC.ink,
            textDecoration: 'none', fontSize: 14, fontWeight: 400, borderRadius: 999,
            border: `1px solid ${edC.hair}`,
          }}>Leadership &amp; philosophy</a>
        </div>
      </div>
      {/* trust strip */}
      <div style={{
        position: 'relative', zIndex: 2, marginTop: 96, paddingTop: 28,
        borderTop: `1px solid ${edC.hair}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        ...edStyles.mono, fontSize: 11, letterSpacing: 1.8, color: edC.faint, textTransform: 'uppercase',
      }}>
        <span>Selected partners</span>
        <span style={{ color: edC.dim }}>Dell Technologies</span>
        <span style={{ color: edC.dim }}>Boeing Commercial</span>
        <span style={{ color: edC.dim }}>Government of India · MeitY</span>
        <span style={{ color: edC.dim }}>Two Big-4 Consultancies</span>
        <span style={{ color: edC.dim }}>YC-backed AI</span>
      </div>
    </div>
  );
}

// Small editorial section heading
function EdHead({ chapter, title, lede }) {
  return (
    <div style={{ padding: '88px 64px 32px' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '180px 1fr 420px', gap: 32, alignItems: 'baseline',
      }}>
        <div style={{
          ...edStyles.mono, fontSize: 11, letterSpacing: 2.4, color: edC.accent, textTransform: 'uppercase',
        }}>{chapter}</div>
        <h2 style={{
          ...edStyles.serif, fontWeight: 300, fontSize: 64,
          letterSpacing: -2, lineHeight: 1.02, color: edC.ink, margin: 0,
        }}>{title}</h2>
        <p style={{ color: edC.dim, fontSize: 15, lineHeight: 1.65, margin: 0 }}>{lede}</p>
      </div>
    </div>
  );
}

function ExecCards() {
  const cards = [
    ['Twenty-one', 'years', 'in product, platform, and now agentic UX. From early CRMs to live AI co-pilots.'],
    ['Two-point-one', 'billion influenced', 'across revenue uplift, cost takeout, and operating efficiency.'],
    ['One hundred and twenty', 'designers mentored', 'across four design organisations and three continents.'],
    ['Fourteen', 'domains', 'hardware, finance, aviation, gov, climate, MAANG-scale platforms.'],
  ];
  return (
    <div style={{ padding: '0 64px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: `1px solid ${edC.hair}` }}>
        {cards.map(([big, kicker, sub], i) => (
          <div key={kicker} style={{
            padding: '32px 28px 28px',
            borderRight: i < cards.length - 1 ? `1px solid ${edC.hair}` : 'none',
          }}>
            <div style={{ ...edStyles.serif, fontStyle: 'italic', fontSize: 30, fontWeight: 300, color: edC.ink, letterSpacing: -0.6, marginBottom: 4 }}>
              {big}
            </div>
            <div style={{ ...edStyles.mono, fontSize: 11, color: edC.accent, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 14 }}>
              {kicker}
            </div>
            <div style={{ color: edC.dim, fontSize: 14, lineHeight: 1.55 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EdStudy({ idx, year, tag, title, lede, body, stats }) {
  const flip = idx % 2 === 1;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: flip ? '1fr 580px' : '580px 1fr',
      gap: 56, alignItems: 'center',
      padding: '56px 64px',
      borderTop: `1px solid ${edC.hair}`,
    }}>
      <div style={{ order: flip ? 2 : 1 }}>
        <div style={{
          aspectRatio: '4 / 3',
          background: edC.bgRaise,
          border: `1px solid ${edC.hair}`,
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* generative placeholder per study */}
          <StudyArt seed={idx} />
          <div style={{
            position: 'absolute', top: 18, left: 18, right: 18,
            display: 'flex', justifyContent: 'space-between',
            ...edStyles.mono, fontSize: 10, letterSpacing: 1.6, color: edC.dim, textTransform: 'uppercase',
          }}>
            <span>Fig. 0{idx + 1}</span>
            <span>{tag}</span>
          </div>
        </div>
      </div>
      <div style={{ order: flip ? 1 : 2 }}>
        <div style={{ ...edStyles.mono, fontSize: 11, color: edC.faint, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 }}>
          Case · 0{idx + 1} &nbsp; · &nbsp; {year}
        </div>
        <h3 style={{
          ...edStyles.serif, fontWeight: 300, fontSize: 46, lineHeight: 1.05,
          letterSpacing: -1.6, color: edC.ink, margin: 0, marginBottom: 18,
        }}>{title}</h3>
        <p style={{ ...edStyles.serif, fontStyle: 'italic', fontSize: 20, lineHeight: 1.45, color: edC.glow, margin: 0, marginBottom: 18 }}>
          {lede}
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: edC.dim, margin: 0, marginBottom: 28 }}>{body}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: `1px solid ${edC.hair}`, paddingTop: 18, gap: 12 }}>
          {stats.map(([k, v]) => (
            <div key={k}>
              <div style={{ ...edStyles.mono, fontSize: 10, color: edC.faint, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6 }}>{k}</div>
              <div style={{ ...edStyles.serif, fontSize: 24, fontWeight: 300, color: edC.ink, letterSpacing: -0.6 }}>{v}</div>
            </div>
          ))}
        </div>
        <a href="#" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 28,
          ...edStyles.mono, fontSize: 12, color: edC.ink, letterSpacing: 1.6, textTransform: 'uppercase', textDecoration: 'none',
          padding: '10px 18px', border: `1px solid ${edC.accent}`, borderRadius: 999,
        }}>Read the full case →</a>
      </div>
    </div>
  );
}

// Subtle generative art per study — distinct but consistent system
function StudyArt({ seed = 0 }) {
  if (seed === 0) {
    // Dell — generative conversation: dialogue lines
    return (
      <svg width="100%" height="100%" viewBox="0 0 580 435" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="dg1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={edC.glow} stopOpacity="0.22" />
            <stop offset="100%" stopColor={edC.glow} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="580" height="435" fill="url(#dg1)" />
        {Array.from({length: 24}, (_, i) => (
          <g key={i} opacity={0.4 + (i % 3) * 0.15}>
            <rect x={70 + (i%2)*180} y={60 + i*14} width={120 + (i*9)%180} height="2" fill={edC.dim} rx="1" />
          </g>
        ))}
        <circle cx="430" cy="320" r="48" fill="none" stroke={edC.accent} strokeWidth="1" strokeDasharray="3 4" />
        <circle cx="430" cy="320" r="20" fill={edC.accent} opacity="0.5" />
      </svg>
    );
  }
  if (seed === 1) {
    // Boeing — ops grid with trajectories
    return (
      <svg width="100%" height="100%" viewBox="0 0 580 435" preserveAspectRatio="xMidYMid slice">
        <g stroke={edC.hair} strokeWidth="0.6">
          {Array.from({length: 12}, (_, i) => (
            <line key={'h'+i} x1="0" y1={i*40 + 10} x2="580" y2={i*40 + 10} />
          ))}
          {Array.from({length: 16}, (_, i) => (
            <line key={'v'+i} x1={i*40 + 10} y1="0" x2={i*40 + 10} y2="435" />
          ))}
        </g>
        <path d="M 40 360 Q 180 80 320 220 T 540 120" stroke={edC.glow} strokeWidth="1.4" fill="none" />
        <path d="M 60 80 Q 260 320 380 200 T 560 320" stroke={edC.accent} strokeWidth="1" fill="none" strokeDasharray="2 3" />
        {[[40,360],[180,80],[320,220],[460,180],[540,120],[60,80],[260,320],[380,200],[560,320]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3} fill={i % 2 ? edC.accent : edC.ink} />
        ))}
      </svg>
    );
  }
  // Vigyan Setu — radial broadcast
  return (
    <svg width="100%" height="100%" viewBox="0 0 580 435" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="ig1" cx="50%" cy="58%" r="60%">
          <stop offset="0%" stopColor={edC.glow} stopOpacity="0.35" />
          <stop offset="100%" stopColor={edC.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="580" height="435" fill="url(#ig1)" />
      <g fill="none" stroke={edC.hair}>
        {Array.from({length: 8}, (_, i) => (
          <circle key={i} cx="290" cy="250" r={40 + i*36} />
        ))}
      </g>
      {Array.from({length: 24}, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const x = 290 + Math.cos(a) * (60 + (i % 4) * 30);
        const y = 250 + Math.sin(a) * (60 + (i % 4) * 30);
        return <circle key={'p'+i} cx={x} cy={y} r="2.5" fill={edC.dim} opacity={0.5 + (i % 5) * 0.1} />;
      })}
      <circle cx="290" cy="250" r="18" fill={edC.accent} opacity="0.85" />
      <circle cx="290" cy="250" r="32" fill="none" stroke={edC.accent} strokeWidth="0.8" />
    </svg>
  );
}

function EdStudies() {
  const studies = [
    {
      year: 'Two thousand twenty-four → twenty-six',
      tag: 'Enterprise × Generative',
      title: 'The conversational storefront.',
      lede: 'Rebuilding Dell.com discovery around an embedded AI agent.',
      body: 'A 14-step configurator quietly became a guided dialogue — without losing the depth power buyers required. Shipped across seven markets with a new agent-orchestration pattern and a v3 design system that survived the transition.',
      stats: [['AOV', '+38%'], ['Time-to-config', '−41%'], ['Markets', '7']],
    },
    {
      year: 'Two thousand twenty-two → twenty-four',
      tag: 'Platform · Operations',
      title: 'Designing for tail assignment.',
      lede: 'A high-stakes ops workspace at Boeing, where one wrong call cascades.',
      body: 'TAAM (Tail Asset Assignment Model) is the cockpit for the people who decide which aircraft flies which route. Multi-role IA, ambient alerting, and a simulator that mirrored production gave planners a calmer surface for a turbulent decision.',
      stats: [['Routing efficiency', '$220M/y'], ['Planner load', '−2.4h/day'], ['Roles', '6']],
    },
    {
      year: 'Two thousand twenty-five → twenty-six',
      tag: 'Public AI · Government',
      title: 'India\u202fAI\u202fImpact — Vigyan\u202fSetu.',
      lede: 'Design partner for India\u2019s flagship convening on responsible AI.',
      body: 'February 2026. Eleven ministries on stage, twenty-four live citizen-facing demos, one identity system, and an editorial spine that let policy, product and the public read the same story. The hardest stakeholder map I have ever drawn.',
      stats: [['Ministries', '11'], ['Citizens reached', '1.4B'], ['Stage demos', '24']],
    },
  ];
  return (
    <div>
      <EdHead chapter="Chapter II · Case Studies" title="Three systems, three scales." lede="Three engagements where the work moved a metric and changed how the org worked. Five more sit behind NDA — happy to talk through them privately." />
      {studies.map((s, i) => <EdStudy key={i} idx={i} {...s} />)}
    </div>
  );
}

function EdLab() {
  const items = [
    { code: 'L.01', name: 'Agent Mesh', why: 'A planner that schedules eight specialist agents against one OKR doc.' },
    { code: 'L.02', name: 'Rubric OS', why: 'Generative design critiques against a house rubric. For teams that can\u2019t scale Friday reviews.' },
    { code: 'L.03', name: 'Interview Loop', why: 'Voice-first UXR copilot. Synthesises 40 interviews into a defensible insight map.' },
    { code: 'L.04', name: 'Atlas Sketch', why: 'Vibe-coded enterprise wireframer. Outputs Figma + tokens + React in one pass.' },
  ];
  return (
    <div style={{ background: edC.bgDeep, paddingBottom: 32 }}>
      <EdHead chapter="Chapter III · The Lab" title="Prototypes I run on myself." lede="Working experiments at the seam of design and AI. Each ships with a Why-this-matters note — the strategic reason this prototype exists at all." />
      <div style={{ padding: '8px 64px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: `1px solid ${edC.hair}`, borderBottom: `1px solid ${edC.hair}` }}>
          {items.map((it, i) => (
            <div key={it.code} style={{
              padding: '34px 28px 36px',
              borderRight: i < items.length - 1 ? `1px solid ${edC.hair}` : 'none',
              minHeight: 240, display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ ...edStyles.mono, fontSize: 11, color: edC.accent, letterSpacing: 2, marginBottom: 32 }}>{it.code}</div>
              <div style={{ ...edStyles.serif, fontStyle: 'italic', fontWeight: 300, fontSize: 30, color: edC.ink, letterSpacing: -0.8, marginBottom: 14 }}>{it.name}</div>
              <div style={{ color: edC.dim, fontSize: 14, lineHeight: 1.6, flex: 1 }}>{it.why}</div>
              <a href="#" style={{ ...edStyles.mono, fontSize: 11, color: edC.ink, letterSpacing: 1.6, textDecoration: 'none', marginTop: 22, textTransform: 'uppercase' }}>Read the note →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EdFoot() {
  return (
    <div style={{ position: 'relative', padding: '120px 64px 80px', overflow: 'hidden' }}>
      <FlowField height={520} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ ...edStyles.mono, fontSize: 11, color: edC.accent, letterSpacing: 2.4, textTransform: 'uppercase', marginBottom: 26 }}>
          Closing note
        </div>
        <h2 style={{
          ...edStyles.serif, fontWeight: 300, fontSize: 88,
          lineHeight: 1, letterSpacing: -3.2, color: edC.ink, margin: 0, maxWidth: 1100,
        }}>
          Let&apos;s build<br/>
          <span style={{ fontStyle: 'italic', color: edC.glow }}>meaningful</span> products<br/>
          and experiences.
        </h2>
        <div style={{
          marginTop: 48,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'end',
        }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <a href="#" style={{
              padding: '16px 26px', background: edC.ivory, color: edC.bgDeep,
              textDecoration: 'none', fontSize: 14, fontWeight: 500, borderRadius: 999,
            }}>Book a 30-min intro →</a>
            <a href="#" style={{
              padding: '16px 26px', color: edC.ink, textDecoration: 'none',
              fontSize: 14, border: `1px solid ${edC.hair}`, borderRadius: 999,
            }}>Download CV</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['Email', 'p@arora.studio'],
              ['LinkedIn', '/in/arorapuneet11'],
              ['Based', 'Bengaluru ↔ SF'],
              ['Calendar', 'cal.com/puneet'],
            ].map(([k, v]) => (
              <div key={k} style={{ borderTop: `1px solid ${edC.hair}`, paddingTop: 12 }}>
                <div style={{ ...edStyles.mono, fontSize: 10, color: edC.faint, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6 }}>{k}</div>
                <div style={{ color: edC.ink, fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 64, paddingTop: 22, borderTop: `1px solid ${edC.hair}`,
          display: 'flex', justifyContent: 'space-between',
          ...edStyles.mono, fontSize: 11, color: edC.faint, letterSpacing: 1.6, textTransform: 'uppercase',
        }}>
          <span>© Puneet Arora · 2026</span>
          <span>An editorial portfolio · Vol. 21</span>
          <span>Bengaluru · 17:42</span>
        </div>
      </div>
    </div>
  );
}

function EditorialHome() {
  return (
    <div style={edStyles.root}>
      <EdNav />
      <EdHero />
      <ExecCards />
      <EdStudies />
      <EdLab />
      <EdFoot />
    </div>
  );
}

Object.assign(window, { EditorialHome });
