"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, Bell, Key, Palette } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api", label: "API Keys", icon: Key },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-violet-500 text-zinc-900 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
      >
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Name
              </label>
              <input
                type="text"
                defaultValue="Puneet Arora"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue="puneet@meetingmind.ai"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Organization
              </label>
              <input
                type="text"
                defaultValue="MeetingMind Inc."
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <button className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 transition-colors">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4">
            {["Meeting analysis complete", "Action item overdue", "Weekly digest", "Risk alerts"].map((item) => (
              <div key={item} className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{item}</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="h-5 w-9 rounded-full bg-zinc-200 peer-checked:bg-violet-500 dark:bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === "api" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                defaultValue="sk-demo-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Supabase URL
              </label>
              <input
                type="text"
                defaultValue="https://demo.supabase.co"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              API keys are encrypted and stored securely. Demo mode is active.
            </p>
            <button className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 transition-colors">
              Update Keys
            </button>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Theme preferences are managed via the sidebar toggle. The app supports both light and dark modes with automatic system detection.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border-2 border-violet-500 bg-zinc-900 p-4 text-center">
                <div className="h-8 w-full rounded bg-zinc-800 mb-2" />
                <span className="text-xs text-zinc-400">Dark Mode</span>
              </div>
              <div className="rounded-lg border-2 border-zinc-200 bg-white p-4 text-center">
                <div className="h-8 w-full rounded bg-zinc-100 mb-2" />
                <span className="text-xs text-zinc-600">Light Mode</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
