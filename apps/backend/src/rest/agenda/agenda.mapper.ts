import { Agenda, AgendaItemStatus, AgendaItemType } from '@prisma/client';
import { AgendaResponse } from './dto/agenda.response';
import {
  AgendaEnriched,
  AgendaItemEnriched,
} from '../../core/agenda/usecase/agenda.get-enriched-by-date.usecase';
import { AgendaEnrichedResponse } from './dto/agenda-enriched.response';
import { AgendaItemEnrichedResponse } from '../agenda-item/dto/agenda-item-enriched.response';

export class AgendaMapper {
  static toAgendaResponse(agenda: Agenda): AgendaResponse {
    return {
      id: agenda.id,
      date: agenda.date.toISOString(),
      createdAt: agenda.createdAt.toISOString(),
      updatedAt: agenda.updatedAt.toISOString(),
    };
  }

  static toAgendaItemEnrichedResponse(
    item: AgendaItemEnriched,
  ): AgendaItemEnrichedResponse {
    return {
      id: item.id,
      agendaId: item.agendaId,
      taskId: item.taskId,
      type: item.type as AgendaItemType,
      status: item.status as AgendaItemStatus,
      startAt: item.startAt?.toISOString() || null,
      duration: item.duration,
      position: item.position,
      notes: item.notes,
      completedAt: item.completedAt?.toISOString() || null,
      notificationId: item.notificationId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      task: {
        id: item.task.id,
        title: item.task.title,
        description: item.task.description,
        columnId: item.task.columnId,
        boardId: item.task.column.boardId,
        projectId: item.task.column.board.projectId,
      },
    };
  }

  static toAgendaEnrichedResponse(
    agenda: AgendaEnriched,
  ): AgendaEnrichedResponse {
    return {
      id: agenda.id,
      date: agenda.date.toISOString(),
      items: agenda.items.map(this.toAgendaItemEnrichedResponse),
      createdAt: agenda.createdAt.toISOString(),
      updatedAt: agenda.updatedAt.toISOString(),
    };
  }
}
