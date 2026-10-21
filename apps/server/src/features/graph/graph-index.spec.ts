import { describe, expect, it } from 'vitest';
import { indexGraph } from './graph-index';

describe('indexGraph', () => {
  it('builds sorted adjacency and reverse adjacency', () => {
    const index = indexGraph({
      nodes: [
        { name: 'a', kind: 'service' },
        { name: 'b', kind: 'service' },
        { name: 'c', kind: 'rds' },
      ],
      edges: [
        { from: 'a', to: ['c', 'b'] },
        { from: 'a', to: ['b'] },
      ],
    });

    expect(index.adjacency.get('a')).toEqual(['b', 'c']);
    expect(index.adjacency.get('b')).toEqual([]);
    expect(index.reverseAdjacency.get('b')).toEqual(['a']);
    expect(index.reverseAdjacency.get('c')).toEqual(['a']);
    expect(index.reverseAdjacency.get('a')).toEqual([]);
  });
});