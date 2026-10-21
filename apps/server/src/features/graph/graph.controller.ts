import { Controller, Get } from '@nestjs/common';
import { GraphRepository } from './graph.repository';

@Controller('graph')
export class GraphController {
  constructor(private readonly graphs: GraphRepository) {}

  @Get()
  getGraph() {
    return this.graphs.getGraph();
  }
}
