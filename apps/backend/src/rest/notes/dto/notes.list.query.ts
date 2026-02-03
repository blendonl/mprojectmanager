import { NoteType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class NotesListQuery {
  @ApiPropertyOptional({ description: 'Filter notes by project ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Filter notes by type', enum: NoteType })
  @IsOptional()
  @IsEnum(NoteType)
  type?: NoteType;
}
