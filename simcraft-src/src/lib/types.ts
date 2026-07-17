export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type PatientType =
  | "Adult"
  | "Child"
  | "Infant"
  | "Neonate"
  | "Pregnant"
  | "Geriatric"
  | "Multiple Casualties";

export type Duration = 15 | 30 | 45 | 60 | 90;

export interface WizardInput {
  specialty: string;
  difficulty: Difficulty;
  patientType: PatientType;
  condition: string;
  objectives: string[];
  duration: Duration;
  equipment: string[];
  prompt: string;
}

export interface Vitals {
  hr: number;
  sbp: number;
  dbp: number;
  rr: number;
  spo2: number;
  temp: number;
  pain: number;
  gcs: number;
  capRefill: number;
  rhythm: string;
}

export type EventType =
  | "arrival"
  | "assessment"
  | "deterioration"
  | "critical"
  | "intervention"
  | "complication"
  | "family"
  | "recovery"
  | "hidden";

export interface TimelineEvent {
  id: string;
  tMin: number;
  title: string;
  description: string;
  type: EventType;
  vitals: Vitals;
  instructorNote?: string;
  hidden?: boolean;
}

export interface LabResult {
  name: string;
  value: string;
  unit: string;
  ref: string;
  flag?: "H" | "L" | "C";
}

export interface LabPanel {
  name: string;
  results: LabResult[];
}

export interface Imaging {
  modality: string;
  title: string;
  findings: string;
  impression: string;
}

export interface Patient {
  name: string;
  age: string;
  weight: string;
  gender: string;
  occupation: string;
  history: string[];
  familyHistory: string[];
  allergies: string[];
  medications: string[];
  riskFactors: string[];
}

export type NodeKind =
  | "patient"
  | "assessment"
  | "diagnosis"
  | "decision"
  | "treatment"
  | "response"
  | "complication"
  | "recovery"
  | "outcome";

export type BranchKind = "correct" | "incorrect" | "delayed";

export interface SimNode {
  id: string;
  kind: NodeKind;
  label: string;
  detail: string;
  branch?: BranchKind;
  x: number;
  y: number;
}

export interface SimEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  branch?: BranchKind;
}

export interface MCQ {
  q: string;
  options: string[];
  answer: number;
  rationale: string;
}

export interface ChecklistItem {
  text: string;
  critical?: boolean;
}

export interface Assessment {
  mcqs: MCQ[];
  osce: ChecklistItem[];
  criticalActions: ChecklistItem[];
  rubric: { domain: string; levels: string[] }[];
  reflection: string[];
  passThreshold: number;
}

export interface Debrief {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  criticalErrors: string[];
  missedOpportunities: string[];
  discussion: { topic: string; questions: string[] }[];
  evidence: { source: string; text: string }[];
  improvementPlan: string[];
}

export interface ValidationItem {
  level: "pass" | "warning" | "conflict";
  guideline: string;
  message: string;
  evidence: string;
  recommendation?: string;
}

export interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  at: number;
}

export interface Version {
  version: number;
  at: number;
  author: string;
  note: string;
}

export interface Scenario {
  id: string;
  title: string;
  status: "draft" | "published" | "in-review";
  favorite?: boolean;
  createdAt: number;
  updatedAt: number;
  version: number;
  input: WizardInput;
  patient: Patient;
  chiefComplaint: string;
  initialVitals: Vitals;
  labs: LabPanel[];
  imaging: Imaging[];
  ecg: { interpretation: string; rhythm: string; rate: number; details: string[] };
  timeline: TimelineEvent[];
  nodes: SimNode[];
  edges: SimEdge[];
  instructorNotes: string[];
  studentBrief: string;
  criticalActions: string[];
  hiddenPrompts: string[];
  dialogue: { speaker: string; line: string }[];
  assessment: Assessment;
  debrief: Debrief;
  validation: ValidationItem[];
  comments: Comment[];
  versions: Version[];
  tags: string[];
  rating: number;
  uses: number;
}

export type View =
  | "dashboard"
  | "library"
  | "wizard"
  | "generating"
  | "canvas"
  | "timeline"
  | "instructor"
  | "learner"
  | "assessment"
  | "debrief"
  | "validation"
  | "analytics"
  | "export";
