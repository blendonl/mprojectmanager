import { injectable, inject } from "tsyringe";
import { Board } from "../domain/entities/Board";
import { BoardRepository } from "../domain/repositories/BoardRepository";
import { BoardId, ProjectId, ColumnId } from "@core/types";
import { BoardNotFoundError, ValidationError } from "@core/exceptions";
import { getEventBus } from "@core/EventBus";
import { ColumnService } from "@features/columns/services/ColumnService";
import { Column } from "@features/columns/domain/entities/Column";

import { BOARD_REPOSITORY, COLUMN_SERVICE } from "@core/di/tokens";

@injectable()
export class BoardService {
  constructor(
    @inject(BOARD_REPOSITORY) private repository: BoardRepository,
    @inject(COLUMN_SERVICE) private columnService: ColumnService
  ) {}

  private validateBoardName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Board name cannot be empty");
    }
  }

  async getBoardsByProject(projectId: ProjectId): Promise<Board[]> {
    return await this.repository.loadBoardsByProjectId(projectId);
  }

  async getAllBoards(): Promise<Board[]> {
    return await this.repository.loadAllBoards();
  }

  async getBoardById(boardId: BoardId): Promise<Board> {
    const board = await this.repository.loadBoardById(boardId);

    if (!board) {
      throw new BoardNotFoundError(`Board with id '${boardId}' not found`);
    }

    await getEventBus().publish("board_loaded", {
      boardId: board.id,
      boardName: board.name,
      timestamp: new Date(),
    });

    return board;
  }

  async createBoardInProject(
    projectId: ProjectId,
    name: string,
    description: string = "",
  ): Promise<Board> {
    this.validateBoardName(name);

    const board = await this.repository.saveBoard({
      name,
      description,
      projectId,
    });

    await getEventBus().publish("board_created", {
      boardId: board.id,
      boardName: board.name,
      timestamp: new Date(),
    });

    return board;
  }

  async canDeleteBoard(boardId: BoardId): Promise<boolean> {
    const board = await this.getBoardById(boardId);
    return board.columns?.every((col) => col.tasks.length === 0) ?? true;
  }

  async deleteBoard(boardId: BoardId): Promise<boolean> {
    const deleted = await this.repository.deleteBoard(boardId);

    if (deleted) {
      await getEventBus().publish("board_deleted", {
        boardId,
        boardName: boardId,
        timestamp: new Date(),
      });
    }

    return deleted;
  }

  async getBoardsByIds(boardIds: Set<BoardId>): Promise<Map<BoardId, Board>> {
    const boards = new Map<BoardId, Board>();

    const results = await Promise.all(
      Array.from(boardIds).map(async (boardId) => {
        try {
          const board = await this.repository.loadBoardById(boardId);
          return { boardId, board };
        } catch (error) {
          return { boardId, board: null };
        }
      }),
    );

    results.forEach(({ boardId, board }) => {
      if (board) {
        boards.set(boardId, board);
      }
    });

    return boards;
  }

  async addColumnToBoard(
    boardId: BoardId,
    name: string,
    position?: number
  ): Promise<Column> {
    const column = await this.columnService.createColumn(
      boardId,
      name,
      position ?? null
    );

    await getEventBus().publish("column_created", {
      boardId,
      columnId: column.id,
      columnName: column.name,
      timestamp: new Date(),
    });

    return column;
  }

  async updateColumn(
    boardId: BoardId,
    columnId: ColumnId,
    updates: { name?: string; position?: number; limit?: number | null }
  ): Promise<Column> {
    const column = await this.columnService.updateColumn(boardId, columnId, updates);

    await getEventBus().publish("column_updated", {
      boardId,
      columnId: column.id,
      columnName: column.name,
      timestamp: new Date(),
    });

    return column;
  }

  async removeColumnFromBoard(boardId: BoardId, columnId: ColumnId): Promise<boolean> {
    const deleted = await this.columnService.deleteColumn(boardId, columnId);

    if (deleted) {
      await getEventBus().publish("column_deleted", {
        boardId,
        columnId,
        timestamp: new Date(),
      });
    }

    return deleted;
  }

  async reorderColumns(
    boardId: BoardId,
    columnId: ColumnId,
    direction: "left" | "right"
  ): Promise<void> {
    const board = await this.getBoardById(boardId);
    const currentIndex = board.columns.findIndex((c) => c.id === columnId);

    if (currentIndex === -1) {
      throw new ValidationError(`Column with id '${columnId}' not found`);
    }

    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= board.columns.length) {
      throw new ValidationError("Cannot move column beyond board boundaries");
    }

    const column = board.columns[currentIndex];
    const targetColumn = board.columns[newIndex];

    await Promise.all([
      this.columnService.updateColumn(boardId, column.id, {
        position: targetColumn.position,
      }),
      this.columnService.updateColumn(boardId, targetColumn.id, {
        position: column.position,
      }),
    ]);

    await getEventBus().publish("column_reordered", {
      boardId,
      columnId,
      direction,
      timestamp: new Date(),
    });
  }

  async clearColumn(boardId: BoardId, columnId: ColumnId): Promise<void> {
    await getEventBus().publish("column_cleared", {
      boardId,
      columnId,
      timestamp: new Date(),
    });
  }

  async moveAllTasksFromColumn(
    boardId: BoardId,
    sourceColumnId: ColumnId,
    targetColumnId: ColumnId
  ): Promise<void> {
    await getEventBus().publish("tasks_moved_bulk", {
      boardId,
      sourceColumnId,
      targetColumnId,
      timestamp: new Date(),
    });
  }
}
