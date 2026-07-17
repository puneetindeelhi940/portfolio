import { LabPanel, Imaging, MCQ, ValidationItem, Vitals } from "../types";

// A phase describes the clinical trajectory as fractions of total scenario time.
// Vitals are expressed as deltas against the age-appropriate baseline so the
// same template adapts to adult / child / infant / geriatric physiology.
export interface Phase {
  at: number; // fraction of duration, 0..1
  title: string;
  description: string;
  type:
    | "arrival"
    | "assessment"
    | "deterioration"
    | "critical"
    | "intervention"
    | "complication"
    | "family"
    | "recovery"
    | "hidden";
  mod: Partial<Vitals>; // deltas vs baseline (temp is absolute delta °C)
  rhythm?: string;
  instructorNote?: string;
}

export interface ConditionTemplate {
  id: string;
  name: string;
  aliases: string[];
  specialties: string[];
  pathophys: string;
  chief: string; // patient-voice chief complaint
  presenting: string;
  baseline: Partial<Vitals>; // sick baseline deltas at t0
  rhythm0: string;
  phases: Phase[];
  labs: LabPanel[];
  imaging: Imaging[];
  ecg: { interpretation: string; rhythm: string; details: string[] };
  criticalActions: string[];
  keyTreatments: string[];
  wrongTurn: { label: string; consequence: string };
  delayedTurn: { label: string; consequence: string };
  hiddenComplications: string[];
  history: string[];
  riskFactors: string[];
  medications: string[];
  mcqs: MCQ[];
  evidence: { source: string; text: string }[];
  validation: ValidationItem[];
  dialogue: { speaker: string; line: string }[];
}

const v = (m: Partial<Vitals>) => m;

export const CONDITIONS: ConditionTemplate[] = [
  {
    id: "sepsis",
    name: "Sepsis / Septic Shock",
    aliases: ["sepsis", "septic shock", "infection", "urosepsis", "pneumonia sepsis"],
    specialties: ["Emergency Medicine", "ICU", "PICU", "Pediatrics", "NICU"],
    pathophys:
      "A dysregulated host response to infection producing vasodilation, capillary leak and mitochondrial dysfunction. Falling systemic vascular resistance drives compensatory tachycardia; untreated, distributive shock progresses to tissue hypoperfusion, rising lactate and multi-organ failure.",
    chief: "I just feel awful… hot and cold, shivering, and my heart is racing.",
    presenting:
      "Two days of fever, rigors and worsening lethargy following a productive cough. Family reports reduced oral intake and confusion this morning.",
    baseline: v({ hr: 38, sbp: -18, dbp: -10, rr: 10, spo2: -4, temp: 2.4, pain: 3, capRefill: 2 }),
    rhythm0: "Sinus tachycardia",
    phases: [
      { at: 0, title: "Patient arrives", description: "Febrile, rigoring, tachycardic. Triage flags qSOFA 2/3.", type: "arrival", mod: v({}), instructorNote: "Expect learners to obtain a full set of vitals and screen with qSOFA/SIRS within 5 minutes." },
      { at: 0.15, title: "Initial assessment window", description: "History and ABCDE exam. Mottled peripheries, prolonged capillary refill.", type: "assessment", mod: v({ hr: 4 }), instructorNote: "Prompt for blood cultures BEFORE antibiotics if not verbalised." },
      { at: 0.35, title: "BP drops", description: "Progressive vasodilation. MAP falls below 65 mmHg despite initial fluids.", type: "deterioration", mod: v({ hr: 14, sbp: -34, dbp: -18, rr: 6, spo2: -3, capRefill: 1.5 }), instructorNote: "If 30 mL/kg crystalloid not started, accelerate deterioration." },
      { at: 0.55, title: "Critical event — refractory hypotension", description: "Fluid-refractory shock. Lactate climbing, urine output falling, patient increasingly obtunded.", type: "critical", mod: v({ hr: 22, sbp: -48, dbp: -26, rr: 10, spo2: -7, gcs: -3, capRefill: 2.5 }), rhythm: "Sinus tachycardia, weak thready pulse", instructorNote: "Decision point: norepinephrine infusion. Reward early vasopressor + source-control thinking." },
      { at: 0.75, title: "Response to treatment", description: "With vasopressors and appropriate antibiotics, MAP recovers above 65 mmHg.", type: "intervention", mod: v({ hr: 10, sbp: -22, dbp: -12, rr: 5, spo2: -2, gcs: -1 }), instructorNote: "If antibiotics still not given, progress to arrest branch instead." },
      { at: 1, title: "Stabilised for ICU handover", description: "Perfusion improving, lactate trending down. Team performs SBAR handover to ICU.", type: "recovery", mod: v({ hr: 6, sbp: -12, dbp: -6, rr: 3, spo2: -1 }), instructorNote: "Assess structured SBAR handover quality." },
    ],
    labs: [
      { name: "CBC", results: [
        { name: "WBC", value: "21.4", unit: "×10⁹/L", ref: "4.0–11.0", flag: "H" },
        { name: "Hemoglobin", value: "12.8", unit: "g/dL", ref: "12–16" },
        { name: "Platelets", value: "98", unit: "×10⁹/L", ref: "150–400", flag: "L" },
        { name: "Bands", value: "18", unit: "%", ref: "<10", flag: "H" },
      ]},
      { name: "Chemistry & Perfusion", results: [
        { name: "Lactate", value: "4.8", unit: "mmol/L", ref: "0.5–2.0", flag: "C" },
        { name: "Creatinine", value: "1.9", unit: "mg/dL", ref: "0.6–1.2", flag: "H" },
        { name: "Glucose", value: "148", unit: "mg/dL", ref: "70–110", flag: "H" },
        { name: "CRP", value: "212", unit: "mg/L", ref: "<5", flag: "C" },
      ]},
      { name: "ABG", results: [
        { name: "pH", value: "7.29", unit: "", ref: "7.35–7.45", flag: "L" },
        { name: "pCO₂", value: "30", unit: "mmHg", ref: "35–45", flag: "L" },
        { name: "HCO₃⁻", value: "16", unit: "mmol/L", ref: "22–26", flag: "L" },
        { name: "Base excess", value: "-8.2", unit: "mmol/L", ref: "-2 to +2", flag: "C" },
      ]},
    ],
    imaging: [
      { modality: "Chest X-ray", title: "Portable AP chest", findings: "Right lower lobe consolidation with air bronchograms. No effusion. Heart size normal.", impression: "Right lower lobe pneumonia — likely septic source." },
      { modality: "Ultrasound", title: "Bedside IVC / lung", findings: "IVC collapsing >50% with respiration. B-lines over right base.", impression: "Volume-responsive state; pulmonary infective focus." },
    ],
    ecg: { interpretation: "Sinus tachycardia with no acute ischaemic changes. Rate-related non-specific ST flattening.", rhythm: "Sinus tachycardia", details: ["Rate 128 bpm", "Normal axis", "PR 150 ms, QRS 88 ms", "No ST elevation; flattened T waves V4–V6"] },
    criticalActions: [
      "Recognise sepsis within 10 minutes (qSOFA / SIRS + suspected source)",
      "Obtain blood cultures before antibiotics",
      "Administer broad-spectrum antibiotics within 1 hour",
      "Start 30 mL/kg balanced crystalloid bolus",
      "Reassess perfusion and escalate to norepinephrine for MAP < 65 mmHg",
      "Serial lactate measurement",
    ],
    keyTreatments: ["Broad-spectrum antibiotics", "30 mL/kg crystalloid", "Norepinephrine infusion", "Source control", "Serial lactate"],
    wrongTurn: { label: "Vasopressors before any fluid resuscitation", consequence: "Worsening tissue perfusion, rising lactate, peri-arrest bradycardia" },
    delayedTurn: { label: "Antibiotics delayed beyond 60 minutes", consequence: "Progressive shock → multi-organ dysfunction → cardiac arrest" },
    hiddenComplications: ["Anaphylactoid reaction to first antibiotic dose", "Occult atrial fibrillation with RVR triggered by shock", "Family member reveals penicillin allergy mid-treatment"],
    history: ["Type 2 diabetes mellitus", "Recent community-acquired pneumonia symptoms", "Hypertension"],
    riskFactors: ["Diabetes", "Age", "Recent respiratory infection", "Delayed presentation"],
    medications: ["Metformin 1 g BD", "Lisinopril 10 mg OD"],
    mcqs: [
      { q: "Within what timeframe should broad-spectrum antibiotics be administered in septic shock?", options: ["Within 6 hours", "Within 3 hours", "Within 1 hour", "After culture results return"], answer: 2, rationale: "Surviving Sepsis Campaign recommends antimicrobials within 1 hour of recognition of septic shock; each hour of delay increases mortality." },
      { q: "What is the recommended initial fluid resuscitation volume in sepsis-induced hypoperfusion?", options: ["10 mL/kg colloid", "30 mL/kg balanced crystalloid", "50 mL/kg 0.9% saline", "250 mL fixed bolus"], answer: 1, rationale: "SSC 2021 recommends at least 30 mL/kg IV crystalloid within the first 3 hours, favouring balanced solutions." },
      { q: "The first-line vasopressor for fluid-refractory septic shock is:", options: ["Dopamine", "Epinephrine", "Vasopressin", "Norepinephrine"], answer: 3, rationale: "Norepinephrine is the first-line vasopressor targeting MAP ≥ 65 mmHg; dopamine carries higher arrhythmia risk." },
      { q: "Which finding best indicates response to resuscitation?", options: ["Falling serial lactate", "Rising WBC", "Warm peripheries alone", "Reduced pain score"], answer: 0, rationale: "Lactate clearance is a core marker of restored tissue perfusion and guides ongoing resuscitation." },
    ],
    evidence: [
      { source: "Surviving Sepsis Campaign 2021", text: "Administer antimicrobials within 1 h; ≥30 mL/kg crystalloid for hypoperfusion; norepinephrine first-line targeting MAP ≥ 65 mmHg." },
      { source: "NICE NG51", text: "Use a structured risk-stratification tool and deliver the sepsis six within one hour for high-risk patients." },
    ],
    validation: [
      { level: "pass", guideline: "SSC 2021", message: "Antibiotic timing target (≤60 min) embedded as a critical action.", evidence: "SSC 2021, Recommendation 12" },
      { level: "warning", guideline: "SSC 2021", message: "Scenario allows 30 mL/kg bolus for all patient types — consider 10–20 mL/kg aliquots with reassessment for paediatric or heart-failure patients.", evidence: "SSC Children 2020", recommendation: "Add a fluid-reassessment prompt after each 10 mL/kg aliquot for non-adult variants." },
      { level: "pass", guideline: "qSOFA/NEWS2", message: "Early-recognition trigger present in arrival phase.", evidence: "Sepsis-3 (JAMA 2016)" },
    ],
    dialogue: [
      { speaker: "Patient", line: "I can't stop shaking… everything hurts. Am I going to be okay?" },
      { speaker: "Family member", line: "She's been getting worse for two days — why is nobody giving her anything yet?" },
      { speaker: "Patient (later)", line: "I feel so dizzy… the room keeps sliding away…" },
    ],
  },
  {
    id: "mi",
    name: "Acute Myocardial Infarction (STEMI)",
    aliases: ["myocardial infarction", "mi", "stemi", "heart attack", "acs", "chest pain"],
    specialties: ["Cardiology", "Emergency Medicine", "EMS"],
    pathophys:
      "Acute plaque rupture with thrombotic occlusion of a coronary artery. Ischaemic myocardium becomes electrically unstable and contractility falls; anterior occlusions threaten cardiogenic shock, inferior occlusions bradyarrhythmia. Time is muscle — reperfusion within 90 minutes defines outcome.",
    chief: "There's a crushing pressure in my chest — like someone is standing on it. It goes into my jaw.",
    presenting:
      "45 minutes of central crushing chest pain radiating to the left arm and jaw, with diaphoresis and nausea, onset while climbing stairs.",
    baseline: v({ hr: 18, sbp: -6, dbp: -2, rr: 6, spo2: -3, pain: 8, capRefill: 0.5 }),
    rhythm0: "Sinus rhythm with ST elevation",
    phases: [
      { at: 0, title: "Patient arrives", description: "Clutching chest, pale, diaphoretic. Pain 8/10.", type: "arrival", mod: v({}), instructorNote: "12-lead ECG must be obtained and interpreted within 10 minutes of arrival." },
      { at: 0.15, title: "ECG acquired", description: "Anterior ST elevation V1–V4 with reciprocal inferior depression.", type: "assessment", mod: v({ hr: 2 }), instructorNote: "Expect MONA-era pitfalls: do not reward routine oxygen with SpO₂ ≥ 90%." },
      { at: 0.35, title: "Pain escalates", description: "Ongoing occlusion. Pain 9/10 despite first nitrate. Ectopy appearing on the monitor.", type: "deterioration", mod: v({ hr: 8, sbp: -12, spo2: -2, pain: 9 }), rhythm: "Sinus with multifocal PVCs", instructorNote: "Cath lab activation should already be verbalised. If not, prompt via nurse role." },
      { at: 0.55, title: "Critical event — VF arrest", description: "Sudden loss of consciousness. Ventricular fibrillation on the monitor.", type: "critical", mod: v({ hr: 0, sbp: -900, dbp: -900, rr: -900, spo2: -30, gcs: -12, pain: -8 }), rhythm: "Ventricular fibrillation", instructorNote: "Immediate defibrillation 120–200 J biphasic. High-quality CPR metrics are the assessment focus." },
      { at: 0.72, title: "ROSC", description: "After two shocks and high-quality CPR, return of spontaneous circulation.", type: "recovery", mod: v({ hr: 24, sbp: -22, dbp: -12, rr: 4, spo2: -6, gcs: -4, pain: 5 }), rhythm: "Sinus tachycardia, post-ROSC", instructorNote: "Post-ROSC bundle: 12-lead, avoid hypoxia/hypotension, expedite PCI." },
      { at: 1, title: "Transfer to cath lab", description: "Door-to-balloon clock running. SBAR handover to interventional team.", type: "recovery", mod: v({ hr: 14, sbp: -12, dbp: -6, rr: 3, spo2: -2, pain: 4 }), instructorNote: "Debrief door-to-ECG and door-to-activation times against targets." },
    ],
    labs: [
      { name: "Cardiac markers", results: [
        { name: "hs-Troponin I", value: "1,240", unit: "ng/L", ref: "<34", flag: "C" },
        { name: "CK-MB", value: "48", unit: "U/L", ref: "<25", flag: "H" },
      ]},
      { name: "Chemistry", results: [
        { name: "Potassium", value: "3.4", unit: "mmol/L", ref: "3.5–5.0", flag: "L" },
        { name: "Glucose", value: "162", unit: "mg/dL", ref: "70–110", flag: "H" },
        { name: "Creatinine", value: "1.1", unit: "mg/dL", ref: "0.6–1.2" },
      ]},
      { name: "CBC", results: [
        { name: "WBC", value: "11.8", unit: "×10⁹/L", ref: "4.0–11.0", flag: "H" },
        { name: "Hemoglobin", value: "14.6", unit: "g/dL", ref: "13–17" },
        { name: "Platelets", value: "265", unit: "×10⁹/L", ref: "150–400" },
      ]},
    ],
    imaging: [
      { modality: "Chest X-ray", title: "Portable AP chest", findings: "Normal cardiac silhouette. No pulmonary oedema at presentation. No widened mediastinum.", impression: "No acute chest pathology; supports ACS over dissection." },
      { modality: "Echo (bedside)", title: "Focused echo", findings: "Anterior wall hypokinesis. LVEF visually ~40%. No effusion.", impression: "Regional wall-motion abnormality consistent with LAD territory infarct." },
    ],
    ecg: { interpretation: "Acute anterior STEMI: 3 mm ST elevation V1–V4, reciprocal depression II/III/aVF. Occluded proximal LAD until reperfusion.", rhythm: "Sinus rhythm → VF → post-ROSC sinus tachycardia", details: ["ST elevation V1–V4 (max 3 mm)", "Reciprocal ST depression inferior leads", "Q waves forming V2–V3", "Multifocal PVCs pre-arrest"] },
    criticalActions: [
      "12-lead ECG within 10 minutes and correct STEMI identification",
      "Aspirin 300 mg (chewed) unless contraindicated",
      "Activate cath lab / reperfusion pathway immediately",
      "Defibrillate VF within 2 minutes of arrest",
      "High-quality CPR with <10 s pauses",
      "Post-ROSC care bundle (SpO₂ 94–98%, MAP > 65, repeat ECG)",
    ],
    keyTreatments: ["Aspirin", "P2Y12 inhibitor", "Nitrates (if SBP allows)", "Primary PCI", "Defibrillation"],
    wrongTurn: { label: "Nitrates given despite falling BP / inferior-RV pattern", consequence: "Profound hypotension requiring fluids and pressors" },
    delayedTurn: { label: "Cath lab activation delayed while awaiting troponin", consequence: "Extended ischaemic time → cardiogenic shock" },
    hiddenComplications: ["VF re-arrest during transfer", "Undisclosed sildenafil use — nitrate interaction", "Right ventricular infarct pattern on repeat ECG"],
    history: ["Hypertension", "Hyperlipidaemia", "Smoker — 20 pack-years"],
    riskFactors: ["Smoking", "Hypertension", "Family history of premature CAD", "Sedentary occupation"],
    medications: ["Amlodipine 5 mg OD", "Atorvastatin 20 mg nocte"],
    mcqs: [
      { q: "Target door-to-ECG time for suspected ACS is:", options: ["30 minutes", "10 minutes", "60 minutes", "20 minutes"], answer: 1, rationale: "AHA/ESC recommend a 12-lead ECG interpreted within 10 minutes of first medical contact." },
      { q: "First defibrillation dose for VF (biphasic):", options: ["50 J", "120–200 J", "360 J monophasic only", "Synchronised 100 J"], answer: 1, rationale: "AHA 2020: initial biphasic shock 120–200 J per manufacturer; escalate for refractory VF." },
      { q: "Routine oxygen in ACS is indicated when:", options: ["Always", "SpO₂ < 90%", "Pain > 5/10", "Age > 65"], answer: 1, rationale: "Supplemental O₂ benefits only hypoxaemic patients (SpO₂ < 90%); hyperoxia may worsen infarct size." },
      { q: "Maximum acceptable interruption of chest compressions:", options: ["10 seconds", "30 seconds", "5 seconds", "60 seconds"], answer: 0, rationale: "High-quality CPR limits pauses to <10 s to maintain coronary perfusion pressure." },
    ],
    evidence: [
      { source: "AHA ACLS 2020", text: "Immediate defibrillation for VF/pVT, compressions 100–120/min at 5–6 cm depth, pauses <10 s, post-ROSC SpO₂ 94–98%." },
      { source: "ESC STEMI 2023", text: "Primary PCI within 120 min of diagnosis; door-to-ECG ≤10 min; aspirin loading 150–300 mg." },
    ],
    validation: [
      { level: "pass", guideline: "AHA ACLS 2020", message: "Defibrillation-first VF response and CPR quality metrics included.", evidence: "AHA 2020, Part 3" },
      { level: "conflict", guideline: "ESC STEMI 2023", message: "Scenario script offers routine high-flow oxygen at arrival; guidelines restrict O₂ to SpO₂ < 90%.", evidence: "AVOID / DETO2X-AMI trials", recommendation: "Change default oxygen order to titrated target 94–98%, only if hypoxaemic." },
      { level: "warning", guideline: "Local protocol", message: "Door-to-balloon target set to 90 min; confirm site-specific transfer times for non-PCI centres.", evidence: "ESC 2023, Fig. 4" },
    ],
    dialogue: [
      { speaker: "Patient", line: "It feels like an elephant on my chest… my arm's gone numb." },
      { speaker: "Patient", line: "Don't tell my wife yet — she'll panic. It's probably just heartburn, right?" },
      { speaker: "Family member", line: "His father died of a heart attack at 52. Please — do something." },
    ],
  },
  {
    id: "anaphylaxis",
    name: "Anaphylaxis",
    aliases: ["anaphylaxis", "allergic reaction", "allergy", "angioedema"],
    specialties: ["Emergency Medicine", "Pediatrics", "EMS"],
    pathophys:
      "IgE-mediated mast-cell degranulation releasing histamine and tryptase. Capillary leak, bronchospasm and vasodilation combine into a rapidly progressive airway-breathing-circulation emergency. IM adrenaline reverses all three mechanisms and is the only first-line drug.",
    chief: "My tongue feels thick… it's getting hard to swallow. My skin is on fire.",
    presenting:
      "Fifteen minutes after eating at a restaurant, rapidly spreading urticaria, lip swelling, and progressive difficulty swallowing. Known peanut allergy, EpiPen left at home.",
    baseline: v({ hr: 30, sbp: -14, dbp: -8, rr: 8, spo2: -5, pain: 2, capRefill: 1 }),
    rhythm0: "Sinus tachycardia",
    phases: [
      { at: 0, title: "Patient arrives", description: "Urticarial rash, lip and periorbital swelling, audible stridor developing.", type: "arrival", mod: v({}), instructorNote: "Anaphylaxis criteria met at arrival — the clock for IM adrenaline starts now." },
      { at: 0.18, title: "Airway swelling progresses", description: "Voice change, tongue swelling, stridor at rest. SpO₂ falling.", type: "deterioration", mod: v({ hr: 10, rr: 8, spo2: -6 }), instructorNote: "If IM adrenaline 0.5 mg (adult) given promptly, blunt progression; if antihistamine-only, accelerate." },
      { at: 0.4, title: "Critical event — hypotensive collapse", description: "Distributive shock: SBP falls sharply, patient pre-syncopal, wheeze throughout.", type: "critical", mod: v({ hr: 26, sbp: -46, dbp: -24, rr: 12, spo2: -12, gcs: -2, capRefill: 2 }), instructorNote: "Second IM adrenaline dose after 5 min if no response + 20 mL/kg fluid bolus, legs raised." },
      { at: 0.62, title: "Response to adrenaline", description: "Stridor settling, BP recovering, rash fading at the edges.", type: "intervention", mod: v({ hr: 16, sbp: -18, dbp: -8, rr: 5, spo2: -4 }), instructorNote: "Discuss adrenaline infusion trigger if refractory (after 2–3 IM doses)." },
      { at: 0.8, title: "Hidden risk — biphasic watch", description: "Patient feels 'completely fine' and wants to self-discharge.", type: "hidden", mod: v({ hr: 8, sbp: -8, rr: 2, spo2: -1 }), instructorNote: "Test whether learners counsel biphasic reaction risk and observation period." },
      { at: 1, title: "Observation and discharge planning", description: "Stable. Adrenaline auto-injector training and allergy referral arranged.", type: "recovery", mod: v({ hr: 4, sbp: -4, rr: 1 }), instructorNote: "Critical: auto-injector prescription + written anaphylaxis action plan." },
    ],
    labs: [
      { name: "Immunology", results: [
        { name: "Serum tryptase (1 h)", value: "38", unit: "µg/L", ref: "<11.4", flag: "H" },
        { name: "Repeat tryptase (24 h)", value: "pending", unit: "", ref: "baseline" },
      ]},
      { name: "ABG", results: [
        { name: "pH", value: "7.32", unit: "", ref: "7.35–7.45", flag: "L" },
        { name: "pO₂", value: "68", unit: "mmHg", ref: "80–100", flag: "L" },
        { name: "pCO₂", value: "48", unit: "mmHg", ref: "35–45", flag: "H" },
      ]},
    ],
    imaging: [
      { modality: "Ultrasound", title: "POCUS airway/lung", findings: "Diffuse bilateral wheeze correlate; no pneumothorax; IVC flat.", impression: "Bronchospasm with volume-depleted state." },
    ],
    ecg: { interpretation: "Sinus tachycardia; rate-related ST flattening only. No ischaemia.", rhythm: "Sinus tachycardia", details: ["Rate 132 bpm", "Normal intervals", "No acute ST/T changes"] },
    criticalActions: [
      "Recognise anaphylaxis and give IM adrenaline within 5 minutes",
      "Correct dose: 0.5 mg IM adult / 0.01 mg/kg (max 0.3 mg) child, anterolateral thigh",
      "Remove/avoid ongoing allergen exposure",
      "High-flow oxygen and early airway escalation call",
      "IV fluid bolus for hypotension (20 mL/kg)",
      "Repeat adrenaline at 5 minutes if inadequate response",
      "Counsel biphasic risk; prescribe auto-injector before discharge",
    ],
    keyTreatments: ["IM adrenaline", "Oxygen", "IV crystalloid", "Nebulised salbutamol adjunct", "Adrenaline infusion if refractory"],
    wrongTurn: { label: "IV antihistamine + steroid given instead of IM adrenaline", consequence: "Progressive airway obstruction → hypoxic bradycardia → peri-arrest" },
    delayedTurn: { label: "Adrenaline delayed while securing IV access", consequence: "Hypotensive collapse; harder intubation as oedema worsens" },
    hiddenComplications: ["Biphasic reaction 40 minutes after full recovery", "Beta-blocked patient — poor adrenaline response, needs glucagon", "Latex co-allergy to resus equipment"],
    history: ["Peanut allergy since childhood", "Asthma — well controlled", "Previous ED visit for hives"],
    riskFactors: ["Food allergy", "Asthma", "Auto-injector not carried", "Restaurant (hidden allergens)"],
    medications: ["Salbutamol inhaler PRN", "Cetirizine PRN"],
    mcqs: [
      { q: "First-line drug and route in anaphylaxis:", options: ["IV chlorphenamine", "IM adrenaline", "IV hydrocortisone", "Nebulised adrenaline"], answer: 1, rationale: "IM adrenaline into the anterolateral thigh is the only first-line treatment; antihistamines and steroids are adjuncts that do not treat airway or shock." },
      { q: "Adult IM adrenaline dose for anaphylaxis:", options: ["0.1 mg (1:10,000)", "0.5 mg (1:1,000)", "1 mg (1:10,000)", "5 mg nebulised"], answer: 1, rationale: "0.5 mg of 1 mg/mL (1:1,000) IM, repeated after 5 minutes if needed. The 1:10,000 IV preparation is for cardiac arrest." },
      { q: "A patient fully recovers after adrenaline. Best next step:", options: ["Immediate discharge with antihistamines", "Observe for biphasic reaction and prescribe auto-injector", "Routine ICU admission", "Oral food challenge before discharge"], answer: 1, rationale: "Biphasic reactions occur in up to 20%; observation plus auto-injector provision and an action plan are required before discharge." },
      { q: "In a beta-blocked patient with adrenaline-refractory anaphylaxis, consider:", options: ["Glucagon", "Atropine", "Amiodarone", "Naloxone"], answer: 0, rationale: "Glucagon bypasses the beta-receptor, restoring inotropy and chronotropy when beta-blockade blunts adrenaline." },
    ],
    evidence: [
      { source: "RCUK Anaphylaxis 2021", text: "IM adrenaline first-line; repeat at 5 min; refractory anaphylaxis → low-dose IV adrenaline infusion with monitoring." },
      { source: "WAO Anaphylaxis 2020", text: "Diagnosis is clinical; delay in adrenaline is the biggest modifiable mortality factor; observe for biphasic reactions." },
    ],
    validation: [
      { level: "pass", guideline: "RCUK 2021", message: "Adrenaline dose, route and repeat interval match current guidance.", evidence: "RCUK Anaphylaxis 2021" },
      { level: "warning", guideline: "RCUK 2021", message: "Steroids appear in the treatment list — no longer routinely recommended; keep as optional adjunct only.", evidence: "RCUK 2021 update", recommendation: "Move hydrocortisone to 'optional adjuncts' with a note on the evidence change." },
    ],
    dialogue: [
      { speaker: "Patient", line: "My throat… it's closing… I can feel it closing…" },
      { speaker: "Friend", line: "She asked if the sauce had nuts — they said no! I have photos of the menu." },
      { speaker: "Patient (recovered)", line: "I feel totally fine now, honestly. Can I just go home? I have work tomorrow." },
    ],
  },
  {
    id: "trauma",
    name: "Polytrauma with Hemorrhagic Shock",
    aliases: ["trauma", "hypovolemia", "hemorrhage", "haemorrhage", "polytrauma", "mvc", "gsw", "bleeding"],
    specialties: ["Trauma", "Emergency Medicine", "Military Medicine", "EMS"],
    pathophys:
      "Uncontrolled haemorrhage drives progressive loss of circulating volume. Compensatory vasoconstriction and tachycardia mask early losses; decompensation is sudden. The lethal triad — hypothermia, acidosis, coagulopathy — accelerates bleeding, making early haemorrhage control and balanced blood-product resuscitation decisive.",
    chief: "(GCS 13, groaning) My belly… it hurts… where am I?",
    presenting:
      "Motorcycle vs car at highway speed. Prolonged extrication. Abdominal bruising, unstable pelvis on primary survey, cold and clammy. Pre-hospital: 1 unit blood, pelvic binder loose.",
    baseline: v({ hr: 36, sbp: -28, dbp: -16, rr: 10, spo2: -4, temp: -1.2, pain: 7, gcs: -2, capRefill: 2 }),
    rhythm0: "Sinus tachycardia",
    phases: [
      { at: 0, title: "Patient arrives — primary survey", description: "ATLS primary survey. Unstable pelvis, distended abdomen, long-bone deformity.", type: "arrival", mod: v({}), instructorNote: "Expect C-ABC: catastrophic haemorrhage control before airway. Check pelvic binder placement." },
      { at: 0.15, title: "FAST exam", description: "Free fluid in Morison's pouch and pelvis. Team must weigh imaging vs theatre.", type: "assessment", mod: v({ hr: 4, sbp: -6 }), instructorNote: "Positive FAST + instability = theatre, not CT. Challenge the team if they choose CT." },
      { at: 0.32, title: "Decompensation", description: "Compensatory mechanisms failing: SBP falls, mentation clouds, lactate 6.1.", type: "deterioration", mod: v({ hr: 18, sbp: -30, dbp: -16, rr: 6, gcs: -3, capRefill: 2, temp: -0.6 }), instructorNote: "Trigger massive transfusion protocol; 1:1:1 ratio. Penalise crystalloid-heavy resuscitation." },
      { at: 0.5, title: "Critical event — peri-arrest", description: "SBP 58, carotid-only pulses, agonal mentation. MTP running?", type: "critical", mod: v({ hr: 26, sbp: -52, dbp: -30, rr: -4, spo2: -8, gcs: -6, temp: -1 }), rhythm: "Sinus tachycardia → narrow-complex, thready", instructorNote: "If TXA + MTP + binder corrected: stabilise. Otherwise → PEA arrest branch." },
      { at: 0.7, title: "Damage-control resuscitation takes effect", description: "Blood products in, calcium replaced, warming active. SBP responding.", type: "intervention", mod: v({ hr: 16, sbp: -26, dbp: -14, rr: 4, gcs: -3, temp: -0.6 }), instructorNote: "Discuss permissive hypotension target (SBP ~90) pre-haemostasis vs head-injury caveat." },
      { at: 1, title: "To theatre — damage-control laparotomy", description: "Trauma team leader runs SBAR to surgery and anaesthesia. Family arrives in resus.", type: "recovery", mod: v({ hr: 12, sbp: -18, dbp: -10, gcs: -2, temp: -0.4 }), instructorNote: "Family communication under pressure is a scored objective." },
    ],
    labs: [
      { name: "CBC", results: [
        { name: "Hemoglobin", value: "7.9", unit: "g/dL", ref: "13–17", flag: "C" },
        { name: "Platelets", value: "112", unit: "×10⁹/L", ref: "150–400", flag: "L" },
        { name: "WBC", value: "15.2", unit: "×10⁹/L", ref: "4.0–11.0", flag: "H" },
      ]},
      { name: "Coagulation", results: [
        { name: "INR", value: "1.6", unit: "", ref: "0.9–1.1", flag: "H" },
        { name: "Fibrinogen", value: "1.2", unit: "g/L", ref: "2.0–4.0", flag: "C" },
      ]},
      { name: "ABG / Perfusion", results: [
        { name: "pH", value: "7.24", unit: "", ref: "7.35–7.45", flag: "C" },
        { name: "Lactate", value: "6.1", unit: "mmol/L", ref: "0.5–2.0", flag: "C" },
        { name: "Base excess", value: "-11", unit: "mmol/L", ref: "-2 to +2", flag: "C" },
        { name: "Ionised Ca²⁺", value: "0.98", unit: "mmol/L", ref: "1.1–1.3", flag: "L" },
      ]},
    ],
    imaging: [
      { modality: "Ultrasound", title: "eFAST", findings: "Free fluid Morison's pouch + pelvis. No pericardial effusion. Lung sliding present bilaterally.", impression: "Intra-abdominal haemorrhage; no tamponade or pneumothorax." },
      { modality: "X-ray", title: "Pelvis AP", findings: "Open-book pelvic fracture — pubic symphysis diastasis 3.2 cm, right SI joint widening.", impression: "Unstable pelvic ring injury — binder + urgent fixation." },
      { modality: "X-ray", title: "Chest AP", findings: "Right ribs 5–7 fractures. No pneumothorax visible supine. No mediastinal widening.", impression: "Chest wall injury; low threshold for repeat imaging." },
    ],
    ecg: { interpretation: "Sinus tachycardia with low-voltage complexes consistent with hypovolaemia. No ischaemic changes.", rhythm: "Sinus tachycardia", details: ["Rate 138 bpm", "Low-voltage limb leads", "No ST changes"] },
    criticalActions: [
      "Catastrophic haemorrhage control first (binder, pressure, splints)",
      "Activate massive transfusion protocol early (1:1:1)",
      "Tranexamic acid within 3 hours of injury",
      "Positive FAST + instability → theatre, not CT",
      "Prevent hypothermia; replace calcium during MTP",
      "Structured trauma team leadership with closed-loop communication",
    ],
    keyTreatments: ["Pelvic binder", "Balanced blood products 1:1:1", "TXA", "Damage-control surgery", "Active warming", "Calcium replacement"],
    wrongTurn: { label: "Large-volume crystalloid resuscitation", consequence: "Dilutional coagulopathy, worsening acidosis and hypothermia — the lethal triad" },
    delayedTurn: { label: "CT scan chosen despite haemodynamic instability", consequence: "Deterioration in the scanner ('doughnut of death') → PEA arrest" },
    hiddenComplications: ["Tension pneumothorax develops after positive-pressure ventilation", "Patient is a Jehovah's Witness — family raises transfusion objection", "Second casualty from the same crash arrives mid-scenario"],
    history: ["Previously fit and well", "No regular medications"],
    riskFactors: ["High-speed mechanism", "Prolonged extrication", "Anticoagulant-naïve but coagulopathic from shock"],
    medications: ["None"],
    mcqs: [
      { q: "In damage-control resuscitation, the recommended ratio of plasma : platelets : red cells approaches:", options: ["1:1:1", "1:1:4", "2:1:1 crystalloid-led", "4:1:1"], answer: 0, rationale: "PROPPR supports balanced 1:1:1 transfusion, improving haemostasis and reducing death from exsanguination at 24 h." },
      { q: "Tranexamic acid in trauma should be given:", options: ["Within 3 hours of injury", "Only after CT confirms bleeding", "Within 24 hours", "Only in theatre"], answer: 0, rationale: "CRASH-2: TXA within 3 h reduces mortality; benefit is lost (possibly harmful) beyond 3 h." },
      { q: "A hypotensive blunt-trauma patient with positive FAST should go to:", options: ["CT with contrast", "Theatre for laparotomy", "Interventional radiology first", "Observation with serial exams"], answer: 1, rationale: "Haemodynamic instability plus free fluid mandates operative haemorrhage control; CT is for stable patients." },
      { q: "The 'lethal triad' in trauma comprises:", options: ["Hypothermia, acidosis, coagulopathy", "Hypoxia, hypotension, bradycardia", "Fever, tachycardia, hypertension", "Anaemia, alkalosis, hyperkalaemia"], answer: 0, rationale: "Each element potentiates the others, accelerating bleeding; DCR targets all three simultaneously." },
    ],
    evidence: [
      { source: "ATLS 10th Edition", text: "Primary survey C-ABCDE with catastrophic haemorrhage control; unstable + positive FAST → immediate operative intervention." },
      { source: "CRASH-2 / PROPPR", text: "TXA within 3 h reduces mortality; balanced 1:1:1 product resuscitation improves haemostasis." },
    ],
    validation: [
      { level: "pass", guideline: "ATLS 10e", message: "Primary survey sequencing and FAST decision logic align with ATLS.", evidence: "ATLS 10e, Ch. 1–5" },
      { level: "warning", guideline: "JTS CPG", message: "Military variant should substitute whole-blood availability and TCCC phases for the civilian MTP framing.", evidence: "JTS Damage Control Resuscitation CPG", recommendation: "Enable the military-medicine variant toggle if used for combat-casualty training." },
    ],
    dialogue: [
      { speaker: "Patient", line: "My belly… please… it hurts so much… am I dying?" },
      { speaker: "Paramedic (handover)", line: "Motorcycle versus car, 70 kph, 40-minute extrication. One unit O-neg en route, binder's on — might've slipped." },
      { speaker: "Family member", line: "That's my son! Let me through — somebody tell me what's happening!" },
    ],
  },
  {
    id: "stroke",
    name: "Acute Ischaemic Stroke",
    aliases: ["stroke", "cva", "tia", "ischemic stroke", "hemiparesis"],
    specialties: ["Emergency Medicine", "Neurology", "EMS"],
    pathophys:
      "Thromboembolic occlusion of a cerebral artery. The infarct core is surrounded by salvageable penumbra whose survival is measured in minutes — 1.9 million neurons die per minute. Thrombolysis (<4.5 h) and thrombectomy (large-vessel occlusion) are exquisitely time-dependent.",
    chief: "(Dysarthric) My arm won't… work. Words feel… stuck.",
    presenting:
      "Sudden right-sided weakness and slurred speech during breakfast, witnessed by spouse 40 minutes ago. Known atrial fibrillation — anticoagulation self-discontinued last month.",
    baseline: v({ hr: 8, sbp: 42, dbp: 18, rr: 2, spo2: -1, pain: 1, gcs: -2 }),
    rhythm0: "Atrial fibrillation",
    phases: [
      { at: 0, title: "Patient arrives — code stroke?", description: "FAST-positive: facial droop, right arm drift, dysarthria. Onset 40 min ago.", type: "arrival", mod: v({}), instructorNote: "Code-stroke activation and 'last known well' documentation within 5 minutes." },
      { at: 0.18, title: "NIHSS and glucose", description: "NIHSS 14. Glucose 6.2 — mimic excluded. BP 188/98.", type: "assessment", mod: v({ sbp: 4 }), instructorNote: "Glucose is the mandatory mimic screen. Probe thrombolysis contraindication checklist." },
      { at: 0.38, title: "CT decision point", description: "Non-contrast CT: no haemorrhage, hyperdense left MCA sign. CTA confirms M1 occlusion.", type: "assessment", mod: v({ hr: 2, sbp: 6 }), instructorNote: "Eligible for thrombolysis AND thrombectomy referral — expect both to be verbalised." },
      { at: 0.55, title: "Critical event — neurological deterioration", description: "NIHSS climbs to 18; new gaze deviation. BP 202/104 — above lysis threshold.", type: "critical", mod: v({ hr: 6, sbp: 14, dbp: 8, gcs: -3, rr: 2 }), instructorNote: "BP must be lowered below 185/110 before alteplase — labetalol 10–20 mg IV. Test this sequence." },
      { at: 0.75, title: "Thrombolysis running", description: "Alteplase bolus + infusion started at 72 minutes from onset. Neuro obs q15min.", type: "intervention", mod: v({ hr: 2, sbp: -18, dbp: -8, gcs: 1 }), instructorNote: "Monitor for angioedema and haemorrhagic transformation cues." },
      { at: 1, title: "Transfer for thrombectomy", description: "Improving to NIHSS 11. SBAR referral to comprehensive stroke centre accepted.", type: "recovery", mod: v({ sbp: -24, dbp: -10, gcs: 1 }), instructorNote: "Debrief door-to-needle time vs 60-minute target." },
    ],
    labs: [
      { name: "Chemistry", results: [
        { name: "Glucose", value: "112", unit: "mg/dL", ref: "70–110", flag: "H" },
        { name: "Creatinine", value: "1.0", unit: "mg/dL", ref: "0.6–1.2" },
      ]},
      { name: "Coagulation", results: [
        { name: "INR", value: "1.1", unit: "", ref: "0.9–1.1" },
        { name: "aPTT", value: "29", unit: "s", ref: "25–35" },
        { name: "Platelets", value: "234", unit: "×10⁹/L", ref: "150–400" },
      ]},
    ],
    imaging: [
      { modality: "CT", title: "Non-contrast head CT", findings: "No intracranial haemorrhage. Hyperdense left MCA sign. Subtle loss of insular ribbon. ASPECTS 8.", impression: "Early left MCA-territory ischaemia; no haemorrhage — lysis not contraindicated." },
      { modality: "CT", title: "CT angiogram", findings: "Abrupt cut-off left M1 segment with distal collateralisation.", impression: "Left M1 large-vessel occlusion — thrombectomy candidate." },
    ],
    ecg: { interpretation: "Atrial fibrillation, rate 92, no acute ischaemia — likely cardioembolic source.", rhythm: "Atrial fibrillation", details: ["Irregularly irregular", "No P waves", "Rate 88–96", "No ST changes"] },
    criticalActions: [
      "Code-stroke activation and accurate 'last known well' time",
      "Capillary glucose to exclude hypoglycaemic mimic",
      "Non-contrast CT interpreted within 25 minutes",
      "NIHSS performed and documented",
      "BP below 185/110 before thrombolysis",
      "Door-to-needle ≤ 60 minutes; simultaneous thrombectomy referral for LVO",
    ],
    keyTreatments: ["Alteplase / tenecteplase", "Labetalol for BP control", "Mechanical thrombectomy referral", "Swallow screen before oral intake"],
    wrongTurn: { label: "Aspirin given before CT excludes haemorrhage", consequence: "Catastrophic if haemorrhagic — scenario branches to ICH management" },
    delayedTurn: { label: "Waiting for full lab panel before lysis decision", consequence: "Window expires; penumbra lost; NIHSS worsens irreversibly" },
    hiddenComplications: ["Orolingual angioedema during alteplase infusion", "Spouse reveals recent GI bleed — eligibility challenge", "Haemorrhagic transformation: sudden GCS drop post-lysis"],
    history: ["Atrial fibrillation — apixaban self-discontinued", "Hypertension", "Type 2 diabetes"],
    riskFactors: ["AF off anticoagulation", "Hypertension", "Diabetes", "Age"],
    medications: ["Apixaban 5 mg BD (stopped 4 weeks ago)", "Ramipril 5 mg OD", "Metformin 500 mg BD"],
    mcqs: [
      { q: "Maximum BP before IV thrombolysis can proceed:", options: ["185/110", "220/120", "160/90", "200/100"], answer: 0, rationale: "AHA/ASA: BP must be < 185/110 before alteplase and maintained < 180/105 for 24 h after." },
      { q: "The standard IV thrombolysis window from symptom onset is:", options: ["3 hours", "4.5 hours", "6 hours", "12 hours"], answer: 1, rationale: "Alteplase is licensed to 4.5 h in eligible patients; selected patients qualify later via perfusion imaging." },
      { q: "First bedside test for any suspected stroke:", options: ["Capillary glucose", "ECG", "Troponin", "Chest X-ray"], answer: 0, rationale: "Hypoglycaemia is the classic stroke mimic and must be excluded immediately." },
      { q: "Door-to-needle target for thrombolysis:", options: ["≤ 60 minutes", "≤ 3 hours", "≤ 90 minutes", "≤ 30 minutes"], answer: 0, rationale: "AHA/ASA target ≤ 60 min (ideal ≤ 45); every 15-minute reduction improves odds of independent ambulation." },
    ],
    evidence: [
      { source: "AHA/ASA Stroke 2019", text: "Alteplase ≤4.5 h with BP <185/110; thrombectomy ≤24 h in selected LVO; door-to-needle ≤60 min." },
      { source: "DAWN / DEFUSE-3", text: "Perfusion-based selection extends thrombectomy to 24 h with dramatic NNT of 2–3 for functional independence." },
    ],
    validation: [
      { level: "pass", guideline: "AHA/ASA 2019", message: "BP threshold, lysis window and thrombectomy referral logic all current.", evidence: "AHA/ASA 2019 §3" },
      { level: "warning", guideline: "Local pathway", message: "Tenecteplase is replacing alteplase in many networks — confirm which lytic your centre stocks and adjust the script.", evidence: "AcT trial 2022", recommendation: "Parameterise the lytic agent in the scenario script." },
    ],
    dialogue: [
      { speaker: "Patient", line: "(slurred) Wh… why can't I… say it right… my arm…" },
      { speaker: "Spouse", line: "He was fine at breakfast, then his face just… dropped. It was 8:40 — I looked at the clock." },
      { speaker: "Spouse", line: "He stopped his blood thinner last month. Said it made him bruise. Is this because of that?" },
    ],
  },
  {
    id: "asthma",
    name: "Severe Asthma / Status Asthmaticus",
    aliases: ["asthma", "status asthmaticus", "bronchospasm", "wheeze", "respiratory failure"],
    specialties: ["Emergency Medicine", "Pediatrics", "PICU", "EMS"],
    pathophys:
      "Airway smooth-muscle constriction, mucosal oedema and mucus plugging cause expiratory flow limitation and dynamic hyperinflation. Rising pCO₂ in an asthmatic is not reassuring — a 'normalising' gas signals exhaustion and impending arrest.",
    chief: "(Between breaths) Can't… get… air… inhaler's… not… working…",
    presenting:
      "Six hours of progressive wheeze and breathlessness despite repeated salbutamol at home. Speaking in single words. Recent viral illness, ran out of preventer inhaler two weeks ago.",
    baseline: v({ hr: 32, sbp: 6, rr: 16, spo2: -8, pain: 2, capRefill: 0.5 }),
    rhythm0: "Sinus tachycardia",
    phases: [
      { at: 0, title: "Patient arrives", description: "Tripoding, accessory-muscle use, widespread wheeze, single-word speech.", type: "arrival", mod: v({}), instructorNote: "Severity grading: life-threatening features checklist (silent chest, cyanosis, exhaustion, SpO₂ <92%)." },
      { at: 0.2, title: "First-line bronchodilators", description: "Back-to-back salbutamol + ipratropium nebulisers, steroids ordered.", type: "intervention", mod: v({ hr: 8, rr: -2, spo2: 2 }), instructorNote: "Salbutamol tachycardia is expected — do not let learners treat the HR." },
      { at: 0.42, title: "Deterioration — quiet chest", description: "Wheeze fading… because air entry is failing. Patient drowsy, RR falling.", type: "deterioration", mod: v({ hr: 12, rr: 4, spo2: -8, gcs: -2 }), instructorNote: "The trap: quieter chest misread as improvement. Probe interpretation explicitly." },
      { at: 0.58, title: "Critical event — exhaustion", description: "pCO₂ now 58 and rising, patient obtunded. Peri-arrest respiratory failure.", type: "critical", mod: v({ hr: 16, rr: -6, spo2: -14, gcs: -5 }), rhythm: "Sinus tachycardia → bradycardia pre-arrest", instructorNote: "IV magnesium 2 g, senior/anaesthetics call, prepare for RSI with ketamine. If intubated: vent settings low rate, long expiratory time, permissive hypercapnia." },
      { at: 0.78, title: "Response — magnesium and NIV/RSI decision", description: "Slow improvement in air entry with aggressive therapy; team manages ventilator or averts intubation.", type: "intervention", mod: v({ hr: 10, rr: 2, spo2: -5, gcs: -2 }), instructorNote: "If intubated, inject a ventilator-alarm event: breath stacking → disconnect and decompress." },
      { at: 1, title: "Stabilised for ICU", description: "SpO₂ holding, gas trending better. Handover to ICU with clear escalation plan.", type: "recovery", mod: v({ hr: 6, rr: 4, spo2: -3 }), instructorNote: "Debrief the 'silent chest' recognition moment as the scenario's hinge." },
    ],
    labs: [
      { name: "ABG (on arrival)", results: [
        { name: "pH", value: "7.44", unit: "", ref: "7.35–7.45" },
        { name: "pCO₂", value: "34", unit: "mmHg", ref: "35–45", flag: "L" },
        { name: "pO₂", value: "62", unit: "mmHg", ref: "80–100", flag: "L" },
      ]},
      { name: "ABG (deterioration)", results: [
        { name: "pH", value: "7.28", unit: "", ref: "7.35–7.45", flag: "L" },
        { name: "pCO₂", value: "58", unit: "mmHg", ref: "35–45", flag: "C" },
        { name: "pO₂", value: "58", unit: "mmHg", ref: "80–100", flag: "C" },
      ]},
      { name: "Chemistry", results: [
        { name: "Potassium", value: "3.1", unit: "mmol/L", ref: "3.5–5.0", flag: "L" },
        { name: "Glucose", value: "9.8", unit: "mmol/L", ref: "4–7.8", flag: "H" },
      ]},
    ],
    imaging: [
      { modality: "Chest X-ray", title: "PA chest", findings: "Hyperinflated lung fields, flattened diaphragms. No pneumothorax, no consolidation.", impression: "Consistent with severe airflow obstruction; barotrauma screen negative." },
    ],
    ecg: { interpretation: "Sinus tachycardia; salbutamol-related. Watch for hypokalaemia-driven ectopy.", rhythm: "Sinus tachycardia", details: ["Rate 134", "No ischaemia", "Flattened T waves with K⁺ 3.1"] },
    criticalActions: [
      "Grade severity using life-threatening features checklist",
      "Back-to-back salbutamol + ipratropium, early systemic steroids",
      "Recognise the silent chest as pre-arrest, not improvement",
      "IV magnesium sulfate 2 g for life-threatening features",
      "Early senior/anaesthetic escalation before exhaustion",
      "If ventilated: low rate, prolonged expiration, permissive hypercapnia",
    ],
    keyTreatments: ["Salbutamol back-to-back", "Ipratropium", "Systemic corticosteroids", "IV magnesium", "Ketamine RSI if failing"],
    wrongTurn: { label: "Quiet chest interpreted as improvement — therapy de-escalated", consequence: "Respiratory arrest within minutes" },
    delayedTurn: { label: "Anaesthetics called only after obtundation", consequence: "Crash intubation, profound desaturation, post-intubation hypotension" },
    hiddenComplications: ["Tension pneumothorax after intubation (breath stacking)", "Post-intubation hypotension from hyperinflation — needs disconnect + fluids", "Hypokalaemia-induced arrhythmia from repeated salbutamol"],
    history: ["Asthma since childhood — one previous ICU admission", "Preventer inhaler ran out 2 weeks ago", "Hay fever"],
    riskFactors: ["Previous ICU admission for asthma", "Poor preventer adherence", "Recent viral illness"],
    medications: ["Salbutamol MDI PRN", "Beclometasone (lapsed)"],
    mcqs: [
      { q: "A 'silent chest' in acute severe asthma indicates:", options: ["Improvement — wheeze resolved", "Life-threatening obstruction with minimal air movement", "Pneumothorax has resolved", "Time to discharge"], answer: 1, rationale: "Wheeze requires airflow; its disappearance with worsening distress means catastrophic obstruction and imminent arrest." },
      { q: "A 'normal' pCO₂ (40 mmHg) in an exhausted asthmatic means:", options: ["Reassuring — gas exchange normal", "Impending respiratory failure", "The sample is venous", "Hyperventilation syndrome"], answer: 1, rationale: "Severe asthma should produce hypocapnia from tachypnoea; a normalising pCO₂ signals fatigue and failure of compensation." },
      { q: "The IV adjunct with best evidence in life-threatening asthma:", options: ["Aminophylline first-line", "Magnesium sulfate 2 g", "Adrenaline infusion", "Sodium bicarbonate"], answer: 1, rationale: "IV MgSO₄ relaxes bronchial smooth muscle and is recommended for severe/life-threatening exacerbations." },
      { q: "Best induction agent for RSI in status asthmaticus:", options: ["Propofol", "Ketamine", "Midazolam alone", "Etomidate + morphine"], answer: 1, rationale: "Ketamine provides bronchodilation and preserves haemodynamics, making it the preferred induction agent." },
    ],
    evidence: [
      { source: "BTS/SIGN Asthma 2019", text: "Life-threatening features mandate IV magnesium, senior review and ICU referral; steroids within 1 hour." },
      { source: "GINA 2024", text: "SABA-only management is no longer recommended; exacerbation care includes systematic severity grading and escalation." },
    ],
    validation: [
      { level: "pass", guideline: "BTS/SIGN 2019", message: "Severity grading and magnesium trigger points align with guidance.", evidence: "BTS/SIGN 158" },
      { level: "warning", guideline: "GINA 2024", message: "Discharge planning should include ICS-formoterol maintenance discussion, not SABA-only.", evidence: "GINA 2024 Box 4-4", recommendation: "Add preventer counselling to the recovery-phase objectives." },
    ],
    dialogue: [
      { speaker: "Patient", line: "Please… help… can't… breathe…" },
      { speaker: "Patient's brother", line: "He's been puffing on that blue inhaler all night. It's empty — look." },
      { speaker: "Nurse (confederate)", line: "Doctor — his breathing's gone really quiet. That's better… right?" },
    ],
  },
  {
    id: "arrest",
    name: "Cardiac Arrest (VF → ROSC)",
    aliases: ["cardiac arrest", "vf", "code blue", "cpr", "pea", "asystole", "resuscitation"],
    specialties: ["Emergency Medicine", "ICU", "Cardiology", "EMS", "Military Medicine"],
    pathophys:
      "Sudden cessation of effective circulation, most survivably from VF/pVT. Survival falls 7–10% per minute without defibrillation. High-quality compressions maintain coronary and cerebral perfusion pressure; the H's and T's frame reversible-cause hunting in non-shockable rhythms.",
    chief: "(Collapsed — unresponsive on arrival)",
    presenting:
      "Witnessed collapse in the waiting room. Bystander CPR in progress on arrival to resus. No pulse, not breathing. Downtime approximately 3 minutes.",
    baseline: v({ hr: -900, sbp: -900, dbp: -900, rr: -900, spo2: -25, gcs: -12, pain: -10 }),
    rhythm0: "Ventricular fibrillation",
    phases: [
      { at: 0, title: "Arrest confirmed", description: "Unresponsive, apnoeic, pulseless. CPR handover from bystander. Pads on.", type: "arrival", mod: v({}), instructorNote: "Time-to-first-rhythm-check and time-to-first-shock are primary metrics." },
      { at: 0.15, title: "First shock", description: "VF on rhythm check. Shock delivered, compressions resume instantly.", type: "critical", mod: v({}), rhythm: "Ventricular fibrillation", instructorNote: "Watch pre/post-shock pause duration — target <5 s." },
      { at: 0.35, title: "Second cycle — adrenaline", description: "VF persists. Adrenaline 1 mg IV after second shock, amiodarone drawn up.", type: "critical", mod: v({}), rhythm: "Ventricular fibrillation", instructorNote: "ALS algorithm sequencing: adrenaline after 2nd shock (per local protocol), amiodarone 300 mg after 3rd." },
      { at: 0.5, title: "Rhythm change — PEA trap", description: "Organised rhythm on the monitor — but no pulse. Team must call PEA, not ROSC.", type: "complication", mod: v({}), rhythm: "PEA — organised narrow complex, no pulse", instructorNote: "The classic error: stopping CPR for an organised rhythm without a pulse check. H's & T's review." },
      { at: 0.68, title: "Reversible cause found", description: "End-tidal CO₂ jumps; hypovolaemia addressed with fluids; VF returns briefly → third shock.", type: "critical", mod: v({}), rhythm: "VF → shock → organised rhythm", instructorNote: "EtCO₂ >40 mmHg spike is the ROSC herald. Reward its recognition." },
      { at: 0.8, title: "ROSC", description: "Pulse present. BP 92/58, GCS 6. Post-resuscitation phase begins.", type: "recovery", mod: v({ hr: 115, sbp: -28, dbp: -20, rr: -4, spo2: -6, gcs: -8 }), rhythm: "Sinus tachycardia post-ROSC", instructorNote: "Post-ROSC bundle: SpO₂ 94–98%, 12-lead ECG, avoid hypotension, targeted temperature management discussion." },
      { at: 1, title: "Post-arrest handover", description: "12-lead shows anterior STEMI — cath lab activation. SBAR to ICU/cath team.", type: "recovery", mod: v({ hr: 108, sbp: -22, dbp: -16, rr: -2, spo2: -3, gcs: -7 }), instructorNote: "Close the loop: the arrest had a cause. Debrief team roles and CPR quality data." },
    ],
    labs: [
      { name: "ABG (intra-arrest)", results: [
        { name: "pH", value: "7.08", unit: "", ref: "7.35–7.45", flag: "C" },
        { name: "Lactate", value: "9.4", unit: "mmol/L", ref: "0.5–2.0", flag: "C" },
        { name: "Potassium", value: "4.9", unit: "mmol/L", ref: "3.5–5.0" },
      ]},
      { name: "Post-ROSC", results: [
        { name: "hs-Troponin I", value: "890", unit: "ng/L", ref: "<34", flag: "C" },
        { name: "Glucose", value: "198", unit: "mg/dL", ref: "70–110", flag: "H" },
      ]},
    ],
    imaging: [
      { modality: "Ultrasound", title: "Intra-arrest POCUS (pulse check window)", findings: "No pericardial effusion, no RV dilation. Poor global contractility in PEA phase.", impression: "Tamponade and massive PE unlikely; supports primary cardiac cause." },
      { modality: "Chest X-ray", title: "Post-ROSC portable", findings: "ETT 4 cm above carina. No pneumothorax. Mild pulmonary oedema.", impression: "Lines/tubes satisfactory; early post-arrest oedema." },
    ],
    ecg: { interpretation: "Post-ROSC 12-lead: anterior ST elevation — arrest was ischaemic in origin. Cath lab indicated.", rhythm: "VF → PEA → sinus tachycardia", details: ["Initial rhythm VF", "PEA interlude ~4 min", "Post-ROSC anterior STEMI pattern"] },
    criticalActions: [
      "Rhythm check + first shock within 2 minutes",
      "Compression fraction > 80%, pauses < 10 s",
      "Adrenaline and amiodarone at correct algorithm points",
      "Pulse check discipline — PEA correctly identified",
      "H's & T's verbalised and hunted",
      "EtCO₂ used for CPR quality and ROSC detection",
      "Complete post-ROSC bundle including 12-lead ECG",
    ],
    keyTreatments: ["Defibrillation", "High-quality CPR", "Adrenaline 1 mg q3-5min", "Amiodarone 300 mg", "Post-ROSC bundle"],
    wrongTurn: { label: "CPR stopped for organised rhythm without pulse check", consequence: "Untreated PEA — perfusion lost, ROSC window closes" },
    delayedTurn: { label: "First shock delayed beyond 4 minutes (pads/charging confusion)", consequence: "VF degenerates to asystole — survival odds collapse" },
    hiddenComplications: ["Airway device dislodges during a position change", "IV access fails — IO route needed under pressure", "Family member witnesses resuscitation and must be supported"],
    history: ["Hypertension", "High cholesterol", "No known cardiac history"],
    riskFactors: ["Undiagnosed coronary disease", "Smoking history"],
    medications: ["Amlodipine 10 mg OD"],
    mcqs: [
      { q: "Adrenaline dosing in adult cardiac arrest:", options: ["1 mg IV every 3–5 minutes", "0.5 mg IM every 5 minutes", "3 mg IV once", "0.1 mg/kg IV bolus"], answer: 0, rationale: "ALS: adrenaline 1 mg IV/IO every 3–5 minutes (every other 2-minute cycle)." },
      { q: "Amiodarone in refractory VF is given:", options: ["After the 1st shock", "After the 3rd shock, 300 mg IV", "Only post-ROSC", "150 mg before any shock"], answer: 1, rationale: "Amiodarone 300 mg IV after the third shock; a further 150 mg may follow after the fifth." },
      { q: "A sudden rise of EtCO₂ to >40 mmHg during CPR most likely indicates:", options: ["Tube dislodgement", "ROSC", "Hyperventilation", "Equipment error"], answer: 1, rationale: "An abrupt sustained EtCO₂ rise reflects restored pulmonary blood flow — the earliest sign of ROSC." },
      { q: "An organised rhythm appears on the monitor during CPR. Next step:", options: ["Stop CPR — ROSC achieved", "Pulse check at the next scheduled rhythm check; continue CPR", "Immediate shock", "Give atropine"], answer: 1, rationale: "Organised electrical activity without a pulse is PEA. CPR continues; pulse is verified at the rhythm check." },
    ],
    evidence: [
      { source: "AHA ACLS 2020", text: "Compression fraction >80%; shock VF immediately; adrenaline q3–5 min; EtCO₂ monitoring for quality and ROSC." },
      { source: "ERC ALS 2021", text: "Minimise peri-shock pauses; identify reversible causes (4 H's & 4 T's); structured post-resuscitation care." },
    ],
    validation: [
      { level: "pass", guideline: "AHA/ERC ALS", message: "Drug timing, shock sequencing and post-ROSC bundle match 2020/2021 algorithms.", evidence: "AHA 2020 Part 3; ERC 2021 ALS" },
      { level: "warning", guideline: "Local protocol", message: "Adrenaline timing relative to shocks differs between AHA and ERC variants — confirm which algorithm your centre teaches.", evidence: "AHA vs ERC comparison", recommendation: "Select the algorithm variant in scenario settings before publishing." },
    ],
    dialogue: [
      { speaker: "Bystander (handover)", line: "He just dropped — mid-sentence. I started compressions straight away, maybe three minutes ago." },
      { speaker: "Nurse (confederate)", line: "There's a rhythm on the screen — should we stop compressions?" },
      { speaker: "Family member (arrives)", line: "That's my husband — oh God — is his heart… please let me stay, I won't get in the way." },
    ],
  },
];

export function findCondition(query: string): ConditionTemplate {
  const q = query.toLowerCase().trim();
  const hit =
    CONDITIONS.find((c) => c.id === q) ||
    CONDITIONS.find((c) => c.name.toLowerCase() === q) ||
    CONDITIONS.find((c) => c.aliases.some((a) => q.includes(a) || a.includes(q))) ||
    CONDITIONS.find((c) => c.name.toLowerCase().includes(q));
  return hit || CONDITIONS[0];
}

export const CONDITION_SUGGESTIONS = [
  "Sepsis",
  "Myocardial Infarction",
  "Cardiac Arrest",
  "Anaphylaxis",
  "Stroke",
  "Asthma",
  "Trauma / Hemorrhage",
  "Hypovolemia",
  "Respiratory Failure",
  "Burn",
];
