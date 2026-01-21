import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ColumnCreateRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsInt()
  limit?: number | null;

  @IsString()
  @IsNotEmpty()
  color: string;
}
