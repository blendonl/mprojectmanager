import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TaskCreateRequest } from '../dto/task.create.request';
import { TaskResponse } from '../dto/task.response';
import { TaskUpdateRequest } from '../dto/task.update.request';
import { TasksCoreService } from 'src/core/tasks/service/tasks.core.service';

@Controller('boards/:boardId/columns/:columnId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksCoreService) {}

  @Post()
  async create(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() body: TaskCreateRequest,
  ): Promise<TaskResponse> {
    const task = await this.tasksService.createTask(columnId, {
      title: body.title,
      columnId: body.column_id,
      description: body.description,
      parentId: body.parent_id ?? null,
      type: body.task_type,
      priority: body.priority as any,
      position: body.position,
    });

    if (!task) {
      throw new NotFoundException('Column not found');
    }

    return task;
  }

  @Get()
  async list(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ): Promise<TaskResponse[]> {
    const tasks = await this.tasksService.getTasks(columnId);
    if (!tasks) {
      throw new NotFoundException('Column not found');
    }

    return tasks;
  }

  @Get(':taskId')
  async getOne(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
  ): Promise<TaskResponse> {
    const task = await this.tasksService.getTask(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  @Put(':taskId')
  async update(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Body() body: TaskUpdateRequest,
  ): Promise<TaskResponse> {
    const task = await this.tasksService.updateTask(taskId, {
      title: body.title,
      columnId: body.column_id,
      parentId: body.parent_id ?? null,
      description: body.description,
      type: body.task_type as any,
      priority: body.priority as any,
      position: body.position,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  @Delete(':taskId')
  async delete(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
  ): Promise<{ deleted: boolean }> {
    const deleted = await this.tasksService.deleteTask(taskId);
    if (!deleted) {
      throw new NotFoundException('Task not found');
    }

    return { deleted };
  }
}
