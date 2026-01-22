import { Project } from "../entities/Project";
import { ProjectId } from "@core/types";

export interface ProjectListResult {
  items: Project[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProjectRepository {
  loadProjectsPaginated(page: number, limit: number): Promise<ProjectListResult>;

  loadProjectById(projectId: ProjectId): Promise<Project | null>;

  loadProjectBySlug(slug: string): Promise<Project | null>;

  saveProject(project: Project): Promise<void>;

  deleteProject(projectId: ProjectId): Promise<boolean>;

  listProjectSlugs(): Promise<string[]>;

  getProjectBoardsDirectory(project: Project): string;

  getProjectNotesDirectory(project: Project): string;

  getProjectTimeDirectory(project: Project): string;

  createProjectWithDefaults(
    name: string,
    description?: string,
    color?: string,
  ): Promise<Project>;
}
