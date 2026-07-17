"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, EyeOff, ListChecks, Pause, Play, RotateCcw, Sparkles, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { Vitals } from "@/lib/types";
import { ScenarioHeader } from "../ScenarioHeader";
import { Badge, Button } from "../ui";
import { PatientMonitor } from "../Monitor";

const RHYTHMS = ["Sinus rhythm", "Sinus tachycardia", "Sinus bradycardia", "Atrial fibrillation", "SVT", "Ventricular tachycardia", "Ventricular fibrillation", "PEA — organised, no pulse", "Asystole"];

function lerp(a: number, b: number, f: number) { return a + (b - a) * f; }

export function Instructor() {
  const { current } = useStore();
  const s = current!;
  const durS = s.input.duration * 60;

  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const [overrides, setOverrides] = useState<Partial<Vitals>>({});
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [firedHidden, setFiredHidden] = useState<Set<string>>(new Set());
  const raf = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((x) => Math.min(durS, x + 1)), 1000);
    return () => clearInterval(id);
  }, [running, durS]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const events = s.timeline.filter((e) => !e.hidden);
  const stageIdx = useMemo(() => {
    let idx = 0;
    events.forEach((e, i) => { if (e.tMin * 60 <= t) idx = i; });
    return idx;
  }, [t, events]);
  const stage = events[stageIdx];
  const next = events[stageIdx + 1] || null;

  // interpolate vitals between current and next event for smooth drift
  const liveVitals: Vitals = useMemo(() => {
    const a = stage.vitals;
    const b = next?.vitals || stage.vitals;
    const t0 = stage.tMin * 60, t1 = next ? next.tMin * 60 : durS;
    const f = t1 > t0 ? Math.min(1, (t - t0) / (t1 - t0)) : 0;
    const arrestNow = a.hr === 0;
    const base: Vitals = {
      hr: arrestNow ? 0 : Math.round(lerp(a.hr, b.hr, f)),
      sbp: arrestNow ? 0 : Math.round(lerp(a.sbp, b.sbp, f)),
      dbp: arrestNow ? 0 : Math.round(lerp(a.dbp, b.dbp, f)),
      rr: arrestNow ? 0 : Math.round(lerp(a.rr, b.rr, f)),
      spo2: Math.round(lerp(a.spo2, b.spo2, f)),
      temp: Math.round(lerp(a.temp, b.temp, f) * 10) / 10,
      pain: Math.round(lerp(a.pain, b.pain, f)),
      gcs: Math.round(lerp(a.gcs, b.gcs, f)),
      capRefill: Math.round(lerp(a.capRefill, b.capRefill, f) * 2) / 2,
      rhythm: a.rhythm,
    };
    return { ...base, ...overrides };
  }, [stage, next, t, durS, overrides]);

  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  const jumpTo = (i: number) => { setT(events[i].tMin * 60); setOverrides({}); };

  const slider = (key: keyof Vitals, label: string, min: number, max: number, step = 1) => (
    <div key={key} className="flex items-center gap-2.5">
      <span className="text-[11px] text-dim w-[72px] shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} step={step}
        value={Number(liveVitals[key])}
        onChange={(e) => setOverrides((o) => ({ ...o, [key]: Number(e.target.value) }))}
        className="flex-1 cursor-pointer"
      />
      <span className="text-[12px] font-mono tabular-nums w-11 text-right text-ink">{liveVitals[key]}</span>
    </div>
  );

  const recommendations = [
    t < durS * 0.2 ? "Team is in the assessment window — hold cues, observe role allocation." : null,
    stage.type === "deterioration" ? "Deterioration active: if unnoticed for 60 s, have the confederate verbalise one observation." : null,
    stage.type === "critical" ? "Critical event live. Watch for the scored actions; don't rescue early — this is the learning moment." : null,
    checked.size < 2 && t > durS * 0.5 ? "Fewer than 2 critical actions completed at halfway — consider the de-escalation lever." : null,
    stage.type === "recovery" ? "Move toward closure: prompt an SBAR handover to end on a performance beat." : null,
  ].filter(Boolean) as string[];

  return (
    <div>
      <ScenarioHeader s={s} title={s.title} sub="Instructor control room — learners see only the monitor" />
      <div className="max-w-[1280px] mx-auto px-6 py-5">

        {/* Timer bar */}
        <div className="card px-5 py-3.5 mb-4 flex items-center gap-4 flex-wrap">
          <div className="font-mono text-[28px] font-semibold tabular-nums tracking-tight">
            {mm}:{ss}<span className="text-[13px] text-faint"> / {s.input.duration}:00</span>
          </div>
          <Button size="sm" variant={running ? "default" : "primary"} icon={running ? Pause : Play} onClick={() => setRunning(!running)}>
            {running ? "Pause" : t > 0 ? "Resume" : "Start simulation"}
          </Button>
          <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => { setRunning(false); setT(0); setOverrides({}); setChecked(new Set()); setFiredHidden(new Set()); }}>Reset</Button>
          <div className="flex-1 min-w-[160px]">
            <div className="h-2 rounded-full bg-surface2 overflow-hidden relative">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(t / durS) * 100}%` }} />
              {events.map((e) => (
                <span key={e.id} className="absolute top-0 h-full w-0.5 bg-line2" style={{ left: `${(e.tMin / s.input.duration) * 100}%` }} />
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-faint uppercase tracking-widest font-semibold">Current stage</div>
            <div className="text-[13px] font-medium">{stage.title}</div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.3fr_1fr_1fr] lg:grid-cols-2 gap-4 items-start">
          {/* Col 1: monitor + vitals editor */}
          <div className="space-y-4">
            <PatientMonitor vitals={liveVitals} />
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-faint uppercase tracking-widest">Live vitals editor</span>
                {Object.keys(overrides).length > 0 && (
                  <button onClick={() => setOverrides({})} className="text-[11px] text-accent cursor-pointer hover:underline">Clear overrides ({Object.keys(overrides).length})</button>
                )}
              </div>
              <div className="space-y-2.5">
                {slider("hr", "Heart rate", 0, 220)}
                {slider("sbp", "Systolic BP", 0, 240)}
                {slider("dbp", "Diastolic BP", 0, 140)}
                {slider("rr", "Resp rate", 0, 60)}
                {slider("spo2", "SpO₂", 40, 100)}
                {slider("temp", "Temp °C", 32, 42, 0.1)}
                {slider("pain", "Pain", 0, 10)}
                {slider("gcs", "GCS", 3, 15)}
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] text-dim w-[72px] shrink-0">Rhythm</span>
                  <select
                    value={liveVitals.rhythm}
                    onChange={(e) => setOverrides((o) => ({ ...o, rhythm: e.target.value }))}
                    className="flex-1 h-8 px-2 rounded-lg bg-surface2 border border-line text-[12px] outline-none cursor-pointer"
                  >
                    {RHYTHMS.map((r) => <option key={r}>{r}</option>)}
                    {!RHYTHMS.includes(liveVitals.rhythm) && <option>{liveVitals.rhythm}</option>}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: timeline + next event + hidden prompts */}
          <div className="space-y-4">
            <div className="card p-4">
              <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-2.5">Stage timeline</div>
              <div className="space-y-1">
                {events.map((e, i) => (
                  <button
                    key={e.id}
                    onClick={() => jumpTo(i)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      i === stageIdx ? "bg-accent-soft" : "hover:bg-surface2"
                    }`}
                  >
                    <span className={`font-mono text-[10.5px] tabular-nums w-10 shrink-0 ${i === stageIdx ? "text-accent font-semibold" : "text-faint"}`}>
                      {String(e.tMin).padStart(2, "0")}:00
                    </span>
                    <span className={`text-[12.5px] leading-tight ${i === stageIdx ? "text-ink font-medium" : i < stageIdx ? "text-faint line-through decoration-line/50" : "text-dim"}`}>
                      {e.title}
                    </span>
                    {i === stageIdx && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent pulse-dot shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {next && (
              <div className="card p-4 border-warn/30">
                <div className="text-[11px] font-semibold text-warn uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <ChevronRight size={12} /> Next event · T+{String(next.tMin).padStart(2, "0")}:00
                </div>
                <div className="text-[13px] font-medium">{next.title}</div>
                <p className="text-[12px] text-dim leading-relaxed mt-1">{next.description}</p>
                <Button size="sm" variant="outline" className="mt-2.5" icon={Zap} onClick={() => jumpTo(stageIdx + 1)}>Trigger now</Button>
              </div>
            )}

            <div className="card p-4">
              <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <EyeOff size={12} /> Hidden prompts & levers
              </div>
              <div className="space-y-2">
                {s.hiddenPrompts.slice(0, 5).map((h) => (
                  <div key={h} className={`px-3 py-2 rounded-lg border text-[12px] leading-relaxed flex items-start justify-between gap-2 ${firedHidden.has(h) ? "border-ok/40 bg-ok-soft" : "border-line bg-surface2"}`}>
                    <span className={firedHidden.has(h) ? "text-ok" : "text-dim"}>{h}</span>
                    {!firedHidden.has(h) && (
                      <button onClick={() => setFiredHidden((f) => new Set(f).add(h))} className="text-[10.5px] text-accent shrink-0 cursor-pointer hover:underline">fire</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: critical actions + AI recs + tips */}
          <div className="space-y-4">
            <div className="card p-4">
              <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <ListChecks size={12} /> Critical actions · {checked.size}/{s.criticalActions.length}
              </div>
              <div className="space-y-1.5">
                {s.criticalActions.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setChecked((prev) => { const n = new Set(prev); if (n.has(i)) { n.delete(i); } else { n.add(i); } return n; })}
                    className="w-full flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface2 text-left cursor-pointer"
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checked.has(i) ? "bg-ok border-ok" : "border-line2"}`}>
                      {checked.has(i) && <span className="text-white text-[10px]">✓</span>}
                    </span>
                    <span className={`text-[12px] leading-snug ${checked.has(i) ? "text-faint line-through" : "text-ink"}`}>{c}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <div className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Sparkles size={12} /> AI recommendations
              </div>
              <div className="space-y-2">
                {recommendations.length === 0 && <div className="text-[12px] text-faint">Running smoothly — no interventions suggested.</div>}
                {recommendations.map((r) => (
                  <div key={r} className="px-3 py-2 rounded-lg bg-accent-soft text-[12px] leading-relaxed">{r}</div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-2.5">Instructor tips</div>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {s.instructorNotes.map((n, i) => (
                  <div key={i} className="text-[12px] text-dim leading-relaxed flex gap-2">
                    <span className="text-faint shrink-0">·</span>{n}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-2">Scripted dialogue</div>
              <div className="space-y-2">
                {s.dialogue.map((d, i) => (
                  <div key={i} className="text-[12px] leading-relaxed">
                    <Badge tone="cyan" className="mr-1.5">{d.speaker}</Badge>
                    <span className="text-dim italic">&ldquo;{d.line}&rdquo;</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
