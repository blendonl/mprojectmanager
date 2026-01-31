import { Board } from '@prisma/client';
import { BoardDetailDto, BoardDto } from 'shared-types';
import { BoardFindOneReturnType } from 'src/core/boards/data/board.find-one.return.type';

export class BoardMapper {
  static mapToResponse(board: Board): BoardDto {
    return {
      id: board.id,
      name: board.name,
      slug: board.name.toLowerCase().replace(/\s+/g, '-'),
      description: board.description,
      color: '#3B82F6',
      projectId: board.projectId,
      filePath: null,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  }

  static mapToDetailResponse(board: BoardFindOneReturnType): BoardDetailDto {
    return {
      ...this.mapToResponse(board),
      columns: (board.columns || []).map((column) => ({
        id: column.id,
        name: column.name,
        position: column.position,
        color: column.color,
        wipLimit: column.limit,
        tasks: [],
        taskCount: 0,
      })),
      projectName: '',
    };
  }
}
