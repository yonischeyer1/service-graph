import { Injectable } from '@nestjs/common';
import type { RoutesResponse } from '@service-graph/contracts';
import { GraphRepository } from '../graph/graph.repository';
import { RouteFilterRegistry } from '../route-filters/route-filter.registry';
import type { EndRouteFilter, PathRouteFilter, StartRouteFilter } from '../route-filters/route-filter.types';
import { findRoutes } from './path-finder';
import { projectRoutes } from './project-routes';

@Injectable()
export class RoutesService {
  constructor(
    private readonly graphs: GraphRepository,
    private readonly filters: RouteFilterRegistry,
  ) {}

  query(filterIds: readonly string[], maxRoutes?: number): RoutesResponse {
    const selected = this.filters.resolve(filterIds);
    const index = this.graphs.getIndex();
    const startFilters = selected.filter((filter): filter is StartRouteFilter => filter.stage === 'start');
    const endFilters = selected.filter((filter): filter is EndRouteFilter => filter.stage === 'end');
    const pathFilters = selected.filter((filter): filter is PathRouteFilter => filter.stage === 'path');

    const result = findRoutes({
      nodes: index.graph.nodes,
      adjacency: index.adjacency,
      isStart: startFilters.length > 0 ? (node) => startFilters.every((filter) => filter.matches(node)) : undefined,
      isEnd: endFilters.length > 0 ? (node) => endFilters.every((filter) => filter.matches(node)) : undefined,
      pathMatches: pathFilters.length > 0 ? (path) => pathFilters.every((filter) => filter.matches(path)) : undefined,
      maxRoutes,
    });

    return {
      ...projectRoutes(index.graph, result.routes),
      routes: result.routes,
      meta: {
        routeCount: result.routes.length,
        truncated: result.truncated,
        appliedFilters: selected.map((filter) => filter.id),
      },
    };
  }
}
