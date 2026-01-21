import { Inject, Injectable } from '@nestjs/common';
import {
  BOARD_REPOSITORY,
  type BoardRepository,
} from '../repositories/board.repository';

@Injectable()
export class BoardDeleteUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    return this.boardRepository.delete(id);
  }
}
