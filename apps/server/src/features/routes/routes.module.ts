import { Module } from '@nestjs/common';
import { GraphModule } from '../graph/graph.module';
import { RouteFiltersModule } from '../route-filters/route-filters.module';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  imports: [GraphModule, RouteFiltersModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
