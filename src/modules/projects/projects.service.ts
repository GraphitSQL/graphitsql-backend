import { ProjectUserService } from './project-user/project-user.service';
import { ProjectNodeEntity } from 'src/modules/nodes/node.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';

import { withTransaction } from 'src/common/helpers';

import { RequestResult } from 'src/common/types';
import { ProjectNodeService } from '../nodes/node.service';
import { ProjectEdgeService } from '../edges/edge.service';
import { ProjectEdgeEntity } from '../edges/edge.entity';
import { DataSource } from 'typeorm';
import { ProjectService } from './project/project.service';
import { ProjectData } from './projects.contracts';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectEdgeService: ProjectEdgeService,
    private readonly projectNodeService: ProjectNodeService,
    private readonly projectUserService: ProjectUserService,
    private readonly projectService: ProjectService,
    private readonly datasource: DataSource,
  ) {}

  // Helpers

  async saveProjectDataChanges(
    projectId: string,
    userId: string,
    { nodes, edges }: { nodes: Partial<ProjectNodeEntity>[]; edges: Partial<ProjectEdgeEntity>[] },
  ): Promise<RequestResult> {
    return withTransaction(this.datasource, async queryRunner => {
      const isProjectUser = await this.projectUserService.getProjectUser({
        where: { projectId, userId },
      });

      if (!isProjectUser) {
        throw new ForbiddenException('Доступ запрещен.Вы не являетесь участником проекта');
      }
      const nodeIds = nodes.map(node => node.id);
      const edgeIds = edges.map(edge => edge.id);

      await this.projectEdgeService.bulkDeleteByIds(edgeIds, projectId, { queryRunner });
      await this.projectNodeService.bulkDeleteByIds(nodeIds, projectId, { queryRunner });

      await this.projectNodeService.bulkUpsert(nodes, { queryRunner });
      await this.projectEdgeService.bulkUpsert(edges, { queryRunner });

      return 'OK' as RequestResult;
    });
  }

  async getProjectData(projectId: string, userId: string): Promise<ProjectData> {
    const isProjectUser = await this.projectUserService.getProjectUser({
      where: { projectId, userId },
    });

    if (!isProjectUser) {
      throw new ForbiddenException('Доступ запрещен.Вы не являетесь участником проекта');
    }

    const data = await this.projectService.getProjectNodesAndEdges(projectId);

    return data;
  }
}
