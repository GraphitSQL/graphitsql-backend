import { PreResolutionListProject, ProjectMember } from '../projects.contracts';
import { ProjectUserEntity } from '../project-user/project-user.entity';
import { ProjectEntity } from '../project/project.entity';

export function buildListProjectResponse(data: ProjectUserEntity): PreResolutionListProject {
  return {
    id: data.project.id,
    title: data.project.title,
    isPublic: data.project.isPublic,
    createdAt: data.project.createdAt,
    updatedAt: data.project.updatedAt,
    ...(data.project.createdBy && {
      createdBy: {
        id: data.project.createdBy.id,
        displayName: data.project.createdBy.displayName,
        avatarColor: data.project.createdBy.avatarColor,
      },
    }),
  };
}

export function buildProjectResponse(data: ProjectEntity): PreResolutionListProject {
  return {
    id: data.id,
    title: data.title,
    isPublic: data.isPublic,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    ...(data.createdBy && {
      createdBy: {
        id: data.createdBy.id,
        displayName: data.createdBy.displayName,
        avatarColor: data.createdBy.avatarColor,
      },
    }),
  };
}

export function buildProjectMembersListResponse(data: ProjectUserEntity): ProjectMember {
  return {
    id: data.id,
    displayName: data.user.displayName,
    avatarColor: data.user.avatarColor,
    isOwner: data.project.createdById === data.user.id,
    userId: data.user.id,
  };
}
