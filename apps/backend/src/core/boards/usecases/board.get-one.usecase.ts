import { Inject, Injectable } from '@nestjs/common';
import { Board } from '../domain/board';
import {
  BOARD_REPOSITORY,
  type BoardRepository,
} from '../repositories/board.repository';

@Injectable()
export class BoardGetOneUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(id: string): Promise<Board | null> {
    return this.boardRepository.findById(id);
  }
}
