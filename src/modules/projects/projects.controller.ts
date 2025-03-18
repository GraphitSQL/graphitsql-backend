import { ProjectsService } from './projects.service';
import { ProjectUserService } from './project-user/project-user.service';
import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Delete,
  NotFoundException,
  Req,
  InternalServerErrorException,
  Query,
  ForbiddenException,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser, RequestResult } from 'src/common/types';
import { ProjectService } from './project/project.service';
import { buildListProjectResponse, buildProjectMembersListResponse, buildProjectResponse } from './helpers';
import {
  JoinToProjectResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  DeleteProjectResponse,
  ListProjectsResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  ProjectDataResponse,
  UpdateProjectDataRequest,
  GetProjectResponse,
  ProjectMembersListResponse,
  DeleteProjectMemberResponse,
} from './projects.contracts';

@Controller('projects')
@UseGuards(AccessTokenGuard)
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectUserService: ProjectUserService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get('list')
  async getUserProjects(
    @CurrentUser() user: ContextUser,
    @Query('skip', ParseIntPipe) skip: number,
    @Query('take', ParseIntPipe) take: number,
    @Query('search') search?: string,
  ): Promise<ListProjectsResponse> {
    const [projects, count] = await this.projectUserService.getUserProjects(user.sub, skip, take, search);

    return {
      count,
      projects: projects.map(buildListProjectResponse),
    };
  }

  @Get('get/:id')
  async getProject(@Param('id') id: string): Promise<GetProjectResponse> {
    const project = await this.projectService.getProject(id);

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    return buildProjectResponse(project);
  }

  @Get(':id/members')
  async getProjectMembers(
    @Param('id') id: string,
    @Query('skip', ParseIntPipe) skip: number,
    @Query('take', ParseIntPipe) take: number,
  ): Promise<ProjectMembersListResponse> {
    const [members, count] = await this.projectUserService.getProjectMembers(id, { skip, take });

    return {
      count,
      members: members.map(buildProjectMembersListResponse),
    };
  }

  @Get('invitation-link')
  async getInvitationLink(@Query('projectId') projectId: string, @CurrentUser() user: ContextUser): Promise<string> {
    const link = await this.projectUserService.generateInvitationLink({ projectId, userId: user.sub });

    return link;
  }

  @Get('project-data')
  async getProjectData(@CurrentUser() user: ContextUser, @Query('id') id: string): Promise<ProjectDataResponse> {
    const data = await this.projectsService.getProjectData(id, user.sub);

    return {
      data,
      isScratch: !data.nodes.length && !data.edges.length,
    };
  }

  @Post('create')
  async createProject(
    @Body() payload: CreateProjectRequest,
    @CurrentUser() user: ContextUser,
  ): Promise<CreateProjectResponse> {
    const result = await this.projectService.createProject({ projectData: payload, userId: user.sub });

    return {
      id: result.id,
      title: result.title,
      isPublic: result.isPublic,
      createdBy: {
        id: result.createdBy.id,
        displayName: result.createdBy.displayName,
        avatarColor: result.createdBy.avatarColor,
      },
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  @Post('update/:id')
  async updateProject(@Param('id') id: string, @Body() payload: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    const result = await this.projectService.updateProject({ projectData: payload, projectId: id });

    if (!result.affected) {
      throw new NotFoundException('Проект не найден');
    }

    return 'OK';
  }

  @Post('join-to-project')
  async addProjectUser(@Req() req: Request, @CurrentUser() user: ContextUser): Promise<JoinToProjectResponse> {
    const token = req.get('invitation-token');
    if (!token) {
      throw new ForbiddenException('Доступ запрещен');
    }
    const result = await this.projectUserService.joinToProject({ token, userId: user.sub });

    if (!result) {
      throw new InternalServerErrorException('Внутренняя ошибка сервера');
    }

    return result.projectId;
  }

  @Post('update-project-data')
  async updateProjectData(
    @Body() payload: UpdateProjectDataRequest,
    @Query('id') id: string,
    @CurrentUser() user: ContextUser,
  ): Promise<RequestResult> {
    const result = await this.projectsService.saveProjectDataChanges(id, user.sub, payload);

    return result;
  }

  @Delete('delete')
  async deleteProject(@Query('id') id: string, @CurrentUser() user: ContextUser): Promise<DeleteProjectResponse> {
    const res = await this.projectService.deleteProject(id, user.sub);

    if (!res.affected) {
      throw new NotFoundException('Проект не найден');
    }

    return 'OK';
  }

  @Delete('delete/members:/projectId/:memberId')
  async deleteProjectMember(
    @Param('memberId') memberId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: ContextUser,
  ): Promise<DeleteProjectMemberResponse> {
    const res = await this.projectUserService.deleteProjectMember({
      projectId,
      userId: user.sub,
      memberId,
    });

    if (!res.affected) {
      throw new NotFoundException('Участник не найден');
    }

    return 'OK';
  }
}
