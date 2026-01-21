import { Inject, Injectable } from '@nestjs/common';
import { BoardUpdateData } from '../data/board.update.data';
import { Board } from '../domain/board';
import {
  BOARD_REPOSITORY,
  type BoardRepository,
} from '../repositories/board.repository';

@Injectable()
export class BoardUpdateUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(id: string, data: BoardUpdateData): Promise<Board | null> {
    return this.boardRepository.update(id, data);
  }
}
