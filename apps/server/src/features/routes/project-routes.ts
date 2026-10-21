import type { Graph, GraphEdge, GraphNode } from '@service-graph/contracts';

export function projectRoutes(
  graph: Graph,
  routes: readonly (readonly string[])[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const usedNodes = new Set(routes.flat());
  const usedHops = new Set<string>();
  for (const route of routes) {
    for (let index = 0; index < route.length - 1; index += 1) {
      usedHops.add(`${route[index]}→${route[index + 1]}`);
    }
  }

  const nodes = graph.nodes.filter((node) => usedNodes.has(node.name));
  const edges: GraphEdge[] = [];
  for (const edge of graph.edges) {
    const to = edge.to.filter((target) => usedHops.has(`${edge.from}→${target}`));
    if (to.length > 0) edges.push({ from: edge.from, to });
  }
  return { nodes, edges };
}
