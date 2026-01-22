import { Inject, Injectable } from '@nestjs/common';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';

@Injectable()
export class AgendaDeleteUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    return this.agendaRepository.delete(id);
  }
}
