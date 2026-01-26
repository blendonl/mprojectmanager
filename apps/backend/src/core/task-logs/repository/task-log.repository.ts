import { TaskLog } from '@prisma/client';
import { TaskLogCreateData } from '../data/task-log.create.data';

export const TASK_LOG_REPOSITORY = 'TASK_LOG_REPOSITORY';

export interface TaskLogRepository {
  create(data: TaskLogCreateData): Promise<TaskLog>;
  findByTaskId(taskId: string): Promise<TaskLog[]>;
  findById(id: string): Promise<TaskLog | null>;
}
