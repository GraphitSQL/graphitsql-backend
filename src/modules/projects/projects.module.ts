import { Module } from '@nestjs/common';
import { ProjectModule } from './project/project.module';
import { ProjectUserModule } from './project-user/project-user.module';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [ProjectModule, ProjectUserModule],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
