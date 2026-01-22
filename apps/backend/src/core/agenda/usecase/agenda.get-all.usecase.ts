import { Inject, Injectable } from '@nestjs/common';
import { Agenda } from '@prisma/client';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';

@Injectable()
export class AgendaGetAllUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  async execute(): Promise<Agenda[]> {
    return this.agendaRepository.findAll();
  }
}
