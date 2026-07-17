"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight, Clock, FileText, Heart, Search, Sparkles, Star, Users, Zap, Activity,
} from "lucide-react";
import { useStore, fmtAgo } from "@/lib/store";
import { Badge, Button, SectionTitle, Stat } from "../ui";
import { Scenario } from "@/lib/types";

const QUICK_TEMPLATES = [
  { label: "Pediatric sepsis · 30 min", input: { specialty: "Pediatrics", condition: "sepsis", patientType: "Child" as const, duration: 30 as const, difficulty: "Intermediate" as const } },
  { label: "Adult STEMI → VF arrest · 45 min", input: { specialty: "Cardiology", condition: "mi", patientType: "Adult" as const, duration: 45 as const, difficulty: "Advanced" as const } },
  { label: "Anaphylaxis for new nurses · 30 min", input: { specialty: "Emergency Medicine", condition: "anaphylaxis", patientType: "Adult" as const, duration: 30 as const, difficulty: "Beginner" as const } },
  { label: "Polytrauma, military variant · 60 min", input: { specialty: "Military Medicine", condition: "trauma", patientType: "Adult" as const, duration: 60 as const, difficulty: "Expert" as const } },
];

const AI_SUGGESTIONS = [
  { title: "Your cohort struggled with airway escalation", body: "Last 3 asthma runs show late anaesthetics calls. Generate a focused 15-minute airway-decision drill?", cta: "asthma" },
  { title: "Stroke pathway refresher due", body: "Door-to-needle times drifted +9 min this quarter. A time-pressured stroke scenario would target this.", cta: "stroke" },
  { title: "Team communication under load", body: "Debrief notes flag closed-loop breakdown during arrests. Try an arrest scenario with a scripted comm-failure event.", cta: "cardiac arrest" },
];

export function Dashboard() {
  const { scenarios, go, startGeneration, toggleFavorite } = useStore();
  const [q, setQ] = useState("");

  const drafts = scenarios.filter((s) => s.status === "draft");
  const published = scenarios.filter((s) => s.status === "published");
  const favorites = scenarios.filter((s) => s.favorite);
  const recent = useMemo(
    () => [...scenarios].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [scenarios]
  );
  const filtered = q
    ? scenarios.filter((s) => (s.title + s.tags.join(" ") + s.input.condition).toLowerCase().includes(q.toLowerCase()))
    : null;

  const quickCreate = (tpl: (typeof QUICK_TEMPLATES)[number]) => {
    startGeneration({
      specialty: tpl.input.specialty,
      difficulty: tpl.input.difficulty,
      patientType: tpl.input.patientType,
      condition: tpl.input.condition,
      objectives: ["Rapid Assessment", "Communication", "Critical Thinking"],
      duration: tpl.input.duration,
      equipment: ["Mannequin", "Crash Cart", "IV Pump", "ECG", "Defibrillator"],
      prompt: "",
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Good morning, Puneet</h1>
          <p className="text-[13px] text-dim mt-0.5">Team West Simulation Center · 4 educators active this week</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search scenarios, conditions, tags…"
            className="h-9 w-[280px] pl-9 pr-3 rounded-lg bg-surface border border-line text-[13px] outline-none focus:border-accent placeholder:text-faint"
          />
        </div>
      </div>

      {filtered ? (
        <>
          <SectionTitle>Search results · {filtered.length}</SectionTitle>
          <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => <ScenarioCard key={s.id} s={s} onOpen={() => go("canvas", s)} onFav={() => toggleFavorite(s.id)} />)}
          </div>
        </>
      ) : (
        <>
          {/* Stats */}
          <div className="flex gap-3 flex-wrap mb-7">
            <Stat label="Total scenarios" value={String(scenarios.length)} sub={`${published.length} published`} />
            <Stat label="Avg. generation time" value="3m 41s" sub="target < 5 min" tone="ok" />
            <Stat label="Authoring time saved" value="82%" sub="vs manual baseline" tone="accent" />
            <Stat label="Runs this month" value={String(scenarios.reduce((a, s) => a + s.uses, 0))} sub="across 3 sim rooms" />
          </div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-7 items-start">
            <div className="min-w-0">
              {/* Quick create */}
              <SectionTitle right={<Button variant="ghost" size="sm" onClick={() => go("wizard")}>Open full wizard <ArrowRight size={13} /></Button>}>
                Quick create
              </SectionTitle>
              <div className="grid sm:grid-cols-2 gap-2.5 mb-7">
                {QUICK_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => quickCreate(t)}
                    className="card card-hover px-4 py-3 flex items-center gap-3 text-left cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                      <Zap size={15} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{t.label}</div>
                      <div className="text-[11px] text-faint">One-click AI generation</div>
                    </div>
                    <ArrowRight size={14} className="ml-auto text-faint group-hover:text-accent transition-colors shrink-0" />
                  </button>
                ))}
              </div>

              {/* Recent */}
              <SectionTitle right={<Button variant="ghost" size="sm" onClick={() => go("library")}>Library <ArrowRight size={13} /></Button>}>
                Recent scenarios
              </SectionTitle>
              <div className="space-y-2 mb-7">
                {recent.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => go("canvas", s)}
                    className="w-full card card-hover px-4 py-3 flex items-center gap-3 text-left cursor-pointer"
                  >
                    <div className={`w-1.5 self-stretch rounded-full ${s.status === "published" ? "bg-ok" : s.status === "in-review" ? "bg-warn" : "bg-faint"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium truncate">{s.title}</div>
                      <div className="text-[11.5px] text-faint mt-0.5 flex items-center gap-2">
                        <Clock size={11} /> {fmtAgo(s.updatedAt)} · v{s.version} · {s.uses} runs
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {s.tags.slice(0, 2).map((t) => <Badge key={t}>{t}</Badge>)}
                      <Badge tone={s.status === "published" ? "ok" : s.status === "in-review" ? "warn" : "neutral"}>{s.status}</Badge>
                    </div>
                  </button>
                ))}
              </div>

              {/* Drafts + favorites */}
              <div className="grid sm:grid-cols-2 gap-7">
                <div>
                  <SectionTitle>Drafts · {drafts.length}</SectionTitle>
                  <div className="space-y-2">
                    {drafts.length === 0 && <div className="text-[12.5px] text-faint">No drafts — everything is shipped.</div>}
                    {drafts.map((s) => (
                      <button key={s.id} onClick={() => go("canvas", s)} className="w-full card card-hover px-3.5 py-2.5 flex items-center gap-2.5 text-left cursor-pointer">
                        <FileText size={14} className="text-faint shrink-0" />
                        <span className="text-[12.5px] truncate">{s.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <SectionTitle>Favorites · {favorites.length}</SectionTitle>
                  <div className="space-y-2">
                    {favorites.length === 0 && <div className="text-[12.5px] text-faint">Star scenarios to pin them here.</div>}
                    {favorites.map((s) => (
                      <button key={s.id} onClick={() => go("canvas", s)} className="w-full card card-hover px-3.5 py-2.5 flex items-center gap-2.5 text-left cursor-pointer">
                        <Star size={14} className="text-warn shrink-0" fill="currentColor" />
                        <span className="text-[12.5px] truncate">{s.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right rail */}
            <div className="space-y-6">
              <div>
                <SectionTitle>AI suggestions</SectionTitle>
                <div className="space-y-2.5">
                  {AI_SUGGESTIONS.map((sg) => (
                    <div key={sg.title} className="card px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-accent text-[11px] font-medium mb-1.5">
                        <Sparkles size={12} /> Insight from your analytics
                      </div>
                      <div className="text-[13px] font-medium leading-snug">{sg.title}</div>
                      <p className="text-[12px] text-dim mt-1 leading-relaxed">{sg.body}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2.5"
                        onClick={() =>
                          startGeneration({
                            specialty: "Emergency Medicine", difficulty: "Intermediate", patientType: "Adult",
                            condition: sg.cta, objectives: ["Rapid Assessment", "Communication", "Leadership"],
                            duration: 30, equipment: ["Mannequin", "Crash Cart", "Defibrillator", "ECG"], prompt: "",
                          })
                        }
                      >
                        Generate scenario
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionTitle>Team workspace</SectionTitle>
                <div className="card px-4 py-3.5 space-y-3">
                  {[
                    { who: "Dr. L. Moreau", what: "approved Cardiology STEMI v3", when: "2 h ago" },
                    { who: "S. Reyes, RN", what: "requested review on Trauma Expert", when: "5 h ago" },
                    { who: "K. Tanaka", what: "commented on Pediatric Sepsis debrief", when: "yesterday" },
                  ].map((a) => (
                    <div key={a.who + a.when} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-surface2 border border-line flex items-center justify-center text-[9px] font-bold text-dim shrink-0">
                        {a.who.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <div className="text-[12px] leading-snug">
                        <span className="font-medium">{a.who}</span> <span className="text-dim">{a.what}</span>
                        <div className="text-[10.5px] text-faint mt-0.5">{a.when}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 flex items-center gap-1.5 text-[11.5px] text-faint">
                    <Users size={12} /> 4 educators · 2 reviewers in this workspace
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle>Recent patients</SectionTitle>
                <div className="card divide-y divide-line">
                  {scenarios.slice(0, 4).map((s) => (
                    <button key={s.id} onClick={() => go("instructor", s)} className="w-full px-4 py-2.5 flex items-center gap-2.5 text-left hover:bg-surface2 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl">
                      <Activity size={13} className="text-cyan shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium truncate">{s.patient.name}, {s.patient.age}</div>
                        <div className="text-[10.5px] text-faint truncate">{s.chiefComplaint.slice(0, 46)}…</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ScenarioCard({ s, onOpen, onFav }: { s: Scenario; onOpen: () => void; onFav: () => void }) {
  return (
    <div className="card card-hover px-4 py-3.5 cursor-pointer" onClick={onOpen}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-[13.5px] font-medium leading-snug">{s.title}</div>
        <button onClick={(e) => { e.stopPropagation(); onFav(); }} className="cursor-pointer" aria-label="Favorite">
          <Heart size={14} className={s.favorite ? "text-danger" : "text-faint"} fill={s.favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {s.tags.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
        <Badge tone={s.status === "published" ? "ok" : "neutral"}>{s.status}</Badge>
      </div>
    </div>
  );
}
