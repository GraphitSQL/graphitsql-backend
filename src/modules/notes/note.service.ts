import { ForbiddenException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { NoteEntity } from './note.entity';
import { ProjectUserService } from '../projects/project-user/project-user.service';
import { BATCH_SIZE } from 'src/common/constants/batch-size.constant';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(NoteEntity)
    private notesRepository: Repository<NoteEntity>,
    private projectsUsersService: ProjectUserService,
  ) {}

  //Request handlers

  async createNote({ data, userId }: { data: Partial<NoteEntity>; userId: string }): Promise<NoteEntity> {
    const projectUser = await this.projectsUsersService.getProjectUser({
      where: { userId, projectId: data.projectId },
    });

    if (!projectUser) {
      throw new ForbiddenException('Недостаточно прав или проект не сушествует');
    }
    const noteEntity = this.notesRepository.create({ ...data, userId });
    await this.notesRepository.save(noteEntity);

    return this.notesRepository.findOne({ where: { id: noteEntity.id }, relations: ['createdBy'] });
  }

  async updateNote({
    data,
    userId,
    noteId,
    projectId,
  }: {
    data: Partial<NoteEntity>;
    userId: string;
    noteId: string;
    projectId: string;
  }): Promise<UpdateResult> {
    const projectUser = await this.projectsUsersService.getProjectUser({
      where: { userId, projectId: projectId },
    });

    if (!projectUser) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return this.notesRepository.update({ id: noteId }, { ...data });
  }

  async deleteNote({ userId, noteId }: { userId: string; noteId: string }): Promise<DeleteResult> {
    const result = await this.notesRepository.delete({ id: noteId, userId });

    return result;
  }

  async getProjectNotes(
    projectId: string,
    skip = 0,
    take = BATCH_SIZE,
    direction: 'ASC' | 'DESC',
  ): Promise<[NoteEntity[], number]> {
    return this.notesRepository.findAndCount({
      where: {
        projectId,
      },
      select: {
        id: true,
        noteText: true,
        isResolved: true,
        createdAt: true,
        createdBy: {
          displayName: true,
          avatarColor: true,
        },
      },
      relations: ['createdBy'],
      skip,
      take,
      order: {
        createdAt: {
          direction: direction ?? 'DESC',
        },
      },
    });
  }
}
