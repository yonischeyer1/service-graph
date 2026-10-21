import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import type { Graph } from '@service-graph/contracts';
import { ENV, type Env } from '../../config/env';
import { indexGraph, type GraphIndex } from './graph-index';
import { loadGraph } from './graph.loader';

@Injectable()
export class GraphRepository implements OnModuleInit {
  private readonly logger = new Logger(GraphRepository.name);
  private index: GraphIndex | undefined;

  constructor(@Inject(ENV) private readonly env: Env) {}

  onModuleInit(): void {
    const dataPath = isAbsolute(this.env.GRAPH_DATA_PATH)
      ? this.env.GRAPH_DATA_PATH
      : resolve(process.cwd(), this.env.GRAPH_DATA_PATH);
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(dataPath, 'utf8')) as unknown;
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'unknown error';
      throw new Error(`Unable to read graph data at ${dataPath}: ${detail}`);
    }

    const loaded = loadGraph(raw);
    for (const warning of loaded.warnings) this.logger.warn(warning);
    this.index = indexGraph(loaded.graph);
  }

  getGraph(): Graph {
    return this.getIndex().graph;
  }

  getIndex(): GraphIndex {
    if (!this.index) throw new Error('Graph repository is not initialized');
    return this.index;
  }
}
