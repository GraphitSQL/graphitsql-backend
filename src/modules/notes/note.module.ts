import { ProjectUserModule } from './../projects/project-user/project-user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteEntity } from './note.entity';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity]), ProjectUserModule],
  providers: [NoteService],
  controllers: [NoteController],
  exports: [NoteService],
})
export class NoteModule {}
