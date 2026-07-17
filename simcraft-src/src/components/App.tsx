"use client";

import React from "react";
import { StoreProvider, useStore } from "@/lib/store";
import { Shell } from "./Shell";
import { Copilot } from "./Copilot";
import { Dashboard } from "./views/Dashboard";
import { Library } from "./views/Library";
import { Wizard } from "./views/Wizard";
import { Generating } from "./views/Generating";
import { Canvas } from "./views/Canvas";
import { Timeline } from "./views/Timeline";
import { Instructor } from "./views/Instructor";
import { Learner } from "./views/Learner";
import { Assessment } from "./views/Assessment";
import { Debrief } from "./views/Debrief";
import { Validation } from "./views/Validation";
import { Analytics } from "./views/Analytics";
import { ExportView } from "./views/ExportView";

function Router() {
  const { view, current } = useStore();

  // scenario views require an open scenario
  const needsScenario = ["canvas", "timeline", "instructor", "learner", "assessment", "debrief", "validation", "export"];
  if (needsScenario.includes(view) && !current) return <Dashboard />;

  switch (view) {
    case "dashboard": return <Dashboard />;
    case "library": return <Library />;
    case "wizard": return <Wizard />;
    case "generating": return <Generating />;
    case "canvas": return <Canvas />;
    case "timeline": return <Timeline />;
    case "instructor": return <Instructor />;
    case "learner": return <Learner />;
    case "assessment": return <Assessment />;
    case "debrief": return <Debrief />;
    case "validation": return <Validation />;
    case "analytics": return <Analytics />;
    case "export": return <ExportView />;
    default: return <Dashboard />;
  }
}

export function App() {
  return (
    <StoreProvider>
      <Shell>
        <Router />
      </Shell>
      <Copilot />
    </StoreProvider>
  );
}
