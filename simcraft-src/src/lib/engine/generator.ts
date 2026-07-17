import {
  Assessment,
  Debrief,
  Patient,
  PatientType,
  Scenario,
  SimEdge,
  SimNode,
  TimelineEvent,
  ValidationItem,
  Vitals,
  WizardInput,
} from "../types";
import { ConditionTemplate, findCondition } from "./conditions";

// ---------- deterministic rng seeded from the wizard input ----------
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function makeRng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}
const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

// ---------- age-appropriate physiology ----------
const NORMS: Record<PatientType, Vitals & { age: [number, number]; weight: [number, number] }> = {
  Adult:      { hr: 76, sbp: 122, dbp: 78, rr: 14, spo2: 98, temp: 36.8, pain: 0, gcs: 15, capRefill: 1.5, rhythm: "Sinus rhythm", age: [28, 58], weight: [62, 92] },
  Geriatric:  { hr: 74, sbp: 138, dbp: 80, rr: 16, spo2: 96, temp: 36.6, pain: 0, gcs: 15, capRefill: 2, rhythm: "Sinus rhythm", age: [71, 88], weight: [55, 82] },
  Child:      { hr: 98, sbp: 100, dbp: 64, rr: 22, spo2: 98, temp: 36.9, pain: 0, gcs: 15, capRefill: 1.5, rhythm: "Sinus rhythm", age: [4, 11], weight: [16, 38] },
  Infant:     { hr: 124, sbp: 88, dbp: 54, rr: 32, spo2: 98, temp: 37.0, pain: 0, gcs: 15, capRefill: 1.5, rhythm: "Sinus rhythm", age: [0, 1], weight: [4, 10] },
  Neonate:    { hr: 138, sbp: 72, dbp: 44, rr: 44, spo2: 97, temp: 37.0, pain: 0, gcs: 15, capRefill: 2, rhythm: "Sinus rhythm", age: [0, 0], weight: [2, 4] },
  Pregnant:   { hr: 86, sbp: 112, dbp: 70, rr: 16, spo2: 98, temp: 36.9, pain: 0, gcs: 15, capRefill: 1.5, rhythm: "Sinus rhythm", age: [24, 38], weight: [64, 88] },
  "Multiple Casualties": { hr: 82, sbp: 118, dbp: 76, rr: 16, spo2: 97, temp: 36.7, pain: 0, gcs: 15, capRefill: 1.5, rhythm: "Sinus rhythm", age: [19, 55], weight: [58, 90] },
};

const NAMES = {
  female: ["Priya Sharma", "Elena Vasquez", "Margaret Okafor", "Sarah Chen", "Amara Osei", "Fatima Al-Rashid", "Grace Kowalski", "Meera Nair"],
  male: ["David Okonkwo", "James Whitfield", "Rajesh Kumar", "Miguel Santos", "Thomas Lindqvist", "Ahmed Hassan", "Daniel Kim", "Arjun Mehta"],
};
const OCCUPATIONS = ["schoolteacher", "software engineer", "retired postal worker", "chef", "construction supervisor", "nurse", "taxi driver", "accountant", "farmer", "shop owner"];
const CHILD_OCC = ["primary school student", "kindergartner"];

const clampV = (v: Vitals): Vitals => ({
  ...v,
  hr: Math.max(0, Math.round(v.hr)),
  sbp: Math.max(0, Math.round(v.sbp)),
  dbp: Math.max(0, Math.round(v.dbp)),
  rr: Math.max(0, Math.round(v.rr)),
  spo2: Math.min(100, Math.max(0, Math.round(v.spo2))),
  temp: Math.round(v.temp * 10) / 10,
  pain: Math.min(10, Math.max(0, Math.round(v.pain))),
  gcs: Math.min(15, Math.max(3, Math.round(v.gcs))),
  capRefill: Math.min(6, Math.max(0.5, Math.round(v.capRefill * 2) / 2)),
});

function applyMod(base: Vitals, mod: Partial<Vitals>, severity: number): Vitals {
  const out = { ...base };
  (Object.keys(mod) as (keyof Vitals)[]).forEach((k) => {
    if (k === "rhythm") return;
    const d = mod[k] as number;
    if (d <= -900) {
      // arrest sentinel — vital is lost entirely
      (out[k] as number) = 0;
    } else {
      (out[k] as number) = (base[k] as number) + d * severity;
    }
  });
  return clampV(out);
}

const SEVERITY: Record<string, number> = { Beginner: 0.8, Intermediate: 1, Advanced: 1.15, Expert: 1.3 };

function buildPatient(input: WizardInput, t: ConditionTemplate, rng: () => number): Patient {
  const gender = rng() > 0.5 ? "Female" : "Male";
  const norm = NORMS[input.patientType];
  const age = Math.round(norm.age[0] + rng() * (norm.age[1] - norm.age[0]));
  const weight = Math.round(norm.weight[0] + rng() * (norm.weight[1] - norm.weight[0]));
  const isPeds = ["Child", "Infant", "Neonate"].includes(input.patientType);
  const name = pick(rng, gender === "Female" ? NAMES.female : NAMES.male);
  const ageStr =
    input.patientType === "Neonate" ? `${Math.max(1, Math.round(rng() * 20))} days` :
    input.patientType === "Infant" ? `${Math.max(2, Math.round(rng() * 11))} months` :
    `${age} years`;
  return {
    name,
    age: ageStr,
    weight: `${weight} kg`,
    gender,
    occupation: isPeds ? pick(rng, CHILD_OCC) : pick(rng, OCCUPATIONS),
    history: isPeds ? ["Born at term, immunisations up to date", ...t.history.slice(0, 1)] : t.history,
    familyHistory: t.id === "mi" ? ["Father: MI at age 52", "Mother: hypertension"] : ["No significant family history elicited"],
    allergies: t.id === "anaphylaxis" ? ["Peanuts (anaphylaxis)", "Tree nuts (suspected)"] : rng() > 0.6 ? ["Penicillin (rash)"] : ["No known drug allergies"],
    medications: isPeds ? ["None regular"] : t.medications,
    riskFactors: t.riskFactors,
  };
}

function buildTimeline(input: WizardInput, t: ConditionTemplate, severity: number): { timeline: TimelineEvent[]; initialVitals: Vitals } {
  const norm = NORMS[input.patientType];
  const base: Vitals = { hr: norm.hr, sbp: norm.sbp, dbp: norm.dbp, rr: norm.rr, spo2: norm.spo2, temp: norm.temp, pain: norm.pain, gcs: norm.gcs, capRefill: norm.capRefill, rhythm: t.rhythm0 };
  const sick0 = applyMod(base, t.baseline, severity);
  sick0.rhythm = t.rhythm0;

  const timeline: TimelineEvent[] = t.phases.map((p, i) => {
    const cumulative: Partial<Vitals> = {};
    // phases are cumulative descriptions vs baseline; apply phase mod over sick baseline
    (Object.keys(p.mod) as (keyof Vitals)[]).forEach((k) => {
      (cumulative[k] as number | undefined) = p.mod[k] as number;
    });
    const vit = applyMod(sick0, cumulative, severity);
    vit.rhythm = p.rhythm || sick0.rhythm;
    return {
      id: `ev-${i}`,
      tMin: Math.round(p.at * input.duration),
      title: p.title,
      description: p.description,
      type: p.type,
      vitals: vit,
      instructorNote: p.instructorNote,
      hidden: p.type === "hidden",
    };
  });

  // hidden complication for higher difficulties or on request
  const wantsHidden = /hidden|complication|surprise|unexpected/i.test(input.prompt) || input.difficulty === "Advanced" || input.difficulty === "Expert";
  if (wantsHidden && !timeline.some((e) => e.hidden)) {
    const mid = Math.round(input.duration * 0.62);
    const complication = t.hiddenComplications[0];
    timeline.push({
      id: "ev-hidden",
      tMin: mid,
      title: "Hidden complication",
      description: complication,
      type: "hidden",
      vitals: timeline[Math.floor(timeline.length / 2)].vitals,
      instructorNote: `Instructor-triggered: ${complication}. Reveal only if the team is coping well; skip if overloaded.`,
      hidden: true,
    });
    timeline.sort((a, b) => a.tMin - b.tMin);
  }
  return { timeline, initialVitals: sick0 };
}

function buildFlow(t: ConditionTemplate): { nodes: SimNode[]; edges: SimEdge[] } {
  const N = (id: string, kind: SimNode["kind"], label: string, detail: string, x: number, y: number, branch?: SimNode["branch"]): SimNode =>
    ({ id, kind, label, detail, x, y, branch });
  const E = (s: string, tgt: string, label?: string, branch?: SimEdge["branch"]): SimEdge =>
    ({ id: `${s}-${tgt}`, source: s, target: tgt, label, branch });

  const nodes: SimNode[] = [
    N("patient", "patient", "Patient Presentation", t.presenting.slice(0, 110) + "…", 0, 220),
    N("assess", "assessment", "Primary Assessment", "ABCDE survey, focused history, monitoring attached, first vitals interpreted.", 300, 220),
    N("dx", "diagnosis", "Working Diagnosis", t.name, 600, 220),
    N("decide", "decision", "Key Decision Point", `Management decision: ${t.keyTreatments[0]} vs alternatives. Branch on team's choice.`, 900, 220),
    N("tx-good", "treatment", "Correct Management", t.keyTreatments.slice(0, 3).join(" · "), 1220, 40, "correct"),
    N("resp-good", "response", "Patient Stabilises", "Vitals trend toward baseline; perfusion and mentation improve.", 1540, 40, "correct"),
    N("recover", "recovery", "Recovery & Handover", "Structured SBAR handover; disposition secured.", 1860, 40, "correct"),
    N("tx-wrong", "treatment", t.wrongTurn.label, "The team commits to an incorrect pathway.", 1220, 240, "incorrect"),
    N("comp-wrong", "complication", "Deterioration", t.wrongTurn.consequence, 1540, 240, "incorrect"),
    N("outcome-wrong", "outcome", "Critical Deterioration", "Peri-arrest state. Recovery still possible with immediate correction.", 1860, 240, "incorrect"),
    N("tx-delay", "treatment", t.delayedTurn.label, "The right treatment — too late.", 1220, 440, "delayed"),
    N("comp-delay", "complication", "Progressive Decline", t.delayedTurn.consequence, 1540, 440, "delayed"),
    N("outcome-delay", "outcome", "Arrest / Death Pathway", "Scenario may proceed to arrest and resuscitation module.", 1860, 440, "delayed"),
  ];
  const edges: SimEdge[] = [
    E("patient", "assess"),
    E("assess", "dx"),
    E("dx", "decide"),
    E("decide", "tx-good", "correct choice", "correct"),
    E("tx-good", "resp-good", undefined, "correct"),
    E("resp-good", "recover", undefined, "correct"),
    E("decide", "tx-wrong", "incorrect choice", "incorrect"),
    E("tx-wrong", "comp-wrong", undefined, "incorrect"),
    E("comp-wrong", "outcome-wrong", undefined, "incorrect"),
    E("decide", "tx-delay", "delayed action", "delayed"),
    E("tx-delay", "comp-delay", undefined, "delayed"),
    E("comp-delay", "outcome-delay", undefined, "delayed"),
    E("outcome-wrong", "tx-good", "corrective action", "correct"),
  ];
  return { nodes, edges };
}

function buildAssessment(input: WizardInput, t: ConditionTemplate): Assessment {
  return {
    mcqs: t.mcqs,
    osce: [
      { text: "Introduces self and allocates team roles clearly", critical: false },
      { text: "Performs systematic ABCDE / primary survey", critical: true },
      { text: "Obtains and correctly interprets initial vital signs", critical: true },
      ...t.criticalActions.slice(0, 4).map((c) => ({ text: c, critical: true })),
      { text: "Uses closed-loop communication for all orders", critical: false },
      { text: "Reassesses after every intervention", critical: true },
      { text: "Delivers structured SBAR handover", critical: false },
    ],
    criticalActions: t.criticalActions.map((c) => ({ text: c, critical: true })),
    rubric: [
      { domain: "Clinical Assessment", levels: ["Misses key findings", "Identifies most findings with prompting", "Systematic and thorough unprompted", "Anticipates evolution; prioritises expertly"] },
      { domain: "Clinical Management", levels: ["Incorrect or absent treatment", "Correct treatment, wrong dose/timing", "Guideline-concordant care", "Optimised, personalised, pre-emptive care"] },
      { domain: "Communication", levels: ["Orders unclear, loops open", "Mostly clear, some open loops", "Consistent closed-loop communication", "Exemplary — calm, directive, inclusive"] },
      { domain: "Leadership & Teamwork", levels: ["No visible leadership", "Leader emerges late", "Clear roles, shared mental model", "Distributed leadership under pressure"] },
      { domain: "Situational Awareness", levels: ["Fixation error persists", "Recovers from fixation with cueing", "Continuously reassesses big picture", "Anticipates events before cues appear"] },
    ],
    reflection: [
      "What was your first working diagnosis, and what would have changed it?",
      "At which moment did the patient's trajectory change, and how quickly did the team recognise it?",
      `Which step of the ${t.name} pathway would you perform differently next time, and why?`,
      "How did communication within the team affect the patient's outcome?",
    ],
    passThreshold: input.difficulty === "Expert" ? 90 : input.difficulty === "Advanced" ? 85 : 80,
  };
}

function buildDebrief(input: WizardInput, t: ConditionTemplate): Debrief {
  return {
    summary: `A ${input.duration}-minute ${input.difficulty.toLowerCase()}-level ${input.specialty} scenario centred on ${t.name.toLowerCase()} in a ${input.patientType.toLowerCase()} patient. The team was expected to ${t.criticalActions[0].toLowerCase()}, escalate appropriately, and manage the critical event while maintaining team communication.`,
    strengths: [
      "Early structured assessment (observed in most runs of this template)",
      "Appropriate escalation once deterioration was recognised",
      "Task allocation after leader designation",
    ],
    weaknesses: [
      "Recognition-to-action interval for the critical event",
      "Closed-loop communication under cognitive load",
      "Reassessment cadence after interventions",
    ],
    criticalErrors: [t.wrongTurn.label, t.delayedTurn.label],
    missedOpportunities: [
      `Verbalising the differential beyond ${t.name.toLowerCase()}`,
      "Early involvement of family/witness for collateral history",
      "Using available equipment to full effect (per equipment list)",
    ],
    discussion: [
      { topic: "Clinical reasoning", questions: ["Walk me through your thinking when the first abnormal vitals appeared.", "What alternative diagnoses did you weigh, and what ruled them out?"] },
      { topic: "Recognition of deterioration", questions: ["Which parameter changed first before the critical event?", "What monitoring strategy would catch it earlier?"] },
      { topic: "Communication & leadership", questions: ["How were roles allocated, and did they hold under pressure?", "Give one example of a closed loop that worked and one that broke."] },
      { topic: "Systems & environment", questions: ["Was any equipment or drug hard to locate?", "What would you change about the room setup for the real event?"] },
    ],
    evidence: t.evidence,
    improvementPlan: [
      `Micro-teaching: 10-minute review of the ${t.evidence[0].source} algorithm`,
      "Deliberate practice: closed-loop communication drill in next in-situ session",
      `Repeat scenario at ${input.difficulty === "Expert" ? "Expert with additional stressors" : "increased difficulty"} within 6 weeks`,
    ],
  };
}

function buildValidation(input: WizardInput, t: ConditionTemplate): ValidationItem[] {
  const items: ValidationItem[] = [...t.validation];
  items.push({
    level: "pass",
    guideline: "Simulation design (INACSL)",
    message: `Objectives (${input.objectives.slice(0, 3).join(", ")}) are mapped to observable behaviours in the OSCE checklist.`,
    evidence: "INACSL Healthcare Simulation Standards 2021",
  });
  if (!input.equipment.includes("Defibrillator") && (t.id === "mi" || t.id === "arrest")) {
    items.push({
      level: "conflict",
      guideline: "Equipment safety check",
      message: "Scenario includes a shockable-rhythm event but no defibrillator was selected in available equipment.",
      evidence: "AHA ACLS 2020 — defibrillation is time-critical",
      recommendation: "Add a defibrillator (or trainer) to the equipment list before publishing.",
    });
  }
  if (["Child", "Infant", "Neonate"].includes(input.patientType)) {
    items.push({
      level: "warning",
      guideline: "Paediatric dosing",
      message: "All drug doses must be weight-based; confirm the manikin's programmed weight matches the scenario weight.",
      evidence: "PALS 2020",
      recommendation: "Print a weight-based drug card (Broselow-equivalent) for the sim room.",
    });
  }
  if (input.duration <= 15 && t.phases.length >= 6) {
    items.push({
      level: "warning",
      guideline: "Scenario pacing",
      message: "Six clinical phases in 15 minutes is aggressive; consider trimming the family-interaction beat.",
      evidence: "Simulation design best practice",
      recommendation: "Extend to 30 minutes or mark two phases as optional.",
    });
  }
  return items;
}

let counter = 0;

export function generateScenario(input: WizardInput): Scenario {
  const t = findCondition(input.condition);
  const rng = makeRng(hashStr(JSON.stringify(input) + Date.now().toString().slice(0, -4)));
  const severity = SEVERITY[input.difficulty] ?? 1;
  const patient = buildPatient(input, t, rng);
  const { timeline, initialVitals } = buildTimeline(input, t, severity);
  const { nodes, edges } = buildFlow(t);
  const now = Date.now();
  counter += 1;

  const titleBits = [
    input.patientType !== "Adult" ? input.patientType : "",
    t.name.replace(/\s*\(.*\)/, ""),
    "—",
    `${input.duration} min`,
    input.difficulty,
  ].filter(Boolean);

  return {
    id: `sc-${now.toString(36)}-${counter}`,
    title: titleBits.join(" "),
    status: "draft",
    createdAt: now,
    updatedAt: now,
    version: 1,
    input,
    patient,
    chiefComplaint: t.chief,
    initialVitals,
    labs: t.labs,
    imaging: t.imaging,
    ecg: { ...t.ecg, rate: initialVitals.hr },
    timeline,
    nodes,
    edges,
    instructorNotes: [
      `Pre-brief: orient learners to the room, monitor and manikin capabilities. State the fiction contract.`,
      `The scenario hinges on ${t.criticalActions[0].toLowerCase()} — protect that learning moment.`,
      ...timeline.filter((e) => e.instructorNote).map((e) => `T+${e.tMin} min — ${e.instructorNote}`),
      `If the team stalls: use the embedded confederate (nurse) to cue with an observation, not an instruction.`,
    ],
    studentBrief: `You are the ${input.specialty} team receiving a ${patient.age} ${patient.gender.toLowerCase()} ${input.patientType !== "Adult" ? `(${input.patientType.toLowerCase()}) ` : ""}patient. ${t.presenting} Work as a team; all standard equipment (${input.equipment.slice(0, 4).join(", ")}${input.equipment.length > 4 ? "…" : ""}) is available. The scenario runs in real time for ${input.duration} minutes.`,
    criticalActions: t.criticalActions,
    hiddenPrompts: [
      ...t.hiddenComplications.map((h) => `Optional trigger: ${h}`),
      `Escalation lever: if the team is ahead of schedule, ${t.hiddenComplications[0].toLowerCase()}`,
      `De-escalation lever: if the team is overwhelmed, have the confederate nurse 'find' the key drug/equipment.`,
    ],
    dialogue: t.dialogue,
    assessment: buildAssessment(input, t),
    debrief: buildDebrief(input, t),
    validation: buildValidation(input, t),
    comments: [],
    versions: [{ version: 1, at: now, author: "SimCraft AI", note: "Initial AI generation from wizard brief" }],
    tags: [input.specialty, input.patientType, t.name.split(" ")[0], input.difficulty, `${input.duration} min`],
    rating: Math.round((4 + rng()) * 10) / 10,
    uses: 0,
  };
}

export function explainDisease(conditionQuery: string): string {
  return findCondition(conditionQuery).pathophys;
}
