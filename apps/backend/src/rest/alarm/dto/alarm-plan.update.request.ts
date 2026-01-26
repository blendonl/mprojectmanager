import { AlarmPlanStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class AlarmPlanUpdateRequest {
  @IsOptional()
  @IsEnum(AlarmPlanStatus)
  status?: AlarmPlanStatus;
}
