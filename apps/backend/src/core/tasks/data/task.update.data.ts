import { TaskType, TaskPriority } from '@prisma/client';

export interface TaskUpdateData {
  position: any;
  title?: string;
  columnId?: string;
  description?: string;
  parentId?: string | null;
  type?: TaskType;
  priority?: TaskPriority;
}
