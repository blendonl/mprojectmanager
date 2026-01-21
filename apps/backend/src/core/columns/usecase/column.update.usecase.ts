import { Inject, Injectable } from '@nestjs/common';
import { ColumnUpdateData } from '../data/column.update.data';
import { Column } from '@prisma/client';
import {
  COLUMN_REPOSITORY,
  type ColumnRepository,
} from '../repository/column.repository';

@Injectable()
export class ColumnUpdateUseCase {
  constructor(
    @Inject(COLUMN_REPOSITORY)
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(
    columnId: string,
    data: ColumnUpdateData,
  ): Promise<Column | null> {
    const column = await this.columnRepository.findById(columnId);

    if (!column) {
      return null;
    }

    await this.columnRepository.update(columnId, data);

    return column;
  }
}
