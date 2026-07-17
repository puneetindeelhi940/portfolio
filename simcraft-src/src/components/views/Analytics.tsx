"use client";

import React, { useMemo, useState } from "react";
import { BarChart3, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { SectionTitle, Stat } from "../ui";

export function Analytics() {
  const { scenarios } = useStore();

  const bySpecialty = useMemo(() => {
    const m = new Map<string, number>();
    scenarios.forEach((s) => m.set(s.input.specialty, (m.get(s.input.specialty) || 0) + s.uses));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [scenarios]);

  const byDifficulty = useMemo(() => {
    const order = ["Beginner", "Intermediate", "Advanced", "Expert"];
    const m = new Map<string, number>(order.map((o) => [o, 0]));
    scenarios.forEach((s) => m.set(s.input.difficulty, (m.get(s.input.difficulty) || 0) + 1));
    return order.map((o) => [o, m.get(o) || 0] as [string, number]);
  }, [scenarios]);

  const byObjective = useMemo(() => {
    const m = new Map<string, number>();
    scenarios.forEach((s) => s.input.objectives.forEach((o) => m.set(o, (m.get(o) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [scenarios]);

  const totalRuns = scenarios.reduce((a, s) => a + s.uses, 0);
  const avgRating = scenarios.length ? (scenarios.reduce((a, s) => a + s.rating, 0) / scenarios.length).toFixed(1) : "—";

  const commonErrors = [
    ["Delayed escalation call", 14],
    ["Open-loop medication orders", 11],
    ["Fixation on first diagnosis", 9],
    ["Missed reassessment after intervention", 8],
    ["Incomplete SBAR handover", 6],
  ] as [string, number][];

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-7">
      <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2 mb-1"><BarChart3 size={19} className="text-accent"/> Analytics</h1>
      <p className="text-[13px] text-dim mb-6">Program-level view across every scenario and run in this workspace.</p>

      <div className="flex gap-3 flex-wrap mb-7">
        <Stat label="Total scenarios" value={String(scenarios.length)} sub={`${scenarios.filter((s) => s.status === "published").length} published`} />
        <Stat label="Total runs" value={String(totalRuns)} sub="last 90 days" />
        <Stat label="Avg. generation time" value="3m 41s" sub="80% target: < 5 min" tone="ok" />
        <Stat label="Instructor rating" value={`${avgRating} / 5`} sub="across published scenarios" tone="accent" />
        <Stat label="Learner pass rate" value="87%" sub="first attempt" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Scenario usage by specialty" note="runs">
          <HBars data={bySpecialty} />
        </ChartCard>
        <ChartCard title="Difficulty distribution" note="scenarios">
          <HBars data={byDifficulty} />
        </ChartCard>
        <ChartCard title="Top learning objectives" note="scenarios targeting each">
          <HBars data={byObjective} />
        </ChartCard>
        <ChartCard title="Most common learner errors" note="debrief-tagged, last quarter">
          <div className="space-y-2.5 pt-1">
            {commonErrors.map(([label, n], i) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-md bg-danger-soft text-danger text-[10.5px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-[12.5px] flex-1">{label}</span>
                <span className="text-[12px] font-mono text-dim tabular-nums">{n}×</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="mt-6">
        <SectionTitle>Instructor ratings — published scenarios</SectionTitle>
        <div className="card divide-y divide-line">
          {scenarios.filter((s) => s.status === "published").map((s) => (
            <div key={s.id} className="px-4 py-3 flex items-center gap-3">
              <span className="text-[13px] flex-1 truncate">{s.title}</span>
              <span className="text-[12px] text-faint tabular-nums">{s.uses} runs</span>
              <span className="flex items-center gap-1 text-[12.5px] font-medium tabular-nums">
                <Star size={12} className="text-warn" fill="currentColor" /> {s.rating}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-[13px] font-semibold">{title}</span>
        <span className="text-[10.5px] text-faint uppercase tracking-wider">{note}</span>
      </div>
      {children}
    </div>
  );
}

// Single-hue magnitude bars; identity lives on the row label, value direct-labeled at the end.
function HBars({ data }: { data: [string, number][] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map(([, v]) => v));
  return (
    <div className="space-y-2.5">
      {data.map(([label, v], i) => (
        <div
          key={label}
          className="flex items-center gap-3 group"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <span className="text-[12px] text-dim w-[140px] shrink-0 truncate text-right">{label}</span>
          <div className="flex-1 h-[18px] rounded bg-surface2 overflow-hidden">
            <div
              className="h-full rounded-r transition-all duration-300"
              style={{ width: `${(v / max) * 100}%`, background: hover === i ? "var(--accent)" : "color-mix(in srgb, var(--accent) 78%, transparent)", minWidth: v > 0 ? 4 : 0 }}
            />
          </div>
          <span className={`text-[12px] font-mono tabular-nums w-8 ${hover === i ? "text-ink" : "text-dim"}`}>{v}</span>
        </div>
      ))}
    </div>
  );
}
