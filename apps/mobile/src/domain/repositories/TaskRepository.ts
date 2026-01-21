import { Task } from "../entities/Task";
import { BoardId, ColumnId, TaskId } from "../../core/types";

export interface TaskRepository {
  listTasks(boardId: BoardId, columnId: ColumnId): Promise<Task[]>;
  createTask(
    boardId: BoardId,
    columnId: ColumnId,
    data: {
      title: string;
      description?: string;
      parentId?: string | null;
      taskType?: string;
      priority?: string;
      position?: number;
    }
  ): Promise<Task>;
  updateTask(
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
    }
  ): Promise<Task>;
  deleteTask(boardId: BoardId, columnId: ColumnId, taskId: TaskId): Promise<boolean>;
}
