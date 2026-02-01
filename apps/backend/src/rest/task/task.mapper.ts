import { TaskDto, TaskPriority, TaskStatus, TaskType } from 'shared-types';
import { ColumnMapper } from '../column/column.mapper';

export class TaskMapper {
  static toResponse(task: any): TaskDto {
    return {
      id: task.id,
      slug: task.slug,
      title: task.title,
      description: task.description ?? null,
      taskType: task.type as TaskType,
      status: task.status as TaskStatus,
      parentId: task.parentId || null,
      priority: task.priority as TaskPriority,
      columnId: task.columnId,
      boardId: task.column?.boardId || '',
      projectId: task.column?.board?.projectId || '',
      goalId: null,
      position: task.position || 0,
      dueDate: task.dueAt?.toISOString().split('T')[0] || null,
      estimatedMinutes: null,
      actualMinutes: null,
      filePath: null,
      completedAt: null,
      column: ColumnMapper.toResponse(task.column),
      createdAt: task.createdAt
        ? task.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: task.updatedAt
        ? task.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }
}
