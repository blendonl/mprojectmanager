import { BoardCreateData } from '../data/board.create.data';
import { BoardFindOneReturnType } from '../data/board.find-one.return.type';
import {
  BoardListOptions,
  BoardListRepositoryResult,
} from '../data/board.list.data';
import { BoardUpdateData } from '../data/board.update.data';
import { Board } from '../domain/board';

export const BOARD_REPOSITORY = Symbol('BOARD_REPOSITORY');

export interface BoardRepository {
  create(data: BoardCreateData): Promise<Board>;
  findAll(options: BoardListOptions): Promise<BoardListRepositoryResult>;
  findById(id: string): Promise<BoardFindOneReturnType | null>;
  update(id: string, data: BoardUpdateData): Promise<Board | null>;
  delete(id: string): Promise<boolean>;
}
