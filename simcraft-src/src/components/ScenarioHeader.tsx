"use client";

import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, History, MessageSquare, Send, UserCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, Button } from "./ui";
import { Scenario } from "@/lib/types";

export function ScenarioHeader({ s, title, sub }: { s: Scenario; title: string; sub?: string }) {
  const { go, updateScenario } = useStore();
  const [collab, setCollab] = useState(false);
  const [comment, setComment] = useState("");

  const publish = () => {
    if (s.status === "published") return;
    updateScenario({ ...s, status: "published" }, "Published after AI validation review");
  };
  const requestReview = () => {
    if (s.status !== "draft") return;
    updateScenario({ ...s, status: "in-review" }, "Review requested from workspace reviewers");
  };
  const addComment = () => {
    if (!comment.trim()) return;
    updateScenario({ ...s, comments: [...s.comments, { id: `c-${Date.now()}`, author: "You", role: "Educator", text: comment.trim(), at: Date.now() }] });
    setComment("");
  };

  return (
    <div className="border-b border-line bg-bg2/70 backdrop-blur sticky top-0 z-30">
      <div className="px-6 h-14 flex items-center gap-3">
        <button onClick={() => go("library")} className="p-1.5 rounded-md text-dim hover:text-ink hover:bg-surface2 cursor-pointer" aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] font-semibold truncate tracking-tight">{title}</h1>
            <Badge tone={s.status === "published" ? "ok" : s.status === "in-review" ? "warn" : "neutral"}>{s.status}</Badge>
            <Badge>v{s.version}</Badge>
          </div>
          {sub && <div className="text-[11px] text-faint truncate">{sub}</div>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="ghost" icon={MessageSquare} onClick={() => setCollab(!collab)}>
            {s.comments.length > 0 ? s.comments.length : ""} Comments
          </Button>
          {s.status === "draft" && <Button size="sm" icon={UserCheck} onClick={requestReview}>Request review</Button>}
          {s.status !== "published" && <Button size="sm" variant="primary" icon={CheckCircle2} onClick={publish}>Publish</Button>}
        </div>
      </div>

      {collab && (
        <div className="px-6 pb-4 grid md:grid-cols-2 gap-4 border-t border-line pt-4 bg-bg2">
          <div>
            <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-2 flex items-center gap-1.5"><MessageSquare size={11}/> Comments</div>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {s.comments.length === 0 && <div className="text-[12px] text-faint">No comments yet — reviewers will see this thread.</div>}
              {s.comments.map((c) => (
                <div key={c.id} className="card px-3 py-2">
                  <div className="text-[11px] text-faint"><span className="font-medium text-dim">{c.author}</span> · {c.role}</div>
                  <div className="text-[12.5px] mt-0.5 leading-snug">{c.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Leave a comment for the team…"
                className="flex-1 h-8 px-3 rounded-lg bg-surface border border-line text-[12px] outline-none focus:border-accent placeholder:text-faint"
              />
              <Button size="sm" icon={Send} onClick={addComment} />
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-faint uppercase tracking-widest mb-2 flex items-center gap-1.5"><History size={11}/> Version history</div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {[...s.versions].reverse().map((vv) => (
                <div key={vv.version} className="flex items-start gap-2.5 text-[12px]">
                  <span className="font-mono text-[10.5px] text-accent bg-accent-soft rounded px-1.5 py-0.5 shrink-0 mt-0.5">v{vv.version}</span>
                  <div>
                    <span className="text-ink">{vv.note}</span>
                    <div className="text-[10.5px] text-faint">{vv.author} · {new Date(vv.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
