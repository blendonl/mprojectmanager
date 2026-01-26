import { RoutineType } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RoutineCreateRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(RoutineType)
  type!: RoutineType;

  @IsString()
  @IsNotEmpty()
  target!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  separateInto?: number;

  @IsInt()
  @Min(1)
  repeatIntervalMinutes!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activeDays?: string[];
}
