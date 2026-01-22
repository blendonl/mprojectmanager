import { AgendaItemStatus, AgendaItemType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AgendaItemCreateRequest {
  @IsString()
  @IsNotEmpty()
  taskId!: string;

  @IsOptional()
  @IsEnum(AgendaItemType)
  type?: AgendaItemType;

  @IsOptional()
  @IsEnum(AgendaItemStatus)
  status?: AgendaItemStatus;

  @IsOptional()
  @IsDateString()
  startAt?: string | null;

  @IsOptional()
  @IsInt()
  duration?: number | null;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  notificationId?: string | null;
}
