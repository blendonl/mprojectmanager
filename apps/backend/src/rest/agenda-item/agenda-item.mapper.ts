import { AgendaItem } from '@prisma/client';
import { AgendaItemDto } from 'shared-types';

export class AgendaItemMapper {
  static toResponse(item: AgendaItem): AgendaItemDto {
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
      completedAt: item.completedAt?.toISOString() ?? null,
      notificationId: item.notificationId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
