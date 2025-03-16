import { RequestResult } from 'src/common/types';
import { CreateNoteDto } from './dtos';

export type PreResolutionNotesList = {
  id: string;
  noteText: string;
  isResolved: boolean;
  createdBy?: {
    displayName: string;
    avatarColor: string;
  };
  createdAt: Date;
};
export type ListNotesResponse = {
  count: number;
  notes: Array<PreResolutionNotesList>;
};

export class CreateNoteRequest extends CreateNoteDto {}
export type CreateNoteResponse = PreResolutionNotesList;

export type DeleteNoteResponse = RequestResult;
