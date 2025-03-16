import { ForbiddenException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, Repository } from 'typeorm';

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
    const note = await this.notesRepository.manager.save(NoteEntity, noteEntity);

    return note;
  }

  async deleteNote({ userId, noteId }: { userId: string; noteId: string }): Promise<DeleteResult> {
    const result = await this.notesRepository.delete({ id: noteId, userId });

    return result;
  }

  async getProjectNotes(projectId: string, skip = 0, take = BATCH_SIZE): Promise<[NoteEntity[], number]> {
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
        project: {
          createdAt: {
            direction: 'DESC',
          },
        },
      },
    });
  }
}
