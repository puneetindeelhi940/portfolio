"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState,
  Handle, Position, type Node, type Edge, type Connection, type NodeProps, MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Activity, Brain, ChevronDown, ChevronUp, ClipboardList, Copy, GitBranch,
  HeartPulse, Pill, RefreshCcw, Save, Sparkles, Split, Stethoscope, Trash2, TriangleAlert, UserRound,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { BranchKind, NodeKind, SimNode } from "@/lib/types";
import { findCondition } from "@/lib/engine/conditions";
import { ScenarioHeader } from "../ScenarioHeader";
import { Button } from "../ui";

type CanvasNodeData = {
  label: string;
  detail: string;
  kind: NodeKind;
  branch?: BranchKind;
  expanded: boolean;
  [key: string]: unknown;
};
type CanvasNode = Node<CanvasNodeData>;

const KIND_META: Record<NodeKind, { icon: typeof Brain; label: string }> = {
  patient: { icon: UserRound, label: "Patient" },
  assessment: { icon: Stethoscope, label: "Assessment" },
  diagnosis: { icon: Brain, label: "Diagnosis" },
  decision: { icon: Split, label: "Decision" },
  treatment: { icon: Pill, label: "Treatment" },
  response: { icon: HeartPulse, label: "Response" },
  complication: { icon: TriangleAlert, label: "Complication" },
  recovery: { icon: Activity, label: "Recovery" },
  outcome: { icon: ClipboardList, label: "Outcome" },
};

const BRANCH_COLOR: Record<string, string> = {
  correct: "var(--ok)",
  incorrect: "var(--danger)",
  delayed: "var(--warn)",
  none: "var(--accent)",
};

function SimNodeView({ data, selected }: NodeProps<CanvasNode>) {
  const meta = KIND_META[data.kind];
  const Icon = meta.icon;
  const accent = BRANCH_COLOR[data.branch || "none"];
  return (
    <div
      className={`sim-node rounded-xl border bg-surface w-[240px] transition-shadow ${selected ? "" : ""}`}
      style={{ borderColor: selected ? "var(--accent)" : "var(--line)", boxShadow: selected ? "0 0 0 3px var(--accent-soft)" : "var(--shadow)" }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <span className="w-5.5 h-5.5 w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, " + accent + " 14%, transparent)" }}>
          <Icon size={12} style={{ color: accent }} />
        </span>
        <span className="text-[9.5px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
          {meta.label}{data.branch ? ` · ${data.branch}` : ""}
        </span>
      </div>
      <div className="px-3 py-2">
        <div className="text-[12.5px] font-medium leading-snug text-ink">{data.label}</div>
        {data.expanded && <div className="text-[11px] text-dim leading-relaxed mt-1.5">{data.detail}</div>}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { sim: SimNodeView };

export function Canvas() {
  const { current, updateScenario, theme } = useStore();
  const s = current!;

  const initialNodes: CanvasNode[] = useMemo(
    () => s.nodes.map((n) => ({
      id: n.id,
      type: "sim",
      position: { x: n.x, y: n.y },
      data: { label: n.label, detail: n.detail, kind: n.kind, branch: n.branch, expanded: true },
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.id]
  );
  const initialEdges: Edge[] = useMemo(
    () => s.edges.map((e) => ({
      id: e.id, source: e.source, target: e.target, label: e.label,
      animated: e.branch === "correct",
      style: { stroke: BRANCH_COLOR[e.branch || "none"], opacity: 0.75 },
      labelStyle: { fill: "var(--dim)", fontSize: 10 },
      labelBgStyle: { fill: "var(--surface2)" },
      markerEnd: { type: MarkerType.ArrowClosed, color: BRANCH_COLOR[e.branch || "none"] },
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.id]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge({ ...c, markerEnd: { type: MarkerType.ArrowClosed, color: "var(--accent)" }, style: { stroke: "var(--accent)", opacity: 0.75 } }, eds)),
    [setEdges]
  );

  const selected = nodes.find((n) => n.id === selectedId) || null;

  const mutate = (fn: (n: CanvasNode) => CanvasNode) =>
    setNodes((ns) => ns.map((n) => (n.id === selectedId ? fn(n) : n)));

  const duplicate = () => {
    if (!selected) return;
    const id = `n-${Date.now()}`;
    setNodes((ns) => [...ns, { ...selected, id, selected: false, position: { x: selected.position.x + 40, y: selected.position.y + 120 } }]);
    flash("Node duplicated");
  };
  const remove = () => {
    if (!selected) return;
    setNodes((ns) => ns.filter((n) => n.id !== selectedId));
    setEdges((es) => es.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
    flash("Node deleted");
  };
  const branch = () => {
    if (!selected) return;
    const id = `n-${Date.now()}`;
    const nn: CanvasNode = {
      id, type: "sim",
      position: { x: selected.position.x + 320, y: selected.position.y + 160 },
      data: { label: "New branch outcome", detail: "Describe what happens on this path — the learner action that leads here, and the physiological consequence.", kind: "complication", branch: "incorrect", expanded: true },
    };
    setNodes((ns) => [...ns, nn]);
    setEdges((es) => [...es, { id: `${selected.id}-${id}`, source: selected.id, target: id, label: "alternative path", style: { stroke: "var(--danger)", opacity: 0.75 }, markerEnd: { type: MarkerType.ArrowClosed, color: "var(--danger)" } }]);
    flash("Branch added — drag to reposition, click to edit");
  };
  const aiSuggest = () => {
    const t = findCondition(s.input.condition);
    const anchor = selected || nodes.find((n) => n.data.kind === "decision") || nodes[nodes.length - 1];
    const idea = t.hiddenComplications[Math.floor(Math.random() * t.hiddenComplications.length)];
    const id = `n-ai-${Date.now()}`;
    setNodes((ns) => [...ns, {
      id, type: "sim",
      position: { x: anchor.position.x + 320, y: anchor.position.y - 180 },
      data: { label: "AI suggestion: " + idea.split(" ").slice(0, 6).join(" ") + "…", detail: idea + " — wired as an instructor-triggered branch so it never fires automatically.", kind: "complication", branch: "delayed", expanded: true },
    }]);
    setEdges((es) => [...es, { id: `${anchor.id}-${id}`, source: anchor.id, target: id, label: "AI suggested", style: { stroke: "var(--warn)", opacity: 0.8, strokeDasharray: "6 4" }, markerEnd: { type: MarkerType.ArrowClosed, color: "var(--warn)" } }]);
    flash("AI added a suggested complication branch");
  };
  const save = () => {
    const outNodes: SimNode[] = nodes.map((n) => ({
      id: n.id, kind: n.data.kind, label: n.data.label, detail: n.data.detail, branch: n.data.branch,
      x: Math.round(n.position.x), y: Math.round(n.position.y),
    }));
    const outEdges = edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: typeof e.label === "string" ? e.label : undefined }));
    updateScenario({ ...s, nodes: outNodes, edges: outEdges }, "Canvas edited: flow structure updated");
    flash("Canvas saved as v" + (s.version + 1));
  };
  const relayout = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    flash("Reset to generated layout");
  };
  const toggleAll = (expanded: boolean) => setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, expanded } })));

  return (
    <div className="h-screen flex flex-col">
      <ScenarioHeader s={s} title={s.title} sub={`${s.patient.name}, ${s.patient.age} · ${s.chiefComplaint.slice(0, 70)}…`} />

      {/* Toolbar */}
      <div className="px-6 py-2 border-b border-line flex items-center gap-2 bg-bg flex-wrap">
        <Button size="sm" icon={Sparkles} variant="primary" onClick={aiSuggest}>AI Suggest</Button>
        <Button size="sm" icon={GitBranch} onClick={branch} disabled={!selected}>Branch</Button>
        <Button size="sm" icon={Copy} onClick={duplicate} disabled={!selected}>Duplicate</Button>
        <Button size="sm" icon={Trash2} variant="danger" onClick={remove} disabled={!selected}>Delete</Button>
        <div className="w-px h-5 bg-line mx-1" />
        <Button size="sm" icon={ChevronDown} variant="ghost" onClick={() => toggleAll(true)}>Expand</Button>
        <Button size="sm" icon={ChevronUp} variant="ghost" onClick={() => toggleAll(false)}>Collapse</Button>
        <Button size="sm" icon={RefreshCcw} variant="ghost" onClick={relayout}>Reset layout</Button>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 text-[10.5px] text-faint">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-ok inline-block" /> correct path</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger inline-block" /> incorrect</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warn inline-block" /> delayed</span>
          </div>
          <Button size="sm" icon={Save} onClick={save}>Save canvas</Button>
        </div>
      </div>

      {/* Inspector for selected node */}
      {selected && (
        <div className="px-6 py-2.5 border-b border-line bg-surface flex items-center gap-3 flex-wrap">
          <span className="text-[10.5px] font-semibold text-faint uppercase tracking-widest shrink-0">Edit node</span>
          <input
            value={selected.data.label}
            onChange={(e) => mutate((n) => ({ ...n, data: { ...n.data, label: e.target.value } }))}
            className="h-8 px-3 rounded-lg bg-bg border border-line text-[12.5px] outline-none focus:border-accent w-[240px]"
          />
          <input
            value={selected.data.detail}
            onChange={(e) => mutate((n) => ({ ...n, data: { ...n.data, detail: e.target.value } }))}
            className="h-8 px-3 rounded-lg bg-bg border border-line text-[12.5px] outline-none focus:border-accent flex-1 min-w-[220px]"
          />
          <select
            value={selected.data.kind}
            onChange={(e) => mutate((n) => ({ ...n, data: { ...n.data, kind: e.target.value as NodeKind } }))}
            className="h-8 px-2 rounded-lg bg-bg border border-line text-[12px] text-dim outline-none cursor-pointer"
          >
            {Object.keys(KIND_META).map((k) => <option key={k} value={k}>{KIND_META[k as NodeKind].label}</option>)}
          </select>
        </div>
      )}

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={(sel) => setSelectedId(sel.nodes[0]?.id ?? null)}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          colorMode={theme}
          minZoom={0.25}
        >
          <Background gap={22} size={1.2} color="var(--line2)" />
          <Controls position="bottom-left" />
          <MiniMap pannable zoomable nodeColor={() => "var(--accent)"} maskColor="transparent" style={{ width: 160, height: 110 }} />
        </ReactFlow>
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-raised border border-line text-[12.5px] shadow-lg z-10">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
