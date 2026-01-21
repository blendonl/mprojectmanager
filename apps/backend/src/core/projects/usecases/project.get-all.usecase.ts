import { Inject, Injectable } from '@nestjs/common';
import { ProjectListData, ProjectListResult } from '../data/project.list.data';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../repositories/project.repository';

@Injectable()
export class ProjectGetAllUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: ProjectListData): Promise<ProjectListResult> {
    const page = this.normalizePage(input.page);
    const limit = this.normalizeLimit(input.limit);

    const { items, total } = await this.projectRepository.findAll({
      page,
      limit,
      status: input.status,
      search: input.search,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  private normalizePage(page?: number): number {
    const value = Number.isFinite(page) ? Math.floor(page ?? 1) : 1;
    return Math.max(1, value);
  }

  private normalizeLimit(limit?: number): number {
    const value = Number.isFinite(limit) ? Math.floor(limit ?? 20) : 20;
    return Math.min(Math.max(1, value), 100);
  }
}
