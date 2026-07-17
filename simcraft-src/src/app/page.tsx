"use client";

import dynamic from "next/dynamic";

// The whole studio is client-state driven (localStorage, canvas, timers) —
// render it client-side only to keep the static export hydration-clean.
const App = dynamic(() => import("@/components/App").then((m) => m.App), { ssr: false });

export default function Home() {
  return <App />;
}
