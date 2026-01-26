export class TimeLogCreateRequest {
  project_id?: string;
  task_id?: string;
  date: string;
  duration_minutes: number;
  source: string;
  metadata?: Record<string, any>;
}
