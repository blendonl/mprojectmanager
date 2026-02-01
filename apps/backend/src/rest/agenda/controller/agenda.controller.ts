import {
  BadRequestException,
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
import { AgendaDto, AgendaFindAllResponse } from 'shared-types';
import { AgendaCoreService } from 'src/core/agenda/service/agenda.core.service';
import { AgendaCreateRequest } from '../dto/agenda.create.request';
import { AgendaFindAllQueryRequest } from '../dto/agenda.find-all.query';
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
  @ApiOperation({ summary: 'List agendas by date range (paginated)' })
  async list(
    @Query() query: AgendaFindAllQueryRequest,
  ): Promise<AgendaFindAllResponse> {
    if (!query.startDate || !query.endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const range = toDateRange(query.startDate, query.endDate);
    const result = await this.agendaService.getAgendaSummaryForDateRange(
      range.start,
      range.end,
      query.page ?? 1,
      query.limit ?? 50,
    );

    return {
      items: result.items.map((item) => ({
        date: item.date.toISOString().split('T')[0],
        agendaItemsTotal: item.agendaItemsTotal,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
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

const toDateRange = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);
  return { start, end };
};
