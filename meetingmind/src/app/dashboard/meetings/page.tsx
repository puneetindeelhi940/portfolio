"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  Calendar,
  Users,
  Clock,
  ChevronDown,
  X,
} from "lucide-react";
import { mockMeetings } from "@/data/mock";
import { MeetingAnalysisView } from "@/components/dashboard/meeting-analysis";
import { Meeting } from "@/lib/types";

const statusColors: Record<string, string> = {
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  processing:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const sentimentEmoji: Record<string, string> = {
  positive: "🟢",
  neutral: "🔵",
  mixed: "🟡",
  negative: "🔴",
};

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredMeetings = mockMeetings.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.participants.some((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      m.analysis?.keyTopics.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Meetings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {mockMeetings.length} meetings analyzed
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search meetings, participants, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm",
            "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400",
            "dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
            "transition-colors",
          )}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {/* Meetings list */}
      <div className="space-y-3">
        {filteredMeetings.map((meeting, i) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedId(expandedId === meeting.id ? null : meeting.id)
              }
              className="flex w-full items-center gap-4 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Calendar className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {meeting.title}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                      statusColors[meeting.status],
                    )}
                  >
                    {meeting.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <Calendar className="h-3 w-3" />
                    {meeting.date}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {meeting.duration}m
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <Users className="h-3 w-3" />
                    {meeting.participants.join(", ")}
                  </div>
                </div>
                {meeting.analysis && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {meeting.analysis.keyTopics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {meeting.analysis && (
                  <span className="text-xs" title={`Sentiment: ${meeting.analysis.sentiment}`}>
                    {sentimentEmoji[meeting.analysis.sentiment]}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-zinc-400 transition-transform",
                    expandedId === meeting.id && "rotate-180",
                  )}
                />
              </div>
            </button>

            <AnimatePresence>
              {expandedId === meeting.id && meeting.analysis && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
                    <MeetingAnalysisView analysis={meeting.analysis} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {filteredMeetings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No meetings found matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
