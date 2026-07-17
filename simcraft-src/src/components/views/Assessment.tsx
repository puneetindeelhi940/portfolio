"use client";

import React, { useState } from "react";
import { Check, ListChecks } from "lucide-react";
import { useStore } from "@/lib/store";
import { ScenarioHeader } from "../ScenarioHeader";
import { Badge, Tabs } from "../ui";

export function Assessment() {
  const { current } = useStore();
  const s = current!;
  const a = s.assessment;
  const [tab, setTab] = useState("mcq");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  return (
    <div>
      <ScenarioHeader s={s} title={s.title} sub="Assessment package — auto-generated, fully editable" />
      <div className="max-w-[900px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2"><ListChecks size={18} className="text-accent"/> Assessment Builder</h1>
          <Badge tone="accent">Pass threshold {a.passThreshold}%</Badge>
        </div>
        <p className="text-[13px] text-dim mb-5">MCQs, OSCE checklist, critical actions and a 5-domain rubric — each item traceable to a learning objective.</p>

        <Tabs
          tabs={[
            { id: "mcq", label: "MCQs", count: a.mcqs.length },
            { id: "osce", label: "OSCE Checklist", count: a.osce.length },
            { id: "critical", label: "Critical Actions", count: a.criticalActions.length },
            { id: "rubric", label: "Competency Rubric" },
            { id: "reflection", label: "Reflection" },
          ]}
          active={tab} onChange={setTab}
        />

        {tab === "mcq" && (
          <div className="space-y-4">
            {a.mcqs.map((m, i) => (
              <div key={i} className="card p-5">
                <div className="text-[13.5px] font-medium leading-relaxed mb-3"><span className="text-faint mr-2">Q{i + 1}.</span>{m.q}</div>
                <div className="space-y-1.5">
                  {m.options.map((o, j) => {
                    const isAns = j === m.answer;
                    const show = revealed.has(i);
                    return (
                      <button
                        key={j}
                        onClick={() => setRevealed((r) => new Set(r).add(i))}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-left text-[13px] transition-all cursor-pointer ${
                          show && isAns ? "border-ok bg-ok-soft text-ok font-medium" : "border-line bg-surface2 text-dim hover:border-line2"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-line2 flex items-center justify-center text-[10px] shrink-0">
                          {show && isAns ? <Check size={11} /> : String.fromCharCode(65 + j)}
                        </span>
                        {o}
                      </button>
                    );
                  })}
                </div>
                {revealed.has(i) && (
                  <div className="mt-3 px-3.5 py-2.5 rounded-lg bg-surface2 text-[12.5px] text-dim leading-relaxed">
                    <span className="font-semibold text-ink">Rationale · </span>{m.rationale}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "osce" && (
          <div className="card divide-y divide-line">
            {a.osce.map((o, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <span className="text-[11px] font-mono text-faint w-6">{i + 1}.</span>
                <span className="text-[13px] flex-1">{o.text}</span>
                {o.critical ? <Badge tone="danger">critical</Badge> : <Badge>scored</Badge>}
                <div className="flex gap-1.5 text-[11px] text-faint">
                  <span className="px-2 py-0.5 rounded border border-line">Done</span>
                  <span className="px-2 py-0.5 rounded border border-line">Partial</span>
                  <span className="px-2 py-0.5 rounded border border-line">Not done</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "critical" && (
          <div className="space-y-2">
            <div className="px-4 py-3 rounded-lg bg-danger-soft text-[12.5px] text-danger leading-relaxed">
              Missing any critical action results in an automatic &ldquo;requires remediation&rdquo; outcome regardless of total score.
            </div>
            {a.criticalActions.map((c, i) => (
              <div key={i} className="card px-4 py-3 flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-danger-soft text-danger text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-[13px]">{c.text}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "rubric" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[640px]">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 font-semibold text-dim text-[11px] uppercase tracking-wider">Domain</th>
                  {["1 · Novice", "2 · Developing", "3 · Competent", "4 · Exemplary"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-dim text-[11px] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {a.rubric.map((r) => (
                  <tr key={r.domain}>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{r.domain}</td>
                    {r.levels.map((l, i) => <td key={i} className="px-4 py-3 text-dim leading-snug">{l}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "reflection" && (
          <div className="space-y-2.5">
            {a.reflection.map((q, i) => (
              <div key={i} className="card px-4 py-3.5 text-[13px] leading-relaxed flex gap-3">
                <span className="text-accent font-semibold shrink-0">{i + 1}.</span>{q}
              </div>
            ))}
            <div className="text-[12px] text-faint pt-1">Learners answer these individually before the group debrief — responses feed the debrief builder.</div>
          </div>
        )}
      </div>
    </div>
  );
}
