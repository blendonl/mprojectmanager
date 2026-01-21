import { BoardResponse } from './board.response';

export interface BoardListResponse {
  items: BoardResponse[];
  total: number;
  page: number;
  limit: number;
}
