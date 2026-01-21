import { Inject, Injectable } from '@nestjs/common';
import { BoardListData, BoardListResult } from '../data/board.list.data';
import {
  BOARD_REPOSITORY,
  type BoardRepository,
} from '../repositories/board.repository';

@Injectable()
export class BoardGetAllUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(input: BoardListData): Promise<BoardListResult> {
    const page = this.normalizePage(input.page);
    const limit = this.normalizeLimit(input.limit);

    const { items, total } = await this.boardRepository.findAll({
      page,
      limit,
      projectId: input.projectId,
      search: input.search,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  private normalizePage(page?: number): number {
    const value = Number.isFinite(page) ? Math.floor(page ?? 1) : 1;
    return Math.max(1, value);
  }

  private normalizeLimit(limit?: number): number {
    const value = Number.isFinite(limit) ? Math.floor(limit ?? 20) : 20;
    return Math.min(Math.max(1, value), 100);
  }
}
