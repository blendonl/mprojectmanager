import { ProjectId } from "../../core/types";
import { Project } from "../../domain/entities/Project";
import { ProjectRepository } from "../../domain/repositories/ProjectRepository";
import { FileSystemManager } from "../storage/FileSystemManager";
import { BackendApiClient } from "./BackendApiClient";

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

export class BackendProjectRepository implements ProjectRepository {
  private fileSystem: FileSystemManager;
  private apiClient: BackendApiClient;

  constructor(fileSystem: FileSystemManager) {
    this.fileSystem = fileSystem;
    this.apiClient = new BackendApiClient();
  }

  async loadAllProjects(): Promise<Project[]> {
    const projects: Project[] = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const response = await this.apiClient.request<ProjectListResponse>(
        `/projects?page=${page}&limit=${limit}`,
      );

      projects.push(...response.items.map((item) => this.mapProject(item)));

      if (projects.length >= response.total) {
        break;
      }

      page += 1;
    }

    return projects;
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
    const projects = await this.loadAllProjects();
    return projects.find((project) => project.slug === slug) || null;
  }

  async saveProject(_project: Project): Promise<void> {
    console.warn("Backend project updates are not supported yet.");
  }

  async deleteProject(_projectId: ProjectId): Promise<boolean> {
    console.warn("Backend project deletion is not supported yet.");
    return false;
  }

  async listProjectSlugs(): Promise<string[]> {
    const projects = await this.loadAllProjects();
    return projects.map((project) => project.slug);
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
