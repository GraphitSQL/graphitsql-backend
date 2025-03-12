import { ForbiddenException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, FindOneOptions, ILike, Repository } from 'typeorm';
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

  async getUserProjects(userId: string, skip = 0, take = 100, search?: string): Promise<[ProjectUserEntity[], number]> {
    return this.projectsUsersRepository.findAndCount({
      where: {
        userId,
        ...(search && {
          project: {
            title: ILike(search),
          },
        }),
      },
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
            avatarColor: true,
          },
          createdAt: true,
          updatedAt: true,
          isPublic: true,
        },
      },
      relations: ['project', 'user', 'project.createdBy'],
      skip,
      take,
      order: {
        project: {
          createdAt: {
            direction: 'DESC',
          },
        },
      },
    });
  }

  async generateInvitationLink({ projectId, userId }: { projectId: string; userId: string }): Promise<string> {
    const projectUser = await this.getProjectUser({
      where: { projectId, userId },
      select: {
        id: true,
        project: {
          isPublic: true,
        },
      },
      relations: ['project'],
    });

    if (!projectUser) {
      throw new ForbiddenException('У вас нет прав');
    }

    const { project } = projectUser;

    if (!project.isPublic) {
      throw new ForbiddenException('Нельзя пригласить в закрытый проект');
    }
    const invitationToken = await this.generateIvitationLink({ projectId });
    const appDomain = await this.configService.getOrThrow('service.frontendAppDomain');
    return `${appDomain}/join/${invitationToken}`;
  }

  async joinToProject({ userId, token }: { userId: string; token: string }): Promise<ProjectUserEntity | null> {
    const payload = this.jwtService.decode<{ projectId: string }>(token);
    const projectUser = await this.projectsUsersRepository.findOneBy({ userId, projectId: payload.projectId });

    if (projectUser) {
      return projectUser;
    }

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
    return projectUserRepository.save(projectUserData, { reload: true });
  }

  private async generateIvitationLink({ projectId }: { projectId: string }) {
    const payload = { projectId };

    const invitationToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('service.jwt.secret'),
    });

    return invitationToken;
  }
}
