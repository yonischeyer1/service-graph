import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { UnknownFiltersError } from '../route-filters/route-filter.types';
import { parseFilterIds, parseMaxRoutes } from './query';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}

  @Get()
  query(@Query('filters') filters?: string | string[], @Query('maxRoutes') maxRoutes?: string) {
    try {
      return this.routes.query(parseFilterIds(filters), parseMaxRoutes(maxRoutes));
    } catch (error) {
      if (error instanceof UnknownFiltersError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
