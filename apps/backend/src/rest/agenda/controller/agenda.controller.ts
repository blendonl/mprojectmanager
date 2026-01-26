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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgendaDto, AgendaEnrichedDto } from 'shared-types';
import { AgendaCoreService } from 'src/core/agenda/service/agenda.core.service';
import { AgendaCreateRequest } from '../dto/agenda.create.request';
import { AgendaUpdateRequest } from '../dto/agenda.update.request';
import { AgendaMapper } from '../agenda.mapper';

@ApiTags('agendas')
@Controller('agendas')
export class AgendaController {
  constructor(private readonly agendaService: AgendaCoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create agenda' })
  async create(@Body() body: AgendaCreateRequest): Promise<AgendaDto> {
    const agenda = await this.agendaService.createAgenda({
      date: new Date(body.date),
    });
    return AgendaMapper.toAgendaResponse(agenda);
  }

  @Get()
  @ApiOperation({ summary: 'List all agendas' })
  async list(): Promise<AgendaDto[]> {
    const agendas = await this.agendaService.getAgendas();

    return agendas.map(AgendaMapper.toAgendaResponse);
  }

  @Get('by-date')
  @ApiOperation({ summary: 'Get agenda by date' })
  async getByDate(@Query('date') date: string): Promise<AgendaDto | null> {
    const agenda = await this.agendaService.getAgendaByDate(new Date(date));

    console.log(agenda);

    if (!agenda) {
      return null;
    }
    return AgendaMapper.toAgendaResponse(agenda);
  }

  @Get('by-date/enriched')
  @ApiOperation({ summary: 'Get enriched agenda by date' })
  async getEnrichedByDate(
    @Query('date') date: string,
  ): Promise<AgendaEnrichedDto | null> {
    const agenda = await this.agendaService.getEnrichedAgendaByDate(
      new Date(date),
    );
    if (!agenda) {
      return null;
    }
    return AgendaMapper.toAgendaEnrichedResponse(agenda);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get agendas for date range' })
  async getDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<AgendaEnrichedDto[]> {
    const agendas = await this.agendaService.getAgendasForDateRange(
      new Date(start),
      new Date(end),
    );

    console.dir(agendas, { depth: null });
    return agendas.map(AgendaMapper.toAgendaEnrichedResponse);
  }

  @Get(':agendaId')
  @ApiOperation({ summary: 'Get agenda by ID' })
  async getOne(@Param('agendaId') agendaId: string): Promise<AgendaDto> {
    const agenda = await this.agendaService.getAgenda(agendaId);
    if (!agenda) {
      throw new NotFoundException('Agenda not found');
    }
    return AgendaMapper.toAgendaResponse(agenda);
  }

  @Put(':agendaId')
  @ApiOperation({ summary: 'Update agenda' })
  async update(
    @Param('agendaId') agendaId: string,
    @Body() body: AgendaUpdateRequest,
  ): Promise<AgendaDto> {
    const agenda = await this.agendaService.updateAgenda(agendaId, {
      date: body.date ? new Date(body.date) : undefined,
    });
    return AgendaMapper.toAgendaResponse(agenda);
  }

  @Delete(':agendaId')
  async delete(
    @Param('agendaId') agendaId: string,
  ): Promise<{ deleted: boolean }> {
    await this.agendaService.deleteAgenda(agendaId);
    return { deleted: true };
  }
}
