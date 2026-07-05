"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  Scale,
  AlertTriangle,
  HelpCircle,
  Link2,
  Download,
  ChevronDown,
  ChevronRight,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { MeetingAnalysis, ActionItem } from "@/lib/types";

interface MeetingAnalysisViewProps {
  analysis: MeetingAnalysis;
  className?: string;
}

const priorityColors: Record<string, string> = {
  critical:
    "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

const statusColors: Record<string, string> = {
  pending:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "in-progress":
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  overdue:
    "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const impactColors: Record<string, string> = {
  high: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  medium:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const severityColors = priorityColors;

function Badge({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        colorClass,
      )}
    >
      {label}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  count,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  count?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
        <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        {count !== undefined && (
          <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
            {count}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EditableActionItem({
  item,
  onUpdate,
}: {
  item: ActionItem;
  onUpdate: (updated: ActionItem) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  const save = useCallback(() => {
    onUpdate(draft);
    setEditing(false);
  }, [draft, onUpdate]);

  const cancel = useCallback(() => {
    setDraft(item);
    setEditing(false);
  }, [item]);

  if (editing) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-3 space-y-2 dark:border-blue-900 dark:bg-blue-950/20">
        <input
          value={draft.task}
          onChange={(e) => setDraft({ ...draft, task: e.target.value })}
          className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input
            value={draft.owner}
            onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
            placeholder="Owner"
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={draft.priority}
            onChange={(e) =>
              setDraft({
                ...draft,
                priority: e.target.value as ActionItem["priority"],
              })
            }
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            value={draft.deadline}
            onChange={(e) =>
              setDraft({ ...draft, deadline: e.target.value })
            }
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft({
                ...draft,
                status: e.target.value as ActionItem["status"],
              })
            }
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={cancel}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            onClick={save}
            className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
          >
            <Check className="h-3 w-3" />
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm text-zinc-900 dark:text-zinc-100">{item.task}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge label={item.priority} colorClass={priorityColors[item.priority]} />
          <Badge label={item.status} colorClass={statusColors[item.status]} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {item.owner}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Due {item.deadline}
          </span>
        </div>
        {item.dependencies && item.dependencies.length > 0 && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Depends on: {item.dependencies.join(", ")}
          </p>
        )}
      </div>
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-opacity"
        title="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function MeetingAnalysisView({
  analysis,
  className,
}: MeetingAnalysisViewProps) {
  const [actionItems, setActionItems] = useState(analysis.actionItems);

  const handleUpdateAction = useCallback(
    (updated: ActionItem) => {
      setActionItems((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
    },
    [],
  );

  const handleExportJSON = useCallback(() => {
    const data = { ...analysis, actionItems };
    downloadFile(
      JSON.stringify(data, null, 2),
      "meeting-analysis.json",
      "application/json",
    );
  }, [analysis, actionItems]);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ["Task", "Owner", "Priority", "Deadline", "Status"],
      ...actionItems.map((a) => [
        a.task,
        a.owner,
        a.priority,
        a.deadline,
        a.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    downloadFile(csv, "action-items.csv", "text/csv");
  }, [actionItems]);

  const handleExportPDF = useCallback(() => {
    const text = [
      "MEETING ANALYSIS REPORT",
      "=" .repeat(50),
      "",
      "SUMMARY",
      analysis.summary,
      "",
      "ACTION ITEMS",
      ...actionItems.map(
        (a, i) =>
          `${i + 1}. [${a.priority.toUpperCase()}] ${a.task} - ${a.owner} (Due: ${a.deadline})`,
      ),
      "",
      "DECISIONS",
      ...analysis.decisions.map(
        (d, i) => `${i + 1}. ${d.decision} (by ${d.madeBy}) - Impact: ${d.impact}`,
      ),
      "",
      "RISKS",
      ...analysis.risks.map(
        (r, i) =>
          `${i + 1}. [${r.severity.toUpperCase()}] ${r.risk} - Mitigation: ${r.mitigation}`,
      ),
    ].join("\n");
    downloadFile(text, "meeting-analysis.txt", "text/plain");
  }, [analysis, actionItems]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Analysis Results
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Summary */}
      <Section title="Summary" icon={FileText}>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {analysis.summary}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {analysis.keyTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {topic}
            </span>
          ))}
        </div>
      </Section>

      {/* Action Items */}
      <Section
        title="Action Items"
        icon={CheckCircle2}
        count={actionItems.length}
      >
        <div className="space-y-1">
          {actionItems.map((item) => (
            <EditableActionItem
              key={item.id}
              item={item}
              onUpdate={handleUpdateAction}
            />
          ))}
        </div>
      </Section>

      {/* Decisions */}
      <Section
        title="Decisions"
        icon={Scale}
        count={analysis.decisions.length}
      >
        <div className="space-y-3">
          {analysis.decisions.map((d) => (
            <div key={d.id} className="space-y-1">
              <div className="flex items-start gap-2">
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {d.decision}
                </p>
                <Badge
                  label={d.impact}
                  colorClass={impactColors[d.impact]}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                By {d.madeBy} — {d.rationale}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Risks */}
      <Section
        title="Risks"
        icon={AlertTriangle}
        count={analysis.risks.length}
      >
        <div className="space-y-3">
          {analysis.risks.map((r) => (
            <div key={r.id} className="space-y-1">
              <div className="flex items-start gap-2">
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {r.risk}
                </p>
                <Badge
                  label={r.severity}
                  colorClass={severityColors[r.severity]}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Mitigation: {r.mitigation} (Owner: {r.owner})
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Open Questions */}
      <Section
        title="Open Questions"
        icon={HelpCircle}
        count={analysis.openQuestions.length}
      >
        <ul className="space-y-2">
          {analysis.openQuestions.map((q, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {i + 1}
              </span>
              {q}
            </li>
          ))}
        </ul>
      </Section>

      {/* Dependencies */}
      <Section
        title="Dependencies"
        icon={Link2}
        count={analysis.dependencies.length}
        defaultOpen={false}
      >
        <ul className="space-y-2">
          {analysis.dependencies.map((dep, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              {dep}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
