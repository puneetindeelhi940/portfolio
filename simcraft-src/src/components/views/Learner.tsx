"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileImage, Play, Pause, Volume2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Vitals } from "@/lib/types";
import { PatientMonitor, WaveTrace } from "../Monitor";

function lerp(a: number, b: number, f: number) { return a + (b - a) * f; }

export function Learner() {
  const { current, go } = useStore();
  const s = current!;
  const durS = s.input.duration * 60;
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(true);
  // learner clock runs 12x so a portfolio visitor sees the full arc quickly
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((x) => (x + 12) % durS), 1000);
    return () => clearInterval(id);
  }, [running, durS]);

  const events = s.timeline.filter((e) => !e.hidden);
  const vitals: Vitals = useMemo(() => {
    let idx = 0;
    events.forEach((e, i) => { if (e.tMin * 60 <= t) idx = i; });
    const a = events[idx].vitals;
    const b = events[idx + 1]?.vitals || a;
    const t0 = events[idx].tMin * 60, t1 = events[idx + 1] ? events[idx + 1].tMin * 60 : durS;
    const f = t1 > t0 ? Math.min(1, (t - t0) / (t1 - t0)) : 0;
    const arrest = a.hr === 0;
    return {
      hr: arrest ? 0 : Math.round(lerp(a.hr, b.hr, f)),
      sbp: arrest ? 0 : Math.round(lerp(a.sbp, b.sbp, f)),
      dbp: arrest ? 0 : Math.round(lerp(a.dbp, b.dbp, f)),
      rr: arrest ? 0 : Math.round(lerp(a.rr, b.rr, f)),
      spo2: Math.round(lerp(a.spo2, b.spo2, f)),
      temp: Math.round(lerp(a.temp, b.temp, f) * 10) / 10,
      pain: a.pain, gcs: a.gcs, capRefill: a.capRefill,
      rhythm: a.rhythm,
    };
  }, [t, events, durS]);

  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(Math.floor(t % 60)).padStart(2, "0");

  return (
    <div className="min-h-screen bg-[#04060a] text-white">
      {/* discreet chrome */}
      <div className="flex items-center justify-between px-5 h-12 border-b border-white/10">
        <button onClick={() => go("instructor")} className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white cursor-pointer">
          <ArrowLeft size={14} /> Exit learner display
        </button>
        <div className="text-[12px] font-mono text-white/60 tracking-widest uppercase">
          {s.patient.name} · {s.patient.age} · {s.patient.weight}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px] text-white/70 tabular-nums">{mm}:{ss}</span>
          <button onClick={() => setRunning(!running)} className="text-white/50 hover:text-white cursor-pointer" aria-label="Play/pause">
            {running ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto p-5 grid lg:grid-cols-[1.5fr_1fr] gap-5 items-start">
        {/* Monitor — the hero */}
        <div>
          <PatientMonitor vitals={vitals} />
          {/* ECG strip */}
          <div className="mt-4 rounded-xl border border-white/10 bg-[#06080b] overflow-hidden">
            <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-mono tracking-widest text-white/50 uppercase">12-lead ECG · continuous strip</div>
            <WaveTrace kind="ecg" vitals={vitals} color="#35e08c" height={90} speed={140} />
          </div>
          {/* Patient audio */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase mb-3 flex items-center gap-1.5">
              <Volume2 size={11} /> Patient audio
            </div>
            <div className="space-y-2">
              {s.dialogue.filter((d) => d.speaker.toLowerCase().includes("patient")).slice(0, 2).map((d, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.05]">
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Play size={11} className="text-white/70 ml-0.5" />
                  </span>
                  <div className="flex-1 flex items-center gap-[2px] h-5">
                    {Array.from({ length: 42 }).map((_, j) => (
                      <span key={j} className="w-[3px] rounded-full bg-white/25" style={{ height: `${4 + Math.abs(Math.sin(j * 1.7 + i)) * 14}px` }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-white/40">0:0{3 + i * 2}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Images + ECG report available to learners */}
        <div className="space-y-4">
          {s.imaging.map((img) => (
            <div key={img.title} className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <FileImage size={12} className="text-white/50" />
                <span className="text-[11px] font-mono tracking-wider text-white/60 uppercase">{img.modality} — {img.title}</span>
              </div>
              {/* stylised film */}
              <div className="h-[120px] bg-gradient-to-br from-white/[0.06] to-transparent relative">
                <div className="absolute inset-4 rounded border border-white/10" />
                <div className="absolute left-6 top-6 text-[9px] font-mono text-white/30">{s.patient.name.toUpperCase()} · {img.modality.toUpperCase()}</div>
                <div className="absolute right-6 bottom-6 text-[9px] font-mono text-white/30">SIM STUDY — NOT FOR CLINICAL USE</div>
              </div>
              <div className="px-4 py-3 text-[12px] text-white/70 leading-relaxed">{img.findings}</div>
            </div>
          ))}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1.5">Rhythm</div>
            <div className="text-[13px] text-white/85">{vitals.rhythm}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
