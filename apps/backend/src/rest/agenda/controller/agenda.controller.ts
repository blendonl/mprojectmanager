import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AgendaCoreService } from 'src/core/agenda/service/agenda.core.service';
import { AgendaCreateRequest } from '../dto/agenda.create.request';
import { AgendaUpdateRequest } from '../dto/agenda.update.request';
import { AgendaResponse } from '../dto/agenda.response';
import { AgendaMapper } from '../agenda.mapper';
import { AgendaEnrichedResponse } from '../dto/agenda-enriched.response';

@Controller('agendas')
export class AgendaController {
  constructor(private readonly agendaService: AgendaCoreService) {}

  @Post()
  async create(@Body() body: AgendaCreateRequest): Promise<AgendaResponse> {
    const agenda = await this.agendaService.createAgenda({
      date: new Date(body.date),
    });
    return AgendaMapper.toAgendaResponse(agenda);
  }

  @Get()
  async list(): Promise<AgendaResponse[]> {
    const agendas = await this.agendaService.getAgendas();
    return agendas.map(AgendaMapper.toAgendaResponse);
  }

  @Get('by-date')
  async getByDate(@Query('date') date: string): Promise<AgendaResponse | null> {
    const agenda = await this.agendaService.getAgendaByDate(new Date(date));
    if (!agenda) {
      return null;
    }
    return AgendaMapper.toAgendaResponse(agenda);
  }

  @Get('by-date/enriched')
  async getEnrichedByDate(
    @Query('date') date: string,
  ): Promise<AgendaEnrichedResponse | null> {
    const agenda = await this.agendaService.getEnrichedAgendaByDate(new Date(date));
    if (!agenda) {
      return null;
    }
    return AgendaMapper.toAgendaEnrichedResponse(agenda);
  }

  @Get('date-range')
  async getDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<AgendaEnrichedResponse[]> {
    const agendas = await this.agendaService.getAgendasForDateRange(
      new Date(start),
      new Date(end),
    );
    return agendas.map(AgendaMapper.toAgendaEnrichedResponse);
  }

  @Get(':agendaId')
  async getOne(@Param('agendaId') agendaId: string): Promise<AgendaResponse> {
    const agenda = await this.agendaService.getAgenda(agendaId);
    if (!agenda) {
      throw new NotFoundException('Agenda not found');
    }
    return AgendaMapper.toAgendaResponse(agenda);
  }

  @Put(':agendaId')
  async update(
    @Param('agendaId') agendaId: string,
    @Body() body: AgendaUpdateRequest,
  ): Promise<AgendaResponse> {
    const agenda = await this.agendaService.updateAgenda(agendaId, {
      date: body.date ? new Date(body.date) : undefined,
    });
    return AgendaMapper.toAgendaResponse(agenda);
  }

  @Delete(':agendaId')
  async delete(@Param('agendaId') agendaId: string): Promise<{ deleted: boolean }> {
    await this.agendaService.deleteAgenda(agendaId);
    return { deleted: true };
  }
}
