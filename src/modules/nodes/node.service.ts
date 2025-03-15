import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, DeleteResult, In, InsertResult, Not, Repository } from 'typeorm';
import { getRepository } from 'src/common/helpers';
import { ProjectNodeEntity } from './node.entity';
import { Transactional } from 'src/common/types';

@Injectable()
export class ProjectNodeService {
  constructor(
    @InjectRepository(ProjectNodeEntity)
    private projectNodesRepository: Repository<ProjectNodeEntity>,
    private readonly datasource: DataSource,
  ) {}

  // Helpers

  async bulkUpsert(
    data: Partial<ProjectNodeEntity>[],
    { queryRunner: activeQueryRunner }: Transactional = {},
  ): Promise<InsertResult> {
    const nodeRepository = getRepository(activeQueryRunner ?? this.datasource, ProjectNodeEntity);

    const updatedData = await nodeRepository.upsert(data, {
      conflictPaths: ['id'],
      upsertType: 'on-conflict-do-update',
      skipUpdateIfNoValuesChanged: true,
    });
    return updatedData;
  }

  async bulkDeleteByIds(
    ids: string[],
    projectId: string,
    { queryRunner: activeQueryRunner }: Transactional = {},
  ): Promise<DeleteResult> {
    const nodeRepository = getRepository(activeQueryRunner ?? this.datasource, ProjectNodeEntity);

    const result = await nodeRepository.delete({
      id: Not(In(ids)),
      projectId,
    });

    return result;
  }
}
