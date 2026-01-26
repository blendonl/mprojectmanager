import { Controller, Get, NotFoundException, Param, Patch, Query, Body } from '@nestjs/common';
import { AlarmCoreService } from 'src/core/alarms/service/alarm.core.service';
import { AlarmPlanMapper } from '../alarm-plan.mapper';
import { AlarmPlanResponse } from '../dto/alarm-plan.response';
import { AlarmPlanUpdateRequest } from '../dto/alarm-plan.update.request';

@Controller('alarm-plans')
export class AlarmPlanController {
  constructor(private readonly alarmService: AlarmCoreService) {}

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<AlarmPlanResponse> {
    const plan = await this.alarmService.getPlan(id);
    if (!plan) {
      throw new NotFoundException('Alarm plan not found');
    }
    return AlarmPlanMapper.toResponse(plan);
  }

  @Get()
  async listByRoutineTask(
    @Query('routineTaskId') routineTaskId?: string,
  ): Promise<AlarmPlanResponse[]> {
    if (!routineTaskId) {
      return [];
    }

    const plans = await this.alarmService.getPlansByRoutineTask(routineTaskId);
    return plans.map(AlarmPlanMapper.toResponse);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: AlarmPlanUpdateRequest,
  ): Promise<AlarmPlanResponse> {
    const updated = await this.alarmService.updatePlan(id, {
      status: body.status,
    });
    return AlarmPlanMapper.toResponse(updated);
  }
}
