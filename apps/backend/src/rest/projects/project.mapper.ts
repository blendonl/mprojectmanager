import { Project } from 'src/core/projects/domain/project';
import { ProjectResponse } from './dto/project.response';

export class ProjectMapper {
  static mapToResponse(project: Project): ProjectResponse {
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      color: project.color,
      status: project.status,
      filePath: project.filePath,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
