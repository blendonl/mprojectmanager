import { ProjectCreateData } from '../data/project.create.data';
import {
  ProjectListOptions,
  ProjectListRepositoryResult,
} from '../data/project.list.data';
import { Project, ProjectWithDetails } from '../domain/project';

export const PROJECT_REPOSITORY = Symbol('ProjectRepository');

export interface ProjectRepository {
  create(data: ProjectCreateData): Promise<Project>;
  findAll(options: ProjectListOptions): Promise<ProjectListRepositoryResult>;
  findById(id: string): Promise<Project | null>;
  findByIdWithDetails(id: string): Promise<ProjectWithDetails | null>;
}
