// The 7-agent generation pipeline. In this portfolio build the agents run a
// deterministic clinical engine locally; each stage streams realistic status
// lines so the orchestration UX matches the production architecture.

export interface AgentStage {
  id: string;
  name: string;
  role: string;
  lines: string[]; // streamed status output
  ms: number; // simulated duration
}

export function pipelineFor(condition: string, specialty: string): AgentStage[] {
  const c = condition || "the selected condition";
  return [
    {
      id: "planner", name: "Scenario Planner", role: "Agent 1",
      ms: 1700,
      lines: [
        `Parsing educator brief → structured scenario spec…`,
        `Mapping ${specialty} context, learner level and time budget`,
        `Selecting clinical trajectory template for ${c}`,
        `Spec locked: phases, critical event placement, branch points ✓`,
      ],
    },
    {
      id: "content", name: "Medical Content Generator", role: "Agent 2",
      ms: 2600,
      lines: [
        "Generating patient identity, history and medications…",
        "Computing age-appropriate baseline physiology",
        `Deriving minute-by-minute vitals curve for ${c}`,
        "Writing labs (CBC, ABG, chemistry), imaging and ECG interpretation",
        "Drafting patient and family dialogue ✓",
      ],
    },
    {
      id: "validator", name: "Clinical Validator", role: "Agent 3",
      ms: 1900,
      lines: [
        "Cross-checking drug doses and routes against formulary…",
        "Validating timing targets against AHA / ERC / specialty guidelines",
        "Screening for physiological contradictions in the vitals curve",
        "2 advisories raised → attached to validation report ✓",
      ],
    },
    {
      id: "objectives", name: "Educational Objective Mapper", role: "Agent 4",
      ms: 1400,
      lines: [
        "Mapping learning objectives → observable behaviours…",
        "Aligning critical actions with objective coverage",
        "Coverage matrix complete: every objective has ≥2 assessable moments ✓",
      ],
    },
    {
      id: "assessment", name: "Assessment Generator", role: "Agent 5",
      ms: 1800,
      lines: [
        "Writing MCQs with distractor rationales…",
        "Building OSCE checklist and weighted critical actions",
        "Generating 5-domain competency rubric ✓",
      ],
    },
    {
      id: "debrief", name: "Debrief Generator", role: "Agent 6",
      ms: 1500,
      lines: [
        "Structuring debrief: reactions → analysis → summary…",
        "Writing advocacy-inquiry discussion prompts",
        "Attaching evidence references for each teaching point ✓",
      ],
    },
    {
      id: "reviewer", name: "Quality Reviewer", role: "Agent 7",
      ms: 1600,
      lines: [
        "Holistic pass: tone, realism, internal consistency…",
        "Verifying JSON schema of every artefact",
        "Scoring scenario quality: 94 / 100",
        "Package assembled — ready for the canvas ✓",
      ],
    },
  ];
}

export const COPILOT_ACTIONS = [
  { id: "realism", label: "Improve Realism", group: "Refine" },
  { id: "harder", label: "Increase Difficulty", group: "Refine" },
  { id: "easier", label: "Reduce Difficulty", group: "Refine" },
  { id: "instructor-notes", label: "Instructor Notes", group: "Generate" },
  { id: "student-notes", label: "Student Notes", group: "Generate" },
  { id: "labs", label: "Lab Reports", group: "Generate" },
  { id: "imaging", label: "Imaging", group: "Generate" },
  { id: "ecg", label: "ECG", group: "Generate" },
  { id: "dialogue", label: "Dialogue", group: "Generate" },
  { id: "family", label: "Family Member", group: "Complicate" },
  { id: "ethical", label: "Ethical Conflict", group: "Complicate" },
  { id: "team-conflict", label: "Team Conflict", group: "Complicate" },
  { id: "hidden-event", label: "Hidden Event", group: "Complicate" },
  { id: "comm-failure", label: "Communication Failure", group: "Complicate" },
  { id: "explain", label: "Explain Disease", group: "Understand" },
  { id: "evidence", label: "Generate Evidence", group: "Understand" },
] as const;
