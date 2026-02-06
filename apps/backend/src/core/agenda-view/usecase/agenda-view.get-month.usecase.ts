import { Injectable } from '@nestjs/common';
import { AgendaViewCoreService } from '../service/agenda-view.core.service';

@Injectable()
export class AgendaViewGetMonthUseCase {
  constructor(private readonly agendaViewService: AgendaViewCoreService) {}

  async execute(anchorDate: string, timeZone: string) {
    return this.agendaViewService.getMonthView(anchorDate, timeZone);
  }
}
