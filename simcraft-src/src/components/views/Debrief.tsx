"use client";

import React from "react";
import { BookOpen, MessagesSquare, TrendingDown, TrendingUp, TriangleAlert, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { ScenarioHeader } from "../ScenarioHeader";
import { Badge } from "../ui";

export function Debrief() {
  const { current } = useStore();
  const s = current!;
  const d = s.debrief;

  return (
    <div>
      <ScenarioHeader s={s} title={s.title} sub="Debrief builder — PEARLS-structured, evidence-linked" />
      <div className="max-w-[980px] mx-auto px-8 py-6">
        <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2 mb-1"><MessagesSquare size={18} className="text-accent"/> Debrief Builder</h1>
        <p className="text-[13px] text-dim mb-5">Reactions → analysis → summary. Every teaching point carries its evidence.</p>

        <div className="card p-5 mb-4">
          <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-2">Session summary</div>
          <p className="text-[13.5px] leading-relaxed">{d.summary}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <ListCard title="Strengths to reinforce" icon={TrendingUp} tone="ok" items={d.strengths} />
          <ListCard title="Growth areas" icon={TrendingDown} tone="warn" items={d.weaknesses} />
          <ListCard title="Critical errors to surface" icon={TriangleAlert} tone="danger" items={d.criticalErrors} />
          <ListCard title="Missed opportunities" icon={Target} tone="accent" items={d.missedOpportunities} />
        </div>

        <div className="card p-5 mb-4">
          <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-3">Guided discussion (advocacy–inquiry)</div>
          <div className="grid md:grid-cols-2 gap-4">
            {d.discussion.map((disc) => (
              <div key={disc.topic}>
                <div className="text-[13px] font-medium mb-1.5">{disc.topic}</div>
                <ul className="space-y-1.5">
                  {disc.questions.map((q) => (
                    <li key={q} className="text-[12.5px] text-dim leading-relaxed flex gap-2">
                      <span className="text-accent shrink-0">?</span>{q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-3 flex items-center gap-1.5"><BookOpen size={12}/> Evidence references</div>
            <div className="space-y-3">
              {d.evidence.map((e) => (
                <div key={e.source}>
                  <Badge tone="cyan">{e.source}</Badge>
                  <p className="text-[12.5px] text-dim leading-relaxed mt-1.5">{e.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-3">Improvement plan</div>
            <div className="space-y-2">
              {d.improvementPlan.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-accent-soft text-accent text-[10.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListCard({ title, icon: Icon, tone, items }: { title: string; icon: typeof TrendingUp; tone: "ok" | "warn" | "danger" | "accent"; items: string[] }) {
  const color = { ok: "text-ok", warn: "text-warn", danger: "text-danger", accent: "text-accent" }[tone];
  return (
    <div className="card p-5">
      <div className={`text-[11px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${color}`}>
        <Icon size={12} /> {title}
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it} className="text-[12.5px] text-dim leading-relaxed flex gap-2">
            <span className={`shrink-0 ${color}`}>•</span>{it}
          </li>
        ))}
      </ul>
    </div>
  );
}
