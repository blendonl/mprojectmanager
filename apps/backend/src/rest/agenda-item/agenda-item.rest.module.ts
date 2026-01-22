import { Module } from '@nestjs/common';
import { AgendaItemCoreModule } from 'src/core/agenda-item/agenda-item.core.module';
import {
  AgendaItemController,
  AgendaItemGlobalController,
} from './controller/agenda-item.controller';

@Module({
  imports: [AgendaItemCoreModule],
  controllers: [AgendaItemController, AgendaItemGlobalController],
})
export class AgendaItemRestModule {}
