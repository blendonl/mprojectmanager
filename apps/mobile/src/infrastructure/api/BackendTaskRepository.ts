import { Task, TaskPriority, TaskType } from "../../domain/entities/Task";
import { TaskRepository } from "../../domain/repositories/TaskRepository";
import { BoardId, ColumnId, TaskId } from "../../core/types";
import { BackendApiClient } from "./BackendApiClient";

type ApiTaskType = "TASK" | "SUBTASK" | "MEETING";
type ApiTaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface TaskApiResponse {
  id: string;
  columnId: string;
  parentId?: string | null;
  title: string;
  description?: string | null;
  type: ApiTaskType;
  priority: ApiTaskPriority;
}

export class BackendTaskRepository implements TaskRepository {
  constructor(private apiClient: BackendApiClient) {}

  async listTasks(boardId: BoardId, columnId: ColumnId): Promise<Task[]> {
    const data = await this.apiClient.request<TaskApiResponse[]>(
      `/boards/${boardId}/columns/${columnId}/tasks`,
    );
    return data.map((task) => this.mapTask(task));
  }

  async createTask(
    boardId: BoardId,
    columnId: ColumnId,
    data: {
      title: string;
      description?: string;
      parentId?: string | null;
      taskType?: string;
      priority?: string;
      position?: number;
    },
  ): Promise<Task> {
    const payload = {
      title: data.title,
      description: data.description,
      parent_id: data.parentId ?? null,
      task_type: this.mapTaskTypeToApi(data.taskType),
      priority: this.mapPriorityToApi(data.priority),
      position: data.position,
    };

    const response = await this.apiClient.request<TaskApiResponse>(
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
      taskType?: string;
      priority?: string;
      position?: number;
    },
  ): Promise<Task> {
    const payload = {
      title: updates.title,
      description: updates.description,
      parent_id: updates.parentId,
      column_id: updates.columnId,
      task_type: this.mapTaskTypeToApi(updates.taskType),
      priority: this.mapPriorityToApi(updates.priority),
      position: updates.position,
    };

    const response = await this.apiClient.request<TaskApiResponse>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    return this.mapTask(response);
  }

  async deleteTask(boardId: BoardId, columnId: ColumnId, taskId: TaskId): Promise<boolean> {
    const response = await fetch(
      this.apiClient.buildUrl(`/boards/${boardId}/columns/${columnId}/tasks/${taskId}`),
      { method: "DELETE" },
    );

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status}`);
    }

    return true;
  }

  private mapTask(task: TaskApiResponse): Task {
    return new Task({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
      column_id: task.columnId,
      parent_id: task.parentId ?? null,
      task_type: this.mapTaskTypeFromApi(task.type),
      priority: this.mapPriorityFromApi(task.priority),
    });
  }

  private mapTaskTypeFromApi(type: ApiTaskType): TaskType {
    switch (type) {
      case "MEETING":
        return "meeting";
      case "SUBTASK":
        return "regular";
      case "TASK":
      default:
        return "regular";
    }
  }

  private mapTaskTypeToApi(type?: string): ApiTaskType | undefined {
    if (!type) {
      return undefined;
    }
    switch (type) {
      case "meeting":
        return "MEETING";
      default:
        return "TASK";
    }
  }

  private mapPriorityFromApi(priority: ApiTaskPriority): TaskPriority {
    switch (priority) {
      case "HIGH":
        return "high";
      case "MEDIUM":
        return "medium";
      case "URGENT":
        return "high";
      case "LOW":
      default:
        return "low";
    }
  }

  private mapPriorityToApi(priority?: string): ApiTaskPriority | undefined {
    if (!priority) {
      return undefined;
    }
    switch (priority) {
      case "high":
        return "HIGH";
      case "medium":
        return "MEDIUM";
      case "low":
        return "LOW";
      case "none":
      default:
        return "LOW";
    }
  }
}
