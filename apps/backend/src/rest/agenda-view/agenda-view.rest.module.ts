import { Module } from '@nestjs/common';
import { AgendaViewCoreModule } from 'src/core/agenda-view/agenda-view.core.module';
import { AgendaViewController } from './agenda-view.controller';

@Module({
  imports: [AgendaViewCoreModule],
  controllers: [AgendaViewController],
})
export class AgendaViewRestModule {}
