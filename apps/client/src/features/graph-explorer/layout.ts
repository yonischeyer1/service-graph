import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

const NODE_WIDTH = 196;
const NODE_HEIGHT = 74;

export function layoutGraph<TNode extends Node>(
  nodes: TNode[],
  edges: Edge[],
): { nodes: TNode[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", nodesep: 26, ranksep: 78 });

  for (const node of nodes) {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }
  dagre.layout(graph);

  return {
    edges,
    nodes: nodes.map((node) => {
      const position = graph.node(node.id);
      return {
        ...node,
        position: {
          x: position.x - NODE_WIDTH / 2,
          y: position.y - NODE_HEIGHT / 2,
        },
      };
    }),
  };
}
