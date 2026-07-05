export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  transcript: string;
  status: "processing" | "completed" | "failed";
  analysis?: MeetingAnalysis;
  createdAt: string;
}

export interface MeetingAnalysis {
  summary: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  risks: Risk[];
  openQuestions: string[];
  dependencies: string[];
  sentiment: "positive" | "neutral" | "mixed" | "negative";
  keyTopics: string[];
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  priority: "critical" | "high" | "medium" | "low";
  deadline: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  dependencies?: string[];
}

export interface Decision {
  id: string;
  decision: string;
  madeBy: string;
  rationale: string;
  impact: "high" | "medium" | "low";
}

export interface Risk {
  id: string;
  risk: string;
  severity: "critical" | "high" | "medium" | "low";
  mitigation: string;
  owner: string;
}

export interface AnalyticsData {
  totalMeetings: number;
  timeSavedHours: number;
  estimatedCostSaved: number;
  completionRate: number;
  avgMeetingLength: number;
  meetingsPerWeek: { week: string; count: number }[];
  actionCompletionTrend: { week: string; completed: number; total: number }[];
  topOwners: { name: string; items: number; completed: number }[];
  riskTrend: { week: string; critical: number; high: number; medium: number; low: number }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
