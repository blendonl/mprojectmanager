import { injectable, inject } from "tsyringe";
import { Task } from "../domain/entities/Task";
import { TaskRepository, GetAllTasksQuery } from "../domain/repositories/TaskRepository";
import { TaskId, ParentId } from "@core/types";
import { ValidationError } from "@core/exceptions";
import { TaskType, TaskPriority } from "shared-types";
import { TASK_REPOSITORY } from "@core/di/tokens";

@injectable()
export class TaskService {
  constructor(
    @inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
  ) {}

  async getAllTasks(query: GetAllTasksQuery = {}): Promise<Task[]> {
    return await this.taskRepository.getAllTasks(query);
  }

  async createTask(params: Partial<Task> & { columnId: string; title: string }): Promise<Task> {
    return await this.taskRepository.createTask(params);
  }

  async updateTask(taskId: TaskId, updates: Partial<Task>): Promise<Task> {
    return await this.taskRepository.updateTask(taskId, updates);
  }

  async deleteTask(taskId: TaskId): Promise<boolean> {
    const deleted = await this.taskRepository.deleteTask(taskId);

    if (!deleted) {
      throw new ValidationError("Failed to delete task from backend");
    }

    return true;
  }

  async moveTaskBetweenColumns(
    taskId: TaskId,
    targetColumnId: string,
  ): Promise<boolean> {
    const updated = await this.taskRepository.moveTask(taskId, targetColumnId);

    return true;
  }

  async setTaskParent(taskId: TaskId, parentId: ParentId): Promise<boolean> {
    const updated = await this.taskRepository.updateTask(taskId, {
      parentId,
    });

    return true;
  }

  async getTasksGroupedByParent(parentId: string): Promise<Task[]> {
    return [];
  }

  async setTaskPriority(taskId: TaskId, priority: TaskPriority): Promise<void> {
    const updated = await this.taskRepository.updateTask(taskId, {
      priority,
    });
  }

  async getTasksByPriority(): Promise<Task[]> {
    return [];
  }

  async batchMoveTasks(
    taskIds: TaskId[],
    targetColumnId: string,
  ): Promise<void> {}

  async getTaskDetail(taskId: TaskId): Promise<Task | null> {
    return await this.taskRepository.getTaskById(taskId);
  }

  async validateTaskMove(
    taskId: TaskId,
    targetColumnId: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    return { valid: true };
  }
}
