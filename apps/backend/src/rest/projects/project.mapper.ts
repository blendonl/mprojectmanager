import { Project, ProjectWithDetails } from 'src/core/projects/domain/project';
import { ProjectDto, ProjectDetailDto } from 'shared-types';

export class ProjectMapper {
  static mapToResponse(project: Project): ProjectDto {
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

  static mapToDetailResponse(
    project: ProjectWithDetails,
  ): ProjectDetailDto {
    return {
      ...this.mapToResponse(project),
      boards:
        project.boards?.map((b) => ({
          id: b.id,
          name: b.name,
          columnCount: b.columnCount,
        })) ?? [],
      notes:
        project.notes?.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          preview: n.preview,
          updatedAt: n.updatedAt.toISOString(),
        })) ?? [],
      stats: {
        boardCount: project.stats.boardCount,
        noteCount: project.stats.noteCount,
        timeThisWeek: project.stats.timeThisWeek,
      },
    };
  }
}
