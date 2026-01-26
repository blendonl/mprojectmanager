import { Injectable } from '@nestjs/common';
import { Goal } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoalCreateData } from '../data/goal.create.data';
import { GoalUpdateData } from '../data/goal.update.data';
import { GoalRepository } from './goal.repository';

@Injectable()
export class GoalPrismaRepository implements GoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: GoalCreateData): Promise<Goal> {
    return this.prisma.goal.create({
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }

  findAll(): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: number): Promise<Goal | null> {
    return this.prisma.goal.findUnique({
      where: { id },
    });
  }

  update(id: number, data: GoalUpdateData): Promise<Goal> {
    return this.prisma.goal.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.goal.delete({
      where: { id },
    });
  }
}
