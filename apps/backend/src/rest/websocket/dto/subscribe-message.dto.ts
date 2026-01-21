import { IsOptional, IsArray, IsEnum, IsString } from 'class-validator';
import { EntityType } from '../../../core/events/interfaces/entity-event.interface';

export class SubscribeMessageDto {
  @IsOptional()
  @IsArray()
  @IsEnum(['project', 'board', 'column', 'task'], { each: true })
  entityTypes?: EntityType[];

  @IsOptional()
  @IsString()
  timestamp?: string;
}
