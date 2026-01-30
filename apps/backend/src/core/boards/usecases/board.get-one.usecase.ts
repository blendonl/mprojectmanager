import { Inject, Injectable } from '@nestjs/common';
import {
  BOARD_REPOSITORY,
  type BoardRepository,
} from '../repositories/board.repository';
import { BoardFindOneReturnType } from '../data/board.find-one.return.type';

@Injectable()
export class BoardGetOneUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(id: string): Promise<BoardFindOneReturnType | null> {
    return this.boardRepository.findById(id);
  }
}
