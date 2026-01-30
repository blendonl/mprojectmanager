import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BoardCreateData } from '../data/board.create.data';
import {
  BoardListOptions,
  BoardListRepositoryResult,
} from '../data/board.list.data';
import { BoardUpdateData } from '../data/board.update.data';
import { Board } from '../domain/board';
import { BoardRepository } from './board.repository';
import { BoardFindOneReturnType } from '../data/board.find-one.return.type';

@Injectable()
export class PrismaBoardRepository implements BoardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: BoardCreateData): Promise<Board> {
    return this.prisma.board.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description ?? null,
        projectId: data.projectId,
        columns: {
          create:
            data.columns?.map((column, index) => ({
              name: column.name,
              color: column.color,
              position: index,
            })) ?? [],
        },
      },
      include: {
        columns: true,
      },
    });
  }

  async findAll(options: BoardListOptions): Promise<BoardListRepositoryResult> {
    const where: Prisma.BoardWhereInput = {};
    const search = options.search?.trim();

    if (options.projectId) {
      where.projectId = options.projectId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.board.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      this.prisma.board.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<BoardFindOneReturnType | null> {
    return this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: BoardUpdateData): Promise<Board | null> {
    return await this.prisma.board.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.board.delete({ where: { id } });
    return true;
  }
}
