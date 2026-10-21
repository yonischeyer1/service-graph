import { describe, expect, it } from 'vitest';
import { GraphLoadError, loadGraph } from './graph.loader';

describe('loadGraph', () => {
  it('normalizes a string edge target into an array', () => {
    const result = loadGraph({
      nodes: [{ name: 'consign-service', kind: 'service' }, { name: 'consign-price-service', kind: 'service' }],
      edges: [{ from: 'consign-service', to: 'consign-price-service' }],
    });

    expect(result.graph.edges).toEqual([{ from: 'consign-service', to: ['consign-price-service'] }]);
    expect(result.warnings).toEqual([]);
  });

  it('adds a synthetic node when an edge names a missing service', () => {
    const result = loadGraph({
      nodes: [{ name: 'preserve-service', kind: 'service', publicExposed: false }],
      edges: [{ from: 'preserve-service', to: ['assurance-service'] }],
    });

    expect(result.graph.nodes).toContainEqual({
      name: 'assurance-service',
      kind: 'unknown',
      synthetic: true,
    });
    expect(result.warnings.some((warning) => warning.includes('assurance-service'))).toBe(true);
  });

  it('rejects duplicate node names', () => {
    expect(() =>
      loadGraph({
        nodes: [
          { name: 'order-service', kind: 'service' },
          { name: 'order-service', kind: 'service' },
        ],
        edges: [],
      }),
    ).toThrow(GraphLoadError);
  });

  it('rejects a document that is not a graph', () => {
    expect(() => loadGraph({ edges: [] })).toThrow(GraphLoadError);
    expect(() => loadGraph(null)).toThrow(GraphLoadError);
  });
});
