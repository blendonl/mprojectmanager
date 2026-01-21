import { Inject, Injectable } from '@nestjs/common';
import { Column } from '../domain/column';
import {
  COLUMN_REPOSITORY,
  type ColumnRepository,
} from '../repository/column.repository';

@Injectable()
export class ColumnGetAllUseCase {
  constructor(
    @Inject(COLUMN_REPOSITORY)
    private readonly ColumnRepository: ColumnRepository,
  ) {}

  async execute(boardId: string): Promise<Column[]> {
    return await this.ColumnRepository.findByBoardId(boardId);
  }
}
