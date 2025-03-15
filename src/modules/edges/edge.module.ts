import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectEdgeService } from './edge.service';
import { ProjectEdgeEntity } from './edge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEdgeEntity])],
  providers: [ProjectEdgeService],
  exports: [ProjectEdgeService],
})
export class ProjectEdgeModule {}
