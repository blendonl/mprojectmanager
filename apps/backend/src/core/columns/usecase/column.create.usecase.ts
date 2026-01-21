import { Inject, Injectable } from '@nestjs/common';
import { ColumnCreateData } from '../data/column.create.data';
import { Column } from '../domain/column';
import {
  COLUMN_REPOSITORY,
  type ColumnRepository,
} from '../repository/column.repository';

@Injectable()
export class ColumnCreateUseCase {
  constructor(
    @Inject(COLUMN_REPOSITORY)
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(
    boardId: string,
    data: ColumnCreateData,
  ): Promise<Column | null> {
    const column = await this.columnRepository.findByName(boardId, data.name);

    if (column) {
      throw new Error('Column with this name already exists in the board.');
    }

    if (!data.position) {
      data.position =
        await this.columnRepository.findNextPositionByBoardId(boardId);
    }

    return this.columnRepository.create(boardId, data);
  }
}
