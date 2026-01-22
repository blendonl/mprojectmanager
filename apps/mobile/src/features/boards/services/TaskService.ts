/**
 * TaskService handles business logic for task operations
 * Ported from Python: src/services/item_service.py
 */

import { Board } from '../domain/entities/Board';
import { Task } from '../domain/entities/Task';
import { TaskRepository } from '../domain/repositories/TaskRepository';
import { ValidationService } from './ValidationService';
import { TaskId, ColumnId, ParentId } from '@core/types';
import {
  ItemNotFoundError,
  ColumnNotFoundError,
  ValidationError,
} from '@core/exceptions';
import { DEFAULT_ISSUE_TYPE } from '@core/constants';
import { getEventBus } from '@core/EventBus';
import { logger } from '@utils/logger';

export class TaskService {
  private taskRepository: TaskRepository;
  private validator: ValidationService;

  constructor(taskRepository: TaskRepository, validator: ValidationService) {
    this.taskRepository = taskRepository;
    this.validator = validator;
  }

  /**
   * Create a new task in a column
   * @throws {ColumnNotFoundError} if column not found
   * @throws {ValidationError} if validation fails or column at capacity
   */
  async createTask(
    board: Board,
    columnId: ColumnId,
    title: string,
    description: string = '',
    parentId?: ParentId | null
  ): Promise<Task> {
    logger.info(`[TaskService] Creating task: ${title} in board: ${board.name}`);
    this.validator.validateTaskTitle(title);

    const column = board.getColumnById(columnId);
    if (!column) {
      logger.warn(`[TaskService] Column not found: ${columnId}`);
      throw new ColumnNotFoundError(`Column with id '${columnId}' not found`);
    }

    // Check if column is at capacity before adding
    this.validator.validateColumnCapacity(column);

    if (parentId) {
      const parentTaskExists = board.columns.some((col) =>
        col.tasks.some((task) => task.id === parentId),
      );
      if (!parentTaskExists) {
        logger.warn(`[TaskService] Parent task not found: ${parentId}`);
        throw new ValidationError(`Parent task with id '${parentId}' not found`);
      }
    }

    const task = await this.taskRepository.createTask(
      board.id,
      column.id,
      {
        title,
        description: description || undefined,
        parentId: parentId ?? null,
        taskType: "regular",
        priority: "none",
        position: column.tasks.length,
      },
    );
    column.tasks.push(task);

    // Set default issue type for manually created tasks
    task.metadata.issue_type = DEFAULT_ISSUE_TYPE;

    logger.info(
      `[TaskService] Successfully created task: ${title} [${taskId}] in column: ${column.name}`
    );

    // Emit task created event
    await getEventBus().publish('task_created', {
      taskId: task.id,
      taskTitle: task.title,
      boardId: board.id,
      columnId: column.id,
      timestamp: new Date(),
    });

    return task;
  }

  /**
   * Update a task's properties
   * @throws {ItemNotFoundError} if task not found
   * @throws {ValidationError} if validation fails
   */
  async updateTask(board: Board, taskId: TaskId, updates: Partial<Task>): Promise<boolean> {
    for (const column of board.columns) {
      const task = column.getTaskById(taskId);
      if (task) {
        if (updates.title) {
          this.validator.validateTaskTitle(updates.title);
        }

        const updated = await this.taskRepository.updateTask(
          board.id,
          column.id,
          task.id,
          {
            title: updates.title,
            description: updates.description,
            parentId: updates.parent_id,
            priority: updates.priority,
            taskType: updates.task_type,
            position: updates.position,
            columnId: updates.column_id,
          },
        );
        column.tasks[taskIndex] = updated;

        // Emit task updated event
        await getEventBus().publish('task_updated', {
          taskId: updated.id,
          taskTitle: updated.title,
          boardId: board.id,
          columnId: column.id,
          timestamp: new Date(),
        });

        return true;
      }
    }

    throw new ItemNotFoundError(`Task with id '${taskId}' not found`);
  }

  /**
   * Delete a task from the board
   * @throws {ItemNotFoundError} if task not found
   * @throws {ValidationError} if deletion fails
   */
  async deleteTask(board: Board, taskId: TaskId): Promise<boolean> {
    logger.info(`[TaskService] Deleting task: ${taskId} from board: ${board.name}`);

    for (const column of board.columns) {
      const task = column.getTaskById(taskId);
      if (task) {
        console.debug(
          `[TaskService] Found task to delete: ${task.title} in column: ${column.name}`
        );

        const deleted = await this.taskRepository.deleteTask(board.id, column.id, task.id);
        if (!deleted) {
          console.error(
            `[TaskService] Failed to delete task from backend: ${task.title}`
          );
          throw new ValidationError('Failed to delete task from backend');
        }

        const success = column.removeTask(taskId);
        if (success) {
          logger.info(`[TaskService] Successfully deleted task: ${task.title}`);

          // Emit task deleted event
          await getEventBus().publish('task_deleted', {
            taskId: task.id,
            taskTitle: task.title,
            boardId: board.id,
            columnId: column.id,
            timestamp: new Date(),
          });
        }
        return success;
      }
    }

    logger.warn(`[TaskService] Task not found for deletion: ${taskId}`);
    throw new ItemNotFoundError(`Task with id '${taskId}' not found`);
  }

  /**
   * Move a task between columns
   * @throws {ItemNotFoundError} if task not found
   * @throws {ColumnNotFoundError} if target column not found
   * @throws {ValidationError} if target column at capacity
   */
  async moveTaskBetweenColumns(
    board: Board,
    taskId: TaskId,
    targetColumnId: ColumnId
  ): Promise<boolean> {
    let taskToMove: Task | null = null;
    let sourceColumn = null;

    // Find the task in the board
    for (const column of board.columns) {
      const task = column.getTaskById(taskId);
      if (task) {
        taskToMove = task;
        sourceColumn = column;
        break;
      }
    }

    if (!taskToMove || !sourceColumn) {
      throw new ItemNotFoundError(`Task with id '${taskId}' not found`);
    }

    if (sourceColumn.id === targetColumnId) {
      return false; // Already in target column
    }

    const targetColumn = board.getColumnById(targetColumnId);
    if (!targetColumn) {
      throw new ColumnNotFoundError(
        `Target column with id '${targetColumnId}' not found`
      );
    }

    // Check if target column is at capacity before moving
    this.validator.validateColumnCapacity(targetColumn);

    const updated = await this.taskRepository.updateTask(
      board.id,
      sourceColumn.id,
      taskToMove.id,
      {
        columnId: targetColumnId,
        position: targetColumn.tasks.length,
      },
    );

    // Update board structure after successful backend move
    const removed = sourceColumn.removeTask(taskId);
    if (!removed) {
      throw new ValidationError('Failed to remove task from source column');
    }

    targetColumn.moveTaskToEnd(updated);

    // Emit task moved event
    await getEventBus().publish('task_moved', {
      taskId: taskToMove.id,
      taskTitle: taskToMove.title,
      boardId: board.id,
      columnId: targetColumnId,
      previousColumnId: sourceColumn.id,
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * Set or clear the parent for a task
   * @throws {ValidationError} if parent not found
   * @throws {ItemNotFoundError} if task not found
   */
  async setTaskParent(
    board: Board,
    taskId: TaskId,
    parentId: ParentId | null
  ): Promise<boolean> {
    if (parentId) {
      const parentTaskExists = board.columns.some((column) =>
        column.tasks.some((task) => task.id === parentId),
      );
      if (!parentTaskExists) {
        throw new ValidationError(`Parent task with id '${parentId}' not found`);
      }
    }

    for (const column of board.columns) {
      const task = column.getTaskById(taskId);
      if (task) {
        const updated = await this.taskRepository.updateTask(
          board.id,
          column.id,
          task.id,
          { parentId },
        );
        task.setParent(updated.parent_id);
        return true;
      }
    }

    throw new ItemNotFoundError(`Task with id '${taskId}' not found`);
  }

  /**
   * Get tasks grouped by parent
   * Orphaned tasks come first, then tasks grouped by parent
   * @throws {ColumnNotFoundError} if column not found
   */
  async getTasksGroupedByParent(board: Board, columnId: ColumnId): Promise<Task[]> {
    const column = board.getColumnById(columnId);
    if (!column) {
      throw new ColumnNotFoundError(`Column with id '${columnId}' not found`);
    }

    const tasks = column.getAllTasks();
    const orphanedTasks = tasks.filter((task) => task.parent_id === null);
    const parentGroups: { [key: string]: Task[] } = {};

    // Group tasks by parent
    for (const task of tasks) {
      if (task.parent_id) {
        if (!parentGroups[task.parent_id]) {
          parentGroups[task.parent_id] = [];
        }
        parentGroups[task.parent_id].push(task);
      }
    }

    // Combine orphaned tasks with parent groups
    const groupedTasks = [...orphanedTasks];
    for (const parentId in parentGroups) {
      groupedTasks.push(...parentGroups[parentId]);
    }

    return groupedTasks;
  }

  async setTaskPriority(
    board: Board,
    taskId: TaskId,
    priority: 'high' | 'medium' | 'low' | 'none'
  ): Promise<void> {
    for (const column of board.columns) {
      const task = column.getTaskById(taskId);
      if (task) {
        const updated = await this.taskRepository.updateTask(
          board.id,
          column.id,
          task.id,
          { priority },
        );
        task.priority = updated.priority;
        return;
      }
    }
    throw new ItemNotFoundError(`Task with id '${taskId}' not found`);
  }

  async getTasksByPriority(board: Board, columnId: ColumnId): Promise<Task[]> {
    const column = board.getColumnById(columnId);
    if (!column) {
      throw new ColumnNotFoundError(`Column with id '${columnId}' not found`);
    }

    const tasks = column.getAllTasks();
    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };

    return tasks.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] ?? 3;
      const bPriority = priorityOrder[b.priority] ?? 3;
      return aPriority - bPriority;
    });
  }

  async setTaskMeasurableGoal(
    board: Board,
    taskId: TaskId,
    targetValue: number,
    valueUnit: string
  ): Promise<void> {
    for (const column of board.columns) {
      const task = column.getTaskById(taskId);
      if (task) {
        task.target_value = targetValue;
        task.value_unit = valueUnit;
        return;
      }
    }
    throw new ItemNotFoundError(`Task with id '${taskId}' not found`);
  }

  async setTaskGoal(board: Board, taskId: TaskId, goalId: string | null): Promise<void> {
    for (const column of board.columns) {
      const task = column.getTaskById(taskId);
      if (task) {
        task.goal_id = goalId;
        return;
      }
    }
    throw new ItemNotFoundError(`Task with id '${taskId}' not found`);
  }
}
