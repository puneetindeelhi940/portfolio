"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Send,
  Sparkles,
  MessageSquare,
  Brain,
  User,
} from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { aiChatResponses } from "@/data/mock";
import { generateId } from "@/lib/utils";

const suggestions = [
  "What changed since the previous meeting?",
  "Which action items are overdue?",
  "Summarize all marketing meetings.",
];

const genericResponses = [
  "Based on my analysis of your 5 most recent meetings, I can see a strong focus on the AI Search feature launch. The team has been making steady progress, with ML model accuracy improving and backend infrastructure being prepared. Would you like me to drill deeper into any specific aspect?",
  "Looking across your meeting data, I notice several recurring themes: product development velocity, enterprise client concerns (particularly Acme Corp's SSO needs), and marketing campaign preparation. The overall team sentiment has been positive with some mixed feelings around CI/CD challenges.",
  "I've analyzed the patterns across your recent meetings. The team appears well-aligned on Q3 priorities, with the main tension point being the timeline for SSO integration. There are currently 17 active action items across 5 owners, with a 78% completion rate. Would you like a more detailed breakdown?",
];

export default function AskAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      const delay = 1000 + Math.random() * 1500;
      setTimeout(() => {
        const response =
          aiChatResponses[text.trim()] ||
          genericResponses[Math.floor(Math.random() * genericResponses.length)];

        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
      }, delay);
    },
    [isTyping],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Ask AI
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ask questions about your meetings, action items, and trends
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 mb-4">
              <MessageSquare className="h-8 w-8 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Meeting Intelligence Assistant
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
              Ask me anything about your meetings. I can summarize trends,
              find overdue items, compare meetings, and surface insights.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 mt-0.5">
                  <Brain className="h-4 w-4 text-violet-500" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
                )}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <strong key={i}>{part.slice(2, -2)}</strong>
                      );
                    }
                    return part;
                  })}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700 mt-0.5">
                  <User className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 mt-0.5">
              <Brain className="h-4 w-4 text-violet-500" />
            </div>
            <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500"
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
          </motion.div>
        )}

        {/* Suggestion chips after messages */}
        {messages.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 pt-2"
          >
            {suggestions
              .filter(
                (s) => !messages.some((m) => m.content === s),
              )
              .map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  {s}
                </button>
              ))}
          </motion.div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-4 bg-white dark:bg-zinc-950">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your meetings..."
            disabled={isTyping}
            className={cn(
              "flex-1 rounded-lg border px-4 py-2.5 text-sm",
              "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400",
              "dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
              "disabled:opacity-50",
              "transition-colors",
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all",
              "bg-zinc-900 text-white hover:bg-zinc-800",
              "dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
