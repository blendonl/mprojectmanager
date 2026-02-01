import { AgendaItem, AgendaItemLog } from '@prisma/client';
import { AgendaItemDto, AgendaItemLogDto } from 'shared-types';

type AgendaItemWithLogs = AgendaItem & {
  logs: AgendaItemLog[];
};

export class AgendaItemMapper {
  static toLogResponse(log: AgendaItemLog): AgendaItemLogDto {
    return {
      id: log.id,
      agendaItemId: log.agendaItemId,
      type: log.type as any,
      previousValue: log.previousValue as Record<string, any> | null,
      newValue: log.newValue as Record<string, any> | null,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
    };
  }

  static toResponse(item: AgendaItemWithLogs): AgendaItemDto {
    return {
      id: item.id,
      agendaId: item.agendaId,
      taskId: item.taskId ?? null,
      routineTaskId: item.routineTaskId ?? null,
      status: item.status as any,
      startAt: item.startAt?.toISOString() ?? null,
      duration: item.duration,
      position: item.position,
      notes: item.notes,
      notificationId: item.notificationId,
      logs: (item.logs || []).map(log => this.toLogResponse(log)),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
