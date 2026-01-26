import { RoutineStatus, RoutineType } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RoutineUpdateRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RoutineStatus)
  status?: RoutineStatus;

  @IsOptional()
  @IsEnum(RoutineType)
  type?: RoutineType;

  @IsOptional()
  @IsString()
  target?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  separateInto?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  repeatIntervalMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activeDays?: string[] | null;
}
