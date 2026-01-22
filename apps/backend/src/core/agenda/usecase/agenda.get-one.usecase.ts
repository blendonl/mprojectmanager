import { Inject, Injectable } from '@nestjs/common';
import { Agenda } from '@prisma/client';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';

@Injectable()
export class AgendaGetOneUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  async execute(id: string): Promise<Agenda | null> {
    return this.agendaRepository.findById(id);
  }
}
