import { Column } from '@prisma/client';
import { ColumnCreateData } from '../data/column.create.data';
import { ColumnUpdateData } from '../data/column.update.data';

export const COLUMN_REPOSITORY = 'COLUMN_REPOSITORY';

export interface ColumnRepository {
  findNextPositionByBoardId(boardId: string): Promise<number>;
  create(boardId: string, data: ColumnCreateData): Promise<Column>;
  findById(id: string): Promise<Column | null>;
  findByIdWithProject(id: string): Promise<{ id: string; board: { id: string; projectId: string } } | null>;

  findByName(boardId: string, name: string): Promise<Column | null>;
  findByBoardId(boardId: string): Promise<Column[]>;
  update(id: string, data: ColumnUpdateData): Promise<Column>;
  delete(id: string): Promise<void>;
}
