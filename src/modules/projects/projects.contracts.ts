import { RequestResult } from 'src/common/types';
import { CreateProjectDto, UpdateProjectDataDto, UpdateProjectDto } from './dtos';
import { PreResolutionNode } from '../nodes/types';
import { PreResolutionEdge } from '../edges/types';

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

export type ProjectData = {
  nodes: PreResolutionNode[];
  edges: PreResolutionEdge[];
};

export type ProjectDataResponse = {
  data: ProjectData;
  isScratch: boolean;
};

export class UpdateProjectDataRequest extends UpdateProjectDataDto {}
