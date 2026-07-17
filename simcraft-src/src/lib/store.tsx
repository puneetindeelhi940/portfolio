"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Scenario, View, WizardInput } from "./types";
import { generateScenario } from "./engine/generator";

const LS_KEY = "simcraft.scenarios.v1";
const LS_THEME = "simcraft.theme";

function seedScenarios(): Scenario[] {
  const mk = (input: WizardInput, status: Scenario["status"], daysAgo: number, uses: number, fav = false): Scenario => {
    const s = generateScenario(input);
    s.status = status;
    s.favorite = fav;
    s.uses = uses;
    s.createdAt = Date.now() - daysAgo * 86400000;
    s.updatedAt = s.createdAt + 3600000;
    if (status === "published") {
      s.version = 3;
      s.versions = [
        { version: 1, at: s.createdAt, author: "SimCraft AI", note: "Initial AI generation from wizard brief" },
        { version: 2, at: s.createdAt + 1800000, author: "Dr. L. Moreau", note: "Tightened critical-event timing; added confederate cue" },
        { version: 3, at: s.updatedAt, author: "S. Reyes, RN", note: "Approved after pilot run with cohort B" },
      ];
      s.comments = [
        { id: "c1", author: "Dr. L. Moreau", role: "Medical Faculty", text: "The deterioration beat lands well — cohort picked up the cue in under 90 seconds.", at: s.createdAt + 900000 },
        { id: "c2", author: "S. Reyes, RN", role: "Simulation Educator", text: "Suggest moving the family-member entrance 2 minutes later so it doesn't collide with the first intervention.", at: s.createdAt + 1200000 },
      ];
    }
    return s;
  };

  return [
    mk({ specialty: "Pediatrics", difficulty: "Intermediate", patientType: "Child", condition: "sepsis", objectives: ["Rapid Assessment", "Communication", "Medication Safety"], duration: 30, equipment: ["Mannequin", "IV Pump", "Crash Cart", "ECG"], prompt: "One unexpected deterioration event." }, "published", 12, 47, true),
    mk({ specialty: "Cardiology", difficulty: "Advanced", patientType: "Adult", condition: "mi", objectives: ["ECG", "CPR", "Leadership"], duration: 45, equipment: ["Defibrillator", "ECG", "Crash Cart", "Mannequin"], prompt: "" }, "published", 9, 63, true),
    mk({ specialty: "Emergency Medicine", difficulty: "Beginner", patientType: "Adult", condition: "anaphylaxis", objectives: ["Airway Management", "Rapid Assessment", "Medication Safety"], duration: 30, equipment: ["Airway Kit", "IV Pump", "Mannequin"], prompt: "" }, "published", 7, 38),
    mk({ specialty: "Trauma", difficulty: "Expert", patientType: "Adult", condition: "trauma", objectives: ["Leadership", "Communication", "Critical Thinking"], duration: 60, equipment: ["Ultrasound", "Crash Cart", "Mannequin", "IV Pump"], prompt: "Military variant with hidden second casualty." }, "in-review", 4, 12),
    mk({ specialty: "Emergency Medicine", difficulty: "Intermediate", patientType: "Geriatric", condition: "stroke", objectives: ["Rapid Assessment", "Critical Thinking", "Communication"], duration: 45, equipment: ["ECG", "Mannequin", "IV Pump"], prompt: "" }, "published", 3, 22),
    mk({ specialty: "ICU", difficulty: "Advanced", patientType: "Adult", condition: "asthma", objectives: ["Airway Management", "ABCDE", "Critical Thinking"], duration: 45, equipment: ["Ventilator", "Airway Kit", "Mannequin", "ECG"], prompt: "Silent chest trap." }, "draft", 1, 3),
  ];
}

interface Store {
  scenarios: Scenario[];
  current: Scenario | null;
  view: View;
  theme: "dark" | "light";
  pendingInput: WizardInput | null;
  copilotOpen: boolean;
  setCopilotOpen: (b: boolean) => void;
  setTheme: (t: "dark" | "light") => void;
  go: (v: View, scenario?: Scenario | null) => void;
  startGeneration: (input: WizardInput) => void;
  finishGeneration: () => Scenario;
  updateScenario: (s: Scenario, note?: string) => void;
  deleteScenario: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // App renders client-side only (ssr: false), so lazy initializers can read localStorage.
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as Scenario[]) : seedScenarios();
    } catch {
      return seedScenarios();
    }
  });
  const [current, setCurrent] = useState<Scenario | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [theme, setThemeState] = useState<"dark" | "light">(() => {
    try {
      return (localStorage.getItem(LS_THEME) as "dark" | "light" | null) || "dark";
    } catch {
      return "dark";
    }
  });
  const [pendingInput, setPendingInput] = useState<WizardInput | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(scenarios)); } catch {}
  }, [scenarios]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(LS_THEME, theme); } catch {}
  }, [theme]);

  const go = useCallback((v: View, scenario?: Scenario | null) => {
    if (scenario !== undefined) setCurrent(scenario);
    setView(v);
    window.scrollTo(0, 0);
  }, []);

  const startGeneration = useCallback((input: WizardInput) => {
    setPendingInput(input);
    setView("generating");
  }, []);

  const finishGeneration = useCallback((): Scenario => {
    const input = pendingInput!;
    const s = generateScenario(input);
    setScenarios((prev) => [s, ...prev]);
    setCurrent(s);
    setPendingInput(null);
    return s;
  }, [pendingInput]);

  const updateScenario = useCallback((s: Scenario, note?: string) => {
    const next: Scenario = {
      ...s,
      updatedAt: Date.now(),
      version: note ? s.version + 1 : s.version,
      versions: note ? [...s.versions, { version: s.version + 1, at: Date.now(), author: "You", note }] : s.versions,
    };
    setCurrent(next);
    setScenarios((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  }, []);

  const deleteScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((p) => p.id !== id));
    setCurrent((c) => (c?.id === id ? null : c));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setScenarios((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
    setCurrent((c) => (c?.id === id ? { ...c, favorite: !c.favorite } : c));
  }, []);

  const value = useMemo<Store>(() => ({
    scenarios, current, view, theme, pendingInput, copilotOpen,
    setCopilotOpen,
    setTheme: setThemeState,
    go, startGeneration, finishGeneration, updateScenario, deleteScenario, toggleFavorite,
  }), [scenarios, current, view, theme, pendingInput, copilotOpen, go, startGeneration, finishGeneration, updateScenario, deleteScenario, toggleFavorite]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
export function fmtAgo(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}
