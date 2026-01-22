import { injectable, inject } from "tsyringe";
import { ProjectId } from "@core/types";
import { Project } from "@features/projects/domain/entities/Project";
import {
  ProjectRepository,
  ProjectListResult,
} from "@features/projects/domain/repositories/ProjectRepository";
import { FileSystemManager } from "@infrastructure/storage/FileSystemManager";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { FILE_SYSTEM_MANAGER, BACKEND_API_CLIENT } from "@core/di/tokens";

interface ProjectApiResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  status: "active" | "archived" | "completed";
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectListResponse {
  items: ProjectApiResponse[];
  total: number;
  page: number;
  limit: number;
}

@injectable()
export class BackendProjectRepository implements ProjectRepository {
  constructor(
    @inject(FILE_SYSTEM_MANAGER) private readonly fileSystem: FileSystemManager,
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async loadProjectsPaginated(
    page: number,
    limit: number,
  ): Promise<ProjectListResult> {
    const safeLimit = Math.min(limit, 100);
    const response = await this.apiClient.request<ProjectListResponse>(
      `/projects?page=${page}&limit=${safeLimit}`,
    );

    return {
      items: response.items.map((item) => this.mapProject(item)),
      total: response.total,
      page: response.page,
      limit: response.limit,
      hasMore:
        response.items.length === safeLimit &&
        response.items.length * page < response.total,
    };
  }

  async loadProjectById(projectId: ProjectId): Promise<Project | null> {
    const data = await this.apiClient.requestOrNull<ProjectApiResponse>(
      `/projects/${projectId}`,
    );
    if (!data) {
      return null;
    }
    return this.mapProject(data);
  }

  async loadProjectBySlug(slug: string): Promise<Project | null> {
    let page = 1;
    const limit = 100;

    while (true) {
      const result = await this.loadProjectsPaginated(page, limit);
      const match = result.items.find((project) => project.slug === slug);
      if (match) {
        return match;
      }

      if (!result.hasMore) {
        return null;
      }

      page += 1;
    }
  }

  async saveProject(_project: Project): Promise<void> {
    console.warn("Backend project updates are not supported yet.");
  }

  async deleteProject(_projectId: ProjectId): Promise<boolean> {
    console.warn("Backend project deletion is not supported yet.");
    return false;
  }

  async listProjectSlugs(): Promise<string[]> {
    const slugs: string[] = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const result = await this.loadProjectsPaginated(page, limit);
      slugs.push(...result.items.map((project) => project.slug));

      if (!result.hasMore) {
        break;
      }

      page += 1;
    }

    return slugs;
  }

  getProjectBoardsDirectory(project: Project): string {
    return this.fileSystem.getProjectBoardsDirectory(project.slug);
  }

  getProjectNotesDirectory(project: Project): string {
    return this.fileSystem.getProjectNotesDirectory(project.slug);
  }

  getProjectTimeDirectory(project: Project): string {
    return this.fileSystem.getProjectTimeDirectory(project.slug);
  }

  async createProjectWithDefaults(
    name: string,
    description?: string,
    color?: string,
  ): Promise<Project> {
    const payload = {
      name,
      description: description || undefined,
      color: color || undefined,
      status: "active",
    };

    const data = await this.apiClient.request<ProjectApiResponse>("/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const project = this.mapProject(data);
    await this.fileSystem.createProjectStructure(project.slug);
    return project;
  }

  private mapProject(project: ProjectApiResponse): Project {
    return new Project({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description || "",
      color: project.color,
      status: project.status,
      created_at: project.createdAt ? new Date(project.createdAt) : undefined,
      updated_at: project.updatedAt ? new Date(project.updatedAt) : undefined,
      file_path: project.filePath,
    });
  }
}
