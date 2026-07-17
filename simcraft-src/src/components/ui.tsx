"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export function Button({
  children, onClick, variant = "default", size = "md", icon: Icon, className = "", disabled,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
}) {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const sizes = { sm: "h-7 px-2.5 text-xs", md: "h-8.5 px-3.5 text-[13px]", lg: "h-10 px-5 text-sm" };
  const variants = {
    default: "bg-surface2 border border-line text-ink hover:border-line2 hover:bg-raised",
    primary: "bg-accent2 text-white hover:brightness-110 shadow-sm",
    ghost: "text-dim hover:text-ink hover:bg-surface2",
    outline: "border border-line2 text-ink hover:bg-surface2",
    danger: "bg-danger-soft text-danger border border-transparent hover:border-danger",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon size={size === "sm" ? 13 : 15} strokeWidth={2} />}
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral", className = "" }: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "ok" | "warn" | "danger" | "cyan";
  className?: string;
}) {
  const tones = {
    neutral: "bg-surface2 text-dim border-line",
    accent: "bg-accent-soft text-accent border-transparent",
    ok: "bg-ok-soft text-ok border-transparent",
    warn: "bg-warn-soft text-warn border-transparent",
    danger: "bg-danger-soft text-danger border-transparent",
    cyan: "bg-cyan-soft text-cyan border-transparent",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[13px] font-semibold text-dim tracking-wide uppercase">{children}</h2>
      {right}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "neutral" }: { label: string; value: string; sub?: string; tone?: "neutral" | "accent" | "ok" | "warn" }) {
  const col = { neutral: "text-ink", accent: "text-accent", ok: "text-ok", warn: "text-warn" }[tone];
  return (
    <div className="card px-4 py-3.5 flex-1 min-w-[140px]">
      <div className="text-[11px] font-medium text-faint uppercase tracking-wider">{label}</div>
      <div className={`text-[22px] font-semibold mt-1 tabular-nums ${col}`}>{value}</div>
      {sub && <div className="text-[11px] text-dim mt-0.5">{sub}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub, action }: { icon: LucideIcon; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-11 h-11 rounded-xl bg-surface2 border border-line flex items-center justify-center mb-3">
        <Icon size={20} className="text-faint" />
      </div>
      <div className="text-sm font-medium text-ink">{title}</div>
      {sub && <div className="text-[13px] text-dim mt-1 max-w-xs">{sub}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = "accent", className = "" }: { value: number; tone?: "accent" | "ok" | "warn" | "danger"; className?: string }) {
  const c = { accent: "bg-accent", ok: "bg-ok", warn: "bg-warn", danger: "bg-danger" }[tone];
  return (
    <div className={`h-1.5 rounded-full bg-surface2 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-300 ${c}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-line mb-4 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-2 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
            active === t.id ? "border-accent text-ink" : "border-transparent text-dim hover:text-ink"
          }`}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 text-[11px] text-faint tabular-nums">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (b: boolean) => void; label?: string }) {
  return (
    <button onClick={() => onChange(!on)} className="flex items-center gap-2 cursor-pointer group">
      <span className={`w-8 h-[18px] rounded-full transition-colors relative ${on ? "bg-accent2" : "bg-raised border border-line2"}`}>
        <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all ${on ? "left-[16px]" : "left-[2px]"}`} />
      </span>
      {label && <span className="text-[13px] text-dim group-hover:text-ink">{label}</span>}
    </button>
  );
}
