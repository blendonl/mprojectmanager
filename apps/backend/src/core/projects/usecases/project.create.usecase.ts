import { Inject, Injectable } from '@nestjs/common';
import { Project } from '../domain/project';
import { InvalidProjectNameError } from '../errors/invalid-project-name.error';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../repositories/project.repository';
import { ProjectCreateData } from '../data/project.create.data';
import { ProjectStatus } from '../domain/project';

@Injectable()
export class ProjectCreateUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: ProjectCreateData): Promise<Project> {
    const name = input.name?.trim();

    if (!name) {
      throw new InvalidProjectNameError();
    }

    const slug = input.slug?.trim() || this.generateSlug(name);
    const status = this.normalizeStatus(input.status);

    return this.projectRepository.create({
      name,
      slug,
      description: input.description?.trim() || null,
      color: input.color?.trim(),
      status,
      filePath: input.filePath ?? undefined,
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  private normalizeStatus(status?: ProjectStatus): ProjectStatus | undefined {
    if (!status) {
      return undefined;
    }

    const allowed: ProjectStatus[] = ['active', 'archived', 'completed'];
    return allowed.includes(status) ? status : undefined;
  }
}
