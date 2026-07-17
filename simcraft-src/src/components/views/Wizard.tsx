"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, ArrowLeft, ArrowRight, Baby, Check, HeartPulse, Search, Sparkles, Stethoscope, User, Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Difficulty, Duration, PatientType, WizardInput } from "@/lib/types";
import { CONDITION_SUGGESTIONS } from "@/lib/engine/conditions";
import { Button } from "../ui";

const SPECIALTIES = ["Emergency Medicine", "Trauma", "Cardiology", "ICU", "NICU", "PICU", "Pediatrics", "Obstetrics", "Military Medicine", "EMS", "Orthopedics", "Burn Unit"];
const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced", "Expert"];
const PATIENT_TYPES: { id: PatientType; icon: typeof User; hint: string }[] = [
  { id: "Adult", icon: User, hint: "18–65 yrs" },
  { id: "Child", icon: Baby, hint: "1–12 yrs" },
  { id: "Infant", icon: Baby, hint: "1–12 months" },
  { id: "Neonate", icon: Baby, hint: "0–28 days" },
  { id: "Pregnant", icon: HeartPulse, hint: "obstetric" },
  { id: "Geriatric", icon: User, hint: "65+ yrs" },
  { id: "Multiple Casualties", icon: Users, hint: "MCI / triage" },
];
const OBJECTIVES = ["Airway Management", "Leadership", "Communication", "CPR", "Medication Safety", "Rapid Assessment", "Critical Thinking", "ECG", "ABCDE"];
const DURATIONS: Duration[] = [15, 30, 45, 60, 90];
const EQUIPMENT = ["Defibrillator", "Ventilator", "IV Pump", "Ultrasound", "ECG", "Crash Cart", "Mannequin", "Airway Kit"];

const STEPS = ["Specialty", "Difficulty", "Patient", "Condition", "Objectives", "Duration", "Equipment", "Brief"];

export function Wizard() {
  const { go, startGeneration } = useStore();
  const [step, setStep] = useState(0);
  const [specialty, setSpecialty] = useState("Emergency Medicine");
  const [difficulty, setDifficulty] = useState<Difficulty>("Intermediate");
  const [patientType, setPatientType] = useState<PatientType>("Adult");
  const [condition, setCondition] = useState("");
  const [conditionQ, setConditionQ] = useState("");
  const [objectives, setObjectives] = useState<string[]>(["Rapid Assessment", "Communication"]);
  const [duration, setDuration] = useState<Duration>(30);
  const [equipment, setEquipment] = useState<string[]>(["Mannequin", "Crash Cart", "IV Pump", "ECG"]);
  const [prompt, setPrompt] = useState("");

  const input: WizardInput = { specialty, difficulty, patientType, condition: condition || conditionQ, objectives, duration, equipment, prompt };
  const canNext =
    step === 3 ? Boolean(condition || conditionQ.trim()) :
    step === 4 ? objectives.length > 0 :
    step === 6 ? equipment.length > 0 : true;

  const filteredConditions = CONDITION_SUGGESTIONS.filter((c) => c.toLowerCase().includes(conditionQ.toLowerCase()));

  const toggle = (arr: string[], set: (a: string[]) => void, item: string) =>
    set(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const diffIdx = DIFFICULTIES.indexOf(difficulty);

  return (
    <div className="max-w-[760px] mx-auto px-8 py-8">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => go("dashboard")} className="text-[12px] text-faint hover:text-ink cursor-pointer flex items-center gap-1"><ArrowLeft size={12}/> Dashboard</button>
      </div>
      <h1 className="text-xl font-semibold tracking-tight mb-1">Create new scenario</h1>
      <p className="text-[13px] text-dim mb-6">Eight quick questions — the AI engine handles everything else.</p>

      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 text-[11px] font-medium cursor-pointer ${i === step ? "text-accent" : i < step ? "text-ok" : "text-faint"}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                i === step ? "border-accent bg-accent-soft" : i < step ? "border-ok bg-ok-soft" : "border-line bg-surface"
              }`}>
                {i < step ? <Check size={10} /> : i + 1}
              </span>
              <span className="hidden md:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-ok" : "bg-line"}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="min-h-[340px]"
        >
          {step === 0 && (
            <StepFrame title="Which clinical specialty?" sub="Sets the environment, team composition and guideline set.">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SPECIALTIES.map((s) => (
                  <ChoiceCard key={s} active={specialty === s} onClick={() => setSpecialty(s)}>
                    <Stethoscope size={15} className={specialty === s ? "text-accent" : "text-faint"} />
                    <span className="text-[13px] font-medium">{s}</span>
                  </ChoiceCard>
                ))}
              </div>
            </StepFrame>
          )}

          {step === 1 && (
            <StepFrame title="How challenging should it be?" sub="Difficulty tunes cue subtlety, time pressure and hidden complications.">
              <div className="card p-6">
                <input
                  type="range" min={0} max={3} step={1} value={diffIdx}
                  onChange={(e) => setDifficulty(DIFFICULTIES[Number(e.target.value)])}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between mt-3">
                  {DIFFICULTIES.map((d, i) => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`text-[12px] cursor-pointer ${i === diffIdx ? "text-accent font-semibold" : "text-faint"}`}>{d}</button>
                  ))}
                </div>
                <div className="mt-5 px-4 py-3 rounded-lg bg-surface2 text-[12.5px] text-dim leading-relaxed">
                  {difficulty === "Beginner" && "Clear cues, generous timing, confederate verbalises key findings. Ideal for first exposure."}
                  {difficulty === "Intermediate" && "Standard cues and timing. One decision point with meaningful branches."}
                  {difficulty === "Advanced" && "Subtle early cues, compressed deterioration, one armed hidden complication."}
                  {difficulty === "Expert" && "Minimal cueing, aggressive time pressure, hidden complication plus a team stressor. For experienced teams."}
                </div>
              </div>
            </StepFrame>
          )}

          {step === 2 && (
            <StepFrame title="Who is the patient?" sub="Physiology, drug dosing and equipment sizing all adapt automatically.">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PATIENT_TYPES.map((p) => (
                  <ChoiceCard key={p.id} active={patientType === p.id} onClick={() => setPatientType(p.id)} vertical>
                    <p.icon size={18} className={patientType === p.id ? "text-accent" : "text-faint"} />
                    <span className="text-[13px] font-medium">{p.id}</span>
                    <span className="text-[10.5px] text-faint">{p.hint}</span>
                  </ChoiceCard>
                ))}
              </div>
            </StepFrame>
          )}

          {step === 3 && (
            <StepFrame title="What's the clinical condition?" sub="Search or pick — each maps to an evidence-based trajectory template.">
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  value={conditionQ}
                  onChange={(e) => { setConditionQ(e.target.value); setCondition(""); }}
                  placeholder="Search any condition — stroke, burn, DKA, postpartum hemorrhage…"
                  className="h-10 w-full pl-9 pr-3 rounded-lg bg-surface border border-line text-[13px] outline-none focus:border-accent placeholder:text-faint"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(conditionQ ? filteredConditions : CONDITION_SUGGESTIONS).map((c) => (
                  <ChoiceCard key={c} active={condition === c} onClick={() => setCondition(c)}>
                    <Activity size={14} className={condition === c ? "text-accent" : "text-faint"} />
                    <span className="text-[13px] font-medium">{c}</span>
                  </ChoiceCard>
                ))}
              </div>
              {conditionQ && filteredConditions.length === 0 && (
                <div className="mt-3 px-4 py-3 rounded-lg bg-accent-soft text-[12.5px] text-accent flex items-center gap-2">
                  <Sparkles size={14} /> &ldquo;{conditionQ}&rdquo; will be generated from the closest clinical trajectory template.
                </div>
              )}
            </StepFrame>
          )}

          {step === 4 && (
            <StepFrame title="Learning objectives" sub="Every objective is mapped to at least two observable, assessable moments.">
              <div className="flex flex-wrap gap-2">
                {OBJECTIVES.map((o) => (
                  <button
                    key={o}
                    onClick={() => toggle(objectives, setObjectives, o)}
                    className={`h-9 px-3.5 rounded-lg border text-[13px] font-medium transition-all cursor-pointer ${
                      objectives.includes(o) ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-dim hover:border-line2"
                    }`}
                  >
                    {objectives.includes(o) && <Check size={12} className="inline mr-1.5 -mt-0.5" />}{o}
                  </button>
                ))}
              </div>
            </StepFrame>
          )}

          {step === 5 && (
            <StepFrame title="Simulation length" sub="The trajectory compresses or expands to fit — critical events keep their relative position.">
              <div className="grid grid-cols-5 gap-2">
                {DURATIONS.map((d) => (
                  <ChoiceCard key={d} active={duration === d} onClick={() => setDuration(d)} vertical>
                    <span className={`text-[20px] font-semibold tabular-nums ${duration === d ? "text-accent" : ""}`}>{d}</span>
                    <span className="text-[10.5px] text-faint">minutes</span>
                  </ChoiceCard>
                ))}
              </div>
            </StepFrame>
          )}

          {step === 6 && (
            <StepFrame title="Available equipment" sub="The validator flags any event that needs equipment you don't have.">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EQUIPMENT.map((eq) => (
                  <button
                    key={eq}
                    onClick={() => toggle(equipment, setEquipment, eq)}
                    className={`h-11 px-3 rounded-lg border text-[12.5px] font-medium transition-all cursor-pointer flex items-center gap-2 ${
                      equipment.includes(eq) ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-dim hover:border-line2"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${equipment.includes(eq) ? "bg-accent2 border-accent2" : "border-line2"}`}>
                      {equipment.includes(eq) && <Check size={10} className="text-white" />}
                    </span>
                    {eq}
                  </button>
                ))}
              </div>
            </StepFrame>
          )}

          {step === 7 && (
            <StepFrame title="Anything else? (optional)" sub="Free-text instructions for the AI — complications, family dynamics, specific drugs, anything.">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={'e.g. "I want one hidden complication" · "add an angry family member" · "the team must discover a medication error"'}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-surface border border-line text-[13px] outline-none focus:border-accent placeholder:text-faint resize-none leading-relaxed"
              />
              <div className="mt-5 card p-4">
                <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-2.5">Generation brief</div>
                <div className="text-[13px] leading-relaxed text-dim">
                  A <span className="text-ink font-medium">{duration}-minute {difficulty.toLowerCase()}</span> scenario in{" "}
                  <span className="text-ink font-medium">{specialty}</span> — <span className="text-ink font-medium">{patientType}</span> patient with{" "}
                  <span className="text-ink font-medium">{condition || conditionQ || "…"}</span>. Objectives:{" "}
                  <span className="text-ink font-medium">{objectives.join(", ")}</span>. Equipment: {equipment.join(", ")}.
                  {prompt && <> Special request: <span className="text-ink font-medium">&ldquo;{prompt}&rdquo;</span></>}
                </div>
              </div>
            </StepFrame>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" onClick={() => (step === 0 ? go("dashboard") : setStep(step - 1))} icon={ArrowLeft}>
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canNext}>
            Continue <ArrowRight size={14} />
          </Button>
        ) : (
          <Button variant="primary" size="lg" icon={Sparkles} onClick={() => startGeneration(input)}>
            Generate scenario
          </Button>
        )}
      </div>
    </div>
  );
}

function StepFrame({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[16px] font-semibold mb-1">{title}</h2>
      <p className="text-[12.5px] text-dim mb-5">{sub}</p>
      {children}
    </div>
  );
}

function ChoiceCard({ active, onClick, children, vertical }: { active: boolean; onClick: () => void; children: React.ReactNode; vertical?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-3 transition-all cursor-pointer flex ${vertical ? "flex-col items-center gap-1 text-center" : "items-center gap-2.5 text-left"} ${
        active ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line2"
      }`}
    >
      {children}
    </button>
  );
}
