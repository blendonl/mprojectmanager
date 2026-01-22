import { Inject, Injectable } from '@nestjs/common';
import { Agenda } from '@prisma/client';
import { AgendaUpdateData } from '../data/agenda.update.data';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';

@Injectable()
export class AgendaUpdateUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  async execute(id: string, data: AgendaUpdateData): Promise<Agenda> {
    return this.agendaRepository.update(id, data);
  }
}
