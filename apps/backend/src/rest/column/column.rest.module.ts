import { Module } from '@nestjs/common';
import { ColumnsCoreModule } from 'src/core/columns/columns.core.module';
import { ColumnsController } from './controller/columns.controller';

@Module({
  imports: [ColumnsCoreModule],
  controllers: [ColumnsController],
})
export class ColumnRestModule {}
