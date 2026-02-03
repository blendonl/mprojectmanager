import { NoteType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class NoteUpdateRequest {
  @ApiPropertyOptional({ description: 'Note title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Note content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Note type', enum: NoteType })
  @IsOptional()
  @IsEnum(NoteType)
  type?: NoteType;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Projects to attach', type: [Object] })
  @IsOptional()
  @IsArray()
  projects?: Array<{ id: string }>;

  @ApiPropertyOptional({ description: 'Boards to attach', type: [Object] })
  @IsOptional()
  @IsArray()
  boards?: Array<{ id: string }>;

  @ApiPropertyOptional({ description: 'Tasks to attach', type: [Object] })
  @IsOptional()
  @IsArray()
  tasks?: Array<{ id: string }>;
}
