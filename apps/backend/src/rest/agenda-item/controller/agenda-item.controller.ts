import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgendaItemDto, AgendaItemEnrichedDto } from 'shared-types';
import { AgendaItemCoreService } from 'src/core/agenda-item/service/agenda-item.core.service';
import { AgendaItemCreateRequest } from '../dto/agenda-item.create.request';
import { AgendaItemUpdateRequest } from '../dto/agenda-item.update.request';
import { AgendaItemMapper } from '../agenda-item.mapper';
import { AgendaMapper } from '../../agenda/agenda.mapper';
import { AgendaItemCompleteRequest } from '../dto/agenda-item-complete.request';
import { AgendaItemRescheduleRequest } from '../dto/agenda-item-reschedule.request';

@ApiTags('agenda-items')
@Controller('agendas/:agendaId/items')
export class AgendaItemController {
  constructor(private readonly agendaItemService: AgendaItemCoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create agenda item' })
  @ApiResponse({ status: 201, type: 'AgendaItemDto' })
  async create(
    @Param('agendaId') agendaId: string,
    @Body() body: AgendaItemCreateRequest,
  ): Promise<AgendaItemDto> {
    this.ensureRoutineOrTask(body.taskId, body.routineTaskId);
    const item = await this.agendaItemService.createAgendaItem(agendaId, {
      taskId: body.taskId,
      routineTaskId: body.routineTaskId ?? null,
      type: body.type,
      status: body.status,
      startAt: body.startAt ? new Date(body.startAt) : null,
      duration: body.duration,
      position: body.position,
      notes: body.notes,
      notificationId: body.notificationId,
    });
    return AgendaItemMapper.toResponse(item);
  }

  @Get()
  @ApiOperation({ summary: 'List agenda items' })
  async list(@Param('agendaId') agendaId: string): Promise<AgendaItemDto[]> {
    const items = await this.agendaItemService.getAgendaItems(agendaId);
    return items.map(AgendaItemMapper.toResponse);
  }

  @Get(':itemId')
  @ApiOperation({ summary: 'Get agenda item by ID' })
  async getOne(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
  ): Promise<AgendaItemDto> {
    const item = await this.agendaItemService.getAgendaItem(itemId);
    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }
    return AgendaItemMapper.toResponse(item);
  }

  @Put(':itemId')
  @ApiOperation({ summary: 'Update agenda item' })
  async update(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
    @Body() body: AgendaItemUpdateRequest,
  ): Promise<AgendaItemDto> {
    if (body.taskId !== undefined || body.routineTaskId !== undefined) {
      this.ensureRoutineOrTask(body.taskId, body.routineTaskId);
    }
    const item = await this.agendaItemService.updateAgendaItem(itemId, {
      taskId: body.taskId,
      routineTaskId: body.routineTaskId ?? undefined,
      type: body.type,
      status: body.status,
      startAt: body.startAt ? new Date(body.startAt) : body.startAt === null ? null : undefined,
      duration: body.duration,
      position: body.position,
      notes: body.notes,
      notificationId: body.notificationId,
    });
    return AgendaItemMapper.toResponse(item);
  }

  @Delete(':itemId')
  async delete(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
  ): Promise<{ deleted: boolean }> {
    await this.agendaItemService.deleteAgendaItem(itemId);
    return { deleted: true };
  }

  @Put(':itemId/complete')
  @ApiOperation({ summary: 'Mark agenda item as complete' })
  async complete(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
    @Body() body: AgendaItemCompleteRequest,
  ): Promise<AgendaItemDto> {
    const item = await this.agendaItemService.completeAgendaItem(
      itemId,
      body.completedAt ? new Date(body.completedAt) : undefined,
      body.notes,
    );
    return AgendaItemMapper.toResponse(item);
  }

  @Put(':itemId/reschedule')
  @ApiOperation({ summary: 'Reschedule agenda item' })
  async reschedule(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
    @Body() body: AgendaItemRescheduleRequest,
  ): Promise<AgendaItemDto> {
    const item = await this.agendaItemService.rescheduleAgendaItem(
      itemId,
      new Date(body.newDate),
      body.startAt ? new Date(body.startAt) : body.startAt === null ? null : undefined,
      body.duration,
    );
    return AgendaItemMapper.toResponse(item);
  }

  @Post(':itemId/unfinished')
  @ApiOperation({ summary: 'Mark agenda item as unfinished' })
  async markUnfinished(
    @Param('agendaId') agendaId: string,
    @Param('itemId') itemId: string,
  ): Promise<AgendaItemDto> {
    const item = await this.agendaItemService.markAsUnfinished(itemId);
    return AgendaItemMapper.toResponse(item);
  }

  private ensureRoutineOrTask(
    taskId?: string,
    routineTaskId?: string | null,
  ): void {
    if (taskId && routineTaskId) {
      throw new BadRequestException(
        'Provide either taskId or routineTaskId, not both',
      );
    }

    if (!taskId && !routineTaskId) {
      throw new BadRequestException('Either taskId or routineTaskId is required');
    }
  }
}

@ApiTags('agenda-items')
@Controller('agenda-items')
export class AgendaItemGlobalController {
  constructor(private readonly agendaItemService: AgendaItemCoreService) {}

  @Get()
  @ApiOperation({ summary: 'Get all unfinished agenda items' })
  async getAll(): Promise<AgendaItemEnrichedDto[]> {
    const items = await this.agendaItemService.getUnfinishedAgendaItems();
    return items.map(AgendaMapper.toAgendaItemEnrichedResponse);
  }

  @Get('orphaned')
  @ApiOperation({ summary: 'Get orphaned agenda items' })
  async getOrphaned(): Promise<AgendaItemEnrichedDto[]> {
    const items = await this.agendaItemService.getOrphanedAgendaItems();
    return items.map(AgendaMapper.toAgendaItemEnrichedResponse);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue agenda items' })
  async getOverdue(): Promise<AgendaItemEnrichedDto[]> {
    const items = await this.agendaItemService.getOverdueAgendaItems();
    return items.map(AgendaMapper.toAgendaItemEnrichedResponse);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming agenda items' })
  async getUpcoming(@Query('days') days?: string): Promise<AgendaItemEnrichedDto[]> {
    const numDays = days ? parseInt(days, 10) : 7;
    const items = await this.agendaItemService.getUpcomingAgendaItems(numDays);
    return items.map(AgendaMapper.toAgendaItemEnrichedResponse);
  }

  @Get('unfinished')
  @ApiOperation({ summary: 'Get unfinished agenda items' })
  async getUnfinished(
    @Query('beforeDate') beforeDate?: string,
  ): Promise<AgendaItemEnrichedDto[]> {
    const items = await this.agendaItemService.getUnfinishedAgendaItems(
      beforeDate ? new Date(beforeDate) : undefined,
    );
    return items.map(AgendaMapper.toAgendaItemEnrichedResponse);
  }
}
