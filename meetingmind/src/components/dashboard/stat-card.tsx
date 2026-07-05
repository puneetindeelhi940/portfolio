"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  index?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-6",
        "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800",
        "hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.value >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            "bg-zinc-100 dark:bg-zinc-800",
            "group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors",
          )}
        >
          <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-zinc-600" />
    </motion.div>
  );
}
