import { Injectable } from '@nestjs/common';
import { AgendaItemLog, AgendaItemLogType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export interface CreateLogData {
  agendaItemId: string;
  type: AgendaItemLogType;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  notes?: string;
}

@Injectable()
export class AgendaItemLogCreateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: CreateLogData): Promise<AgendaItemLog> {
    return this.prisma.agendaItemLog.create({
      data: {
        agendaItemId: data.agendaItemId,
        type: data.type,
        previousValue: data.previousValue ?? undefined,
        newValue: data.newValue ?? undefined,
        notes: data.notes ?? undefined,
      },
    });
  }
}
