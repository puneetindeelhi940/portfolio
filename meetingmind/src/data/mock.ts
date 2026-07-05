import { Meeting, AnalyticsData } from "@/lib/types";

export const mockMeetings: Meeting[] = [
  {
    id: "mtg-001",
    title: "Q3 Product Strategy Review",
    date: "2026-07-03",
    duration: 55,
    participants: ["Sarah Chen", "Mike Torres", "Priya Patel", "James Wilson"],
    transcript: "",
    status: "completed",
    createdAt: "2026-07-03T10:00:00Z",
    analysis: {
      summary:
        "The team reviewed Q3 product roadmap priorities. Key focus areas include the AI-powered search feature launch (targeting Aug 15), mobile app redesign, and enterprise SSO integration. Revenue targets were adjusted upward by 12% based on strong pipeline. Team agreed to hire 2 additional engineers to support the timeline.",
      actionItems: [
        {
          id: "ai-001",
          task: "Finalize AI search algorithm and begin staging deployment",
          owner: "Priya Patel",
          priority: "critical",
          deadline: "2026-07-15",
          status: "in-progress",
          dependencies: ["ML model training completion"],
        },
        {
          id: "ai-002",
          task: "Complete mobile app wireframes and share with stakeholders",
          owner: "Mike Torres",
          priority: "high",
          deadline: "2026-07-10",
          status: "pending",
        },
        {
          id: "ai-003",
          task: "Draft enterprise SSO technical spec document",
          owner: "James Wilson",
          priority: "high",
          deadline: "2026-07-12",
          status: "pending",
        },
        {
          id: "ai-004",
          task: "Post 2 senior engineer job descriptions to hiring pipeline",
          owner: "Sarah Chen",
          priority: "medium",
          deadline: "2026-07-08",
          status: "completed",
        },
        {
          id: "ai-005",
          task: "Set up performance benchmarking for search feature",
          owner: "Priya Patel",
          priority: "medium",
          deadline: "2026-07-18",
          status: "pending",
        },
      ],
      decisions: [
        {
          id: "d-001",
          decision: "Prioritize AI search over recommendation engine for Q3",
          madeBy: "Sarah Chen",
          rationale: "Higher customer demand and competitive pressure",
          impact: "high",
        },
        {
          id: "d-002",
          decision: "Increase Q3 revenue target by 12%",
          madeBy: "Sarah Chen",
          rationale: "Strong enterprise pipeline and 3 deals in late stage",
          impact: "high",
        },
        {
          id: "d-003",
          decision: "Adopt React Native for mobile redesign",
          madeBy: "Mike Torres",
          rationale: "Faster cross-platform development and shared codebase",
          impact: "medium",
        },
      ],
      risks: [
        {
          id: "r-001",
          risk: "ML model training may not complete by July 15 deadline",
          severity: "high",
          mitigation: "Prepare fallback with rule-based search as interim solution",
          owner: "Priya Patel",
        },
        {
          id: "r-002",
          risk: "Enterprise SSO integration complexity could delay Q3 launch",
          severity: "medium",
          mitigation: "Start with SAML 2.0 only, defer OIDC to Q4",
          owner: "James Wilson",
        },
      ],
      openQuestions: [
        "Should we support custom AI model fine-tuning for enterprise clients?",
        "What is the budget allocation for the 2 new engineering hires?",
        "Do we need a dedicated DevRel hire for the API launch?",
      ],
      dependencies: [
        "ML infrastructure scaling (DevOps team)",
        "Legal review of enterprise contract templates",
        "Design system v2 completion",
      ],
      sentiment: "positive",
      keyTopics: ["AI Search", "Mobile Redesign", "Enterprise SSO", "Hiring", "Revenue Targets"],
    },
  },
  {
    id: "mtg-002",
    title: "Marketing Campaign Sync",
    date: "2026-07-02",
    duration: 35,
    participants: ["Lisa Park", "Tom Anderson", "Nina Shah"],
    transcript: "",
    status: "completed",
    createdAt: "2026-07-02T14:00:00Z",
    analysis: {
      summary:
        "Marketing team aligned on the launch campaign for AI Search feature. Budget of $45K approved for digital ads. Content calendar finalized through August. Lisa will coordinate with product team on messaging. Social media strategy pivoting to short-form video content.",
      actionItems: [
        {
          id: "ai-006",
          task: "Create launch landing page for AI Search feature",
          owner: "Tom Anderson",
          priority: "high",
          deadline: "2026-07-20",
          status: "in-progress",
        },
        {
          id: "ai-007",
          task: "Produce 5 product demo videos for social media",
          owner: "Nina Shah",
          priority: "medium",
          deadline: "2026-07-25",
          status: "pending",
        },
        {
          id: "ai-008",
          task: "Set up Google Ads campaign targeting enterprise keywords",
          owner: "Tom Anderson",
          priority: "high",
          deadline: "2026-07-14",
          status: "pending",
        },
      ],
      decisions: [
        {
          id: "d-004",
          decision: "Allocate $45K budget for digital advertising campaign",
          madeBy: "Lisa Park",
          rationale: "ROI from previous campaigns averaged 4.2x",
          impact: "medium",
        },
        {
          id: "d-005",
          decision: "Shift 60% of social content to short-form video",
          madeBy: "Nina Shah",
          rationale: "Video content showing 3x engagement vs static posts",
          impact: "medium",
        },
      ],
      risks: [
        {
          id: "r-003",
          risk: "Competitor launching similar feature may dilute messaging",
          severity: "medium",
          mitigation: "Accelerate launch date and emphasize differentiation",
          owner: "Lisa Park",
        },
      ],
      openQuestions: [
        "Should we partner with influencers in the B2B SaaS space?",
        "What is the target CPA for enterprise leads?",
      ],
      dependencies: ["Product team feature freeze date", "Brand guidelines update"],
      sentiment: "positive",
      keyTopics: ["Launch Campaign", "Digital Ads", "Video Content", "Budget"],
    },
  },
  {
    id: "mtg-003",
    title: "Engineering Sprint Retrospective",
    date: "2026-07-01",
    duration: 45,
    participants: ["Alex Kim", "Priya Patel", "Jordan Lee", "Sam Rivera"],
    transcript: "",
    status: "completed",
    createdAt: "2026-07-01T16:00:00Z",
    analysis: {
      summary:
        "Sprint 14 retrospective covered velocity improvements and deployment pipeline issues. Team velocity increased 18% over previous sprint. CI/CD pipeline failures causing 2-hour delays on average. Agreed to invest in test infrastructure and implement canary deployments. Code review turnaround needs improvement.",
      actionItems: [
        {
          id: "ai-009",
          task: "Implement canary deployment pipeline for production",
          owner: "Jordan Lee",
          priority: "high",
          deadline: "2026-07-11",
          status: "in-progress",
        },
        {
          id: "ai-010",
          task: "Set up flaky test detection and quarantine system",
          owner: "Sam Rivera",
          priority: "medium",
          deadline: "2026-07-09",
          status: "completed",
        },
        {
          id: "ai-011",
          task: "Create code review SLA document (24hr turnaround)",
          owner: "Alex Kim",
          priority: "low",
          deadline: "2026-07-14",
          status: "pending",
        },
      ],
      decisions: [
        {
          id: "d-006",
          decision: "Adopt canary deployments for all production releases",
          madeBy: "Alex Kim",
          rationale: "Reduce blast radius of deployment failures",
          impact: "high",
        },
      ],
      risks: [
        {
          id: "r-004",
          risk: "CI/CD instability may worsen during infrastructure migration",
          severity: "high",
          mitigation: "Run parallel pipelines during transition period",
          owner: "Jordan Lee",
        },
        {
          id: "r-005",
          risk: "Code review bottleneck could slow feature delivery",
          severity: "low",
          mitigation: "Implement auto-assign and rotating reviewer schedule",
          owner: "Alex Kim",
        },
      ],
      openQuestions: ["Should we migrate to GitHub Actions from Jenkins?"],
      dependencies: ["Infrastructure team capacity", "Security audit completion"],
      sentiment: "mixed",
      keyTopics: ["Sprint Velocity", "CI/CD", "Code Review", "Canary Deployments"],
    },
  },
  {
    id: "mtg-004",
    title: "Customer Success Weekly",
    date: "2026-06-30",
    duration: 30,
    participants: ["Rachel Green", "David Brown", "Amy Zhang"],
    transcript: "",
    status: "completed",
    createdAt: "2026-06-30T11:00:00Z",
    analysis: {
      summary:
        "Reviewed top 5 at-risk accounts and expansion opportunities. Acme Corp signaled potential churn due to missing SSO feature. Two enterprise accounts ready for upsell. NPS score improved to 72 from 68. Support ticket volume down 15% after knowledge base improvements.",
      actionItems: [
        {
          id: "ai-012",
          task: "Schedule executive check-in with Acme Corp CTO",
          owner: "Rachel Green",
          priority: "critical",
          deadline: "2026-07-03",
          status: "overdue",
        },
        {
          id: "ai-013",
          task: "Prepare upsell proposals for TechFlow and DataSync accounts",
          owner: "David Brown",
          priority: "high",
          deadline: "2026-07-07",
          status: "in-progress",
        },
        {
          id: "ai-014",
          task: "Update knowledge base with new feature documentation",
          owner: "Amy Zhang",
          priority: "medium",
          deadline: "2026-07-10",
          status: "pending",
        },
      ],
      decisions: [
        {
          id: "d-007",
          decision: "Escalate Acme Corp retention to VP level",
          madeBy: "Rachel Green",
          rationale: "$450K ARR at risk, SSO is their primary blocker",
          impact: "high",
        },
      ],
      risks: [
        {
          id: "r-006",
          risk: "Acme Corp ($450K ARR) may churn without SSO by end of Q3",
          severity: "critical",
          mitigation: "Fast-track SSO beta access and assign dedicated support",
          owner: "Rachel Green",
        },
      ],
      openQuestions: [
        "Can we offer Acme Corp early access to SSO beta?",
        "What is our target NPS for end of year?",
      ],
      dependencies: ["SSO feature timeline from engineering"],
      sentiment: "mixed",
      keyTopics: ["Churn Risk", "Upsell", "NPS", "Support Tickets"],
    },
  },
  {
    id: "mtg-005",
    title: "Design System Workshop",
    date: "2026-06-28",
    duration: 60,
    participants: ["Mike Torres", "Elena Vasquez", "Chris Park"],
    transcript: "",
    status: "completed",
    createdAt: "2026-06-28T09:00:00Z",
    analysis: {
      summary:
        "Team workshopped the Design System v2 migration plan. New component library will use Radix primitives with custom styling. Agreed on token-based theming approach. Accessibility audit revealed 23 WCAG violations to fix. Target completion is end of July for core components.",
      actionItems: [
        {
          id: "ai-015",
          task: "Complete color token migration for all components",
          owner: "Elena Vasquez",
          priority: "high",
          deadline: "2026-07-15",
          status: "in-progress",
        },
        {
          id: "ai-016",
          task: "Fix 23 WCAG accessibility violations",
          owner: "Chris Park",
          priority: "high",
          deadline: "2026-07-20",
          status: "pending",
        },
        {
          id: "ai-017",
          task: "Document component API for new design system",
          owner: "Mike Torres",
          priority: "medium",
          deadline: "2026-07-25",
          status: "pending",
        },
      ],
      decisions: [
        {
          id: "d-008",
          decision: "Use Radix UI as the primitive layer for Design System v2",
          madeBy: "Mike Torres",
          rationale: "Best accessibility defaults and headless flexibility",
          impact: "high",
        },
      ],
      risks: [
        {
          id: "r-007",
          risk: "Design system migration could break existing product pages",
          severity: "medium",
          mitigation: "Implement progressive migration with feature flags",
          owner: "Mike Torres",
        },
      ],
      openQuestions: [
        "Should we publish the design system as an open-source package?",
        "How do we handle backward compatibility for external integrations?",
      ],
      dependencies: ["Figma token plugin setup", "Component audit completion"],
      sentiment: "positive",
      keyTopics: ["Design System", "Accessibility", "Radix UI", "Theming"],
    },
  },
];

export const mockAnalytics: AnalyticsData = {
  totalMeetings: 142,
  timeSavedHours: 284,
  estimatedCostSaved: 42600,
  completionRate: 78,
  avgMeetingLength: 42,
  meetingsPerWeek: [
    { week: "May 26", count: 8 },
    { week: "Jun 2", count: 12 },
    { week: "Jun 9", count: 10 },
    { week: "Jun 16", count: 14 },
    { week: "Jun 23", count: 11 },
    { week: "Jun 30", count: 9 },
    { week: "Jul 7", count: 13 },
  ],
  actionCompletionTrend: [
    { week: "May 26", completed: 15, total: 20 },
    { week: "Jun 2", completed: 22, total: 28 },
    { week: "Jun 9", completed: 18, total: 24 },
    { week: "Jun 16", completed: 30, total: 35 },
    { week: "Jun 23", completed: 25, total: 30 },
    { week: "Jun 30", completed: 20, total: 26 },
    { week: "Jul 7", completed: 28, total: 32 },
  ],
  topOwners: [
    { name: "Priya Patel", items: 18, completed: 14 },
    { name: "Tom Anderson", items: 15, completed: 11 },
    { name: "Sarah Chen", items: 12, completed: 10 },
    { name: "Jordan Lee", items: 11, completed: 8 },
    { name: "Mike Torres", items: 10, completed: 7 },
  ],
  riskTrend: [
    { week: "May 26", critical: 1, high: 3, medium: 5, low: 2 },
    { week: "Jun 2", critical: 2, high: 4, medium: 3, low: 3 },
    { week: "Jun 9", critical: 1, high: 2, medium: 6, low: 1 },
    { week: "Jun 16", critical: 3, high: 5, medium: 4, low: 2 },
    { week: "Jun 23", critical: 1, high: 3, medium: 3, low: 4 },
    { week: "Jun 30", critical: 2, high: 2, medium: 5, low: 2 },
    { week: "Jul 7", critical: 1, high: 4, medium: 3, low: 3 },
  ],
};

export const sampleTranscript = `Meeting: Weekly Product Sync
Date: July 5, 2026
Duration: 45 minutes
Participants: Sarah Chen (PM), Mike Torres (Design), Priya Patel (Engineering), James Wilson (Backend)

Sarah: Good morning everyone. Let's start with updates on the AI search feature. Priya, where are we?

Priya: The ML model training is at 87% accuracy. We need to hit 92% before staging. I estimate 5 more days of training. The infrastructure is ready for deployment once the model is finalized.

James: On the backend side, the API endpoints are complete. I've been load testing and we can handle 10K concurrent searches. The only concern is the response time for complex queries - averaging 2.3 seconds, which is above our 1.5s target.

Sarah: That's a blocker. What can we do to bring that down?

Priya: We could implement query caching for common patterns. That should cut response time by 40% for repeat queries.

James: I'll add Redis caching this week. Should be straightforward.

Mike: From the design side, the search UI is finalized. I've also completed the mobile responsive layouts. One thing - I think we should add a "search suggestions" feature to improve discoverability.

Sarah: Good idea. Let's add that to the Q3 backlog but not block the initial launch. We need to stay focused on the August 15 deadline.

James: Agreed. I also want to flag a risk - the SSO integration for Acme Corp is more complex than estimated. Their LDAP setup is non-standard.

Sarah: How much additional time do we need?

James: About 2 extra weeks. I'd recommend we bring in a contractor who specializes in enterprise auth.

Sarah: Let's do it. Rachel mentioned Acme is a churn risk. Action item: James, find an auth contractor by next Friday. I'll approve the budget.

Priya: One more thing - we should decide on the analytics dashboard for the search feature. Do we build our own or integrate with an existing tool?

Sarah: Let's build our own. It's a differentiator and enterprise clients will want custom dashboards. Decision made.

Mike: I'll start the dashboard wireframes next week.

Sarah: Perfect. To summarize: Priya continues model training, James adds caching and finds a contractor for SSO, Mike starts dashboard wireframes. Next sync is Monday. Great work everyone.`;

export const aiChatResponses: Record<string, string> = {
  "What changed since the previous meeting?":
    "Since the last meeting (Jul 3), three key changes occurred:\n\n1. **AI Search Progress**: ML model accuracy improved from 82% to 87%. Infrastructure deployment is now confirmed ready.\n\n2. **New Risk Identified**: SSO integration for Acme Corp is more complex than estimated, requiring 2 additional weeks and a specialist contractor.\n\n3. **Decision Made**: Team decided to build a custom analytics dashboard rather than integrate with existing tools — positioned as an enterprise differentiator.\n\n4. **Completed Items**: Sam Rivera finished the flaky test detection system, and Sarah posted the engineering job descriptions.",

  "Which action items are overdue?":
    "There is **1 overdue action item**:\n\n🔴 **Schedule executive check-in with Acme Corp CTO**\n- Owner: Rachel Green\n- Original Deadline: July 3, 2026\n- Priority: Critical\n- Context: $450K ARR at risk due to missing SSO feature\n\n**Recommendation**: This should be escalated immediately. The Acme Corp account is flagged as a critical churn risk, and the SSO timeline just extended by 2 weeks.",

  "Summarize all marketing meetings.":
    "**Marketing Meetings Summary** (1 meeting analyzed)\n\n### Marketing Campaign Sync — July 2, 2026\n**Attendees**: Lisa Park, Tom Anderson, Nina Shah\n\n**Key Outcomes**:\n- $45K digital ad budget approved for AI Search launch campaign\n- Content strategy pivoting to 60% short-form video (3x engagement vs static)\n- Launch landing page and 5 demo videos in production\n- Google Ads campaign targeting enterprise keywords planned\n\n**Open Risks**:\n- Competitor may launch similar feature, potentially diluting messaging\n\n**Pending Actions**: 3 items across landing page, video production, and ad campaign setup.",
};
