import { IsDateString, IsOptional, IsString } from 'class-validator';

export class AgendaItemCompleteRequest {
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
