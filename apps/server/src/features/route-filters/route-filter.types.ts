import type { GraphNode } from '@service-graph/contracts';

interface FilterBase {
  readonly id: string;
  readonly description: string;
}

export interface StartRouteFilter extends FilterBase {
  readonly stage: 'start';
  matches(node: GraphNode): boolean;
}

export interface EndRouteFilter extends FilterBase {
  readonly stage: 'end';
  matches(node: GraphNode): boolean;
}

export interface PathRouteFilter extends FilterBase {
  readonly stage: 'path';
  matches(path: readonly GraphNode[]): boolean;
}

export type RouteFilterDefinition = StartRouteFilter | EndRouteFilter | PathRouteFilter;

export function isRouteFilter(value: unknown): value is RouteFilterDefinition {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RouteFilterDefinition>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.description === 'string' &&
    (candidate.stage === 'start' || candidate.stage === 'end' || candidate.stage === 'path') &&
    typeof candidate.matches === 'function'
  );
}

export class UnknownFiltersError extends Error {
  constructor(readonly ids: readonly string[]) {
    super(`Unknown filters: ${ids.join(', ')}`);
    this.name = 'UnknownFiltersError';
  }
}
