import { ColumnDto } from 'shared-types';

export class ColumnMapper {
  static toResponse(column: any): ColumnDto {
    return {
      id: column.id,
      name: column.name,
      position: column.position,
      boardId: column.boardId || '',
      wipLimit: column.limit ?? null,
      createdAt: column.createdAt.toISOString(),
      updatedAt: column.updatedAt.toISOString(),
    };
  }
}
