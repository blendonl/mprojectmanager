export class TimeLogCreateData {
  projectId?: string;
  taskId?: string;
  date: Date;
  durationMinutes: number;
  source: string;
  metadata?: Record<string, any>;
}
