import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimeLogDto } from 'shared-types';
import { TimeLogsCoreService } from 'src/core/time-logs/service/time-logs.core.service';
import { TimeLogCreateRequest } from '../dto/time-log.create.request';
import { TimeLogMapper } from '../time-log.mapper';

@ApiTags('time-logs')
@Controller('time-logs')
export class TimeLogController {
  constructor(private readonly timeLogsService: TimeLogsCoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create time log entry' })
  async create(@Body() body: TimeLogCreateRequest): Promise<TimeLogDto> {
    const timeLog = await this.timeLogsService.logTime({
      projectId: body.project_id,
      taskId: body.task_id,
      date: new Date(body.date),
      durationMinutes: body.duration_minutes,
      source: body.source,
      metadata: body.metadata,
    });
    return TimeLogMapper.toResponse(timeLog);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get overall time summary' })
  async getOverallSummary(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const summary = await this.timeLogsService.getOverallSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return summary;
  }

  @Get('summary/:projectId')
  @ApiOperation({ summary: 'Get project time summary' })
  async getProjectSummary(
    @Param('projectId') projectId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const summary = await this.timeLogsService.getProjectSummary(
      projectId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return summary;
  }

  @Get('daily/:date')
  @ApiOperation({ summary: 'Get daily time summary' })
  async getDailySummary(@Param('date') date: string) {
    const summary = await this.timeLogsService.getDailySummary(new Date(date));
    return summary;
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get task work time' })
  async getTaskWorkTime(@Param('taskId') taskId: string): Promise<TimeLogDto[]> {
    const logs = await this.timeLogsService.getTaskWorkTime(taskId);
    return logs.map(TimeLogMapper.toResponse);
  }
}
