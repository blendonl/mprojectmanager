import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ColumnRepository } from './column.repository';
import { Column } from '@prisma/client';
import { ColumnCreateData } from '../data/column.create.data';
import { ColumnUpdateData } from '../data/column.update.data';

@Injectable()
export class ColumnsPrismaRepository implements ColumnRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(boardId: string, data: ColumnCreateData): Promise<Column> {
    return this.prisma.column.create({
      data: {
        name: data.name,
        color: data.color,
        boardId: boardId,
        position: data.position,
        limit: data.limit ?? undefined,
      },
    });
  }
  findById(id: string): Promise<Column | null> {
    return this.prisma.column.findUnique({
      where: { id },
    });
  }
  findByBoardId(boardId: string): Promise<Column[]> {
    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });
  }
  findByName(boardId: string, name: string): Promise<Column | null> {
    return this.prisma.column.findFirst({
      where: { name, boardId },
    });
  }
  update(id: string, data: ColumnUpdateData): Promise<Column> {
    return this.prisma.column.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
        position: data.position,
        limit: data.limit ?? undefined,
      },
    });
  }

  async findNextPositionByBoardId(boardId: string): Promise<number> {
    const result = await this.prisma.column.findFirst({
      orderBy: { position: 'desc' },
      where: { boardId },
      select: { position: true },
    });

    return result ? result.position + 1 : 0;
  }
  async delete(id: string): Promise<void> {
    await this.prisma.column.delete({ where: { id } });
  }
}
