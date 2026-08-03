/* Builder's Bible — interactive AI knowledge portal.
 * Built by Puneet Arora.
 * Vanilla JS. No dependencies. State persisted in localStorage.
 * Structure: DATA → STORE → RENDERERS → ROUTER → INTERACTIONS → BOOT.
 */
(function () {
  'use strict';

  /* ─────────────────────────── DATA ─────────────────────────── */

  var TOOLCOLORS = {
    Claude: '#d97757', GPT: '#10a37f', Gemini: '#4285f4', Cursor: '#6b7280',
    Windsurf: '#22d3aa', n8n: '#ea4b71', Zapier: '#ff4a00', Supabase: '#3ecf8e',
    Vercel: '#111111', Railway: '#8b5cf6', LangGraph: '#1f7a5c', CrewAI: '#f59e0b',
    AutoGen: '#0ea5e9'
  };

  var TOPICS = [
    { id: 'agents', name: 'AI Agents', ic: '🤖', count: 14 },
    { id: 'automation', name: 'Automation', ic: '⚙️', count: 11 },
    { id: 'prompting', name: 'Prompt Engineering', ic: '✍️', count: 18 },
    { id: 'claude', name: 'Claude', ic: '🟠', count: 9 },
    { id: 'openai', name: 'OpenAI', ic: '🟢', count: 8 },
    { id: 'gemini', name: 'Gemini', ic: '🔵', count: 6 },
    { id: 'cursor', name: 'Cursor', ic: '⌨️', count: 7 },
    { id: 'coding', name: 'Coding', ic: '💻', count: 15 },
    { id: 'business', name: 'Business', ic: '📈', count: 10 },
    { id: 'marketing', name: 'Marketing', ic: '📣', count: 9 },
    { id: 'productivity', name: 'Productivity', ic: '⚡', count: 12 },
    { id: 'mcp', name: 'MCP', ic: '🔌', count: 6 },
    { id: 'rag', name: 'RAG', ic: '📚', count: 8 },
    { id: 'llms', name: 'LLMs', ic: '🧠', count: 13 },
    { id: 'voice', name: 'Voice AI', ic: '🎙️', count: 4 },
    { id: 'computeruse', name: 'Computer Use', ic: '🖱️', count: 3 },
    { id: 'finetuning', name: 'Fine Tuning', ic: '🎛️', count: 5 },
    { id: 'evals', name: 'Evaluations', ic: '🧪', count: 7 }
  ];

  var TOOLS = [
    'Claude', 'GPT', 'Gemini', 'Cursor', 'Windsurf', 'n8n', 'Zapier',
    'Supabase', 'Vercel', 'Railway', 'LangGraph', 'CrewAI', 'AutoGen'
  ];

  var ARTICLES = [
    { id: 'a1', title: 'Designing AI Agents That Actually Ship', sum: 'A field guide to moving agents from clever demo to reliable production — tool design, guardrails, and the eval loop that keeps them honest.', cat: 'agents', diff: 'Advanced', mins: 12, tools: ['Claude', 'LangGraph'], tags: ['agents', 'production', 'evals'], grad: ['#d97757', '#7c3f2e'] },
    { id: 'a2', title: 'The CO-STAR Prompting Framework, Operationalised', sum: 'Turn ad-hoc prompting into a repeatable craft. Context, Objective, Style, Tone, Audience, Response — with real before/after outputs.', cat: 'prompting', diff: 'Beginner', mins: 7, tools: ['Claude', 'GPT'], tags: ['prompting', 'frameworks'], grad: ['#10a37f', '#0b6b53'] },
    { id: 'a3', title: 'RAG Without the Hallucinations', sum: 'Chunking, retrieval scoring, and grounding strategies that keep answers tied to your source of truth instead of the model’s imagination.', cat: 'rag', diff: 'Intermediate', mins: 14, tools: ['Supabase', 'GPT'], tags: ['rag', 'retrieval', 'grounding'], grad: ['#3ecf8e', '#1f7a53'] },
    { id: 'a4', title: 'Building Your First MCP Server', sum: 'Model Context Protocol demystified. Expose your own tools to Claude and other clients with a clean, well-typed server.', cat: 'mcp', diff: 'Intermediate', mins: 10, tools: ['Claude'], tags: ['mcp', 'tools'], grad: ['#6b7280', '#3f4451'] },
    { id: 'a5', title: 'Automations That Pay for Themselves in a Week', sum: 'Five n8n + Zapier workflows that quietly remove hours of manual work — with the exact node graphs to copy.', cat: 'automation', diff: 'Beginner', mins: 8, tools: ['n8n', 'Zapier'], tags: ['automation', 'workflows'], grad: ['#ea4b71', '#9c2f4c'] },
    { id: 'a6', title: 'Multi-Agent Orchestration with CrewAI', sum: 'When one agent isn’t enough. Role design, delegation, and shared memory patterns for teams of cooperating agents.', cat: 'agents', diff: 'Advanced', mins: 16, tools: ['CrewAI', 'AutoGen'], tags: ['agents', 'orchestration'], grad: ['#f59e0b', '#9c6708'] },
    { id: 'a7', title: 'Vibe Coding with Cursor — A Serious Workflow', sum: 'Beyond autocomplete. Rules files, composer, and the review discipline that lets you ship real features fast.', cat: 'coding', diff: 'Intermediate', mins: 9, tools: ['Cursor', 'Claude'], tags: ['coding', 'cursor', 'workflow'], grad: ['#6366f1', '#3730a3'] },
    { id: 'a8', title: 'Evaluating LLM Output at Scale', sum: 'LLM-as-judge, rubric grading, and golden datasets. Build an evaluation harness before you build the feature.', cat: 'evals', diff: 'Advanced', mins: 13, tools: ['Claude', 'GPT'], tags: ['evals', 'quality'], grad: ['#0ea5e9', '#075985'] },
    { id: 'a9', title: 'Prompt Cost Control for Production Apps', sum: 'Caching, batching, and model routing patterns that cut your token bill by 60% without touching quality.', cat: 'llms', diff: 'Intermediate', mins: 11, tools: ['Claude', 'GPT', 'Gemini'], tags: ['llms', 'cost', 'production'], grad: ['#8b5cf6', '#5b21b6'] },
    { id: 'a10', title: 'Computer Use: Letting Models Drive the Screen', sum: 'The new frontier. How screen-control agents work, where they break, and how to sandbox them safely.', cat: 'computeruse', diff: 'Advanced', mins: 15, tools: ['Claude'], tags: ['computer-use', 'agents'], grad: ['#d97757', '#7c3f2e'] },
    { id: 'a11', title: 'Voice AI Pipelines from Scratch', sum: 'STT → reasoning → TTS with sub-second latency. The architecture, the tradeoffs, and the interruption handling.', cat: 'voice', diff: 'Advanced', mins: 12, tools: ['GPT'], tags: ['voice', 'realtime'], grad: ['#ec4899', '#9d174d'] },
    { id: 'a12', title: 'From Newsletter to Product: A Builder’s Playbook', sum: 'How to turn what you know into a platform people return to — content architecture, funnels, and retention loops.', cat: 'business', diff: 'Beginner', mins: 9, tools: ['Vercel', 'Supabase'], tags: ['business', 'growth'], grad: ['#22c55e', '#15803d'] }
  ];

  var PROMPTS = [
    { id: 'p1', title: 'The Ruthless Editor', cat: 'Writing', diff: 'Beginner', model: 'Claude', body: "You are a ruthless editor. Cut every sentence that doesn't earn its place. Preserve the author's voice and all facts. Return the tightened version, then a 3-bullet list of what you removed and why.\n\nTEXT:\n{{paste your draft}}", example: 'Turns a rambling 400-word intro into a sharp 180-word one, plus a rationale you can learn from.', tips: ['Add "keep it under N words" for hard limits.', 'Ask for two variants — one warm, one clinical.'] },
    { id: 'p2', title: 'Chain-of-Thought Debugger', cat: 'Coding', diff: 'Intermediate', model: 'Claude', body: "You are a senior engineer. Before proposing any fix, reason step by step about what the code is *supposed* to do vs. what it *actually* does. State your hypothesis, the single line that confirms it, then the minimal patch.\n\nBUG:\n{{describe symptom}}\n\nCODE:\n{{paste code}}", example: 'Isolates an off-by-one in a pagination loop and returns a one-line diff instead of a rewrite.', tips: ['Paste the failing test — grounding beats guessing.', 'Ask it to rate its own confidence 1–5.'] },
    { id: 'p3', title: 'CO-STAR Brief Generator', cat: 'Marketing', diff: 'Beginner', model: 'GPT', body: "Write using the CO-STAR framework.\nCONTEXT: {{who + situation}}\nOBJECTIVE: {{what the copy must achieve}}\nSTYLE: {{e.g. Stripe docs, confident}}\nTONE: {{e.g. warm, direct}}\nAUDIENCE: {{who reads it}}\nRESPONSE: {{format — 3 headlines + 1 subhead}}", example: 'Produces on-brief landing headlines that don’t need a second pass.', tips: ['Reuse the same CONTEXT block across a whole campaign.', 'Lock STYLE with a real reference URL.'] },
    { id: 'p4', title: 'Research Synthesiser', cat: 'Research', diff: 'Intermediate', model: 'Gemini', body: "Synthesise the sources below into a decision memo. Structure: (1) the question, (2) what the sources agree on, (3) where they conflict, (4) the strongest recommendation with its main risk. Cite each claim with [S1], [S2]…\n\nSOURCES:\n{{paste 3–8 excerpts}}", example: 'Collapses eight scattered excerpts into a one-page memo a busy exec can act on.', tips: ['Number your sources before pasting.', 'Ask for a confidence label on the recommendation.'] },
    { id: 'p5', title: 'Agent Tool Spec Writer', cat: 'Automation', diff: 'Advanced', model: 'Claude', body: "You design tools for AI agents. Given the capability below, write a JSON tool definition: a precise name, a description written for a model (not a human), typed parameters with when-to-use notes, and 2 failure modes the model should expect.\n\nCAPABILITY:\n{{describe what the tool does}}", example: 'Generates a clean tool schema with model-facing descriptions that reduce mis-calls.', tips: ['Describe *when not* to call the tool too.', 'Keep parameter names unambiguous — models read them literally.'] },
    { id: 'p6', title: 'Business Model Stress-Test', cat: 'Business', diff: 'Intermediate', model: 'Claude', body: "Act as a skeptical investor. Stress-test the idea below across: unit economics, distribution, defensibility, and the riskiest assumption. For each, give the sharpest objection and the one experiment that would resolve it.\n\nIDEA:\n{{one paragraph}}", example: 'Surfaces the assumption most likely to kill the idea — before you build it.', tips: ['Feed it your real numbers, not aspirations.', 'Ask which objection it would drop if you fixed only one.'] }
  ];

  var WORKFLOWS = [
    { id: 'w1', title: 'Inbox → Triaged Tasks', desc: 'Every inbound email is classified, summarised, and pushed to the right project board with a suggested reply drafted.', nodes: ['Gmail Trigger', 'Claude Classify', 'Summarise', 'Router', 'Notion / Linear'], build: '30 min', diff: 'Beginner', cost: '~$3/mo', tools: ['n8n', 'Claude'] },
    { id: 'w2', title: 'RAG Support Bot', desc: 'Docs are embedded into Supabase; user questions are retrieved, grounded, and answered with citations — with a human handoff on low confidence.', nodes: ['Webhook', 'Embed', 'Supabase Vector', 'Retrieve', 'Claude Answer', 'Confidence Gate'], build: '3 hrs', diff: 'Advanced', cost: '~$18/mo', tools: ['Supabase', 'Claude', 'n8n'] },
    { id: 'w3', title: 'Content Repurposing Engine', desc: 'One long-form article fans out into a thread, a LinkedIn post, a newsletter blurb, and three hooks — all in your voice.', nodes: ['RSS Trigger', 'Extract', 'Claude Rewrite ×4', 'Format', 'Buffer'], build: '45 min', diff: 'Intermediate', cost: '~$6/mo', tools: ['Zapier', 'Claude'] },
    { id: 'w4', title: 'Nightly Competitor Watch', desc: 'Scrapes tracked pages, diffs against yesterday, and sends a Slack digest of only what materially changed.', nodes: ['Cron', 'Fetch Pages', 'Diff', 'Gemini Summarise', 'Slack'], build: '1 hr', diff: 'Intermediate', cost: '~$4/mo', tools: ['n8n', 'Gemini'] }
  ];

  var PROJECTS = [
    { id: 'pr1', title: 'MeetingMind', problem: 'Meetings generate decisions nobody captures.', arch: 'Realtime STT → speaker diarisation → Claude summariser → action-item extractor → calendar + Notion sync.', stack: ['Next.js', 'Supabase', 'Claude', 'Vercel'], models: 'Claude + Whisper', cost: '~$40/mo', build: '3 weeks', grad: ['#6366f1', '#3730a3'] },
    { id: 'pr2', title: 'JobPilot', problem: 'Tailoring every application by hand doesn’t scale.', arch: 'JD parser → skills matcher → RAG over your history → Claude drafts a tailored CV + cover letter → ATS score check.', stack: ['React', 'LangGraph', 'Claude', 'Railway'], models: 'Claude', cost: '~$25/mo', build: '4 weeks', grad: ['#22d3aa', '#0f766e'] },
    { id: 'pr3', title: 'Observatory', problem: 'LLM apps fail silently in production.', arch: 'Trace collector → eval runners (LLM-as-judge) → drift alerts → dashboards. An observability layer for prompts.', stack: ['FastAPI', 'Supabase', 'GPT', 'Vercel'], models: 'GPT + Claude', cost: '~$60/mo', build: '6 weeks', grad: ['#0ea5e9', '#075985'] },
    { id: 'pr4', title: 'PowerGPT', problem: 'Domain experts can’t query dense technical manuals.', arch: 'Multimodal ingest (PDF + diagrams) → hybrid retrieval → Claude answers with page-cited grounding + figure previews.', stack: ['Python', 'pgvector', 'Claude', 'Railway'], models: 'Claude', cost: '~$35/mo', build: '5 weeks', grad: ['#d97757', '#7c3f2e'] }
  ];

  var INTENTS = ['Coding', 'Writing', 'Research', 'Automation', 'Customer Support', 'Voice', 'Image Generation'];
  // Comparison rows keyed loosely by intent relevance.
  var COMPARE = {
    Coding: [
      { tool: 'Claude', price: '$20/mo', speed: 82, quality: 95, ctx: '200K', reason: 96, strengths: 'Long-context refactors, careful reasoning', weak: 'Slower on trivial tasks' },
      { tool: 'GPT', price: '$20/mo', speed: 90, quality: 90, ctx: '128K', reason: 90, strengths: 'Broad ecosystem, fast', weak: 'Context drift on large repos' },
      { tool: 'Cursor', price: '$20/mo', speed: 88, quality: 92, ctx: 'Repo-aware', reason: 88, strengths: 'IDE-native, composer edits', weak: 'Depends on underlying model' },
      { tool: 'Gemini', price: '$20/mo', speed: 92, quality: 86, ctx: '1M', reason: 85, strengths: 'Massive context window', weak: 'Less consistent code style' }
    ],
    Writing: [
      { tool: 'Claude', price: '$20/mo', speed: 84, quality: 96, ctx: '200K', reason: 94, strengths: 'Voice, nuance, editing', weak: 'Can over-hedge' },
      { tool: 'GPT', price: '$20/mo', speed: 90, quality: 90, ctx: '128K', reason: 88, strengths: 'Versatile, fast drafts', weak: 'Generic default tone' },
      { tool: 'Gemini', price: '$20/mo', speed: 91, quality: 85, ctx: '1M', reason: 84, strengths: 'Research-grounded drafts', weak: 'Weaker at style-matching' }
    ],
    Research: [
      { tool: 'Gemini', price: '$20/mo', speed: 90, quality: 90, ctx: '1M', reason: 90, strengths: 'Huge context, web-grounded', weak: 'Citations need checking' },
      { tool: 'Claude', price: '$20/mo', speed: 82, quality: 93, ctx: '200K', reason: 95, strengths: 'Careful synthesis', weak: 'No native web by default' },
      { tool: 'GPT', price: '$20/mo', speed: 88, quality: 89, ctx: '128K', reason: 89, strengths: 'Tools + browsing', weak: 'Shorter context' }
    ],
    Automation: [
      { tool: 'n8n', price: 'Free / $20', speed: 88, quality: 90, ctx: 'N/A', reason: 80, strengths: 'Self-host, full control, code nodes', weak: 'Steeper learning curve' },
      { tool: 'Zapier', price: '$20+/mo', speed: 92, quality: 84, ctx: 'N/A', reason: 70, strengths: '7000+ integrations, easy', weak: 'Cost scales fast' },
      { tool: 'LangGraph', price: 'Free', speed: 80, quality: 92, ctx: 'N/A', reason: 92, strengths: 'Stateful agent graphs', weak: 'Code-first, not no-code' }
    ],
    'Customer Support': [
      { tool: 'Claude', price: 'API', speed: 84, quality: 95, ctx: '200K', reason: 94, strengths: 'Safe, on-tone, long policies', weak: 'Needs RAG for facts' },
      { tool: 'GPT', price: 'API', speed: 90, quality: 89, ctx: '128K', reason: 88, strengths: 'Fast, function-calling', weak: 'Tone drift at scale' }
    ],
    Voice: [
      { tool: 'GPT', price: 'API', speed: 94, quality: 90, ctx: 'Realtime', reason: 88, strengths: 'Realtime API, low latency', weak: 'Cost per minute' },
      { tool: 'Gemini', price: 'API', speed: 90, quality: 86, ctx: 'Realtime', reason: 84, strengths: 'Multimodal live', weak: 'Newer, fewer SDKs' }
    ],
    'Image Generation': [
      { tool: 'GPT', price: '$20/mo', speed: 78, quality: 92, ctx: 'N/A', reason: 85, strengths: 'Prompt adherence, text-in-image', weak: 'Slower renders' },
      { tool: 'Gemini', price: '$20/mo', speed: 86, quality: 88, ctx: 'N/A', reason: 82, strengths: 'Fast, editing', weak: 'Style range' }
    ]
  };

  var RESOURCES = [
    { g: 'Books', items: [
      { t: 'Designing Machine Learning Systems', star: '4.8', diff: 'Intermediate', time: '12 hrs' },
      { t: 'The AI Engineer’s Handbook', star: '4.6', diff: 'Beginner', time: '8 hrs' }
    ] },
    { g: 'Courses', items: [
      { t: 'Building LLM Apps (end-to-end)', star: '4.9', diff: 'Intermediate', time: '20 hrs' },
      { t: 'Prompt Engineering for Developers', star: '4.7', diff: 'Beginner', time: '3 hrs' }
    ] },
    { g: 'YouTube', items: [
      { t: 'Agents from First Principles', star: '4.8', diff: 'Advanced', time: '90 min' },
      { t: 'RAG in 40 Minutes', star: '4.5', diff: 'Beginner', time: '40 min' }
    ] },
    { g: 'GitHub', items: [
      { t: 'awesome-mcp-servers', star: '4.9', diff: 'All', time: 'browse' },
      { t: 'llm-eval-starter', star: '4.6', diff: 'Intermediate', time: 'clone' }
    ] },
    { g: 'Frameworks', items: [
      { t: 'LangGraph', star: '4.7', diff: 'Advanced', time: 'ongoing' },
      { t: 'CrewAI', star: '4.5', diff: 'Intermediate', time: 'ongoing' }
    ] },
    { g: 'Research Papers', items: [
      { t: 'ReAct: Reasoning + Acting', star: '4.9', diff: 'Advanced', time: '45 min' },
      { t: 'Self-Consistency in CoT', star: '4.7', diff: 'Advanced', time: '35 min' }
    ] },
    { g: 'Communities', items: [
      { t: 'Builder’s Bible Discord', star: '4.8', diff: 'All', time: 'join' },
      { t: 'r/LocalLLaMA', star: '4.6', diff: 'All', time: 'browse' }
    ] },
    { g: 'Starter Kits', items: [
      { t: 'Next.js + Supabase RAG kit', star: '4.7', diff: 'Intermediate', time: 'deploy' },
      { t: 'Agent-in-a-box template', star: '4.5', diff: 'Advanced', time: 'deploy' }
    ] },
    { g: 'Cheat Sheets', items: [
      { t: 'Prompt patterns one-pager', star: '4.8', diff: 'Beginner', time: '5 min' },
      { t: 'Token & pricing quick ref', star: '4.6', diff: 'Beginner', time: '5 min' }
    ] }
  ];

  var ROADMAP = [
    { lvl: 'Beginner', n: '01', steps: ['Understand tokens, context & temperature', 'Write your first structured prompt', 'Ship a no-code automation', 'Run a model comparison'] },
    { lvl: 'Intermediate', n: '02', steps: ['Build a RAG pipeline', 'Design a tool for an agent', 'Add evals to a prompt', 'Control cost with caching'] },
    { lvl: 'Advanced', n: '03', steps: ['Orchestrate multiple agents', 'Stand up an MCP server', 'Build an eval harness', 'Handle computer-use safely'] },
    { lvl: 'Production', n: '04', steps: ['Add tracing & observability', 'Set drift & quality alerts', 'Model routing & fallbacks', 'Red-team your agent'] },
    { lvl: 'Enterprise', n: '05', steps: ['Governance & policy framework', 'Human-in-the-loop review gates', 'Cost & usage dashboards', 'Org-wide AI enablement'] }
  ];

  var PERSONAS = [
    { id: 'beginner', ic: '🌱', t: 'Beginner', d: 'New to AI, curious', reco: { path: 'Beginner Roadmap', arts: ['CO-STAR Framework', 'Automations in a Week'], projs: ['Content Engine'], packs: ['Writing Prompts'], tools: ['Claude', 'Zapier'] } },
    { id: 'builder', ic: '🛠️', t: 'Builder', d: 'Ship side projects', reco: { path: 'Intermediate Roadmap', arts: ['RAG Without Hallucinations', 'Vibe Coding with Cursor'], projs: ['MeetingMind', 'JobPilot'], packs: ['Automation Prompts'], tools: ['Cursor', 'n8n', 'Supabase'] } },
    { id: 'developer', ic: '💻', t: 'Developer', d: 'Engineer by trade', reco: { path: 'Advanced Roadmap', arts: ['Designing AI Agents', 'Evaluating LLM Output'], projs: ['Observatory'], packs: ['Coding Prompts'], tools: ['LangGraph', 'Claude', 'Vercel'] } },
    { id: 'founder', ic: '🚀', t: 'Founder', d: 'Building a company', reco: { path: 'Business + Production', arts: ['Newsletter to Product', 'Prompt Cost Control'], projs: ['JobPilot'], packs: ['Business Prompts'], tools: ['Claude', 'Vercel', 'Supabase'] } },
    { id: 'enterprise', ic: '🏢', t: 'Enterprise', d: 'Scale AI in an org', reco: { path: 'Enterprise Roadmap', arts: ['Multi-Agent Orchestration', 'Evaluating LLM Output'], projs: ['Observatory'], packs: ['Governance Prompts'], tools: ['LangGraph', 'Claude'] } },
    { id: 'student', ic: '🎓', t: 'Student', d: 'Learning the craft', reco: { path: 'Beginner Roadmap', arts: ['CO-STAR Framework', 'Building an MCP Server'], projs: ['MeetingMind'], packs: ['Research Prompts'], tools: ['Gemini', 'Claude'] } }
  ];

  var STATS = [
    { k: 'Articles Published', end: 128, suf: '' },
    { k: 'Projects Built', end: 24, suf: '' },
    { k: 'AI Workflows', end: 47, suf: '' },
    { k: 'Prompt Packs', end: 36, suf: '' },
    { k: 'Newsletter Readers', end: 18400, suf: '+' },
    { k: 'Reading Hours', end: 940, suf: '' },
    { k: 'Updated This Week', end: 9, suf: '' }
  ];

  var LEADERS = [
    { n: 'ada.builds', sub: '14 workflows shipped', pts: 2840 },
    { n: 'grace_h', sub: 'RAG specialist', pts: 2610 },
    { n: 'linus.dev', sub: 'agent orchestration', pts: 2390 },
    { n: 'margaret_ai', sub: 'eval frameworks', pts: 2150 },
    { n: 'alan.t', sub: 'prompt libraries', pts: 1980 }
  ];

  var STACK = [
    { nm: 'Claude', role: 'Primary reasoning & code' },
    { nm: 'Cursor', role: 'Daily coding environment' },
    { nm: 'Gemini', role: 'Long-context research' },
    { nm: 'OpenAI', role: 'Voice & image pipelines' },
    { nm: 'Supabase', role: 'Data + vector store' },
    { nm: 'Vercel', role: 'Deploy & edge' },
    { nm: 'Railway', role: 'Backend services' },
    { nm: 'n8n', role: 'Automation backbone' }
  ];

  /* ─────────────────────────── STORE ─────────────────────────── */

  var STORE = {
    read: function (k, def) { try { var v = localStorage.getItem('bb-' + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    write: function (k, v) { try { localStorage.setItem('bb-' + k, JSON.stringify(v)); } catch (e) {} }
  };
  var state = {
    bookmarks: STORE.read('bookmarks', {}),
    likes: STORE.read('likes', {}),
    progress: STORE.read('progress', {}),
    savedPrompts: STORE.read('savedPrompts', {}),
    savedFlows: STORE.read('savedFlows', {}),
    completed: STORE.read('completed', {})
  };
  function persist() {
    STORE.write('bookmarks', state.bookmarks);
    STORE.write('likes', state.likes);
    STORE.write('progress', state.progress);
    STORE.write('savedPrompts', state.savedPrompts);
    STORE.write('savedFlows', state.savedFlows);
    STORE.write('completed', state.completed);
  }

  /* ─────────────────────────── HELPERS ─────────────────────────── */

  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function grad(a, b) { return 'background:linear-gradient(135deg,' + a + ',' + b + ');'; }
  function toolGlyph(name) {
    var c = TOOLCOLORS[name] || '#888';
    return '<span class="glyph" style="background:' + c + '">' + esc(name[0]) + '</span>';
  }
  var toast = (function () {
    var t = null, timer = null;
    return function (msg) {
      if (!t) { t = el('<div class="bb-toast"></div>'); document.body.appendChild(t); }
      t.textContent = msg; t.classList.add('is-show');
      clearTimeout(timer); timer = setTimeout(function () { t.classList.remove('is-show'); }, 1800);
    };
  })();

  /* ─────────────────────────── RENDERERS ─────────────────────────── */

  function renderTopics() {
    var wrap = $('#bb-topics'); if (!wrap) return;
    wrap.innerHTML = TOPICS.map(function (t) {
      return '<button class="bb-topic" data-topic="' + t.id + '">' +
        '<span class="ic">' + t.ic + '</span>' +
        '<span class="t">' + esc(t.name) + '</span>' +
        '<span class="c">' + t.count + ' resources</span>' +
        '<span class="arw">→</span></button>';
    }).join('');
  }

  function renderToolLogos() {
    var wrap = $('#bb-tools'); if (!wrap) return;
    wrap.innerHTML = TOOLS.map(function (name) {
      return '<button class="bb-toollogo" data-tool="' + esc(name) + '">' +
        toolGlyph(name) + '<span class="nm">' + esc(name) + '</span></button>';
    }).join('');
  }

  function articleCard(a) {
    var bm = state.bookmarks[a.id], lk = state.likes[a.id], pr = state.progress[a.id] || 0;
    return '<article class="bb-card" data-id="' + a.id + '" data-tags="' + esc((a.tags.join(' ') + ' ' + a.tools.join(' ') + ' ' + a.title + ' ' + a.cat).toLowerCase()) + '" data-cat="' + a.cat + '" data-diff="' + a.diff + '" data-mins="' + a.mins + '" data-tools="' + esc(a.tools.join(',')) + '">' +
      '<div class="bb-card__cover" style="' + grad(a.grad[0], a.grad[1]) + '"><span class="badge">' + esc(a.cat) + '</span></div>' +
      (pr > 0 ? '<div class="bb-progress"><i style="width:' + pr + '%"></i></div>' : '') +
      '<div class="bb-card__body">' +
        '<h3 class="bb-card__title">' + esc(a.title) + '</h3>' +
        '<p class="bb-card__sum">' + esc(a.sum) + '</p>' +
        '<div class="bb-card__tags">' + a.tools.map(function (t) { return '<span class="bb-mini-tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '<div class="bb-card__meta"><span class="diff">' + esc(a.diff) + '</span><span>' + a.mins + ' min read</span></div>' +
        '<div class="bb-card__actions">' +
          '<button class="bb-iconbtn bb-bookmark ' + (bm ? 'is-on' : '') + '" data-id="' + a.id + '" title="Bookmark" aria-pressed="' + !!bm + '">' + (bm ? '★' : '☆') + '</button>' +
          '<button class="bb-iconbtn bb-like ' + (lk ? 'is-on' : '') + '" data-id="' + a.id + '" title="Like" aria-pressed="' + !!lk + '">♥</button>' +
          '<button class="bb-iconbtn bb-share" data-id="' + a.id + '" title="Share">↗</button>' +
          '<a class="read bb-readbtn" data-id="' + a.id + '" href="#">READ →</a>' +
        '</div>' +
      '</div></article>';
  }

  function renderArticles(list) {
    var wrap = $('#bb-articlegrid'); if (!wrap) return;
    list = list || ARTICLES;
    if (!list.length) { wrap.innerHTML = emptyState('📭', 'No articles match', 'Try clearing a filter or searching a different tool.'); }
    else { wrap.innerHTML = list.map(articleCard).join(''); }
    var c = $('#bb-articlecount'); if (c) c.textContent = list.length + ' / ' + ARTICLES.length;
  }

  function renderFeatured() {
    var wrap = $('#bb-featured'); if (!wrap) return;
    wrap.innerHTML = ARTICLES.slice(0, 3).map(articleCard).join('');
  }

  function renderPrompts(list) {
    var wrap = $('#bb-promptlist'); if (!wrap) return;
    list = list || PROMPTS;
    wrap.innerHTML = list.map(function (p) {
      var saved = state.savedPrompts[p.id];
      return '<div class="bb-prompt" data-id="' + p.id + '" data-tags="' + esc((p.title + ' ' + p.cat + ' ' + p.model).toLowerCase()) + '" data-cat="' + esc(p.cat) + '" data-model="' + esc(p.model) + '">' +
        '<div class="bb-prompt__head"><div>' +
          '<div class="bb-prompt__t">' + esc(p.title) + '</div>' +
          '<div class="bb-prompt__meta"><span class="m">' + esc(p.model) + '</span><span>' + esc(p.cat) + '</span><span>' + esc(p.diff) + '</span></div>' +
        '</div><span class="bb-prompt__toggle">+</span></div>' +
        '<div class="bb-prompt__body">' +
          '<div class="bb-code"><button class="bb-copy" data-copy="' + p.id + '">COPY</button>' + esc(p.body) + '</div>' +
          '<div class="bb-prompt__sub">Example output</div><div class="bb-prompt__example">' + esc(p.example) + '</div>' +
          '<div class="bb-prompt__sub">Tips</div><ul class="bb-prompt__tips">' + p.tips.map(function (t) { return '<li><span>' + esc(t) + '</span></li>'; }).join('') + '</ul>' +
          '<div class="bb-flow__actions" style="margin-top:16px">' +
            '<button class="bb-chip bb-saveprompt ' + (saved ? 'is-active' : '') + '" data-id="' + p.id + '">' + (saved ? '★ Saved' : '☆ Bookmark') + '</button>' +
            '<button class="bb-chip bb-shareprompt" data-id="' + p.id + '">↗ Share</button>' +
          '</div>' +
        '</div></div>';
    }).join('');
  }

  function renderWorkflows() {
    var wrap = $('#bb-workflowlist'); if (!wrap) return;
    wrap.innerHTML = WORKFLOWS.map(function (w) {
      var saved = state.savedFlows[w.id];
      return '<div class="bb-flow" data-id="' + w.id + '">' +
        '<div class="bb-flow__top"><div><div class="bb-flow__t">' + esc(w.title) + '</div><div class="bb-flow__d">' + esc(w.desc) + '</div></div>' +
        '<div class="bb-card__tags">' + w.tools.map(function (t) { return '<span class="bb-mini-tag">' + esc(t) + '</span>'; }).join('') + '</div></div>' +
        '<div class="bb-flow__diagram">' + w.nodes.map(function (n, i) { return (i ? '<span class="bb-flow__arrow">→</span>' : '') + '<span class="bb-flow__node">' + esc(n) + '</span>'; }).join('') + '</div>' +
        '<div class="bb-flow__facts">' +
          '<div class="f"><div class="v">' + esc(w.build) + '</div><div class="l">Build time</div></div>' +
          '<div class="f"><div class="v">' + esc(w.diff) + '</div><div class="l">Difficulty</div></div>' +
          '<div class="f"><div class="v">' + esc(w.cost) + '</div><div class="l">Est. cost</div></div>' +
        '</div>' +
        '<div class="bb-flow__actions">' +
          '<button class="bb-chip bb-flow-json" data-id="' + w.id + '">⬇ Download JSON</button>' +
          '<button class="bb-chip bb-flow-copy" data-id="' + w.id + '">⧉ Copy steps</button>' +
          '<button class="bb-chip bb-saveflow ' + (saved ? 'is-active' : '') + '" data-id="' + w.id + '">' + (saved ? '★ Saved' : '☆ Bookmark') + '</button>' +
        '</div></div>';
    }).join('');
  }

  function renderProjects() {
    var wrap = $('#bb-projectgrid'); if (!wrap) return;
    wrap.innerHTML = PROJECTS.map(function (p) {
      return '<article class="bb-proj">' +
        '<div class="bb-proj__shot" style="' + grad(p.grad[0], p.grad[1]) + '">' + esc(p.title) + '</div>' +
        '<div class="bb-proj__body">' +
          '<h3 class="bb-proj__t">' + esc(p.title) + '</h3>' +
          '<div class="bb-proj__row"><b>Problem</b>' + esc(p.problem) + '</div>' +
          '<div class="bb-proj__row"><b>Architecture</b>' + esc(p.arch) + '</div>' +
          '<div class="bb-proj__stack">' + p.stack.map(function (s) { return '<span class="bb-mini-tag">' + esc(s) + '</span>'; }).join('') + '</div>' +
          '<div class="bb-flow__facts">' +
            '<div class="f"><div class="v">' + esc(p.models) + '</div><div class="l">Models</div></div>' +
            '<div class="f"><div class="v">' + esc(p.cost) + '</div><div class="l">Cost</div></div>' +
            '<div class="f"><div class="v">' + esc(p.build) + '</div><div class="l">Time to build</div></div>' +
          '</div>' +
          '<div class="bb-flow__actions"><button class="bb-chip">GitHub ↗</button><button class="bb-chip">Live demo ↗</button></div>' +
        '</div></article>';
    }).join('');
  }

  function renderCompare(intent) {
    var wrap = $('#bb-compare'); if (!wrap) return;
    var rows = COMPARE[intent] || COMPARE.Coding;
    wrap.innerHTML = '<table class="bb-table"><thead><tr>' +
      '<th>Tool</th><th>Pricing</th><th>Speed</th><th>Quality</th><th>Context</th><th>Reasoning</th><th>Strengths</th><th>Watch out</th>' +
      '</tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td class="tool">' + esc(r.tool) + '</td><td>' + esc(r.price) + '</td>' +
          '<td>' + r.speed + '<div class="meter"><i style="width:' + r.speed + '%"></i></div></td>' +
          '<td>' + r.quality + '<div class="meter"><i style="width:' + r.quality + '%"></i></div></td>' +
          '<td>' + esc(r.ctx) + '</td>' +
          '<td>' + r.reason + '<div class="meter"><i style="width:' + r.reason + '%"></i></div></td>' +
          '<td>' + esc(r.strengths) + '</td><td>' + esc(r.weak) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function renderResources() {
    var wrap = $('#bb-resources'); if (!wrap) return;
    wrap.innerHTML = RESOURCES.map(function (g) {
      return '<div class="bb-res-group"><h3>' + esc(g.g) + '</h3>' +
        g.items.map(function (it) {
          return '<div class="bb-res-item"><div class="t">' + esc(it.t) + '</div>' +
            '<div class="m"><span class="star">★ ' + esc(it.star) + '</span><span>' + esc(it.diff) + '</span><span>' + esc(it.time) + '</span></div></div>';
        }).join('') + '</div>';
    }).join('');
  }

  function renderRoadmap() {
    var wrap = $('#bb-roadmap'); if (!wrap) return;
    wrap.innerHTML = ROADMAP.map(function (s, si) {
      return '<div class="bb-road__stage"><div class="bb-road__lvl">Stage ' + s.n + '<span class="n">' + esc(s.lvl) + '</span></div>' +
        '<ul class="bb-road__steps">' + s.steps.map(function (st, i) {
          var key = si + '-' + i, done = state.completed[key];
          return '<li class="' + (done ? 'done' : '') + '" data-key="' + key + '"><span class="bb-road__check">✓</span><span>' + esc(st) + '</span></li>';
        }).join('') + '</ul></div>';
    }).join('');
  }

  function renderLeaders() {
    var wrap = $('#bb-leaders'); if (!wrap) return;
    wrap.innerHTML = LEADERS.map(function (l, i) {
      return '<div class="bb-leader__row"><span class="bb-leader__rank">' + (i + 1) + '</span>' +
        '<span class="bb-leader__name">' + esc(l.n) + '<span class="sub">' + esc(l.sub) + '</span></span>' +
        '<span class="bb-leader__pts">' + l.pts.toLocaleString() + ' pts</span></div>';
    }).join('');
  }

  function renderStack() {
    var wrap = $('#bb-stack'); if (!wrap) return;
    wrap.innerHTML = STACK.map(function (s) {
      return '<div class="bb-stackcard">' + toolGlyphInline(s.nm) + '<div class="nm">' + esc(s.nm) + '</div><div class="role">' + esc(s.role) + '</div></div>';
    }).join('');
  }
  function toolGlyphInline(name) {
    var c = TOOLCOLORS[name] || '#888';
    return '<span style="display:inline-flex;width:28px;height:28px;border-radius:7px;align-items:center;justify-content:center;font-family:var(--f-mono);font-weight:700;color:#fff;margin-bottom:10px;background:' + c + '">' + esc(name[0]) + '</span>';
  }

  function emptyState(ic, t, d, cta) {
    return '<div class="bb-empty"><div class="ic">' + ic + '</div><div class="t">' + esc(t) + '</div><div class="d">' + esc(d) + '</div>' + (cta || '') + '</div>';
  }

  function renderDashboard() {
    var wrap = $('#bb-dash'); if (!wrap) return;
    var bmIds = Object.keys(state.bookmarks).filter(function (k) { return state.bookmarks[k]; });
    var savedP = Object.keys(state.savedPrompts).filter(function (k) { return state.savedPrompts[k]; });
    var savedF = Object.keys(state.savedFlows).filter(function (k) { return state.savedFlows[k]; });
    var reading = Object.keys(state.progress).filter(function (k) { return state.progress[k] > 0 && state.progress[k] < 100; });
    var doneCount = Object.keys(state.completed).filter(function (k) { return state.completed[k]; }).length;

    function panel(title, body) { return '<div class="bb-panel"><h3>' + title + '</h3>' + body + '</div>'; }

    var bmBody = bmIds.length
      ? '<div style="display:grid;gap:10px">' + bmIds.map(function (id) {
          var a = ARTICLES.filter(function (x) { return x.id === id; })[0]; if (!a) return '';
          return '<a href="#" class="bb-readbtn" data-id="' + id + '" style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--rule)"><span style="color:var(--ink);font-size:14px">' + esc(a.title) + '</span><span class="signal mono" style="font-size:10px">' + a.mins + ' min →</span></a>';
        }).join('') + '</div>'
      : emptyState('🔖', 'No bookmarks yet', 'Save articles you want to come back to — they’ll live here for quick access.', '<button class="btn btn--ghost bb-nav" data-view="articles">Browse articles</button>');

    var readBody = reading.length
      ? '<div style="display:grid;gap:12px">' + reading.map(function (id) {
          var a = ARTICLES.filter(function (x) { return x.id === id; })[0]; if (!a) return '';
          return '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--ink);font-size:14px">' + esc(a.title) + '</span><span class="mono faint" style="font-size:10px">' + state.progress[id] + '%</span></div><div class="bb-progress"><i style="width:' + state.progress[id] + '%"></i></div></div>';
        }).join('') + '</div>'
      : emptyState('📖', 'Nothing in progress', 'Start reading an article and your progress is tracked here so you can pick up where you left off.', '<button class="btn btn--ghost bb-nav" data-view="articles">Start reading</button>');

    var promptBody = savedP.length
      ? '<div style="display:grid;gap:8px">' + savedP.map(function (id) {
          var p = PROMPTS.filter(function (x) { return x.id === id; })[0]; if (!p) return '';
          return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--rule)"><span style="color:var(--ink);font-size:14px">' + esc(p.title) + '</span><span class="mono signal" style="font-size:10px">' + esc(p.model) + '</span></div>';
        }).join('') + '</div>'
      : emptyState('✨', 'No saved prompts', 'Bookmark the prompts you reach for often — they’ll be one click away here.', '<button class="btn btn--ghost bb-nav" data-view="prompts">Open library</button>');

    var flowBody = savedF.length
      ? '<div style="display:grid;gap:8px">' + savedF.map(function (id) {
          var f = WORKFLOWS.filter(function (x) { return x.id === id; })[0]; if (!f) return '';
          return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--rule)"><span style="color:var(--ink);font-size:14px">' + esc(f.title) + '</span><span class="mono faint" style="font-size:10px">' + esc(f.build) + '</span></div>';
        }).join('') + '</div>'
      : emptyState('⚙️', 'No saved workflows', 'Save a workflow blueprint and it’s ready to duplicate whenever you are.', '<button class="btn btn--ghost bb-nav" data-view="workflows">Browse workflows</button>');

    var progressBody = '<div class="bb-flow__facts"><div class="f"><div class="v">' + doneCount + '</div><div class="l">Steps completed</div></div>' +
      '<div class="f"><div class="v">' + bmIds.length + '</div><div class="l">Bookmarks</div></div>' +
      '<div class="f"><div class="v">' + (savedP.length + savedF.length) + '</div><div class="l">Saved items</div></div></div>' +
      '<p class="body" style="margin-top:12px;font-size:13px">Keep going — completing a learning path unlocks the next stage in your roadmap.</p>' +
      '<button class="btn btn--ghost bb-nav" data-view="playbooks" style="margin-top:6px">Open roadmap →</button>';

    wrap.innerHTML =
      panel('Continue reading', readBody) +
      panel('Weekly progress', progressBody) +
      panel('Saved articles', bmBody) +
      panel('Saved prompts', promptBody) +
      panel('Saved workflows', flowBody) +
      panel('Recommended next', '<div style="display:grid;gap:10px">' + ARTICLES.slice(3, 6).map(function (a) {
        return '<a href="#" class="bb-readbtn" data-id="' + a.id + '" style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--rule)"><span style="color:var(--ink);font-size:14px">' + esc(a.title) + '</span><span class="signal mono" style="font-size:10px">→</span></a>';
      }).join('') + '</div>');
  }

  /* ─────────────────────────── COUNTERS ─────────────────────────── */

  function animateCounters() {
    var nodes = $all('#bb-stats .bb-stat');
    if (!nodes.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var node = en.target, end = +node.getAttribute('data-end'), suf = node.getAttribute('data-suf') || '';
        var out = $('.n', node);
        if (reduce) { out.innerHTML = end.toLocaleString() + '<span class="suf">' + suf + '</span>'; io.unobserve(node); return; }
        var dur = 1400, t0 = performance.now();
        (function step(now) {
          var p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
          out.innerHTML = Math.round(end * eased).toLocaleString() + '<span class="suf">' + suf + '</span>';
          if (p < 1) requestAnimationFrame(step);
        })(t0);
        io.unobserve(node);
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function renderStats() {
    var wrap = $('#bb-stats'); if (!wrap) return;
    wrap.innerHTML = STATS.map(function (s) {
      return '<div class="bb-stat" data-end="' + s.end + '" data-suf="' + s.suf + '"><div class="n">0</div><div class="k">' + esc(s.k) + '</div></div>';
    }).join('');
  }

  /* ─────────────────────────── QUIZ ─────────────────────────── */

  function initQuiz() {
    var cards = $('#bb-personas'); if (!cards) return;
    cards.innerHTML = PERSONAS.map(function (p) {
      return '<button class="bb-persona" data-persona="' + p.id + '"><span class="ic">' + p.ic + '</span><span class="t">' + esc(p.t) + '</span><span class="d">' + esc(p.d) + '</span></button>';
    }).join('');
    cards.addEventListener('click', function (e) {
      var btn = e.target.closest('.bb-persona'); if (!btn) return;
      $all('.bb-persona', cards).forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      var p = PERSONAS.filter(function (x) { return x.id === btn.getAttribute('data-persona'); })[0];
      showReco(p);
    });
  }
  function showReco(p) {
    var box = $('#bb-reco'); if (!box) return;
    var r = p.reco;
    box.innerHTML =
      '<div class="bb-reco__head"><div class="t">Your path as a <span>' + esc(p.t) + '</span></div>' +
      '<button class="btn btn--primary bb-nav" data-view="playbooks">Start ' + esc(r.path) + ' →</button></div>' +
      '<div class="bb-reco__grid">' +
        recoCol('Read first', r.arts) +
        recoCol('Build these', r.projs) +
        recoCol('Prompt packs', r.packs) +
        recoCol('Tools to try', r.tools) +
      '</div>';
    box.classList.add('is-open');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function recoCol(k, arr) {
    return '<div class="bb-reco__col"><div class="k">' + k + '</div><ul>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
  }

  /* ─────────────────────────── FILTERS ─────────────────────────── */

  function applyArticleFilters() {
    var q = ($('#bb-artsearch') && $('#bb-artsearch').value.trim().toLowerCase()) || '';
    var cat = ($('#bb-filter-cat') && $('#bb-filter-cat').value) || '';
    var diff = ($('#bb-filter-diff') && $('#bb-filter-diff').value) || '';
    var tool = ($('#bb-filter-tool') && $('#bb-filter-tool').value) || '';
    var time = ($('#bb-filter-time') && $('#bb-filter-time').value) || '';
    var sort = ($('#bb-filter-sort') && $('#bb-filter-sort').value) || '';
    var list = ARTICLES.filter(function (a) {
      if (q && (a.tags.join(' ') + ' ' + a.tools.join(' ') + ' ' + a.title + ' ' + a.cat).toLowerCase().indexOf(q) === -1) return false;
      if (cat && a.cat !== cat) return false;
      if (diff && a.diff !== diff) return false;
      if (tool && a.tools.indexOf(tool) === -1) return false;
      if (time === 'short' && a.mins > 8) return false;
      if (time === 'long' && a.mins <= 8) return false;
      return true;
    });
    if (sort === 'short') list = list.slice().sort(function (a, b) { return a.mins - b.mins; });
    if (sort === 'long') list = list.slice().sort(function (a, b) { return b.mins - a.mins; });
    if (sort === 'bookmarked') list = list.filter(function (a) { return state.bookmarks[a.id]; });
    renderArticles(list);
  }

  function applyPromptFilters() {
    var q = ($('#bb-promptsearch') && $('#bb-promptsearch').value.trim().toLowerCase()) || '';
    var active = $('#bb-prompt-chips') ? $('.bb-chip.is-active', $('#bb-prompt-chips')) : null;
    var f = active ? active.getAttribute('data-filter') : '';
    var list = PROMPTS.filter(function (p) {
      if (q && (p.title + ' ' + p.cat + ' ' + p.model).toLowerCase().indexOf(q) === -1) return false;
      if (f && p.model !== f && p.cat !== f) return false;
      return true;
    });
    renderPrompts(list);
  }

  /* ─────────────────────────── CALCULATORS ─────────────────────────── */

  var MODEL_PRICES = { // per 1M tokens, [input, output]
    'claude-opus': [15, 75], 'claude-sonnet': [3, 15], 'gpt-4o': [2.5, 10], 'gpt-4o-mini': [0.15, 0.6], 'gemini-flash': [0.075, 0.3]
  };
  function num(id) { var e = $(id); return e ? (parseFloat(e.value) || 0) : 0; }
  function fmt(n) { return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 }); }

  function calcAll() {
    // LLM API cost
    var model = ($('#calc-model') && $('#calc-model').value) || 'claude-sonnet';
    var pr = MODEL_PRICES[model] || [3, 15];
    var reqs = num('#calc-reqs'), inTok = num('#calc-in'), outTok = num('#calc-out');
    var costPerReq = (inTok / 1e6) * pr[0] + (outTok / 1e6) * pr[1];
    var monthly = costPerReq * reqs;
    var o1 = $('#calc-out-llm'); if (o1) o1.textContent = fmt(monthly) + '/mo';

    // ROI / time saved
    var people = num('#roi-people'), hrs = num('#roi-hours'), rate = num('#roi-rate');
    var saved = people * hrs * 4.33 * rate;
    var o2 = $('#calc-out-roi'); if (o2) o2.textContent = fmt(saved) + '/mo';
    var o2b = $('#calc-out-roi-hrs'); if (o2b) o2b.textContent = (people * hrs * 4.33).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' hrs';

    // Token estimator
    var words = num('#tok-words');
    var tokens = Math.round(words * 1.33);
    var o3 = $('#calc-out-tokens'); if (o3) o3.textContent = tokens.toLocaleString() + ' tok';
  }

  /* ─────────────────────────── SEARCH OVERLAY ─────────────────────────── */

  var SEARCH_INDEX = [];
  function buildSearchIndex() {
    SEARCH_INDEX = [];
    ARTICLES.forEach(function (a) { SEARCH_INDEX.push({ kind: 'Article', t: a.title, sub: a.diff + ' · ' + a.mins + ' min', view: 'articles', id: a.id, hay: (a.title + ' ' + a.tags.join(' ') + ' ' + a.tools.join(' ')).toLowerCase() }); });
    PROMPTS.forEach(function (p) { SEARCH_INDEX.push({ kind: 'Prompt', t: p.title, sub: p.model + ' · ' + p.cat, view: 'prompts', id: p.id, hay: (p.title + ' ' + p.cat + ' ' + p.model).toLowerCase() }); });
    WORKFLOWS.forEach(function (w) { SEARCH_INDEX.push({ kind: 'Workflow', t: w.title, sub: w.build + ' · ' + w.diff, view: 'workflows', id: w.id, hay: (w.title + ' ' + w.desc).toLowerCase() }); });
    PROJECTS.forEach(function (p) { SEARCH_INDEX.push({ kind: 'Project', t: p.title, sub: p.models, view: 'projects', id: p.id, hay: (p.title + ' ' + p.problem).toLowerCase() }); });
    TOPICS.forEach(function (t) { SEARCH_INDEX.push({ kind: 'Topic', t: t.name, sub: t.count + ' resources', view: 'articles', id: t.id, topic: t.id, hay: t.name.toLowerCase() }); });
    TOOLS.forEach(function (t) { SEARCH_INDEX.push({ kind: 'Tool', t: t, sub: 'Filter by tool', view: 'articles', tool: t, hay: t.toLowerCase() }); });
  }
  var searchSel = 0, searchHits = [];
  function runSearch(q) {
    q = q.trim().toLowerCase();
    var res = $('#bb-search-results'); if (!res) return;
    if (!q) {
      searchHits = SEARCH_INDEX.slice(0, 6);
    } else {
      searchHits = SEARCH_INDEX.filter(function (x) { return x.hay.indexOf(q) !== -1; }).slice(0, 12);
    }
    searchSel = 0;
    if (!searchHits.length) { res.innerHTML = '<div class="bb-empty" style="padding:30px"><div class="t">No matches</div><div class="d">Try a tool name, a topic, or a technique.</div></div>'; return; }
    res.innerHTML = searchHits.map(function (h, i) {
      return '<div class="bb-sr ' + (i === 0 ? 'is-sel' : '') + '" data-i="' + i + '"><span class="bb-sr__kind">' + h.kind + '</span><span class="bb-sr__t">' + esc(h.t) + '<span class="sub">' + esc(h.sub) + '</span></span><span class="bb-sr__go">↵</span></div>';
    }).join('');
  }
  function chooseSearch(i) {
    var h = searchHits[i]; if (!h) return;
    closeSearch();
    if (h.topic) { filterByTopic(h.topic); }
    else if (h.tool) { navigate('articles'); var sel = $('#bb-filter-tool'); if (sel) { sel.value = h.tool; applyArticleFilters(); } }
    else if (h.kind === 'Article') { navigate('articles'); openArticle(h.id); }
    else { navigate(h.view); if (h.id) { setTimeout(function () { var node = $('[data-id="' + h.id + '"]'); if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120); } }
  }
  function openSearch() { var o = $('#bb-overlay'); if (!o) return; o.classList.add('is-open'); var i = $('#bb-search-input'); i.value = ''; runSearch(''); setTimeout(function () { i.focus(); }, 30); }
  function closeSearch() { var o = $('#bb-overlay'); if (o) o.classList.remove('is-open'); }

  /* ─────────────────────────── ROUTER ─────────────────────────── */

  function navigate(view, opts) {
    $all('.bb-view').forEach(function (v) { v.classList.toggle('is-active', v.getAttribute('data-view') === view); });
    $all('.bb-topbar .topbar__nav a').forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-view') === view); });
    if (history.replaceState) { try { history.replaceState(null, '', '#' + view); } catch (e) {} }
    if (view === 'dashboard') renderDashboard();
    if (!opts || !opts.keepScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function filterByTopic(topicId) {
    navigate('articles');
    var sel = $('#bb-filter-cat');
    if (sel) { sel.value = topicId; }
    applyArticleFilters();
    toast('Filtered by topic');
  }

  function openArticle(id) {
    // Lightweight "article experience": mark progress + toast. (Content pages are future work.)
    state.progress[id] = Math.max(state.progress[id] || 0, 15);
    persist();
    renderArticles();
    applyArticleFilters();
    var a = ARTICLES.filter(function (x) { return x.id === id; })[0];
    toast(a ? 'Opened: ' + a.title : 'Opening…');
  }

  /* ─────────────────────────── INTERACTIONS ─────────────────────────── */

  function bindGlobalClicks() {
    document.addEventListener('click', function (e) {
      var t = e.target;

      // nav
      var nav = t.closest('.bb-nav, [data-view]');
      if (nav && nav.getAttribute('data-view') && (nav.classList.contains('bb-nav') || nav.matches('.topbar__nav a'))) {
        e.preventDefault(); navigate(nav.getAttribute('data-view')); return;
      }

      // topic / tool tiles
      var topic = t.closest('.bb-topic'); if (topic) { filterByTopic(topic.getAttribute('data-topic')); return; }
      var tool = t.closest('.bb-toollogo'); if (tool) { navigate('articles'); var sel = $('#bb-filter-tool'); if (sel) { sel.value = tool.getAttribute('data-tool'); applyArticleFilters(); } toast('Showing ' + tool.getAttribute('data-tool') + ' content'); return; }

      // bookmark
      var bm = t.closest('.bb-bookmark'); if (bm) { var id = bm.getAttribute('data-id'); state.bookmarks[id] = !state.bookmarks[id]; persist(); bm.classList.toggle('is-on', state.bookmarks[id]); bm.textContent = state.bookmarks[id] ? '★' : '☆'; bm.setAttribute('aria-pressed', !!state.bookmarks[id]); toast(state.bookmarks[id] ? 'Bookmarked' : 'Removed'); return; }
      // like
      var lk = t.closest('.bb-like'); if (lk) { var lid = lk.getAttribute('data-id'); state.likes[lid] = !state.likes[lid]; persist(); lk.classList.toggle('is-on', state.likes[lid]); return; }
      // share
      var sh = t.closest('.bb-share, .bb-shareprompt'); if (sh) { var shid = sh.getAttribute('data-id'); var url = location.origin + location.pathname + '#' + shid; if (navigator.clipboard) navigator.clipboard.writeText(url); toast('Link copied to clipboard'); return; }
      // read
      var rd = t.closest('.bb-readbtn'); if (rd) { e.preventDefault(); navigate('articles'); openArticle(rd.getAttribute('data-id')); return; }

      // prompt expand
      var ph = t.closest('.bb-prompt__head'); if (ph && !t.closest('.bb-copy')) { ph.parentNode.classList.toggle('is-open'); return; }
      // copy prompt
      var cp = t.closest('.bb-copy'); if (cp) { var pid = cp.getAttribute('data-copy'); var p = PROMPTS.filter(function (x) { return x.id === pid; })[0]; if (p && navigator.clipboard) navigator.clipboard.writeText(p.body); cp.textContent = 'COPIED ✓'; cp.classList.add('is-done'); setTimeout(function () { cp.textContent = 'COPY'; cp.classList.remove('is-done'); }, 1600); return; }
      // save prompt
      var sp = t.closest('.bb-saveprompt'); if (sp) { var spid = sp.getAttribute('data-id'); state.savedPrompts[spid] = !state.savedPrompts[spid]; persist(); sp.classList.toggle('is-active', state.savedPrompts[spid]); sp.textContent = state.savedPrompts[spid] ? '★ Saved' : '☆ Bookmark'; toast(state.savedPrompts[spid] ? 'Prompt saved' : 'Removed'); return; }

      // workflow actions
      var fj = t.closest('.bb-flow-json'); if (fj) { downloadFlow(fj.getAttribute('data-id')); return; }
      var fc = t.closest('.bb-flow-copy'); if (fc) { var w = WORKFLOWS.filter(function (x) { return x.id === fc.getAttribute('data-id'); })[0]; if (w && navigator.clipboard) navigator.clipboard.writeText(w.nodes.join(' → ')); toast('Steps copied'); return; }
      var sf = t.closest('.bb-saveflow'); if (sf) { var sfid = sf.getAttribute('data-id'); state.savedFlows[sfid] = !state.savedFlows[sfid]; persist(); sf.classList.toggle('is-active', state.savedFlows[sfid]); sf.textContent = state.savedFlows[sfid] ? '★ Saved' : '☆ Bookmark'; toast(state.savedFlows[sfid] ? 'Workflow saved' : 'Removed'); return; }

      // roadmap step toggle
      var rs = t.closest('.bb-road__steps li'); if (rs) { var key = rs.getAttribute('data-key'); state.completed[key] = !state.completed[key]; persist(); rs.classList.toggle('done', state.completed[key]); if (state.completed[key]) toast('Step complete'); return; }

      // compare intent
      var ci = t.closest('.bb-cmp-btn'); if (ci) { $all('.bb-cmp-btn').forEach(function (b) { b.classList.toggle('is-active', b === ci); }); renderCompare(ci.getAttribute('data-intent')); return; }

      // search
      if (t.closest('.bb-searchbtn')) { openSearch(); return; }
      if (t.closest('#bb-overlay') && !t.closest('.bb-search-box')) { closeSearch(); return; }
      var sr = t.closest('.bb-sr'); if (sr) { chooseSearch(+sr.getAttribute('data-i')); return; }
    });
  }

  function downloadFlow(id) {
    var w = WORKFLOWS.filter(function (x) { return x.id === id; })[0]; if (!w) return;
    var json = { name: w.title, description: w.desc, difficulty: w.diff, estimatedBuild: w.build, estimatedCost: w.cost, tools: w.tools, nodes: w.nodes.map(function (n, i) { return { id: i + 1, label: n }; }) };
    var blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = w.title.replace(/\s+/g, '-').toLowerCase() + '.json'; a.click();
    URL.revokeObjectURL(url); toast('Downloaded ' + a.download);
  }

  function bindInputs() {
    ['#bb-artsearch', '#bb-filter-cat', '#bb-filter-diff', '#bb-filter-tool', '#bb-filter-time', '#bb-filter-sort'].forEach(function (s) {
      var e = $(s); if (e) e.addEventListener(e.tagName === 'INPUT' ? 'input' : 'change', applyArticleFilters);
    });
    var ps = $('#bb-promptsearch'); if (ps) ps.addEventListener('input', applyPromptFilters);
    var chips = $('#bb-prompt-chips');
    if (chips) chips.addEventListener('click', function (e) { var c = e.target.closest('.bb-chip'); if (!c) return; var was = c.classList.contains('is-active'); $all('.bb-chip', chips).forEach(function (x) { x.classList.remove('is-active'); }); if (!was) c.classList.add('is-active'); applyPromptFilters(); });

    ['#calc-model', '#calc-reqs', '#calc-in', '#calc-out', '#roi-people', '#roi-hours', '#roi-rate', '#tok-words'].forEach(function (s) {
      var e = $(s); if (e) e.addEventListener(e.tagName === 'SELECT' ? 'change' : 'input', calcAll);
    });

    // signup
    $all('.bb-signup').forEach(function (form) {
      form.addEventListener('submit', function (e) { e.preventDefault(); toast('Thanks — you’re on the list. Check your inbox.'); form.reset && form.reset(); });
    });

    // search input
    var si = $('#bb-search-input');
    if (si) {
      si.addEventListener('input', function () { runSearch(si.value); });
      si.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); searchSel = Math.min(searchHits.length - 1, searchSel + 1); updateSearchSel(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); searchSel = Math.max(0, searchSel - 1); updateSearchSel(); }
        else if (e.key === 'Enter') { e.preventDefault(); chooseSearch(searchSel); }
      });
    }
  }
  function updateSearchSel() {
    $all('.bb-sr').forEach(function (n, i) { n.classList.toggle('is-sel', i === searchSel); if (i === searchSel) n.scrollIntoView({ block: 'nearest' }); });
  }

  function bindKeys() {
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
      else if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
      else if (e.key === 'Escape') { closeSearch(); }
    });
  }

  /* ─────────────────────────── SCROLL REVEAL ─────────────────────────── */
  function initReveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.style.opacity = 1; en.target.style.transform = 'none'; io.unobserve(en.target); } });
    }, { threshold: 0.08 });
    $all('[data-reveal]').forEach(function (n) { n.style.opacity = 0; n.style.transform = 'translateY(16px)'; n.style.transition = 'opacity .6s ease, transform .6s ease'; io.observe(n); });
  }

  /* ─────────────────────────── BOOT ─────────────────────────── */

  function boot() {
    renderTopics();
    renderToolLogos();
    renderFeatured();
    renderStats();
    renderArticles();
    renderPrompts();
    renderWorkflows();
    renderProjects();
    renderCompare('Coding');
    renderResources();
    renderRoadmap();
    renderLeaders();
    renderStack();
    initQuiz();
    buildSearchIndex();
    bindGlobalClicks();
    bindInputs();
    bindKeys();
    animateCounters();
    initReveal();
    calcAll();

    // deep-link
    var hash = (location.hash || '').replace('#', '');
    var views = $all('.bb-view').map(function (v) { return v.getAttribute('data-view'); });
    if (hash && views.indexOf(hash) !== -1) navigate(hash, { keepScroll: true });
    else navigate('home', { keepScroll: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
