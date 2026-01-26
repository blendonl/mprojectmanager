import { injectable, inject } from "tsyringe";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { BoardId, ColumnId, TaskId } from "@core/types";
import { TaskLogDto, WorkDurationDto } from "shared-types";

export interface TaskLog {
  id: string;
  taskId: string;
  action: string;
  value?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface WorkDuration {
  durationMinutes: number;
  formattedDuration: string;
  startedAt?: Date;
  completedAt?: Date;
}

@injectable()
export class BackendTaskLogRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async getTaskHistory(
    boardId: BoardId,
    columnId: ColumnId,
    taskId: TaskId,
  ): Promise<TaskLog[]> {
    const response = await this.apiClient.request<TaskLogDto[]>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/logs`,
    );
    return response.map((log) => this.mapTaskLog(log));
  }

  async getWorkDuration(
    boardId: BoardId,
    columnId: ColumnId,
    taskId: TaskId,
  ): Promise<WorkDuration | null> {
    const response = await this.apiClient.requestOrNull<WorkDurationDto>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/work-duration`,
    );

    if (!response) {
      return null;
    }

    return {
      durationMinutes: response.durationMinutes,
      formattedDuration: response.formattedDuration,
      startedAt: response.startedAt ? new Date(response.startedAt) : undefined,
      completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
    };
  }

  private mapTaskLog(dto: TaskLogDto): TaskLog {
    return {
      id: dto.id,
      taskId: dto.taskId,
      action: dto.action,
      value: dto.value || undefined,
      metadata: dto.metadata || undefined,
      createdAt: new Date(dto.createdAt),
    };
  }
}
