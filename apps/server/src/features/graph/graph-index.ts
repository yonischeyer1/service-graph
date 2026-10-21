import type { Graph, GraphNode } from '@service-graph/contracts';

export interface GraphIndex {
  graph: Graph;
  nodeByName: ReadonlyMap<string, GraphNode>;
  adjacency: ReadonlyMap<string, readonly string[]>;
  reverseAdjacency: ReadonlyMap<string, readonly string[]>;
}

export function indexGraph(graph: Graph): GraphIndex {
  const nodeByName = new Map(graph.nodes.map((node) => [node.name, node]));
  const adjacency = new Map<string, string[]>();
  const reverseAdjacency = new Map<string, string[]>();

  for (const node of graph.nodes) {
    adjacency.set(node.name, []);
    reverseAdjacency.set(node.name, []);
  }

  for (const edge of graph.edges) {
    const targets = adjacency.get(edge.from);
    if (!targets) continue;
    for (const target of edge.to) {
      if (!nodeByName.has(target)) continue;
      if (!targets.includes(target)) targets.push(target);
      const sources = reverseAdjacency.get(target);
      if (sources && !sources.includes(edge.from)) sources.push(edge.from);
    }
  }

  for (const targets of adjacency.values()) targets.sort();
  for (const sources of reverseAdjacency.values()) sources.sort();

  return { graph, nodeByName, adjacency, reverseAdjacency };
}
