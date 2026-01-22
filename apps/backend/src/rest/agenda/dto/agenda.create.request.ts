import { IsDateString, IsNotEmpty } from 'class-validator';

export class AgendaCreateRequest {
  @IsDateString()
  @IsNotEmpty()
  date!: string;
}
