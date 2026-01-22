import { Project } from "../domain/entities/Project";
import {
  ProjectRepository,
  ProjectListResult,
} from "../domain/repositories/ProjectRepository";
import { ValidationService } from "./ValidationService";
import { ProjectId } from "@core/types";
import { getEventBus } from "@core/EventBus";

export class ProjectNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}

export class ProjectService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly validator: ValidationService,
  ) {}

  async getProjectsPaginated(
    page: number,
    limit: number,
  ): Promise<ProjectListResult> {
    return await this.repository.loadProjectsPaginated(page, limit);
  }

  async getProjectById(projectId: ProjectId): Promise<Project> {
    const project = await this.repository.loadProjectById(projectId);

    if (!project) {
      throw new ProjectNotFoundError(
        `Project with id '${projectId}' not found`,
      );
    }

    return project;
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    const project = await this.repository.loadProjectBySlug(slug);

    if (!project) {
      throw new ProjectNotFoundError(`Project with slug '${slug}' not found`);
    }

    return project;
  }

  async createProject(
    name: string,
    description: string = "",
    color?: string,
  ): Promise<Project> {
    this.validator.validateBoardName(name);

    const project = await this.repository.createProjectWithDefaults(
      name,
      description,
      color,
    );

    await getEventBus().publish("project_created", {
      projectId: project.id,
      projectName: project.name,
      timestamp: new Date(),
    });

    return project;
  }

  async updateProject(
    projectId: ProjectId,
    updates: { name?: string; description?: string; color?: string },
  ): Promise<Project> {
    const project = await this.getProjectById(projectId);

    if (updates.name) {
      this.validator.validateBoardName(updates.name);
    }

    project.update(updates);
    await this.repository.saveProject(project);

    await getEventBus().publish("project_updated", {
      projectId: project.id,
      projectName: project.name,
      timestamp: new Date(),
    });

    return project;
  }

  async archiveProject(projectId: ProjectId): Promise<Project> {
    const project = await this.getProjectById(projectId);
    project.archive();
    await this.repository.saveProject(project);

    await getEventBus().publish("project_archived", {
      projectId: project.id,
      projectName: project.name,
      timestamp: new Date(),
    });

    return project;
  }

  async deleteProject(projectId: ProjectId): Promise<boolean> {
    const project = await this.getProjectById(projectId);
    const deleted = await this.repository.deleteProject(projectId);

    if (deleted) {
      await getEventBus().publish("project_deleted", {
        projectId: project.id,
        projectName: project.name,
        timestamp: new Date(),
      });
    }

    return deleted;
  }

  getProjectBoardsDirectory(project: Project): string {
    return this.repository.getProjectBoardsDirectory(project);
  }

  getProjectNotesDirectory(project: Project): string {
    return this.repository.getProjectNotesDirectory(project);
  }

  getProjectTimeDirectory(project: Project): string {
    return this.repository.getProjectTimeDirectory(project);
  }
}
