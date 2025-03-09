import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectUserModule } from '../project-user/project-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity]), ProjectUserModule],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
