import { Injectable } from '@nestjs/common';
import type { GraphNode } from '@service-graph/contracts';
import { RouteFilter } from '../route-filter.decorator';
import type { EndRouteFilter } from '../route-filter.types';

const SINK_KINDS = new Set(['rds', 'sql']);

@Injectable()
@RouteFilter()
export class SinkEndFilter implements EndRouteFilter {
  readonly id = 'sink-end';
  readonly description = 'Routes that end in a sink (kind rds or sql).';
  readonly stage = 'end' as const;

  matches(node: GraphNode): boolean {
    return SINK_KINDS.has(node.kind);
  }
}
