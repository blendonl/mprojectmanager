import { Body, Controller, Post } from '@nestjs/common';
import { RoutinesCoreService } from 'src/core/routines/service/routines.core.service';
import { RoutineTaskLogCreateRequest } from '../dto/routine-task-log.create.request';

@Controller('routine-task-logs')
export class RoutineTaskLogController {
  constructor(private readonly routinesService: RoutinesCoreService) {}

  @Post()
  async create(@Body() body: RoutineTaskLogCreateRequest) {
    return this.routinesService.createRoutineTaskLog({
      routineTaskId: body.routineTaskId,
      userId: body.userId,
      value: body.value ?? null,
    });
  }
}
