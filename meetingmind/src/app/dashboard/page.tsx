"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { mockMeetings, mockAnalytics } from "@/data/mock";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{today}</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Meetings"
          value={mockAnalytics.totalMeetings}
          icon={BarChart3}
          trend={{ value: 12, label: "vs last month" }}
          index={0}
        />
        <StatCard
          label="Time Saved"
          value={`${mockAnalytics.timeSavedHours}h`}
          icon={Clock}
          trend={{ value: 18, label: "vs last month" }}
          index={1}
        />
        <StatCard
          label="Cost Saved"
          value={`$${(mockAnalytics.estimatedCostSaved / 1000).toFixed(1)}K`}
          icon={DollarSign}
          trend={{ value: 24, label: "vs last month" }}
          index={2}
        />
        <StatCard
          label="Completion Rate"
          value={`${mockAnalytics.completionRate}%`}
          icon={TrendingUp}
          trend={{ value: 5, label: "vs last month" }}
          index={3}
        />
      </div>

      {/* Upload Zone */}
      <UploadZone />

      {/* Recent Meetings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Meetings
          </h2>
          <Link
            href="/dashboard/meetings"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {mockMeetings.map((meeting, i) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
            >
              <Link
                href="/dashboard/meetings"
                className="flex items-center gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {meeting.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {meeting.date}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {meeting.duration}m
                    </span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {meeting.participants.length}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                    statusColors[meeting.status],
                  )}
                >
                  {meeting.status}
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
