import { Injectable } from '@nestjs/common';
import { BoardCreateData } from '../data/board.create.data';
import { BoardListData } from '../data/board.list.data';
import { BoardUpdateData } from '../data/board.update.data';
import { BoardCreateUseCase } from '../usecases/board.create.usecase';
import { BoardDeleteUseCase } from '../usecases/board.delete.usecase';
import { BoardGetAllUseCase } from '../usecases/board.get-all.usecase';
import { BoardGetOneUseCase } from '../usecases/board.get-one.usecase';
import { BoardUpdateUseCase } from '../usecases/board.update.usecase';

@Injectable()
export class BoardsCoreService {
  constructor(
    private readonly boardCreateUseCase: BoardCreateUseCase,
    private readonly boardGetAllUseCase: BoardGetAllUseCase,
    private readonly boardGetOneUseCase: BoardGetOneUseCase,
    private readonly boardUpdateUseCase: BoardUpdateUseCase,
    private readonly boardDeleteUseCase: BoardDeleteUseCase,
  ) {}

  async createBoard(data: BoardCreateData) {
    return this.boardCreateUseCase.execute(data);
  }

  async getBoards(query: BoardListData) {
    return this.boardGetAllUseCase.execute(query);
  }

  async getBoardById(id: string) {
    return this.boardGetOneUseCase.execute(id);
  }

  async updateBoard(id: string, data: BoardUpdateData) {
    return this.boardUpdateUseCase.execute(id, data);
  }

  async deleteBoard(id: string) {
    return this.boardDeleteUseCase.execute(id);
  }
}
