import { IsDateString, IsOptional } from 'class-validator';

export class AgendaUpdateRequest {
  @IsDateString()
  @IsOptional()
  date?: string;
}
