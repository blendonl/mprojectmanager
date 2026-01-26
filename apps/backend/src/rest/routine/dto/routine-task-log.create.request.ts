import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RoutineTaskLogCreateRequest {
  @IsString()
  @IsNotEmpty()
  routineTaskId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsString()
  value?: string | null;
}
