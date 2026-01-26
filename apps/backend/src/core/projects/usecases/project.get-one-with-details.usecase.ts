import { Inject, Injectable } from '@nestjs/common';
import { ProjectWithDetails } from '../domain/project';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../repositories/project.repository';

@Injectable()
export class ProjectGetOneWithDetailsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(id: string): Promise<ProjectWithDetails | null> {
    return this.projectRepository.findByIdWithDetails(id);
  }
}
