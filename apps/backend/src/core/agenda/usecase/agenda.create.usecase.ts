import { Inject, Injectable } from '@nestjs/common';
import { Agenda } from '@prisma/client';
import { AgendaCreateData } from '../data/agenda.create.data';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';

@Injectable()
export class AgendaCreateUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  async execute(data: AgendaCreateData): Promise<Agenda> {
    return this.agendaRepository.create(data);
  }
}
