import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, DeleteResult, In, InsertResult, Not, Repository } from 'typeorm';
import { getRepository } from 'src/common/helpers';
import { ProjectEdgeEntity } from './edge.entity';
import { Transactional } from 'src/common/types';

@Injectable()
export class ProjectEdgeService {
  constructor(
    @InjectRepository(ProjectEdgeEntity)
    private projectEdgesRepository: Repository<ProjectEdgeEntity>,
    private readonly datasource: DataSource,
  ) {}

  // Helpers

  async bulkUpsert(
    data: Partial<ProjectEdgeEntity>[],
    { queryRunner: activeQueryRunner }: Transactional = {},
  ): Promise<InsertResult> {
    const edgeRepository = getRepository(activeQueryRunner ?? this.datasource, ProjectEdgeEntity);

    const updatedData = await edgeRepository.upsert(data, {
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
    const edgeRepository = getRepository(activeQueryRunner ?? this.datasource, ProjectEdgeEntity);

    const result = await edgeRepository.delete({
      id: Not(In(ids)),
      projectId,
    });

    return result;
  }
}
