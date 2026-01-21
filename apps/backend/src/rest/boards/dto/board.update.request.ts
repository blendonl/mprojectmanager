import { IsArray, IsOptional, IsString } from 'class-validator';

export class BoardUpdateRequest {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  columns?: unknown[];

  @IsOptional()
  @IsArray()
  parents?: unknown[];
}
