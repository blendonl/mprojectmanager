import { Board } from '@prisma/client';
import { BoardDto } from 'shared-types';

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
}
