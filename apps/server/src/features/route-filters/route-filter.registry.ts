import { Injectable, type OnModuleInit } from '@nestjs/common';
import type { FilterDescriptor } from '@service-graph/contracts';
import { DiscoveryService } from '@nestjs/core';
import { RouteFilter } from './route-filter.decorator';
import { isRouteFilter, UnknownFiltersError, type RouteFilterDefinition } from './route-filter.types';

@Injectable()
export class RouteFilterRegistry implements OnModuleInit {
  private readonly byId = new Map<string, RouteFilterDefinition>();

  constructor(private readonly discovery: DiscoveryService) {}

  onModuleInit(): void {
    const filters = this.discovery
      .getProviders({ metadataKey: RouteFilter.KEY })
      .map((wrapper) => wrapper.instance)
      .filter(isRouteFilter)
      .sort((left, right) => left.id.localeCompare(right.id));

    this.byId.clear();
    for (const filter of filters) {
      if (this.byId.has(filter.id)) {
        throw new Error(`Duplicate route filter id: ${filter.id}`);
      }
      this.byId.set(filter.id, filter);
    }
  }

  list(): FilterDescriptor[] {
    return [...this.byId.values()].map((filter) => ({
      id: filter.id,
      description: filter.description,
      stage: filter.stage,
    }));
  }

  resolve(ids: readonly string[]): RouteFilterDefinition[] {
    const unknown = ids.filter((id) => !this.byId.has(id));
    if (unknown.length > 0) throw new UnknownFiltersError(unknown);
    return ids.map((id) => {
      const filter = this.byId.get(id);
      if (!filter) throw new UnknownFiltersError([id]);
      return filter;
    });
  }
}
