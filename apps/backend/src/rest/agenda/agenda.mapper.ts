import { Agenda } from '@prisma/client';
import {
  AgendaDto,
  AgendaItemEnrichedDto,
  AgendaEnrichedDto,
  AgendaSleepDto,
} from 'shared-types';
import {
  AgendaEnriched,
  AgendaItemEnriched,
} from '../../core/agenda/usecase/agenda.get-enriched-by-date.usecase';

export class AgendaMapper {
  static toAgendaResponse(agenda: Agenda): AgendaDto {
    return {
      id: agenda.id,
      date: agenda.date.toISOString(),
      notes: null,
      createdAt: agenda.createdAt.toISOString(),
      updatedAt: agenda.updatedAt.toISOString(),
    };
  }

  static toAgendaItemEnrichedResponse(
    item: AgendaItemEnriched,
  ): AgendaItemEnrichedDto {
    const routineTask = item.routineTask;
    const routine = routineTask?.routine;

    return {
      id: item.id,
      agendaId: item.agendaId,
      taskId: item.taskId,
      routineTaskId: item.routineTaskId ?? null,
      status: item.status as any,
      startAt: item.startAt?.toISOString() || null,
      duration: item.duration,
      position: item.position,
      notes: item.notes,
      completedAt: item.completedAt?.toISOString() || null,
      notificationId: item.notificationId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      task: item.task
        ? {
            id: item.task.id,
            title: item.task.title,
            description: item.task.description,
            taskType: 'regular' as any,
            priority: null,
            columnId: item.task.columnId,
            boardId: item.task.column.boardId,
            projectId: item.task.column.board.projectId,
            boardName: '',
            projectName: '',
            columnName: '',
            goalId: null,
          }
        : null,
      routineTask:
        routineTask && routine
          ? {
              id: routineTask.id,
              name: routineTask.name,
              routineId: routine.id,
              routineName: routine.name,
              routineType: routine.type as any,
              routineTarget: routine.target || null,
            }
          : null,
    };
  }

  static toAgendaEnrichedResponse(
    agenda: AgendaEnriched,
  ): AgendaEnrichedDto {
    const mappedItems = agenda.items.map((item) =>
      AgendaMapper.toAgendaItemEnrichedResponse(item),
    );
    const routineItems = mappedItems.filter((item) => item.routineTask);
    const taskItems = mappedItems.filter(
      (item) => item.task && !item.routineTask,
    );

    const sleepItems = routineItems
      .filter((item) => item.routineTask?.routineType === 'SLEEP')
      .sort((left, right) => left.position - right.position);
    const steps = routineItems.filter(
      (item) => item.routineTask?.routineType === 'STEP',
    );
    const routines = routineItems.filter(
      (item) => item.routineTask?.routineType !== 'SLEEP'
        && item.routineTask?.routineType !== 'STEP',
    );

    const sleep: AgendaSleepDto = {
      sleep: sleepItems[0] ?? null,
      wakeup: sleepItems[1] ?? null,
    };

    return {
      id: agenda.id,
      date: agenda.date.toISOString(),
      notes: null,
      sleep,
      steps,
      routines,
      tasks: taskItems,
      createdAt: agenda.createdAt.toISOString(),
      updatedAt: agenda.updatedAt.toISOString(),
    };
  }
}
