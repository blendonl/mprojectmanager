import { Board } from 'src/core/boards/domain/board';
import { BoardResponse } from './dto/board.response';

export class BoardMapper {
  static mapToResponse(board: Board): BoardResponse {
    return {
      id: board.id,
      name: board.name,
      description: board.description,
      projectId: board.projectId,
      columns: board.columns ?? [],
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  }
}
