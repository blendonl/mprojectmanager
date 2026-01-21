import { ProjectResponse } from './project.response';

export interface ProjectListResponse {
  items: ProjectResponse[];
  total: number;
  page: number;
  limit: number;
}
