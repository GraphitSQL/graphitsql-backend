import { PreResolutionListProject } from '../projects.contracts';
import { ProjectUserEntity } from '../project-user/project-user.entity';

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
