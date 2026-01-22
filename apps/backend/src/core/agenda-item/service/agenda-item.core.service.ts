import { Injectable } from '@nestjs/common';
import { AgendaItemCreateData } from '../data/agenda-item.create.data';
import { AgendaItemUpdateData } from '../data/agenda-item.update.data';
import { AgendaItemCreateUseCase } from '../usecase/agenda-item.create.usecase';
import { AgendaItemGetAllUseCase } from '../usecase/agenda-item.get-all.usecase';
import { AgendaItemGetOneUseCase } from '../usecase/agenda-item.get-one.usecase';
import { AgendaItemUpdateUseCase } from '../usecase/agenda-item.update.usecase';
import { AgendaItemDeleteUseCase } from '../usecase/agenda-item.delete.usecase';
import { AgendaItemGetOrphanedUseCase } from '../usecase/agenda-item.get-orphaned.usecase';
import { AgendaItemGetOverdueUseCase } from '../usecase/agenda-item.get-overdue.usecase';
import { AgendaItemGetUpcomingUseCase } from '../usecase/agenda-item.get-upcoming.usecase';
import { AgendaItemGetUnfinishedUseCase } from '../usecase/agenda-item.get-unfinished.usecase';
import { AgendaItemCompleteUseCase } from '../usecase/agenda-item.complete.usecase';
import { AgendaItemRescheduleUseCase } from '../usecase/agenda-item.reschedule.usecase';

@Injectable()
export class AgendaItemCoreService {
  constructor(
    private readonly agendaItemCreateUseCase: AgendaItemCreateUseCase,
    private readonly agendaItemGetAllUseCase: AgendaItemGetAllUseCase,
    private readonly agendaItemGetOneUseCase: AgendaItemGetOneUseCase,
    private readonly agendaItemUpdateUseCase: AgendaItemUpdateUseCase,
    private readonly agendaItemDeleteUseCase: AgendaItemDeleteUseCase,
    private readonly agendaItemGetOrphanedUseCase: AgendaItemGetOrphanedUseCase,
    private readonly agendaItemGetOverdueUseCase: AgendaItemGetOverdueUseCase,
    private readonly agendaItemGetUpcomingUseCase: AgendaItemGetUpcomingUseCase,
    private readonly agendaItemGetUnfinishedUseCase: AgendaItemGetUnfinishedUseCase,
    private readonly agendaItemCompleteUseCase: AgendaItemCompleteUseCase,
    private readonly agendaItemRescheduleUseCase: AgendaItemRescheduleUseCase,
  ) {}

  async createAgendaItem(agendaId: string, data: AgendaItemCreateData) {
    return this.agendaItemCreateUseCase.execute(agendaId, data);
  }

  async getAgendaItems(agendaId: string) {
    return this.agendaItemGetAllUseCase.execute(agendaId);
  }

  async getAgendaItem(id: string) {
    return this.agendaItemGetOneUseCase.execute(id);
  }

  async updateAgendaItem(id: string, data: AgendaItemUpdateData) {
    return this.agendaItemUpdateUseCase.execute(id, data);
  }

  async deleteAgendaItem(id: string) {
    return this.agendaItemDeleteUseCase.execute(id);
  }

  async getOrphanedAgendaItems() {
    return this.agendaItemGetOrphanedUseCase.execute();
  }

  async getOverdueAgendaItems() {
    return this.agendaItemGetOverdueUseCase.execute();
  }

  async getUpcomingAgendaItems(days: number = 7) {
    return this.agendaItemGetUpcomingUseCase.execute(days);
  }

  async getUnfinishedAgendaItems(beforeDate?: Date) {
    return this.agendaItemGetUnfinishedUseCase.execute(beforeDate);
  }

  async completeAgendaItem(id: string, completedAt?: Date, notes?: string) {
    return this.agendaItemCompleteUseCase.execute(id, completedAt, notes);
  }

  async rescheduleAgendaItem(
    id: string,
    newDate: Date,
    startAt?: Date | null,
    duration?: number | null,
  ) {
    return this.agendaItemRescheduleUseCase.execute(id, newDate, startAt, duration);
  }
}
