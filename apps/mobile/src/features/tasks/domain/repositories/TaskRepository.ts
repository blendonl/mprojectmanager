import { Task } from "../entities/Task";
import { ColumnId, TaskId, BoardId } from "@core/types";

export interface GetAllTasksQuery {
  boardId?: BoardId;
  search?: string;
}

export interface TaskRepository {
  listTasks(columnId: ColumnId): Promise<Task[]>;
  getAllTasks(query: GetAllTasksQuery): Promise<Task[]>;
  getTaskById(taskId: TaskId): Promise<Task>;
  createTask(data: Partial<Task> & { columnId: string; title: string }): Promise<Task>;
  updateTask(taskId: TaskId, updates: Partial<Task>): Promise<Task>;
  deleteTask(taskId: TaskId): Promise<boolean>;
  moveTask(taskId: TaskId, targetColumnId: ColumnId): Promise<Task>;
}
