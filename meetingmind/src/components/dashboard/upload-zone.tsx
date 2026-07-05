"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, FileText } from "lucide-react";
import { MeetingAnalysis as MeetingAnalysisType } from "@/lib/types";
import { MeetingAnalysisView } from "./meeting-analysis";

const simulatedAnalysis: MeetingAnalysisType = {
  summary:
    "The team discussed AI search feature progress (87% ML accuracy, targeting 92%), backend performance optimization via Redis caching, mobile UI completion, and SSO integration challenges for Acme Corp. Key decisions were made to build a custom analytics dashboard and to bring in an auth contractor for the enterprise SSO work.",
  actionItems: [
    {
      id: "new-001",
      task: "Implement Redis caching for search queries to reduce response time from 2.3s to under 1.5s",
      owner: "James Wilson",
      priority: "critical",
      deadline: "2026-07-11",
      status: "pending",
    },
    {
      id: "new-002",
      task: "Continue ML model training to reach 92% accuracy threshold",
      owner: "Priya Patel",
      priority: "high",
      deadline: "2026-07-10",
      status: "in-progress",
    },
    {
      id: "new-003",
      task: "Find and hire auth contractor for enterprise SSO integration",
      owner: "James Wilson",
      priority: "high",
      deadline: "2026-07-11",
      status: "pending",
    },
    {
      id: "new-004",
      task: "Begin dashboard wireframes for search analytics feature",
      owner: "Mike Torres",
      priority: "medium",
      deadline: "2026-07-14",
      status: "pending",
    },
  ],
  decisions: [
    {
      id: "nd-001",
      decision: "Build custom analytics dashboard instead of integrating third-party tool",
      madeBy: "Sarah Chen",
      rationale: "Custom dashboards are a differentiator for enterprise clients",
      impact: "high",
    },
    {
      id: "nd-002",
      decision: "Add search suggestions feature to Q3 backlog, not blocking initial launch",
      madeBy: "Sarah Chen",
      rationale: "Must stay focused on August 15 deadline for core search feature",
      impact: "medium",
    },
  ],
  risks: [
    {
      id: "nr-001",
      risk: "Search response time exceeds 1.5s target for complex queries",
      severity: "high",
      mitigation: "Redis caching expected to reduce response time by 40% for repeat queries",
      owner: "James Wilson",
    },
    {
      id: "nr-002",
      risk: "Acme Corp SSO integration more complex than estimated due to non-standard LDAP",
      severity: "high",
      mitigation: "Bring in specialist contractor; extend timeline by 2 weeks",
      owner: "James Wilson",
    },
  ],
  openQuestions: [
    "What is the budget for the auth contractor?",
    "Should search suggestions use ML-based or rule-based approach?",
  ],
  dependencies: [
    "ML model training completion (targeting 92% accuracy)",
    "Redis infrastructure provisioning",
    "Auth contractor onboarding",
  ],
  sentiment: "positive",
  keyTopics: [
    "AI Search",
    "Performance Optimization",
    "SSO Integration",
    "Analytics Dashboard",
    "Hiring",
  ],
};

export function UploadZone() {
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<MeetingAnalysisType | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAnalyze = useCallback(() => {
    if (!transcript.trim()) return;
    setProcessing(true);
    setProgress(0);
    setAnalysis(null);

    const steps = [12, 28, 45, 58, 72, 85, 93, 100];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        setProcessing(false);
        setAnalysis(simulatedAnalysis);
      }
    }, 350);
  }, [transcript]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const text = e.dataTransfer.getData("text/plain");
    if (text) setTranscript(text);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 transition-colors",
          isDragOver
            ? "border-blue-400 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20"
            : "border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <FileText className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Upload Transcript
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Paste or drag your meeting transcript to analyze
            </p>
          </div>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your transcript here..."
          className={cn(
            "w-full min-h-[160px] rounded-lg border p-4 text-sm resize-none",
            "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400",
            "dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            "dark:focus:ring-blue-500/20 dark:focus:border-blue-500",
            "transition-colors",
          )}
          disabled={processing}
        />

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            <Upload className="h-3.5 w-3.5" />
            <span>Drag and drop or paste text</span>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!transcript.trim() || processing}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              "bg-zinc-900 text-white hover:bg-zinc-800",
              "dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <Sparkles className="h-4 w-4" />
            Analyze with AI
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5 text-blue-500" />
              </motion.div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Analyzing transcript...
              </span>
              <div className="flex gap-1 ml-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-blue-500"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  {progress < 30
                    ? "Parsing transcript..."
                    : progress < 60
                      ? "Extracting action items..."
                      : progress < 90
                        ? "Identifying risks and decisions..."
                        : "Generating summary..."}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analysis && !processing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MeetingAnalysisView analysis={analysis} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
