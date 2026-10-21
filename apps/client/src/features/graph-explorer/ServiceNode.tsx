import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { ServiceNodeData } from "./model.ts";

export type ServiceFlowNode = Node<ServiceNodeData, "service">;

const kindClass: Record<string, string> = {
  service: "bg-teal/15 text-teal",
  rds: "bg-gold/20 text-gold",
  sql: "bg-gold/20 text-gold",
  sqs: "bg-lilac/20 text-lilac",
  unknown: "bg-line text-muted",
};

const emphasisClass = {
  hot: "border-lime bg-panel opacity-100 shadow-[0_0_0_1px_rgba(214,255,74,0.35)]",
  match: "border-line bg-panel opacity-80",
  dim: "border-line bg-ink opacity-30",
} as const;

export function ServiceNode({ data }: NodeProps<ServiceFlowNode>) {
  const kindTone = kindClass[data.kind] ?? "bg-line text-muted";
  return (
    <div
      className={`w-[196px] rounded-md border px-3 py-2 text-left ${emphasisClass[data.emphasis]} ${data.selected ? "ring-2 ring-paper" : ""}`}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="flex items-center gap-1.5">
        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${kindTone}`}>
          {data.kind}
        </span>
        {data.publicExposed ? <span className="font-mono text-[10px] text-teal">public</span> : null}
        {data.synthetic ? <span className="font-mono text-[10px] text-muted">synthetic</span> : null}
        {data.vulnCount > 0 ? (
          <span className="ml-auto font-mono text-[10px] text-coral">{data.vulnCount} vuln</span>
        ) : null}
      </div>
      <p className="mt-1 truncate text-sm font-medium text-paper">{data.label}</p>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}
