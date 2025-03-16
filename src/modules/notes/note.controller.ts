import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Delete,
  NotFoundException,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser } from 'src/common/types';
import { NoteService } from './note.service';
import { CreateNoteRequest, CreateNoteResponse, DeleteNoteResponse, ListNotesResponse } from './note.contracts';

@Controller('notes')
@UseGuards(AccessTokenGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get('list')
  async getProjectNotes(
    @Query('skip', ParseIntPipe) skip: number,
    @Query('take', ParseIntPipe) take: number,
    @Query('projectId') projectId: string,
  ): Promise<ListNotesResponse> {
    const [notes, count] = await this.noteService.getProjectNotes(projectId, skip, take);

    return {
      count,
      notes,
    };
  }

  @Post('create')
  async createNote(@Body() payload: CreateNoteRequest, @CurrentUser() user: ContextUser): Promise<CreateNoteResponse> {
    const result = await this.noteService.createNote({ data: payload, userId: user.sub });

    return {
      id: result.id,
      noteText: result.noteText,
      isResolved: result.isResolved,
      createdBy: {
        displayName: result.createdBy.displayName,
        avatarColor: result.createdBy.avatarColor,
      },
      createdAt: result.createdAt,
    };
  }

  @Delete('delete')
  async deleteNote(@Param('id') id: string, @CurrentUser() user: ContextUser): Promise<DeleteNoteResponse> {
    const res = await this.noteService.deleteNote({ noteId: id, userId: user.sub });

    if (!res.affected) {
      throw new NotFoundException('Заметка не найдена или недостаточно прав для ее удаления');
    }

    return 'OK';
  }
}
