import { describe, expect, it } from 'vitest';
import { findRoutes } from './path-finder';

interface Node {
  name: string;
  kind?: string;
  publicExposed?: boolean;
  vulnerabilities?: { file: string }[];
}

function linked(nodes: Node[], edges: Array<[string, string]>) {
  const adjacency = new Map<string, string[]>();
  for (const node of nodes) adjacency.set(node.name, []);
  for (const [from, to] of edges) {
    adjacency.get(from)?.push(to);
  }
  for (const targets of adjacency.values()) targets.sort();
  return { nodes, adjacency };
}

describe('findRoutes', () => {
  it('returns the single maximal path of a line', () => {
    const graph = linked(
      [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
      [
        ['a', 'b'],
        ['b', 'c'],
      ],
    );

    expect(findRoutes(graph)).toEqual({
      routes: [['a', 'b', 'c']],
      truncated: false,
    });
  });

  it('returns every branch from an entry to each leaf', () => {
    const graph = linked(
      [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
      [
        ['a', 'c'],
        ['a', 'b'],
      ],
    );

    expect(findRoutes(graph).routes).toEqual([
      ['a', 'b'],
      ['a', 'c'],
    ]);
  });

  it('does not loop forever on a cycle and still reaches the leaf', () => {
    const graph = linked(
      [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }],
      [
        ['a', 'b'],
        ['b', 'c'],
        ['c', 'b'],
        ['b', 'd'],
      ],
    );

    expect(findRoutes(graph)).toEqual({
      routes: [['a', 'b', 'd']],
      truncated: false,
    });
  });

  it('drops paths that cannot reach an allowed end node', () => {
    const graph = linked(
      [
        { name: 'a' },
        { name: 'b', kind: 'service' },
        { name: 'c' },
        { name: 'd', kind: 'rds' },
      ],
      [
        ['a', 'b'],
        ['c', 'd'],
      ],
    );

    const result = findRoutes({
      ...graph,
      isEnd: (node) => node.kind === 'rds',
    });

    expect(result.routes).toEqual([['c', 'd']]);
  });

  it('ANDs start and end filters', () => {
    const graph = linked(
      [
        { name: 'pub', publicExposed: true },
        { name: 'mid' },
        { name: 'sink', kind: 'rds' },
        { name: 'other', kind: 'service' },
        { name: 'internal' },
        { name: 'sink2', kind: 'sql' },
      ],
      [
        ['pub', 'mid'],
        ['mid', 'sink'],
        ['pub', 'other'],
        ['internal', 'sink2'],
      ],
    );

    const result = findRoutes({
      ...graph,
      isStart: (node) => node.publicExposed === true,
      isEnd: (node) => node.kind === 'rds' || node.kind === 'sql',
    });

    expect(result.routes).toEqual([['pub', 'mid', 'sink']]);
  });

  it('keeps a path only when every path filter matches', () => {
    const graph = linked(
      [
        { name: 'a' },
        { name: 'vuln', vulnerabilities: [{ file: 'x.java' }] },
        { name: 'leaf' },
        { name: 'clean' },
      ],
      [
        ['a', 'vuln'],
        ['vuln', 'leaf'],
        ['a', 'clean'],
      ],
    );

    const result = findRoutes({
      ...graph,
      pathMatches: (path) => path.some((node) => (node.vulnerabilities?.length ?? 0) > 0),
    });

    expect(result.routes).toEqual([['a', 'vuln', 'leaf']]);
  });

  it('stops at maxRoutes and reports truncation', () => {
    const nodes: Node[] = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }];
    const graph = linked(nodes, [
      ['a', 'b'],
      ['a', 'c'],
      ['a', 'd'],
    ]);

    const result = findRoutes({ ...graph, maxRoutes: 2 });

    expect(result.truncated).toBe(true);
    expect(result.routes).toHaveLength(2);
    expect(result.routes).toEqual([
      ['a', 'b'],
      ['a', 'c'],
    ]);
  });

  it('treats an isolated node as a one-node route', () => {
    const graph = linked([{ name: 'solo' }, { name: 'a' }, { name: 'b' }], [['a', 'b']]);

    expect(findRoutes(graph).routes).toEqual([['a', 'b'], ['solo']]);
  });
});
