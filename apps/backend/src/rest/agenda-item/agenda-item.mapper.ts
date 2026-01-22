import { AgendaItem } from '@prisma/client';
import { AgendaItemResponse } from './dto/agenda-item.response';

export class AgendaItemMapper {
  static toResponse(item: AgendaItem): AgendaItemResponse {
    return {
      id: item.id,
      agendaId: item.agendaId,
      taskId: item.taskId,
      type: item.type,
      status: item.status,
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
