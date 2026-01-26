import { IsOptional, IsArray, IsEnum, IsString } from 'class-validator';
import { EntityType } from '../../../core/events/interfaces/entity-event.interface';

export class SubscribeMessageDto {
  @IsOptional()
  @IsArray()
  @IsEnum(
    [
      'project',
      'board',
      'column',
      'task',
      'agenda',
      'agenda-item',
      'routine',
      'routine-task',
      'routine-task-log',
      'alarm-plan',
    ],
    { each: true },
  )
  entityTypes?: EntityType[];

  @IsOptional()
  @IsString()
  timestamp?: string;
}
