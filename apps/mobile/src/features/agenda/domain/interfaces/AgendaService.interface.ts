import { AgendaItem, AgendaTaskType, MeetingData } from '../entities/AgendaItem';
import { Task } from '@features/tasks';
import { TaskId, BoardId, ProjectId } from '@core/types';

export interface ScheduledAgendaItem {
  agendaItem: AgendaItem;
  task: Task | null;
  boardId: BoardId;
  boardName: string;
  projectName: string;
  columnName: string | null;
  isOrphaned: boolean;
}

export interface ScheduledTask {
  task: Task;
  boardId: string;
  boardName: string;
  projectName: string;
}

export interface DayAgenda {
  date: string;
  sleep: {
    sleep: ScheduledAgendaItem | null;
    wakeup: ScheduledAgendaItem | null;
  };
  steps: ScheduledAgendaItem[];
  routines: ScheduledAgendaItem[];
  tasks: ScheduledAgendaItem[];
  orphanedItems: ScheduledAgendaItem[];
}

export interface CreateAgendaItemRequest {
  agendaId: string;
  taskId: TaskId;
  type: AgendaTaskType;
  status: string;
  startAt: string | null;
  duration?: number | null;
  position: number;
  notes: string | null;
  notificationId: string | null;
}

export interface UpdateAgendaItemRequest {
  id: string;
  updates: Partial<{
    scheduled_date: string;
    scheduled_time: string | null;
    duration_minutes: number | null;
    task_type: AgendaTaskType;
    meeting_data: MeetingData | null;
    notes: string;
    completed_at: Date | null;
    actual_value: number | null;
    is_unfinished: boolean;
  }>;
}

export interface RescheduleAgendaItemRequest {
  item: AgendaItem;
  newDate: string;
  newTime?: string;
}

export interface ScheduleTaskRequest {
  boardId: BoardId;
  taskId: TaskId;
  date: string;
  time?: string;
  durationMinutes?: number;
}

export interface SetTaskTypeRequest {
  boardId: BoardId;
  taskId: TaskId;
  taskType: AgendaTaskType;
}

export interface UpdateMeetingDataRequest {
  boardId: BoardId;
  taskId: TaskId;
  meetingData: MeetingData;
}

export interface UpdateActualValueRequest {
  agendaItemId: string;
  value: number;
}

export interface AgendaFilterOptions {
  projectId?: ProjectId;
  goalId?: string;
}
