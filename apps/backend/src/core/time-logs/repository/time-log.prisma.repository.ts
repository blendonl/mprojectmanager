import { Injectable } from '@nestjs/common';
import { TimeLog } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TimeLogCreateData } from '../data/time-log.create.data';
import {
  ProjectSummary,
  TimeLogRepository,
} from './time-log.repository';

@Injectable()
export class TimeLogPrismaRepository implements TimeLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: TimeLogCreateData): Promise<TimeLog> {
    return this.prisma.timeLog.create({
      data: {
        projectId: data.projectId,
        taskId: data.taskId,
        date: data.date,
        durationMinutes: data.durationMinutes,
        source: data.source,
        metadata: data.metadata,
      },
    });
  }

  findByTaskId(taskId: string): Promise<TimeLog[]> {
    return this.prisma.timeLog.findMany({
      where: { taskId },
      orderBy: { date: 'desc' },
    });
  }

  findByProjectId(
    projectId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimeLog[]> {
    return this.prisma.timeLog.findMany({
      where: {
        projectId,
        ...(startDate && endDate
          ? {
              date: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {}),
      },
      orderBy: { date: 'desc' },
    });
  }

  findByDateRange(startDate: Date, endDate: Date): Promise<TimeLog[]> {
    return this.prisma.timeLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  findByDate(date: Date): Promise<TimeLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.timeLog.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getProjectSummary(
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProjectSummary[]> {
    const result = await this.prisma.timeLog.groupBy({
      by: ['projectId'],
      _sum: {
        durationMinutes: true,
      },
      where: {
        ...(projectId ? { projectId } : {}),
        ...(startDate && endDate
          ? {
              date: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {}),
      },
    });

    return result.map((item) => ({
      projectId: item.projectId || 'unknown',
      totalMinutes: item._sum.durationMinutes || 0,
    }));
  }
}
