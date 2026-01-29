import { injectable, inject } from "tsyringe";
import { Column } from "../domain/entities/Column";
import { ColumnRepository } from "../domain/repositories/ColumnRepository";
import { BoardId, ColumnId } from "@core/types";
import { COLUMN_REPOSITORY } from "@core/di/tokens";
import { getEventBus } from "@core/EventBus";
import { ValidationError } from "@core/exceptions";

@injectable()
export class ColumnService {
  constructor(
    @inject(COLUMN_REPOSITORY) private repository: ColumnRepository,
  ) {}

  async createColumn(
    boardId: BoardId,
    name: string,
    position?: number | null,
  ): Promise<Column> {
    return await this.repository.createColumn(boardId, {
      name,
      position: position ?? 0,
      limit: null,
    });
  }

  async deleteColumn(boardId: BoardId, columnId: ColumnId): Promise<boolean> {
    return await this.repository.deleteColumn(boardId, columnId);
  }

  async updateColumn(
    boardId: BoardId,
    columnId: ColumnId,
    updates: { name?: string; position?: number; limit?: number | null },
  ): Promise<Column> {
    return await this.repository.updateColumn(boardId, columnId, updates);
  }

  async reorderColumn(
    boardId: BoardId,
    columnId: ColumnId,
    direction: "left" | "right"
  ): Promise<void> {
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

  async validateColumnUpdate(
    boardId: BoardId,
    columnId: ColumnId,
    updates: { name?: string }
  ): Promise<{ valid: boolean; reason?: string }> {
    if (updates.name && updates.name.trim().length === 0) {
      return { valid: false, reason: "Column name cannot be empty" };
    }

    if (updates.name && updates.name.length > 50) {
      return { valid: false, reason: "Column name must be 50 characters or less" };
    }

    return { valid: true };
  }

  async getColumnWithTasks(
    boardId: BoardId,
    columnId: ColumnId
  ): Promise<Column | null> {
    return null;
  }
}
