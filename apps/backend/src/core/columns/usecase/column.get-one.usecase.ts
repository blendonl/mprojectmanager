import { Inject, Injectable } from '@nestjs/common';
import { Column } from '../domain/column';
import {
  COLUMN_REPOSITORY,
  type ColumnRepository,
} from '../repository/column.repository';

@Injectable()
export class ColumnGetOneUseCase {
  constructor(
    @Inject(COLUMN_REPOSITORY)
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(columnId: string): Promise<Column | null> {
    const column = await this.columnRepository.findById(columnId);
    if (!column) {
      return null;
    }

    return column;
  }
}
