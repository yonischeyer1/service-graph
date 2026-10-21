import { Controller, Get } from '@nestjs/common';
import { RouteFilterRegistry } from './route-filter.registry';

@Controller('filters')
export class FiltersController {
  constructor(private readonly filters: RouteFilterRegistry) {}

  @Get()
  list() {
    return { filters: this.filters.list() };
  }
}
