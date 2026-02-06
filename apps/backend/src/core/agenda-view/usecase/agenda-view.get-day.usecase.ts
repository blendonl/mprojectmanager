import { Injectable } from '@nestjs/common';
import { AgendaViewCoreService } from '../service/agenda-view.core.service';

@Injectable()
export class AgendaViewGetDayUseCase {
  constructor(private readonly agendaViewService: AgendaViewCoreService) {}

  async execute(anchorDate: string, timeZone: string) {
    return this.agendaViewService.getDayView(anchorDate, timeZone);
  }
}
