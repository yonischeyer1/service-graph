import { Injectable } from '@nestjs/common';
import type { GraphNode } from '@service-graph/contracts';
import { RouteFilter } from '../route-filter.decorator';
import type { StartRouteFilter } from '../route-filter.types';

@Injectable()
@RouteFilter()
export class PublicStartFilter implements StartRouteFilter {
  readonly id = 'public-start';
  readonly description = 'Routes that start in a public service (publicExposed: true).';
  readonly stage = 'start' as const;

  matches(node: GraphNode): boolean {
    return node.publicExposed === true;
  }
}
