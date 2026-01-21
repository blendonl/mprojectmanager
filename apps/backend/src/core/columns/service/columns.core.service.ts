import { Injectable } from '@nestjs/common';
import { ColumnCreateData } from '../data/column.create.data';
import { ColumnUpdateData } from '../data/column.update.data';
import { ColumnCreateUseCase } from '../usecase/column.create.usecase';
import { ColumnDeleteUseCase } from '../usecase/column.delete.usecase';
import { ColumnGetAllUseCase } from '../usecase/column.get-all.usecase';
import { ColumnGetOneUseCase } from '../usecase/column.get-one.usecase';
import { ColumnUpdateUseCase } from '../usecase/column.update.usecase';

@Injectable()
export class ColumnsCoreService {
  constructor(
    private readonly columnCreateUseCase: ColumnCreateUseCase,
    private readonly columnGetAllUseCase: ColumnGetAllUseCase,
    private readonly columnGetOneUseCase: ColumnGetOneUseCase,
    private readonly columnUpdateUseCase: ColumnUpdateUseCase,
    private readonly columnDeleteUseCase: ColumnDeleteUseCase,
  ) {}

  async createColumn(boardId: string, data: ColumnCreateData) {
    return this.columnCreateUseCase.execute(boardId, data);
  }

  async getColumns(boardId: string) {
    return this.columnGetAllUseCase.execute(boardId);
  }

  async getColumn(columnId: string) {
    return this.columnGetOneUseCase.execute(columnId);
  }

  async updateColumn(columnId: string, data: ColumnUpdateData) {
    return this.columnUpdateUseCase.execute(columnId, data);
  }

  async deleteColumn(columnId: string) {
    return this.columnDeleteUseCase.execute(columnId);
  }
}
