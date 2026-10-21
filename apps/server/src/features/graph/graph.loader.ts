import { graphSchema, rawGraphSchema, type Graph, type GraphNode } from '@service-graph/contracts';

export class GraphLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GraphLoadError';
  }
}

export interface LoadResult {
  graph: Graph;
  warnings: string[];
}

export function loadGraph(raw: unknown): LoadResult {
  const parsed = rawGraphSchema.safeParse(raw);
  if (!parsed.success) {
    throw new GraphLoadError(parsed.error.issues.map((issue) => issue.message).join('; '));
  }

  const names = new Set<string>();
  for (const node of parsed.data.nodes) {
    if (names.has(node.name)) {
      throw new GraphLoadError(`Duplicate node name: ${node.name}`);
    }
    names.add(node.name);
  }

  const missing = new Set<string>();
  const edges = parsed.data.edges.map((edge) => {
    const targets = [...new Set(Array.isArray(edge.to) ? edge.to : [edge.to])];
    if (!names.has(edge.from)) missing.add(edge.from);
    for (const target of targets) {
      if (!names.has(target)) missing.add(target);
    }
    return { from: edge.from, to: targets };
  });

  const warnings: string[] = [];
  const nodes: GraphNode[] = [...parsed.data.nodes];
  for (const name of [...missing].sort()) {
    warnings.push(`Node "${name}" is referenced by an edge but missing from nodes; added a synthetic node.`);
    nodes.push({ name, kind: 'unknown', synthetic: true });
  }

  return { graph: graphSchema.parse({ nodes, edges }), warnings };
}
