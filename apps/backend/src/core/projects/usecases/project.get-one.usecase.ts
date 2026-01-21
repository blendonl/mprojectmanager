import { Inject, Injectable } from '@nestjs/common';
import { Project } from '../domain/project';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../repositories/project.repository';

@Injectable()
export class ProjectGetOneUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(id: string): Promise<Project | null> {
    return this.projectRepository.findById(id);
  }
}
