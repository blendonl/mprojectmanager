/**
 * BoardService handles business logic for board operations
 * Ported from Python: src/services/board_service.py
 */

import { Board } from "../domain/entities/Board";
import { Column } from "../domain/entities/Column";
import { Task } from "../domain/entities/Task";
import { BoardRepository } from "../domain/repositories/BoardRepository";
import { ColumnRepository } from "../domain/repositories/ColumnRepository";
import { TaskRepository } from "../domain/repositories/TaskRepository";
import { ValidationService } from "./ValidationService";
import { BoardId, ColumnId, ProjectId } from "../core/types";
import { BoardNotFoundError, ValidationError } from "../core/exceptions";
import { getEventBus } from "../core/EventBus";
import { ProjectService } from "./ProjectService";
import { logger } from "../utils/logger";

export class BoardService {
  private repository: BoardRepository;
  private columnRepository: ColumnRepository;
  private taskRepository: TaskRepository;
  private validator: ValidationService;
  private getProjectService: () => ProjectService;

  constructor(
    repository: BoardRepository,
    columnRepository: ColumnRepository,
    taskRepository: TaskRepository,
    validator: ValidationService,
    getProjectService: () => ProjectService,
  ) {
    this.repository = repository;
    this.columnRepository = columnRepository;
    this.taskRepository = taskRepository;
    this.validator = validator;
    this.getProjectService = getProjectService;
  }

  /**
   * Get boards for a specific project
   */
  async getBoardsByProject(projectId: ProjectId): Promise<Board[]> {
    return await this.repository.loadBoardsByProjectId(projectId);
  }

  /**
   * Get all boards from all projects
   */
  async getAllBoards(): Promise<Board[]> {
    return await this.repository.loadAllBoards();
  }

  /**
   * Get a board by its ID
   * @throws {BoardNotFoundError} if board not found
   */
  async getBoardById(boardId: BoardId): Promise<Board> {
    logger.debug(`[BoardService] Loading board by id: ${boardId}`);
    const board = await this.repository.loadBoardById(boardId);

    if (!board) {
      logger.warn(`[BoardService] Board not found: ${boardId}`);
      throw new BoardNotFoundError(`Board with id '${boardId}' not found`);
    }

    logger.info(
      `[BoardService] Successfully loaded board: ${board.name} ugugaga`,
    );

    await getEventBus().publish("board_loaded", {
      boardId: board.id,
      boardName: board.name,
      timestamp: new Date(),
    });

    return board;
  }

  async getBoardsByIds(boardIds: Set<BoardId>): Promise<Map<BoardId, Board>> {
    const boards = new Map<BoardId, Board>();

    const results = await Promise.all(
      Array.from(boardIds).map(async (boardId) => {
        try {
          const board = await this.repository.loadBoardById(boardId);
          return { boardId, board };
        } catch (error) {
          logger.warn(`[BoardService] Failed to load board ${boardId}:`, error);
          return { boardId, board: null };
        }
      })
    );

    results.forEach(({ boardId, board }) => {
      if (board) {
        boards.set(boardId, board);
      }
    });

    return boards;
  }

  /**
   * Create a new board in a project
   * @throws {ValidationError} if name is invalid or board already exists
   */
  async createBoardInProject(
    projectId: ProjectId,
    name: string,
    description: string = "",
  ): Promise<Board> {
    logger.info(
      `[BoardService] Creating new board: ${name} in project: ${projectId}`,
    );
    this.validator.validateBoardName(name);

    const projectService = this.getProjectService();
    const project = await projectService.getProjectById(projectId);

    const existingBoards = await this.getBoardsByProject(projectId);
    const boardExists = existingBoards.some(
      (b) => b.name.toLowerCase() === name.toLowerCase(),
    );

    if (boardExists) {
      logger.warn(`[BoardService] Board already exists: ${name}`);
      throw new ValidationError(
        `Board with name '${name}' already exists in project`,
      );
    }

    const board = new Board({ name, project_id: projectId, description });
    await this.repository.saveBoard(board, project.slug);

    board.columns = await Promise.all([
      this.columnRepository.createColumn(board.id, { name: "To Do", position: 0 }),
      this.columnRepository.createColumn(board.id, { name: "In Progress", position: 1 }),
      this.columnRepository.createColumn(board.id, { name: "Done", position: 2 }),
    ]);

    logger.info(`[BoardService] Successfully created board: ${name}`);

    await getEventBus().publish("board_created", {
      boardId: board.id,
      boardName: board.name,
      timestamp: new Date(),
    });

    return board;
  }

  /**
   * Save a board to storage
   * @throws {ValidationError} if board structure is invalid
   */
  async saveBoard(board: Board): Promise<void> {
    logger.debug(`[BoardService] Saving board: ${board.name}`);
    this.validator.validateBoard(board);

    const projectService = this.getProjectService();
    const project = await projectService.getProjectById(board.project_id);

    await this.repository.saveBoard(board, project.slug);
    logger.info(`[BoardService] Successfully saved board: ${board.name}`);

    await getEventBus().publish("board_updated", {
      boardId: board.id,
      boardName: board.name,
      timestamp: new Date(),
    });
  }

  /**
   * Check if a board can be deleted (not the last board in project)
   */
  async canDeleteBoard(boardId: BoardId): Promise<boolean> {
    const board = await this.getBoardById(boardId);
    const projectBoards = await this.getBoardsByProject(board.project_id);
    return projectBoards.length > 1;
  }

  /**
   * Delete a board from storage
   * @throws {ValidationError} if trying to delete the last board in a project
   * @returns true if board was deleted, false if not found
   */
  async deleteBoard(boardId: BoardId): Promise<boolean> {
    const board = await this.getBoardById(boardId);
    const projectBoards = await this.getBoardsByProject(board.project_id);

    if (projectBoards.length <= 1) {
      throw new ValidationError("Cannot delete the last board in a project");
    }

    const deleted = await this.repository.deleteBoard(boardId);

    if (deleted) {
      await getEventBus().publish("board_deleted", {
        boardId,
        boardName: board.name,
        timestamp: new Date(),
      });
    }

    return deleted;
  }

  /**
   * Add a new column to a board
   * @throws {ValidationError} if column name is invalid or already exists
   */
  async addColumnToBoard(
    board: Board,
    columnName: string,
    position?: number | null,
  ): Promise<Column> {
    logger.info(
      `[BoardService] Adding column '${columnName}' to board '${board.name}'`,
    );
    this.validator.validateColumnName(columnName);

    // Check for duplicate column names (case-insensitive)
    for (const existingColumn of board.columns) {
      if (existingColumn.name.toLowerCase() === columnName.toLowerCase()) {
        logger.warn(`[BoardService] Column already exists: ${columnName}`);
        throw new ValidationError(
          `Column '${columnName}' already exists in board`,
        );
      }
    }

    const column = await this.columnRepository.createColumn(board.id, {
      name: columnName,
      position: position ?? board.columns.length,
      limit: null,
    });
    board.columns.push(column);
    board.columns.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position - b.position;
      }
      return a.name.localeCompare(b.name);
    });
    logger.info(
      `[BoardService] Successfully added column '${columnName}' to board '${board.name}'`,
    );

    // Emit column created event
    await getEventBus().publish("column_created", {
      columnId: column.id,
      columnName: column.name,
      boardId: board.id,
      timestamp: new Date(),
    });

    return column;
  }

  /**
   * Remove a column from a board
   * @throws {ValidationError} if column contains items
   * @returns true if column was removed, false if not found
   */
  async removeColumnFromBoard(
    board: Board,
    columnId: ColumnId,
  ): Promise<boolean> {
    const column = board.getColumnById(columnId);
    if (!column) {
      return false;
    }

    if (column.tasks.length > 0) {
      throw new ValidationError("Cannot delete column that contains items");
    }

    const deleted = await this.columnRepository.deleteColumn(board.id, columnId);
    if (deleted) {
      board.removeColumn(columnId);
    }
    return deleted;
  }

  async updateColumn(
    board: Board,
    columnId: ColumnId,
    updates: { name?: string; position?: number; limit?: number | null },
  ): Promise<Column> {
    if (updates.name) {
      this.validator.validateColumnName(updates.name);
    }
    if (updates.limit !== undefined) {
      this.validator.validateColumnLimit(updates.limit);
    }
    const updated = await this.columnRepository.updateColumn(board.id, columnId, updates);
    const existing = board.getColumnById(columnId);
    if (existing) {
      existing.name = updated.name;
      existing.position = updated.position;
      existing.limit = updated.limit;
      board.columns.sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }
        return a.name.localeCompare(b.name);
      });
    }
    return updated;
  }

  /**
   * Update a task in a board
   */
  async updateTask(boardId: BoardId, updatedTask: Task): Promise<void> {
    const board = await this.getBoardById(boardId);

    // Find the task in the board and replace/update it
    for (const column of board.columns) {
      const taskIndex = column.tasks.findIndex(t => t.id === updatedTask.id);
      if (taskIndex !== -1) {
        const task = await this.taskRepository.updateTask(
          board.id,
          column.id,
          updatedTask.id,
          {
            title: updatedTask.title,
            description: updatedTask.description,
            columnId: updatedTask.column_id,
            taskType: updatedTask.task_type,
            priority: updatedTask.priority,
          },
        );
        column.tasks[taskIndex] = task;
        return;
      }
    }

    throw new Error(`Task ${updatedTask.id} not found in board ${boardId}`);
  }
}
