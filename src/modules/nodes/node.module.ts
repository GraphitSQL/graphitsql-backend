import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectNodeService } from './node.service';
import { ProjectNodeEntity } from './node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectNodeEntity])],
  providers: [ProjectNodeService],
  exports: [ProjectNodeService],
})
export class ProjectNodeModule {}
