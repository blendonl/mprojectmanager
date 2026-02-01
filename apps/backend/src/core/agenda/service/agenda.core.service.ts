import { Injectable } from '@nestjs/common';
import { AgendaCreateData } from '../data/agenda.create.data';
import { AgendaUpdateData } from '../data/agenda.update.data';
import { AgendaCreateUseCase } from '../usecase/agenda.create.usecase';
import { AgendaGetAllUseCase } from '../usecase/agenda.get-all.usecase';
import { AgendaGetOneUseCase } from '../usecase/agenda.get-one.usecase';
import { AgendaGetByDateUseCase } from '../usecase/agenda.get-by-date.usecase';
import { AgendaUpdateUseCase } from '../usecase/agenda.update.usecase';
import { AgendaDeleteUseCase } from '../usecase/agenda.delete.usecase';
import { AgendaGetDateRangeUseCase } from '../usecase/agenda.get-date-range.usecase';
import { AgendaGetRangeSummaryUseCase } from '../usecase/agenda.get-range-summary.usecase';

@Injectable()
export class AgendaCoreService {
  constructor(
    private readonly agendaCreateUseCase: AgendaCreateUseCase,
    private readonly agendaGetAllUseCase: AgendaGetAllUseCase,
    private readonly agendaGetOneUseCase: AgendaGetOneUseCase,
    private readonly agendaGetByDateUseCase: AgendaGetByDateUseCase,
    private readonly agendaUpdateUseCase: AgendaUpdateUseCase,
    private readonly agendaDeleteUseCase: AgendaDeleteUseCase,
    private readonly agendaGetDateRangeUseCase: AgendaGetDateRangeUseCase,
    private readonly agendaGetRangeSummaryUseCase: AgendaGetRangeSummaryUseCase,
  ) {}

  async createAgenda(data: AgendaCreateData) {
    return this.agendaCreateUseCase.execute(data);
  }

  async getAgendas() {
    return this.agendaGetAllUseCase.execute();
  }

  async getAgenda(id: string) {
    return this.agendaGetOneUseCase.execute(id);
  }

  async getAgendaByDate(date: Date) {
    return this.agendaGetByDateUseCase.execute(date);
  }

  async updateAgenda(id: string, data: AgendaUpdateData) {
    return this.agendaUpdateUseCase.execute(id, data);
  }

  async deleteAgenda(id: string) {
    return this.agendaDeleteUseCase.execute(id);
  }

  async getAgendasForDateRange(startDate: Date, endDate: Date) {
    return this.agendaGetDateRangeUseCase.execute(startDate, endDate);
  }

  async getAgendaSummaryForDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
  ) {
    return this.agendaGetRangeSummaryUseCase.execute(
      startDate,
      endDate,
      page,
      limit,
    );
  }
}
