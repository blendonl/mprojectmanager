import { Injectable } from '@nestjs/common';
import { ProjectCreateUseCase } from '../usecases/project.create.usecase';
import { ProjectCreateData } from '../data/project.create.data';
import { ProjectListData } from '../data/project.list.data';
import { ProjectGetAllUseCase } from '../usecases/project.get-all.usecase';
import { ProjectGetOneUseCase } from '../usecases/project.get-one.usecase';
import { ProjectGetOneWithDetailsUseCase } from '../usecases/project.get-one-with-details.usecase';

@Injectable()
export class ProjectsCoreService {
  constructor(
    private readonly projectCreateUseCase: ProjectCreateUseCase,
    private readonly projectGetAllUseCase: ProjectGetAllUseCase,
    private readonly projectGetOneUseCase: ProjectGetOneUseCase,
    private readonly projectGetOneWithDetailsUseCase: ProjectGetOneWithDetailsUseCase,
  ) {}

  async createProject(data: ProjectCreateData) {
    return this.projectCreateUseCase.execute(data);
  }

  async getProjects(query: ProjectListData) {
    return this.projectGetAllUseCase.execute(query);
  }

  async getProjectById(id: string) {
    return this.projectGetOneUseCase.execute(id);
  }

  async getProjectByIdWithDetails(id: string) {
    return this.projectGetOneWithDetailsUseCase.execute(id);
  }
}
