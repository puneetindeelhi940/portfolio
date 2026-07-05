"use client";

import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
            <Brain className="h-3.5 w-3.5 text-accent" />
          </div>
          <span className="text-sm font-medium text-foreground">
            MeetingMind AI
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MeetingMind AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
