import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Project, ProjectWithDetails } from '../domain/project';
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

  async findByIdWithDetails(id: string): Promise<ProjectWithDetails | null> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        boards: {
          include: {
            columns: {
              select: { id: true },
            },
          },
        },
        timeLogs: {
          where: {
            date: { gte: weekAgo },
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    const totalMinutes = project.timeLogs.reduce(
      (sum, log) => sum + (log.durationMinutes || 0),
      0,
    );

    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      color: project.color,
      status: project.status,
      filePath: project.filePath,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      boards: project.boards.map((b) => ({
        id: b.id,
        name: b.name,
        columnCount: b.columns.length,
      })),
      notes: [],
      stats: {
        boardCount: project.boards.length,
        noteCount: 0,
        timeThisWeek: totalMinutes,
      },
    };
  }
}
