"use client";

import React, { useMemo, useState } from "react";
import { EyeOff, Flag, HeartPulse, Siren, Sparkles, Stethoscope, Syringe, Users, Waves } from "lucide-react";
import { useStore } from "@/lib/store";
import { EventType } from "@/lib/types";
import { ScenarioHeader } from "../ScenarioHeader";
import { Badge } from "../ui";
import { PatientMonitor } from "../Monitor";

const TYPE_META: Record<EventType, { color: string; icon: typeof Flag; label: string }> = {
  arrival: { color: "var(--accent)", icon: Flag, label: "Arrival" },
  assessment: { color: "var(--cyan)", icon: Stethoscope, label: "Assessment" },
  deterioration: { color: "var(--warn)", icon: Waves, label: "Deterioration" },
  critical: { color: "var(--danger)", icon: Siren, label: "Critical event" },
  intervention: { color: "var(--ok)", icon: Syringe, label: "Intervention" },
  complication: { color: "var(--danger)", icon: Siren, label: "Complication" },
  family: { color: "var(--accent)", icon: Users, label: "Family" },
  recovery: { color: "var(--ok)", icon: HeartPulse, label: "Recovery" },
  hidden: { color: "var(--faint)", icon: EyeOff, label: "Hidden (instructor)" },
};

const fmtT = (m: number) => `${String(Math.floor(m)).padStart(2, "0")}:00`;

export function Timeline() {
  const { current } = useStore();
  const s = current!;
  const [activeIdx, setActiveIdx] = useState(0);
  const events = s.timeline;
  const active = events[activeIdx];
  const dur = s.input.duration;

  // vitals flowsheet — small multiples over event times
  const series = useMemo(() => ([
    { key: "hr", label: "Heart rate", unit: "bpm", color: "var(--mon-green)", vals: events.map((e) => e.vitals.hr), max: 200 },
    { key: "sbp", label: "Systolic BP", unit: "mmHg", color: "var(--mon-red)", vals: events.map((e) => e.vitals.sbp), max: 220 },
    { key: "spo2", label: "SpO₂", unit: "%", color: "var(--mon-cyan)", vals: events.map((e) => e.vitals.spo2), max: 100 },
    { key: "rr", label: "Resp rate", unit: "/min", color: "var(--mon-yellow)", vals: events.map((e) => e.vitals.rr), max: 50 },
  ]), [events]);

  return (
    <div>
      <ScenarioHeader s={s} title={s.title} sub="Interactive simulation timeline — click any event to inspect state" />
      <div className="max-w-[1150px] mx-auto px-8 py-6">

        {/* Track — markers on one line; labels alternate above/below to avoid collisions */}
        <div className="card p-5 mb-5 overflow-x-auto">
          <div className="relative min-w-[760px]" style={{ height: 150 }}>
            <div className="absolute left-0 right-0 top-[64px] h-px bg-line2" />
            {events.map((e, i) => {
              const meta = TYPE_META[e.type];
              const Icon = meta.icon;
              const x = (e.tMin / dur) * 100;
              const isActive = i === activeIdx;
              const above = i % 2 === 0;
              return (
                <button
                  key={e.id}
                  onClick={() => setActiveIdx(i)}
                  className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                  style={{ left: `${Math.min(96, Math.max(4, x))}%`, top: 46 }}
                >
                  <span
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all bg-surface"
                    style={{
                      borderColor: meta.color,
                      boxShadow: isActive ? `0 0 0 4px color-mix(in srgb, ${meta.color} 22%, transparent)` : "none",
                      opacity: e.hidden && !isActive ? 0.55 : 1,
                    }}
                  >
                    <Icon size={14} style={{ color: meta.color }} />
                  </span>
                  <span
                    className={`absolute flex flex-col items-center w-[104px] text-center ${above ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}
                  >
                    <span className={`text-[9.5px] font-mono transition-colors ${isActive ? "text-accent font-semibold" : "text-faint"}`}>{fmtT(e.tMin)}</span>
                    <span className={`text-[10px] leading-tight transition-colors ${isActive ? "text-ink font-medium" : "text-faint group-hover:text-dim"}`}>
                      {e.title.length > 30 ? e.title.slice(0, 28) + "…" : e.title}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-5 items-start">
          {/* Event detail */}
          <div className="space-y-5 min-w-0">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge tone={active.type === "critical" || active.type === "complication" ? "danger" : active.type === "deterioration" ? "warn" : active.type === "recovery" || active.type === "intervention" ? "ok" : "accent"}>
                  {TYPE_META[active.type].label}
                </Badge>
                <span className="font-mono text-[11px] text-faint">T+{fmtT(active.tMin)}</span>
                {active.hidden && <Badge tone="neutral"><EyeOff size={10} /> instructor-triggered</Badge>}
              </div>
              <h2 className="text-[16px] font-semibold tracking-tight">{active.title}</h2>
              <p className="text-[13px] text-dim leading-relaxed mt-1.5">{active.description}</p>
              {active.instructorNote && (
                <div className="mt-3 px-3.5 py-2.5 rounded-lg bg-accent-soft text-[12.5px] leading-relaxed flex items-start gap-2">
                  <Sparkles size={13} className="text-accent mt-0.5 shrink-0" />
                  <span><span className="font-semibold text-accent">Instructor note · </span>{active.instructorNote}</span>
                </div>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-4">
                {([
                  ["HR", active.vitals.hr || "--", "bpm"],
                  ["BP", active.vitals.sbp ? `${active.vitals.sbp}/${active.vitals.dbp}` : "--", ""],
                  ["RR", active.vitals.rr || "--", "/min"],
                  ["SpO₂", active.vitals.hr ? active.vitals.spo2 : "--", "%"],
                  ["Temp", active.vitals.temp.toFixed(1), "°C"],
                  ["Pain", active.vitals.pain, "/10"],
                  ["GCS", active.vitals.gcs, "/15"],
                  ["CapR", active.vitals.capRefill, "s"],
                ] as [string, string | number, string][]).map(([l, v, u]) => (
                  <div key={l} className="rounded-lg bg-surface2 px-2 py-1.5 text-center">
                    <div className="text-[9px] font-semibold text-faint uppercase tracking-wider">{l}</div>
                    <div className="text-[13px] font-semibold tabular-nums">{v}<span className="text-[9px] text-faint ml-0.5">{u}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vitals flowsheet — small multiples, shared time axis */}
            <div className="card p-5">
              <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-3">Vitals across the scenario</div>
              <div className="space-y-3">
                {series.map((sr) => (
                  <FlowRow key={sr.key} label={sr.label} unit={sr.unit} color={sr.color} vals={sr.vals} times={events.map((e) => e.tMin)} dur={dur} max={sr.max} activeIdx={activeIdx} onPick={setActiveIdx} />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9.5px] font-mono text-faint">
                <span className="ml-[92px]">00:00</span><span>{fmtT(dur)}</span>
              </div>
            </div>
          </div>

          {/* Live monitor preview of selected moment */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-faint uppercase tracking-widest">Monitor at T+{fmtT(active.tMin)}</div>
            <PatientMonitor vitals={active.vitals} compact />
            <div className="card px-4 py-3 text-[12px] text-dim leading-relaxed">
              Rhythm: <span className="text-ink font-medium">{active.vitals.rhythm}</span>. Waveforms are generated from the scenario state — scrub the timeline to preview what learners will see at any moment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowRow({ label, unit, color, vals, times, dur, max, activeIdx, onPick }: {
  label: string; unit: string; color: string; vals: number[]; times: number[]; dur: number; max: number;
  activeIdx: number; onPick: (i: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560, H = 44, PAD = 5;
  // scale to the data range (with padding) so the trajectory's shape is visible
  const lo = Math.min(...vals);
  const hi = Math.min(max, Math.max(...vals));
  const span = Math.max(hi - lo, Math.max(4, hi * 0.08));
  const x = (t: number) => PAD + (t / dur) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((Math.min(v, max) - lo) / span) * (H - PAD * 2);
  const path = vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(times[i]).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const shown = hover ?? activeIdx;

  return (
    <div className="flex items-center gap-3">
      <div className="w-[80px] shrink-0">
        <div className="text-[11px] font-medium" style={{ color }}>{label}</div>
        <div className="text-[13px] font-semibold tabular-nums text-ink">{vals[shown]}<span className="text-[9px] text-faint ml-0.5">{unit}</span></div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="flex-1 h-[44px] cursor-crosshair"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const t = ((e.clientX - r.left) / r.width) * dur;
          let best = 0, bd = Infinity;
          times.forEach((tt, i) => { const d = Math.abs(tt - t); if (d < bd) { bd = d; best = i; } });
          setHover(best);
        }}
        onClick={() => hover !== null && onPick(hover)}
      >
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--line)" strokeWidth="1" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {vals.map((v, i) => (
          <circle
            key={i}
            cx={x(times[i])} cy={y(v)}
            r={i === shown ? 4 : 2.5}
            fill={i === shown ? color : "var(--surface)"}
            stroke={color} strokeWidth="1.5"
          />
        ))}
        {shown !== null && <line x1={x(times[shown])} y1={PAD} x2={x(times[shown])} y2={H - PAD} stroke="var(--line2)" strokeWidth="1" strokeDasharray="3 3" />}
      </svg>
    </div>
  );
}
