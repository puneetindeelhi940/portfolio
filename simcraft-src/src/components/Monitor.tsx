"use client";

import React, { useEffect, useRef } from "react";
import { Vitals } from "@/lib/types";

// Scrolling multi-trace patient monitor rendered on canvas.
// Waveform morphology adapts to the active rhythm string and vitals.

type TraceKind = "ecg" | "pleth" | "resp";

function ecgSample(t: number, rhythm: string, hr: number): number {
  const r = rhythm.toLowerCase();
  if (hr <= 0 || r.includes("asystole")) return (Math.sin(t * 0.7) + Math.sin(t * 1.3)) * 0.008;
  if (r.includes("fibrillation") && r.includes("ventricular")) {
    // coarse VF: chaotic baseline
    return (
      Math.sin(t * 7.1) * 0.28 +
      Math.sin(t * 12.7 + 1.4) * 0.18 +
      Math.sin(t * 4.3 + 0.6) * 0.22 +
      Math.sin(t * 19.3) * 0.08
    );
  }
  const irregular = r.includes("atrial fibrillation") || r.includes("irregular");
  const cycle = 60 / Math.max(20, hr);
  let tt = t % cycle;
  if (irregular) {
    const beatIdx = Math.floor(t / cycle);
    const jitter = (Math.sin(beatIdx * 12.9898) * 43758.5453) % 0.22;
    tt = (t + jitter) % cycle;
  }
  const x = tt / cycle; // 0..1 within beat
  let vy = 0;
  if (!irregular && x > 0.08 && x < 0.16) vy += 0.09 * Math.sin(((x - 0.08) / 0.08) * Math.PI); // P
  if (x > 0.2 && x < 0.225) vy -= 0.12 * Math.sin(((x - 0.2) / 0.025) * Math.PI); // Q
  if (x >= 0.225 && x < 0.26) vy += 1.0 * Math.sin(((x - 0.225) / 0.035) * Math.PI); // R
  if (x >= 0.26 && x < 0.29) vy -= 0.22 * Math.sin(((x - 0.26) / 0.03) * Math.PI); // S
  if (x > 0.38 && x < 0.55) vy += 0.16 * Math.sin(((x - 0.38) / 0.17) * Math.PI); // T
  if (r.includes("st elevation") && x >= 0.29 && x < 0.38) vy += 0.12;
  return vy;
}

function plethSample(t: number, hr: number, spo2: number): number {
  if (hr <= 0) return 0;
  const cycle = 60 / Math.max(20, hr);
  const x = (t % cycle) / cycle;
  const amp = Math.max(0.15, spo2 / 100);
  const main = Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.6)), 2);
  const dicrotic = x > 0.45 && x < 0.7 ? 0.18 * Math.sin(((x - 0.45) / 0.25) * Math.PI) : 0;
  return (main * 0.8 + dicrotic) * amp;
}

function respSample(t: number, rr: number): number {
  if (rr <= 0) return 0;
  const cycle = 60 / Math.max(4, rr);
  const x = (t % cycle) / cycle;
  return Math.pow(Math.sin(Math.PI * x), 1.5) * 0.7;
}

export function WaveTrace({ kind, vitals, color, height = 64, speed = 90 }: {
  kind: TraceKind;
  vitals: Vitals;
  color: string;
  height?: number;
  speed?: number; // px per second
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const vref = useRef(vitals);

  useEffect(() => {
    vref.current = vitals;
  }, [vitals]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const v = vref.current;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      const mid = h * (kind === "ecg" ? 0.62 : 0.75);
      const amp = h * (kind === "ecg" ? 0.42 : 0.55);
      for (let px = 0; px <= w; px += 2) {
        const ts = t - (w - px) / speed;
        let y = 0;
        if (kind === "ecg") y = ecgSample(ts, v.rhythm, v.hr);
        else if (kind === "pleth") y = plethSample(ts, v.hr, v.spo2);
        else y = respSample(ts, v.rr);
        const yy = mid - y * amp;
        if (px === 0) ctx.moveTo(px, yy);
        else ctx.lineTo(px, yy);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [kind, color, speed]);

  return <canvas ref={ref} className="w-full block" style={{ height }} />;
}

export function VitalNumber({ label, value, unit, color, alarm }: { label: string; value: string; unit?: string; color: string; alarm?: boolean }) {
  return (
    <div className={`px-3 py-2 ${alarm ? "animate-pulse" : ""}`}>
      <div className="text-[10px] font-semibold tracking-widest uppercase opacity-70" style={{ color }}>{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-[30px] leading-9 font-semibold tabular-nums font-mono" style={{ color }}>{value}</span>
        {unit && <span className="text-[10px] opacity-60" style={{ color }}>{unit}</span>}
      </div>
    </div>
  );
}

export function PatientMonitor({ vitals, compact = false }: { vitals: Vitals; compact?: boolean }) {
  const arrested = vitals.hr <= 0;
  const num = (n: number) => (arrested && n <= 0 ? "--" : String(n));
  return (
    <div className="rounded-xl border border-line overflow-hidden bg-[#06080b]" data-monitor>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${arrested ? "bg-[--mon-red]" : "bg-[--mon-green]"} pulse-dot`} style={{ background: arrested ? "#ff6b64" : "#35e08c" }} />
          <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">Bedside Monitor · Lead II</span>
        </div>
        <span className="text-[10px] font-mono text-white/40">{vitals.rhythm}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto]">
        <div className="border-r border-white/10">
          <WaveTrace kind="ecg" vitals={vitals} color="#35e08c" height={compact ? 52 : 72} />
          <WaveTrace kind="pleth" vitals={vitals} color="#3ed3f2" height={compact ? 40 : 56} />
          {!compact && <WaveTrace kind="resp" vitals={vitals} color="#ffd166" height={44} speed={38} />}
        </div>
        <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-1"} content-start min-w-[120px]`}>
          <VitalNumber label="HR" value={num(vitals.hr)} unit="bpm" color="#35e08c" alarm={arrested} />
          <VitalNumber label="SpO₂" value={arrested ? "--" : String(vitals.spo2)} unit="%" color="#3ed3f2" alarm={vitals.spo2 < 90 && !arrested} />
          <VitalNumber label="NIBP" value={arrested ? "--/--" : `${vitals.sbp}/${vitals.dbp}`} color="#ff6b64" alarm={!arrested && vitals.sbp < 90} />
          <VitalNumber label="RR" value={num(vitals.rr)} color="#ffd166" />
          {!compact && <VitalNumber label="Temp" value={vitals.temp.toFixed(1)} unit="°C" color="#e9ebf2" />}
        </div>
      </div>
    </div>
  );
}
