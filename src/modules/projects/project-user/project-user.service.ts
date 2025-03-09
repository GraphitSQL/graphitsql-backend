import { ForbiddenException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { ProjectUserEntity } from './project-user.entity';
import { getRepository } from 'src/common/helpers';
import { Transactional } from 'src/common/types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProjectUserService {
  constructor(
    @InjectRepository(ProjectUserEntity)
    private projectsUsersRepository: Repository<ProjectUserEntity>,
    private readonly datasource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //Request handlers

  async getUserProjects(userId: string): Promise<[ProjectUserEntity[], number]> {
    return this.projectsUsersRepository.findAndCount({
      where: { userId },
      select: {
        id: true,
        canEdit: true,
        canLeaveNotes: true,
        project: {
          id: true,
          title: true,
          createdBy: {
            id: true,
            displayName: true,
          },
          createdAt: true,
          updatedAt: true,
          isPublic: true,
        },
      },
      relations: ['project', 'user', 'project.createdBy'],
    });
  }

  async generateInvitationLink({ projectId, userId }: { projectId: string; userId: string }): Promise<string> {
    const projectUser = await this.getProjectUser({ where: { projectId, userId } });

    if (!projectUser) {
      throw new ForbiddenException("You don't have rights");
    }
    const invitationToken = await this.generateIvitationLink({ projectId });
    const appDomain = await this.configService.getOrThrow('service.frontendAppDomain');
    return `${appDomain}/join/${invitationToken}`;
  }

  async joinToProject({ userId, token }: { userId: string; token: string }): Promise<ProjectUserEntity | null> {
    const payload = this.jwtService.decode<{ projectId: string }>(token);
    return this.createProjectUser({ userId, projectId: payload.projectId });
  }

  // Helpers

  async getProjectUser(data: FindOneOptions<ProjectUserEntity>): Promise<ProjectUserEntity> {
    return this.projectsUsersRepository.findOne(data);
  }

  async createProjectUser(
    data: Partial<ProjectUserEntity>,
    { queryRunner: activeQueryRunner }: Transactional = {},
  ): Promise<ProjectUserEntity | null> {
    const projectUserRepository = getRepository(activeQueryRunner ?? this.datasource, ProjectUserEntity);
    const projectUserData = projectUserRepository.create(data);
    return projectUserRepository.save(projectUserData);
  }

  private async generateIvitationLink({ projectId }: { projectId: string }) {
    const payload = { projectId };

    const invitationToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('service.jwt.secret'),
    });

    return invitationToken;
  }
}
