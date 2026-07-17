"use client";

import React, { useMemo, useState } from "react";
import { Heart, Search, Sparkles, Star, Trash2 } from "lucide-react";
import { fmtAgo, useStore } from "@/lib/store";
import { Badge, Button, EmptyState, Tabs } from "../ui";

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];
const DURATIONS = ["All", "15", "30", "45", "60", "90"];

export function Library() {
  const { scenarios, go, toggleFavorite, deleteScenario } = useStore();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("All");
  const [dur, setDur] = useState("All");
  const [aiNote, setAiNote] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...scenarios].sort((a, b) => b.updatedAt - a.updatedAt);
    if (tab === "published") list = list.filter((s) => s.status === "published");
    if (tab === "drafts") list = list.filter((s) => s.status === "draft");
    if (tab === "review") list = list.filter((s) => s.status === "in-review");
    if (tab === "favorites") list = list.filter((s) => s.favorite);
    if (diff !== "All") list = list.filter((s) => s.input.difficulty === diff);
    if (dur !== "All") list = list.filter((s) => String(s.input.duration) === dur);
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter((s) =>
        (s.title + " " + s.tags.join(" ") + " " + s.input.condition + " " + s.input.specialty + " " + s.patient.name + " " + s.chiefComplaint)
          .toLowerCase().includes(qq)
      );
    }
    return list;
  }, [scenarios, tab, q, diff, dur]);

  const aiSearch = () => {
    if (!q.trim()) return;
    setAiNote(
      `AI search parsed your query into filters: condition ≈ "${q.split(" ").slice(-2).join(" ")}", matched against titles, presentations, objectives and tags. ${filtered.length} scenario${filtered.length === 1 ? "" : "s"} ranked by semantic relevance.`
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-7">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Scenario Library</h1>
          <p className="text-[13px] text-dim mt-0.5">{scenarios.length} scenarios · shared across Team West workspace</p>
        </div>
        <Button variant="primary" onClick={() => go("wizard")}>New Scenario</Button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setAiNote(null); }}
            onKeyDown={(e) => e.key === "Enter" && aiSearch()}
            placeholder={'Try AI search: "pediatric trauma simulations involving airway compromise"'}
            className="h-9 w-full pl-9 pr-3 rounded-lg bg-surface border border-line text-[13px] outline-none focus:border-accent placeholder:text-faint"
          />
        </div>
        <Button icon={Sparkles} onClick={aiSearch}>AI Search</Button>
        <select value={diff} onChange={(e) => setDiff(e.target.value)} className="h-9 px-2.5 rounded-lg bg-surface border border-line text-[12.5px] text-dim outline-none cursor-pointer">
          {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={dur} onChange={(e) => setDur(e.target.value)} className="h-9 px-2.5 rounded-lg bg-surface border border-line text-[12.5px] text-dim outline-none cursor-pointer">
          {DURATIONS.map((d) => <option key={d} value={d}>{d === "All" ? "Any duration" : `${d} min`}</option>)}
        </select>
      </div>

      {aiNote && (
        <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-accent-soft text-[12.5px] text-accent flex items-start gap-2">
          <Sparkles size={14} className="mt-0.5 shrink-0" /> {aiNote}
        </div>
      )}

      <Tabs
        tabs={[
          { id: "all", label: "All", count: scenarios.length },
          { id: "published", label: "Published", count: scenarios.filter((s) => s.status === "published").length },
          { id: "drafts", label: "Drafts", count: scenarios.filter((s) => s.status === "draft").length },
          { id: "review", label: "In review", count: scenarios.filter((s) => s.status === "in-review").length },
          { id: "favorites", label: "Favorites", count: scenarios.filter((s) => s.favorite).length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No scenarios match" sub="Loosen the filters, or generate a new scenario from the wizard." action={<Button variant="primary" onClick={() => go("wizard")}>Create scenario</Button>} />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <div key={s.id} className="card card-hover p-4 cursor-pointer group flex flex-col" onClick={() => go("canvas", s)}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[13.5px] font-medium leading-snug">{s.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(s.id); }} className="p-1 rounded hover:bg-surface2 cursor-pointer" aria-label="Favorite">
                    <Heart size={13} className={s.favorite ? "text-danger" : "text-faint"} fill={s.favorite ? "currentColor" : "none"} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this scenario?")) deleteScenario(s.id); }} className="p-1 rounded hover:bg-surface2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete">
                    <Trash2 size={13} className="text-faint hover:text-danger" />
                  </button>
                </div>
              </div>
              <p className="text-[12px] text-dim leading-relaxed line-clamp-2 mb-3">{s.chiefComplaint}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {s.tags.slice(0, 4).map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
              <div className="mt-auto pt-2 border-t border-line flex items-center justify-between text-[11px] text-faint">
                <span className="flex items-center gap-1"><Star size={11} className="text-warn" fill="currentColor" /> {s.rating} · {s.uses} runs</span>
                <span>v{s.version} · {fmtAgo(s.updatedAt)}</span>
                <Badge tone={s.status === "published" ? "ok" : s.status === "in-review" ? "warn" : "neutral"}>{s.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
