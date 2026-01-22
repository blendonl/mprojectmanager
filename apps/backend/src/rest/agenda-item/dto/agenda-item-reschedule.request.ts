import { IsDateString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class AgendaItemRescheduleRequest {
  @IsDateString()
  @IsNotEmpty()
  newDate!: string;

  @IsOptional()
  @IsDateString()
  startAt?: string | null;

  @IsOptional()
  @IsInt()
  duration?: number | null;
}
