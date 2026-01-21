import { TaskPriority, TaskType } from '@prisma/client';

export interface TaskResponse {
  id: string;
  columnId: string;
  parentId?: string | null;
  title: string;
  description?: string | null;
  type: TaskType;
  priority: TaskPriority;
}
