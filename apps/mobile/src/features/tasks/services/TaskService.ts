import { injectable, inject } from "tsyringe";
import { TaskId, ParentId } from "@core/types";
import { ValidationError } from "@core/exceptions";
import { TaskDto, TaskDetailDto, TaskCreateRequestDto, TaskUpdateRequestDto, TaskPriorityType } from "shared-types";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";

@injectable()
export class TaskService {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async getAllTasks(query: { projectId?: string; boardId?: string } = {}): Promise<TaskDto[]> {
    const params = new URLSearchParams();
    if (query.projectId) params.append("projectId", query.projectId);
    if (query.boardId) params.append("boardId", query.boardId);

    const queryString = params.toString();
    return await this.apiClient.request<TaskDto[]>(`/tasks${queryString ? `?${queryString}` : ""}`);
  }

  async createTask(params: TaskCreateRequestDto): Promise<TaskDto> {
    return await this.apiClient.request<TaskDto>(`/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  }

  async updateTask(taskId: TaskId, updates: TaskUpdateRequestDto): Promise<TaskDto> {
    return await this.apiClient.request<TaskDto>(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: TaskId): Promise<boolean> {
    await this.apiClient.request<{ deleted: boolean }>(`/tasks/${taskId}`, {
      method: "DELETE",
    });
    return true;
  }

  async moveTaskBetweenColumns(
    taskId: TaskId,
    targetColumnId: string,
  ): Promise<boolean> {
    await this.updateTask(taskId, { columnId: targetColumnId });
    return true;
  }

  async setTaskParent(taskId: TaskId, parentId: ParentId): Promise<boolean> {
    await this.updateTask(taskId, { parentId });
    return true;
  }

  async setTaskPriority(taskId: TaskId, priority: TaskPriorityType): Promise<void> {
    await this.updateTask(taskId, { priority });
  }

  async getTaskDetail(taskId: TaskId): Promise<TaskDetailDto | null> {
    return await this.apiClient.requestOrNull<TaskDetailDto>(`/tasks/${taskId}`);
  }
}
