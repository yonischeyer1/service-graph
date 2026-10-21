import { DEFAULT_MAX_ROUTES } from '@service-graph/contracts';

export interface FindRoutesInput<TNode extends { name: string }> {
  nodes: readonly TNode[];
  adjacency: ReadonlyMap<string, readonly string[]>;
  isStart?: (node: TNode) => boolean;
  isEnd?: (node: TNode) => boolean;
  pathMatches?: (path: readonly TNode[]) => boolean;
  maxRoutes?: number;
}

export interface FindRoutesResult {
  routes: string[][];
  truncated: boolean;
}

export function findRoutes<TNode extends { name: string }>(input: FindRoutesInput<TNode>): FindRoutesResult {
  const maxRoutes = input.maxRoutes ?? DEFAULT_MAX_ROUTES;
  const nodeByName = new Map(input.nodes.map((node) => [node.name, node]));
  const isStart = input.isStart ?? (() => true);
  const isEnd = input.isEnd ?? (() => true);
  const pathMatches = input.pathMatches ?? (() => true);

  const outgoing = new Map<string, string[]>();
  const reverse = new Map<string, string[]>();
  for (const node of input.nodes) {
    outgoing.set(node.name, []);
    reverse.set(node.name, []);
  }

  for (const node of input.nodes) {
    const targets = [...new Set(input.adjacency.get(node.name) ?? [])]
      .filter((target) => nodeByName.has(target))
      .sort();
    outgoing.set(node.name, targets);
    for (const target of targets) {
      reverse.get(target)?.push(node.name);
    }
  }

  const starts = input.nodes
    .filter((node) => (reverse.get(node.name)?.length ?? 0) === 0 && isStart(node))
    .map((node) => node.name)
    .sort();
  const ends = new Set(
    input.nodes.filter((node) => (outgoing.get(node.name)?.length ?? 0) === 0 && isEnd(node)).map((node) => node.name),
  );

  const reachable = new Set<string>();
  const queue = [...ends];
  for (const name of queue) reachable.add(name);
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (!current) continue;
    for (const previous of reverse.get(current) ?? []) {
      if (!reachable.has(previous)) {
        reachable.add(previous);
        queue.push(previous);
      }
    }
  }

  const routes: string[][] = [];
  let truncated = false;

  const hasMoreWork = (candidates: readonly string[], fromIndex: number, onPath: ReadonlySet<string>) =>
    candidates.slice(fromIndex).some((name) => reachable.has(name) && !onPath.has(name));

  const walk = (name: string, path: string[], onPath: Set<string>): boolean => {
    if (!reachable.has(name) || onPath.has(name)) return false;

    path.push(name);
    onPath.add(name);
    let hitCap = false;

    if (ends.has(name)) {
      const pathNodes = path.map((step) => {
        const node = nodeByName.get(step);
        if (!node) throw new Error(`Missing node ${step}`);
        return node;
      });
      if (pathMatches(pathNodes)) {
        routes.push([...path]);
        hitCap = routes.length >= maxRoutes;
      }
    } else {
      const nexts = outgoing.get(name) ?? [];
      for (let index = 0; index < nexts.length; index += 1) {
        const next = nexts[index];
        if (!next) continue;
        if (walk(next, path, onPath)) {
          hitCap = true;
          if (hasMoreWork(nexts, index + 1, onPath)) truncated = true;
          break;
        }
      }
    }

    path.pop();
    onPath.delete(name);
    return hitCap;
  };

  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index];
    if (!start) continue;
    if (walk(start, [], new Set())) {
      if (hasMoreWork(starts, index + 1, new Set())) truncated = true;
      break;
    }
  }

  return { routes, truncated };
}
