"use client";

import React, { useState } from "react";
import { CheckCircle2, RefreshCcw, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { ScenarioHeader } from "../ScenarioHeader";
import { Badge, Button } from "../ui";

export function Validation() {
  const { current } = useStore();
  const s = current!;
  const [rescanning, setRescanning] = useState(false);

  const passes = s.validation.filter((v) => v.level === "pass");
  const warns = s.validation.filter((v) => v.level === "warning");
  const conflicts = s.validation.filter((v) => v.level === "conflict");
  const score = Math.max(0, 100 - warns.length * 5 - conflicts.length * 15);

  const rescan = () => {
    setRescanning(true);
    setTimeout(() => setRescanning(false), 1600);
  };

  return (
    <div>
      <ScenarioHeader s={s} title={s.title} sub="AI validation against AHA · ERC · specialty guidelines and local protocol" />
      <div className="max-w-[860px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2"><ShieldCheck size={18} className="text-accent"/> AI Validation</h1>
            <p className="text-[13px] text-dim mt-0.5">Every clinical claim is cross-checked before publishing.</p>
          </div>
          <Button icon={RefreshCcw} onClick={rescan} disabled={rescanning}>{rescanning ? "Re-validating…" : "Re-run validation"}</Button>
        </div>

        {/* Score */}
        <div className="card p-5 mb-5 flex items-center gap-6 flex-wrap">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--line)" strokeWidth="7" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={score >= 85 ? "var(--ok)" : score >= 70 ? "var(--warn)" : "var(--danger)"}
                strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 213.6} 213.6`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[18px] font-semibold tabular-nums">{rescanning ? "…" : score}</div>
          </div>
          <div className="flex-1 min-w-[220px]">
            <div className="text-[14px] font-semibold">{score >= 85 ? "Ready to publish" : score >= 70 ? "Publishable with advisories" : "Resolve conflicts before publishing"}</div>
            <div className="text-[12.5px] text-dim mt-1 leading-relaxed">
              Checked against AHA/ERC algorithms, specialty guidelines and your hospital protocol pack (v2026.2). {conflicts.length > 0 ? "Conflicts block auto-publish until acknowledged." : "No blocking conflicts found."}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge tone="ok"><CheckCircle2 size={11}/> {passes.length} pass</Badge>
            <Badge tone="warn"><TriangleAlert size={11}/> {warns.length} warnings</Badge>
            <Badge tone="danger"><XCircle size={11}/> {conflicts.length} conflicts</Badge>
          </div>
        </div>

        <div className="space-y-3">
          {[...conflicts, ...warns, ...passes].map((v, i) => (
            <div key={i} className={`card p-4 ${rescanning ? "opacity-50" : ""} transition-opacity`}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  {v.level === "pass" ? <CheckCircle2 size={16} className="text-ok" /> :
                   v.level === "warning" ? <TriangleAlert size={16} className="text-warn" /> :
                   <XCircle size={16} className="text-danger" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium">{v.message}</span>
                  </div>
                  <div className="text-[11.5px] text-faint mt-1">
                    <Badge tone="cyan" className="mr-2">{v.guideline}</Badge>
                    Evidence: {v.evidence}
                  </div>
                  {v.recommendation && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-surface2 text-[12.5px] text-dim leading-relaxed">
                      <span className="font-semibold text-ink">Recommendation · </span>{v.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
