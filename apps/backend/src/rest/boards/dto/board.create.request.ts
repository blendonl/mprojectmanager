import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BoardCreateRequest {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsOptional()
  @IsArray()
  columns?: unknown[];

  @IsOptional()
  @IsArray()
  parents?: unknown[];
}
