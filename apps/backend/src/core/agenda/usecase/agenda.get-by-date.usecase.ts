import { Inject, Injectable } from '@nestjs/common';
import { Agenda } from '@prisma/client';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';

@Injectable()
export class AgendaGetByDateUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  async execute(date: Date): Promise<Agenda | null> {
    return this.agendaRepository.findByDate(date);
  }
}
