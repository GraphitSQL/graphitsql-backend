import { ForbiddenException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { withTransaction } from 'src/common/helpers';
import { ProjectEntity } from './project.entity';
import { ProjectUserService } from '../project-user/project-user.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectsRepository: Repository<ProjectEntity>,
    private projectsUsersService: ProjectUserService,
    private readonly datasource: DataSource,
  ) {}

  //Request handlers

  async createProject({
    projectData,
    userId,
  }: {
    projectData: Partial<ProjectEntity>;
    userId: string;
  }): Promise<ProjectEntity> {
    const project = await this.create({ projectData, userId });

    return this.projectsRepository.findOne({ where: { id: project.id }, relations: ['createdBy'] });
  }

  async updateProject({
    projectId,
    projectData,
  }: {
    projectId: string;
    projectData: Partial<ProjectEntity>;
  }): Promise<UpdateResult> {
    return this.projectsRepository.update({ id: projectId }, projectData);
  }

  async deleteProject(projectId: string, userId: string): Promise<DeleteResult> {
    const projectUser = await this.projectsUsersService.getProjectUser({ where: { userId, projectId } });

    if (!projectUser) {
      throw new ForbiddenException('Недостаточно прав или проект не сушествует');
    }

    const result = await this.projectsRepository.delete({ id: projectId });

    return result;
  }

  // Helpers

  async create({
    projectData,
    userId,
  }: {
    projectData: Partial<ProjectEntity>;
    userId: string;
  }): Promise<ProjectEntity | null> {
    return withTransaction(this.datasource, async queryRunner => {
      const projectEntity = this.projectsRepository.create({
        ...projectData,
        createdById: userId,
      });
      const project = await queryRunner.manager.save(ProjectEntity, projectEntity);
      await this.projectsUsersService.createProjectUser(
        {
          projectId: project.id,
          userId,
        },
        { queryRunner },
      );

      return projectEntity;
    });
  }
}
