import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgendaViewResponseDto } from 'shared-types';
import { AgendaViewQueryRequest } from './dto/agenda-view.query.request';
import { AgendaViewMapper } from './agenda-view.mapper';
import { AgendaViewGetDayUseCase } from '../../core/agenda-view/usecase/agenda-view.get-day.usecase';
import { AgendaViewGetWeekUseCase } from '../../core/agenda-view/usecase/agenda-view.get-week.usecase';
import { AgendaViewGetMonthUseCase } from '../../core/agenda-view/usecase/agenda-view.get-month.usecase';

@ApiTags('agenda-views')
@Controller('agenda-views')
export class AgendaViewController {
  constructor(
    private readonly getDayUseCase: AgendaViewGetDayUseCase,
    private readonly getWeekUseCase: AgendaViewGetWeekUseCase,
    private readonly getMonthUseCase: AgendaViewGetMonthUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get agenda view by mode' })
  async getView(
    @Query() query: AgendaViewQueryRequest
  ): Promise<AgendaViewResponseDto> {
    this.ensureValidTimeZone(query.timezone);

    if (query.mode === 'day') {
      const view = await this.getDayUseCase.execute(query.anchorDate, query.timezone);
      return AgendaViewMapper.toResponse(view);
    }

    if (query.mode === 'week') {
      const view = await this.getWeekUseCase.execute(query.anchorDate, query.timezone);
      return AgendaViewMapper.toResponse(view);
    }

    const view = await this.getMonthUseCase.execute(query.anchorDate, query.timezone);
    return AgendaViewMapper.toResponse(view);
  }

  private ensureValidTimeZone(timeZone: string): void {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    } catch (error) {
      throw new BadRequestException('Invalid timezone');
    }
  }
}
