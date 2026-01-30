import { injectable, inject } from "tsyringe";
import { Task } from "../domain/entities/Task";
import {
  TaskRepository,
  GetAllTasksQuery,
} from "../domain/repositories/TaskRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { ColumnId, TaskId } from "@core/types";
import { TaskDto, TaskType, TaskPriority, TaskStatus, PaginatedResponse } from "shared-types";

@injectable()
export class BackendTaskRepository implements TaskRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async listTasks(columnId: ColumnId): Promise<Task[]> {
    const response = await this.apiClient.request<PaginatedResponse<TaskDto>>(
      `/tasks?columnId=${columnId}`,
    );
    return response.items.map((task) => this.mapTask(task));
  }

  async getAllTasks(query: GetAllTasksQuery): Promise<Task[]> {
    const params = new URLSearchParams();
    if (query.boardId) {
      params.append('boardId', query.boardId);
    }
    if (query.search) {
      params.append('search', query.search);
    }

    const response = await this.apiClient.request<PaginatedResponse<TaskDto>>(
      `/tasks?${params.toString()}`,
    );
    return response.items.map((task) => this.mapTask(task));
  }

  async getTaskById(taskId: TaskId): Promise<Task> {
    const response = await this.apiClient.request<TaskDto>(`/tasks/${taskId}`);
    return this.mapTask(response);
  }

  async createTask(data: Partial<Task> & { columnId: string; title: string }): Promise<Task> {
    const payload: Record<string, any> = {
      title: data.title,
      columnId: data.columnId,
    };

    if (data.description !== undefined) {
      payload.description = data.description;
    }
    if (data.parentId !== undefined) {
      payload.parentId = data.parentId;
    }
    if (data.taskType !== undefined) {
      payload.taskType = data.taskType;
    }
    if (data.priority !== undefined) {
      payload.priority = data.priority;
    }

    console.log('Creating task with payload:', JSON.stringify(payload, null, 2));

    const response = await this.apiClient.request<TaskDto>(`/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return this.mapTask(response);
  }

  async updateTask(taskId: TaskId, updates: Partial<Task>): Promise<Task> {
    const payload: Record<string, any> = {};

    if (updates.title !== undefined && updates.title !== null) {
      payload.title = updates.title;
    }
    if (updates.columnId !== undefined && updates.columnId !== null) {
      payload.columnId = updates.columnId;
    }
    if (updates.description !== undefined && updates.description !== null) {
      payload.description = updates.description;
    }
    if (updates.parentId !== undefined && updates.parentId !== null) {
      payload.parentId = updates.parentId;
    }
    if (updates.taskType !== undefined && updates.taskType !== null) {
      payload.taskType = updates.taskType;
    }
    if (updates.priority !== undefined && updates.priority !== null) {
      payload.priority = updates.priority;
    }
    if (updates.position !== undefined && updates.position !== null) {
      payload.position = updates.position;
    }

    console.log('Updating task with payload:', JSON.stringify(payload, null, 2));

    const response = await this.apiClient.request<TaskDto>(`/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return this.mapTask(response);
  }

  async deleteTask(taskId: TaskId): Promise<boolean> {
    await this.apiClient.request<{ deleted: boolean }>(`/tasks/${taskId}`, {
      method: "DELETE",
    });
    return true;
  }

  async moveTask(taskId: TaskId, targetColumnId: string): Promise<Task> {
    const response = await this.apiClient.request<TaskDto>(
      `/tasks/${taskId}/move`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetColumnId }),
      },
    );
    return this.mapTask(response);
  }

  async getWorkDuration(
    taskId: TaskId,
  ): Promise<{ durationMinutes: number; formattedDuration: string } | null> {
    return this.apiClient.requestOrNull(`/tasks/${taskId}/work-duration`);
  }

  private mapTask(dto: TaskDto): Task {
    return new Task({
      id: dto.id,
      slug: dto.slug,
      title: dto.title,
      description: dto.description,
      taskType: dto.taskType,
      status: dto.status,
      priority: dto.priority,
      columnId: dto.columnId,
      boardId: dto.boardId,
      projectId: dto.projectId,
      goalId: dto.goalId,
      position: dto.position,
      dueDate: dto.dueDate,
      estimatedMinutes: dto.estimatedMinutes,
      actualMinutes: dto.actualMinutes,
      filePath: dto.filePath,
      completedAt: dto.completedAt,
      parentId: dto.parentId,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }
}
