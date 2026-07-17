"use client";

import React from "react";
import {
  Activity, BarChart3, BookOpen, Brain, Download, GitBranch,
  LayoutDashboard, ListChecks, MessagesSquare, Monitor as MonitorIcon, Moon,
  Plus, ShieldCheck, Sparkles, Sun, Timer, GraduationCap,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { View } from "@/lib/types";
import { Badge } from "./ui";

const MAIN_NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "library", label: "Scenario Library", icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const SCENARIO_NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "canvas", label: "Scenario Canvas", icon: GitBranch },
  { id: "timeline", label: "Timeline", icon: Timer },
  { id: "instructor", label: "Instructor View", icon: MonitorIcon },
  { id: "learner", label: "Learner View", icon: GraduationCap },
  { id: "assessment", label: "Assessment", icon: ListChecks },
  { id: "debrief", label: "Debrief", icon: MessagesSquare },
  { id: "validation", label: "AI Validation", icon: ShieldCheck },
  { id: "export", label: "Export", icon: Download },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { view, go, current, theme, setTheme, copilotOpen, setCopilotOpen } = useStore();
  const immersive = view === "learner";

  if (immersive) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside className="w-[232px] shrink-0 border-r border-line bg-bg2 flex flex-col">
        <div className="px-4 h-14 flex items-center gap-2.5 border-b border-line">
          <div className="w-7 h-7 rounded-lg bg-accent2 flex items-center justify-center shadow-sm">
            <Activity size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold leading-4 tracking-tight">SimCraft AI</div>
            <div className="text-[10px] text-faint leading-3">Clinical Simulation Studio</div>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={() => go("wizard")}
            className="w-full h-9 rounded-lg bg-accent2 text-white text-[13px] font-medium flex items-center justify-center gap-1.5 hover:brightness-110 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} /> New Scenario
          </button>
        </div>

        <nav className="px-3 space-y-0.5">
          {MAIN_NAV.map((n) => (
            <NavItem key={n.id} active={view === n.id} icon={n.icon} label={n.label} onClick={() => go(n.id)} />
          ))}
        </nav>

        {current && (
          <div className="mt-4 px-3 flex-1 min-h-0 overflow-y-auto">
            <div className="px-2.5 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-faint uppercase tracking-widest">Open Scenario</span>
              <Badge tone={current.status === "published" ? "ok" : current.status === "in-review" ? "warn" : "neutral"}>{current.status}</Badge>
            </div>
            <div className="px-2.5 pb-2 text-[12px] text-dim leading-snug line-clamp-2">{current.title}</div>
            <div className="space-y-0.5">
              {SCENARIO_NAV.map((n) => (
                <NavItem key={n.id} active={view === n.id} icon={n.icon} label={n.label} onClick={() => go(n.id)} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto p-3 border-t border-line space-y-2">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-6 h-6 rounded-full bg-cyan-soft text-cyan flex items-center justify-center text-[10px] font-bold">PA</div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate">Puneet Arora</div>
              <div className="text-[10px] text-faint truncate">Simulation Center · Team West</div>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-md text-dim hover:text-ink hover:bg-surface2 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex min-w-0">
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>

        {/* Copilot toggle rail */}
        {current && !copilotOpen && view !== "wizard" && view !== "generating" && (
          <button
            onClick={() => setCopilotOpen(true)}
            className="fixed bottom-5 right-5 z-40 h-10 pl-3 pr-4 rounded-full bg-accent2 text-white text-[13px] font-medium flex items-center gap-2 shadow-lg hover:brightness-110 cursor-pointer"
          >
            <Sparkles size={15} /> AI Copilot
          </button>
        )}
      </div>
    </div>
  );
}

function NavItem({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Brain; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-[13px] transition-colors cursor-pointer ${
        active ? "bg-accent-soft text-accent font-medium" : "text-dim hover:text-ink hover:bg-surface2"
      }`}
    >
      <Icon size={15} strokeWidth={2} />
      {label}
    </button>
  );
}
