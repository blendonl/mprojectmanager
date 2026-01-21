import { Inject, Injectable } from '@nestjs/common';
import {
  COLUMN_REPOSITORY,
  type ColumnRepository,
} from '../repository/column.repository';

@Injectable()
export class ColumnDeleteUseCase {
  constructor(
    @Inject(COLUMN_REPOSITORY)
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(columnId: string): Promise<boolean> {
    const column = await this.columnRepository.findById(columnId);

    if (!column) {
      throw new Error('Column not found.');
    }

    await this.columnRepository.delete(columnId);

    return true;
  }
}
