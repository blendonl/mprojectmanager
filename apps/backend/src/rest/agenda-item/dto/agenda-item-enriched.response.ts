import { AgendaItemResponse } from './agenda-item.response';

export interface TaskInfo {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  boardId: string;
  projectId: string;
}

export interface AgendaItemEnrichedResponse extends AgendaItemResponse {
  task: TaskInfo;
}
