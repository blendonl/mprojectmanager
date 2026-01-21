import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class ColumnUpdateRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsArray()
  tasks?: unknown[];

  @IsOptional()
  @IsString()
  file_path?: string | null;
}
