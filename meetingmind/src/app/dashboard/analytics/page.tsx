"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  DollarSign,
  TrendingUp,
  Timer,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { mockAnalytics } from "@/data/mock";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";

function ChartCard({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
    >
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const textColor = isDark ? "#a1a1aa" : "#71717a";
  const tooltipBg = isDark ? "#18181b" : "#ffffff";
  const tooltipBorder = isDark ? "#3f3f46" : "#e4e4e7";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Analytics
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Meeting intelligence insights and trends
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Meetings"
          value={mockAnalytics.totalMeetings}
          icon={BarChart3}
          index={0}
        />
        <StatCard
          label="Time Saved"
          value={`${mockAnalytics.timeSavedHours}h`}
          icon={Clock}
          index={1}
        />
        <StatCard
          label="Cost Saved"
          value={`$${(mockAnalytics.estimatedCostSaved / 1000).toFixed(1)}K`}
          icon={DollarSign}
          index={2}
        />
        <StatCard
          label="Completion Rate"
          value={`${mockAnalytics.completionRate}%`}
          icon={TrendingUp}
          index={3}
        />
        <StatCard
          label="Avg Meeting"
          value={`${mockAnalytics.avgMeetingLength}m`}
          icon={Timer}
          index={4}
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Meetings per week */}
        <ChartCard title="Meetings Per Week" delay={0.3}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalytics.meetingsPerWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Meetings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Action completion trend */}
        <ChartCard title="Action Completion Trend" delay={0.4}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockAnalytics.actionCompletionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#a1a1aa" strokeWidth={2} name="Total" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={2} name="Completed" dot={{ r: 3 }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top owners */}
        <ChartCard title="Top Action Item Owners" delay={0.5}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalytics.topOwners} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="completed" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Completed" stackId="a" />
                <Bar dataKey="items" fill="#ddd6fe" radius={[0, 4, 4, 0]} name="Total" stackId="b" />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Risk trend */}
        <ChartCard title="Risk Trend" delay={0.6}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAnalytics.riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="critical" stackId="1" fill="#ef4444" fillOpacity={0.6} stroke="#ef4444" name="Critical" />
                <Area type="monotone" dataKey="high" stackId="1" fill="#f97316" fillOpacity={0.6} stroke="#f97316" name="High" />
                <Area type="monotone" dataKey="medium" stackId="1" fill="#eab308" fillOpacity={0.6} stroke="#eab308" name="Medium" />
                <Area type="monotone" dataKey="low" stackId="1" fill="#22c55e" fillOpacity={0.6} stroke="#22c55e" name="Low" />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
