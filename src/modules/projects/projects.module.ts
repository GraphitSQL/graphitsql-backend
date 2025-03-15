import { Module } from '@nestjs/common';
import { ProjectModule } from './project/project.module';
import { ProjectUserModule } from './project-user/project-user.module';
import { ProjectsController } from './projects.controller';
import { ProjectEdgeModule } from '../edges/edge.module';
import { ProjectNodeModule } from '../nodes/node.module';
import { ProjectsService } from './projects.service';

@Module({
  imports: [ProjectModule, ProjectUserModule, ProjectEdgeModule, ProjectNodeModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
