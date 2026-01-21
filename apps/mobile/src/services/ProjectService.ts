import { Project } from '../domain/entities/Project';
import { ProjectRepository } from '../domain/repositories/ProjectRepository';
import { ValidationService } from './ValidationService';
import { ProjectId } from '../core/types';
import { ValidationError } from '../core/exceptions';
import { getEventBus } from '../core/EventBus';
import { BoardService } from './BoardService';

export class ProjectNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectNotFoundError';
  }
}

export class ProjectService {
  private repository: ProjectRepository;
  private validator: ValidationService;
  private getBoardService: () => BoardService;

  constructor(
    repository: ProjectRepository,
    validator: ValidationService,
    getBoardService: () => BoardService,
  ) {
    this.repository = repository;
    this.validator = validator;
    this.getBoardService = getBoardService;
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.repository.loadAllProjects();
  }

  async getActiveProjects(): Promise<Project[]> {
    const projects = await this.repository.loadAllProjects();
    return projects.filter(p => p.status === 'active');
  }

  async getProjectById(projectId: ProjectId): Promise<Project> {
    const project = await this.repository.loadProjectById(projectId);

    if (!project) {
      throw new ProjectNotFoundError(`Project with id '${projectId}' not found`);
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
    description: string = '',
    color?: string,
  ): Promise<Project> {
    this.validator.validateBoardName(name);

    const existingProjects = await this.repository.loadAllProjects();
    const slug = this.generateSlug(name);
    const existingProject = existingProjects.find(p => p.slug === slug);

    if (existingProject) {
      throw new ValidationError(`Project '${name}' already exists`);
    }

    const project = await this.repository.createProjectWithDefaults(
      name,
      description,
      color,
    );

    await this.createDefaultBoard(project);

    await getEventBus().publish('project_created', {
      projectId: project.id,
      projectName: project.name,
      timestamp: new Date(),
    });

    return project;
  }

  private async createDefaultBoard(project: Project): Promise<void> {
    const boardService = this.getBoardService();
    await this.repository.saveProject(project);
    await boardService.createBoardInProject(project.id, 'default', '');
  }

  async updateProject(
    projectId: ProjectId,
    updates: { name?: string; description?: string; color?: string }
  ): Promise<Project> {
    const project = await this.getProjectById(projectId);

    if (updates.name) {
      this.validator.validateBoardName(updates.name);
    }

    project.update(updates);
    await this.repository.saveProject(project);

    await getEventBus().publish('project_updated', {
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

    await getEventBus().publish('project_archived', {
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
      await getEventBus().publish('project_deleted', {
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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }
}
