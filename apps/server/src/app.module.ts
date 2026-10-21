import { Module } from '@nestjs/common';
import { GraphModule } from './features/graph/graph.module';
import { RouteFiltersModule } from './features/route-filters/route-filters.module';
import { RoutesModule } from './features/routes/routes.module';

@Module({
  imports: [GraphModule, RouteFiltersModule, RoutesModule],
})
export class AppModule {}
