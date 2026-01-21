import { Board } from '../domain/board';

export interface BoardListData {
  page?: number;
  limit?: number;
  projectId?: string;
  search?: string;
}

export interface BoardListOptions {
  page: number;
  limit: number;
  projectId?: string;
  search?: string;
}

export interface BoardListRepositoryResult {
  items: Board[];
  total: number;
}

export interface BoardListResult {
  items: Board[];
  total: number;
  page: number;
  limit: number;
}
