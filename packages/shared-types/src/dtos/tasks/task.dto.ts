import { TaskStatusType } from '../../enums/task-status.enum';
import { TaskPriorityType } from '../../enums/task-priority.enum';
import { TaskType } from '../../enums/task-type.enum';
import { EntityTimestamps } from '../../types/common.types';

/**
 * Task DTO
 */
export interface TaskDto extends EntityTimestamps {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  status: TaskStatusType;
  priority: TaskPriorityType | null;
  columnId: string;
  boardId: string;
  projectId: string;
  goalId: string | null;
  position: number;
  dueDate: string | null;  // YYYY-MM-DD
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  filePath: string | null;
  completedAt: string | null;
  parentId: string | null;
}

/**
 * Task with context (board, project names)
 */
export interface TaskDetailDto extends TaskDto {
  boardName: string;
  projectName: string;
  columnName: string;
}

/**
 * Create task request
 */
export interface TaskCreateRequestDto {
  title: string;
  description?: string;
  taskType?: TaskType;
  priority?: TaskPriorityType;
  columnId: string;
  goalId?: string;
  position?: number;
  dueDate?: string;
  estimatedMinutes?: number;
  parentId?: string;
}

/**
 * Update task request
 */
export interface TaskUpdateRequestDto {
  title?: string;
  description?: string;
  taskType?: TaskType;
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  columnId?: string;
  goalId?: string;
  position?: number;
  dueDate?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  completedAt?: string;
  parentId?: string;
}

/**
 * Move task request
 */
export interface TaskMoveRequestDto {
  columnId: string;
  position: number;
}
