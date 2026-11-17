"use client";

import { useState } from "react";
import { profile } from "@/content/profile";

interface GraphNode {
  id: string;
  label: string;
  stage: string;
  x: number;
  y: number;
  width: number;
  height: number;
  role: string;
  decision: string;
}

const graphNodes: GraphNode[] = [
  {
    id: "goal_ingest",
    label: "01. Goal Ingest",
    stage: "Ingestion",
    x: 40,
    y: 60,
    width: 140,
    height: 44,
    role: "Extracts unstructured user instructions and validates input bounds.",
    decision: "Rejects arbitrary prompt parameters before routing into expensive LLM context.",
  },
  {
    id: "compound_key",
    label: "02. Namespace Key",
    stage: "Isolation",
    x: 230,
    y: 60,
    width: 150,
    height: 44,
    role: "Generates compound state key: (tenant_id, user_id, goal_id).",
    decision: "Strict multi-tenant isolation ensures zero cross-talk between concurrent agent goals.",
  },
  {
    id: "context_retrieve",
    label: "03. Tier Memory",
    stage: "Retrieval",
    x: 430,
    y: 60,
    width: 140,
    height: 44,
    role: "Queries 4-tier memory: verbatim turns, digests, and verified facts store.",
    decision: "Retrieves compacted summaries rather than thousands of noisy raw chat turns.",
  },
  {
    id: "plan_decompose",
    label: "04. Decompose",
    stage: "Planning",
    x: 620,
    y: 60,
    width: 140,
    height: 44,
    role: "Decomposes the high-level goal into an ordered DAG of concrete execution steps.",
    decision: "Limits sub-goal depth to 5 steps to prevent runaway recursive execution.",
  },
  {
    id: "tool_router",
    label: "05. Router (JSON)",
    stage: "Routing",
    x: 620,
    y: 170,
    width: 140,
    height: 44,
    role: "Matches active sub-task to registered tool using Pydantic JSON schema.",
    decision: "Switched from regex string extraction to strict enum schema to stop hallucinated tool names.",
  },
  {
    id: "tool_harness",
    label: "06. Tool Harness",
    stage: "Execution",
    x: 430,
    y: 170,
    width: 140,
    height: 44,
    role: "Executes target Python tool (database queries, web fetch, stock prices).",
    decision: "Runs tools inside a restricted process with strict timeout ceilings.",
  },
  {
    id: "schema_validator",
    label: "07. Validator",
    stage: "Validation",
    x: 230,
    y: 170,
    width: 150,
    height: 44,
    role: "Validates tool output payload against expected schema and bounds.",
    decision: "Catches empty results and database runtime exceptions before prompt synthesis.",
  },
  {
    id: "reflection_node",
    label: "08. Reflection",
    stage: "Critique",
    x: 40,
    y: 170,
    width: 140,
    height: 44,
    role: "Critiques tool result against sub-goal; branches to router on repairable error.",
    decision: "Explicit step budget counter prevents infinite retry cycles.",
  },
  {
    id: "memory_compact",
    label: "09. Digest Store",
    stage: "Compaction",
    x: 230,
    y: 280,
    width: 150,
    height: 44,
    role: "Compacts execution milestones into weekly rolling memory digest.",
    decision: "Saves high-level takeaways into permanent facts store for future retrieval.",
  },
  {
    id: "stream_egress",
    label: "10. Stream Egress",
    stage: "Delivery",
    x: 430,
    y: 280,
    width: 140,
    height: 44,
    role: "Streams sanitized thoughts and structured results via WebSocket to the UI.",
    decision: "Isolates UI database tables from the LangGraph internal checkpointer binary state.",
  },
];

export default function AgentArchitecture() {
  const [selectedNode, setSelectedNode] = useState<GraphNode>(graphNodes[4]); // default to router
  const [activeStepIndex, setActiveStepIndex] = useState<number>(4);

  const handleNextStep = () => {
    const nextIdx = (activeStepIndex + 1) % graphNodes.length;
    setActiveStepIndex(nextIdx);
    setSelectedNode(graphNodes[nextIdx]);
  };

  const handleSelectNode = (node: GraphNode, idx: number) => {
    setSelectedNode(node);
    setActiveStepIndex(idx);
  };

  return (
    <section id="approach" aria-labelledby="approach-title" className="py-20 md:py-32 rule-b">
      <div className="container-grid">
        {/* Section Header */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--graphite)] mb-6">
          <span>03 / HOW I BUILD AGENTS</span>
          <span>Figure 1.0 &middot; Cortex StateGraph</span>
        </div>

        <div className="max-w-2xl mb-12">
          <h2 id="approach-title" className="display-section text-[var(--ink)] mb-4 font-normal">
            Deterministic execution over <em className="italic text-[var(--accent)]">probabilistic chaos.</em>
          </h2>
          <p className="text-base text-[var(--graphite)] leading-relaxed">
            Multi-agent systems fail when state is treated as an afterthought. Every agent pipeline I build
            is designed like a distributed state machine: typed transitions, bounded retries, and clean
            isolation between checkpoints and application tables.
          </p>
        </div>

        {/* 12-Column Grid: SVG Diagram (Cols 1-8) + Engineering Principles (Cols 9-12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* Left: Academic-Style SVG Graph */}
          <div className="lg:col-span-8 paper-card p-6 md:p-8 rule-all">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 rule-b">
              <div>
                <p className="text-xs font-mono uppercase text-[var(--graphite)] tracking-wider">
                  Interactive StateGraph Architecture
                </p>
                <p className="text-xs font-sans text-[var(--ink)]">
                  Click or hover any node to inspect operational role and architectural decision.
                </p>
              </div>

              {/* Step-Through Request Tracer */}
              <button
                type="button"
                onClick={handleNextStep}
                className="text-xs font-mono px-3 py-1.5 rule-all bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                Trace Request Path (Node {activeStepIndex + 1}/10) &rarr;
              </button>
            </div>

            {/* Hand-Crafted SVG Graph (Paper/Ink/Vermilion Palette) */}
            <div className="overflow-x-auto pb-4">
              <svg
                viewBox="0 0 800 370"
                className="w-full min-w-[700px] h-auto font-mono text-xs select-none"
                aria-label="Cortex 10-node StateGraph Diagram"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="7"
                    markerHeight="6"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 3, 0 6" fill="var(--graphite)" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="7"
                    markerHeight="6"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 3, 0 6" fill="var(--accent)" />
                  </marker>
                </defs>

                {/* Main Forward Edges */}
                <path d="M 180 82 L 230 82" stroke="var(--rule)" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <path d="M 380 82 L 430 82" stroke="var(--rule)" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <path d="M 570 82 L 620 82" stroke="var(--rule)" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <path d="M 690 104 L 690 170" stroke="var(--rule)" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <path d="M 620 192 L 570 192" stroke="var(--rule)" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <path d="M 430 192 L 380 192" stroke="var(--rule)" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <path d="M 230 192 L 180 192" stroke="var(--rule)" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

                {/* Reflection Loop conditional edge (08 back to 05) */}
                <path
                  d="M 110 214 C 110 250, 690 250, 690 214"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  markerEnd="url(#arrowhead-active)"
                />
                <text x="400" y="246" textAnchor="middle" fill="var(--accent)" fontSize="9">
                  conditional critique loop (max depth: 5)
                </text>

                {/* Egress Edges */}
                <path d="M 110 214 L 230 295" stroke="var(--rule)" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <path d="M 380 302 L 430 302" stroke="var(--rule)" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

                {/* Render Nodes */}
                {graphNodes.map((node, nIdx) => {
                  const isCurrent = selectedNode.id === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => handleSelectNode(node, nIdx)}
                      onMouseEnter={() => handleSelectNode(node, nIdx)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={node.x}
                        y={node.y}
                        width={node.width}
                        height={node.height}
                        rx="2"
                        fill={isCurrent ? "var(--bg)" : "var(--surface)"}
                        stroke={isCurrent ? "var(--accent)" : "var(--rule)"}
                        strokeWidth={isCurrent ? "2" : "1"}
                      />
                      <text
                        x={node.x + 12}
                        y={node.y + 20}
                        fontSize="10"
                        fontWeight={isCurrent ? "bold" : "normal"}
                        fill={isCurrent ? "var(--accent)" : "var(--ink)"}
                      >
                        {node.label}
                      </text>
                      <text
                        x={node.x + 12}
                        y={node.y + 35}
                        fontSize="8.5"
                        fill="var(--graphite)"
                      >
                        [{node.stage}]
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Node Technical Margin Note */}
            <div className="rule-t pt-4 mt-2 flex flex-col md:flex-row md:items-baseline justify-between gap-4 text-xs font-mono">
              <div className="flex-1">
                <span className="text-[var(--accent)] font-semibold uppercase">
                  Active Node Detail:
                </span>{" "}
                <strong className="text-[var(--ink)]">{selectedNode.label}</strong> &mdash;{" "}
                <span className="text-[var(--graphite)]">{selectedNode.role}</span>
              </div>
              <div className="p-2.5 bg-[var(--code-bg)] text-[var(--ink)] max-w-sm">
                <span className="font-semibold block mb-0.5 text-[11px] uppercase">
                  Design Decision:
                </span>
                <span className="text-[11px] text-[var(--graphite)] leading-relaxed">
                  {selectedNode.decision}
                </span>
              </div>
            </div>

            {/* Accessible Non-JS Textual Degradation List */}
            <div className="sr-only">
              <h3>Cortex 10-Node Sequential Architecture</h3>
              <ol>
                {graphNodes.map((n) => (
                  <li key={n.id}>
                    <strong>{n.label}</strong> ({n.stage}): {n.role} — Design decision: {n.decision}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: 4 Engineering Principles in Plain Prose (Cols 9-12) */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--graphite)] rule-b pb-3">
              Four Production Principles
            </h3>

            {profile.principles.map((principle) => (
              <div key={principle.number} className="space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                    {principle.number}
                  </span>
                  <h4 className="font-serif text-lg text-[var(--ink)] font-normal">
                    {principle.title}
                  </h4>
                </div>
                <p className="text-xs text-[var(--graphite)] leading-relaxed pl-5">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
