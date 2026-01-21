import { Inject, Injectable } from '@nestjs/common';
import { BoardCreateData } from '../data/board.create.data';
import { Board } from '../domain/board';
import {
  BOARD_REPOSITORY,
  type BoardRepository,
} from '../repositories/board.repository';

@Injectable()
export class BoardCreateUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(data: BoardCreateData): Promise<Board> {
    return this.boardRepository.create(data);
  }
}
