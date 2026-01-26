import { TaskAction } from '@prisma/client';

export class TaskLogCreateData {
  taskId: string;
  action: TaskAction;
  value?: string;
  metadata?: Record<string, any>;
}
