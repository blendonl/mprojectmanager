import { Injectable } from '@nestjs/common';
import { TaskCreateData } from '../data/task.create.data';
import { TaskUpdateData } from '../data/task.update.data';
import { TaskCreateUseCase } from '../usecase/task.create.usecase';
import { TaskDeleteUseCase } from '../usecase/task.delete.usecase';
import { TaskGetAllUseCase } from '../usecase/task.get-all.usecase';
import { TaskGetOneUseCase } from '../usecase/task.get-one.usecase';
import { TaskUpdateUseCase } from '../usecase/task.update.usecase';
import { TaskMoveUseCase } from '../usecase/task.move.usecase';

@Injectable()
export class TasksCoreService {
  constructor(
    private readonly taskCreateUseCase: TaskCreateUseCase,
    private readonly taskGetAllUseCase: TaskGetAllUseCase,
    private readonly taskGetOneUseCase: TaskGetOneUseCase,
    private readonly taskUpdateUseCase: TaskUpdateUseCase,
    private readonly taskDeleteUseCase: TaskDeleteUseCase,
    private readonly taskMoveUseCase: TaskMoveUseCase,
  ) {}

  async createTask(columnId: string, data: TaskCreateData) {
    return this.taskCreateUseCase.execute(columnId, data);
  }

  async getTasks(columnId: string) {
    return this.taskGetAllUseCase.execute(columnId);
  }

  async getTask(taskId: string) {
    return this.taskGetOneUseCase.execute(taskId);
  }

  async updateTask(taskId: string, data: TaskUpdateData) {
    return this.taskUpdateUseCase.execute(taskId, data);
  }

  async deleteTask(taskId: string) {
    return this.taskDeleteUseCase.execute(taskId);
  }

  async moveTask(taskId: string, targetColumnId: string) {
    return this.taskMoveUseCase.execute(taskId, targetColumnId);
  }
}
