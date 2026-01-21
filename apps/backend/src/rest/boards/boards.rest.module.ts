import { Module } from '@nestjs/common';
import { BoardsCoreModule } from 'src/core/boards/boards.core.module';
import { BoardsController } from './controller/boards.controller';

@Module({
  imports: [BoardsCoreModule],
  controllers: [BoardsController],
})
export class BoardsRestModule {}
