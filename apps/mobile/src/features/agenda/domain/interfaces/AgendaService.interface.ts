import { AgendaItem } from '../entities/AgendaItem';
import { Task } from '@features/boards/domain/entities/Task';
import { TaskId, BoardId, ProjectId } from '@core/types';
import { TaskType, MeetingData } from '@features/boards/domain/entities/Task';

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
  items: ScheduledAgendaItem[];
  regularTasks: ScheduledAgendaItem[];
  meetings: ScheduledAgendaItem[];
  milestones: ScheduledAgendaItem[];
  orphanedItems: ScheduledAgendaItem[];
  tasks: ScheduledAgendaItem[];
}

export interface CreateAgendaItemRequest {
  projectId: ProjectId;
  boardId: BoardId;
  taskId: TaskId;
  date: string;
  time?: string;
  durationMinutes?: number;
  taskType?: TaskType;
  meetingData?: MeetingData;
}

export interface UpdateAgendaItemRequest {
  id: string;
  updates: Partial<{
    scheduled_date: string;
    scheduled_time: string | null;
    duration_minutes: number | null;
    task_type: TaskType;
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
  taskType: TaskType;
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