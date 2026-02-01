import { Task } from '@prisma/client';
import { TaskPriority, TaskType } from 'shared-types';

export class TaskCreateResponse {
  id: string;
  slug: string;
  taskNumber: number;
  title: string;
  description: string | null;
  taskType: TaskType;
  priority: TaskPriority;
  columnId: string;
  parentId: string | null;
  position: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;

  static fromDomain(task: Task): TaskCreateResponse {
    const response = new TaskCreateResponse();
    response.id = task.id;
    response.slug = task.slug;
    response.taskNumber = task.taskNumber;
    response.title = task.title;
    response.description = task.description ?? null;
    response.taskType = task.type as TaskType;
    response.priority = task.priority as TaskPriority;
    response.columnId = task.columnId;
    response.parentId = task.parentId ?? null;
    response.position = task.position;
    response.dueDate = task.dueAt?.toISOString().split('T')[0] ?? null;
    response.createdAt = task.createdAt.toISOString();
    response.updatedAt = task.updatedAt.toISOString();
    return response;
  }
}
