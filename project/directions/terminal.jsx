// Direction A — INTELLIGENCE TERMINAL
// Mono-driven, command-palette feel, data-dense, signal amber accent.
// Inspired by intelligence-platform aesthetics — original system.

const termStyles = {
  root: {
    width: '100%',
    minHeight: '100%',
    background: 'oklch(17% 0.022 175)',
    color: 'oklch(96% 0.01 175)',
    fontFamily: "'Roboto Mono', ui-monospace, monospace",
    fontSize: 13,
    lineHeight: 1.5,
    letterSpacing: 0.01,
    overflow: 'hidden',
  },
};

const SIGNAL = 'oklch(82% 0.14 78)';
const DIM = 'oklch(70% 0.02 175)';
const FAINT = 'oklch(45% 0.015 175)';
const RULE = 'oklch(28% 0.02 175)';
const SURFACE = 'oklch(20% 0.02 175)';
const SURFACE_2 = 'oklch(22% 0.022 175)';

function Rule({ vertical, style }) {
  return (
    <div style={{
      background: RULE,
      ...(vertical ? { width: 1, height: '100%' } : { height: 1, width: '100%' }),
      ...style,
    }} />
  );
}

function Tag({ children, color = SIGNAL }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 6px',
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color,
      border: `1px solid ${color}`,
      borderRadius: 2,
      lineHeight: 1.2,
    }}>{children}</span>
  );
}

function TopBar() {
  const items = ['HOME', 'BIO', 'JOURNEY', 'CASE_STUDIES', 'AI_LAB', 'WRITING', 'LEADERSHIP', 'INDEX', 'CONTACT'];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: 44,
      borderBottom: `1px solid ${RULE}`,
      padding: '0 24px',
      gap: 32,
      fontSize: 11,
      letterSpacing: 1.6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
        <span style={{ width: 8, height: 8, background: SIGNAL, borderRadius: 1 }} />
        <span style={{ fontWeight: 700, letterSpacing: 2 }}>P.ARORA</span>
        <span style={{ color: FAINT, marginLeft: 4 }}>/ DESIGN.EXEC</span>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 22 }}>
        {items.map((it, i) => (
          <a key={it} href="#" style={{
            color: i === 0 ? '#fff' : DIM,
            textDecoration: 'none',
            borderBottom: i === 0 ? `1px solid ${SIGNAL}` : '1px solid transparent',
            padding: '12px 0',
          }}>{it}</a>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: DIM }}>
        <span>● LIVE</span>
        <span>SGD 11:47</span>
        <span>v.2026.06</span>
      </div>
    </div>
  );
}

function StatusRibbon() {
  const cells = [
    ['SESSION', 'PA_HQ_07'],
    ['REGION', 'IN/US/SG'],
    ['STATUS', 'OPEN · DIR/VP'],
    ['CYCLE', 'FY26 · Q2'],
    ['MODE', 'ENTERPRISE × AI'],
    ['SECURITY', 'PUBLIC'],
  ];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      borderBottom: `1px solid ${RULE}`,
      fontSize: 10,
      letterSpacing: 1.4,
    }}>
      {cells.map(([k, v], i) => (
        <div key={k} style={{
          padding: '10px 24px',
          borderLeft: i === 0 ? 'none' : `1px solid ${RULE}`,
          display: 'flex',
          gap: 10,
        }}>
          <span style={{ color: FAINT }}>{k}</span>
          <span style={{ color: '#fff' }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <div style={{ padding: '64px 48px 56px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>
      <div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 36 }}>
          <Tag>BRIEF_001</Tag>
          <span style={{ color: FAINT, fontSize: 11 }}>// design leadership · enterprise AI · systems thinking</span>
        </div>
        <div style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: 88,
          lineHeight: 0.96,
          letterSpacing: -2.5,
          fontWeight: 500,
          color: '#fff',
          marginBottom: 28,
        }}>
          Designing the<br/>
          <span style={{ color: SIGNAL, fontStyle: 'italic', fontWeight: 300 }}>intelligence layer</span><br/>
          of the enterprise.
        </div>
        <div style={{
          maxWidth: 640,
          fontSize: 14,
          lineHeight: 1.7,
          color: 'oklch(82% 0.012 175)',
          marginBottom: 40,
        }}>
          <span style={{ color: SIGNAL }}>&gt;</span>&nbsp; Twenty-one years translating organisational
          ambiguity into shipped product. Currently focused on the
          interface between humans, agents, and operating systems
          of the modern enterprise — for Big-4 consultancies,
          AI-native startups, and global product orgs.
        </div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 56 }}>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 22px',
            background: SIGNAL, color: 'oklch(20% 0.04 80)',
            textDecoration: 'none',
            fontSize: 11, letterSpacing: 2, fontWeight: 700,
            borderRadius: 2,
          }}>VIEW CASE STUDIES <span>→</span></a>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 22px',
            background: 'transparent', color: '#fff',
            border: `1px solid ${RULE}`,
            textDecoration: 'none',
            fontSize: 11, letterSpacing: 2, fontWeight: 500,
            borderRadius: 2,
          }}>LEADERSHIP &amp; PHILOSOPHY</a>
        </div>
        <div style={{ display: 'flex', gap: 36, color: FAINT, fontSize: 10, letterSpacing: 1.4 }}>
          <span>TRUSTED ACROSS</span>
          <span>DELL</span>
          <span>BOEING</span>
          <span>GOI / MeitY</span>
          <span>FORTUNE 100 PLATFORMS</span>
          <span>YC-BACKED AI</span>
        </div>
      </div>

      {/* Right side — terminal block */}
      <div style={{
        border: `1px solid ${RULE}`,
        background: SURFACE,
        padding: 18,
        fontSize: 11,
        position: 'relative',
        alignSelf: 'start',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${RULE}`, paddingBottom: 10, marginBottom: 14 }}>
          <span style={{ color: DIM, letterSpacing: 1.4 }}>/operator.profile</span>
          <span style={{ color: SIGNAL }}>● READY</span>
        </div>
        {[
          ['name', 'Puneet Arora'],
          ['role', 'Design Director · UX Strategy'],
          ['based', 'Bengaluru ↔ Bay Area'],
          ['cohort', 'enterprise / AI / B2B'],
          ['cycle', '21 yrs · 4 reinventions'],
          ['leads', '5 design orgs · ~120 reports'],
          ['stack', 'systems · agents · platforms'],
          ['shipped', '38 products at >$1B scale'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', padding: '7px 0', borderBottom: `1px dashed ${RULE}` }}>
            <span style={{ color: FAINT }}>{k}</span>
            <span style={{ color: '#fff' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, color: FAINT, fontSize: 10 }}>
          <span>~/portfolio</span>
          <span>esc to dismiss</span>
        </div>
      </div>
    </div>
  );
}

function Manifest() {
  const cells = [
    ['21', 'YRS', 'product · platform · agentic'],
    ['38', 'SHIPPED', 'enterprise products at scale'],
    ['$2.1B', 'INFLUENCED', 'revenue / cost / efficiency'],
    ['120+', 'DESIGNERS', 'mentored across 4 orgs'],
    ['14', 'DOMAINS', 'hardware, finance, gov, AI'],
    ['9', 'MARKETS', 'NA · EU · APAC · MENA'],
  ];
  return (
    <div>
      <SectionHead n="02" title="MANIFEST" sub="A scan of the operator." />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        borderTop: `1px solid ${RULE}`,
        borderBottom: `1px solid ${RULE}`,
      }}>
        {cells.map(([n, k, sub], i) => (
          <div key={k} style={{
            padding: '28px 24px 24px',
            borderLeft: i === 0 ? 'none' : `1px solid ${RULE}`,
            background: i % 2 === 0 ? 'transparent' : SURFACE,
          }}>
            <div style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 44, fontWeight: 500,
              color: '#fff', lineHeight: 1, letterSpacing: -1.5,
              marginBottom: 12,
            }}>{n}</div>
            <div style={{ color: SIGNAL, fontSize: 10, letterSpacing: 1.8, marginBottom: 8 }}>{k}</div>
            <div style={{ color: DIM, fontSize: 11, lineHeight: 1.5 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ n, title, sub, right }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: '64px 48px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
        <span style={{ color: FAINT, fontSize: 11, letterSpacing: 2 }}>§ {n}</span>
        <span style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: 36, fontWeight: 500, letterSpacing: -0.5, color: '#fff',
        }}>{title}</span>
        {sub && <span style={{ color: DIM, fontSize: 12 }}>// {sub}</span>}
      </div>
      {right && <div style={{ color: DIM, fontSize: 11 }}>{right}</div>}
    </div>
  );
}

function Dossiers() {
  const studies = [
    {
      id: 'D.001',
      client: 'Dell Technologies',
      title: 'Dell.com — Generative commerce agent',
      tag: 'ENTERPRISE × AI',
      year: '2024–26',
      lift: '+38% AOV · −41% time-to-config',
      blurb: 'Re-architected the .com discovery flow around an embedded GenAI co-pilot. Took a 14-step configurator down to a guided dialogue without losing fidelity for power buyers.',
      scope: ['research · 7 markets', 'agent orchestration', 'design system v3', 'CX guardrails'],
    },
    {
      id: 'D.002',
      client: 'Boeing · Commercial Aviation',
      title: 'TAAM — Tail asset assignment model',
      tag: 'PLATFORM · OPS',
      year: '2022–24',
      lift: '$220M routing efficiency · y/y',
      blurb: 'Designed the planner-facing workspace for Boeing\'s tail-assignment platform. A high-stakes, low-tolerance environment where one wrong assignment cascades across hubs.',
      scope: ['ops research', 'ambient alerts', 'multi-role IA', 'sim-to-prod parity'],
    },
    {
      id: 'D.003',
      client: 'Vigyan Setu · GoI / MeitY',
      title: 'India AI Impact Event — Feb 2026',
      tag: 'GOV · PUBLIC AI',
      year: '2025–26',
      lift: '11 ministries · 1.4B citizens reached',
      blurb: 'Lead design partner for the national flagship convening on responsible AI. Designed the on-stage product showcase, identity system, and the citizen-facing demo of public-AI services.',
      scope: ['identity', 'showcase UX', 'gov stakeholder ops', 'demo authoring'],
    },
  ];

  return (
    <div>
      <SectionHead n="03" title="DOSSIERS" sub="Selected case files." right="03 of 08 visible · open all →" />
      <div style={{ borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
        {studies.map((s, i) => (
          <a href="#" key={s.id} style={{
            display: 'grid',
            gridTemplateColumns: '90px 200px 1fr 280px 140px',
            padding: '28px 48px',
            borderTop: i === 0 ? 'none' : `1px solid ${RULE}`,
            gap: 32,
            textDecoration: 'none',
            color: 'inherit',
            position: 'relative',
          }}>
            <div>
              <div style={{ color: SIGNAL, fontSize: 11, letterSpacing: 1.4 }}>{s.id}</div>
              <div style={{ color: FAINT, fontSize: 10, marginTop: 4 }}>{s.year}</div>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 13 }}>{s.client}</div>
              <div style={{ color: DIM, fontSize: 10, marginTop: 4, letterSpacing: 1.2 }}>{s.tag}</div>
            </div>
            <div>
              <div style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: 24, color: '#fff', fontWeight: 500, letterSpacing: -0.3, marginBottom: 10,
              }}>{s.title}</div>
              <div style={{ color: DIM, fontSize: 12, lineHeight: 1.6, maxWidth: 500 }}>{s.blurb}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                {s.scope.map(sc => (
                  <span key={sc} style={{
                    fontSize: 10, color: DIM, padding: '3px 8px',
                    border: `1px solid ${RULE}`, borderRadius: 2, letterSpacing: 0.6,
                  }}>{sc}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ color: FAINT, fontSize: 10, letterSpacing: 1.4, marginBottom: 6 }}>OUTCOME</div>
              <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.5 }}>{s.lift}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
              <span style={{
                color: SIGNAL, fontSize: 11, letterSpacing: 1.4,
                border: `1px solid ${SIGNAL}`, padding: '6px 12px', borderRadius: 2,
              }}>OPEN →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function AILab() {
  const experiments = [
    { id: 'X.07', name: 'AGENT.MESH', desc: 'A planner that schedules eight specialist agents against one OKR doc.', state: 'LIVE' },
    { id: 'X.06', name: 'RUBRIC.OS', desc: 'Critique engine for design teams — generative reviews against a house rubric.', state: 'BETA' },
    { id: 'X.05', name: 'INTERVIEW.LOOP', desc: 'Voice-first UXR copilot. Synthesises 40 interviews into a defensible insight map.', state: 'LIVE' },
    { id: 'X.04', name: 'ATLAS.SKETCH', desc: 'Vibe-coded enterprise wireframer. Outputs Figma + tokens + React in one pass.', state: 'INTERNAL' },
  ];
  return (
    <div style={{ background: SURFACE_2, borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
      <SectionHead n="04" title="AI · LAB" sub="Working prototypes from the workbench." right="why this matters →" />
      <div style={{ padding: '0 48px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: `1px solid ${RULE}` }}>
          {experiments.map((x, i) => (
            <div key={x.id} style={{
              padding: 22,
              borderLeft: i === 0 ? 'none' : `1px solid ${RULE}`,
              background: SURFACE,
              minHeight: 220,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <span style={{ color: SIGNAL, fontSize: 11, letterSpacing: 1.4 }}>{x.id}</span>
                  <span style={{
                    fontSize: 9, padding: '2px 6px', border: `1px solid ${x.state === 'LIVE' ? SIGNAL : RULE}`,
                    color: x.state === 'LIVE' ? SIGNAL : DIM, letterSpacing: 1.4, borderRadius: 2,
                  }}>{x.state}</span>
                </div>
                <div style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 22, fontWeight: 500, color: '#fff', marginBottom: 10, letterSpacing: -0.3,
                }}>{x.name}</div>
                <div style={{ color: DIM, fontSize: 12, lineHeight: 1.6 }}>{x.desc}</div>
              </div>
              <a href="#" style={{ color: '#fff', fontSize: 10, letterSpacing: 1.6, textDecoration: 'none', marginTop: 24 }}>READ NOTE →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThinkingFeed() {
  const items = [
    { date: '2026.05.14', kind: 'ESSAY', title: 'The org chart is the product. Or it should be.', read: '8 min' },
    { date: '2026.04.02', kind: 'TALK', title: 'Designing agents that earn institutional trust — IndiaAI Summit', read: '32 min' },
    { date: '2026.02.18', kind: 'NOTE', title: 'Three rituals every enterprise design team should steal from ops', read: '4 min' },
    { date: '2025.12.07', kind: 'FRAMEWORK', title: 'The Five-Lens model for stakeholder alignment at scale', read: '12 min' },
  ];
  return (
    <div>
      <SectionHead n="05" title="WRITING" sub="Frameworks, essays, talks." right="see all 41 →" />
      <div style={{ borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
        {items.map((it, i) => (
          <a href="#" key={it.title} style={{
            display: 'grid',
            gridTemplateColumns: '140px 100px 1fr 80px 24px',
            alignItems: 'center',
            padding: '20px 48px',
            borderTop: i === 0 ? 'none' : `1px solid ${RULE}`,
            color: 'inherit', textDecoration: 'none', gap: 24,
          }}>
            <span style={{ color: FAINT, fontSize: 11, letterSpacing: 1.2 }}>{it.date}</span>
            <span style={{ color: SIGNAL, fontSize: 10, letterSpacing: 1.4 }}>{it.kind}</span>
            <span style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 17, color: '#fff', letterSpacing: -0.2,
            }}>{it.title}</span>
            <span style={{ color: DIM, fontSize: 11, textAlign: 'right' }}>{it.read}</span>
            <span style={{ color: DIM, textAlign: 'right' }}>→</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Foot() {
  return (
    <div style={{
      padding: '52px 48px 44px',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 48, borderTop: `1px solid ${RULE}`,
    }}>
      <div>
        <div style={{ color: FAINT, fontSize: 11, letterSpacing: 1.6, marginBottom: 14 }}>// END_OF_BRIEF</div>
        <div style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: 40, fontWeight: 500, color: '#fff', letterSpacing: -1, lineHeight: 1.05,
          marginBottom: 22,
        }}>
          Let&apos;s build the<br/>
          <span style={{ color: SIGNAL, fontStyle: 'italic', fontWeight: 300 }}>next operating system</span><br/>
          of your enterprise.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 20px', background: SIGNAL, color: 'oklch(20% 0.04 80)',
            textDecoration: 'none', fontSize: 11, letterSpacing: 1.8, fontWeight: 700, borderRadius: 2,
          }}>BOOK A 30-MIN INTRO →</a>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 20px', background: 'transparent', color: '#fff',
            border: `1px solid ${RULE}`,
            textDecoration: 'none', fontSize: 11, letterSpacing: 1.8, borderRadius: 2,
          }}>DOWNLOAD CV</a>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignSelf: 'end' }}>
        {[
          ['LINKEDIN', '/in/puneetarora'],
          ['EMAIL', 'p@arora.studio'],
          ['LOCATION', 'Bengaluru · San Francisco'],
          ['AVAILABILITY', 'Q3 2026 onward'],
        ].map(([k, v]) => (
          <div key={k} style={{ borderTop: `1px solid ${RULE}`, paddingTop: 12 }}>
            <div style={{ color: FAINT, fontSize: 10, letterSpacing: 1.4, marginBottom: 6 }}>{k}</div>
            <div style={{ color: '#fff', fontSize: 13 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerminalHome() {
  return (
    <div style={termStyles.root}>
      <TopBar />
      <StatusRibbon />
      <Hero />
      <Manifest />
      <Dossiers />
      <AILab />
      <ThinkingFeed />
      <Foot />
    </div>
  );
}

Object.assign(window, { TerminalHome });
