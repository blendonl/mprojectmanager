import { injectable, inject } from "tsyringe";
import { Task } from "../domain/entities/Task";
import { TaskRepository } from "../domain/repositories/TaskRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { BoardId, ColumnId, TaskId } from "@core/types";
import { TaskDto, TaskType, TaskPriority, TaskStatus } from "@mprojectmanager/shared-types";

@injectable()
export class BackendTaskRepository implements TaskRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async listTasks(boardId: BoardId, columnId: ColumnId): Promise<Task[]> {
    const response = await this.apiClient.request<TaskDto[]>(
      `/boards/${boardId}/columns/${columnId}/tasks`,
    );
    return response.map((task) => this.mapTask(task));
  }

  async getTaskById(boardId: BoardId, columnId: ColumnId, taskId: TaskId): Promise<Task> {
    const response = await this.apiClient.request<TaskDto>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
    );
    return this.mapTask(response);
  }

  async createTask(
    boardId: BoardId,
    columnId: ColumnId,
    data: {
      title: string;
      description?: string;
      parentId?: string | null;
      taskType?: TaskType;
      priority?: TaskPriority;
      position?: number;
    },
  ): Promise<Task> {
    const payload = {
      title: data.title,
      description: data.description || null,
      parentId: data.parentId || null,
      taskType: data.taskType || TaskType.REGULAR,
      priority: data.priority || TaskPriority.LOW,
      position: data.position ?? 0,
      columnId: columnId,
    };

    const response = await this.apiClient.request<TaskDto>(
      `/boards/${boardId}/columns/${columnId}/tasks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    return this.mapTask(response);
  }

  async updateTask(
    boardId: BoardId,
    columnId: ColumnId,
    taskId: TaskId,
    updates: {
      title?: string;
      description?: string;
      parentId?: string | null;
      columnId?: string;
      taskType?: TaskType;
      priority?: TaskPriority;
      status?: TaskStatus;
      position?: number;
    },
  ): Promise<Task> {
    const payload = {
      title: updates.title,
      description: updates.description,
      parentId: updates.parentId,
      columnId: updates.columnId,
      taskType: updates.taskType,
      priority: updates.priority,
      status: updates.status,
      position: updates.position,
    };

    const response = await this.apiClient.request<TaskDto>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    return this.mapTask(response);
  }

  async deleteTask(
    boardId: BoardId,
    columnId: ColumnId,
    taskId: TaskId,
  ): Promise<boolean> {
    await this.apiClient.request<{ deleted: boolean }>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
      {
        method: "DELETE",
      },
    );
    return true;
  }

  async moveTask(
    boardId: BoardId,
    columnId: ColumnId,
    taskId: TaskId,
    targetColumnId: string,
  ): Promise<Task> {
    const response = await this.apiClient.request<TaskDto>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/move`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetColumnId }),
      },
    );
    return this.mapTask(response);
  }

  async getWorkDuration(
    boardId: BoardId,
    columnId: ColumnId,
    taskId: TaskId,
  ): Promise<{ durationMinutes: number; formattedDuration: string } | null> {
    return this.apiClient.requestOrNull(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/work-duration`,
    );
  }

  private mapTask(dto: TaskDto): Task {
    return new Task({
      id: dto.id,
      column_id: dto.columnId,
      parent_id: dto.parentId || null,
      title: dto.title,
      description: dto.description || undefined,
      position: dto.position,
      type: dto.taskType,
      priority: dto.priority || TaskPriority.LOW,
      status: dto.status,
      created_at: new Date(dto.createdAt),
      updated_at: new Date(dto.updatedAt),
      due_at: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }
}
