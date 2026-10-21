import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { GraphController } from './graph.controller';
import { GraphRepository } from './graph.repository';

@Module({
  imports: [ConfigModule],
  controllers: [GraphController],
  providers: [GraphRepository],
  exports: [GraphRepository],
})
export class GraphModule {}
