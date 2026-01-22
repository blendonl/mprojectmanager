import { Column } from "../entities/Column";
import { BoardId, ColumnId } from "@core/types";

export interface ColumnRepository {
  listColumns(boardId: BoardId): Promise<Column[]>;
  createColumn(
    boardId: BoardId,
    data: { name: string; position?: number; limit?: number | null; color?: string }
  ): Promise<Column>;
  updateColumn(
    boardId: BoardId,
    columnId: ColumnId,
    updates: { name?: string; position?: number; limit?: number | null; color?: string }
  ): Promise<Column>;
  deleteColumn(boardId: BoardId, columnId: ColumnId): Promise<boolean>;
}
