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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaskDto, TaskLogDto, WorkDurationDto } from 'shared-types';
import { TaskCreateRequest } from '../dto/task.create.request';
import { TaskUpdateRequest } from '../dto/task.update.request';
import { TasksCoreService } from 'src/core/tasks/service/tasks.core.service';
import { TaskLogsCoreService } from 'src/core/task-logs/service/task-logs.core.service';
import { TaskMapper } from '../task.mapper';
import { TaskLogMapper } from '../task-log.mapper';

@ApiTags('tasks')
@Controller('boards/:boardId/columns/:columnId/tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksCoreService,
    private readonly taskLogsService: TaskLogsCoreService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() body: TaskCreateRequest,
  ): Promise<TaskDto> {
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

    return TaskMapper.toResponse(task);
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks in a column' })
  async list(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ): Promise<TaskDto[]> {
    const tasks = await this.tasksService.getTasks(columnId);
    if (!tasks) {
      throw new NotFoundException('Column not found');
    }

    return tasks.map(TaskMapper.toResponse);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get task by ID' })
  async getOne(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
  ): Promise<TaskDto> {
    const task = await this.tasksService.getTask(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return TaskMapper.toResponse(task);
  }

  @Put(':taskId')
  @ApiOperation({ summary: 'Update task' })
  async update(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Body() body: TaskUpdateRequest,
  ): Promise<TaskDto> {
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

    return TaskMapper.toResponse(task);
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete task' })
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

  @Post(':taskId/move')
  @ApiOperation({ summary: 'Move task to another column' })
  async moveTask(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Body() body: { targetColumnId: string },
  ): Promise<TaskDto> {
    const task = await this.tasksService.moveTask(taskId, body.targetColumnId);
    return TaskMapper.toResponse(task);
  }

  @Get(':taskId/work-duration')
  @ApiOperation({ summary: 'Get task work duration' })
  async getWorkDuration(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
  ): Promise<WorkDurationDto | null> {
    const duration = await this.taskLogsService.getWorkDuration(taskId);
    if (!duration) {
      return null;
    }
    return TaskLogMapper.toWorkDurationResponse(duration);
  }

  @Get(':taskId/logs')
  @ApiOperation({ summary: 'Get task logs' })
  async getTaskLogs(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
  ): Promise<TaskLogDto[]> {
    const logs = await this.taskLogsService.getTaskHistory(taskId);
    return logs.map(TaskLogMapper.toResponse);
  }
}
