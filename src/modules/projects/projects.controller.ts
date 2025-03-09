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
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser } from 'src/common/types';
import { ProjectService } from './project/project.service';
import { buildListProjectResponse } from './helpers';
import {
  JoinToProjectResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  DeleteProjectResponse,
  ListProjectsResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
} from './projects.contracts';

@Controller('projects')
@UseGuards(AccessTokenGuard)
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectUserService: ProjectUserService,
  ) {}

  @Get('list')
  async getUserProjects(@CurrentUser() user: ContextUser): Promise<ListProjectsResponse> {
    const [projects, count] = await this.projectUserService.getUserProjects(user.sub);

    return {
      count,
      projects: projects.map(buildListProjectResponse),
    };
  }

  @Get('invitation-link')
  async getInvitationLink(@Query('projectId') projectId: string, @CurrentUser() user: ContextUser): Promise<string> {
    const link = await this.projectUserService.generateInvitationLink({ projectId, userId: user.sub });

    return link;
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
      },
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  @Post('update')
  async updateProject(@Query('id') id: string, @Body() payload: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    const result = await this.projectService.updateProject({ projectData: payload, projectId: id });

    if (!result.affected) {
      throw new NotFoundException('Project was not found');
    }

    return 'OK';
  }

  @Post('join-to-project')
  async addProjectUser(@Req() req: Request, @CurrentUser() user: ContextUser): Promise<JoinToProjectResponse> {
    const token = req.get('invitation-token');
    console.log('token', token);
    if (!token) {
      throw new ForbiddenException();
    }
    const result = await this.projectUserService.joinToProject({ token, userId: user.sub });

    if (!result) {
      throw new InternalServerErrorException();
    }

    return 'OK';
  }

  @Delete('delete')
  async deleteProject(@Query('id') id: string, @CurrentUser() user: ContextUser): Promise<DeleteProjectResponse> {
    const res = await this.projectService.deleteProject(id, user.sub);

    if (!res.affected) {
      throw new NotFoundException('Project was not found');
    }

    return 'OK';
  }
}
