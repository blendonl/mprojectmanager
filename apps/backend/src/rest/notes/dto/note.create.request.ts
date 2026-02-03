import { NoteType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NoteCreateRequest {
  @ApiProperty({ description: 'Note title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Note content', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Note type', enum: NoteType, required: false })
  @IsOptional()
  @IsEnum(NoteType)
  type?: NoteType;

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ description: 'Projects to attach', required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  projects?: Array<{ id: string }>;

  @ApiProperty({ description: 'Boards to attach', required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  boards?: Array<{ id: string }>;

  @ApiProperty({ description: 'Tasks to attach', required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  tasks?: Array<{ id: string }>;
}
