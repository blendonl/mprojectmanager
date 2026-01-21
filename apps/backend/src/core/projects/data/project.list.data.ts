import { Project, ProjectStatus } from '../domain/project';

export interface ProjectListData {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  search?: string;
}

export interface ProjectListOptions {
  page: number;
  limit: number;
  status?: ProjectStatus;
  search?: string;
}

export interface ProjectListRepositoryResult {
  items: Project[];
  total: number;
}

export interface ProjectListResult extends ProjectListRepositoryResult {
  page: number;
  limit: number;
}
