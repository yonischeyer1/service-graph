import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { PublicStartFilter } from './filters/public-start.filter';
import { SinkEndFilter } from './filters/sink-end.filter';
import { VulnerableFilter } from './filters/vulnerable.filter';
import { FiltersController } from './filters.controller';
import { RouteFilterRegistry } from './route-filter.registry';

@Module({
  imports: [DiscoveryModule],
  controllers: [FiltersController],
  providers: [
    // Register each @RouteFilter() class here. The registry and the client pick it up from discovery.
    PublicStartFilter,
    SinkEndFilter,
    VulnerableFilter,
    RouteFilterRegistry,
  ],
  exports: [RouteFilterRegistry],
})
export class RouteFiltersModule {}
