import { Injectable } from '@nestjs/common';
import { AlarmPlan, AlarmPlanStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AlarmPlanCreateData } from '../data/alarm-plan.create.data';
import { AlarmPlanUpdateData } from '../data/alarm-plan.update.data';
import { AlarmPlanRepository } from './alarm-plan.repository';

@Injectable()
export class AlarmPlanPrismaRepository implements AlarmPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<AlarmPlan | null> {
    return this.prisma.alarmPlan.findUnique({ where: { id } });
  }

  findByRoutineTaskId(routineTaskId: string): Promise<AlarmPlan[]> {
    return this.prisma.alarmPlan.findMany({
      where: { routineTaskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findLatestByRoutineTaskId(routineTaskId: string): Promise<AlarmPlan | null> {
    return this.prisma.alarmPlan.findFirst({
      where: { routineTaskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findActiveByRoutineTaskId(routineTaskId: string): Promise<AlarmPlan | null> {
    return this.prisma.alarmPlan.findFirst({
      where: {
        routineTaskId,
        status: { in: [AlarmPlanStatus.PENDING, AlarmPlanStatus.ACTIVE] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: AlarmPlanCreateData): Promise<AlarmPlan> {
    return this.prisma.alarmPlan.create({
      data: {
        routineTaskId: data.routineTaskId,
        type: data.type,
        targetAt: data.targetAt,
        repeatIntervalMinutes: data.repeatIntervalMinutes,
        metadata: data.metadata ?? undefined,
      },
    });
  }

  update(id: string, data: AlarmPlanUpdateData): Promise<AlarmPlan> {
    return this.prisma.alarmPlan.update({
      where: { id },
      data: {
        status: data.status,
      },
    });
  }
}
