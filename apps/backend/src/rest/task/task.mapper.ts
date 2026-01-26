import { TaskDto } from 'shared-types';

export class TaskMapper {
  static toResponse(task: any): TaskDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? null,
      taskType: task.type as any,
      status: 'pending' as any,
      priority: task.priority as any,
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
      createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: task.updatedAt ? task.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}
