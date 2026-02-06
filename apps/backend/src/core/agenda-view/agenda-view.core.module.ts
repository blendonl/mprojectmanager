import { Module } from '@nestjs/common';
import { AgendaItemCoreModule } from '../agenda-item/agenda-item.core.module';
import { AgendaViewCoreService } from './service/agenda-view.core.service';
import { AgendaViewGetDayUseCase } from './usecase/agenda-view.get-day.usecase';
import { AgendaViewGetWeekUseCase } from './usecase/agenda-view.get-week.usecase';
import { AgendaViewGetMonthUseCase } from './usecase/agenda-view.get-month.usecase';

@Module({
  imports: [AgendaItemCoreModule],
  providers: [
    AgendaViewCoreService,
    AgendaViewGetDayUseCase,
    AgendaViewGetWeekUseCase,
    AgendaViewGetMonthUseCase,
  ],
  exports: [AgendaViewCoreService, AgendaViewGetDayUseCase, AgendaViewGetWeekUseCase, AgendaViewGetMonthUseCase],
})
export class AgendaViewCoreModule {}
