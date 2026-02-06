import { IsIn, IsString, Matches } from 'class-validator';

export class AgendaViewQueryRequest {
  @IsString()
  @IsIn(['day', 'week', 'month'])
  mode!: 'day' | 'week' | 'month';

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  anchorDate!: string;

  @IsString()
  timezone!: string;
}
