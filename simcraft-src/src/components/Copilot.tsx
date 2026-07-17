"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkles, X, CornerDownLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { COPILOT_ACTIONS } from "@/lib/engine/agents";
import { explainDisease } from "@/lib/engine/generator";
import { findCondition } from "@/lib/engine/conditions";
import { Scenario } from "@/lib/types";

interface Msg { role: "user" | "ai"; text: string; applied?: string }

function respond(actionId: string, s: Scenario): { text: string; apply?: (s: Scenario) => Scenario; applied?: string } {
  const t = findCondition(s.input.condition);
  switch (actionId) {
    case "realism":
      return {
        text: `To deepen realism I've added sensory texture to the presentation: the patient now has ${t.id === "sepsis" ? "mottled knees and a damp, clammy brow; the room smells faintly of sweat" : "environment cues (torn clothing, monitor artefacts, an anxious bystander)"}. I also staggered the vitals so no two parameters change in lock-step — real deterioration is asynchronous.`,
        applied: "Presentation notes enriched",
        apply: (sc) => ({ ...sc, instructorNotes: [...sc.instructorNotes, "Realism layer: stagger vitals changes by 30–60 s; brief the confederate on sensory cues (clammy skin, anxious affect)."] }),
      };
    case "harder": {
      return {
        text: "Difficulty increased: I tightened the deterioration window by ~20%, muted the early cues (the first BP drop is now within normal-variation range), and armed the first hidden complication. Learners will need to trend, not react.",
        applied: "Hidden complication armed · cues muted",
        apply: (sc) => ({
          ...sc,
          hiddenPrompts: [...sc.hiddenPrompts, `Escalation armed: ${t.hiddenComplications[1] || t.hiddenComplications[0]}`],
          instructorNotes: [...sc.instructorNotes, "Difficulty+: compress the deterioration window by 20%; do not verbalise cue changes."],
        }),
      };
    }
    case "easier":
      return {
        text: "Difficulty reduced: the confederate nurse will now verbalise the first abnormal vital aloud, the critical event is delayed by two minutes, and I added a visible prompt card for the key algorithm. Good for first-exposure cohorts.",
        applied: "Cueing increased · event delayed",
        apply: (sc) => ({ ...sc, instructorNotes: [...sc.instructorNotes, "Difficulty−: confederate verbalises first abnormal vital; delay critical event by 2 min; algorithm card visible."] }),
      };
    case "instructor-notes":
      return { text: `Instructor pack refreshed. Key beats:\n\n${s.instructorNotes.slice(0, 4).map((n) => `• ${n}`).join("\n")}\n\nFull notes are on the Instructor View.` };
    case "student-notes":
      return { text: `Pre-brief for learners:\n\n"${s.studentBrief}"\n\nThis withholds the diagnosis and the critical event — learners receive only what a real team would know at the door.` };
    case "labs":
      return { text: `Lab set generated (${s.labs.map((l) => l.name).join(", ")}). Flags: ${s.labs.flatMap((l) => l.results.filter((r) => r.flag === "C").map((r) => `${r.name} ${r.value}${r.unit}`)).join(", ") || "none critical"}. View them on the Instructor View or Export tabs.` };
    case "imaging":
      return { text: s.imaging.map((i) => `${i.modality} — ${i.title}\nFindings: ${i.findings}\nImpression: ${i.impression}`).join("\n\n") };
    case "ecg":
      return { text: `ECG interpretation:\n${s.ecg.interpretation}\n\n${s.ecg.details.map((d) => `• ${d}`).join("\n")}` };
    case "dialogue":
      return { text: `Scripted dialogue:\n\n${s.dialogue.map((d) => `${d.speaker}: "${d.line}"`).join("\n\n")}` };
    case "family":
      return {
        text: "Added a family member: they arrive at the midpoint, anxious and asking rapid questions. Their role tests communication under load — they hold one useful piece of collateral history the team must elicit.",
        applied: "Family member event added",
        apply: (sc) => {
          const mid = Math.round(sc.input.duration * 0.5);
          const ev = { id: `ev-fam-${Date.now()}`, tMin: mid, title: "Family member arrives", description: "Anxious relative enters with questions — and one key piece of collateral history.", type: "family" as const, vitals: sc.timeline[Math.floor(sc.timeline.length / 2)].vitals, instructorNote: "Family holds collateral history (allergy / anticoagulant / last meal). Release it only if asked directly." };
          return { ...sc, timeline: [...sc.timeline, ev].sort((a, b) => a.tMin - b.tMin) };
        },
      };
    case "ethical":
      return {
        text: "Ethical conflict injected: midway through, a documented treatment-refusal surfaces (advance directive / religious objection to a key therapy). The team must balance autonomy against urgency and involve the senior decision-maker.",
        applied: "Ethical conflict added to hidden prompts",
        apply: (sc) => ({ ...sc, hiddenPrompts: [...sc.hiddenPrompts, "Ethical conflict: a documented refusal (advance directive / religious objection) surfaces mid-treatment. Assess autonomy-vs-urgency reasoning and escalation."] }),
      };
    case "team-conflict":
      return {
        text: "Team conflict scripted: the confederate senior disagrees loudly with the leader's plan at the decision point, citing an outdated protocol. Tests graded assertiveness and closed-loop conflict resolution (PACE model).",
        applied: "Confederate conflict beat added",
        apply: (sc) => ({ ...sc, hiddenPrompts: [...sc.hiddenPrompts, "Team conflict: confederate senior challenges the plan with an outdated protocol at the decision point. Expect PACE-graded assertiveness."] }),
      };
    case "hidden-event":
      return {
        text: `Hidden event armed: "${t.hiddenComplications[0]}". It's instructor-triggered from the Instructor View — fire it only if the team is coping well.`,
        applied: "Hidden event armed",
        apply: (sc) => ({ ...sc, hiddenPrompts: [...sc.hiddenPrompts, `Hidden event armed: ${t.hiddenComplications[0]}`] }),
      };
    case "comm-failure":
      return {
        text: "Communication failure injected: at the critical event, the lab phone rings with a wrong-patient result, and one verbal order will be deliberately misheard by the confederate. Tests read-back discipline.",
        applied: "Communication failure beat added",
        apply: (sc) => ({ ...sc, hiddenPrompts: [...sc.hiddenPrompts, "Comm failure: wrong-patient lab call + deliberately misheard verbal order at the critical event. Assess read-back and order verification."] }),
      };
    case "explain":
      return { text: `${t.name} — pathophysiology:\n\n${explainDisease(s.input.condition)}` };
    case "evidence":
      return { text: `Evidence base:\n\n${t.evidence.map((e) => `${e.source}\n${e.text}`).join("\n\n")}` };
    default:
      return { text: "Done." };
  }
}

export function Copilot() {
  const { current, copilotOpen, setCopilotOpen, updateScenario } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [msgs, streaming]);

  if (!copilotOpen || !current) return null;

  const run = (label: string, actionId?: string) => {
    if (streaming) return;
    setMsgs((m) => [...m, { role: "user", text: label }]);
    const res = actionId
      ? respond(actionId, current)
      : { text: `Here's my take on "${label}": for this ${current.input.difficulty.toLowerCase()} ${findCondition(current.input.condition).name.toLowerCase()} scenario I'd fold that in as an instructor-triggered beat rather than a scripted one — it keeps the timeline intact and gives you a live lever. I've noted it in the hidden prompts.`, applied: "Noted in hidden prompts", apply: (sc: Scenario) => ({ ...sc, hiddenPrompts: [...sc.hiddenPrompts, `Educator request: ${label}`] }) };
    // stream the response
    let i = 0;
    setStreaming("");
    const tick = () => {
      i += 3 + Math.floor(Math.random() * 4);
      if (i >= res.text.length) {
        setStreaming(null);
        setMsgs((m) => [...m, { role: "ai", text: res.text, applied: res.applied }]);
        if (res.apply) updateScenario(res.apply(current));
      } else {
        setStreaming(res.text.slice(0, i));
        setTimeout(tick, 16);
      }
    };
    setTimeout(tick, 350);
  };

  const groups = ["Refine", "Generate", "Complicate", "Understand"];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[360px] bg-bg2 border-l border-line flex flex-col shadow-2xl">
      <div className="h-14 px-4 flex items-center justify-between border-b border-line shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent-soft flex items-center justify-center">
            <Sparkles size={13} className="text-accent" />
          </div>
          <span className="text-[13px] font-semibold">AI Copilot</span>
          <span className="text-[10px] text-faint px-1.5 py-0.5 rounded bg-surface2 border border-line font-mono">7-agent</span>
        </div>
        <button onClick={() => setCopilotOpen(false)} className="p-1.5 rounded-md text-dim hover:text-ink hover:bg-surface2 cursor-pointer" aria-label="Close copilot">
          <X size={15} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && !streaming && (
          <div className="text-[12.5px] text-dim leading-relaxed">
            I&apos;m tuned to <span className="text-ink font-medium">{current.title}</span>. Use the quick actions below, or describe any change — a new complication, a different family dynamic, a tougher decision point.
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className={`rounded-xl px-3 py-2 text-[12.5px] leading-relaxed whitespace-pre-wrap max-w-[92%] ${
              m.role === "user" ? "bg-accent2 text-white" : "bg-surface border border-line text-ink"
            }`}>
              {m.text}
              {m.applied && (
                <div className="mt-2 pt-2 border-t border-line text-[11px] text-ok flex items-center gap-1">✓ Applied — {m.applied}</div>
              )}
            </div>
          </div>
        ))}
        {streaming !== null && (
          <div className="rounded-xl px-3 py-2 text-[12.5px] leading-relaxed whitespace-pre-wrap bg-surface border border-line text-ink max-w-[92%]">
            {streaming}<span className="blink">▍</span>
          </div>
        )}
      </div>

      <div className="border-t border-line p-3 space-y-2.5 shrink-0 max-h-[46%] overflow-y-auto">
        {groups.map((g) => (
          <div key={g}>
            <div className="text-[10px] font-semibold text-faint uppercase tracking-widest mb-1.5">{g}</div>
            <div className="flex flex-wrap gap-1.5">
              {COPILOT_ACTIONS.filter((a) => a.group === g).map((a) => (
                <button
                  key={a.id}
                  onClick={() => run(a.label, a.id)}
                  disabled={streaming !== null}
                  className="px-2.5 h-7 rounded-md bg-surface border border-line text-[11.5px] text-dim hover:text-ink hover:border-line2 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) { run(input.trim()); setInput(""); } }}
            placeholder="Ask for any change…"
            className="flex-1 h-9 px-3 rounded-lg bg-surface border border-line text-[12.5px] outline-none focus:border-accent placeholder:text-faint"
          />
          <button
            onClick={() => { if (input.trim()) { run(input.trim()); setInput(""); } }}
            className="h-9 w-9 rounded-lg bg-accent2 text-white flex items-center justify-center hover:brightness-110 cursor-pointer"
            aria-label="Send"
          >
            <CornerDownLeft size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
