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
    { id: 'a1', title: 'Designing AI Agents That Actually Ship', sum: 'A field guide to moving agents from clever demo to reliable production — tool design, guardrails, and the eval loop that keeps them honest.', cat: 'agents', diff: 'Advanced', mins: 12, tools: ['Claude', 'LangGraph'], tags: ['agents', 'production', 'evals'], grad: ['#0d2b28', '#123a36'] },
    { id: 'a2', title: 'The CO-STAR Prompting Framework, Operationalised', sum: 'Turn ad-hoc prompting into a repeatable craft. Context, Objective, Style, Tone, Audience, Response — with real before/after outputs.', cat: 'prompting', diff: 'Beginner', mins: 7, tools: ['Claude', 'GPT'], tags: ['prompting', 'frameworks'], grad: ['#0b2419', '#103024'] },
    { id: 'a3', title: 'RAG Without the Hallucinations', sum: 'Chunking, retrieval scoring, and grounding strategies that keep answers tied to your source of truth instead of the model’s imagination.', cat: 'rag', diff: 'Intermediate', mins: 14, tools: ['Supabase', 'GPT'], tags: ['rag', 'retrieval', 'grounding'], grad: ['#0f2922', '#16352b'] },
    { id: 'a4', title: 'Building Your First MCP Server', sum: 'Model Context Protocol demystified. Expose your own tools to Claude and other clients with a clean, well-typed server.', cat: 'mcp', diff: 'Intermediate', mins: 10, tools: ['Claude'], tags: ['mcp', 'tools'], grad: ['#161f2e', '#0f1826'] },
    { id: 'a5', title: 'Automations That Pay for Themselves in a Week', sum: 'Five n8n + Zapier workflows that quietly remove hours of manual work — with the exact node graphs to copy.', cat: 'automation', diff: 'Beginner', mins: 8, tools: ['n8n', 'Zapier'], tags: ['automation', 'workflows'], grad: ['#0a1f2e', '#12384a'] },
    { id: 'a6', title: 'Multi-Agent Orchestration with CrewAI', sum: 'When one agent isn’t enough. Role design, delegation, and shared memory patterns for teams of cooperating agents.', cat: 'agents', diff: 'Advanced', mins: 16, tools: ['CrewAI', 'AutoGen'], tags: ['agents', 'orchestration'], grad: ['#0a201e', '#0d2b28'] },
    { id: 'a7', title: 'Vibe Coding with Cursor — A Serious Workflow', sum: 'Beyond autocomplete. Rules files, composer, and the review discipline that lets you ship real features fast.', cat: 'coding', diff: 'Intermediate', mins: 9, tools: ['Cursor', 'Claude'], tags: ['coding', 'cursor', 'workflow'], grad: ['#101d35', '#162a4a'] },
    { id: 'a8', title: 'Evaluating LLM Output at Scale', sum: 'LLM-as-judge, rubric grading, and golden datasets. Build an evaluation harness before you build the feature.', cat: 'evals', diff: 'Advanced', mins: 13, tools: ['Claude', 'GPT'], tags: ['evals', 'quality'], grad: ['#0a1628', '#12243f'] },
    { id: 'a9', title: 'Prompt Cost Control for Production Apps', sum: 'Caching, batching, and model routing patterns that cut your token bill by 60% without touching quality.', cat: 'llms', diff: 'Intermediate', mins: 11, tools: ['Claude', 'GPT', 'Gemini'], tags: ['llms', 'cost', 'production'], grad: ['#0d2b28', '#123a36'] },
    { id: 'a10', title: 'Computer Use: Letting Models Drive the Screen', sum: 'The new frontier. How screen-control agents work, where they break, and how to sandbox them safely.', cat: 'computeruse', diff: 'Advanced', mins: 15, tools: ['Claude'], tags: ['computer-use', 'agents'], grad: ['#101d35', '#162a4a'] },
    { id: 'a11', title: 'Voice AI Pipelines from Scratch', sum: 'STT → reasoning → TTS with sub-second latency. The architecture, the tradeoffs, and the interruption handling.', cat: 'voice', diff: 'Advanced', mins: 12, tools: ['GPT'], tags: ['voice', 'realtime'], grad: ['#0f2922', '#16352b'] },
    { id: 'a12', title: 'From Newsletter to Product: A Builder’s Playbook', sum: 'How to turn what you know into a platform people return to — content architecture, funnels, and retention loops.', cat: 'business', diff: 'Beginner', mins: 9, tools: ['Vercel', 'Supabase'], tags: ['business', 'growth'], grad: ['#0b2419', '#103024'] },

    // ── Published essays by Puneet Arora on Medium (open externally) ──
    { id: 'm1', title: 'It’s Advantage Designers: Open-source AI Models Are Catching Up Faster Than Expected', sum: 'Open weights are closing the gap with frontier models — and that shift hands real leverage back to designers and builders.', cat: 'llms', diff: 'Beginner', mins: 2, tools: ['Claude', 'GPT'], tags: ['open-source', 'models', 'design', 'medium'], grad: ['#101d35', '#162a4a'], ext: true, source: 'Medium', date: 'Jul 2026', url: 'https://medium.com/@arorapuneet11/its-advantage-designers-open-source-ai-models-are-catching-up-faster-than-expected-f6b59f669503' },
    { id: 'm2', title: 'Less AI, More Intelligence', sum: 'The next AI revolution won’t be bigger models — it’ll be smaller bills. Why efficiency (People, Planet, Profit) is the real advantage.', cat: 'llms', diff: 'Intermediate', mins: 5, tools: ['Claude', 'GPT', 'Gemini'], tags: ['cost', 'efficiency', 'tokens', 'medium'], grad: ['#0a1f2e', '#12384a'], ext: true, source: 'Medium', date: 'Jul 2026', url: 'https://medium.com/@arorapuneet11/less-ai-more-intelligence-1cf3115335e1' },
    { id: 'm3', title: 'Vigyan Setu: A UX Case Study on the India AI Impact Summit', sum: 'A Double Diamond case study — 30 named methods and a working prototype — for the summit the design community stayed silent on.', cat: 'business', diff: 'Intermediate', mins: 8, tools: ['Claude'], tags: ['ux', 'case-study', 'india', 'medium'], grad: ['#0b2419', '#103024'], ext: true, source: 'Medium', date: 'Jun 2026', url: 'https://medium.com/@arorapuneet11/vigyan-setu-a-ux-case-study-on-india-ai-impact-summit-e6e79c1035dc' },
    { id: 'm4', title: 'You’re Paying an AI Tax and You Don’t Even Know It', sum: 'AI is quietly making everything more expensive. I built a tool to show you exactly how much — and where it hits you first.', cat: 'business', diff: 'Beginner', mins: 9, tools: ['Gemini'], tags: ['cost', 'economics', 'inflation', 'medium'], grad: ['#0a201e', '#0d2b28'], ext: true, source: 'Medium', date: 'Jun 2026', url: 'https://medium.com/@arorapuneet11/youre-paying-an-ai-tax-and-you-don-t-even-know-it-0037b95b7922' },
    { id: 'm5', title: 'Your Design Team Needs This Dashboard to Fix Bad Prompting', sum: 'Prompt literacy — not prompt enthusiasm — is the skill gap quietly draining your AI ROI. Here’s the dashboard that fixes it.', cat: 'prompting', diff: 'Intermediate', mins: 7, tools: ['Claude', 'GPT'], tags: ['prompting', 'roi', 'dashboard', 'medium'], grad: ['#161f2e', '#0f1826'], ext: true, source: 'Medium', date: 'Jun 2026', url: 'https://medium.com/@arorapuneet11/your-design-team-deserves-better-than-blind-prompting-heres-the-dashboard-that-fixes-it-2633738bfbbe' },
    { id: 'm6', title: 'Are You Measuring Your AI Agent Efficiency?', sum: 'Most teams ship agents they can’t measure. A practical case for treating agent efficiency as a first-class metric.', cat: 'evals', diff: 'Intermediate', mins: 6, tools: ['Claude'], tags: ['agents', 'efficiency', 'evals', 'medium'], grad: ['#0f2922', '#16352b'], ext: true, source: 'Medium', date: 'May 2026', url: 'https://medium.com/@arorapuneet11/are-you-measuring-your-ai-agent-efficiency-fb1ff78ab6c7' },
    { id: 'm7', title: 'Designing for Agentic Apps: Principles, Patterns, Guidelines & Guardrails', sum: 'A working UX vocabulary for autonomous agents — the principles, patterns, and guardrails that make them trustworthy.', cat: 'agents', diff: 'Intermediate', mins: 5, tools: ['Claude'], tags: ['agentic', 'ux', 'patterns', 'medium'], grad: ['#0d2b28', '#123a36'], ext: true, source: 'Medium', date: 'May 2026', url: 'https://medium.com/@arorapuneet11/designing-for-agentic-ux-ai-principles-patterns-guidelines-guardrails-391be251044b' },
    { id: 'm8', title: 'Why Enterprises Are (Still) Struggling with AI Adoption', sum: 'AI’s biggest enterprise failure isn’t intelligence — it’s trust. What the adoption numbers really tell us.', cat: 'business', diff: 'Beginner', mins: 3, tools: ['Claude'], tags: ['enterprise', 'trust', 'adoption', 'medium'], grad: ['#0a1628', '#12243f'], ext: true, source: 'Medium', date: 'May 2026', url: 'https://medium.com/@arorapuneet11/ai-adoption-trust-numbers-tell-the-real-story-a39b5d27f94b' }
  ];

  // Full reading content for the in-app article reader.
  var ARTICLE_BODIES = {
    a1: { updated: 'Aug 2026', lede: 'A clever agent demo is easy. A reliable one is a systems problem — and the gap between the two is where most projects quietly die.',
      sections: [
        { h: 'Tools are your real API surface', p: 'An agent is only as good as the tools you hand it. Write tool descriptions <strong>for the model, not for a human reader</strong> — state exactly when to call it, when not to, and what the failure modes are. Ambiguous parameter names cause mis-calls; models read them literally. Keep each tool doing one thing, and make errors legible so the model can recover instead of looping.' },
        { h: 'Guardrails before autonomy', p: 'Give the agent the narrowest permissions that still let it finish the job. Put irreversible actions behind a confirmation step, cap the number of steps, and always have a fallback path when confidence is low. Autonomy is something you grant incrementally as trust is earned in evals — not a switch you flip on day one.' },
        { h: 'The eval loop is the product', p: 'You cannot ship what you cannot measure. Build a small golden dataset of real tasks, grade runs with an LLM-as-judge plus a rubric, and re-run on every prompt or tool change. The teams that win treat the eval harness as core infrastructure, not an afterthought.' }
      ],
      takeaways: ['Write tool docs for the model, including when NOT to call.', 'Grant autonomy incrementally, gated by evals.', 'A golden dataset + rubric grading is non-negotiable for production.'] },
    a2: { updated: 'Jul 2026', lede: 'CO-STAR turns prompting from a lucky guess into a repeatable craft — six labelled fields that make outputs consistent across a whole team.',
      sections: [
        { h: 'The six fields', p: '<strong>Context</strong> sets the situation. <strong>Objective</strong> states the single job. <strong>Style</strong> anchors the writing (a real reference URL beats an adjective). <strong>Tone</strong> sets the register. <strong>Audience</strong> tells the model who reads it. <strong>Response</strong> pins the exact output format. Fill every field and the model stops guessing.' },
        { h: 'Why it scales', p: 'The magic isn’t any single field — it’s that a team can share a locked Context and Style block across an entire campaign, so ten people produce on-brief output without ten different prompting styles. It makes prompting reviewable, like code.' }
      ],
      takeaways: ['Lock Context + Style once; reuse across a campaign.', 'Pin the Response format explicitly to avoid re-prompting.', 'Reference a real example for Style, not an adjective.'] },
    a3: { updated: 'Aug 2026', lede: 'Retrieval-augmented generation only earns trust when the answer is provably tied to your source of truth. Here’s how to keep it grounded.',
      sections: [
        { h: 'Chunking is a design decision', p: 'Too-large chunks bury the relevant sentence in noise; too-small chunks lose the context that makes it meaningful. Chunk on semantic boundaries — headings, paragraphs — and overlap slightly so a fact split across a boundary is still retrievable.' },
        { h: 'Score, then ground', p: 'Retrieve more than you need, re-rank by relevance, and pass only the top passages. Then instruct the model to answer <strong>only</strong> from the provided context and to cite each claim. If nothing relevant was retrieved, the correct answer is “I don’t know” — a confidence gate that routes to a human beats a confident hallucination every time.' }
      ],
      takeaways: ['Chunk on semantic boundaries with light overlap.', 'Re-rank retrieved passages before grounding.', 'Force citations and allow an honest “I don’t know”.'] },
    a4: { updated: 'Jul 2026', lede: 'The Model Context Protocol lets you expose your own tools to Claude and other clients through one clean, typed server. It’s simpler than it sounds.',
      sections: [
        { h: 'What MCP actually is', p: 'MCP is a standard way for an AI client to discover and call your tools, read your resources, and use your prompts — without bespoke glue for every integration. Write the server once and any MCP-aware client can use it.' },
        { h: 'A clean first server', p: 'Start with one well-typed tool: a precise name, a model-facing description, and typed parameters. Test it against a real client before adding more. Resist the urge to expose everything — a small, sharp toolset outperforms a sprawling one the model can’t reason about.' }
      ],
      takeaways: ['One server exposes tools to any MCP client.', 'Start with a single, well-typed tool and grow.', 'Model-facing descriptions matter more than clever code.'] },
    a5: { updated: 'Aug 2026', lede: 'The best automations are boring: they quietly delete recurring work. Here’s how to spot them and the pattern behind five that pay for themselves fast.',
      sections: [
        { h: 'Find the repetitive edge', p: 'Look for work that is high-frequency, rule-shaped, and low-judgement — inbox triage, data entry, status roll-ups. Those are where a trigger → transform → destination flow removes hours a week with almost no risk.' },
        { h: 'The reusable shape', p: 'Almost every useful automation is the same three beats: an event fires, an AI step classifies or rewrites, and the result lands somewhere a human already looks. Get that skeleton working end-to-end on one real case before adding branches.' }
      ],
      takeaways: ['Target high-frequency, low-judgement tasks first.', 'Trigger → AI transform → destination is the core pattern.', 'Ship one real flow end-to-end before generalising.'] },
    a6: { updated: 'Jul 2026', lede: 'When one agent isn’t enough, a team of them can be — but only with clear roles, tight delegation, and shared memory. Otherwise it’s chaos with a token bill.',
      sections: [
        { h: 'Roles over headcount', p: 'More agents is not better. Give each a sharp role and a single responsibility — a researcher, a writer, a critic — and a manager that delegates. Vague, overlapping roles produce loops and contradictory work.' },
        { h: 'Shared memory, bounded', p: 'Agents coordinate through shared state, but unbounded memory blows context and cost. Pass forward only what the next role needs. Add a critic step so the team catches its own mistakes before you do.' }
      ],
      takeaways: ['Sharp single-responsibility roles beat many vague ones.', 'Pass forward only what the next agent needs.', 'A critic agent is the cheapest quality win.'] },
    a7: { updated: 'Aug 2026', lede: 'Cursor is more than autocomplete. Treated as a real workflow — rules, composer, review discipline — it lets you ship genuine features fast without losing the plot.',
      sections: [
        { h: 'Rules files set the guardrails', p: 'A project rules file teaches the model your conventions once — stack, style, patterns to avoid — so every suggestion arrives on-house-style instead of generic. It’s the single highest-leverage setup step.' },
        { h: 'Composer + review, not vibes', p: 'Use composer for multi-file edits, but keep a human review gate: read the diff, run the tests, and never merge what you haven’t understood. Speed comes from the model doing the typing — judgement stays yours.' }
      ],
      takeaways: ['Invest in a rules file before anything else.', 'Composer for multi-file edits; always review the diff.', 'Let the model type; keep the judgement human.'] },
    a8: { updated: 'Jul 2026', lede: 'If you can’t measure output quality, you’re shipping on vibes. Evaluation at scale is what lets you change a prompt without holding your breath.',
      sections: [
        { h: 'LLM-as-judge, with a rubric', p: 'A strong model can grade another model’s output — but only against an explicit rubric. Vague “is this good?” grading is noisy; a checklist of specific criteria makes scores stable and comparable across runs.' },
        { h: 'Golden datasets and regression', p: 'Curate a set of real inputs with known-good outputs. Re-run it on every change and watch for regressions. This turns prompt engineering from guesswork into an experiment you can trust.' }
      ],
      takeaways: ['Grade against an explicit rubric, not a vibe.', 'Keep a golden dataset and re-run on every change.', 'Treat prompt changes as measurable experiments.'] },
    a9: { updated: 'Aug 2026', lede: 'Token bills scale silently. A few structural patterns — caching, batching, and routing — routinely cut cost by half without touching output quality.',
      sections: [
        { h: 'Cache the stable parts', p: 'Large, unchanging prompt prefixes — system instructions, few-shot examples, long context — can be cached so you don’t pay full price to re-send them every call. It’s the biggest lever for repetitive workloads.' },
        { h: 'Route by difficulty', p: 'Not every request needs your most expensive model. Send easy calls to a small, cheap model and reserve the frontier model for hard ones. A simple router plus batching of non-urgent work compounds into a much smaller bill.' }
      ],
      takeaways: ['Cache stable prompt prefixes to slash repeat cost.', 'Route easy requests to cheaper models.', 'Batch non-urgent work instead of firing per-request.'] },
    a10: { updated: 'Jul 2026', lede: 'Letting a model drive the screen is the newest frontier — powerful, unpredictable, and something you sandbox carefully before you trust.',
      sections: [
        { h: 'How screen control works', p: 'The model perceives a screenshot, reasons about the goal, and emits actions — click here, type this. It’s general enough to operate software that has no API, which is exactly why it’s exciting and risky.' },
        { h: 'Sandbox first', p: 'Run it in an isolated environment with no access to anything you can’t afford to lose. Add step limits, confirmation on destructive actions, and full logging. Treat every action as untrusted until proven otherwise.' }
      ],
      takeaways: ['Screen-control works where there’s no API.', 'Always run in an isolated sandbox.', 'Log everything; confirm destructive actions.'] },
    a11: { updated: 'Aug 2026', lede: 'A natural voice assistant is a latency game. The architecture is simple to draw and hard to make feel instant.',
      sections: [
        { h: 'The pipeline', p: 'Speech-to-text feeds a reasoning model, whose reply is spoken back by text-to-speech. The art is overlapping these stages — start speaking before the full response is generated — so the pause between turns disappears.' },
        { h: 'Interruptions are the hard part', p: 'Humans interrupt. Your system must detect barge-in, stop talking immediately, and re-plan around what the user just said. Handling interruption gracefully is what separates a demo from something people actually want to talk to.' }
      ],
      takeaways: ['Overlap STT, reasoning, and TTS to kill latency.', 'Handle barge-in: stop and re-plan on interruption.', 'Sub-second turn-taking is the real quality bar.'] },
    a12: { updated: 'Aug 2026', lede: 'Turning what you know into a platform people return to is a design problem, not a publishing one. Structure for discovery, not chronology.',
      sections: [
        { h: 'Architecture over feed', p: 'A chronological list of posts is a newsletter. A platform organises the same content by topic, tool, difficulty, and path — so a newcomer and a returning expert each find their next click. Discovery beats recency.' },
        { h: 'Retention loops', p: 'Give people reasons to come back: saved items, progress they don’t want to lose, a weekly ritual. Bookmarks, reading history, and a clear “next step” quietly turn one-time readers into regulars — which is the whole game.' }
      ],
      takeaways: ['Organise by topic and path, not just date.', 'Saved state and progress create a reason to return.', 'Always surface the reader’s next step.'] }
  };

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

  // Real builds from the AI Lab — each card links to the live project.
  var PROJECTS = [
    { id: 'news-terminal', title: 'AI News Terminal', tag: 'AI News Terminal', status: 'Live · 60+ sources', problem: 'Generic feeds don’t learn what you actually care about.', arch: 'A behavioural signal engine that learns from browsing habits — category visits, clicks, and search over a 30-day decay-weighted window. Aggregates 40+ sources across 12 categories with cross-category search. Pure vanilla JS, zero dependencies.', stack: ['Vanilla JS', 'Signal engine', 'No deps'], url: 'puneets-news-terminal.html', ext: false, grad: ['#0d2b28', '#123a36'] },
    { id: 'opportunity-sim', title: 'AI Opportunity Simulator', tag: 'Opportunity Simulator', status: 'Prototype · interactive', problem: 'Executives need to war-game economic moves, not read static reports.', arch: 'A living digital twin of the global economy — AI-scored country rankings, four-order-deep geopolitical shock simulations, and real-time strategy extraction from world events. Every module navigable and interactive.', stack: ['JS', 'Data viz', 'Simulation'], url: 'opportunity-simulator.html', ext: false, grad: ['#1a2f4a', '#0f1d33'] },
    { id: 'situation-room', title: 'Orbital Situation Room', tag: 'Situation Simulator', status: 'Prototype · 3D globe', problem: 'Defense-ops telemetry is hard to reason about in flat dashboards.', arch: 'A WebGL 3D globe rendering satellites, ground stations, and network links as a real-time ops interface. AI-driven collision simulations for orbital debris, constellation filtering, and live failure-risk scoring — all client-side.', stack: ['WebGL', 'Three.js', 'Vanilla JS'], url: 'situation-simulator.html', ext: false, grad: ['#0a1f2e', '#12384a'] },
    { id: 'design-intel', title: 'Design Intelligence Portal', tag: 'Design Intelligence', status: 'Live · vibe-coded', problem: 'Design teams need AI frameworks as tools, not slideware.', arch: 'A live AI-prompt engineering hub for design orgs — CO-STAR, RTF, and Chain-of-Thought frameworks operationalised as ready-to-use tools. Built with vibe coding; shipped as a working tool teams use daily.', stack: ['Web app', 'Vercel', 'Prompt frameworks'], url: 'https://pa9401.vercel.app/', ext: true, grad: ['#101d35', '#162a4a'] },
    { id: 'vigyan-setu', title: 'Vigyan Setu', tag: 'Vigyan Setu', status: 'Case study · 30 methods', problem: 'A speculative event OS, born from a real summit’s documented failures.', arch: 'A 70-slide Double Diamond case study for the India AI Impact Summit — 30 methods, 10 fault lines, 5 personas, an interactive phone prototype, and scroll-triggered motion. The full Discover→Deliver process.', stack: ['Case study', 'Prototype', 'Motion'], url: 'vigyan-setu.html', ext: false, grad: ['#0b2419', '#103024'] },
    { id: 'pil-gpt', title: 'Portfolio Intelligence Lab', tag: 'Custom GPT', status: 'Live · ChatGPT', problem: 'Portfolio reviews evaluate visuals, not strategic thinking.', arch: 'A custom GPT encoding 19 years of strategic design judgement — it reasons about work, decisions, and impact rather than just critiquing pixels. A demonstration of embedding domain expertise into conversational AI.', stack: ['Custom GPT', 'System design'], url: 'https://chatgpt.com/g/g-6a25498c775481919f838952bd5cafac-portfolio-intelligence-lab', ext: true, grad: ['#10a37f', '#0d6b4f'] },
    { id: 'inflation-obs', title: 'AI Inflation Observatory', tag: 'AI Inflation Observatory', status: 'Live · 29 countries', problem: 'Nobody was tracking how AI quietly makes everything more expensive.', arch: 'A composite index from 7 weighted categories across 29 countries, with persona-driven insights, an interactive world map, causal-chain explorer, and a pipeline pulling live data from World Bank, FRED, and IEA every 24 hours.', stack: ['Dashboard', 'Live data', 'Netlify'], url: 'https://aiinflationmonitor.netlify.app/', ext: true, grad: ['#1e2a44', '#0f1a30'] },
    { id: 'trust-gpt', title: 'UX Trust & Dark-Pattern Intelligence', tag: 'Custom GPT', status: 'Live · ChatGPT', problem: 'It’s hard to tell ethical nudges from manipulative design at a glance.', arch: 'A custom GPT that runs AI-driven audits on any interface for trust erosion and dark patterns. Paste a screenshot, get a scored trust audit with actionable findings — ethical guardrails baked into the model.', stack: ['Custom GPT', 'Vision audit'], url: 'https://chatgpt.com/g/g-6a284606779881919f6b63bf8855660d-ai-powered-ux-trust-dark-pattern-intelligence', ext: true, grad: ['#5c1630', '#7a1e3e'] },
    { id: 'workbench', title: 'AI Efficiency Workbench', tag: 'Triage Lens', status: 'Prototype · routing', problem: 'Enterprise AI workloads need triage, routing, and an audit trail.', arch: 'Hospital triage for enterprise AI workloads — every brief classified, scored, and routed, every decision visible and defensible. 8 models across 3 wards, ~25× cheaper at scale, only 5% flagged for human review. Single-file HTML, optional Claude API.', stack: ['Single-file HTML', 'Claude API', 'Routing'], url: 'workbench-alt2.html', ext: false, grad: ['#0a1f1a', '#0f2922'] },
    { id: 'skills-lab', title: 'Skills Lab', tag: 'Skills Lab', status: 'Live · 92 skills', problem: 'Builders need reusable Claude skills, not one-off prompts.', arch: 'Three tools in one — an AI skills generator (simulator + optional Claude API), 30 Claude skills for India’s builders, and 62 skills for global builders. Generate, copy, share, and download custom skills on the fly.', stack: ['Web app', 'Claude API', 'Generator'], url: 'skills-lab.html', ext: false, grad: ['#101d35', '#0d2b28'] },
    { id: 'agentic-plan', title: '30-Day Agentic UX Mastery Plan', tag: 'Agentic UX', status: 'Playbook · 30 days', problem: 'Designing trustworthy agents is a craft that needs deliberate practice.', arch: 'A structured, day-by-day playbook for designing agentic AI experiences — from prompt-level fluency to shipping trustworthy autonomous agents. Concepts, hands-on drills, and daily rituals that build real AI-UX craft.', stack: ['Playbook', 'Downloadable', '30 days'], url: '30day-agentic-ux-plan.html', ext: false, grad: ['#2a1e0a', '#3a2a10'] }
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
      { t: 'AI Engineering — Chip Huyen', star: '4.8', diff: 'Intermediate', time: '12 hrs', url: 'https://www.oreilly.com/library/view/ai-engineering/9781098166298/' },
      { t: 'Designing Machine Learning Systems', star: '4.7', diff: 'Intermediate', time: '10 hrs', url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/' }
    ] },
    { g: 'Courses', items: [
      { t: 'ChatGPT Prompt Engineering for Devs', star: '4.9', diff: 'Beginner', time: '3 hrs', url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/' },
      { t: 'DeepLearning.AI — all short courses', star: '4.8', diff: 'All', time: 'varies', url: 'https://www.deeplearning.ai/courses/' }
    ] },
    { g: 'YouTube', items: [
      { t: 'Karpathy — Intro to LLMs', star: '4.9', diff: 'Beginner', time: '60 min', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g' },
      { t: 'freeCodeCamp — Learn RAG', star: '4.6', diff: 'Beginner', time: '40 min', url: 'https://www.youtube.com/results?search_query=freecodecamp+rag+from+scratch' }
    ] },
    { g: 'GitHub', items: [
      { t: 'awesome-mcp-servers', star: '4.9', diff: 'All', time: 'browse', url: 'https://github.com/punkpeye/awesome-mcp-servers' },
      { t: 'promptfoo — LLM evals', star: '4.7', diff: 'Intermediate', time: 'clone', url: 'https://github.com/promptfoo/promptfoo' }
    ] },
    { g: 'Frameworks', items: [
      { t: 'LangGraph', star: '4.7', diff: 'Advanced', time: 'ongoing', url: 'https://github.com/langchain-ai/langgraph' },
      { t: 'CrewAI', star: '4.5', diff: 'Intermediate', time: 'ongoing', url: 'https://github.com/crewAIInc/crewAI' }
    ] },
    { g: 'Research Papers', items: [
      { t: 'ReAct: Reasoning + Acting', star: '4.9', diff: 'Advanced', time: '45 min', url: 'https://arxiv.org/abs/2210.03629' },
      { t: 'Self-Consistency in CoT', star: '4.7', diff: 'Advanced', time: '35 min', url: 'https://arxiv.org/abs/2203.11171' }
    ] },
    { g: 'Communities', items: [
      { t: 'Hugging Face Forums', star: '4.8', diff: 'All', time: 'join', url: 'https://discuss.huggingface.co/' },
      { t: 'r/LocalLLaMA', star: '4.6', diff: 'All', time: 'browse', url: 'https://www.reddit.com/r/LocalLLaMA/' }
    ] },
    { g: 'Starter Kits', items: [
      { t: 'Vercel AI Chatbot starter', star: '4.7', diff: 'Intermediate', time: 'deploy', url: 'https://github.com/vercel/ai-chatbot' },
      { t: 'LangGraph ReAct agent template', star: '4.5', diff: 'Advanced', time: 'deploy', url: 'https://github.com/langchain-ai/react-agent' }
    ] },
    { g: 'Cheat Sheets', items: [
      { t: 'Anthropic prompt engineering docs', star: '4.8', diff: 'Beginner', time: '15 min', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' },
      { t: 'OpenAI tokenizer (token/pricing ref)', star: '4.6', diff: 'Beginner', time: '5 min', url: 'https://platform.openai.com/tokenizer' }
    ] }
  ];

  var ROADMAP = [
    { lvl: 'Beginner', n: '01', who: 'For the curious — no code required to start.',
      overview: 'Build a real mental model of how large language models behave, then ship your first genuinely useful thing. You’ll finish able to talk about AI precisely and automate something you do by hand today.',
      outcomes: ['Explain tokens, context and temperature in plain English', 'Write a structured prompt that works on the first try', 'Automate one repetitive task end-to-end', 'Judge two models on a task that matters to you'],
      steps: [
        { t: 'Understand tokens, context & temperature', detail: 'Models don’t read words — they read tokens, remember only what fits their context window, and pick each next token with a randomness dial called temperature. Get these three ideas and most “weird AI behaviour” stops being mysterious.', hands: 'Paste a paragraph into the OpenAI tokenizer and watch the token count. Then ask the same question twice at temperature 0 vs 1 and compare.', resources: [{ l: 'OpenAI tokenizer', u: 'https://platform.openai.com/tokenizer' }, { l: 'Anthropic — prompting overview', u: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' }] },
        { t: 'Write your first structured prompt', detail: 'A vague prompt gets a vague answer. Structure removes the guesswork — the CO-STAR framework (Context, Objective, Style, Tone, Audience, Response) is the fastest way to go from “meh” to “ship it”.', hands: 'Rewrite a prompt you already use into CO-STAR form and compare the two outputs side by side.', resources: [{ l: 'Read: CO-STAR framework', article: 'a2' }, { l: 'Open the Prompt Library', nav: 'prompts' }] },
        { t: 'Ship a no-code automation', detail: 'You don’t need to code to remove hours of busywork. The pattern is always the same: an event fires, an AI step classifies or rewrites, and the result lands where you already look.', hands: 'Build an inbox-triage flow in n8n or Zapier that summarises new email and drops it into a task board.', resources: [{ l: 'Read: Automations that pay for themselves', article: 'a5' }, { l: 'Browse Workflow blueprints', nav: 'workflows' }, { l: 'Zapier', u: 'https://zapier.com/' }] },
        { t: 'Run a model comparison', detail: 'Pick the right tool for the job by testing, not by hype. The same prompt can be excellent on one model and mediocre on another.', hands: 'Send one real task to Claude, GPT and Gemini and score the outputs 1–5 on accuracy and tone.', resources: [{ l: 'Open the Tool Comparison', nav: 'resources' }] }
      ],
      capstone: { t: 'Capstone — your personal AI daily brief', desc: 'Wire up a no-code flow that pulls your sources each morning, summarises them, and messages you the three things worth knowing. Small, real, and yours.', action: { l: 'Start from a workflow →', nav: 'workflows' } },
      deepdive: [{ l: 'Andrej Karpathy — Intro to LLMs (video)', u: 'https://www.youtube.com/watch?v=zjkBMFhNj_g' }, { l: 'DeepLearning.AI — Prompt Engineering for Devs', u: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/' }] },

    { lvl: 'Intermediate', n: '02', who: 'For builders who can code a little and want to ship.',
      overview: 'Move from prompting to building. You’ll ground a model in your own data, give it tools, prove its quality with evals, and stop the token bill from surprising you.',
      outcomes: ['Stand up a working RAG pipeline', 'Design a tool an agent can call reliably', 'Attach evals to a prompt before you trust it', 'Cut inference cost without hurting quality'],
      steps: [
        { t: 'Build a RAG pipeline', detail: 'Retrieval-augmented generation is how you make a model answer from your documents instead of its imagination. Chunk on semantic boundaries, retrieve and re-rank, then force the model to answer only from the retrieved context — with citations.', hands: 'Embed one document into Supabase pgvector, retrieve the top passages for a question, and answer with citations.', resources: [{ l: 'Read: RAG without hallucinations', article: 'a3' }, { l: 'Supabase vector', u: 'https://supabase.com/docs/guides/ai' }, { l: 'Vercel AI chatbot starter', u: 'https://github.com/vercel/ai-chatbot' }] },
        { t: 'Design a tool for an agent', detail: 'An agent is only as good as its tools. Write the description for the model — state exactly when to call it, when not to, and what the failure modes are. Ambiguous parameter names cause mis-calls.', hands: 'Write a JSON tool definition for one capability, with a model-facing description and two documented failure modes.', resources: [{ l: 'Use: Agent Tool Spec Writer prompt', nav: 'prompts' }, { l: 'Read: Building your first MCP server', article: 'a4' }] },
        { t: 'Add evals to a prompt', detail: 'If you can’t measure output quality, you’re shipping on vibes. A small golden dataset plus LLM-as-judge grading against a rubric turns prompt tweaks into experiments you can trust.', hands: 'Curate 10 real inputs with known-good outputs and grade a prompt against them with an LLM judge.', resources: [{ l: 'Read: Evaluating LLM output at scale', article: 'a8' }, { l: 'promptfoo', u: 'https://github.com/promptfoo/promptfoo' }] },
        { t: 'Control cost with caching', detail: 'Token bills scale silently. Cache stable prompt prefixes, batch non-urgent work, and route easy requests to cheaper models — routinely a 50–60% cut with no quality loss.', hands: 'Cache a long system prompt and measure the cost-per-call before and after.', resources: [{ l: 'Read: Prompt cost control', article: 'a9' }, { l: 'Try the cost calculators', nav: 'resources' }] }
      ],
      capstone: { t: 'Capstone — a grounded doc Q&A bot', desc: 'Ship a bot that answers questions from a real document set with citations and a human handoff when confidence is low. This is the single most reused pattern in production AI.', action: { l: 'See the RAG Support Bot blueprint →', nav: 'workflows' } },
      deepdive: [{ l: 'Paper — ReAct: Reasoning + Acting', u: 'https://arxiv.org/abs/2210.03629' }, { l: 'awesome-mcp-servers', u: 'https://github.com/punkpeye/awesome-mcp-servers' }] },

    { lvl: 'Advanced', n: '03', who: 'For engineers shipping AI to real users.',
      overview: 'Go from a single prompt to systems. Multiple cooperating agents, your own MCP server, a proper eval harness, and the judgement to let a model touch the real world safely.',
      outcomes: ['Orchestrate multiple agents without chaos', 'Expose your own tools via MCP', 'Run a repeatable eval harness in CI', 'Sandbox computer-use safely'],
      steps: [
        { t: 'Orchestrate multiple agents', detail: 'When one agent isn’t enough, a team can be — but only with sharp single-responsibility roles, tight delegation, and a critic that catches mistakes before you do. More agents is not better.', hands: 'Build a 3-role crew (researcher → writer → critic) and pass forward only what each role needs.', resources: [{ l: 'Read: Multi-agent orchestration', article: 'a6' }, { l: 'CrewAI', u: 'https://github.com/crewAIInc/crewAI' }, { l: 'LangGraph', u: 'https://github.com/langchain-ai/langgraph' }] },
        { t: 'Stand up an MCP server', detail: 'The Model Context Protocol lets any MCP-aware client discover and call your tools through one clean, typed server. Start with a single well-typed tool and grow.', hands: 'Expose one real capability as an MCP tool and call it from a client end-to-end.', resources: [{ l: 'Read: Building your first MCP server', article: 'a4' }, { l: 'awesome-mcp-servers', u: 'https://github.com/punkpeye/awesome-mcp-servers' }] },
        { t: 'Build an eval harness', detail: 'Ad-hoc grading doesn’t scale. Wire golden datasets, rubric grading, and regression checks into CI so every change is measured automatically.', hands: 'Add promptfoo to your repo and fail the build on a quality regression.', resources: [{ l: 'Read: Evaluating LLM output', article: 'a8' }, { l: 'Read: Measuring agent efficiency', article: 'm6' }, { l: 'promptfoo', u: 'https://github.com/promptfoo/promptfoo' }] },
        { t: 'Handle computer-use safely', detail: 'Screen-control agents can operate software that has no API — powerful and risky. Run them in an isolated sandbox with step limits, confirmation on destructive actions, and full logging.', hands: 'Run a computer-use task in a throwaway container and log every action.', resources: [{ l: 'Read: Computer use', article: 'a10' }] }
      ],
      capstone: { t: 'Capstone — a 3-agent research crew', desc: 'Ship a crew that researches a topic, drafts a brief, and critiques its own work — with an eval that scores each run. Real orchestration, measured.', action: { l: 'See the AI Project Gallery →', nav: 'projects' } },
      deepdive: [{ l: 'Paper — Self-consistency in CoT', u: 'https://arxiv.org/abs/2203.11171' }, { l: 'Read: Designing for agentic apps', article: 'm7' }] },

    { lvl: 'Production', n: '04', who: 'For teams running AI in production.',
      overview: 'Shipping is the start, not the finish. Add the observability, alerting, routing, and adversarial testing that keep an AI system honest once real users are hitting it.',
      outcomes: ['Trace and observe every AI call', 'Alert on drift and quality drops', 'Route and fall back across models', 'Red-team your own agent'],
      steps: [
        { t: 'Add tracing & observability', detail: 'AI apps fail silently. Capture every prompt, tool call, and output so you can debug what actually happened — not what you assume happened.', hands: 'Instrument one flow so every call is traceable, then replay a failed run.', resources: [{ l: 'See the AI Efficiency Workbench', u: 'workbench-alt2.html' }, { l: 'Read: Are you measuring agent efficiency?', article: 'm6' }] },
        { t: 'Set drift & quality alerts', detail: 'Model behaviour and your inputs both drift over time. Run your eval set on a schedule and alert when quality drops below a threshold.', hands: 'Schedule your eval suite and wire a Slack alert on regression.', resources: [{ l: 'Read: Evaluating LLM output', article: 'a8' }, { l: 'promptfoo', u: 'https://github.com/promptfoo/promptfoo' }] },
        { t: 'Model routing & fallbacks', detail: 'Don’t send every request to your most expensive model, and never let a single provider outage take you down. Route by difficulty and fall back gracefully.', hands: 'Add a router that sends easy calls to a cheap model and retries on a fallback provider.', resources: [{ l: 'Read: Prompt cost control', article: 'a9' }, { l: 'Read: Less AI, More Intelligence', article: 'm2' }] },
        { t: 'Red-team your agent', detail: 'Before your users find the failure modes, you should. Probe for prompt injection, data leakage, and unsafe tool calls.', hands: 'Write 15 adversarial prompts that try to break your agent and log what gets through.', resources: [{ l: 'The AI Efficiency Workbench (routing & governance)', u: 'workbench-alt2.html' }] }
      ],
      capstone: { t: 'Capstone — observability on a live agent', desc: 'Take an agent you’ve built and add tracing, a scheduled eval, and a drift alert. Turn a black box into something you can operate with confidence.', action: { l: 'Open the Efficiency Workbench →', u: 'workbench-alt2.html' } },
      deepdive: [{ l: 'Read: You’re paying an AI tax', article: 'm4' }, { l: 'promptfoo — red-teaming', u: 'https://www.promptfoo.dev/docs/red-team/' }] },

    { lvl: 'Enterprise', n: '05', who: 'For leaders scaling AI across an organisation.',
      overview: 'The hardest part of enterprise AI isn’t the model — it’s trust, governance, and getting hundreds of people to adopt good practice. This stage is about turning one good outcome into an organisational capability.',
      outcomes: ['Stand up an AI governance framework', 'Design human-in-the-loop review gates', 'Give leaders cost and usage visibility', 'Enable AI fluency across the org'],
      steps: [
        { t: 'Governance & policy framework', detail: 'AI without governance is scattered, low-trust adoption. Define acceptable use, data boundaries, review requirements, and ownership — the guardrails that let teams move fast safely.', hands: 'Draft a one-page AI usage policy covering data, review, and accountability.', resources: [{ l: 'Read: Why enterprises struggle with AI adoption', article: 'm8' }, { l: 'See: Vigyan Setu governance case', article: 'm3' }] },
        { t: 'Human-in-the-loop review gates', detail: 'The highest-stakes decisions should never be fully automated. Design review gates that insert a human at exactly the right moments — and nowhere else.', hands: 'Map one workflow and mark where a human must approve before the AI proceeds.', resources: [{ l: 'The Triage Lens — routing & review', u: 'workbench-alt2.html' }] },
        { t: 'Cost & usage dashboards', detail: 'Leaders can’t manage what they can’t see. Give them a live view of AI spend, usage, and ROI so investment decisions are grounded in data, not anecdote.', hands: 'Stand up a dashboard that tracks spend and usage per team.', resources: [{ l: 'Read: The prompt-literacy dashboard', article: 'm5' }, { l: 'The AI Inflation Observatory', u: 'https://aiinflationmonitor.netlify.app/' }] },
        { t: 'Org-wide AI enablement', detail: 'Fluency is a capability, not a workshop. Build the rituals, libraries, and centre-of-excellence that raise the whole org’s craft — and keep producing results after you’ve moved on.', hands: 'Design a 30-day enablement plan with rituals, a prompt library, and evaluation rubrics.', resources: [{ l: 'The Skills Lab (92 skills)', u: 'skills-lab.html' }, { l: 'The 30-Day Agentic UX plan', u: '30day-agentic-ux-plan.html' }] }
      ],
      capstone: { t: 'Capstone — an AI enablement one-pager for your org', desc: 'Produce the artefact a leadership team would actually approve: the policy, the review gates, the metrics, and the 30-day enablement plan. This is the work that outlasts any single project.', action: { l: 'Explore the AI Lab →', u: 'ai-lab.html' } },
      deepdive: [{ l: 'Read: It’s advantage designers (open-source)', article: 'm1' }, { l: 'The Design Intelligence Portal', u: 'https://pa9401.vercel.app/' }] }
  ];

  var PERSONAS = [
    { id: 'beginner', ic: '🌱', t: 'Beginner', d: 'New to AI, curious', reco: { path: 'Beginner Roadmap', arts: ['CO-STAR Framework', 'Automations in a Week'], projs: ['Content Engine'], packs: ['Writing Prompts'], tools: ['Claude', 'Zapier'] } },
    { id: 'builder', ic: '🛠️', t: 'Builder', d: 'Ship side projects', reco: { path: 'Intermediate Roadmap', arts: ['RAG Without Hallucinations', 'Vibe Coding with Cursor'], projs: ['MeetingMind', 'JobPilot'], packs: ['Automation Prompts'], tools: ['Cursor', 'n8n', 'Supabase'] } },
    { id: 'developer', ic: '💻', t: 'Developer', d: 'Engineer by trade', reco: { path: 'Advanced Roadmap', arts: ['Designing AI Agents', 'Evaluating LLM Output'], projs: ['Observatory'], packs: ['Coding Prompts'], tools: ['LangGraph', 'Claude', 'Vercel'] } },
    { id: 'founder', ic: '🚀', t: 'Founder', d: 'Building a company', reco: { path: 'Business + Production', arts: ['Newsletter to Product', 'Prompt Cost Control'], projs: ['JobPilot'], packs: ['Business Prompts'], tools: ['Claude', 'Vercel', 'Supabase'] } },
    { id: 'enterprise', ic: '🏢', t: 'Enterprise', d: 'Scale AI in an org', reco: { path: 'Enterprise Roadmap', arts: ['Multi-Agent Orchestration', 'Evaluating LLM Output'], projs: ['Observatory'], packs: ['Governance Prompts'], tools: ['LangGraph', 'Claude'] } },
    { id: 'student', ic: '🎓', t: 'Student', d: 'Learning the craft', reco: { path: 'Beginner Roadmap', arts: ['CO-STAR Framework', 'Building an MCP Server'], projs: ['MeetingMind'], packs: ['Research Prompts'], tools: ['Gemini', 'Claude'] } },
    { id: 'designer', ic: '🎨', t: 'Designer', d: 'Craft AI experiences', reco: { path: 'Agentic UX Roadmap', arts: ['Designing for Agentic Apps', 'It’s Advantage Designers', 'Why Enterprises Struggle with AI'], projs: ['Vigyan Setu', 'Design Intelligence Portal'], packs: ['Design & UX Prompts'], tools: ['Claude', 'Gemini', 'Cursor'] } }
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

  /* Category cover illustrations — abstract line-art in the portfolio's
   * Intelligence-Terminal palette (sea-green / cream / amber), echoing the
   * AI Lab cards. One meaningful motif per topic, layered over the dark cover. */
  var COVER_ART = {
    agents:
      '<g stroke="#9bc4b9" stroke-width="1" opacity="0.22" fill="none"><line x1="200" y1="66" x2="122" y2="36"/><line x1="200" y1="66" x2="288" y2="34"/><line x1="200" y1="66" x2="130" y2="98"/><line x1="200" y1="66" x2="284" y2="100"/></g>' +
      '<circle cx="200" cy="66" r="17" fill="#f2c14e" opacity="0.1" stroke="#f2c14e" stroke-width="1"/><circle cx="200" cy="66" r="5" fill="#f2c14e" opacity="0.5"/>' +
      '<g fill="none" stroke="#9bc4b9" stroke-width="0.8" opacity="0.4"><rect x="104" y="28" width="36" height="16" rx="4"/><rect x="270" y="26" width="38" height="16" rx="4"/><rect x="112" y="90" width="36" height="16" rx="4"/><rect x="264" y="92" width="40" height="16" rx="4"/></g>' +
      '<g fill="#9bc4b9" opacity="0.28"><rect x="110" y="35" width="22" height="2" rx="1"/><rect x="277" y="33" width="24" height="2" rx="1"/><rect x="118" y="97" width="22" height="2" rx="1"/><rect x="271" y="99" width="26" height="2" rx="1"/></g>',
    prompting:
      '<rect x="66" y="24" width="268" height="84" rx="6" fill="#f5f1e6" opacity="0.03" stroke="#f5f1e6" stroke-width="0.6"/>' +
      '<g fill="none" stroke="#f2c14e" stroke-width="0.8" opacity="0.45"><rect x="78" y="34" width="18" height="13" rx="3"/><rect x="100" y="34" width="18" height="13" rx="3"/><rect x="122" y="34" width="18" height="13" rx="3"/><rect x="144" y="34" width="18" height="13" rx="3"/><rect x="166" y="34" width="18" height="13" rx="3"/><rect x="188" y="34" width="18" height="13" rx="3"/></g>' +
      '<g fill="#9bc4b9"><rect x="78" y="60" width="200" height="4" rx="2" opacity="0.2"/><rect x="78" y="72" width="170" height="4" rx="2" opacity="0.15"/><rect x="78" y="84" width="140" height="4" rx="2" opacity="0.1"/></g>' +
      '<rect x="222" y="81" width="2" height="10" fill="#f2c14e" opacity="0.7"/>',
    rag:
      '<g fill="#f5f1e6" stroke="#f5f1e6" stroke-width="0.6"><rect x="54" y="40" width="56" height="66" rx="4" opacity="0.05"/><rect x="62" y="32" width="56" height="66" rx="4" opacity="0.06"/></g>' +
      '<g fill="#9bc4b9" opacity="0.2"><rect x="70" y="42" width="40" height="3" rx="1"/><rect x="70" y="50" width="36" height="3" rx="1"/><rect x="70" y="58" width="40" height="3" rx="1"/><rect x="70" y="66" width="30" height="3" rx="1"/></g>' +
      '<path d="M126 62 H204" stroke="#f2c14e" stroke-width="1.2" opacity="0.45"/><path d="M198 56 L210 62 L198 68 Z" fill="#f2c14e" opacity="0.5"/>' +
      '<circle cx="300" cy="62" r="24" fill="none" stroke="#9bc4b9" stroke-width="1" opacity="0.3"/><circle cx="300" cy="62" r="6" fill="#9bc4b9" opacity="0.4"/>' +
      '<g fill="#f2c14e" opacity="0.35"><circle cx="150" cy="96" r="2"/><circle cx="168" cy="100" r="2"/><circle cx="186" cy="94" r="2"/><circle cx="204" cy="100" r="2"/></g>',
    mcp:
      '<rect x="168" y="44" width="64" height="46" rx="6" fill="#f2c14e" opacity="0.08" stroke="#f2c14e" stroke-width="1"/>' +
      '<g fill="#f2c14e" opacity="0.4"><circle cx="182" cy="56" r="2.5"/><circle cx="182" cy="66" r="2.5"/><circle cx="182" cy="76" r="2.5"/></g>' +
      '<g fill="#9bc4b9" opacity="0.25"><rect x="192" y="53" width="28" height="3" rx="1"/><rect x="192" y="63" width="28" height="3" rx="1"/><rect x="192" y="73" width="20" height="3" rx="1"/></g>' +
      '<g stroke="#9bc4b9" stroke-width="1" opacity="0.25" fill="none"><path d="M168 56 H120"/><path d="M168 76 H120"/><path d="M232 67 H286"/></g>' +
      '<g fill="none" stroke="#9bc4b9" stroke-width="0.8" opacity="0.4"><rect x="92" y="44" width="28" height="18" rx="4"/><rect x="92" y="72" width="28" height="18" rx="4"/><rect x="286" y="56" width="30" height="22" rx="4"/></g>',
    automation:
      '<g fill="none" stroke="#9bc4b9" stroke-width="0.8" opacity="0.4"><rect x="52" y="52" width="52" height="30" rx="5"/><rect x="140" y="34" width="52" height="30" rx="5"/><rect x="140" y="72" width="52" height="30" rx="5"/><rect x="228" y="52" width="52" height="30" rx="5"/><rect x="316" y="52" width="40" height="30" rx="5"/></g>' +
      '<g stroke="#f2c14e" stroke-width="1" opacity="0.4" fill="none"><path d="M104 63 Q122 63 140 49"/><path d="M104 71 Q122 71 140 87"/><path d="M192 49 Q210 49 228 63"/><path d="M192 87 Q210 87 228 71"/><path d="M280 67 H316"/></g>' +
      '<g fill="#9bc4b9" opacity="0.3"><circle cx="78" cy="67" r="3"/><circle cx="166" cy="49" r="3"/><circle cx="166" cy="87" r="3"/><circle cx="254" cy="67" r="3"/></g>',
    coding:
      '<rect x="70" y="24" width="260" height="86" rx="6" fill="#f5f1e6" opacity="0.03" stroke="#f5f1e6" stroke-width="0.6"/>' +
      '<line x1="70" y1="40" x2="330" y2="40" stroke="#f5f1e6" stroke-width="0.5" opacity="0.12"/>' +
      '<g fill="#9bc4b9" opacity="0.35"><circle cx="82" cy="32" r="2.5"/><circle cx="92" cy="32" r="2.5"/><circle cx="102" cy="32" r="2.5"/></g>' +
      '<g fill="#9bc4b9"><rect x="84" y="52" width="30" height="3" rx="1" opacity="0.3"/><rect x="120" y="52" width="60" height="3" rx="1" opacity="0.15"/><rect x="96" y="62" width="80" height="3" rx="1" opacity="0.2"/><rect x="96" y="72" width="50" height="3" rx="1" opacity="0.15"/><rect x="84" y="82" width="40" height="3" rx="1" opacity="0.25"/><rect x="130" y="82" width="70" height="3" rx="1" opacity="0.12"/><rect x="96" y="92" width="60" height="3" rx="1" opacity="0.15"/></g>' +
      '<path d="M300 52 q-9 0 -9 14 q0 14 9 14" stroke="#f2c14e" stroke-width="1.4" fill="none" opacity="0.45"/><path d="M316 52 q9 0 9 14 q0 14 -9 14" stroke="#f2c14e" stroke-width="1.4" fill="none" opacity="0.45"/>',
    evals:
      '<line x1="70" y1="100" x2="330" y2="100" stroke="#f5f1e6" stroke-width="0.6" opacity="0.15"/>' +
      '<g fill="#9bc4b9"><rect x="86" y="76" width="26" height="24" opacity="0.2"/><rect x="124" y="60" width="26" height="40" opacity="0.28"/><rect x="162" y="46" width="26" height="54" opacity="0.35"/><rect x="200" y="66" width="26" height="34" opacity="0.22"/></g>' +
      '<g fill="none" stroke="#f2c14e" stroke-width="1.2" opacity="0.5"><circle cx="286" cy="54" r="16"/><path d="M279 54 l5 6 l10 -13"/></g>',
    llms:
      '<g fill="none" stroke="#9bc4b9" stroke-width="0.9" opacity="0.35"><rect x="150" y="30" width="100" height="14" rx="4"/><rect x="150" y="50" width="100" height="14" rx="4"/><rect x="150" y="70" width="100" height="14" rx="4"/></g>' +
      '<g stroke="#9bc4b9" stroke-width="0.7" opacity="0.2"><line x1="150" y1="44" x2="250" y2="50"/><line x1="150" y1="64" x2="250" y2="70"/></g>' +
      '<circle cx="200" cy="57" r="4" fill="#f2c14e" opacity="0.5"/>' +
      '<g fill="#f2c14e" opacity="0.4"><rect x="60" y="96" width="8" height="8" rx="1"/><rect x="72" y="96" width="8" height="8" rx="1"/><rect x="84" y="96" width="8" height="8" rx="1"/><rect x="96" y="96" width="8" height="8" rx="1"/></g>' +
      '<g fill="#9bc4b9" opacity="0.3"><rect x="300" y="96" width="8" height="8" rx="1"/><rect x="312" y="96" width="8" height="8" rx="1"/><rect x="324" y="96" width="8" height="8" rx="1"/></g>',
    voice:
      '<rect x="96" y="40" width="22" height="40" rx="11" fill="#9bc4b9" opacity="0.15" stroke="#9bc4b9" stroke-width="1"/>' +
      '<path d="M88 66 a19 19 0 0 0 38 0" stroke="#9bc4b9" stroke-width="1" fill="none" opacity="0.3"/><line x1="107" y1="85" x2="107" y2="96" stroke="#9bc4b9" stroke-width="1" opacity="0.3"/>' +
      '<g stroke="#f2c14e" stroke-width="2" opacity="0.45" stroke-linecap="round"><line x1="160" y1="58" x2="160" y2="74"/><line x1="176" y1="48" x2="176" y2="84"/><line x1="192" y1="40" x2="192" y2="92"/><line x1="208" y1="52" x2="208" y2="80"/><line x1="224" y1="44" x2="224" y2="88"/><line x1="240" y1="54" x2="240" y2="78"/><line x1="256" y1="60" x2="256" y2="72"/><line x1="272" y1="50" x2="272" y2="82"/><line x1="288" y1="58" x2="288" y2="74"/></g>',
    computeruse:
      '<rect x="76" y="26" width="248" height="82" rx="6" fill="#f5f1e6" opacity="0.03" stroke="#f5f1e6" stroke-width="0.6"/>' +
      '<line x1="76" y1="42" x2="324" y2="42" stroke="#f5f1e6" stroke-width="0.5" opacity="0.12"/>' +
      '<g fill="#9bc4b9" opacity="0.3"><circle cx="88" cy="34" r="2.5"/><circle cx="98" cy="34" r="2.5"/></g>' +
      '<rect x="120" y="30" width="120" height="8" rx="4" fill="#9bc4b9" opacity="0.1"/>' +
      '<rect x="92" y="56" width="70" height="40" rx="4" fill="#9bc4b9" opacity="0.08" stroke="#9bc4b9" stroke-width="0.5"/>' +
      '<rect x="176" y="56" width="132" height="14" rx="3" fill="#9bc4b9" opacity="0.12"/>' +
      '<rect x="176" y="76" width="90" height="20" rx="4" fill="#f2c14e" opacity="0.16" stroke="#f2c14e" stroke-width="0.7"/>' +
      '<path d="M250 82 l0 20 l5 -6 l4 8 l3 -1 l-4 -8 l7 0 Z" fill="#f5f1e6" opacity="0.7"/>',
    business:
      '<line x1="70" y1="104" x2="330" y2="104" stroke="#f5f1e6" stroke-width="0.6" opacity="0.15"/><line x1="78" y1="24" x2="78" y2="104" stroke="#f5f1e6" stroke-width="0.6" opacity="0.12"/>' +
      '<polyline points="86,90 130,78 174,84 218,58 262,64 306,36" fill="none" stroke="#f2c14e" stroke-width="1.6" opacity="0.5"/>' +
      '<g fill="#9bc4b9" opacity="0.4"><circle cx="86" cy="90" r="3"/><circle cx="130" cy="78" r="3"/><circle cx="174" cy="84" r="3"/><circle cx="218" cy="58" r="3"/><circle cx="262" cy="64" r="3"/><circle cx="306" cy="36" r="3"/></g>' +
      '<path d="M296 36 L306 36 L306 46" stroke="#f2c14e" stroke-width="1.4" fill="none" opacity="0.5"/>',
    swarm:
      '<circle cx="200" cy="66" r="12" fill="#f2c14e" opacity="0.14" stroke="#f2c14e" stroke-width="1"/><circle cx="200" cy="66" r="4" fill="#f2c14e" opacity="0.5"/>' +
      '<g stroke="#9bc4b9" stroke-width="0.8" opacity="0.22" fill="none"><line x1="200" y1="66" x2="130" y2="40"/><line x1="200" y1="66" x2="270" y2="40"/><line x1="200" y1="66" x2="112" y2="66"/><line x1="200" y1="66" x2="288" y2="66"/><line x1="200" y1="66" x2="130" y2="92"/><line x1="200" y1="66" x2="270" y2="92"/></g>' +
      '<g fill="none" stroke="#9bc4b9" stroke-width="1" opacity="0.4"><circle cx="130" cy="40" r="8"/><circle cx="270" cy="40" r="8"/><circle cx="112" cy="66" r="8"/><circle cx="288" cy="66" r="8"/><circle cx="130" cy="92" r="8"/><circle cx="270" cy="92" r="8"/></g>' +
      '<g fill="#9bc4b9" opacity="0.3"><circle cx="130" cy="40" r="2.5"/><circle cx="270" cy="40" r="2.5"/><circle cx="112" cy="66" r="2.5"/><circle cx="288" cy="66" r="2.5"/><circle cx="130" cy="92" r="2.5"/><circle cx="270" cy="92" r="2.5"/></g>',
    costmeter:
      '<rect x="96" y="52" width="208" height="15" rx="7.5" fill="#f5f1e6" opacity="0.05" stroke="#f5f1e6" stroke-width="0.6"/>' +
      '<rect x="96" y="52" width="80" height="15" rx="7.5" fill="#f2c14e" opacity="0.35"/>' +
      '<circle cx="176" cy="59.5" r="9" fill="#f2c14e" opacity="0.2" stroke="#f2c14e" stroke-width="1.2"/>' +
      '<path d="M110 86 L286 98" stroke="#9bc4b9" stroke-width="0.8" opacity="0.25" stroke-dasharray="3 3"/>' +
      '<g fill="#9bc4b9"><rect x="110" y="84" width="16" height="22" opacity="0.3"/><rect x="150" y="88" width="16" height="18" opacity="0.25"/><rect x="190" y="92" width="16" height="14" opacity="0.2"/><rect x="230" y="97" width="16" height="9" opacity="0.16"/><rect x="270" y="100" width="16" height="6" opacity="0.12"/></g>',
    neuralnet:
      '<g stroke="#9bc4b9" stroke-width="0.6" opacity="0.18" fill="none"><line x1="110" y1="40" x2="200" y2="34"/><line x1="110" y1="40" x2="200" y2="56"/><line x1="110" y1="66" x2="200" y2="56"/><line x1="110" y1="66" x2="200" y2="78"/><line x1="110" y1="92" x2="200" y2="78"/><line x1="110" y1="92" x2="200" y2="100"/><line x1="200" y1="34" x2="290" y2="50"/><line x1="200" y1="56" x2="290" y2="50"/><line x1="200" y1="78" x2="290" y2="82"/><line x1="200" y1="100" x2="290" y2="82"/></g>' +
      '<g fill="#9bc4b9" opacity="0.4"><circle cx="110" cy="40" r="5"/><circle cx="110" cy="66" r="5"/><circle cx="110" cy="92" r="5"/><circle cx="200" cy="34" r="5"/><circle cx="200" cy="56" r="5"/><circle cx="200" cy="78" r="5"/><circle cx="200" cy="100" r="5"/><circle cx="290" cy="82" r="5"/></g>' +
      '<circle cx="290" cy="50" r="6" fill="#f2c14e" opacity="0.5"/>',
    funnel:
      '<path d="M96 42 L232 42 L188 74 L188 98 L140 98 L140 74 Z" fill="#9bc4b9" opacity="0.06" stroke="#9bc4b9" stroke-width="1"/>' +
      '<g fill="#9bc4b9" opacity="0.35"><circle cx="112" cy="32" r="2.5"/><circle cx="132" cy="32" r="2.5"/><circle cx="152" cy="32" r="2.5"/><circle cx="172" cy="32" r="2.5"/><circle cx="192" cy="32" r="2.5"/><circle cx="212" cy="32" r="2.5"/></g>' +
      '<path d="M188 86 H262" stroke="#f2c14e" stroke-width="1.2" opacity="0.45"/><path d="M256 80 L268 86 L256 92 Z" fill="#f2c14e" opacity="0.5"/>' +
      '<circle cx="296" cy="86" r="10" fill="#f2c14e" opacity="0.16" stroke="#f2c14e" stroke-width="1"/><circle cx="296" cy="86" r="3" fill="#f2c14e" opacity="0.5"/>',
    diamond:
      '<g fill="none" stroke="#9bc4b9" stroke-width="1" opacity="0.4"><path d="M64 66 L130 40 L196 66 L130 92 Z"/><path d="M196 66 L262 40 L336 66 L262 92 Z"/></g>' +
      '<g fill="#9bc4b9" opacity="0.05"><path d="M64 66 L130 40 L196 66 L130 92 Z"/><path d="M196 66 L262 40 L336 66 L262 92 Z"/></g>' +
      '<g fill="#f2c14e" opacity="0.45"><circle cx="64" cy="66" r="3"/><circle cx="196" cy="66" r="3"/><circle cx="336" cy="66" r="3"/></g>' +
      '<g fill="#9bc4b9" opacity="0.3"><circle cx="130" cy="40" r="2"/><circle cx="130" cy="92" r="2"/><circle cx="262" cy="40" r="2"/><circle cx="262" cy="92" r="2"/></g>',
    coins:
      '<g stroke="#f2c14e" stroke-width="0.8" opacity="0.9"><ellipse cx="118" cy="98" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.12"/><ellipse cx="118" cy="90" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.12"/>' +
      '<ellipse cx="180" cy="98" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.14"/><ellipse cx="180" cy="90" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.14"/><ellipse cx="180" cy="82" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.14"/><ellipse cx="180" cy="74" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.14"/>' +
      '<ellipse cx="242" cy="98" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.16"/><ellipse cx="242" cy="90" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.16"/><ellipse cx="242" cy="82" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.16"/><ellipse cx="242" cy="74" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.16"/><ellipse cx="242" cy="66" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.16"/><ellipse cx="242" cy="58" rx="17" ry="5" fill="#f2c14e" fill-opacity="0.16"/></g>' +
      '<path d="M300 96 L300 52 M291 63 L300 52 L309 63" fill="none" stroke="#9bc4b9" stroke-width="1.4" opacity="0.45"/>',
    dashboard:
      '<rect x="76" y="26" width="248" height="82" rx="6" fill="#f5f1e6" opacity="0.03" stroke="#f5f1e6" stroke-width="0.6"/>' +
      '<g fill="none" stroke="#9bc4b9" stroke-width="0.6" opacity="0.3"><rect x="88" y="38" width="66" height="30" rx="3"/><rect x="167" y="38" width="66" height="30" rx="3"/><rect x="246" y="38" width="66" height="30" rx="3"/></g>' +
      '<g fill="#f2c14e" opacity="0.4"><rect x="96" y="44" width="24" height="4" rx="1"/><rect x="175" y="44" width="24" height="4" rx="1"/><rect x="254" y="44" width="24" height="4" rx="1"/></g>' +
      '<g fill="#9bc4b9" opacity="0.2"><rect x="96" y="54" width="42" height="3" rx="1"/><rect x="175" y="54" width="42" height="3" rx="1"/><rect x="254" y="54" width="42" height="3" rx="1"/></g>' +
      '<g fill="#9bc4b9"><rect x="96" y="94" width="10" height="10" opacity="0.25"/><rect x="110" y="88" width="10" height="16" opacity="0.3"/><rect x="124" y="82" width="10" height="22" opacity="0.35"/><rect x="138" y="90" width="10" height="14" opacity="0.25"/></g>' +
      '<path d="M250 100 a20 20 0 0 1 40 0" fill="none" stroke="#9bc4b9" stroke-width="3" opacity="0.2"/><path d="M250 100 a20 20 0 0 1 30 -14" fill="none" stroke="#f2c14e" stroke-width="3" opacity="0.45"/>',
    gauge:
      '<path d="M118 98 a82 82 0 0 1 164 0" fill="none" stroke="#9bc4b9" stroke-width="2" opacity="0.22"/>' +
      '<path d="M118 98 a82 82 0 0 1 104 -64" fill="none" stroke="#f2c14e" stroke-width="2" opacity="0.45"/>' +
      '<g stroke="#9bc4b9" stroke-width="1" opacity="0.25"><line x1="132" y1="86" x2="122" y2="80"/><line x1="200" y1="20" x2="200" y2="30"/><line x1="268" y1="86" x2="278" y2="80"/></g>' +
      '<line x1="200" y1="98" x2="244" y2="60" stroke="#f2c14e" stroke-width="2" opacity="0.6"/><circle cx="200" cy="98" r="6" fill="#f2c14e" opacity="0.4" stroke="#f2c14e" stroke-width="1"/>',
    shield:
      '<path d="M200 28 L248 44 L248 74 Q248 102 200 112 Q152 102 152 74 L152 44 Z" fill="#9bc4b9" opacity="0.06" stroke="#9bc4b9" stroke-width="1"/>' +
      '<path d="M180 68 l13 13 l26 -28" fill="none" stroke="#f2c14e" stroke-width="1.8" opacity="0.55"/>' +
      '<g fill="#9bc4b9" opacity="0.25"><circle cx="200" cy="44" r="2"/><circle cx="168" cy="60" r="2"/><circle cx="232" cy="60" r="2"/><circle cx="200" cy="98" r="2"/></g>',
    scales:
      '<line x1="200" y1="32" x2="200" y2="98" stroke="#9bc4b9" stroke-width="1.5" opacity="0.35"/><rect x="184" y="98" width="32" height="6" rx="2" fill="#9bc4b9" opacity="0.3"/>' +
      '<line x1="132" y1="46" x2="268" y2="46" stroke="#9bc4b9" stroke-width="1.5" opacity="0.35"/><circle cx="200" cy="34" r="3" fill="#f2c14e" opacity="0.5"/>' +
      '<g stroke="#9bc4b9" stroke-width="0.8" opacity="0.3" fill="none"><line x1="132" y1="46" x2="132" y2="60"/><line x1="268" y1="46" x2="268" y2="60"/></g>' +
      '<path d="M112 60 A20 8 0 0 0 152 60" fill="#f2c14e" fill-opacity="0.1" stroke="#f2c14e" stroke-width="0.8" opacity="0.4"/>' +
      '<path d="M248 60 A20 8 0 0 0 288 60" fill="#9bc4b9" fill-opacity="0.08" stroke="#9bc4b9" stroke-width="0.8" opacity="0.35"/>',
    _default:
      '<circle cx="200" cy="66" r="22" stroke="#9bc4b9" stroke-width="1" opacity="0.2" fill="none"/><circle cx="200" cy="66" r="6" fill="#f2c14e" opacity="0.4"/>' +
      '<g stroke="#9bc4b9" stroke-width="1" opacity="0.25"><line x1="200" y1="66" x2="150" y2="40"/><line x1="200" y1="66" x2="250" y2="40"/><line x1="200" y1="66" x2="150" y2="92"/><line x1="200" y1="66" x2="250" y2="92"/></g>' +
      '<g fill="#9bc4b9" opacity="0.35"><circle cx="150" cy="40" r="4"/><circle cx="250" cy="40" r="4"/><circle cx="150" cy="92" r="4"/><circle cx="250" cy="92" r="4"/></g>'
  };
  // Each article id maps to a distinct motif so no two cards share an illustration.
  var ARTMAP = {
    a1: 'agents', a2: 'prompting', a3: 'rag', a4: 'mcp', a5: 'automation', a6: 'swarm',
    a7: 'coding', a8: 'evals', a9: 'costmeter', a10: 'computeruse', a11: 'voice', a12: 'business',
    m1: 'neuralnet', m2: 'funnel', m3: 'diamond', m4: 'coins', m5: 'dashboard', m6: 'gauge', m7: 'shield', m8: 'scales'
  };
  function coverArt(a) {
    var motif = (a && ARTMAP[a.id]) || (a && a.cat) || '';
    var inner = COVER_ART[motif] || COVER_ART[a && a.cat] || COVER_ART._default;
    return '<svg class="bb-cover-svg" viewBox="0 0 400 132" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
  }

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
    var readEl = a.ext
      ? '<a class="read" href="' + esc(a.url) + '" target="_blank" rel="noopener">READ ON MEDIUM ↗</a>'
      : '<a class="read bb-readbtn" data-id="' + a.id + '" href="#">READ →</a>';
    var shareAttr = a.ext ? ' data-url="' + esc(a.url) + '"' : '';
    return '<article class="bb-card" data-id="' + a.id + '" data-tags="' + esc((a.tags.join(' ') + ' ' + a.tools.join(' ') + ' ' + a.title + ' ' + a.cat).toLowerCase()) + '" data-cat="' + a.cat + '" data-diff="' + a.diff + '" data-mins="' + a.mins + '" data-tools="' + esc(a.tools.join(',')) + '">' +
      '<div class="bb-card__cover" style="' + grad(a.grad[0], a.grad[1]) + '">' + coverArt(a) + '<span class="badge">' + esc(a.cat) + '</span>' +
        (a.ext ? '<span class="bb-card__src">✎ ' + esc(a.source || 'External') + '</span>' : '') + '</div>' +
      (pr > 0 ? '<div class="bb-progress"><i style="width:' + pr + '%"></i></div>' : '') +
      '<div class="bb-card__body">' +
        '<h3 class="bb-card__title">' + esc(a.title) + '</h3>' +
        '<p class="bb-card__sum">' + esc(a.sum) + '</p>' +
        '<div class="bb-card__tags">' + a.tools.map(function (t) { return '<span class="bb-mini-tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '<div class="bb-card__meta"><span class="diff">' + esc(a.diff) + '</span><span>' + a.mins + ' min read</span>' + (a.ext ? '<span>' + esc(a.date || '') + '</span>' : '') + '</div>' +
        '<div class="bb-card__actions">' +
          '<button class="bb-iconbtn bb-bookmark ' + (bm ? 'is-on' : '') + '" data-id="' + a.id + '" title="Bookmark" aria-pressed="' + !!bm + '">' + (bm ? '★' : '☆') + '</button>' +
          '<button class="bb-iconbtn bb-like ' + (lk ? 'is-on' : '') + '" data-id="' + a.id + '" title="Like" aria-pressed="' + !!lk + '">♥</button>' +
          '<button class="bb-iconbtn bb-share" data-id="' + a.id + '"' + shareAttr + ' title="Share">↗</button>' +
          readEl +
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
      var attrs = 'href="' + esc(p.url) + '"' + (p.ext ? ' target="_blank" rel="noopener"' : '');
      var go = p.ext ? 'Open project ↗' : 'Open project →';
      return '<a class="bb-proj" ' + attrs + ' data-id="' + p.id + '">' +
        '<div class="bb-proj__shot" style="' + grad(p.grad[0], p.grad[1]) + '"><span class="bb-proj__status">' + esc(p.status) + '</span></div>' +
        '<div class="bb-proj__body">' +
          '<h3 class="bb-proj__t">' + esc(p.title) + '</h3>' +
          '<div class="bb-proj__row"><b>Problem</b>' + esc(p.problem) + '</div>' +
          '<div class="bb-proj__row"><b>What it is</b>' + esc(p.arch) + '</div>' +
          '<div class="bb-proj__stack">' + p.stack.map(function (s) { return '<span class="bb-mini-tag">' + esc(s) + '</span>'; }).join('') + '</div>' +
          '<div class="bb-proj__go">' + go + '</div>' +
        '</div></a>';
    }).join('');
  }

  function renderCompare(intent) {
    var wrap = $('#bb-compare'); if (!wrap) return;
    var rows = COMPARE[intent] || COMPARE.Coding;
    function scoreCell(v) { return '<span style="color:var(--ink)">' + v + '</span><span class="mono faint" style="font-size:11px">/100</span><div class="meter"><i style="width:' + v + '%"></i></div>'; }
    wrap.innerHTML = '<p class="body" style="font-size:12px;margin:0 0 14px">Speed, quality &amp; reasoning are relative indices scored out of 100. Context is the usable window in tokens; pricing is the typical consumer plan.</p>' +
      '<table class="bb-table"><thead><tr>' +
      '<th>Tool</th><th>Pricing ($/mo)</th><th>Speed (index /100)</th><th>Quality (index /100)</th><th>Context (tokens)</th><th>Reasoning (index /100)</th><th>Strengths</th><th>Watch out</th>' +
      '</tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td class="tool">' + esc(r.tool) + '</td><td>' + esc(r.price) + '</td>' +
          '<td>' + scoreCell(r.speed) + '</td>' +
          '<td>' + scoreCell(r.quality) + '</td>' +
          '<td>' + esc(r.ctx) + '</td>' +
          '<td>' + scoreCell(r.reason) + '</td>' +
          '<td>' + esc(r.strengths) + '</td><td>' + esc(r.weak) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function renderResources() {
    var wrap = $('#bb-resources'); if (!wrap) return;
    wrap.innerHTML = RESOURCES.map(function (g) {
      return '<div class="bb-res-group"><h3>' + esc(g.g) + '</h3>' +
        g.items.map(function (it) {
          var title = it.url
            ? '<a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.t) + ' <span class="ext">↗</span></a>'
            : esc(it.t);
          return '<div class="bb-res-item"><div class="t">' + title + '</div>' +
            '<div class="m"><span class="star">★ ' + esc(it.star) + '</span><span>' + esc(it.diff) + '</span><span>' + esc(it.time) + '</span></div></div>';
        }).join('') + '</div>';
    }).join('');
  }

  function stageDoneCount(si) { return ROADMAP[si].steps.reduce(function (n, _, i) { return n + (state.completed[si + '-' + i] ? 1 : 0); }, 0); }
  function stageComplete(si) { return stageDoneCount(si) === ROADMAP[si].steps.length; }
  function stageUnlocked(si) { return si === 0 || stageComplete(si - 1); }

  function renderRoadmap() {
    var wrap = $('#bb-roadmap'); if (!wrap) return;
    var totalSteps = ROADMAP.reduce(function (n, s) { return n + s.steps.length; }, 0);
    var doneSteps = ROADMAP.reduce(function (n, _, si) { return n + stageDoneCount(si); }, 0);
    var pct = Math.round((doneSteps / totalSteps) * 100);
    var currentStage = ROADMAP.findIndex(function (_, si) { return stageUnlocked(si) && !stageComplete(si); });

    var overview = '<div class="bb-road__overview">' +
      '<div class="row"><span class="t">Your roadmap progress</span><span class="p">' + doneSteps + ' / ' + totalSteps + ' steps · ' + pct + '%</span></div>' +
      '<div class="bb-road__masterbar"><i style="width:' + pct + '%"></i></div>' +
      '<p class="body" style="font-size:13px;margin:14px 0 0">' +
        (pct === 100 ? 'Every stage complete — you’ve gone from first prompt to enterprise enablement. 🎉'
          : 'Complete a stage to unlock the next. ' + (currentStage >= 0 ? 'Up next: <strong style="color:var(--ink)">' + esc(ROADMAP[currentStage].lvl) + '</strong>.' : '')) +
      '</p></div>';

    function roadRes(r) {
      if (r.u) { var isExt = /^https?:/.test(r.u); return '<a class="bb-road__res" href="' + esc(r.u) + '"' + (isExt ? ' target="_blank" rel="noopener"' : '') + '>' + esc(r.l) + (isExt ? ' ↗' : ' →') + '</a>'; }
      if (r.article) return '<button class="bb-road__res bb-readbtn" data-id="' + r.article + '">' + esc(r.l) + '</button>';
      if (r.nav) return '<button class="bb-road__res bb-nav" data-view="' + r.nav + '">' + esc(r.l) + '</button>';
      return '';
    }

    var stages = ROADMAP.map(function (s, si) {
      var done = stageComplete(si), unlocked = stageUnlocked(si), current = unlocked && !done;
      var cnt = stageDoneCount(si), spct = Math.round((cnt / s.steps.length) * 100);
      var cls = done ? 'is-complete' : (current ? 'is-current' : (unlocked ? '' : 'is-locked'));
      var pill = done ? '<span class="bb-road__pill done">✓ Complete</span>'
        : current ? '<span class="bb-road__pill current">● In progress</span>'
        : '<span class="bb-road__pill locked">🔒 Locked</span>';

      var stepsHtml = s.steps.map(function (st, i) {
        var key = si + '-' + i, dn = state.completed[key];
        return '<li class="bb-road__step ' + (dn ? 'done' : '') + '" data-key="' + key + '" data-si="' + si + '">' +
          '<button class="bb-road__check" data-key="' + key + '" data-si="' + si + '" title="Mark done" aria-pressed="' + !!dn + '">✓</button>' +
          '<div class="bb-road__stepcol">' +
            '<button class="bb-road__steprow"><span class="bb-road__steptitle">' + esc(st.t) + '</span><span class="bb-road__stepcaret">+</span></button>' +
            '<div class="bb-road__stepbody">' +
              '<p>' + esc(st.detail) + '</p>' +
              '<div class="bb-road__hands"><span class="lbl">Hands-on</span>' + esc(st.hands) + '</div>' +
              '<div class="bb-road__reslist">' + st.resources.map(roadRes).join('') + '</div>' +
            '</div></div></li>';
      }).join('');

      var capstone = s.capstone ? '<div class="bb-road__capstone"><div class="k">◆ Capstone project</div>' +
        '<div class="t">' + esc(s.capstone.t) + '</div><p>' + esc(s.capstone.desc) + '</p>' +
        roadRes(s.capstone.action).replace('bb-road__res', 'bb-road__res bb-road__capbtn') + '</div>' : '';

      var deep = s.deepdive ? '<details class="bb-road__deep"><summary>Go deeper — expert resources</summary><div class="bb-road__reslist">' + s.deepdive.map(roadRes).join('') + '</div></details>' : '';

      return '<div class="bb-road__stage ' + cls + '" data-si="' + si + '">' +
        '<div class="bb-road__lvl">Stage ' + s.n + '<span class="n">' + esc(s.lvl) + '</span>' + pill +
          '<div class="bb-road__stagebar"><i style="width:' + spct + '%"></i></div>' +
          '<div class="bb-road__who">' + esc(s.who) + '</div></div>' +
        '<div class="bb-road__body">' +
          '<div class="bb-road__intro"><p>' + esc(s.overview) + '</p>' +
            '<div class="bb-road__outcomes"><span class="lbl">What you’ll be able to do</span><ul>' + s.outcomes.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></div></div>' +
          '<ul class="bb-road__steps">' + stepsHtml + '</ul>' +
          capstone + deep +
        '</div></div>';
    }).join('');

    wrap.innerHTML = overview + stages;
  }

  function toggleRoadmapStep(key, si) {
    if (!stageUnlocked(si)) { toast('Finish the previous stage to unlock this one'); return; }
    var wasComplete = stageComplete(si);
    state.completed[key] = !state.completed[key];
    persist();
    var nowComplete = stageComplete(si);
    renderRoadmap();
    if (!wasComplete && nowComplete) {
      confetti();
      toast(si + 1 < ROADMAP.length ? '🎉 ' + ROADMAP[si].lvl + ' complete — ' + ROADMAP[si + 1].lvl + ' unlocked!' : '🎉 Roadmap complete!');
    }
  }

  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var colors = ['#2fb08a', '#1f8f74', '#9bc4b9', '#146b57', '#3ecf8e'];
    var box = el('<div class="bb-confetti"></div>');
    for (var i = 0; i < 80; i++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.top = '-20px';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      p.style.animationDelay = (Math.random() * 0.4) + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 3400);
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
    PROJECTS.forEach(function (p) { SEARCH_INDEX.push({ kind: 'Project', t: p.title, sub: p.status, view: 'projects', id: p.id, projUrl: p.url, projExt: p.ext, hay: (p.title + ' ' + p.problem + ' ' + p.tag).toLowerCase() }); });
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
    else if (h.projUrl) { if (h.projExt) window.open(h.projUrl, '_blank', 'noopener'); else window.location.href = h.projUrl; }
    else if (h.kind === 'Article') { openArticle(h.id); }
    else { navigate(h.view); if (h.id) { setTimeout(function () { var node = $('[data-id="' + h.id + '"]'); if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120); } }
  }
  function openSearch() { var o = $('#bb-overlay'); if (!o) return; o.classList.add('is-open'); var i = $('#bb-search-input'); i.value = ''; runSearch(''); setTimeout(function () { i.focus(); }, 30); }
  function closeSearch() { var o = $('#bb-overlay'); if (o) o.classList.remove('is-open'); }

  /* ─────────────────────────── ROUTER ─────────────────────────── */

  // Human labels for the persistent "Where am I?" breadcrumb.
  var VIEW_LABELS = {
    home: 'Home', articles: 'Articles', reader: 'Reading', playbooks: 'Playbooks',
    projects: 'Projects', prompts: 'Prompts', workflows: 'Workflows',
    resources: 'Resources', dashboard: 'Dashboard', about: 'About'
  };

  // Update the breadcrumb's trailing "current location" label.
  function setBreadcrumb(label) {
    var el = $('#bb-crumb-current');
    if (el) el.textContent = label;
  }

  // Reflect the active view in the <main> panels + top-nav highlight.
  // The reader view has no nav tab of its own, so it borrows the Articles
  // highlight — the section it belongs to — while the breadcrumb names the piece.
  function activateView(view) {
    $all('.bb-view').forEach(function (v) { v.classList.toggle('is-active', v.getAttribute('data-view') === view); });
    var navView = (view === 'reader') ? 'articles' : view;
    $all('.bb-topbar .topbar__nav a').forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-view') === navView); });
  }

  // Write a hash to history. Pushes a new entry (so the browser Back button
  // walks the trail) unless we're replaying a popstate, replacing, or the hash
  // is already current (in which case we replace to avoid dead duplicate entries).
  function pushRoute(hash, opts) {
    if (opts && opts.fromPop) return;
    if (!history.pushState) return;
    var full = '#' + hash;
    try {
      if ((opts && opts.replace) || (location.hash || '#home') === full) history.replaceState({ r: hash }, '', full);
      else history.pushState({ r: hash }, '', full);
    } catch (e) {}
  }

  function navigate(view, opts) {
    opts = opts || {};
    // Fall back to home for removed/unknown views (e.g. old #tools / #community links).
    if (!$('.bb-view[data-view="' + view + '"]')) view = 'home';
    activateView(view);
    setBreadcrumb(VIEW_LABELS[view] || 'Home');
    pushRoute(view, opts);
    if (view === 'dashboard') renderDashboard();
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Resolve the current location.hash into a view (or an article reader) and
  // apply it. Used on first load and on every browser Back/Forward (popstate).
  function routeFromHash(opts) {
    var raw = (location.hash || '').replace('#', '');
    if (raw.indexOf('read-') === 0) {
      var id = raw.slice(5);
      if (ARTICLES.some(function (x) { return x.id === id; })) { openArticle(id, opts); return; }
      navigate('home', opts); return;
    }
    var views = $all('.bb-view').map(function (v) { return v.getAttribute('data-view'); });
    if (raw && views.indexOf(raw) !== -1 && raw !== 'reader') navigate(raw, opts);
    else navigate('home', opts);
  }

  function filterByTopic(topicId) {
    navigate('articles');
    var sel = $('#bb-filter-cat');
    if (sel) { sel.value = topicId; }
    applyArticleFilters();
    toast('Filtered by topic');
  }

  var currentReaderId = null;

  function renderReader(id) {
    var wrap = $('#bb-reader'); if (!wrap) return;
    var a = ARTICLES.filter(function (x) { return x.id === id; })[0];
    var body = ARTICLE_BODIES[id];
    if (!a || !body) return;
    currentReaderId = id;

    var idx = ARTICLES.indexOf(a);
    var prev = ARTICLES[idx - 1], next = ARTICLES[idx + 1];
    var related = ARTICLES.filter(function (x) { return x.id !== id && (x.cat === a.cat || x.tools.some(function (t) { return a.tools.indexOf(t) !== -1; })); }).slice(0, 3);
    if (!related.length) related = ARTICLES.filter(function (x) { return x.id !== id; }).slice(0, 3);
    var bm = state.bookmarks[id];

    wrap.innerHTML =
      '<button class="bb-reader__back bb-backarticles">← All articles</button>' +
      '<div class="bb-reader__hero" style="' + grad(a.grad[0], a.grad[1]) + '">' + coverArt(a) + '<span class="badge">' + esc(a.cat) + '</span></div>' +
      '<h1>' + esc(a.title) + '</h1>' +
      '<div class="bb-reader__meta"><span class="diff">' + esc(a.diff) + '</span><span>' + a.mins + ' min read</span><span>Updated ' + esc(body.updated) + '</span>' +
        '<span class="sp">' +
          '<button class="bb-iconbtn bb-bookmark ' + (bm ? 'is-on' : '') + '" data-id="' + id + '" title="Bookmark" aria-pressed="' + !!bm + '">' + (bm ? '★' : '☆') + '</button>' +
          '<button class="bb-iconbtn bb-share" data-id="' + id + '" title="Share">↗</button>' +
        '</span>' +
      '</div>' +
      '<p class="bb-reader__lede">' + esc(body.lede) + '</p>' +
      '<div class="bb-reader__body">' +
        body.sections.map(function (s) { return '<h2>' + esc(s.h) + '</h2><p>' + s.p + '</p>'; }).join('') +
        '<div class="bb-reader__callout"><div class="k">Key takeaways</div><ul>' + body.takeaways.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
      '</div>' +
      '<div class="bb-reader__toolrow"><span class="lbl">Tools used</span>' + a.tools.map(function (t) { return '<span class="bb-mini-tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="bb-reader__cta"><div class="t">Enjoying the read?</div><p class="body" style="font-size:14px;margin:0 0 14px">Join 18,400+ builders getting one sharp AI build every week.</p><button class="btn btn--primary bb-nav" data-view="home">Join the newsletter →</button></div>' +
      '<div class="bb-reader__nav">' +
        (prev ? '<div class="bb-reader__navcard bb-readbtn prev" data-id="' + prev.id + '"><div class="dir">← Previous</div><div class="t">' + esc(prev.title) + '</div></div>' : '<div></div>') +
        (next ? '<div class="bb-reader__navcard bb-readbtn next" data-id="' + next.id + '"><div class="dir">Next →</div><div class="t">' + esc(next.title) + '</div></div>' : '<div></div>') +
      '</div>' +
      '<div class="bb-reader__related"><h3>You may also like</h3><div class="bb-cardgrid" style="padding:0">' + related.map(articleCard).join('') + '</div></div>';
  }

  function updateReaderProgress() {
    if (!currentReaderId) return;
    var v = $('.bb-view[data-view="reader"]'); if (!v || !v.classList.contains('is-active')) return;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    var pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 100;
    var bar = $('#bb-reader-bar'); if (bar) bar.style.width = pct.toFixed(1) + '%';
    var rounded = Math.round(pct);
    if (rounded > (state.progress[currentReaderId] || 0)) { state.progress[currentReaderId] = rounded; persist(); }
  }

  function openArticle(id, opts) {
    opts = opts || {};
    var a = ARTICLES.filter(function (x) { return x.id === id; })[0];
    if (a && a.ext) { window.open(a.url, '_blank', 'noopener'); return; }
    renderReader(id);
    state.progress[id] = Math.max(state.progress[id] || 0, 10);
    persist();
    activateView('reader');
    setBreadcrumb(a ? a.title : 'Reading');
    pushRoute('read-' + id, opts);         // deep-linkable + Back returns to the previous view
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(updateReaderProgress, 60);
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
      var sh = t.closest('.bb-share, .bb-shareprompt'); if (sh) { var shid = sh.getAttribute('data-id'); var url = sh.getAttribute('data-url') || (location.origin + location.pathname + '#' + shid); if (navigator.clipboard) navigator.clipboard.writeText(url); toast('Link copied to clipboard'); return; }
      // read → open in-app reader
      var rd = t.closest('.bb-readbtn'); if (rd) { e.preventDefault(); openArticle(rd.getAttribute('data-id')); return; }
      // back from reader
      if (t.closest('.bb-backarticles')) { navigate('articles'); applyArticleFilters(); return; }

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

      // roadmap: checkbox toggles completion (sequential unlock flow)
      var chk = t.closest('.bb-road__check'); if (chk) { toggleRoadmapStep(chk.getAttribute('data-key'), +chk.getAttribute('data-si')); return; }
      // roadmap: step title expands its detail/hands-on/resources
      var srow = t.closest('.bb-road__steprow'); if (srow) { var stp = srow.closest('.bb-road__step'); if (stp) stp.classList.toggle('is-open'); return; }

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

  function bindReaderScroll() {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { updateReaderProgress(); ticking = false; });
    }, { passive: true });
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
    bindReaderScroll();
    animateCounters();
    initReveal();
    calcAll();

    // Browser Back/Forward → sync the view from the hash (no new history push).
    window.addEventListener('popstate', function () { routeFromHash({ fromPop: true, keepScroll: true }); });

    // deep-link on first load (replace, so Back doesn't bounce out of the portal)
    routeFromHash({ replace: true, keepScroll: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
