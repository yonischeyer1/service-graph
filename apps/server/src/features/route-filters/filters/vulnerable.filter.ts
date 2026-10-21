import { Injectable } from '@nestjs/common';
import type { GraphNode } from '@service-graph/contracts';
import { RouteFilter } from '../route-filter.decorator';
import type { PathRouteFilter } from '../route-filter.types';

@Injectable()
@RouteFilter()
export class VulnerableFilter implements PathRouteFilter {
  readonly id = 'vulnerable';
  readonly description = 'Routes that pass through a node with at least one vulnerability.';
  readonly stage = 'path' as const;

  matches(path: readonly GraphNode[]): boolean {
    return path.some((node) => (node.vulnerabilities?.length ?? 0) > 0);
  }
}
