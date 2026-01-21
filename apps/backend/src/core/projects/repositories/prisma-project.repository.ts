import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Project } from '../domain/project';
import { ProjectCreateData } from '../data/project.create.data';
import { ProjectRepository } from './project.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ProjectListOptions,
  ProjectListRepositoryResult,
} from '../data/project.list.data';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ProjectCreateData): Promise<Project> {
    return this.prisma.project.create({ data });
  }

  async findAll(options: ProjectListOptions): Promise<ProjectListRepositoryResult> {
    const where: Prisma.ProjectWhereInput = {};
    const search = options.search?.trim();

    if (options.status) {
      where.status = options.status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { id } });
  }
}
