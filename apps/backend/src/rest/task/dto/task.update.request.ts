import { IsBoolean, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class TaskUpdateRequest {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  column_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parent_id?: string | null;

  @IsOptional()
  @IsString()
  project_id?: string | null;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  moved_in_progress_at?: string | null;

  @IsOptional()
  @IsString()
  moved_in_done_at?: string | null;

  @IsOptional()
  @IsString()
  worked_on_for?: string | null;

  @IsOptional()
  @IsString()
  file_path?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  scheduled_date?: string | null;

  @IsOptional()
  @IsString()
  scheduled_time?: string | null;

  @IsOptional()
  time_block_minutes?: number | null;

  @IsOptional()
  @IsString()
  task_type?: string;

  @IsOptional()
  @IsString()
  calendar_event_id?: string | null;

  @IsOptional()
  recurrence?: Record<string, unknown> | null;

  @IsOptional()
  meeting_data?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  goal_id?: string | null;

  @IsOptional()
  @IsBoolean()
  is_all_day?: boolean;

  @IsOptional()
  target_value?: number | null;

  @IsOptional()
  @IsString()
  value_unit?: string | null;

  @IsOptional()
  @IsInt()
  position?: number;
}
