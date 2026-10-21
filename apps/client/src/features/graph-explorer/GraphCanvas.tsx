import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useReactFlow,
  type Edge,
} from "@xyflow/react";
import { useEffect } from "react";
import "@xyflow/react/dist/style.css";
import type { Graph, RoutesResponse } from "@service-graph/contracts";
import { layoutGraph } from "./layout.ts";
import type { Emphasis, ServiceNodeData } from "./model.ts";
import { ServiceNode, type ServiceFlowNode } from "./ServiceNode.tsx";

const nodeTypes = { service: ServiceNode };

function FocusRoute({ routeKey }: { routeKey: string }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const nodeIds = routeKey === "all" ? undefined : routeKey.split("→");
    const frame = requestAnimationFrame(() => {
      void fitView({
        nodes: nodeIds?.map((id) => ({ id })),
        padding: nodeIds ? 0.4 : 0.12,
        duration: 250,
        maxZoom: 1.1,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [fitView, routeKey]);

  return null;
}

const edgeColor: Record<Emphasis, string> = {
  hot: "#d6ff4a",
  match: "#8d8678",
  dim: "#3a342c",
};

interface GraphCanvasProps {
  graph: Graph;
  routes: RoutesResponse;
  selectedRoute: number | null;
  selectedNode: string | null;
  onSelectNode: (name: string) => void;
}

function hopKey(from: string, to: string): string {
  return `${from}→${to}`;
}

export function GraphCanvas({ graph, routes, selectedRoute, selectedNode, onSelectNode }: GraphCanvasProps) {
  const activeRoute = selectedRoute === null ? null : routes.routes[selectedRoute];
  const hotNodes = new Set(activeRoute ?? routes.routes.flat());
  const matchNodes = new Set(routes.routes.flat());
  const hotHops = new Set<string>();
  const matchHops = new Set<string>();

  for (const route of routes.routes) {
    for (let index = 0; index < route.length - 1; index += 1) {
      const from = route[index];
      const to = route[index + 1];
      if (from && to) matchHops.add(hopKey(from, to));
    }
  }
  if (activeRoute) {
    for (let index = 0; index < activeRoute.length - 1; index += 1) {
      const from = activeRoute[index];
      const to = activeRoute[index + 1];
      if (from && to) hotHops.add(hopKey(from, to));
    }
  }

  const nodes: ServiceFlowNode[] = graph.nodes.map((node) => {
    const emphasis: Emphasis = hotNodes.has(node.name) ? "hot" : matchNodes.has(node.name) ? "match" : "dim";
    const data: ServiceNodeData = {
      label: node.name,
      kind: node.kind,
      publicExposed: node.publicExposed === true,
      vulnCount: node.vulnerabilities?.length ?? 0,
      synthetic: node.synthetic === true,
      emphasis: activeRoute ? emphasis : hotNodes.has(node.name) ? "hot" : "dim",
      selected: node.name === selectedNode,
    };
    return {
      id: node.name,
      type: "service",
      position: { x: 0, y: 0 },
      data,
    };
  });

  const edges: Edge[] = graph.edges.flatMap((edge) =>
    edge.to.map((target) => {
      const key = hopKey(edge.from, target);
      const emphasis: Emphasis = hotHops.has(key) ? "hot" : !activeRoute && matchHops.has(key) ? "hot" : matchHops.has(key) ? "match" : "dim";
      return {
        id: key,
        source: edge.from,
        target,
        animated: emphasis === "hot",
        style: { stroke: edgeColor[emphasis], strokeWidth: emphasis === "hot" ? 2.4 : 1.2 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: edgeColor[emphasis] },
      };
    }),
  );

  const laidOut = layoutGraph(nodes, edges);

  return (
    <div className="relative h-[68svh] min-h-80 bg-[#100e0c] lg:h-full">
      <ReactFlow
        nodes={laidOut.nodes}
        edges={laidOut.edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_event, node) => onSelectNode(node.id)}
        fitView
        minZoom={0.15}
        nodesConnectable={false}
        proOptions={{ hideAttribution: false }}
      >
        <FocusRoute routeKey={activeRoute?.join("→") ?? "all"} />
        <Background color="#3a342c" gap={22} />
        <Controls showInteractive={false} />
      </ReactFlow>
      {routes.meta.routeCount === 0 ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <p className="max-w-lg rounded-md border border-line bg-panel/95 px-4 py-3 text-sm text-paper">
            No routes match these filters.
            {routes.meta.appliedFilters.includes("public-start") &&
            routes.meta.appliedFilters.includes("sink-end") &&
            routes.meta.appliedFilters.includes("vulnerable")
              ? " In this graph the public frontend never reaches prod-postgresdb, so those three filters together are empty."
              : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
