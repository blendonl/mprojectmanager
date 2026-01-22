import { Module } from '@nestjs/common';
import { AgendaCoreModule } from 'src/core/agenda/agenda.core.module';
import { AgendaController } from './controller/agenda.controller';

@Module({
  imports: [AgendaCoreModule],
  controllers: [AgendaController],
})
export class AgendaRestModule {}
