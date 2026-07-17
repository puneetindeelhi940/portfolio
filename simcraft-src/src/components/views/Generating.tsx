"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Check, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { AgentStage, pipelineFor } from "@/lib/engine/agents";

export function Generating() {
  const { pendingInput, finishGeneration, go } = useStore();
  const [stageIdx, setStageIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  const stages = useMemo<AgentStage[]>(
    () => (pendingInput ? pipelineFor(pendingInput.condition, pendingInput.specialty) : []),
    [pendingInput]
  );

  useEffect(() => {
    if (!pendingInput || startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;

    (async () => {
      for (let si = 0; si < stages.length; si++) {
        if (cancelled) return;
        setStageIdx(si);
        setLineIdx(0);
        const st = stages[si];
        const per = st.ms / st.lines.length;
        for (let li = 0; li < st.lines.length; li++) {
          if (cancelled) return;
          setLineIdx(li + 1);
          await new Promise((r) => setTimeout(r, per));
        }
      }
      if (cancelled) return;
      setDone(true);
      await new Promise((r) => setTimeout(r, 700));
      if (cancelled) return;
      const s = finishGeneration();
      go("canvas", s);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingInput]);

  if (!pendingInput) return null;

  const totalMs = stages.reduce((a, s) => a + s.ms, 0);
  const doneMs = stages.slice(0, stageIdx).reduce((a, s) => a + s.ms, 0) + (stages[stageIdx]?.ms || 0) * (lineIdx / (stages[stageIdx]?.lines.length || 1));
  const pct = done ? 100 : Math.min(99, (doneMs / totalMs) * 100);

  return (
    <div className="max-w-[680px] mx-auto px-8 py-10">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 rounded-2xl bg-accent2 mx-auto flex items-center justify-center shadow-lg mb-4"
        >
          {done ? <Check size={22} className="text-white" /> : <Loader2 size={22} className="text-white animate-spin" />}
        </motion.div>
        <h1 className="text-lg font-semibold tracking-tight">
          {done ? "Scenario package ready" : "Generating your scenario"}
        </h1>
        <p className="text-[13px] text-dim mt-1">
          {pendingInput.duration}-min {pendingInput.difficulty.toLowerCase()} · {pendingInput.specialty} · {pendingInput.condition || "custom condition"}
        </p>
        <div className="mt-4 h-1.5 rounded-full bg-surface2 overflow-hidden max-w-sm mx-auto">
          <div className="h-full bg-accent transition-all duration-200 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[11px] text-faint mt-1.5 tabular-nums">{Math.round(pct)}% · agentic pipeline · structured JSON at every stage</div>
      </div>

      <div className="space-y-2">
        {stages.map((st, si) => {
          const state = done || si < stageIdx ? "done" : si === stageIdx ? "active" : "pending";
          return (
            <motion.div
              key={st.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: state === "pending" ? 0.45 : 1, y: 0 }}
              transition={{ delay: si * 0.05 }}
              className={`card px-4 py-3 ${state === "active" ? "border-accent/40" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  state === "done" ? "bg-ok-soft" : state === "active" ? "bg-accent-soft" : "bg-surface2"
                }`}>
                  {state === "done" ? <Check size={14} className="text-ok" /> :
                   state === "active" ? <Loader2 size={14} className="text-accent animate-spin" /> :
                   <Bot size={14} className="text-faint" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-medium">{st.name}</span>
                    <span className="text-[10px] text-faint font-mono uppercase">{st.role}</span>
                  </div>
                </div>
                {state === "done" && <span className="text-[10.5px] text-ok font-mono">✓ complete</span>}
              </div>
              {state === "active" && (
                <div className="mt-2.5 ml-10 space-y-1">
                  {st.lines.slice(0, lineIdx).map((l, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-[11.5px] font-mono text-dim">
                      <span className="text-accent mr-1.5">›</span>{l}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
