import { RequestResult } from 'src/common/types';
import { CreateProjectDto, UpdateProjectDto } from './dtos';

export class CreateProjectRequest extends CreateProjectDto {}
export type CreateProjectResponse = {
  id: string;
  title: string;
  isPublic: boolean;
  createdBy: {
    id: string;
    displayName: string;
    avatarColor: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type PreResolutionListProject = {
  id: string;
  title: string;
  isPublic: boolean;
  createdBy?: {
    id: string;
    displayName: string;
    avatarColor: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
export type ListProjectsResponse = {
  count: number;
  projects: Array<PreResolutionListProject>;
};

export type DeleteProjectResponse = RequestResult;

export class UpdateProjectRequest extends UpdateProjectDto {}
export type UpdateProjectResponse = RequestResult;

export type JoinToProjectResponse = string;
